const { pool } = require('./db');
const bcrypt = require('bcrypt');

/**
 * Verify user credentials
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{id: string, name: string, email: string, role: string}|null>} - User object if authentication successful, null otherwise
 */
async function verifyUserCredentials(email, password) {
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
async function getUserById(id) {
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
async function createUser(userData) {
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
async function updateUser(id, userData) {
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
async function deleteUser(id) {
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
async function listUsers() {
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

/**
 * Get current user session based on cookies or headers
 * @returns {Promise<object|null>} - Session object with user data or null if not authenticated
 */
async function getSession() {
  // This is a simplified implementation for local development
  // In production, use a proper authentication method like JWT or sessions
  try {
    // For now, return a mock admin user for development
    return {
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    };
    
    // TODO: Implement proper authentication with:
    // 1. Get session cookie/token from request
    // 2. Verify token
    // 3. Get user data from database
    // 4. Return session object with user data
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

module.exports = {
  verifyUserCredentials,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  getSession,
};
