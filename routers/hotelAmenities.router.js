const { HotelAmenities } = require("../models");

const express = require("express");
const {
  getHotelAmenities,
  addHotelAmenity,
  getHotelAmenitiesByID,
  updateHotelAmenity,
  deleteHotelAmenity,
  getHotelHaveAmenities,
  searchHotelsByAmenities,
} = require("../controllers/hotel_amenities.controller.js");
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
const HotelAmenityRouter = express.Router();
const { requireAdmin, requireChange} = require("../middlewares/authen/auth.middleware.js");
const { authenticationMiddleware } = require("../middlewares/authen/token");
HotelAmenityRouter.get("/:hotelId", getHotelAmenities);
HotelAmenityRouter.get("/amenities/:id", getHotelAmenitiesByID);
HotelAmenityRouter.post("/",parseForm, csrfProtection,authenticationMiddleware,requireChange, addHotelAmenity);
HotelAmenityRouter.put("/:id",parseForm, csrfProtection,authenticationMiddleware,requireChange, updateHotelAmenity);
HotelAmenityRouter.delete("/:id",parseForm, csrfProtection,authenticationMiddleware,requireChange, deleteHotelAmenity);
HotelAmenityRouter.post("/hotel/amenities",parseForm, csrfProtection, searchHotelsByAmenities);
module.exports = {
  HotelAmenityRouter,
};
