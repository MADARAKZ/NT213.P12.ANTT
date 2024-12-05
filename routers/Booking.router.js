const { Booking } = require("../models");
const { checkExist } = require("../middlewares/validations/checkExist.js");
const {
  requireAdmin,
  requireCustomer,
  requireOwner,
} = require("../middlewares/authen/auth.middleware");
const { authenticationMiddleware } = require("../middlewares/authen/token");

const express = require("express");
const {
  createBooking,
  getAllBooking,
  getDetailBooking,
  deleteBooking,
  getAvailability,
  getDetailBookingByHotelAndName,
} = require("../controllers/payment.controller");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");

const BookingRouter = express.Router();
BookingRouter.post(
  "/",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  createBooking
);
BookingRouter.get("/", getAllBooking);
BookingRouter.get(
  "/getDetail/:id",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  getDetailBooking
);
BookingRouter.get("/checkAvailability", getAvailability);
BookingRouter.post(
  "/getByHotelAndName",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  getDetailBookingByHotelAndName
);

BookingRouter.delete(
  "/:id",

  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireAdmin,
  checkExist(Booking),
  deleteBooking
);

module.exports = {
  BookingRouter,
};
