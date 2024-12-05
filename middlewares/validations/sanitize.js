const sqlstring = require("sqlstring");

// Loại bỏ toàn bộ thẻ HTML và thuộc tính không hợp lệ
const removeHtmlTags = (input) => {
  if (typeof input !== "string") {
    return input; // Không xử lý nếu không phải chuỗi
  }
  return input.replace(/<\/?[^>]+(>|$)/g, ""); // Xóa thẻ HTML
};

// Thoát ký tự HTML để ngăn chặn XSS
const encodeHtmlEntities = (str) => {
  if (typeof str !== "string") {
    return str; // Không xử lý nếu không phải chuỗi
  }
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Thoát ký tự SQL để ngăn chặn SQL Injection
const escapeSqlInjection = (str) => {
  if (typeof str !== "string") {
    return str; // Không xử lý nếu không phải chuỗi
  }
  return sqlstring.escape(str).slice(1, -1); // Xóa dấu nháy đơn bao quanh
};

// Thoát ký tự đặc biệt trong Regex
const escapeRegex = (str) => {
  if (typeof str !== "string") {
    return str; // Không xử lý nếu không phải chuỗi
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Làm sạch chuỗi đầu vào (tích hợp tất cả các bước)
const sanitizeString = (str) => {
  if (typeof str !== "string") {
    return str; // Không xử lý nếu không phải chuỗi
  }
  let sanitized = removeHtmlTags(str); // Loại bỏ thẻ HTML
  sanitized = encodeHtmlEntities(sanitized); // Thoát ký tự HTML
  sanitized = escapeSqlInjection(sanitized); // Thoát ký tự SQL
  sanitized = escapeRegex(sanitized); // Thoát ký tự Regex
  return sanitized;
};

// Làm sạch và kiểm tra email
const validateAndSanitizeEmail = (email) => {
  if (typeof email !== "string") {
    throw new Error("Invalid input: Email must be a string.");
  }

  // Loại bỏ HTML tags
  email = removeHtmlTags(email);

  // Kiểm tra định dạng email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  return email;
};

// Làm sạch các trường trong đối tượng
const sanitizeObject = (obj, fieldsToSanitize) => {
  if (typeof obj !== "object" || obj === null) {
    throw new Error("Input must be an object.");
  }

  fieldsToSanitize.forEach((field) => {
    if (typeof obj[field] === "string") {
      obj[field] = sanitizeString(obj[field]);
    }
  });
};

// Middleware làm sạch dữ liệu đầu vào cho login
const sanitizeLoginInputs = (req, res, next) => {
  try {
    if (req.body.email) {
      req.body.email = validateAndSanitizeEmail(req.body.email);
    }
    next();
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Export các hàm
module.exports = {
  removeHtmlTags,
  encodeHtmlEntities,
  escapeSqlInjection,
  escapeRegex,
  sanitizeString,
  validateAndSanitizeEmail,
  sanitizeObject,
  sanitizeLoginInputs,
};
