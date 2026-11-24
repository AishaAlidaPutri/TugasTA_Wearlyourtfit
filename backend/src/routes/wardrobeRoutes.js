const express = require('express');
const router = express.Router();
const wardrobeController = require('../controllers/wardrobeController');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// All wardrobe routes require authentication
router.use(authenticateToken);

router.get('/', wardrobeController.getWardrobeItems);
router.get('/:id', wardrobeController.getWardrobeItemById);
router.post('/', upload.single('image'), wardrobeController.createWardrobeItem);
router.put('/:id', upload.single('image'), wardrobeController.updateWardrobeItem);
router.delete('/:id', wardrobeController.deleteWardrobeItem);

module.exports = router;
