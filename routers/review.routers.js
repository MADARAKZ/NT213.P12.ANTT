const express = require("express");
const { Reviews } = require("../models");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const {
  createReview,
  deleteReview,
  getAllReview,
  updateReview,
  getFullReview,
} = require("../controllers/reviews.controllers");
const { authenticateToken } = require("../middlewares/authen/auth.middleware");
const { checkExist } = require("../middlewares/validations/checkExist");
const { uploadImage } = require("../middlewares/upload/upload-image");
const ReviewRouter = express.Router();

ReviewRouter.post(
  "/create",
  authenticateToken,
  uploadCloud.single("file"),
  createReview
);
ReviewRouter.get("/", getAllReview);
ReviewRouter.put("/:id", checkExist(Reviews), updateReview);
ReviewRouter.delete("/:id", checkExist(Reviews), deleteReview);
ReviewRouter.get("/getFullReview", getFullReview);
module.exports = {
  ReviewRouter,
};
