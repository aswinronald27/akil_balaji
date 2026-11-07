const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'intellidesk_jwt_secret_dev_key_2026';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Access denied. No authorization token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // If token is invalid or expired
    return res.status(403).json({
      status: 'error',
      message: 'Invalid or expired authentication token.',
    });
  }
};

module.exports = {
  authenticateToken,
  JWT_SECRET,
};

