const multer = require('multer');

// Store in memory buffer so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic'];
  if (allowedMimes.includes(file.mimetype.toLowerCase()) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya format gambar yang diperbolehkan (JPG, PNG, WEBP).'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter,
});

module.exports = upload;
