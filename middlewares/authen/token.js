
const jwt = require('jsonwebtoken');
const { Model } = require('sequelize');
const authMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken; 
    if (!token) {
        return res.status(401).json({
            message: 'Access token is missing. Please login.',
        });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, user) {
        if (err) {
            return res.status(401).json({ message: 'User is not authenticated' });
        }
        if (user.isAdmin) {
            next();
        } else {
            return res.status(403).json({
                message: 'User is not authorized',
            });
        }
    });
};

const authenticationMiddleware = (req, res, next) => {
    const token = req.cookies.accessToken; // Lấy token từ cookie
    if (!token) {
        return res.status(401).json({
            message: 'Access token is missing. Please login.',
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: 'Invalid or expired token. Please login again.',
            });
        }
        // Lưu thông tin user vào req để các middleware khác sử dụng
        req.user = decoded; 
        console.log('Decoded token:', decoded);
        if (req.body) {
            console.log('Request body:', req.body);
        }

        next();
    });
};
module.exports = { authMiddleware, authenticationMiddleware };