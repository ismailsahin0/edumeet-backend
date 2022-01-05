const admin = require('../api/firebase')
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (req, res, next) => {
  try {
    if (req.path == '/usr/verify' || req.path == '/usr/toupdatepassword' || req.path == '/' || req.path.slice(0, 11) == '/userimages') {
      req.user = 'verify or toupdatepassword';
      return next();
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
      if (token == 'edumeet') {
        req.user = 'login or register';
        return next();
      }
      const decodeValue = await admin.auth().verifyIdToken(token);
      if (decodeValue || token == 'edumeet') {
        req.user = decodeValue;
        return next();
      }
      return res.json({ message: 'Un authorize' })
    } catch (error) {
      return res.json({ message: error });
    }

  } catch {
    res.status(401).json({
      error: new Error('Invalid request!'),
    });
  }
};
