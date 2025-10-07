const pool = require('../db');

async function createMessage(title, text, userId) {
  const result = await pool.query(
    `INSERT INTO messages (title, text, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [title, text, userId]
  );
  return result.rows[0];
}

async function getAllMessages() {
  const result = await pool.query(
    `SELECT m.id, m.title, m.text, m.created_at, 
            u.first_name, u.last_name
     FROM messages m
     JOIN users u ON m.user_id = u.id
     ORDER BY m.created_at DESC`
  );
  return result.rows;
}

module.exports = { createMessage, getAllMessages };
