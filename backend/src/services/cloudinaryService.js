const cloudinary = require('cloudinary').v2;
const streamifier = require('stream');
require('dotenv').config();

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('[Cloudinary] Configured successfully with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Cloudinary] Credentials not yet configured in .env. Operating in fallback data-URI/placeholder mode.');
}

/**
 * Upload an image buffer to Cloudinary (or fallback)
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} originalName - Original filename
 * @param {string} folder - Destination folder in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
const uploadToCloudinary = (buffer, originalName = 'wardrobe_item', folder = 'wealy_wardrobe') => {
  return new Promise((resolve, reject) => {
    if (!buffer || buffer.length === 0) {
      return reject(new Error('No image buffer provided for upload'));
    }

    if (isCloudinaryConfigured()) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || folder,
          resource_type: 'image',
          transformation: [
            { width: 1080, height: 1080, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url || result.url,
            public_id: result.public_id
          });
        }
      );

      // Create a readable stream from buffer and pipe to uploadStream
      const bufferStream = new streamifier.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    } else {
      // Fallback for development without Cloudinary credentials:
      // Produce an inline base64 data URI so the image displays perfectly in React Native
      const mime = 'image/jpeg';
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64}`;
      const mockPublicId = `mock_cloud_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      console.log('[Cloudinary Fallback] Stored image as data URI (Public ID:', mockPublicId, ')');
      resolve({
        url: dataUri,
        public_id: mockPublicId
      });
    }
  });
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<any>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;

  if (publicId.startsWith('mock_cloud_')) {
    console.log('[Cloudinary Fallback] Deleted mock image ID:', publicId);
    return { result: 'ok' };
  }

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('[Cloudinary] Image deleted successfully:', publicId, result);
      return result;
    } catch (error) {
      console.error('[Cloudinary Delete Error]:', error);
      // We don't throw to avoid blocking db cascade, but log warning
      return null;
    }
  }

  return null;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  isCloudinaryConfigured
};
