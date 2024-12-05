const express = require("express");

const uploadCloud = require("../middlewares/upload/cloudinary.config");

const {
  createRoom,
  deleteRoom,
  getAllRoom,
  getDetailRoom,
  updateRoom,
} = require("../controllers/room.controller");

var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");
const { authenticationMiddleware } = require("../middlewares/authen/token");
const { requireChange } = require("../middlewares/authen/auth.middleware.js");

const roomRouter = express.Router();
roomRouter.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  uploadCloud.array("room", 10),
  createRoom
);
roomRouter.get("/", getAllRoom);
roomRouter.get("/:id", getDetailRoom);

roomRouter.put(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  updateRoom
);
roomRouter.delete(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  deleteRoom
);

module.exports = {
  roomRouter,
};
