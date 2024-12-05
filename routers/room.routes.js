const express = require("express");
const { Room } = require("../models");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const { uploadImage } = require("../middlewares/upload/upload-image");
const {
  createRoom,
  deleteRoom,
  getAllRoom,
  getDetailRoom,
  updateRoom,
  getDetailRoomByHotelAndName
} = require("../controllers/room.controller");

var { csrfProtection, parseForm } = require("../middlewares/authen/csrfProtection"); 
const { authenticationMiddleware } = require("../middlewares/authen/token");
const { requireAdmin, requireChange} = require("../middlewares/authen/auth.middleware.js");
const { checkExist } = require("../middlewares/validations/checkExist");
const roomRouter = express.Router();
roomRouter.post("/",parseForm, csrfProtection,authenticationMiddleware, requireChange ,uploadCloud.array("room", 10), createRoom);
roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getDetailRoom);
roomRouter.post("/getByRoomAndHotel",getDetailRoomByHotelAndName);

roomRouter.put("/:id", parseForm, csrfProtection,authenticationMiddleware,requireChange, updateRoom);
roomRouter.delete("/:id",parseForm, csrfProtection, authenticationMiddleware,requireChange, deleteRoom);

module.exports = {
  roomRouter,
};
