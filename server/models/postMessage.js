import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/mysql.js';

const mapRow = (row) => ({
  _id:         row._id,
  post_title:  row.title,
  post_message:row.message,
  posted_by:   row.creator,
  creator_sub: row.creator_sub,
  post_tags:   JSON.parse(row.tags || '[]'),
  imageUrl:    row.imageUrl  || null,
  thumbUrl:    row.thumbUrl  || null,
  post_likes:  row.likeCount,
  createdAt:   row.createdAt,
});

class MessagePost {
  static async create({ post_title, post_message, posted_by, creator_sub, post_tags, imageUrl, thumbUrl }) {
    const id = uuidv4();
    await pool.execute(
      `INSERT INTO posts (_id, title, message, creator, creator_sub, tags, imageUrl, thumbUrl, likeCount)
       VALUES (?,?,?,?,?,?,?,?,0)`,
      [id, post_title||'', post_message||'', posted_by||'', creator_sub||'',
       JSON.stringify(post_tags||[]), imageUrl||null, thumbUrl||null]
    );
    return this.findById(id);
  }

  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM posts ORDER BY createdAt DESC');
    return rows.map(mapRow);
  }

  static async search(query) {
    const like = `%${query}%`;
    const [rows] = await pool.execute(
      `SELECT * FROM posts
       WHERE title LIKE ? OR message LIKE ? OR tags LIKE ?
       ORDER BY createdAt DESC LIMIT 50`,
      [like, like, like]
    );
    return rows.map(mapRow);
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM posts WHERE _id = ?', [id]);
    return rows.length ? mapRow(rows[0]) : null;
  }

  static async findByIdAndUpdate(id, data) {
    await pool.execute(
      `UPDATE posts SET title=?, message=?, creator=?, tags=?, imageUrl=?, thumbUrl=? WHERE _id=?`,
      [data.post_title, data.post_message, data.posted_by,
       JSON.stringify(data.post_tags||[]), data.imageUrl||null, data.thumbUrl||null, id]
    );
    return this.findById(id);
  }

  static async updateThumb(id, thumbUrl) {
    await pool.execute('UPDATE posts SET thumbUrl=? WHERE _id=?', [thumbUrl, id]);
  }

  static async findByIdAndRemove(id) {
    await pool.execute('DELETE FROM posts WHERE _id=?', [id]);
    return true;
  }

  static async updateLikes(id) {
    await pool.execute('UPDATE posts SET likeCount = likeCount + 1 WHERE _id=?', [id]);
    return this.findById(id);
  }
}

export default MessagePost;
