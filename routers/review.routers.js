const express = require("express");
const { Reviews } = require("../models");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const {
  createReview,
  deleteReview,
  getAllReview,
  getFullReview,
} = require("../controllers/reviews.controllers");
const { authenticate } = require("../middlewares/authen/authenticate");
const { checkExist } = require("../middlewares/validations/checkExist");
const ReviewRouter = express.Router();

ReviewRouter.post(
  "/create",
  authenticate,
  uploadCloud.single("file"),
  createReview
);
ReviewRouter.get("/", getAllReview);
ReviewRouter.delete("/:id", checkExist(Reviews), deleteReview);
ReviewRouter.get("/getFullReview", getFullReview);
module.exports = {
  ReviewRouter,
};
