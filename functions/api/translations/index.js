// Translations management endpoint
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang') || 'en';
  
  try {
    // In production, fetch from KV storage or D1 database
    // For demo, return default translations
    const translations = {
      en: {
        subhan_allah: 'Glory be to Allah - expressing the perfection and transcendence of Allah',
        alhamdulillah: 'All praise is due to Allah - acknowledging Allah as the source of all good',
        // ... more translations
      },
      ar: {
        subhan_allah: 'تسبيح الله - التعبير عن كمال الله وتنزيهه',
        alhamdulillah: 'الثناء والشكر لله - الاعتراف بأن الله مصدر كل خير',
        // ... more translations
      }
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: translations[lang] || translations.en
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch translations'
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
    
    const { language, translations } = await request.json();
    
    // In production, save to KV storage
    // await env.TRANSLATIONS.put(`translations:${language}`, JSON.stringify(translations));
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Translations updated successfully'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update translations'
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}