export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const { pathname } = url
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Get user from JWT token
      const authHeader = request.headers.get('Authorization')
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const token = authHeader.substring(7)
      let userId

      try {
        // Verify JWT token (simplified - in production use proper JWT verification)
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.userId
        
        if (!userId) {
          throw new Error('Invalid token')
        }
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (pathname === '/api/progress' && request.method === 'GET') {
        // Get user progress
        const progressQuery = `
          SELECT zikr_id, current_count, total_completed, last_updated
          FROM user_progress 
          WHERE user_id = ?
        `
        const progressResult = await env.MOII_DB.prepare(progressQuery)
          .bind(userId)
          .all()

        const historyQuery = `
          SELECT zikr_id, count, completed_at, date(completed_at) as date
          FROM user_progress_history 
          WHERE user_id = ? 
          ORDER BY completed_at DESC 
          LIMIT 100
        `
        const historyResult = await env.MOII_DB.prepare(historyQuery)
          .bind(userId)
          .all()

        // Format data for frontend
        const zikrCounts = {}
        progressResult.results.forEach(row => {
          zikrCounts[row.zikr_id] = {
            current: row.current_count,
            total: row.total_completed
          }
        })

        const zikrHistory = historyResult.results.map(row => ({
          zikrId: row.zikr_id,
          count: row.count,
          date: row.date,
          timestamp: row.completed_at
        }))

        return new Response(JSON.stringify({
          success: true,
          zikrCounts,
          zikrHistory
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (pathname === '/api/progress' && request.method === 'POST') {
        // Save user progress
        const data = await request.json()
        const { zikrId, count, isCompleted } = data

        if (!zikrId || !count) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        // Update current progress
        const updateProgressQuery = `
          INSERT OR REPLACE INTO user_progress 
          (user_id, zikr_id, current_count, total_completed, last_updated)
          VALUES (?, ?, ?, 
            COALESCE((SELECT total_completed FROM user_progress WHERE user_id = ? AND zikr_id = ?), 0) + ?,
            CURRENT_TIMESTAMP)
        `
        
        await env.MOII_DB.prepare(updateProgressQuery)
          .bind(userId, zikrId, count, userId, zikrId, isCompleted ? 1 : 0)
          .run()

        // Add to history if completed
        if (isCompleted) {
          const addHistoryQuery = `
            INSERT INTO user_progress_history (user_id, zikr_id, count, completed_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `
          
          await env.MOII_DB.prepare(addHistoryQuery)
            .bind(userId, zikrId, count)
            .run()
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (pathname === '/api/progress/migrate' && request.method === 'POST') {
        // Migrate localStorage data to database
        const data = await request.json()
        const { zikrCounts, zikrHistory, language } = data

        const batch = []

        // Migrate progress counts
        if (zikrCounts) {
          for (const [zikrId, counts] of Object.entries(zikrCounts)) {
            if (counts.current > 0 || counts.total > 0) {
              const query = `
                INSERT OR REPLACE INTO user_progress 
                (user_id, zikr_id, current_count, total_completed, last_updated)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
              `
              batch.push(env.MOII_DB.prepare(query).bind(userId, zikrId, counts.current || 0, counts.total || 0))
            }
          }
        }

        // Migrate history
        if (zikrHistory && Array.isArray(zikrHistory)) {
          for (const entry of zikrHistory) {
            if (entry.zikrId && entry.count > 0) {
              const query = `
                INSERT INTO user_progress_history (user_id, zikr_id, count, completed_at)
                VALUES (?, ?, ?, ?)
              `
              batch.push(env.MOII_DB.prepare(query).bind(
                userId, 
                entry.zikrId, 
                entry.count,
                entry.timestamp || new Date().toISOString()
              ))
            }
          }
        }

        // Execute all queries
        if (batch.length > 0) {
          await env.MOII_DB.batch(batch)
        }

        // Update user language preference
        if (language) {
          const updateLanguageQuery = `
            UPDATE users SET preferred_language = ? WHERE id = ?
          `
          await env.MOII_DB.prepare(updateLanguageQuery)
            .bind(language, userId)
            .run()
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Progress API error:', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
