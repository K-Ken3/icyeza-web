import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const generateResetToken = () => {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};
