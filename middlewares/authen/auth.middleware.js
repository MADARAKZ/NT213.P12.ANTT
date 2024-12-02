const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ACCESS_TOKEN; // Use environment variable for secret
require('dotenv').config();
// Middleware để xác thực người dùng
async function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken; // Ensure this line correctly reads the cookie
  const refreshToken = req.cookies.refreshToken;
  console.log(">>>>TOKEN het han<<<<<<", refreshToken)
  if (token)
  {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token không hợp lệ.' });
      req.user = user;
      next();
    }); 
  }else{
    if(refreshToken == null){
      return res.status(401).json({message: 'Phiên đăng nhập hết hạn.'});
    }
    else{
    try{
      const refeshTokendecode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN);

      const newAccessToken = await RefreshToken(refeshTokendecode.userId)
      console.log("token moi trong cookie",newAccessToken)

      res.cookie('accessToken', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 phút
      });
      console.log("Da refresh token")
      req.user = jwt.verify(newAccessToken, JWT_SECRET);
      next();
    } catch (refreshError){
      return res.status(401).json({message: 'Phiên đăng nhập không hợp lệ, hãy đăng nhập lại'})
    }}
  }
}

async function RefreshToken(userId) {
  const user = await User.findOne({ where: { id: userId } });
  console.log("Useerr token",user)
  if(!user)
  {
    throw new Error("Người dùng không tồn tại");
  }

  const newAccessToken = jwt.sign(
    { userId: user.id, type: user.type},
    process.env.ACCESS_TOKEN,
    { expiresIn: "15m" }
  )
  console.log("Token moi,", newAccessToken)
  return newAccessToken;
}

// Middleware để kiểm tra vai trò admin
function requireAdmin(req, res, next) {
  if (req.user.type !== 'admin') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản quản lý để thực hiện.' });
  }
  next();
}

// Middleware để kiểm tra vai trò admin
function requireCustomer(req, res, next) {
  if (req.user.type !== 'client') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản "Khách hàng" để thực hiện.' });
  }
  next();
}

function requireOwner(req, res, next) {
  if (req.user.type !== 'owner') {
    return res.status(403).json({ message: 'Vui lòng đăng nhập tài khoản Owner để thực hiện.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, requireCustomer, requireOwner };