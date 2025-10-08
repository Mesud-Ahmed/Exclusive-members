// models/messageModel.js
const pool = require('../db');

async function getAllMessages() {
  const result = await pool.query(
    `SELECT messages.*, users.first_name, users.last_name 
     FROM messages 
     JOIN users ON messages.user_id = users.id
     ORDER BY messages.created_at DESC`
  );
  return result.rows;
}

async function createMessage(userId, title, text) {
  await pool.query(
    'INSERT INTO messages (user_id, title, text, created_at) VALUES ($1, $2, $3, NOW())',
    [userId, title, text]
  );
}

// 🗑️ delete message
async function deleteMessage(id) {
  await pool.query('DELETE FROM messages WHERE id = $1', [id]);
}

module.exports = { getAllMessages, createMessage, deleteMessage };
