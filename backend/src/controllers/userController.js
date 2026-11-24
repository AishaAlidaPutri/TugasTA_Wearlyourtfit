const { UserModel } = require('../models/userModel');
const { WardrobeModel } = require('../models/wardrobeModel');
const { OutfitModel } = require('../models/outfitModel');
const { ScheduleModel } = require('../models/scheduleModel');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * Get profile of authenticated user
 * GET /api/users/me
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * PUT /api/users/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const newName = name !== undefined ? name.trim() : currentUser.name;
    let newProfileImage = currentUser.profile_image;

    // If new profile image uploaded
    if (req.file) {
      try {
        const uploadResult = await cloudinaryService.uploadToCloudinary(
          req.file.buffer,
          req.file.originalname,
          'wealy_avatars'
        );
        newProfileImage = uploadResult.url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengunggah foto profil: ' + uploadError.message
        });
      }
    }

    const updatedUser = await UserModel.update(userId, {
      name: newName,
      profile_image: newProfileImage
    });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Home Screen Dashboard Summary
 * GET /api/home/summary
 */
const getHomeSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Wardrobe items count via WardrobeModel
    const wardrobeCount = await WardrobeModel.count(userId);

    // 2. Outfits count via OutfitModel
    const outfitCount = await OutfitModel.count(userId);

    // 3. Today & upcoming outfit schedules via ScheduleModel
    const todayList = await ScheduleModel.getAll(userId, { date: todayStr });
    const todaySchedule = todayList.length > 0 ? todayList[0] : null;

    const upcomingList = await ScheduleModel.getUpcoming(userId, 2);
    const upcomingSchedule = upcomingList.find(s => s.schedule_date > todayStr) || upcomingList[0] || null;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          profile_image: req.user.profile_image
        },
        counts: {
          wardrobe: wardrobeCount,
          outfits: outfitCount
        },
        today_outfit: todaySchedule,
        upcoming_outfit: upcomingSchedule
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getHomeSummary
};
