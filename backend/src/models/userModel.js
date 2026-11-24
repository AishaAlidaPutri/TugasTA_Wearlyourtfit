const { supabase, isConfigured } = require('../config/supabaseClient');
const db = require('../config/db');

const UserModel = {
  /**
   * Find a user by email
   */
  async findByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[UserModel.findByEmail Supabase Fallback]:', err.message);
      }
    }
    const res = await db.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    const cleanId = parseInt(id, 10);
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, profile_image, created_at')
          .eq('id', cleanId)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[UserModel.findById Supabase Fallback]:', err.message);
      }
    }
    const res = await db.query(
      'SELECT id, name, email, profile_image, created_at FROM users WHERE id = $1',
      [cleanId]
    );
    if (res.rows && res.rows[0]) return res.rows[0];

    // Default guest user fallback
    if (cleanId === 1) {
      return {
        id: 1,
        name: 'Wealy User',
        email: 'user@wealy.app',
        profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString()
      };
    }
    return null;
  },

  /**
   * Find a user with password by ID (for auth checks)
   */
  async findByIdWithPassword(id) {
    const cleanId = parseInt(id, 10);
    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', cleanId)
          .maybeSingle();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[UserModel.findByIdWithPassword Supabase Fallback]:', err.message);
      }
    }
    const res = await db.query('SELECT * FROM users WHERE id = $1', [cleanId]);
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Create a new user
   */
  async create({ name, email, password, profile_image = null }) {
    const payload = {
      name: (name || '').trim(),
      email: (email || '').toLowerCase().trim(),
      password,
      profile_image: profile_image || null
    };

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[UserModel.create Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'INSERT INTO users (name, email, password, profile_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [payload.name, payload.email, payload.password, payload.profile_image]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  },

  /**
   * Update user profile
   */
  async update(id, fields) {
    const cleanId = parseInt(id, 10);
    const cleanFields = {
      name: (fields.name || '').trim(),
      profile_image: fields.profile_image
    };

    if (isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(cleanFields)
          .eq('id', cleanId)
          .select('id, name, email, profile_image, created_at')
          .single();
        if (error) throw error;
        if (data) return data;
      } catch (err) {
        console.warn('[UserModel.update Supabase Fallback]:', err.message);
      }
    }

    const res = await db.query(
      'UPDATE users SET name = $1, profile_image = $2 WHERE id = $3 RETURNING id, name, email, profile_image, created_at',
      [cleanFields.name, cleanFields.profile_image, cleanId]
    );
    return (res.rows && res.rows[0]) ? res.rows[0] : null;
  }
};

module.exports = { UserModel };
