export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Data migration completed successfully',
        migratedItems: {
          progressEntries: Object.keys(zikrCounts || {}).length,
          historyEntries: (zikrHistory || []).length,
          language: language || null
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Migration error:', error)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Migration failed',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
