import { pool } from '../config/mysql.js';

const mapRow = (row) => ({
  id:         row.id,
  post_id:    row.post_id,
  author:     row.author,
  author_sub: row.author_sub,
  body:       row.body,
  createdAt:  row.createdAt,
});

class Comment {
  static async create({ post_id, author, author_sub, body }) {
    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, author, author_sub, body) VALUES (?,?,?,?)',
      [post_id, author, author_sub||'', body]
    );
    const [rows] = await pool.execute('SELECT * FROM comments WHERE id=?', [result.insertId]);
    return mapRow(rows[0]);
  }

  static async findByPost(post_id) {
    const [rows] = await pool.execute(
      'SELECT * FROM comments WHERE post_id=? ORDER BY createdAt ASC',
      [post_id]
    );
    return rows.map(mapRow);
  }

  static async delete(id, author_sub) {
    const [r] = await pool.execute(
      'DELETE FROM comments WHERE id=? AND author_sub=?',
      [id, author_sub]
    );
    return r.affectedRows > 0;
  }
}

export default Comment;
