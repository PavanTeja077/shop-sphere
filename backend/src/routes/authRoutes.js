import express from 'express';
import { registerUser, loginUser, getCurrentUser, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', getCurrentUser);

export default router;
