// Register endpoint
import bcrypt from 'bcryptjs';
import { generateToken } from './jwt-utils.js';

export async function onRequestPost(context) {
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
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = await env.zikr_database.prepare(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, 'user', 1, 0)`
    ).bind(email, username, hashedPassword, firstName || '', lastName || '').run();
    
    // Get the created user
    const newUser = await env.zikr_database.prepare(
      "SELECT id, email, username, first_name, last_name, role FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    
    // Generate JWT token
    const token = await generateToken(newUser);
    
    return new Response(JSON.stringify({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role
      },
      token
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Internal server error'
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
