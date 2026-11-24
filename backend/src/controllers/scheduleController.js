const { ScheduleModel } = require('../models/scheduleModel');
const { OutfitModel } = require('../models/outfitModel');

/**
 * Get all outfit schedules for current user
 * Optional query: date (YYYY-MM-DD), month (YYYY-MM)
 * GET /api/schedules
 */
const getSchedules = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { date, month } = req.query;

    const list = await ScheduleModel.getAll(userId, { date, month });

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get schedule by ID
 * GET /api/schedules/:id
 */
const getScheduleById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const schedule = await ScheduleModel.getById(id, userId);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    return res.status(200).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new outfit schedule
 * POST /api/schedules
 * Body: { outfit_id, event_name, schedule_date, notes }
 */
const createSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { outfit_id, event_name, schedule_date, notes } = req.body;

    if (!outfit_id || !event_name || !schedule_date) {
      return res.status(400).json({
        success: false,
        message: 'Outfit, nama acara/kegiatan, dan tanggal jadwal wajib diisi.'
      });
    }

    // Verify outfit ownership via OutfitModel
    const outfit = await OutfitModel.getById(outfit_id, userId);
    if (!outfit) {
      return res.status(404).json({
        success: false,
        message: 'Outfit yang dipilih tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    const formattedDate = typeof schedule_date === 'string' ? schedule_date.slice(0, 10) : new Date(schedule_date).toISOString().slice(0, 10);

    const schedule = await ScheduleModel.create({
      user_id: userId,
      outfit_id,
      event_name,
      schedule_date: formattedDate,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'Jadwal outfit berhasil ditambahkan!',
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an outfit schedule
 * PUT /api/schedules/:id
 */
const updateSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { outfit_id, event_name, schedule_date, notes } = req.body;

    // Check ownership
    const currentSchedule = await ScheduleModel.getById(id, userId);
    if (!currentSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    const newOutfitId = outfit_id !== undefined ? outfit_id : currentSchedule.outfit_id;
    const newEventName = event_name !== undefined ? event_name.trim() : currentSchedule.event_name;
    const newDate = schedule_date !== undefined ? (typeof schedule_date === 'string' ? schedule_date.slice(0, 10) : new Date(schedule_date).toISOString().slice(0, 10)) : currentSchedule.schedule_date;
    const newNotes = notes !== undefined ? (notes ? notes.trim() : null) : currentSchedule.notes;

    // If outfit_id changed, verify ownership
    if (outfit_id && outfit_id !== currentSchedule.outfit_id) {
      const outfit = await OutfitModel.getById(outfit_id, userId);
      if (!outfit) {
        return res.status(404).json({
          success: false,
          message: 'Outfit yang dipilih tidak valid.'
        });
      }
    }

    const updated = await ScheduleModel.update(id, userId, {
      outfit_id: newOutfitId,
      event_name: newEventName,
      schedule_date: newDate,
      notes: newNotes
    });

    return res.status(200).json({
      success: true,
      message: 'Jadwal outfit berhasil diperbarui!',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an outfit schedule
 * DELETE /api/schedules/:id
 */
const deleteSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await ScheduleModel.getById(id, userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal outfit tidak ditemukan atau Anda tidak memiliki akses.'
      });
    }

    await ScheduleModel.remove(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Jadwal outfit berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
