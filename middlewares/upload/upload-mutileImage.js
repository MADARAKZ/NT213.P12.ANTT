// middlewares/uploadCloud.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const fileType = require("file-type");
const c = require("config");
require("dotenv").config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Tạo storage cho multer với Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ["jpg", "png"],
  params: {
    folder: "LastingTrip", // Tên thư mục trên Cloudinary
  },
});

// Middleware multer để xử lý upload
const uploadCloud = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file (5MB)
  fileFilter: async (req, file, cb) => {
    try {
      // Kiểm tra MIME type từ tệp
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.mimetype)) {
        console.log(file.mimetype);
        return cb(new Error("Chỉ chấp nhận tệp .jpg và .png"));
      }

      // Kiểm tra Magic number (hàm file-type) để xác minh tệp là hình ảnh
      const fileTypeResult = await fileType.fromBuffer(file.buffer);
      if (!fileTypeResult || !allowedTypes.includes(fileTypeResult.mime)) {
        console.log("Magic number: ", fileTypeResult);
        return cb(new Error("Tệp không phải là một hình ảnh hợp lệ"));
      }

      // Đảm bảo rằng tệp không có mã độc hay khả năng RCE
      const fileExtension = file.originalname.split(".").pop().toLowerCase();
      if (["php", "exe", "js", "html", "sh"].includes(fileExtension)) {
        return cb(new Error("Không thể tải lên tệp có khả năng chứa mã độc"));
      }

      // Nếu tệp hợp lệ, tiếp tục
      cb(null, true);
    } catch (err) {
      cb(err); // Nếu có lỗi, trả về lỗi
    }
  },
});

// Middleware for single file upload with dynamic field name
const uploadImageToCloudinarySingle = (fieldName) => {
  return (req, res, next) => {
    uploadCloud.single(fieldName)(req, res, (err) => {
      if (err) {
        console.log(err);
        // Handle error if any
        return res.status(400).json({ error: err.message });
      }

      // File is valid, proceed to the next middleware
      next();
    });
  };
};

// Middleware upload hình ảnh lên Cloudinary
const uploadImageToCloudinaryArray = (fieldName, maxCount) => {
  return (req, res, next) => {
    uploadCloud.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.log(err);
        // Xử lý lỗi nếu có
        return res.status(400).json({ error: err.message });
      }

      // Các tệp hợp lệ, tiếp tục xử lý
      next();
    });
  };
};

module.exports = {
  uploadImageToCloudinaryArray,
  uploadImageToCloudinarySingle,
};
