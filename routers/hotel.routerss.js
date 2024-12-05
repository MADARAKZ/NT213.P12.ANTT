const { Hotels } = require("../models");
const { uploadImage2 } = require("../middlewares/upload/upload-mutileImage.js");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const { checkExist } = require("../middlewares/validations/checkExist.js");
const express = require("express");
const {
  createHotel,
  getAllHotel,
  getAllHotelsAdmin,
  getDetailHotel,
  updateHotel,
  deleteHotel,
  searchIdHotelByName,
  getAllMaps,
} = require("../controllers/hotel.controllers.js");
var {
  csrfProtection,
  parseForm,
  cookieParser,
} = require("../middlewares/authen/csrfProtection");
const { authenticationMiddleware } = require("../middlewares/authen/token.js");
const { requireAdmin, requireChange} = require("../middlewares/authen/auth.middleware.js");
const HotelRouter = express.Router();
HotelRouter.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  uploadImage2,
  uploadCloud.array("hotel", 10),
  createHotel
);
// HotelRouter.post("/", createHotel);
HotelRouter.get("/getAllMap", getAllMaps);
HotelRouter.get("/", getAllHotel);
HotelRouter.get("/getAllHotel",parseForm,
    csrfProtection, authenticationMiddleware,requireAdmin, getAllHotelsAdmin);
HotelRouter.get("/:id", getDetailHotel);

HotelRouter.put(
  "/updateHotel/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireAdmin,
  updateHotel
);
HotelRouter.delete(
  "/deleteHotel/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireAdmin,
  deleteHotel
);
HotelRouter.post(
  "/getIdByHotelName",
  parseForm,
  csrfProtection,
  searchIdHotelByName
);

module.exports = {
  HotelRouter,
};
