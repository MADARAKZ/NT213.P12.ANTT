const express = require("express");
const urlImageHotel = express.Router();
const { deleteImageMiddleware } = require("../middlewares/upload/delete-image");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const { uploadImage2 } = require("../middlewares/upload/upload-mutileImage.js");
const {
  createUrlImageHotel,
  getUrlImageHotelById,
  deleteUrlImageHotel,
  updateUrlImageHotel,
  getAllUrlImageHotel,
} = require("../controllers/urlimagehotel.controller");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");

// Create a new UrlImageHotel
urlImageHotel.post(
  "/",
  parseForm,
  uploadImage2,
  csrfProtection,
  uploadCloud.array("hotel", 10),
  createUrlImageHotel
);

// Get UrlImageHotel by ID
urlImageHotel.get("/", getUrlImageHotelById);
// Update UrlImageHotel by ID
urlImageHotel.put("/:id", parseForm, csrfProtection, updateUrlImageHotel);

// Delete UrlImageHotel by ID
urlImageHotel.delete(
  "/",
  parseForm,
  csrfProtection,
  deleteImageMiddleware,
  deleteUrlImageHotel
);

urlImageHotel.get("/getAllHotelImg", getAllUrlImageHotel);

module.exports = {
  urlImageHotel,
};
