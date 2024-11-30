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
} = require("../controllers/room.controller");

var { csrfProtection, parseForm } = require("../middlewares/authen/csrfProtection"); 
const { authenticateToken } = require("../middlewares/authen/auth.middleware");

const { checkExist } = require("../middlewares/validations/checkExist");
const roomRouter = express.Router();
roomRouter.post("/",parseForm, csrfProtection, uploadImage,uploadCloud.array("room", 10), createRoom);
roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getDetailRoom);

roomRouter.put("/:id", parseForm, csrfProtection,authenticateToken, checkExist(Room),updateRoom);
roomRouter.delete("/:id",parseForm, csrfProtection, authenticateToken,checkExist(Room), deleteRoom);

module.exports = {
  roomRouter,
};
