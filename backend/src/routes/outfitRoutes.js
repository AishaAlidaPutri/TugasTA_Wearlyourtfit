const express = require('express');
const router = express.Router();
const outfitController = require('../controllers/outfitController');
const authenticateToken = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', outfitController.getOutfits);
router.get('/:id', outfitController.getOutfitById);
router.post('/', outfitController.createOutfit);
router.put('/:id', outfitController.updateOutfit);
router.delete('/:id', outfitController.deleteOutfit);

// Sub-resource outfit items
router.post('/:id/items', outfitController.addOutfitItem);
router.delete('/:id/items/:itemId', outfitController.removeOutfitItem);

module.exports = router;
