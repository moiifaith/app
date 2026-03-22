// Zikr management endpoint
import { verifyToken } from '../auth/jwt-utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Optionally get user from token to include custom zikrs
    let userId = null;
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = await verifyToken(authHeader.substring(7));
      if (decoded) userId = decoded.id;
    }

    // Fetch from D1 database
    let zikrs = [];
    
    if (env.zikr_database) {
      try {
        // Get default (non-custom) active zikrs plus user's own custom zikrs
        let query = "SELECT id, arabic, latin, identifier, default_repetitions as defaultRepetitions, is_custom as isCustom, user_id as userId FROM zikrs WHERE is_active = 1 AND (is_custom = 0";
        const bindings = [];
        
        if (userId) {
          query += " OR user_id = ?";
          bindings.push(userId);
        }
        query += ") ORDER BY is_custom, id";

        const stmt = env.zikr_database.prepare(query);
        const result = bindings.length > 0 ? await stmt.bind(...bindings).all() : await stmt.all();
        
        if (result.results && result.results.length > 0) {
          zikrs = result.results;
        }
      } catch (dbError) {
        console.log('D1 fetch failed:', dbError);
      }
    }
    
    // Fallback to default zikrs if database is empty or fails
    // Client-side zikrs.js has the full 200 entries; this is a minimal server fallback
    if (zikrs.length === 0) {
      zikrs = [
        { id: 1, arabic: 'سُبْحَانَ اللهِ', latin: 'Subhan Allah', identifier: 'subhan_allah', defaultRepetitions: 33 },
        { id: 2, arabic: 'الْحَمْدُ لِلّهِ', latin: 'Alhamdulillah', identifier: 'alhamdulillah', defaultRepetitions: 33 },
        { id: 3, arabic: 'اللّهُ أَكْبَرُ', latin: 'Allahu Akbar', identifier: 'allahu_akbar', defaultRepetitions: 34 },
        { id: 4, arabic: 'لَا إِلَهَ إِلَّا اللّهُ', latin: 'La ilaha illa Allah', identifier: 'la_ilaha_illa_allah', defaultRepetitions: 100 },
        { id: 5, arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', latin: 'Allahumma salli ala Muhammad', identifier: 'salawat', defaultRepetitions: 10 },
        { id: 6, arabic: 'أَسْتَغْفِرُ اللّهَ', latin: 'Astaghfirullah', identifier: 'astaghfirullah', defaultRepetitions: 70 },
        { id: 7, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّهِ', latin: 'La hawla wa la quwwata illa billah', identifier: 'la_hawla', defaultRepetitions: 10 },
        { id: 8, arabic: 'بِسْمِ اللّهِ', latin: 'Bismillah', identifier: 'bismillah', defaultRepetitions: 21 },
        { id: 9, arabic: 'رَبِّ اغْفِرْ لِي', latin: 'Rabbi ghfir li', identifier: 'rabbi_ghfir_li', defaultRepetitions: 25 },
        { id: 10, arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', latin: 'Subhan Allahi wa bihamdihi', identifier: 'subhan_allah_wa_bihamdihi', defaultRepetitions: 100 },
        { id: 11, arabic: 'سُبْحَانَ اللهِ الْعَظِيمِ', latin: 'Subhan Allahil Azim', identifier: 'subhan_allah_al_azim', defaultRepetitions: 100 },
        { id: 12, arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ سُبْحَانَ اللهِ الْعَظِيمِ', latin: 'Subhan Allahi wa bihamdihi Subhan Allahil Azim', identifier: 'subhan_allah_combined', defaultRepetitions: 100 },
        { id: 13, arabic: 'سُبُّوحٌ قُدُّوسٌ رَبُّ الْمَلَائِكَةِ وَالرُّوحِ', latin: 'Subbuhun Quddusun Rabbul Malaikati war-Ruh', identifier: 'subbuhun_quddusun', defaultRepetitions: 10 },
        { id: 14, arabic: 'حَسْبِيَ اللّهُ لَا إِلَهَ إِلَّا هُوَ', latin: 'Hasbiyallahu la ilaha illa Huwa', identifier: 'hasbiyallah', defaultRepetitions: 7 },
        { id: 15, arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ', latin: 'Ya Hayyu Ya Qayyumu birahmatika astagheeth', identifier: 'ya_hayyu_ya_qayyum', defaultRepetitions: 3 },
        { id: 16, arabic: 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', latin: 'La ilaha illa Anta Subhanaka inni kuntu minaz-zalimin', identifier: 'dua_yunus', defaultRepetitions: 7 },
        { id: 17, arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', latin: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar', identifier: 'rabbana_atina', defaultRepetitions: 7 },
        { id: 18, arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا', latin: 'Rabbana la tuzigh qulubana bada idh hadaytana', identifier: 'rabbana_la_tuzigh', defaultRepetitions: 3 },
        { id: 19, arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ', latin: 'Allahumma inni audhu bika minal-hammi wal-hazan', identifier: 'audhu_min_alhamm', defaultRepetitions: 3 },
        { id: 20, arabic: 'رَبِّ زِدْنِي عِلْمًا', latin: 'Rabbi zidni ilma', identifier: 'rabbi_zidni_ilma', defaultRepetitions: 7 },
      ];
    }
    return new Response(JSON.stringify({
      success: true,
      data: zikrs
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch zikrs'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Verify token (admin or regular user)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid token'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const zikrData = await request.json();
    const { arabic, latin, identifier, defaultRepetitions, isCustom } = zikrData;
    
    if (!arabic || !latin || !identifier) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: arabic, latin, identifier'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // If user is not admin, force it to be a custom zikr
    const custom = decoded.role === 'admin' ? (isCustom ? 1 : 0) : 1;
    const userId = custom ? decoded.id : null;
    
    // Save to D1 database
    const result = await env.zikr_database.prepare(
      `INSERT INTO zikrs (arabic, latin, identifier, default_repetitions, is_custom, user_id, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`
    ).bind(arabic, latin, identifier, defaultRepetitions || 33, custom, userId).run();
    
    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Zikr saved successfully',
        data: { 
          id: result.meta.last_row_id,
          arabic,
          latin,
          identifier,
          defaultRepetitions: defaultRepetitions || 33
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      throw new Error('Failed to save to database');
    }
  } catch (error) {
    console.error('Save zikr error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to save zikr'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (!id || isNaN(parseInt(id))) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid zikr ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const zikrData = await request.json();
    const { arabic, latin, identifier, defaultRepetitions } = zikrData;
    
    if (!arabic || !latin || !identifier) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: arabic, latin, identifier'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Update in D1 database
    const result = await env.zikr_database.prepare(
      `UPDATE zikrs SET arabic = ?, latin = ?, identifier = ?, default_repetitions = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND is_active = 1`
    ).bind(arabic, latin, identifier, defaultRepetitions || 33, parseInt(id)).run();
    
    if (result.success && result.meta.changes > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Zikr updated successfully',
        data: { 
          id: parseInt(id),
          arabic,
          latin,
          identifier,
          defaultRepetitions: defaultRepetitions || 33
        }
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Zikr not found or no changes made'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Update zikr error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update zikr'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Verify admin token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Extract ID from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    if (!id || isNaN(parseInt(id))) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid zikr ID'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Soft delete in D1 database
    const result = await env.zikr_database.prepare(
      `UPDATE zikrs SET is_active = 0, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ? AND is_active = 1`
    ).bind(parseInt(id)).run();
    
    if (result.success && result.meta.changes > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Zikr deleted successfully'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'Zikr not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Delete zikr error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to delete zikr'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}