import express from 'express';
import {
  getPosts, searchPosts, createPost, updatePost, deletePost,
  likePost, getUploadUrl,
  getComments, addComment, deleteComment,
} from '../controllers/posts.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Posts
router.get('/',             optionalAuth, getPosts);
router.get('/search',       optionalAuth, searchPosts);
router.post('/',            requireAuth,  createPost);
router.patch('/:id',        requireAuth,  updatePost);
router.delete('/:id',       requireAuth,  deletePost);
router.patch('/:id/likepost', optionalAuth, likePost);

// S3 pre-signed upload URL
router.post('/upload-url',  requireAuth,  getUploadUrl);

// Comments
router.get('/:id/comments',              optionalAuth, getComments);
router.post('/:id/comments',             requireAuth,  addComment);
router.delete('/:id/comments/:commentId',requireAuth,  deleteComment);

export default router;
