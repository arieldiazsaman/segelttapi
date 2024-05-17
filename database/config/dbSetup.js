// dbSetup.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const {
  DB_HOST,
  DB_PORT,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD
} = process.env;

async function initializeDatabase() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USERNAME,
      password: DB_PASSWORD
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${DB_DATABASE}\``);

    await connection.query(`CREATE DATABASE \`${DB_DATABASE}\``);

    await connection.changeUser({ database: DB_DATABASE });

    const createUserTableQuery = `
      CREATE TABLE IF NOT EXISTS User (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        session_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPostTableQuery = `
      CREATE TABLE IF NOT EXISTS Post (
        id INT AUTO_INCREMENT PRIMARY KEY,
        owner_id INT NOT NULL,
        owner_name VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES User(id) ON DELETE CASCADE
      )
    `;
    await connection.query(createUserTableQuery);
    await connection.query(createPostTableQuery);
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
