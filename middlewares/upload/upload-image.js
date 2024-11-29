const mkdirp = require("mkdirp");
const multer = require("multer");

const uploadImage = (type) => {
  const made = mkdirp.sync(`./public/image/${type}`);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./public/image/${type}`); // Đặt nơi lưu tệp
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname); // Đổi tên tệp
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      // Danh sách các phần mở rộng hợp lệ
      const allowedExtensions = [".png", ".jpg", ".jpeg"];

      // Lấy phần mở rộng tệp
      const fileExtension = file.originalname.slice(-4).toLowerCase(); // Kiểm tra 4 ký tự cuối của tên tệp

      // Kiểm tra xem phần mở rộng có hợp lệ không
      if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // Cho phép tải lên nếu tệp hợp lệ
      } else {
        cb(new Error("Only image files (.png, .jpg, .jpeg) are allowed.")); // Nếu tệp không hợp lệ
      }
    },
  });

  return upload.single(type); // Chỉ tải lên một tệp mỗi lần
};

module.exports = {
  uploadImage,
};
