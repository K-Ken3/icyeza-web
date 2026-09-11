import { v2 as cloudinary } from 'cloudinary';
import { mkdirSync, writeFileSync } from 'fs';
import { join, extname } from 'path';
import { randomBytes } from 'crypto';
import { config } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
});

const hasCloudinary = Boolean(
  config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret
);

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export const uploadImage = async ({ buffer, mimetype, originalname }, folder = 'flame-fork', publicBase = '') => {
  if (!allowedTypes.includes(mimetype)) {
    throw new AppError('Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed', 400);
  }

  if (hasCloudinary) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder, resource_type: 'image', overwrite: false }, (err, res) => {
          if (err) reject(new AppError('Image upload to Cloudinary failed', 500));
          else resolve(res);
        })
        .end(buffer);
    });
    return result.secure_url;
  }

  const uploadsDir = join(process.cwd(), 'uploads');
  mkdirSync(uploadsDir, { recursive: true });
  const ext = extname(originalname || '.png') || '.png';
  const filename = `${Date.now()}-${randomBytes(6).toString('hex')}${ext.toLowerCase()}`;
  writeFileSync(join(uploadsDir, filename), buffer);
  return `${publicBase}/uploads/${filename}`;
};

export default uploadImage;