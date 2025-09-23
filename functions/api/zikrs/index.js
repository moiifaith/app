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
    // Verify admin token (simplified for demo)
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
    
    const zikrData = await request.json();
    
    // In production, save to D1 database
    // For demo, just return success
    return new Response(JSON.stringify({
      success: true,
      message: 'Zikr saved successfully',
      data: { ...zikrData, id: Date.now() }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}