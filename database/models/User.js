const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const {
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD
} = process.env;

async function getConnection() {
  return mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE
  });
}

const User = {
  async create({ name, username, email, password }) {
    const connection = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO User (name, username, email, password) VALUES (?, ?, ?, ?)',
      [name, username, email, hashedPassword]
    );
    await connection.end();
    return result.insertId;
  },

  async findByUsername(username) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM User WHERE username = ?',
      [username]
    );
    await connection.end();
    return rows[0];
  },

  async update(userId, fields, nullableFields) {
    const connection = await getConnection();
    const updates = [];
    const values = [];

    if (fields?.name) {
      updates.push('name = ?');
      values.push(fields?.name);
    }
    if (fields?.username) {
      updates.push('username = ?');
      values.push(fields?.username);
    }
    if (fields?.email) {
      updates.push('email = ?');
      values.push(fields?.email);
    }
    if (fields?.password) {
      const hashedPassword = await bcrypt.hash(fields?.password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (fields?.session_token || nullableFields?.session_token) {
        updates.push('session_token = ?');
        values.push(fields?.session_token ? fields?.session_token : null);
    }

    if (updates.length > 0) {
      const query = `UPDATE User SET ${updates.join(', ')} WHERE id = ?`;
      values.push(userId);
      await connection.execute(query, values);
    }

    await connection.end();
  },
};

module.exports = User;
