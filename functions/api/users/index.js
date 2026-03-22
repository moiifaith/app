// User management API endpoints (admin only)
import { verifyToken } from '../auth/jwt-utils.js';
import bcrypt from 'bcryptjs';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*'
};

async function requireAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const decoded = await verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return null;
  }
  return decoded;
}

// GET /api/users - List all users
export async function onRequestGet(context) {
  const { request, env } = context;

  const admin = await requireAdmin(request);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 403, headers: CORS_HEADERS
    });
  }

  try {
    const result = await env.zikr_database.prepare(
      `SELECT id, email, username, first_name, last_name, role, is_active, 
              email_verified, last_login, login_attempts, locked_until, created_at, updated_at
       FROM users ORDER BY created_at DESC`
    ).all();

    return new Response(JSON.stringify({
      success: true,
      data: (result.results || []).map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        isActive: !!u.is_active,
        emailVerified: !!u.email_verified,
        lastLogin: u.last_login,
        loginAttempts: u.login_attempts,
        lockedUntil: u.locked_until,
        createdAt: u.created_at,
        updatedAt: u.updated_at
      }))
    }), { headers: CORS_HEADERS });
  } catch (error) {
    console.error('List users error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500, headers: CORS_HEADERS
    });
  }
}

// POST /api/users - Create a new user (admin)
export async function onRequestPost(context) {
  const { request, env } = context;

  const admin = await requireAdmin(request);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 403, headers: CORS_HEADERS
    });
  }

  try {
    const { email, username, password, firstName, lastName, role } = await request.json();

    if (!email || !username || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Email, username, and password are required' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    // Check existing user
    const existing = await env.zikr_database.prepare(
      "SELECT id FROM users WHERE email = ? OR username = ?"
    ).bind(email, username).first();

    if (existing) {
      return new Response(JSON.stringify({ success: false, message: 'User with this email or username already exists' }), {
        status: 409, headers: CORS_HEADERS
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = (role === 'admin') ? 'admin' : 'user';

    const result = await env.zikr_database.prepare(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, 1, 0)`
    ).bind(email, username, passwordHash, firstName || '', lastName || '', userRole).run();

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      data: { id: result.meta.last_row_id }
    }), { status: 201, headers: CORS_HEADERS });
  } catch (error) {
    console.error('Create user error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500, headers: CORS_HEADERS
    });
  }
}

// PUT /api/users - Update user
export async function onRequestPut(context) {
  const { request, env } = context;

  const admin = await requireAdmin(request);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 403, headers: CORS_HEADERS
    });
  }

  try {
    const { id, email, username, firstName, lastName, role, isActive, password } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: 'User ID is required' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (email !== undefined) { updates.push('email = ?'); values.push(email); }
    if (username !== undefined) { updates.push('username = ?'); values.push(username); }
    if (firstName !== undefined) { updates.push('first_name = ?'); values.push(firstName); }
    if (lastName !== undefined) { updates.push('last_name = ?'); values.push(lastName); }
    if (role !== undefined) { updates.push('role = ?'); values.push(role === 'admin' ? 'admin' : 'user'); }
    if (isActive !== undefined) { updates.push('is_active = ?'); values.push(isActive ? 1 : 0); }
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ success: false, message: 'No fields to update' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await env.zikr_database.prepare(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...values).run();

    return new Response(JSON.stringify({ success: true, message: 'User updated successfully' }), {
      headers: CORS_HEADERS
    });
  } catch (error) {
    console.error('Update user error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500, headers: CORS_HEADERS
    });
  }
}

// DELETE /api/users - Delete user
export async function onRequestDelete(context) {
  const { request, env } = context;

  const admin = await requireAdmin(request);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
      status: 403, headers: CORS_HEADERS
    });
  }

  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'User ID is required' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    // Prevent deleting self
    if (parseInt(userId) === admin.id) {
      return new Response(JSON.stringify({ success: false, message: 'Cannot delete your own account' }), {
        status: 400, headers: CORS_HEADERS
      });
    }

    await env.zikr_database.prepare("DELETE FROM users WHERE id = ?").bind(userId).run();

    return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), {
      headers: CORS_HEADERS
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
      status: 500, headers: CORS_HEADERS
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
