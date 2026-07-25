import { pool } from '../config/mysql.js';

class Profile {
  static async upsert({ sub, username, email, bio, avatarUrl }) {
    await pool.execute(
      `INSERT INTO profiles (sub, username, email, bio, avatarUrl)
       VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         username=VALUES(username), email=VALUES(email),
         bio=VALUES(bio), avatarUrl=VALUES(avatarUrl)`,
      [sub, username||'', email||'', bio||'', avatarUrl||null]
    );
    return this.findBySub(sub);
  }

  static async findBySub(sub) {
    const [rows] = await pool.execute('SELECT * FROM profiles WHERE sub=?', [sub]);
    return rows[0] || null;
  }

  static async postsByUser(sub) {
    const [rows] = await pool.execute(
      'SELECT * FROM posts WHERE creator_sub=? ORDER BY createdAt DESC',
      [sub]
    );
    return rows.map((row) => ({
      _id:          row._id,
      post_title:   row.title,
      post_message: row.message,
      posted_by:    row.creator,
      post_tags:    JSON.parse(row.tags || '[]'),
      imageUrl:     row.imageUrl,
      thumbUrl:     row.thumbUrl,
      post_likes:   row.likeCount,
      createdAt:    row.createdAt,
    }));
  }
}

export default Profile;
