const { supabase, isConfigured } = require('../config/supabaseClient');
const db = require('../config/db');

function formatSchedule(s) {
  if (!s) return null;
  const outfit = s.outfits;
  const items = outfit && outfit.outfit_items
    ? outfit.outfit_items.map(oi => oi.wardrobe_items).filter(Boolean)
    : [];

  return {
    id: s.id,
    user_id: s.user_id,
    outfit_id: s.outfit_id,
    event_name: s.event_name,
    schedule_date: typeof s.schedule_date === 'string' 
      ? s.schedule_date.slice(0, 10) 
      : new Date(s.schedule_date).toISOString().slice(0, 10),
    notes: s.notes,
    created_at: s.created_at,
    outfit_name: outfit ? outfit.name : (s.outfit_name || 'Unknown Outfit'),
    outfit_occasion: outfit ? outfit.occasion : (s.outfit_occasion || 'Casual'),
    items: s.items || items,
    outfit: outfit ? { ...outfit, items } : s.outfit || null
  };
}

const ScheduleModel = {
  /**
   * Get schedules for user
   */
  async getAll(userId, { date, month } = {}) {
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        let q = supabase
          .from('outfit_schedules')
          .select(`
            *,
            outfits (
              id,
              name,
              occasion,
              outfit_items (
                wardrobe_items (*)
              )
            )
          `)
          .eq('user_id', cleanUserId)
          .order('schedule_date', { ascending: true });

        if (date) {
          q = q.eq('schedule_date', date);
        }

        const { data, error } = await q;
        if (error) throw error;

        let list = (data || []).map(formatSchedule);
        if (month) {
          list = list.filter(item => item.schedule_date && item.schedule_date.startsWith(month));
        }
        if (list && list.length > 0) return list;
      } catch (err) {
        console.warn('[ScheduleModel.getAll Supabase Fallback]:', err.message);
      }
    }

    if (db.isPostgres()) {
      let queryText = `
        SELECT s.*, 
          o.name AS outfit_name, 
          o.occasion AS outfit_occasion,
          COALESCE(
            json_agg(
              json_build_object(
                'id', w.id,
                'name', w.name,
                'category', w.category,
                'color', w.color,
                'image_url', w.image_url
              )
            ) FILTER (WHERE w.id IS NOT NULL), '[]'
          ) AS items
        FROM outfit_schedules s
        JOIN outfits o ON s.outfit_id = o.id
        LEFT JOIN outfit_items oi ON o.id = oi.outfit_id
        LEFT JOIN wardrobe_items w ON oi.wardrobe_item_id = w.id
        WHERE s.user_id = $1
      `;
      const params = [cleanUserId];

      if (date) {
        params.push(date);
        queryText += ` AND s.schedule_date = $${params.length}`;
      } else if (month) {
        params.push(`${month}%`);
        queryText += ` AND TO_CHAR(s.schedule_date, 'YYYY-MM') LIKE $${params.length}`;
      }

      queryText += ' GROUP BY s.id, o.id ORDER BY s.schedule_date ASC';
      const res = await db.query(queryText, params);
      return (res.rows || []).map(formatSchedule);
    }

    const res = await db.query('SELECT * FROM outfit_schedules WHERE user_id = $1', [cleanUserId]);
    let list = (res.rows || []).map(formatSchedule);
    if (date) list = list.filter(item => item.schedule_date === date);
    if (month) list = list.filter(item => item.schedule_date && item.schedule_date.startsWith(month));
    return list;
  },

  /**
   * Get single schedule by ID
   */
  async getById(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_schedules')
          .select(`
            *,
            outfits (
              id,
              name,
              occasion,
              outfit_items (
                wardrobe_items (*)
              )
            )
          `)
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .maybeSingle();
        if (error) throw error;
        if (data) return formatSchedule(data);
      } catch (err) {
        console.warn('[ScheduleModel.getById Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `SELECT s.*, o.name AS outfit_name, o.occasion AS outfit_occasion
       FROM outfit_schedules s
       JOIN outfits o ON s.outfit_id = o.id
       WHERE s.id = $1 AND s.user_id = $2`,
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? formatSchedule(res.rows[0]) : null;
  },

  /**
   * Create outfit schedule
   */
  async create({ user_id, outfit_id, event_name, schedule_date, notes = null }) {
    const payload = {
      user_id: parseInt(user_id, 10),
      outfit_id: parseInt(outfit_id, 10),
      event_name: (event_name || '').trim(),
      schedule_date,
      notes: notes ? notes.trim() : null
    };

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_schedules')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        const enriched = await this.getById(data.id, payload.user_id);
        if (enriched) return enriched;
      } catch (err) {
        console.warn('[ScheduleModel.create Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `INSERT INTO outfit_schedules (user_id, outfit_id, event_name, schedule_date, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [payload.user_id, payload.outfit_id, payload.event_name, payload.schedule_date, payload.notes]
    );
    const newId = res.rows ? res.rows[0].id : Date.now();
    return await this.getById(newId, payload.user_id);
  },

  /**
   * Update schedule
   */
  async update(id, userId, fields) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);
    const cleanFields = {
      outfit_id: parseInt(fields.outfit_id, 10),
      event_name: (fields.event_name || '').trim(),
      schedule_date: fields.schedule_date,
      notes: fields.notes ? fields.notes.trim() : null
    };

    if (isConfigured()) {
      try {
        const { error } = await supabase
          .from('outfit_schedules')
          .update(cleanFields)
          .eq('id', cleanId)
          .eq('user_id', cleanUserId);
        if (error) throw error;
        const updated = await this.getById(cleanId, cleanUserId);
        if (updated) return updated;
      } catch (err) {
        console.warn('[ScheduleModel.update Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `UPDATE outfit_schedules 
       SET outfit_id = $1, event_name = $2, schedule_date = $3, notes = $4
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [cleanFields.outfit_id, cleanFields.event_name, cleanFields.schedule_date, cleanFields.notes, cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? await this.getById(cleanId, cleanUserId) : null;
  },

  /**
   * Remove schedule
   */
  async remove(id, userId) {
    const cleanId = parseInt(id, 10);
    const cleanUserId = parseInt(userId, 10);

    let supabaseDeleted = null;
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_schedules')
          .delete()
          .eq('id', cleanId)
          .eq('user_id', cleanUserId)
          .select()
          .maybeSingle();
        if (error) throw error;
        supabaseDeleted = data;
      } catch (err) {
        console.warn('[ScheduleModel.remove Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'DELETE FROM outfit_schedules WHERE id = $1 AND user_id = $2 RETURNING *',
      [cleanId, cleanUserId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : (supabaseDeleted || { id: cleanId });
  },

  /**
   * Get upcoming schedule
   */
  async getUpcoming(userId, limit = 3) {
    const cleanUserId = parseInt(userId, 10);
    const todayStr = new Date().toISOString().slice(0, 10);

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('outfit_schedules')
          .select(`
            *,
            outfits (
              id,
              name,
              occasion,
              outfit_items (
                wardrobe_items (*)
              )
            )
          `)
          .eq('user_id', cleanUserId)
          .gte('schedule_date', todayStr)
          .order('schedule_date', { ascending: true })
          .limit(limit);
        if (error) throw error;
        if (data && data.length > 0) return data.map(formatSchedule);
      } catch (err) {
        console.warn('[ScheduleModel.getUpcoming Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      `SELECT s.*, o.name AS outfit_name, o.occasion AS outfit_occasion
       FROM outfit_schedules s
       JOIN outfits o ON s.outfit_id = o.id
       WHERE s.user_id = $1 AND s.schedule_date >= $2
       ORDER BY s.schedule_date ASC
       LIMIT $3`,
      [cleanUserId, todayStr, limit]
    );
    return (res.rows || []).map(formatSchedule);
  }
};

module.exports = { ScheduleModel };
