const { supabase, isConfigured } = require('../config/supabaseClient');
const db = require('../config/db');

function formatOutfit(o) {
  if (!o) return null;
  const items = (o.outfit_items || [])
    .map(oi => oi.wardrobe_items)
    .filter(Boolean);
  const { outfit_items, ...rest } = o;
  return { ...rest, items: items.length > 0 ? items : (o.items || []) };
}

const OutfitModel = {
  /**
   * Get all outfits for user with associated wardrobe items
   */
  async getAll(userId, { occasion, search } = {}) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        let q = supabase
          .from('outfits')
          .select(`
            *,
            outfit_items (
              wardrobe_item_id,
              wardrobe_items (*)
            )
          `)
          .eq('user_id', cleanUserId)
          .order('created_at', { ascending: false });

        if (occasion && occasion !== 'All') {
          q = q.eq('occasion', occasion);
        }
        if (search && search.trim() !== '') {
          q = q.ilike('name', `%${search.trim()}%`);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (data && data.length > 0) return data.map(formatOutfit);
      } catch (err) {
        console.warn('[OutfitModel.getAll Supabase Fallback]:', err.message);
      }
    }

    if (db.isPostgres()) {
      let queryText = `
        SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', w.id,
                'name', w.name,
                'category', w.category,
                'color', w.color,
                'image_url', w.image_url,
                'description', w.description
              )
            ) FILTER (WHERE w.id IS NOT NULL), '[]'
          ) AS items
        FROM outfits o
        LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
        LEFT JOIN wardrobe_items w ON oi.wardrobe_item_id = w.id
        WHERE o.user_id = $1
      `;
      const params = [cleanUserId];

      if (occasion && occasion !== 'All') {
        params.push(occasion);
        queryText += ` AND o.occasion = $${params.length}`;
      }
      if (search && search.trim() !== '') {
        params.push(`%${search.trim()}%`);
        queryText += ` AND o.name ILIKE $${params.length}`;
      }

      queryText += ' GROUP BY o.id ORDER BY o.created_at DESC';
      const res = await db.query(queryText, params);
      return res.rows || [];
    }

    const res = await db.query('SELECT * FROM outfits WHERE user_id = $1', [cleanUserId]);
    let outfits = res.rows || [];
    if (occasion && occasion !== 'All') {
      outfits = outfits.filter(o => o.occasion && o.occasion.toLowerCase() === occasion.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const s = search.toLowerCase();
      outfits = outfits.filter(o => o.name && o.name.toLowerCase().includes(s));
    }
    return outfits;
  },

  /**
   * Get single outfit by ID
   */
  async getById(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            outfit_items (
              wardrobe_item_id,
              wardrobe_items (*)
            )
          `)
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .maybeSingle();
        if (error) throw error;
        if (data) return formatOutfit(data);
      } catch (err) {
        console.warn('[OutfitModel.getById Supabase Fallback]:', err.message);
      }
    }

    if (db.isPostgres()) {
      const res = await db.query(
        `SELECT o.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', w.id,
                'name', w.name,
                'category', w.category,
                'color', w.color,
                'image_url', w.image_url,
                'description', w.description
              )
            ) FILTER (WHERE w.id IS NOT NULL), '[]'
          ) AS items
        FROM outfits o
        LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
        LEFT JOIN wardrobe_items w ON oi.wardrobe_item_id = w.id
        WHERE o.id = $1 AND o.user_id = $2
        GROUP BY o.id`,
        [cleanId, cleanUserId]
      );
      return (res.rows && res.rows[0]) ? res.rows[0] : null;
    }

    const res = await db.query(
      'SELECT * FROM outfits WHERE id = $1 AND user_id = $2',
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Create outfit with linked wardrobe items
   */
  async create({ user_id, name, occasion, description = null }, itemIds = []) {
    const payload = {
      user_id: parseInt(user_id, 10),
      name: (name || '').trim(),
      occasion: (occasion || '').trim(),
      description: description ? description.trim() : null
    };

    if (isConfigured()) {
      try {
        const { data: outfit, error } = await supabase
          .from('outfits')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;

        if (Array.isArray(itemIds) && itemIds.length > 0) {
          const records = itemIds.map(wId => ({
            outfit_id: outfit.id,
            wardrobe_item_id: parseInt(wId, 10)
          }));
          const { error: linkErr } = await supabase.from('outfit_items').insert(records);
          if (linkErr) console.warn('[OutfitModel] Link error:', linkErr.message);
        }

        const enriched = await this.getById(outfit.id, payload.user_id);
        if (enriched) return enriched;
      } catch (err) {
        console.warn('[OutfitModel.create Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `INSERT INTO outfits (user_id, name, occasion, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [payload.user_id, payload.name, payload.occasion, payload.description]
    );
    const newOutfit = res.rows ? res.rows[0] : { id: Date.now(), ...payload };

    const items = [];
    if (Array.isArray(itemIds)) {
      for (const itemId of itemIds) {
        const checkItem = await db.query(
          'SELECT id, name, category, color, image_url, description FROM wardrobe_items WHERE id = $1 AND user_id = $2',
          [parseInt(itemId, 10), payload.user_id]
        );
        if (checkItem.rows && checkItem.rows.length > 0) {
          await db.query(
            'INSERT INTO outfit_items (outfit_id, wardrobe_item_id) VALUES ($1, $2)',
            [newOutfit.id, parseInt(itemId, 10)]
          );
          items.push(checkItem.rows[0]);
        }
      }
    }
    newOutfit.items = items;
    return newOutfit;
  },

  /**
   * Update outfit and its linked items
   */
  async update(id, userId, fields, itemIds) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);
    const cleanFields = {
      name: (fields.name || '').trim(),
      occasion: (fields.occasion || '').trim(),
      description: fields.description ? fields.description.trim() : null
    };

    if (isConfigured()) {
      try {
        const { error } = await supabase
          .from('outfits')
          .update(cleanFields)
          .eq('id', cleanId)
          .eq('user_id', cleanUserId);
        if (error) throw error;

        if (Array.isArray(itemIds)) {
          await supabase.from('outfit_items').delete().eq('outfit_id', cleanId);
          if (itemIds.length > 0) {
            const records = itemIds.map(wId => ({
              outfit_id: cleanId,
              wardrobe_item_id: parseInt(wId, 10)
            }));
            await supabase.from('outfit_items').insert(records);
          }
        }
        const updated = await this.getById(cleanId, cleanUserId);
        if (updated) return updated;
      } catch (err) {
        console.warn('[OutfitModel.update Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `UPDATE outfits SET name = $1, occasion = $2, description = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [cleanFields.name, cleanFields.occasion, cleanFields.description, cleanId, cleanUserId]
    );
    if (!res.rows || res.rows.length === 0) return null;

    if (Array.isArray(itemIds)) {
      await db.query('DELETE FROM outfit_items WHERE outfit_id = $1', [cleanId]);
      for (const itemId of itemIds) {
        await db.query(
          'INSERT INTO outfit_items (outfit_id, wardrobe_item_id) VALUES ($1, $2)',
          [cleanId, parseInt(itemId, 10)]
        );
      }
    }
    return await this.getById(cleanId, cleanUserId);
  },

  /**
   * Remove outfit
   */
  async remove(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    let supabaseDeleted = null;
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfits')
          .delete()
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .select()
          .maybeSingle();
        if (error) throw error;
        supabaseDeleted = data;
      } catch (err) {
        console.warn('[OutfitModel.remove Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'DELETE FROM outfits WHERE id = $1 AND user_id = $2 RETURNING *',
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : (supabaseDeleted || { id: cleanId });
  },

  /**
   * Count outfits for user
   */
  async count(userId) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { count, error } = await supabase
          .from('outfits')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', cleanUserId);
        if (error) throw error;
        if (typeof count === 'number' && count > 0) return count;
      } catch (err) {
        console.warn('[OutfitModel.count Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'SELECT COUNT(*)::int as count FROM outfits WHERE user_id = $1',
      [cleanUserId]
    );
    return res.rows[0]?.count ? parseInt(res.rows[0].count, 10) : (res.rows ? res.rows.length : 0);
  },

  /**
   * Get recent outfits
   */
  async getRecent(userId, limit = 5) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfits')
          .select(`
            *,
            outfit_items (
              wardrobe_item_id,
              wardrobe_items (*)
            )
          `)
          .eq('user_id', cleanUserId)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data.map(formatOutfit);
      } catch (err) {
        console.warn('[OutfitModel.getRecent Supabase Fallback]:', err.message);
      }
    }

    return await this.getAll(cleanUserId);
  },

  /**
   * Add a single item to an outfit
   */
  async addItem(outfitId, wardrobeItemId) {
    const cleanOutfitId = parseInt(outfitId, 10);
    const cleanItemId = parseInt(wardrobeItemId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_items')
          .insert([{ outfit_id: cleanOutfitId, wardrobe_item_id: cleanItemId }])
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[OutfitModel.addItem Supabase Fallback]:', err.message);
      }
    }
    const res = await db.query(
      'INSERT INTO outfit_items (outfit_id, wardrobe_item_id) VALUES ($1, $2) RETURNING *',
      [cleanOutfitId, cleanItemId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Remove a single item from an outfit
   */
  async removeItem(outfitId, wardrobeItemId) {
    const cleanOutfitId = parseInt(outfitId, 10);
    const cleanItemId = parseInt(wardrobeItemId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_items')
          .delete()
          .eq('outfit_id', cleanOutfitId)
          .eq('wardrobe_item_id', cleanItemId)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[OutfitModel.removeItem Supabase Fallback]:', err.message);
      }
    }
    const res = await db.query(
      'DELETE FROM outfit_items WHERE outfit_id = $1 AND wardrobe_item_id = $2 RETURNING *',
      [cleanOutfitId, cleanItemId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  }
};

module.exports = { OutfitModel };
