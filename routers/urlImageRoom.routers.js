const express = require("express");
const urlImageRoom = express.Router();
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
const {
  authMiddleware,
  authenticationMiddleware,
} = require("../middlewares/authen/token.js");
const { requireChange } = require("../middlewares/authen/auth.middleware.js");
// Create a new UrlImageHotel
urlImageRoom.post(
  "/",
  parseForm,
  csrfProtection,
  uploadCloud.array("room", 10),
  createUrlImageRoom
);
urlImageRoom.get("/", getUrlImageRoomById);

urlImageRoom.get("/getAllUrlImageRoom", getAllUrlImageRoom);

urlImageRoom.put(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  updateUrlImageRoom
);

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
