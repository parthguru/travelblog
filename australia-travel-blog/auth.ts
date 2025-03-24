import { cookies } from 'next/headers';
import { pool } from './app/lib/db';

// Simple auth mechanism for API routes
export async function auth() {
  try {
    // Get admin token from cookies
    const cookieStore = cookies();
    const sessionId = cookieStore.get('admin_session')?.value;
    
    if (!sessionId) {
      return null;
    }
    
    // Fetch admin by sessionId
    const result = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1 AND role = 'admin'`,
      [sessionId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const admin = result.rows[0];
    
    // Return session object
    return {
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        isAdmin: admin.role === 'admin'
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 