// Daily prayer tracking API
import { verifyToken } from '../auth/jwt-utils.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function getUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return await verifyToken(authHeader.substring(7));
}

// GET /api/prayers         → all entries for the user
// GET /api/prayers?date=   → single day
// GET /api/prayers?month=  → all days in YYYY-MM
export async function onRequestGet(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const user = await getUser(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const url = new URL(request.url);
  const date = url.searchParams.get('date');
  const month = url.searchParams.get('month');

  try {
    let stmt, result;

    if (date) {
      stmt = env.zikr_database.prepare(
        'SELECT date, fajr, dhuhr, asr, maghrib, isha FROM user_prayer_log WHERE user_id = ? AND date = ? LIMIT 1'
      );
      result = await stmt.bind(user.id, date).first();
      return json({ success: true, data: result || null });
    }

    if (month) {
      stmt = env.zikr_database.prepare(
        "SELECT date, fajr, dhuhr, asr, maghrib, isha FROM user_prayer_log WHERE user_id = ? AND date LIKE ? ORDER BY date ASC"
      );
      result = await stmt.bind(user.id, `${month}%`).all();
      return json({ success: true, data: result.results || [] });
    }

    // All entries
    stmt = env.zikr_database.prepare(
      'SELECT date, fajr, dhuhr, asr, maghrib, isha FROM user_prayer_log WHERE user_id = ? ORDER BY date DESC LIMIT 365'
    );
    result = await stmt.bind(user.id).all();
    return json({ success: true, data: result.results || [] });
  } catch (err) {
    console.error('GET /api/prayers error:', err);
    return json({ error: 'Database error' }, 500);
  }
}

// POST /api/prayers  body: { date, fajr, dhuhr, asr, maghrib, isha }
export async function onRequestPost(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const user = await getUser(request);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  const { date, fajr, dhuhr, asr, maghrib, isha } = body;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: 'Valid date (YYYY-MM-DD) required' }, 400);
  }

  const validStatuses = new Set(['prayed', 'kaza', 'missed', null, undefined]);
  for (const val of [fajr, dhuhr, asr, maghrib, isha]) {
    if (!validStatuses.has(val)) return json({ error: 'Invalid prayer status value' }, 400);
  }

  try {
    await env.zikr_database.prepare(`
      INSERT INTO user_prayer_log (user_id, date, fajr, dhuhr, asr, maghrib, isha, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, date) DO UPDATE SET
        fajr = excluded.fajr,
        dhuhr = excluded.dhuhr,
        asr = excluded.asr,
        maghrib = excluded.maghrib,
        isha = excluded.isha,
        updated_at = CURRENT_TIMESTAMP
    `).bind(user.id, date, fajr ?? null, dhuhr ?? null, asr ?? null, maghrib ?? null, isha ?? null).run();

    return json({ success: true });
  } catch (err) {
    console.error('POST /api/prayers error:', err);
    return json({ error: 'Database error' }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
