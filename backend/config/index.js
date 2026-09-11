import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/flame_fork',
  jwtSecret: process.env.JWT_SECRET || 'flame_and_fork_dev_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  flutterwaveSecretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  flutterwavePublicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  flutterwaveWebhookHash: process.env.FLUTTERWAVE_WEBHOOK_HASH || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback',
};
