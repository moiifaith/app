// Translation version endpoint for cache management
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'en';
  
  try {
    // Get translation version hash from database
    const result = await env.zikr_database.prepare(
      "SELECT version_hash, last_updated FROM translation_versions WHERE language_code = ?"
    ).bind(lang).first();
    
    if (result) {
      return new Response(JSON.stringify({
        success: true,
        version: result.version_hash,
        lastUpdated: result.last_updated
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // If no version found, return a default
      return new Response(JSON.stringify({
        success: true,
        version: 'initial',
        lastUpdated: new Date().toISOString()
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.error('Error getting translation version:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to get translation version'
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
