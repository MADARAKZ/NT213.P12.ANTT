const express = require("express");
const {
  createCoupon,
  getAllCoupon,
  displayCoupon,
  editCoupon,
  deleteCoupon,
  getDetailCoupon,
  getCouponByCode,
  checkAndDeleteCouponByCode,
} = require("../controllers/coupons.controllers");
var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");
const { authenticationMiddleware } = require("../middlewares/authen/token.js");
const {
  requireAdmin,
  requireChange,
} = require("../middlewares/authen/auth.middleware.js");
const CouponRouter = express.Router();

CouponRouter.post(
  "/create",
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  requireAdmin,
  createCoupon
);
CouponRouter.get(
  "/getAllCoupon",
  authenticationMiddleware,
  requireAdmin,
  parseForm,
  csrfProtection,
  getAllCoupon
);
CouponRouter.get(
  "/getDetailCoupon/:id",
  parseForm,
  csrfProtection,
  getDetailCoupon
);

CouponRouter.get("/manageCoupon", parseForm, csrfProtection, displayCoupon);
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
CouponRouter.post("/checkanddelete/:code", checkAndDeleteCouponByCode);
module.exports = {
  CouponRouter,
};
