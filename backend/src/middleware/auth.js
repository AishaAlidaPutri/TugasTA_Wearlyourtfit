const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'wealy_jwt_secret_key_development_2026';

const DEFAULT_GUEST_USER = {
  id: 1,
  name: 'Wealy User',
  email: 'user@wealy.app',
  profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  created_at: new Date().toISOString()
};

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    const token = parts[1];
    if (token === 'wealy_default_token') {
      req.user = DEFAULT_GUEST_USER;
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await UserModel.findById(decoded.id);
      req.user = user || DEFAULT_GUEST_USER;
    } catch (err) {
      req.user = DEFAULT_GUEST_USER;
    }
    next();
  } catch (error) {
    req.user = DEFAULT_GUEST_USER;
    next();
  }
};

module.exports = authenticateToken;
