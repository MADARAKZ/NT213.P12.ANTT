const { Amenities } = require("../models");

const express = require("express");
const {
  createAmenity,
  getAllAmenity,
  getDetailAmenity,
  getAmenitysByType,
  //   updateAmenity,
  //   deleteAmenity,
} = require("../controllers/amenities.controller.js");
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
const AmenityRouter = express.Router();

AmenityRouter.post("/", parseForm, csrfProtection, createAmenity);
AmenityRouter.get("/", getAllAmenity);
AmenityRouter.get("/:id", getDetailAmenity);

// AmenityRouter.put("/:id", checkExist(Amenity), updateAmenity);
// AmenityRouter.delete("/:id", checkExist(Amenity), deleteAmenity);

module.exports = {
  AmenityRouter,
};
