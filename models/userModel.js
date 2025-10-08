
const pool = require('../db');

async function createUser(firstName, lastName, email, hashedPassword, admin = false) {
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password, admin)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, first_name, last_name, email, membership_status, admin, created_at`,
    [firstName, lastName, email, hashedPassword, admin]
  );
  return result.rows[0];
}

async function updateMembershipStatus(userId, status) {
  const result = await pool.query(
    `UPDATE users SET membership_status = $1 WHERE id = $2 RETURNING id, email, membership_status`,
    [status, userId]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

async function findUserById(id) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail, findUserById,updateMembershipStatus };
