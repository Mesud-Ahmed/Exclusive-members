require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
});

const schema = `

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  membership_status VARCHAR(50) DEFAULT 'basic',
  admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

`;

pool.query(schema)
  .then(() => {
    console.log('Tables created!');
    pool.end();
  })
  .catch(err => console.error(err));
