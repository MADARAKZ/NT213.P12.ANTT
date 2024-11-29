const { Booking } = require("../models");
const express = require("express");
const {
    createPaymentUrl,
    vnpayReturn
} = require("../controllers/vnpay.controller");
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
const vnpayRouter = express.Router();
vnpayRouter.post("/create-vnpay-url",parseForm, csrfProtection, createPaymentUrl);
vnpayRouter.get("/vnpay_return",vnpayReturn);

module.exports = {
    vnpayRouter,
}