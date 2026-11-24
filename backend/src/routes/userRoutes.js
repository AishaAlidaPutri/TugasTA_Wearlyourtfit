const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticateToken);

router.get('/me', userController.getProfile);
router.put('/me', upload.single('profile_image'), userController.updateProfile);

module.exports = router;
