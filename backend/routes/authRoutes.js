import express from 'express';
import { register, login, forgotPassword } from '../controllers/authController.js';
import {
  googleAuthStatus,
  googleAuth,
  googleAuthCallback,
} from '../controllers/googleAuthController.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', forgotPassword);

router.get('/google/config', googleAuthStatus);
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

export default router;
