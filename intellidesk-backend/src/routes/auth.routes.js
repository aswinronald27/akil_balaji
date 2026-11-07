const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../data/db');
const { JWT_SECRET } = require('../middleware/auth.middleware');

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  const { email, password, selectedRole } = req.body;
  const users = db.getUsers();

  let user = null;
  if (email) {
    user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user && selectedRole) {
    user = users.find(u => u.role.toLowerCase() === selectedRole.toLowerCase());
  }

  if (!user) {
    // Default fallback to first demo user or mock user
    user = users[0] || {
      id: 'USR-001',
      name: 'Alex Chen',
      email: email || 'alex.chen@intellidesk.internal',
      role: selectedRole || 'Site Reliability Engineer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    };
  }

  // Password verification if password is provided and user has a password_hash
  if (password && user.password_hash) {
    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials. Password verification failed.',
      });
    }
  }

  // Sign cryptographically verified JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    status: 'success',
    token,
    user,
  });
});

// GET /api/v1/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.getUserByEmail(decoded.email) || decoded;
      return res.json({
        status: 'success',
        user,
      });
    } catch {
      // Fallback below
    }
  }

  const users = db.getUsers();
  return res.json({
    status: 'success',
    user: users[0],
  });
});

module.exports = router;
