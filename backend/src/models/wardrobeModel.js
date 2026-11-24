const { supabase, isConfigured } = require('../config/supabaseClient');
const db = require('../config/db');

const WardrobeModel = {
  /**
   * Get all wardrobe items for a user
   */
  async getAll(userId, { category, search } = {}) {
    if (isConfigured()) {
      try {
        let q = supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', parseInt(userId, 10))
          .order('created_at', { ascending: false });

        if (category && category !== 'All') {
          q = q.eq('category', category);
        }
        if (search && search.trim() !== '') {
          q = q.ilike('name', `%${search.trim()}%`);
        }

        const { data, error } = await q;
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[WardrobeModel.getAll Supabase Fallback]:', err.message);
      }
    }

    const cleanUserId = parseInt(userId, 10);
    let queryText = 'SELECT * FROM wardrobe_items WHERE user_id = $1';
    const params = [cleanUserId];

    if (category && category !== 'All') {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      queryText += ` AND name ILIKE $${params.length}`;
    }

    queryText += ' ORDER BY created_at DESC';
    const res = await db.query(queryText, params);
    let items = res.rows || [];
    if (category && category !== 'All' && !db.isPostgres()) {
      items = items.filter(item => item.category && item.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== '' && !db.isPostgres()) {
      const s = search.toLowerCase();
      items = items.filter(item => item.name && (item.name.toLowerCase().includes(s) || (item.color && item.color.toLowerCase().includes(s))));
    }
    return items;
  },

  /**
   * Get single wardrobe item by ID
   */
  async getById(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[WardrobeModel.getById Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'SELECT * FROM wardrobe_items WHERE id = $1 AND user_id = $2',
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Create a new wardrobe item
   */
  async create({ user_id, name, category, color, image_url, cloudinary_public_id = null, description = null }) {
    const payload = {
      user_id: parseInt(user_id, 10),
      name: (name || '').trim(),
      category: (category || '').trim(),
      color: (color || '').trim(),
      image_url,
      cloudinary_public_id: cloudinary_public_id || null,
      description: description ? description.trim() : null
    };

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[WardrobeModel.create Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `INSERT INTO wardrobe_items (user_id, name, category, color, image_url, cloudinary_public_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        payload.user_id,
        payload.name,
        payload.category,
        payload.color,
        payload.image_url,
        payload.cloudinary_public_id,
        payload.description
      ]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Update an existing wardrobe item
   */
  async update(id, userId, fields) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);
    const cleanFields = {
      name: (fields.name || '').trim(),
      category: (fields.category || '').trim(),
      color: (fields.color || '').trim(),
      image_url: fields.image_url,
      cloudinary_public_id: fields.cloudinary_public_id || null,
      description: fields.description ? fields.description.trim() : null
    };

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .update(cleanFields)
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .select()
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[WardrobeModel.update Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `UPDATE wardrobe_items 
       SET name = $1, category = $2, color = $3, image_url = $4, cloudinary_public_id = $5, description = $6
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [
        cleanFields.name,
        cleanFields.category,
        cleanFields.color,
        cleanFields.image_url,
        cleanFields.cloudinary_public_id,
        cleanFields.description,
        cleanId,
        cleanUserId
      ]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Remove wardrobe item
   */
  async remove(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    let supabaseDeleted = null;
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .delete()
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .select()
          .maybeSingle();
        if (error) throw error;
        supabaseDeleted = data;
      } catch (err) {
        console.warn('[WardrobeModel.remove Supabase Fallback]:', err.message);
      }
    }

    // ALWAYS execute delete on local storage as well to prevent desynchronization
    const res = await db.query(
      'DELETE FROM wardrobe_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : (supabaseDeleted || { id: cleanId });
  },

  /**
   * Count total items for user
   */
  async count(userId) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { count, error } = await supabase
          .from('wardrobe_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', cleanUserId);
        if (error) throw error;
        if (typeof count === 'number' && count > 0) return count;
      } catch (err) {
        console.warn('[WardrobeModel.count Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'SELECT COUNT(*)::int as count FROM wardrobe_items WHERE user_id = $1',
      [cleanUserId]
    );
    return res.rows[0]?.count ? parseInt(res.rows[0].count, 10) : (res.rows ? res.rows.length : 0);
  },

  /**
   * Get recent wardrobe items
   */
  async getRecent(userId, limit = 5) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .select('*')
          .eq('user_id', cleanUserId)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data;
      } catch (err) {
        console.warn('[WardrobeModel.getRecent Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'SELECT * FROM wardrobe_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [cleanUserId, limit]
    );
    return res.rows || [];
  }
};

module.exports = { WardrobeModel };
