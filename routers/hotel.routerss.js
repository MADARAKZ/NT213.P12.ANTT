const uploadCloud = require("../middlewares/upload/cloudinary.config");
const express = require("express");
const {
  createHotel,
  getAllHotel,
  getAllHotelsAdmin,
  getDetailHotel,
  updateHotel,
  getHotelOfOwner,
  deleteHotel,
  searchIdHotelByName,
  getAllMaps,
} = require("../controllers/hotel.controllers.js");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");
const { authenticationMiddleware } = require("../middlewares/authen/token.js");
const {
  requireAdmin,
  requireOwner,
} = require("../middlewares/authen/auth.middleware.js");
const HotelRouter = express.Router();
HotelRouter.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireOwner,
  uploadCloud.array("hotel", 10),
  createHotel
);
// HotelRouter.post("/", createHotel);
HotelRouter.get("/getAllMap", getAllMaps);
HotelRouter.get("/", getAllHotel);
HotelRouter.get(
  "/getAllHotel",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireAdmin,
  getAllHotelsAdmin
);
HotelRouter.get("/:id", getDetailHotel);
HotelRouter.get(
  "/ownerHotel",
  authenticationMiddleware,
  requireOwner,
  getHotelOfOwner
);
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
