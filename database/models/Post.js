const mysql = require('mysql2/promise');
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

const Post = {
  async create({ owner_id, owner_name, text }) {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Post (owner_id, owner_name, text) VALUES (?, ?, ?)',
      [owner_id, owner_name, text]
    );
    await connection.end();
    return result.insertId;
  },

  async findByUserId(owner_id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM Post WHERE owner_id = ?',
      [owner_id]
    );
    await connection.end();
    return rows;
  }
};

module.exports = Post;
