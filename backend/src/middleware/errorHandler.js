// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file foto terlalu besar. Maksimum 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Kesalahan upload foto: ${err.message}`
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
