const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
let isConfigured = false;

if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false
      }
    });
    isConfigured = true;
    console.log('[Supabase] Client initialized successfully with:', supabaseUrl);
  } catch (error) {
    console.error('[Supabase] Initialization error:', error.message);
  }
} else {
  // Create dummy client so require does not throw, while warning user
  try {
    supabase = createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
  } catch (e) {
    // ignore
  }
  console.log('[Supabase] Warning: SUPABASE_URL and SUPABASE_KEY not set yet in .env.');
  console.log('[Supabase] Operating in fallback mode. Fill your Supabase credentials in .env to connect.');
}

module.exports = {
  supabase,
  isConfigured: () => isConfigured
};
