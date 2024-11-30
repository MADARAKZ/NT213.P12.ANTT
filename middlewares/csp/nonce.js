const crypto = require("crypto");

const nonceMiddleware = (req, res, next) => {
  // Tạo nonce ngẫu nhiên (16 bytes) và chuyển đổi thành base64
  res.locals.nonce = crypto.randomBytes(16).toString("base64");
  next();
};

module.exports = nonceMiddleware;
