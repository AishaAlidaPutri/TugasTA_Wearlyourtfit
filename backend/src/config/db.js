const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isPostgres = false;

// Fallback in-memory/file storage if DATABASE_URL is not yet provided or unreachable
let mockStorage = {
  users: [],
  wardrobe_items: [],
  outfits: [],
  outfit_items: [],
  outfit_schedules: [],
  nextId: { users: 1, wardrobe_items: 1, outfits: 1, outfit_items: 1, outfit_schedules: 1 }
};

const storageFilePath = path.join(__dirname, 'mock_db.json');
function loadMockStorage() {
  if (fs.existsSync(storageFilePath)) {
    try {
      const raw = fs.readFileSync(storageFilePath, 'utf8');
      mockStorage = JSON.parse(raw);
    } catch (err) {
      console.warn('Could not read existing mock_db.json, using current');
    }
  }
  return mockStorage;
}

loadMockStorage();

function saveMockStorage() {
  try {
    fs.writeFileSync(storageFilePath, JSON.stringify(mockStorage, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock storage:', err);
  }
}

const connectionString = process.env.DATABASE_URL;

if (connectionString && connectionString.trim() !== '') {
  try {
    const isRemote = !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');
    pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    isPostgres = true;
    console.log('[Database] Connecting to PostgreSQL (Supabase / Cloud)...');
  } catch (error) {
    console.error('[Database] Failed to initialize PostgreSQL pool:', error.message);
    isPostgres = false;
  }
} else {
  console.log('[Database] No DATABASE_URL provided. Operating in embedded storage mode until database credentials are configured in .env.');
}

/**
 * Execute SQL query against PostgreSQL or fallback mock engine
 */
async function query(text, params = []) {
  if (isPostgres && pool) {
    try {
      return await pool.query(text, params);
    } catch (pgErr) {
      console.error('[Database PG Error]:', pgErr.message);
      throw pgErr;
    }
  }

  // Graceful query simulator for local testing without active Neon credentials
  return simulateMockQuery(text, params);
}

// Simple query parser for mock storage to ensure 100% testability offline
function simulateMockQuery(sql, params) {
  loadMockStorage();
  const normalized = sql.trim();
  const lower = normalized.toLowerCase();

  // 1. INSERT INTO users
  if (lower.startsWith('insert into users')) {
    const id = mockStorage.nextId.users++;
    const [name, email, password, profile_image] = params;
    const user = {
      id,
      name,
      email: email.toLowerCase(),
      password,
      profile_image: profile_image || null,
      created_at: new Date().toISOString()
    };
    mockStorage.users.push(user);
    saveMockStorage();
    return { rows: [user], rowCount: 1 };
  }

  // 2. SELECT FROM users WHERE email
  if (lower.startsWith('select') && lower.includes('from users where email =')) {
    const email = (params[0] || '').toLowerCase();
    const user = mockStorage.users.find(u => u.email.toLowerCase() === email);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 3. SELECT FROM users WHERE id
  if (lower.startsWith('select') && lower.includes('from users where id =')) {
    const id = parseInt(params[0], 10);
    const user = mockStorage.users.find(u => u.id === id);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 4. UPDATE users SET
  if (lower.startsWith('update users')) {
    const id = parseInt(params[params.length - 1], 10);
    const user = mockStorage.users.find(u => u.id === id);
    if (!user) return { rows: [], rowCount: 0 };
    if (params.length === 3) {
      user.name = params[0] !== undefined ? params[0] : user.name;
      user.profile_image = params[1] !== undefined ? params[1] : user.profile_image;
    }
    saveMockStorage();
    return { rows: [user], rowCount: 1 };
  }

  // 5. INSERT INTO wardrobe_items
  if (lower.startsWith('insert into wardrobe_items')) {
    const id = mockStorage.nextId.wardrobe_items++;
    const [user_id, name, category, color, image_url, cloudinary_public_id, description] = params;
    const item = {
      id,
      user_id: parseInt(user_id, 10),
      name,
      category,
      color,
      image_url,
      cloudinary_public_id: cloudinary_public_id || null,
      description: description || null,
      created_at: new Date().toISOString()
    };
    mockStorage.wardrobe_items.push(item);
    saveMockStorage();
    return { rows: [item], rowCount: 1 };
  }

  // 6. SELECT FROM wardrobe_items WHERE id = $1 AND user_id = $2
  if (lower.startsWith('select') && lower.includes('from wardrobe_items') && (lower.includes(' where id =') || lower.includes(' and id =') || lower.includes(' w.id =')) && lower.includes('user_id =')) {
    const id = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const item = mockStorage.wardrobe_items.find(w => w.id === id && w.user_id === userId);
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  // 7. SELECT FROM wardrobe_items WHERE user_id
  if (lower.startsWith('select') && lower.includes('from wardrobe_items') && lower.includes('user_id =')) {
    const userId = parseInt(params[0], 10);
    let items = mockStorage.wardrobe_items.filter(w => w.user_id === userId);
    return { rows: items, rowCount: items.length };
  }

  // 8. UPDATE wardrobe_items
  if (lower.startsWith('update wardrobe_items')) {
    const id = parseInt(params[params.length - 2], 10);
    const userId = parseInt(params[params.length - 1], 10);
    const item = mockStorage.wardrobe_items.find(w => w.id === id && w.user_id === userId);
    if (!item) return { rows: [], rowCount: 0 };
    if (params.length >= 8) {
      item.name = params[0] !== undefined ? params[0] : item.name;
      item.category = params[1] !== undefined ? params[1] : item.category;
      item.color = params[2] !== undefined ? params[2] : item.color;
      item.image_url = params[3] !== undefined ? params[3] : item.image_url;
      item.cloudinary_public_id = params[4] !== undefined ? params[4] : item.cloudinary_public_id;
      item.description = params[5] !== undefined ? params[5] : item.description;
    } else {
      item.name = params[0] !== undefined ? params[0] : item.name;
      item.category = params[1] !== undefined ? params[1] : item.category;
      item.color = params[2] !== undefined ? params[2] : item.color;
      item.description = params[3] !== undefined ? params[3] : item.description;
      if (params.length > 6) {
        item.image_url = params[4] !== undefined ? params[4] : item.image_url;
        item.cloudinary_public_id = params[5] !== undefined ? params[5] : item.cloudinary_public_id;
      }
    }
    saveMockStorage();
    return { rows: [item], rowCount: 1 };
  }

  // 9. DELETE FROM wardrobe_items
  if (lower.startsWith('delete from wardrobe_items')) {
    const id = parseInt(params[0], 10);
    const userId = params[1] ? parseInt(params[1], 10) : null;
    let idx = mockStorage.wardrobe_items.findIndex(w => 
      parseInt(w.id, 10) === id && (!userId || parseInt(w.user_id, 10) === userId)
    );
    if (idx === -1) {
      idx = mockStorage.wardrobe_items.findIndex(w => parseInt(w.id, 10) === id);
    }
    if (idx !== -1) {
      const removed = mockStorage.wardrobe_items.splice(idx, 1)[0];
      // cascade delete in outfit_items
      mockStorage.outfit_items = (mockStorage.outfit_items || []).filter(oi => parseInt(oi.wardrobe_item_id, 10) !== id);
      // cascade delete from embedded outfit items
      (mockStorage.outfits || []).forEach(o => {
        if (Array.isArray(o.items)) {
          o.items = o.items.filter(item => parseInt(item.id, 10) !== id);
        }
      });
      saveMockStorage();
      return { rows: [removed], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 10. INSERT INTO outfits
  if (lower.startsWith('insert into outfits')) {
    const id = mockStorage.nextId.outfits++;
    const [user_id, name, occasion, description] = params;
    const outfit = {
      id,
      user_id: parseInt(user_id, 10),
      name,
      occasion,
      description: description || null,
      created_at: new Date().toISOString()
    };
    mockStorage.outfits.push(outfit);
    saveMockStorage();
    return { rows: [outfit], rowCount: 1 };
  }

  // 11. INSERT INTO outfit_items
  if (lower.startsWith('insert into outfit_items')) {
    const id = mockStorage.nextId.outfit_items++;
    const [outfit_id, wardrobe_item_id] = params;
    const oi = {
      id,
      outfit_id: parseInt(outfit_id, 10),
      wardrobe_item_id: parseInt(wardrobe_item_id, 10)
    };
    // ensure unique
    const exists = mockStorage.outfit_items.some(x => x.outfit_id === oi.outfit_id && x.wardrobe_item_id === oi.wardrobe_item_id);
    if (!exists) {
      mockStorage.outfit_items.push(oi);
      saveMockStorage();
    }
    return { rows: [oi], rowCount: 1 };
  }

  // 12. SELECT outfits
  if (lower.startsWith('select') && lower.includes('from outfits') && lower.includes('user_id =') && !lower.includes(' where id =') && !lower.includes(' and id =') && !lower.includes(' o.id =')) {
    const userId = parseInt(params[0], 10);
    const userOutfits = mockStorage.outfits.filter(o => o.user_id === userId);
    // attach items
    const enriched = userOutfits.map(o => {
      const itemRelations = mockStorage.outfit_items.filter(oi => oi.outfit_id === o.id);
      const items = itemRelations.map(rel => mockStorage.wardrobe_items.find(w => w.id === rel.wardrobe_item_id)).filter(Boolean);
      return { ...o, items };
    });
    return { rows: enriched, rowCount: enriched.length };
  }

  // 13. SELECT outfit by id
  if (lower.startsWith('select') && lower.includes('from outfits') && (lower.includes(' where id =') || lower.includes(' and id =') || lower.includes(' o.id =')) && lower.includes('user_id =')) {
    const id = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const outfit = mockStorage.outfits.find(o => o.id === id && o.user_id === userId);
    if (!outfit) return { rows: [], rowCount: 0 };
    const itemRelations = mockStorage.outfit_items.filter(oi => oi.outfit_id === outfit.id);
    const items = itemRelations.map(rel => mockStorage.wardrobe_items.find(w => w.id === rel.wardrobe_item_id)).filter(Boolean);
    return { rows: [{ ...outfit, items }], rowCount: 1 };
  }

  // 14. UPDATE outfits
  if (lower.startsWith('update outfits')) {
    const id = parseInt(params[params.length - 2], 10);
    const userId = parseInt(params[params.length - 1], 10);
    const outfit = mockStorage.outfits.find(o => o.id === id && o.user_id === userId);
    if (!outfit) return { rows: [], rowCount: 0 };
    outfit.name = params[0];
    outfit.occasion = params[1];
    outfit.description = params[2];
    saveMockStorage();
    return { rows: [outfit], rowCount: 1 };
  }

  // 15. DELETE FROM outfits
  if (lower.startsWith('delete from outfits')) {
    const id = parseInt(params[0], 10);
    const userId = params[1] ? parseInt(params[1], 10) : null;
    let idx = mockStorage.outfits.findIndex(o => 
      parseInt(o.id, 10) === id && (!userId || parseInt(o.user_id, 10) === userId)
    );
    if (idx === -1) {
      idx = mockStorage.outfits.findIndex(o => parseInt(o.id, 10) === id);
    }
    if (idx !== -1) {
      const removed = mockStorage.outfits.splice(idx, 1)[0];
      mockStorage.outfit_items = (mockStorage.outfit_items || []).filter(oi => parseInt(oi.outfit_id, 10) !== id);
      mockStorage.outfit_schedules = (mockStorage.outfit_schedules || []).filter(os => parseInt(os.outfit_id, 10) !== id);
      saveMockStorage();
      return { rows: [removed], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 16. DELETE FROM outfit_items
  if (lower.startsWith('delete from outfit_items')) {
    if (lower.includes('outfit_id =') && lower.includes('wardrobe_item_id =')) {
      const outfitId = parseInt(params[0], 10);
      const itemId = parseInt(params[1], 10);
      mockStorage.outfit_items = mockStorage.outfit_items.filter(oi => !(oi.outfit_id === outfitId && oi.wardrobe_item_id === itemId));
      saveMockStorage();
      return { rows: [], rowCount: 1 };
    }
    if (lower.includes('outfit_id =')) {
      const outfitId = parseInt(params[0], 10);
      mockStorage.outfit_items = mockStorage.outfit_items.filter(oi => oi.outfit_id !== outfitId);
      saveMockStorage();
      return { rows: [], rowCount: 1 };
    }
  }

  // 17. SCHEDULES: INSERT INTO outfit_schedules
  if (lower.startsWith('insert into outfit_schedules')) {
    const id = mockStorage.nextId.outfit_schedules++;
    const [user_id, outfit_id, event_name, schedule_date, notes] = params;
    const schedule = {
      id,
      user_id: parseInt(user_id, 10),
      outfit_id: parseInt(outfit_id, 10),
      event_name,
      schedule_date: typeof schedule_date === 'string' ? schedule_date.slice(0, 10) : new Date(schedule_date).toISOString().slice(0, 10),
      notes: notes || null,
      created_at: new Date().toISOString()
    };
    mockStorage.outfit_schedules.push(schedule);
    saveMockStorage();
    return { rows: [schedule], rowCount: 1 };
  }

  // 18. SELECT outfit_schedules
  if (lower.startsWith('select') && lower.includes('from outfit_schedules') && lower.includes('user_id =') && !lower.includes('s.id =') && !lower.includes('id = $1 and user_id = $2')) {
    const userId = parseInt(params[0], 10);
    const schedules = mockStorage.outfit_schedules.filter(s => s.user_id === userId);
    const enriched = schedules.map(s => {
      const outfit = mockStorage.outfits.find(o => o.id === s.outfit_id);
      let items = [];
      if (outfit) {
        const itemRelations = mockStorage.outfit_items.filter(oi => oi.outfit_id === outfit.id);
        items = itemRelations.map(rel => mockStorage.wardrobe_items.find(w => w.id === rel.wardrobe_item_id)).filter(Boolean);
      }
      return {
        ...s,
        outfit_name: outfit ? outfit.name : 'Unknown Outfit',
        outfit_occasion: outfit ? outfit.occasion : 'Casual',
        outfit: outfit ? { ...outfit, items } : null
      };
    });
    return { rows: enriched, rowCount: enriched.length };
  }

  // 19. SELECT outfit_schedule by id
  if (lower.startsWith('select') && lower.includes('from outfit_schedules') && (lower.includes('id = $1') || lower.includes('s.id = $1'))) {
    const id = parseInt(params[0], 10);
    const userId = parseInt(params[1], 10);
    const s = mockStorage.outfit_schedules.find(item => item.id === id && item.user_id === userId);
    if (!s) return { rows: [], rowCount: 0 };
    const outfit = mockStorage.outfits.find(o => o.id === s.outfit_id);
    let items = [];
    if (outfit) {
      const itemRelations = mockStorage.outfit_items.filter(oi => oi.outfit_id === outfit.id);
      items = itemRelations.map(rel => mockStorage.wardrobe_items.find(w => w.id === rel.wardrobe_item_id)).filter(Boolean);
    }
    return {
      rows: [{
        ...s,
        outfit_name: outfit ? outfit.name : 'Unknown Outfit',
        outfit_occasion: outfit ? outfit.occasion : 'Casual',
        outfit: outfit ? { ...outfit, items } : null
      }],
      rowCount: 1
    };
  }

  // 20. UPDATE outfit_schedules
  if (lower.startsWith('update outfit_schedules')) {
    const id = parseInt(params[params.length - 2], 10);
    const userId = parseInt(params[params.length - 1], 10);
    const s = mockStorage.outfit_schedules.find(item => item.id === id && item.user_id === userId);
    if (!s) return { rows: [], rowCount: 0 };
    s.outfit_id = parseInt(params[0], 10);
    s.event_name = params[1];
    s.schedule_date = typeof params[2] === 'string' ? params[2].slice(0, 10) : new Date(params[2]).toISOString().slice(0, 10);
    s.notes = params[3];
    saveMockStorage();
    return { rows: [s], rowCount: 1 };
  }

  // 21. DELETE FROM outfit_schedules
  if (lower.startsWith('delete from outfit_schedules')) {
    const id = parseInt(params[0], 10);
    const userId = params[1] ? parseInt(params[1], 10) : null;
    let idx = mockStorage.outfit_schedules.findIndex(item => 
      parseInt(item.id, 10) === id && (!userId || parseInt(item.user_id, 10) === userId)
    );
    if (idx === -1) {
      idx = mockStorage.outfit_schedules.findIndex(item => parseInt(item.id, 10) === id);
    }
    if (idx !== -1) {
      const removed = mockStorage.outfit_schedules.splice(idx, 1)[0];
      saveMockStorage();
      return { rows: [removed], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // Fallback for migrations or other raw queries
  return { rows: [], rowCount: 0 };
}

/**
 * Run migrations from schema.sql
 */
async function initDb() {
  if (isPostgres && pool) {
    try {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('PostgreSQL schema migration completed successfully.');
    } catch (err) {
      console.error('Error running PostgreSQL migration:', err.message);
      console.log('Falling back to embedded storage mode.');
      isPostgres = false;
    }
  } else {
    console.log('Embedded database ready.');
  }
}

module.exports = {
  query,
  pool,
  initDb,
  isPostgres: () => isPostgres
};
