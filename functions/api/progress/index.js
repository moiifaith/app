// User progress tracking endpoint
// Note: This app uses localStorage for progress tracking, not database storage
export async function onRequestPost(context) {
  const { request } = context;
  
  try {
    const progressData = await request.json();
    
    // Since this app uses localStorage, just acknowledge the request
    // The actual storage happens client-side in localStorage
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Progress acknowledged (stored locally in browser)',
      note: 'This app uses localStorage for progress tracking'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to process progress data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const date = url.searchParams.get('date');
  
  try {
    // Since this app uses localStorage, return empty data
    // The actual data retrieval happens client-side from localStorage
    
    return new Response(JSON.stringify({
      success: true,
      data: [],
      message: 'Progress data is stored locally in browser',
      note: 'This app uses localStorage for progress tracking'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch progress'
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}