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
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
const RoomAmenityRouter = express.Router();

RoomAmenityRouter.get("/:roomId", getroomService);
RoomAmenityRouter.get("/amenities/:serviceId", getRoomHaveAmenities);
RoomAmenityRouter.get("/service/:id", getService);
RoomAmenityRouter.post("/",parseForm, csrfProtection, addRoomAmenity);
RoomAmenityRouter.put("/:id",parseForm, csrfProtection, updateRoomAmenity);
RoomAmenityRouter.delete("/:id",parseForm, csrfProtection, deleteRoomAmenity);
RoomAmenityRouter.post("/Room/amenities",parseForm, csrfProtection, searchRoomsByAmenities);
module.exports = {
  RoomAmenityRouter,
};
