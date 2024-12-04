const sqlstring = require("sqlstring");
const sanitizeHtml = require("sanitize-html");
// Cấu hình để loại bỏ mọi thẻ HTML và thuộc tính
const sanitizeHtmlConfig = {
  allowedTags: [], // Không cho phép bất kỳ thẻ HTML nào
  allowedAttributes: {}, // Không cho phép thuộc tính nào
  disallowedTagsMode: "discard", // Loại bỏ thẻ không được phép
};
// Loại bỏ toàn bộ thẻ HTML và thuộc tính
const removeHtmlTags = (str) => {
  return sanitizeHtml(str, sanitizeHtmlConfig);
};
// Thoát các ký tự đặc biệt trong HTML
const encodeHtmlEntities = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
// Thoát ký tự SQL injection
const escapeSqlInjection = (str) => {
  let sanitized = sqlstring.escape(str);
  if (sanitized.startsWith("'") && sanitized.endsWith("'")) {
    sanitized = sanitized.slice(1, -1);
  }
  return sanitized;
};
// Loại bỏ ký tự đặc biệt trong regex
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};
// Tự làm sạch chuỗi
const sanitizeString = (str) => {
  let sanitized = removeHtmlTags(str); // Loại bỏ toàn bộ thẻ HTML
  sanitized = encodeHtmlEntities(sanitized); // Mã hóa các ký tự HTML còn sót
  sanitized = escapeSqlInjection(sanitized); // Thoát ký tự SQL injection
  sanitized = escapeRegex(sanitized); // Thoát ký tự đặc biệt trong regex
  return sanitized;
};
// Làm sạch các trường cụ thể trong đối tượng
const sanitizeObject = (obj, fieldsToSanitize) => {
  fieldsToSanitize.forEach((field) => {
    if (typeof obj[field] === "string") {
      obj[field] = sanitizeString(obj[field]);
    }
  });
};

const sqlKeywords = [
  "select",
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "truncate",
  "--",
  ";",
  "/*",
  "*/",
  "@@",
  "@",
  "'",
  '"',
  "or",
  "and",
  "=",
  "1=1",
  "1'='1",
];

// Loại bỏ các từ khóa hoặc ký tự nguy hiểm liên quan đến SQL Injection
const removeSqlInjectionChars = (str) => {
  // Chuyển chuỗi sang chữ thường để kiểm tra nhất quán
  let sanitized = str.toLowerCase();

  // Loại bỏ các từ khóa SQL
  sqlKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  // Loại bỏ các ký tự nguy hiểm khác
  sanitized = sanitized.replace(/[;'"\\]/g, ""); // Loại bỏ ;, ', ", và \
  sanitized = sanitized.replace(/--/g, ""); // Loại bỏ comment SQL
  sanitized = sanitized.replace(/\b(=\s*'.*?')\b/g, ""); // Loại bỏ các biểu thức so sánh

  return sanitized;
};

// Hàm kiểm tra và làm sạch email
const validateAndSanitizeEmail = (email) => {
  if (typeof email !== "string") {
    throw new Error("Invalid input: Email must be a string.");
  }

  // Loại bỏ HTML tags
  email = removeHtmlTags(email);

  // Loại bỏ các từ khóa và ký tự nguy hiểm của SQL Injection
  email = removeSqlInjectionChars(email);

  // Sử dụng regex để kiểm tra định dạng email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format.");
  }

  // Mã hóa ký tự HTML còn sót lại
  email = encodeHtmlEntities(email);

  return email;
};

const sanitizeLoginInputs = (req, res, next) => {
  sanitizeObject(req.body, ["password"]);
  req.body.email = validateAndSanitizeEmail(req.body.email);
  next();
};

module.exports = {
  sanitizeObject,
  validateAndSanitizeEmail,
  sanitizeLoginInputs,
};
