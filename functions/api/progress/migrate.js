import { verifyToken } from '../auth/jwt-utils.js';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
  }

  const decoded = await verifyToken(authHeader.substring(7));
  if (!decoded) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
  }
  const userId = decoded.id;

  try {
    const { progress } = await request.json();

    if (!Array.isArray(progress) || progress.length === 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    const batch = [];
    for (const entry of progress) {
      const { zikrId, date, count, targetCount, completed } = entry;
      if (!zikrId || !date || count === undefined || !targetCount) continue;

      batch.push(
        env.zikr_database.prepare(
          `INSERT OR REPLACE INTO user_progress (user_id, zikr_id, date, count, target_count, completed, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
        ).bind(userId, parseInt(zikrId), date, count, targetCount, completed ? 1 : 0)
      );
    }

    if (batch.length > 0) {
      await env.zikr_database.batch(batch);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders });
  }
}
