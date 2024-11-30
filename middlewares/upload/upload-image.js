const mkdirp = require("mkdirp");
const multer = require("multer");
const path = require("path");

// Tạo middleware uploadImage
const uploadImage = (type) => {
  // Tạo thư mục nếu chưa tồn tại
  const dir = `./public/image/${type}`;
  mkdirp.sync(dir);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir); // Đặt nơi lưu tệp
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9); // Tạo tên tệp duy nhất
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Đổi tên tệp và giữ lại phần mở rộng
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước tệp tối đa là 5MB
    fileFilter: function (req, file, cb) {
      // Danh sách các phần mở rộng hợp lệ
      const allowedExtensions = [".png", ".jpg", ".jpeg"];
      const fileExtension = path.extname(file.originalname).toLowerCase(); // Lấy phần mở rộng tệp

      // Kiểm tra xem phần mở rộng có hợp lệ không
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // Cho phép tải lên nếu tệp hợp lệ
      } else {
        cb(new Error("Only image files (.png, .jpg, .jpeg) are allowed.")); // Nếu tệp không hợp lệ
      }
    },
  });

  return (req, res, next) => {
    upload.single(type)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Xử lý lỗi từ multer
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // Xử lý lỗi khác
        return res
          .status(500)
          .json({ error: "Internal Server Error", details: err.message });
      }
      next(); // Tiếp tục xử lý nếu không có lỗi
    });
  };
};

module.exports = {
  uploadImage,
};
