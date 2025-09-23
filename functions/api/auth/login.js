// Login endpoint - redirects to main auth handler
// Login endpoint
import bcrypt from 'bcryptjs';
import { generateToken } from './jwt-utils.js';

export async function onRequestPost(context) {
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
      const lockUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
      
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
    const token = await generateToken(user);
    
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}