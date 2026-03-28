import { verifyToken } from '../auth/jwt-utils.js';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function getAuthUser(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return await verifyToken(authHeader.substring(7));
}

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const decoded = await getAuthUser(request);
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const userId = decoded.id;

  try {
    const result = await env.zikr_database.prepare(
      'SELECT zikr_id, date, count, target_count, completed FROM user_progress WHERE user_id = ? ORDER BY date DESC, zikr_id'
    ).bind(userId).all();

    return new Response(JSON.stringify({ success: true, progress: result.results }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const decoded = await getAuthUser(request);
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }
  const userId = decoded.id;

  try {
    const { zikrId, date, count, targetCount, completed } = await request.json();
    if (!zikrId || !date || count === undefined || !targetCount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders });
    }

    await env.zikr_database.prepare(
      `INSERT OR REPLACE INTO user_progress (user_id, zikr_id, date, count, target_count, completed, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(userId, parseInt(zikrId), date, count, targetCount, completed ? 1 : 0).run();

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Error saving progress:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
}
