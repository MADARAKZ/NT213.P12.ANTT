const express = require("express");
const {
  createCoupon,
  getAllCoupon,
  displayCoupon,
  editCoupon,
  deleteCoupon,
  getDetailCoupon,
  getCouponByCode,
} = require("../controllers/coupons.controllers");
var {
  csrfProtection,
  parseForm,
  cookieParser,
} = require("../middlewares/authen/csrfProtection");
const CouponRouter = express.Router();

CouponRouter.post("/create", parseForm, csrfProtection, createCoupon);
CouponRouter.get("/getAllCoupon", getAllCoupon);
CouponRouter.get("/getDetailCoupon/:id", getDetailCoupon);
CouponRouter.get("/manageCoupon", displayCoupon);
CouponRouter.put("/editCoupon/:id", parseForm, csrfProtection, editCoupon);
CouponRouter.delete(
  "/deleteCoupon/:id",
  parseForm,
  csrfProtection,
  deleteCoupon
);
CouponRouter.get(
  "/getByCode/:code",
  parseForm,
  csrfProtection,
  getCouponByCode
);
module.exports = {
  CouponRouter,
};
