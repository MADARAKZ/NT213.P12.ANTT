const { roomAmenities } = require("../models");

const express = require("express");
const {
  getroomService,
  addRoomAmenity,
  updateRoomAmenity,
  getService,
  deleteRoomAmenity,
  getRoomHaveAmenities,

  searchRoomsByAmenities,
} = require("../controllers/room_service.controller.js");
var {
  csrfProtection,
  parseForm,
  cookieParser,
} = require("../middlewares/authen/csrfProtection");
const RoomAmenityRouter = express.Router();
const {
  authenticationMiddleware,
  confirmServicePermissionForRoom,
  confirmOwnerOfRoom,
} = require("../middlewares/authen/token");
const {
  requireAdmin,
  requireChange,
} = require("../middlewares/authen/auth.middleware.js");
RoomAmenityRouter.get("/:roomId", getroomService);
RoomAmenityRouter.get("/amenities/:serviceId", getRoomHaveAmenities);
RoomAmenityRouter.get("/service/:id", getService);
RoomAmenityRouter.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  confirmOwnerOfRoom,
  addRoomAmenity
);
RoomAmenityRouter.put(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  confirmServicePermissionForRoom,
  updateRoomAmenity
);
RoomAmenityRouter.delete(
  "/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireChange,
  confirmServicePermissionForRoom,
  deleteRoomAmenity
);
RoomAmenityRouter.post(
  "/Room/amenities",
  parseForm,
  csrfProtection,
  searchRoomsByAmenities
);
module.exports = {
  RoomAmenityRouter,
};
