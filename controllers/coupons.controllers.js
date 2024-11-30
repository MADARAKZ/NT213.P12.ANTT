const { Coupons } = require("../models");
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const crypto = require("crypto");

const { sanitizeObject } = require("../middlewares/validations/sanitize"); // Import sanitizeObject

const createCoupon = [
  // Validate các trường
  body("code")
    .trim()
    .optional() // Đánh dấu là tùy chọn vì có thể tạo mã ngẫu nhiên
    .isLength({ max: 50 })
    .withMessage("Coupon code must not exceed 50 characters"),

  body("percent")
    .notEmpty()
    .withMessage("Discount percent is required")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percent must be between 0 and 100"),

  body("begin")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be in valid date format"),

  body("end")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be in valid date format")
    .custom((end, { req }) => {
      const begin = req.body.begin;
      if (new Date(end) <= new Date(begin)) {
        throw new Error("End date must be after the start date");
      }
      return true;
    }),

  // Xử lý sau khi validate
  async (req, res) => {
    // Sanitize request body
    sanitizeObject(req.body, ["code", "percent", "begin", "end"]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let { code, percent, begin, end } = req.body;

    try {
      // Tạo chuỗi mã hóa ngẫu nhiên nếu code không được cung cấp
      if (!code) {
        const randomBytes = crypto.randomBytes(8).toString("hex");
        code = `CPN-${randomBytes.toUpperCase()}`;
      }

      // Tạo coupon mới
      const newCoupon = await Coupons.create({
        code,
        percent,
        begin,
        end,
      });

      // Trả về phản hồi thành công
      return res.status(201).json({
        message: "Coupon created successfully",
        coupon: newCoupon,
      });
    } catch (error) {
      console.error("Error creating coupon:", error);

      // Phản hồi lỗi server
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
];
const getAllCoupon = async (req, res) => {
  try {
    const couponList = await Coupons.findAll();
    res.status(200).json(couponList);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const displayCoupon = async (req, res) => {
  try {
    const coupon = await Coupons.findAll({ raw: true });
    res.render("coupons", { datatable: coupon });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
const editCoupon = async (req, res) => {
  console.log("10");
  try {
    const couponId = req.params.id;
    const { code, percent, start, end } = req.body;
    const detailCoupon = await Coupons.findOne({
      where: {
        id: couponId,
      },
    });
    if (!detailCoupon) {
      res.status(400).send({
        status: `error`,
        message: `User with id ${id}  not found`,
      });
    }
    if (code) detailCoupon.code = code;
    if (percent) detailCoupon.percent = percent; // Chỉnh sửa tại đây
    if (start) detailCoupon.start = start;
    if (end) detailCoupon.end = end;
    const updateCoupon = await detailCoupon.save();
    if (!updateCoupon)
      res.status(400).send({
        error: `error`,
        message: `Data fail to ${id} update`,
      });
    res.status(200).send({ updateCoupon }); // Gửi lại detailUser sau khi đã cập nhật thành công
  } catch (error) {
    res.status(500).send(error);
  }
};
const deleteCoupon = (req, res) => {
  try {
    const couponId = req.params.id;
    Coupons.destroy({ where: { id: couponId } });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDetailCoupon = async (req, res) => {
  console.log("3");
  try {
    const detailCoupon = await Coupons.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send(detailCoupon);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getCouponByCode = async (req, res) => {
  try {
    const couponCode = req.params.code;
    const coupon = await Coupons.findOne({
      where: {
        code: couponCode,
      },
    });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  createCoupon,
  getAllCoupon,
  displayCoupon,
  editCoupon,
  deleteCoupon,
  getDetailCoupon,
  getCouponByCode,
};
