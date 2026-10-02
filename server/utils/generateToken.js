const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || 'supersecretjwtkey_techvault_2026',
    {
      expiresIn: '30d',
    }
  );
};

module.exports = { generateToken };
