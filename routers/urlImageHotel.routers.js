const express = require("express");
const urlImageHotel = express.Router();
const { deleteImageMiddleware } = require("../middlewares/upload/delete-image");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const {
  createUrlImageHotel,
  getUrlImageHotelById,
  deleteUrlImageHotel,
  updateUrlImageHotel,
  getAllUrlImageHotel,
} = require("../controllers/urlimagehotel.controller");
const { requireChange } = require("../middlewares/authen/auth.middleware");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");
const { authenticationMiddleware } = require("../middlewares/authen/token.js");

// Create a new UrlImageHotel
// Create a new UrlImageHotel
urlImageHotel.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  uploadCloud.array("hotel", 10),
  createUrlImageHotel // Proceed to the controller if all validations pass
);

// Get UrlImageHotel by ID
urlImageHotel.get(
  "/",
  authenticationMiddleware,
  requireChange,
  getUrlImageHotelById
);
// Update UrlImageHotel by ID
urlImageHotel.put(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  updateUrlImageHotel
);

// Delete UrlImageHotel by ID
urlImageHotel.delete(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  deleteImageMiddleware,
  deleteUrlImageHotel
);

urlImageHotel.get("/getAllHotelImg", getAllUrlImageHotel);

module.exports = {
  urlImageHotel,
};
