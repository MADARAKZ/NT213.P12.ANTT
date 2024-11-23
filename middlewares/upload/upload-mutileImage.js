const mkdirp = require("mkdirp");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const allowedTypes = ["image", "document"]; // Define allowed types

const uploadImage2 = (type, maxCount) => {
  if (!allowedTypes.includes(type)) {
    throw new Error("Invalid upload type");
  }

  const uploadDir = path.join(__dirname, `../uploads/${type}`);
  mkdirp.sync(uploadDir);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir); // Set the destination directory
    },
    filename: function (req, file, cb) {
      const sanitizedFileName = file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      );
      const uniqueSuffix =
        Date.now() + "-" + crypto.randomBytes(4).toString("hex");
      cb(null, uniqueSuffix + "_" + sanitizedFileName); // Sanitize and rename the file
    },
  });

  const fileFilter = function (req, file, cb) {
    const allowedExtensions = [".png", ".jpg", ".jpeg"];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file extension"));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  });

  return (req, res, next) => {
    upload.array(type, maxCount)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).send({ error: err.message });
      } else if (err) {
        return res.status(400).send({ error: err.message });
      }
      next();
    });
  };
};

module.exports = {
  uploadImage2,
};
