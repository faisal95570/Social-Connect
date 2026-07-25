import express from 'express';
import { register, confirm, login, logout, getProfile, updateProfile } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register',        register);
router.post('/confirm',         confirm);
router.post('/login',           login);
router.post('/logout',          logout);           // uses Access Token in header
router.get('/profile/:sub',     getProfile);
router.patch('/profile',        requireAuth, updateProfile);

export default router;
