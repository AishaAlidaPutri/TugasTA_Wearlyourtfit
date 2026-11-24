const http = require('http');
const { app } = require('../server');

let server;
let port;
let baseUrl;

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    let postData = null;
    if (body) {
      if (typeof body === 'string' || Buffer.isBuffer(body)) {
        postData = body;
      } else {
        postData = JSON.stringify(body);
        if (!options.headers['Content-Type']) {
          options.headers['Content-Type'] = 'application/json';
        }
      }
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: json });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Multipart helper for file upload simulation
function makeMultipartBody(fields, fileField, filename, fileBuffer, mimeType) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
      `${val}\r\n`
    );
  }

  if (fileBuffer) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${fileField}"; filename="${filename}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`
    );
  }

  const preBuffer = Buffer.from(parts.join(''), 'utf8');
  const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  const totalBody = Buffer.concat([preBuffer, fileBuffer, postBuffer]);

  return {
    contentType: `multipart/form-data; boundary=${boundary}`,
    body: totalBody
  };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING WEARLYOURFIT BACKEND API TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Health check
  const healthRes = await request('GET', '/api/health');
  assert(healthRes.status === 200 && healthRes.body.status === 'OK', 'GET /api/health should return 200 OK');

  // 2. User 1 Registration
  const testEmail1 = `clara_${Date.now()}@example.com`;
  const reg1Res = await request('POST', '/api/auth/register', {
    name: 'Clara Oswald',
    email: testEmail1,
    password: 'password123'
  });
  assert(reg1Res.status === 201 && reg1Res.body.token, 'POST /api/auth/register should create user and return JWT token');
  const token1 = reg1Res.body.token;
  const user1 = reg1Res.body.user;

  // 3. User 1 Login
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail1,
    password: 'password123'
  });
  assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login should authenticate and return token');

  // 4. GET /api/auth/me
  const meRes = await request('GET', '/api/auth/me', null, {
    Authorization: `Bearer ${token1}`
  });
  assert(meRes.status === 200 && meRes.body.user.email === testEmail1, 'GET /api/auth/me should return authenticated user');

  // 5. Add Wardrobe Item for User 1 (with image)
  const dummyImage = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;', 'binary');
  const mp1 = makeMultipartBody(
    { name: 'Silk Cream Blouse', category: 'Tops', color: 'Cream', description: 'Elegant silk blouse' },
    'image',
    'blouse.jpg',
    dummyImage,
    'image/jpeg'
  );

  const addTopRes = await request('POST', '/api/wardrobe', mp1.body, {
    'Content-Type': mp1.contentType,
    Authorization: `Bearer ${token1}`
  });
  assert(addTopRes.status === 201 && addTopRes.body.data.name === 'Silk Cream Blouse', 'POST /api/wardrobe should upload image and create item');
  const topItem = addTopRes.body.data;
  assert(!!topItem.image_url, 'Wardrobe item should contain image_url');

  // Add Bottom Item for User 1
  const mp2 = makeMultipartBody(
    { name: 'Pleated Beige Midi Skirt', category: 'Bottoms', color: 'Beige', description: 'Flowy midi skirt' },
    'image',
    'skirt.jpg',
    dummyImage,
    'image/jpeg'
  );
  const addBottomRes = await request('POST', '/api/wardrobe', mp2.body, {
    'Content-Type': mp2.contentType,
    Authorization: `Bearer ${token1}`
  });
  const bottomItem = addBottomRes.body.data;

  // Add Shoes for User 1
  const mp3 = makeMultipartBody(
    { name: 'Nude Leather Loafers', category: 'Shoes', color: 'Nude', description: 'Comfortable loafers' },
    'image',
    'loafers.jpg',
    dummyImage,
    'image/jpeg'
  );
  const addShoesRes = await request('POST', '/api/wardrobe', mp3.body, {
    'Content-Type': mp3.contentType,
    Authorization: `Bearer ${token1}`
  });
  const shoesItem = addShoesRes.body.data;

  // 6. GET /api/wardrobe with filter
  const getWardrobeRes = await request('GET', '/api/wardrobe?category=Tops', null, {
    Authorization: `Bearer ${token1}`
  });
  assert(getWardrobeRes.status === 200 && getWardrobeRes.body.data.length >= 1, 'GET /api/wardrobe?category=Tops should return filtered items');

  // 7. Create Outfit combining items
  const createOutfitRes = await request('POST', '/api/outfits', {
    name: 'Soft Parisian Elegance',
    occasion: 'Work',
    description: 'Perfect for casual office and meetings',
    item_ids: [topItem.id, bottomItem.id, shoesItem.id]
  }, {
    Authorization: `Bearer ${token1}`
  });
  assert(createOutfitRes.status === 201 && createOutfitRes.body.data.name === 'Soft Parisian Elegance', 'POST /api/outfits should create outfit with items');
  const outfit = createOutfitRes.body.data;

  // 8. GET /api/outfits
  const getOutfitsRes = await request('GET', '/api/outfits', null, {
    Authorization: `Bearer ${token1}`
  });
  assert(getOutfitsRes.status === 200 && getOutfitsRes.body.data.length >= 1, 'GET /api/outfits should list saved outfits');

  // 9. Schedule Outfit for today
  const todayStr = new Date().toISOString().slice(0, 10);
  const createScheduleRes = await request('POST', '/api/schedules', {
    outfit_id: outfit.id,
    event_name: 'Product Design Sync',
    schedule_date: todayStr,
    notes: 'Bring portfolio iPad'
  }, {
    Authorization: `Bearer ${token1}`
  });
  assert(createScheduleRes.status === 201 && createScheduleRes.body.data.event_name === 'Product Design Sync', 'POST /api/schedules should schedule outfit');
  const schedule = createScheduleRes.body.data;

  // 10. GET /api/home/summary
  const summaryRes = await request('GET', '/api/home/summary', null, {
    Authorization: `Bearer ${token1}`
  });
  assert(summaryRes.status === 200 && summaryRes.body.data.counts.wardrobe >= 3, 'GET /api/home/summary should return dashboard counts and today outfit');

  // 11. Multi-User Isolation Test: User 2 cannot access User 1 items
  const testEmail2 = `donna_${Date.now()}@example.com`;
  const reg2Res = await request('POST', '/api/auth/register', {
    name: 'Donna Noble',
    email: testEmail2,
    password: 'password456'
  });
  const token2 = reg2Res.body.token;

  const user2Wardrobe = await request('GET', '/api/wardrobe', null, {
    Authorization: `Bearer ${token2}`
  });
  assert(user2Wardrobe.status === 200 && user2Wardrobe.body.data.length === 0, 'User 2 should see 0 items in wardrobe (isolation verified)');

  const user2TryAccessUser1Item = await request('GET', `/api/wardrobe/${topItem.id}`, null, {
    Authorization: `Bearer ${token2}`
  });
  assert(user2TryAccessUser1Item.status === 404, 'User 2 accessing User 1 wardrobe item directly should return 404');

  const user2TryAccessUser1Outfit = await request('GET', `/api/outfits/${outfit.id}`, null, {
    Authorization: `Bearer ${token2}`
  });
  assert(user2TryAccessUser1Outfit.status === 404, 'User 2 accessing User 1 outfit should return 404');

  // 12. Update Wardrobe Item
  const updateItemRes = await request('PUT', `/api/wardrobe/${topItem.id}`, {
    name: 'Silk Cream Blouse (Updated)',
    category: 'Tops',
    color: 'Warm Ivory',
    description: 'Updated blouse description'
  }, {
    Authorization: `Bearer ${token1}`
  });
  assert(updateItemRes.status === 200 && updateItemRes.body.data.name.includes('(Updated)'), 'PUT /api/wardrobe/:id should update item metadata');

  // 13. Delete Schedule
  const deleteScheduleRes = await request('DELETE', `/api/schedules/${schedule.id}`, null, {
    Authorization: `Bearer ${token1}`
  });
  assert(deleteScheduleRes.status === 200, 'DELETE /api/schedules/:id should remove schedule');

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Start temporary test server
async function startAndTest() {
  const { initDb } = require('../src/config/db');
  await initDb();
  server = app.listen(0, async () => {
    port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    try {
      await runTests();
      server.close();
      process.exit(0);
    } catch (err) {
      console.error('Test execution error:', err);
      server.close();
      process.exit(1);
    }
  });
}

startAndTest();
