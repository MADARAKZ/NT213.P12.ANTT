const express = require("express");
const urlImageRoom = express.Router();
const { uploadImage2 } = require("../middlewares/upload/upload-mutileImage.js");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const {
  deleteImageMiddleware,
} = require("../middlewares/upload/delete-image.js");
const {
  createUrlImageRoom,
  getUrlImageRoomById,
  updateUrlImageRoom,
  deleteUrlImageRoom,
  getAllUrlImageRoom,
} = require("../controllers/urlImageRoom.controller.js");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");
// Create a new UrlImageHotel
urlImageRoom.post(
  "/",
  parseForm,
  uploadImage2,
  csrfProtection,
  uploadCloud.array("room", 10),
  createUrlImageRoom
);

// Get UrlImageHotel by ID
urlImageRoom.get("/", getUrlImageRoomById);

urlImageRoom.get("/getAllUrlImageRoom", getAllUrlImageRoom);

urlImageRoom.put("/:id", csrfProtection, updateUrlImageRoom);

// Delete UrlImageHotel by ID
urlImageRoom.delete(
  "/:id",
  parseForm,
  deleteImageMiddleware,
  csrfProtection,
  deleteUrlImageRoom
);

module.exports = {
  urlImageRoom,
};
