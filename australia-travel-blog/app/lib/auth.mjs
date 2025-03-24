import { pool } from './db.js';
import bcrypt from 'bcrypt';

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{id: string, name: string, email: string, role: string}|null>} - User object if authentication successful, null otherwise
 */
export async function verifyUserCredentials(email, password) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return null;
    }

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error verifying user credentials:', error);
    return null;
  }
}

/**
 * Get user by ID
 * @param {number} id - User ID
 * @returns {Promise<object|null>} - User object or null if not found
 */
export async function getUserById(id) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param {object} userData - User data
 * @returns {Promise<object|null>} - New user object or null if creation failed
 */
export async function createUser(userData) {
  const { name, email, password, role = 'admin' } = userData;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role]
    );

    return result.rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

/**
 * Update user information
 * @param {number} id - User ID
 * @param {object} userData - User data to update
 * @returns {Promise<object|null>} - Updated user object or null if update failed
 */
export async function updateUser(id, userData) {
  const { name, email, password, role } = userData;

  try {
    let query = 'UPDATE users SET ';
    const values = [];
    const updates = [];
    let paramIndex = 1;

    if (name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }

    if (email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.push(`password = $${paramIndex++}`);
      values.push(hashedPassword);
    }

    if (role) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = NOW()`);
    query += updates.join(', ');
    query += ` WHERE id = $${paramIndex} RETURNING id, name, email, role`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

/**
 * Delete user
 * @param {number} id - User ID
 * @returns {Promise<boolean>} - True if deletion successful, false otherwise
 */
export async function deleteUser(id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

/**
 * List all users
 * @returns {Promise<Array>} - Array of user objects
 */
export async function listUsers() {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY name'
    );
    return result.rows;
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}
