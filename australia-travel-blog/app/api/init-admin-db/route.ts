import { NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // First, drop the existing users table if it exists
    await pool.query(`
      DROP TABLE IF EXISTS users;
    `);

    // Create the users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // Hash the default admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert default admin user
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin User', 'admin@example.com', $1, 'admin')
      ON CONFLICT (email) DO UPDATE SET 
        password = $1,
        updated_at = NOW();
    `, [hashedPassword]);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user database initialized successfully'
    });
  } catch (error) {
    console.error('Error initializing admin user database:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 