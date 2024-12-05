// middlewares/upload/upload-image.js

const mkdirp = require("mkdirp");
const multer = require("multer");
const path = require("path");
const FileType = require("file-type"); // Ensure file-type@16 is installed
const fs = require("fs");
const sanitize = require("sanitize-filename"); // To sanitize filenames

const uploadImage = (type) => {
  const dir = path.join(__dirname, "..", "..", "public", "image", type);
  mkdirp.sync(dir); // Create the directory if it doesn't exist

  // Store files in memory for validation
  const storage = multer.memoryStorage();

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // File size limit: 5 MB
    fileFilter: (req, file, cb) => {
      // Allowed MIME types
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

      // Check MIME type from the client
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only .png, .jpg, and .jpeg images are allowed."));
      }

      cb(null, true); // Proceed if MIME type is allowed
    },
  });

  // Middleware to handle the upload and subsequent validations
  return async (req, res, next) => {
    upload.single(type)(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors
        console.error("Multer Error:", err);
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // Other errors
        console.error("Upload Error:", err);
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        console.log("No file uploaded.");
        return res.status(400).json({ error: "No file uploaded." });
      }

      try {
        // Validate magic numbers (file signature) using file-type
        const detectedType = await FileType.fromBuffer(req.file.buffer);
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

        if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
          return res
            .status(400)
            .json({ error: "Invalid file type. Possible malicious file." });
        }

        // Sanitize the original filename to prevent directory traversal
        const sanitizedOriginalName = sanitize(req.file.originalname);

        // Generate a unique filename
        const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
        const filename =
          uniqueSuffix + path.extname(sanitizedOriginalName).toLowerCase();
        const filePath = path.join(dir, filename);

        // Write file to disk after validation
        await fs.promises.writeFile(filePath, req.file.buffer);

        // Attach file path and filename to the request for further processing
        req.file.path = `/images/${type}/${filename}`;
        req.file.filename = filename; // Add this line

        next(); // Proceed to the next middleware
      } catch (writeErr) {
        console.error("Error processing file:", writeErr);
        res.status(500).json({ error: "File upload failed. Please try again." });
      }
    });
  };
};

module.exports = { uploadImage };