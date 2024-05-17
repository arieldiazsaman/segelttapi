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

const Following = {
  async followUser(follower_id, following_id) {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Following (follower_id, following_id) VALUES (?, ?)',
      [follower_id, following_id]
    );
    await connection.end();
    return result.insertId;
  },

  async unfollowUser(follower_id, following_id) {
    const connection = await getConnection();
    const [result] = await connection.execute(
      'DELETE FROM Following WHERE follower_id = ? AND following_id = ?',
      [follower_id, following_id]
    );
    await connection.end();
    return result.affectedRows;
  },

  async getFollowingByUser(user_id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT User.* FROM Following JOIN User ON Following.following_id = User.id WHERE Following.follower_id = ? ORDER BY User.name',
      [user_id]
    );
    await connection.end();
    return rows;
  },

  async getFollowersByUser(user_id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT User.* FROM Following JOIN User ON Following.follower_id = User.id WHERE Following.following_id = ?',
      [user_id]
    );
    await connection.end();
    return rows;
  },

  async getPostsFromFollowingAndFollowers(user_id) {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      `
      SELECT DISTINCT Post.* FROM Post
      LEFT JOIN Following AS F ON Post.owner_id = F.following_id OR Post.owner_id = F.follower_id
      WHERE F.follower_id = ? OR F.following_id = ?
      ORDER BY Post.created_at DESC
      `,
      [user_id, user_id]
    );
    await connection.end();
    return rows;
  }
};

module.exports = Following;
