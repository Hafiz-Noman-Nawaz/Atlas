import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

// Configure Cloudinary
if (isConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Upload] ☁️ Cloudinary storage configured successfully.');
} else {
  console.log('[Upload] Cloudinary credentials not detected. Using local uploads directory fallback (/uploads).');
}

/**
 * Uploads a file buffer either to Cloudinary or to local uploads folder.
 */
export async function uploadFileBuffer(buffer, originalName, mimetype) {
  if (isConfigured()) {
    return new Promise((resolve, reject) => {
      const isImage = mimetype.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'atlas_chat_uploads',
          resource_type: resourceType,
          public_id: `${Date.now()}_${path.parse(originalName).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            name: originalName,
            type: mimetype,
            size: result.bytes || buffer.length,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Local storage fallback
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalName) || '';
  const uniqueName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}${ext}`;
  const filePath = path.join(uploadsDir, uniqueName);

  await fs.promises.writeFile(filePath, buffer);

  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
  const fileUrl = `${serverUrl}/uploads/${uniqueName}`;

  return {
    url: fileUrl,
    name: originalName,
    type: mimetype,
    size: buffer.length,
  };
}
