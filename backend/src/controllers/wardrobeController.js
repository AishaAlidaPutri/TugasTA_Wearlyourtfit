const { WardrobeModel } = require('../models/wardrobeModel');
const cloudinaryService = require('../services/cloudinaryService');

const VALID_CATEGORIES = ['Atasan', 'Bawahan', 'Outerwear', 'Dress', 'Sepatu', 'Tas', 'Aksesori', 'Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Accessories'];

/**
 * Get all wardrobe items for the authenticated user
 * Query params: category, search
 * GET /api/wardrobe
 */
const getWardrobeItems = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { category, search } = req.query;

    const items = await WardrobeModel.getAll(userId, { category, search });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single wardrobe item by ID
 * GET /api/wardrobe/:id
 */
const getWardrobeItemById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let item = await WardrobeModel.getById(id, userId);
    if (!item) {
      item = await WardrobeModel.getById(parseInt(id, 10), userId);
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item pakaian tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new wardrobe item
 * POST /api/wardrobe
 */
const createWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, category, color, description, image, image_base64 } = req.body;

    if (!name || !category || !color) {
      return res.status(400).json({
        success: false,
        message: 'Nama pakaian, kategori, dan warna wajib diisi.'
      });
    }

    let imageBuffer = null;
    let originalName = 'wardrobe.jpg';

    if (req.file) {
      imageBuffer = req.file.buffer;
      originalName = req.file.originalname || 'wardrobe.jpg';
    } else if (image || image_base64) {
      const rawImage = image || image_base64;
      if (typeof rawImage === 'string' && (rawImage.startsWith('http://') || rawImage.startsWith('https://'))) {
        const newItem = await WardrobeModel.create({
          user_id: userId,
          name,
          category,
          color,
          image_url: rawImage,
          cloudinary_public_id: null,
          description
        });
        return res.status(201).json({
          success: true,
          message: 'Item pakaian berhasil ditambahkan!',
          data: newItem
        });
      } else if (typeof rawImage === 'string') {
        const base64Data = rawImage.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
        originalName = req.body.filename || 'wardrobe.jpg';
      }
    }

    if (!imageBuffer) {
      return res.status(400).json({
        success: false,
        message: 'Foto pakaian wajib diunggah.'
      });
    }

    // Upload image to Cloudinary (or fallback)
    let uploadResult;
    try {
      uploadResult = await cloudinaryService.uploadToCloudinary(
        imageBuffer,
        originalName,
        'wealy_wardrobe'
      );
    } catch (uploadError) {
      console.error('[Upload Error]:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Gagal mengunggah foto ke Cloudinary: ' + uploadError.message
      });
    }

    // Save to database via WardrobeModel
    const newItem = await WardrobeModel.create({
      user_id: userId,
      name,
      category,
      color,
      image_url: uploadResult.url,
      cloudinary_public_id: uploadResult.public_id,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'Item pakaian berhasil ditambahkan!',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing wardrobe item
 * PUT /api/wardrobe/:id
 */
const updateWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, category, color, description } = req.body;

    // Check item existence and ownership
    let currentItem = await WardrobeModel.getById(id, userId);
    if (!currentItem) {
      currentItem = await WardrobeModel.getById(parseInt(id, 10), userId);
    }
    if (!currentItem) {
      return res.status(404).json({
        success: false,
        message: 'Item pakaian tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    const newName = name !== undefined ? name.trim() : currentItem.name;
    const newCategory = category !== undefined ? category.trim() : currentItem.category;
    const newColor = color !== undefined ? color.trim() : currentItem.color;
    const newDescription = description !== undefined ? (description ? description.trim() : null) : currentItem.description;

    let newImageUrl = currentItem.image_url;
    let newPublicId = currentItem.cloudinary_public_id || null;

    // If new photo uploaded via multipart or base64 JSON
    const newImageRaw = req.body.image || req.body.image_base64;
    if (req.file || newImageRaw) {
      let imageBuffer = null;
      let uploadOriginalName = 'wardrobe_updated.jpg';

      if (req.file) {
        imageBuffer = req.file.buffer;
        uploadOriginalName = req.file.originalname || 'wardrobe_updated.jpg';
      } else if (typeof newImageRaw === 'string' && newImageRaw.startsWith('data:image/')) {
        const base64Data = newImageRaw.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
        uploadOriginalName = req.body.filename || 'wardrobe_updated.jpg';
      }

      if (imageBuffer) {
        try {
          const uploadResult = await cloudinaryService.uploadToCloudinary(
            imageBuffer,
            uploadOriginalName,
            'wealy_wardrobe'
          );

          if (currentItem.cloudinary_public_id) {
            await cloudinaryService.deleteFromCloudinary(currentItem.cloudinary_public_id);
          }

          newImageUrl = uploadResult.url;
          newPublicId = uploadResult.public_id;
        } catch (uploadError) {
          return res.status(500).json({
            success: false,
            message: 'Gagal mengunggah foto baru: ' + uploadError.message
          });
        }
      }
    }

    const updatedItem = await WardrobeModel.update(id, userId, {
      name: newName,
      category: newCategory,
      color: newColor,
      description: newDescription,
      image_url: newImageUrl,
      cloudinary_public_id: newPublicId
    });

    return res.status(200).json({
      success: true,
      message: 'Item pakaian berhasil diperbarui!',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a wardrobe item
 * DELETE /api/wardrobe/:id
 */
const deleteWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let item = await WardrobeModel.getById(id, userId);
    if (!item) {
      item = await WardrobeModel.getById(parseInt(id, 10), userId);
    }
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item pakaian tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    // Delete photo from Cloudinary
    if (item.cloudinary_public_id) {
      await cloudinaryService.deleteFromCloudinary(item.cloudinary_public_id);
    }

    // Delete via Model
    await WardrobeModel.remove(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Item pakaian dan foto terkait berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWardrobeItems,
  getWardrobeItemById,
  createWardrobeItem,
  updateWardrobeItem,
  deleteWardrobeItem
};
