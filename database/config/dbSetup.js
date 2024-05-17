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
    await connection.query(createUserTableQuery);
    console.log(`Table 'User' created successfully.`);

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
    await connection.query(createPostTableQuery);
    console.log(`Table 'Post' created successfully.`);

    const createFollowingTableQuery = `
        CREATE TABLE IF NOT EXISTS Following (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        FOREIGN KEY (follower_id) REFERENCES User(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES User(id) ON DELETE CASCADE
        )
    `;
    await connection.query(createFollowingTableQuery);
    console.log(`Table 'Following' created successfully.`);

    // Insert users
    const hashedPassword = await bcrypt.hash('1234', 10);
    const insertUsers = `
      INSERT INTO User (name, username, email, password) VALUES
      ('Pedro', 'pedro', 'pedro@example.com', '${hashedPassword}'),
      ('Juan', 'juan', 'juan@example.com', '${hashedPassword}'),
      ('Pablo', 'pablo', 'pablo@example.com', '${hashedPassword}'),
      ('Pepe', 'pepe', 'pepe@example.com', '${hashedPassword}')
    `;
    await connection.query(insertUsers);
    console.log(`Table 'User' populated.`);

    // Insert following/followers relations
    const insertFollows = `
      INSERT INTO Following (follower_id, following_id) VALUES
      (1, 2), -- Pedro sigue a Juan
      (2, 3), -- Juan sigue a Pablo
      (2, 4), -- Juan sigue a Pepe
      (4, 1), -- Pepe sigue a Pedro
      (4, 2), -- Pepe sigue a Juan
      (4, 3),  -- Pepe sigue a Pablo
      (1, 1),
      (2, 2),
      (3, 3),
      (4, 4)
    `;
    await connection.query(insertFollows);
    console.log(`Table 'Following' populated.`);

    // Insert posts for Pedro
    const insertPedroPosts = `
      INSERT INTO Post (owner_id, owner_name, text) VALUES
      (1, 'Pedro', 'Lunes'),
      (1, 'Pedro', 'Martes'),
      (1, 'Pedro', 'Miércoles'),
      (1, 'Pedro', 'Jueves'),
      (1, 'Pedro', 'Viernes'),
      (1, 'Pedro', 'Sábado'),
      (1, 'Pedro', 'Domingo')
    `;
    await connection.query(insertPedroPosts);
    // Insert posts for Pablo
    const insertPabloPosts = `
      INSERT INTO Post (owner_id, owner_name, text) VALUES
      (3, 'Pablo', 'Enero'),
      (3, 'Pablo', 'Febrero'),
      (3, 'Pablo', 'Marzo'),
      (3, 'Pablo', 'Abril'),
      (3, 'Pablo', 'Mayo'),
      (3, 'Pablo', 'Junio'),
      (3, 'Pablo', 'Julio'),
      (3, 'Pablo', 'Agosto'),
      (3, 'Pablo', 'Septiembre'),
      (3, 'Pablo', 'Octubre'),
      (3, 'Pablo', 'Noviembre'),
      (3, 'Pablo', 'Diciembre')
    `;
    await connection.query(insertPabloPosts);
    console.log(`Table 'Post' populated.`);

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();
