const { getToken } = require('../controllers/authController');

function authenticate(req, res, next) {
    if (!getToken()) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.token = getToken();
    next();
}

module.exports = { authenticate };
