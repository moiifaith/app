// Languages endpoint - get supported languages
export async function onRequestGet(context) {
  const { env } = context;
  
  try {
    let languages = [];
    
    // Fetch from D1 database
    if (env.zikr_database) {
      try {
        const result = await env.zikr_database.prepare(
          "SELECT code, name, native_name, rtl FROM languages WHERE is_active = 1 ORDER BY name"
        ).all();
        
        if (result.results && result.results.length > 0) {
          languages = result.results;
        }
      } catch (dbError) {
        console.log('D1 fetch failed:', dbError);
      }
    }
    
    // Fallback to default languages if database fails
    if (languages.length === 0) {
      languages = [
        { code: 'en', name: 'English', native_name: 'English', rtl: 0 },
        { code: 'ar', name: 'Arabic', native_name: 'العربية', rtl: 1 },
        { code: 'es', name: 'Spanish', native_name: 'Español', rtl: 0 },
        { code: 'fr', name: 'French', native_name: 'Français', rtl: 0 }
      ];
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: languages
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch languages'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
