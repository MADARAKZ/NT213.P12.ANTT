const jwt = require('jsonwebtoken');
const JWT_SECRET = "trancongtien"; // Use environment variable for secret

// Middleware để xác thực người dùng
function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken; // Ensure this line correctly reads the cookie
  if (token == null) return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
    req.user = user;
    next();
  });
}

// Middleware để kiểm tra vai trò admin
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản quản lý để thực hiện.' });
  }
  next();
}

// Middleware để kiểm tra vai trò admin
function requireCustomer(req, res, next) {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản "Khách hàng" để thực hiện.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireCustomer };