const express = require("express");
const { Room } = require("../models");
const uploadCloud = require('../middlewares/upload/cloudinary.config')
const { uploadImage2 } = require("../middlewares/upload/upload-mutileImage.js");
const {
  createRoom,
  deleteRoom,
  getAllRoom,
  getDetailRoom,
  updateRoom,
} = require("../controllers/room.controller");
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
const { authenticate } = require("../middlewares/authen/authenticate");
const { authorize } = require("../middlewares/authen/authorize");
const { checkExist } = require("../middlewares/validations/checkExist");
const roomRouter = express.Router();
roomRouter.post("/",parseForm, csrfProtection, uploadCloud.array("room", 10), createRoom);
roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getDetailRoom);
roomRouter.put("/:id", parseForm, csrfProtection, checkExist(Room),updateRoom);
roomRouter.delete("/:id",parseForm, csrfProtection, checkExist(Room), deleteRoom);
module.exports = {
  roomRouter,
};
