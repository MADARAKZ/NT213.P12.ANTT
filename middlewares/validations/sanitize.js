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
module.exports = { sanitizeObject };
