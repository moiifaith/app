// Authentication endpoints
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from './jwt-utils.js';

// Register new user
export async function onRequestPost(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const endpoint = url.pathname.split('/').pop();
  
  if (endpoint === 'register') {
    return handleRegister(context);
  } else if (endpoint === 'login') {
    return handleLogin(context);
  } else if (endpoint === 'logout') {
    return handleLogout(context);
  }
  
  return new Response(JSON.stringify({
    success: false,
    message: 'Endpoint not found'
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

async function handleRegister(context) {
  const { request, env } = context;
  
  try {
    const { email, username, password, firstName, lastName } = await request.json();
    
    // Validate input
    if (!email || !username || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email, username, and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await env.zikr_database.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();
    
    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User with this email or username already exists'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await env.zikr_database.prepare(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role) 
       VALUES (?, ?, ?, ?, ?, 'user')`
    ).bind(email, username, passwordHash, firstName || null, lastName || null).run();
    
    // Get created user
    const user = await env.zikr_database.prepare(
      "SELECT id, email, username, first_name, last_name, role, created_at FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    
    // Generate token
    const token = generateToken(user);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Registration failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleLogin(context) {
  const { request, env } = context;
  
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email and password are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Get user by email or username
    const user = await env.zikr_database.prepare(
      "SELECT * FROM users WHERE (email = ? OR username = ?) AND is_active = 1"
    ).bind(email, email).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Account is temporarily locked. Please try again later.'
      }), {
        status: 423,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Increment login attempts
      const loginAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null; // Lock for 15 minutes
      
      await env.zikr_database.prepare(
        "UPDATE users SET login_attempts = ?, locked_until = ? WHERE id = ?"
      ).bind(loginAttempts, lockUntil, user.id).run();
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid credentials'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Reset login attempts and update last login
    await env.zikr_database.prepare(
      "UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(user.id).run();
    
    // Generate token
    const token = generateToken(user);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Login failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

async function handleLogout(context) {
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

// Get current user info
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No token provided'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
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
    
    // Get fresh user data
    const user = await env.zikr_database.prepare(
      "SELECT id, email, username, first_name, last_name, role, created_at, last_login FROM users WHERE id = ? AND is_active = 1"
    ).bind(decoded.id).first();
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          createdAt: user.created_at,
          lastLogin: user.last_login
        }
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to get user info'
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

export { verifyToken, generateToken };
