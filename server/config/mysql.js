import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

export const initializeDatabase = async () => {
  // Create DB if not exists
  const bootstrap = mysql.createPool({ ...dbConfig, database: null });
  await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await bootstrap.end();

  pool = mysql.createPool(dbConfig);
  await pool.query('SELECT 1'); // verify connection

  // ── Posts table ──────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      _id         VARCHAR(36)  PRIMARY KEY,
      title       VARCHAR(200) NOT NULL,
      message     TEXT,
      creator     VARCHAR(100),
      creator_sub VARCHAR(200),
      tags        VARCHAR(500) DEFAULT '[]',
      imageUrl    TEXT,
      thumbUrl    TEXT,
      likeCount   INT          DEFAULT 0,
      createdAt   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ── Comments table ───────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      post_id     VARCHAR(36)  NOT NULL,
      author      VARCHAR(100) NOT NULL,
      author_sub  VARCHAR(200),
      body        TEXT         NOT NULL,
      createdAt   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(_id) ON DELETE CASCADE
    )
  `);

  // ── User profiles table ──────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      sub         VARCHAR(200) PRIMARY KEY,
      username    VARCHAR(100),
      email       VARCHAR(200),
      bio         TEXT,
      avatarUrl   TEXT,
      createdAt   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅  MySQL tables ready');
  return true;
};

export { pool };
