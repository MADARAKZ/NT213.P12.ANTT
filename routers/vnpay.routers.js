const { Booking } = require("../models");
const express = require("express");
const {
    createPaymentUrl,
    vnpayReturn
} = require("../controllers/vnpay.controller");
const vnpayRouter = express.Router();
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
vnpayRouter.post("/create-vnpay-url", createPaymentUrl);
vnpayRouter.get("/vnpay_return",parseForm,csrfProtection,vnpayReturn);

module.exports = {
    vnpayRouter,
}