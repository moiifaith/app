// Translation version endpoint for cache management
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'en';
  
  try {
    // First try to get version from KV storage
    let versionData = null;
    try {
      const kvVersions = await env.TRANSLATIONS.get('translation_versions');
      if (kvVersions) {
        const versions = JSON.parse(kvVersions);
        if (versions[lang]) {
          versionData = {
            version: versions[lang],
            lastUpdated: new Date().toISOString()
          };
        }
      }
    } catch (kvError) {
      console.log('KV version fetch failed, trying D1:', kvError);
    }
    
    // If not in KV, try D1 database
    if (!versionData && env.zikr_database) {
      try {
        const result = await env.zikr_database.prepare(
          "SELECT version_hash, last_updated FROM translation_versions WHERE language_code = ?"
        ).bind(lang).first();
        
        if (result) {
          versionData = {
            version: result.version_hash,
            lastUpdated: result.last_updated
          };
        }
      } catch (dbError) {
        console.log('D1 version fetch failed:', dbError);
      }
    }
    
    if (versionData) {
      return new Response(JSON.stringify({
        success: true,
        version: versionData.version,
        lastUpdated: versionData.lastUpdated
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      // If no version found, return a default based on current timestamp
      const defaultVersion = Date.now().toString();
      return new Response(JSON.stringify({
        success: true,
        version: defaultVersion,
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
