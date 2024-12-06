const multer = require("multer");
const path = require("path");
const fileType = require("file-type");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "LastingTrip",
    format: async (req, file) => path.extname(file.originalname).substring(1), // Get file extension without '.'
    public_id: (req, file) => path.parse(file.originalname).name, // Use the original file name
  },
});

// Multer Middleware
const uploadCloud = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: async (req, file, cb) => {
    try {
      // Validate file extension
      const allowedExtensions = [".jpg", ".png", ".gif", ".jpeg"];
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        console.log("failed 1");
        return cb(new Error("Only .jpg and .png files are allowed"), false);
      }

      // Validate MIME type using `fileType` (if file.buffer exists)
      if (file.buffer) {
        const type = await fileType.fromBuffer(file.buffer);

        if (
          !type ||
          (type.mime !== "image/jpeg" &&
            type.mime !== "image/png" &&
            type.mime !== "image/gif" &&
            type.mime !== "image/jpg")
        ) {
          console.log("failed 2");
          return cb(new Error("Invalid file type"), false);
        }
      }

      cb(null, true); // File is valid
    } catch (err) {
      console.log("failed 3");
      cb(err, false);
    }
  },
});

module.exports = uploadCloud;
