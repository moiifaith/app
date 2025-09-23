// Zikr management endpoint
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    // Fetch from D1 database
    let zikrs = [];
    
    if (env.zikr_database) {
      try {
        const result = await env.zikr_database.prepare(
          "SELECT id, arabic, latin, identifier, default_repetitions as defaultRepetitions FROM zikrs WHERE is_active = 1 ORDER BY id"
        ).all();
        
        if (result.results && result.results.length > 0) {
          zikrs = result.results;
        }
      } catch (dbError) {
        console.log('D1 fetch failed:', dbError);
      }
    }
    
    // Fallback to default zikrs if database is empty or fails
    if (zikrs.length === 0) {
      zikrs = [
        {
          id: 1,
          arabic: 'سُبْحَانَ اللهِ',
          latin: 'Subhan Allah',
          identifier: 'subhan_allah',
          defaultRepetitions: 33
        },
        {
          id: 2,
          arabic: 'الْحَمْدُ لِلّهِ',
          latin: 'Alhamdulillah',
          identifier: 'alhamdulillah',
          defaultRepetitions: 33
        },
        {
          id: 3,
          arabic: 'اللّهُ أَكْبَرُ',
          latin: 'Allahu Akbar',
          identifier: 'allahu_akbar',
          defaultRepetitions: 34
        },
        {
          id: 4,
          arabic: 'لَا إِلَهَ إِلَّا اللّهُ',
          latin: 'La ilaha illa Allah',
          identifier: 'la_ilaha_illa_allah',
          defaultRepetitions: 100
        },
        {
          id: 5,
          arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
          latin: 'Allahumma salli ala Muhammad',
          identifier: 'salawat',
          defaultRepetitions: 10
        },
        {
          id: 6,
          arabic: 'أَسْتَغْفِرُ اللّهَ',
          latin: 'Astaghfirullah',
          identifier: 'astaghfirullah',
          defaultRepetitions: 70
        },
        {
          id: 7,
          arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّهِ',
          latin: 'La hawla wa la quwwata illa billah',
          identifier: 'la_hawla',
          defaultRepetitions: 10
        },
        {
          id: 8,
          arabic: 'بِسْمِ اللّهِ',
          latin: 'Bismillah',
          identifier: 'bismillah',
          defaultRepetitions: 21
        },
        {
          id: 9,
          arabic: 'رَبِّ اغْفِرْ لِي',
          latin: 'Rabbi ghfir li',
          identifier: 'rabbi_ghfir_li',
          defaultRepetitions: 25
        },
        {
          id: 10,
          arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
          latin: 'Subhan Allahi wa bihamdihi',
          identifier: 'subhan_allah_wa_bihamdihi',
          defaultRepetitions: 100
        }
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
    
    // TODO: Verify token and check admin role
    // const token = authHeader.substring(7);
    // For now, assume token is valid for demo
    
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
    
    // Save to D1 database
    const result = await env.zikr_database.prepare(
      `INSERT INTO zikrs (arabic, latin, identifier, default_repetitions, is_custom, is_active) 
       VALUES (?, ?, ?, ?, 0, 1)`
    ).bind(arabic, latin, identifier, defaultRepetitions || 33).run();
    
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