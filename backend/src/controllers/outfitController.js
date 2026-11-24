const { OutfitModel } = require('../models/outfitModel');
const { WardrobeModel } = require('../models/wardrobeModel');

/**
 * Get all outfits for current user
 * Query params: occasion, search
 * GET /api/outfits
 */
const getOutfits = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { occasion, search } = req.query;

    const outfits = await OutfitModel.getAll(userId, { occasion, search });

    return res.status(200).json({
      success: true,
      count: outfits.length,
      data: outfits
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single outfit by ID with its items
 * GET /api/outfits/:id
 */
const getOutfitById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const outfit = await OutfitModel.getById(id, userId);

    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    return res.status(200).json({
      success: true,
      data: outfit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new outfit
 * POST /api/outfits
 * Body: { name, occasion, description, item_ids: [1, 2, 3] }
 */
const createOutfit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, occasion, description, item_ids } = req.body;

    if (!name || !occasion) {
      return res.status(400).json({
        success: false,
        message: 'Nama outfit dan occasion wajib diisi.'
      });
    }

    const itemIdsArray = Array.isArray(item_ids) ? item_ids : (item_ids ? JSON.parse(item_ids) : []);

    const newOutfit = await OutfitModel.create({
      user_id: userId,
      name,
      occasion,
      description
    }, itemIdsArray);

    return res.status(201).json({
      success: true,
      message: 'Outfit berhasil disimpan!',
      data: newOutfit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing outfit
 * PUT /api/outfits/:id
 */
const updateOutfit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, occasion, description, item_ids } = req.body;

    // Check ownership
    const currentOutfit = await OutfitModel.getById(id, userId);
    if (!currentOutfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    const newName = name !== undefined ? name.trim() : currentOutfit.name;
    const newOccasion = occasion !== undefined ? occasion.trim() : currentOutfit.occasion;
    const newDescription = description !== undefined ? (description ? description.trim() : null) : currentOutfit.description;

    const itemIdsArray = item_ids !== undefined 
      ? (Array.isArray(item_ids) ? item_ids : JSON.parse(item_ids))
      : undefined;

    const updatedOutfit = await OutfitModel.update(id, userId, {
      name: newName,
      occasion: newOccasion,
      description: newDescription
    }, itemIdsArray);

    return res.status(200).json({
      success: true,
      message: 'Outfit berhasil diperbarui!',
      data: updatedOutfit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an outfit
 * DELETE /api/outfits/:id
 */
const deleteOutfit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await OutfitModel.getById(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    await OutfitModel.remove(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Outfit berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an individual item to outfit
 * POST /api/outfits/:id/items
 */
const addOutfitItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { wardrobe_item_id } = req.body;

    if (!wardrobe_item_id) {
      return res.status(400).json({
        success: false,
        message: 'wardrobe_item_id wajib disertakan.'
      });
    }

    const outfit = await OutfitModel.getById(id, userId);
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit tidak ditemukan.' });
    }

    const item = await WardrobeModel.getById(wardrobe_item_id, userId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item pakaian tidak ditemukan.' });
    }

    await OutfitModel.addItem(id, wardrobe_item_id);

    return res.status(201).json({
      success: true,
      message: 'Item pakaian berhasil ditambahkan ke outfit!',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an item from an outfit
 * DELETE /api/outfits/:id/items/:itemId
 */
const removeOutfitItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id, itemId } = req.params;

    const outfit = await OutfitModel.getById(id, userId);
    if (!outfit) {
      return res.status(404).json({ success: false, message: 'Outfit tidak ditemukan.' });
    }

    await OutfitModel.removeItem(id, itemId);

    return res.status(200).json({
      success: true,
      message: 'Item berhasil dihapus dari outfit.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOutfits,
  getOutfitById,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  addOutfitItem,
  removeOutfitItem
};
