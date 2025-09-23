// Logout endpoint
// Logout endpoint
export async function onRequestPost() {
  // Since we're using JWT tokens, logout is primarily handled client-side
  // Here we can optionally blacklist the token or log the logout event
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
