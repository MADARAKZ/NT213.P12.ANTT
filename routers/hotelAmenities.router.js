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

HotelAmenityRouter.get("/:hotelId", getHotelAmenities);
HotelAmenityRouter.get("/amenities/:id", getHotelAmenitiesByID);
HotelAmenityRouter.post("/",parseForm, csrfProtection, addHotelAmenity);
HotelAmenityRouter.put("/:id",parseForm, csrfProtection, updateHotelAmenity);
HotelAmenityRouter.delete("/:id",parseForm, csrfProtection, deleteHotelAmenity);
HotelAmenityRouter.post("/hotel/amenities",parseForm, csrfProtection, searchHotelsByAmenities);
module.exports = {
  HotelAmenityRouter,
};
