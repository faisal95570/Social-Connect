import MessagePost from '../models/postMessage.js';
import Comment     from '../models/comment.js';
import { getUploadPresignedUrl, publicUrl, thumbUrl, BUCKET } from '../config/s3.js';
import { v4 as uuidv4 } from 'uuid';

/* ── GET /posts ─────────────────────────────────────────── */
export const getPosts = async (req, res) => {
  try {
    const posts = await MessagePost.findAll();
    res.json(posts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── GET /posts/search?q= ───────────────────────────────── */
export const searchPosts = async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json([]);
  try {
    const posts = await MessagePost.search(q.trim());
    res.json(posts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── POST /posts ────────────────────────────────────────── */
export const createPost = async (req, res) => {
  try {
    const post = await MessagePost.create({
      ...req.body,
      posted_by:   req.user?.username || req.body.posted_by,
      creator_sub: req.user?.sub      || '',
    });
    res.status(201).json(post);
  } catch (e) { res.status(409).json({ message: e.message }); }
};

/* ── PATCH /posts/:id ───────────────────────────────────── */
export const updatePost = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await MessagePost.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (existing.creator_sub && existing.creator_sub !== req.user?.sub)
      return res.status(403).json({ message: 'Not your post' });
    const updated = await MessagePost.findByIdAndUpdate(id, req.body);
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── DELETE /posts/:id ──────────────────────────────────── */
export const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await MessagePost.findById(id);
    if (!existing) return res.status(404).json({ message: 'Post not found' });
    if (existing.creator_sub && existing.creator_sub !== req.user?.sub)
      return res.status(403).json({ message: 'Not your post' });
    await MessagePost.findByIdAndRemove(id);
    res.json({ message: 'Post deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── PATCH /posts/:id/likepost ──────────────────────────── */
export const likePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await MessagePost.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const updated = await MessagePost.updateLikes(id);
    res.json(updated);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── POST /posts/upload-url  (S3 presigned URL) ─────────── */
export const getUploadUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) return res.status(400).json({ message: 'filename and contentType required' });
    const ext = filename.split('.').pop();
    const key = `posts/${uuidv4()}.${ext}`;
    const uploadUrl = await getUploadPresignedUrl(key, contentType);
    res.json({ uploadUrl, key, publicUrl: publicUrl(key), thumbUrl: thumbUrl(key) });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── GET  /posts/:id/comments ───────────────────────────── */
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.findByPost(req.params.id);
    res.json(comments);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── POST /posts/:id/comments ───────────────────────────── */
export const addComment = async (req, res) => {
  try {
    const { body } = req.body;
    if (!body?.trim()) return res.status(400).json({ message: 'Comment body required' });
    const comment = await Comment.create({
      post_id:    req.params.id,
      author:     req.user?.username || 'Anonymous',
      author_sub: req.user?.sub      || '',
      body:       body.trim(),
    });
    res.status(201).json(comment);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

/* ── DELETE /posts/:id/comments/:commentId ──────────────── */
export const deleteComment = async (req, res) => {
  try {
    const ok = await Comment.delete(req.params.commentId, req.user?.sub);
    if (!ok) return res.status(403).json({ message: 'Cannot delete this comment' });
    res.json({ message: 'Comment deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
};
