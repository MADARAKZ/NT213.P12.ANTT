const { Amenities } = require("../models");

const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const { sanitizeObject } = require("../middlewares/validations/sanitize");

const createAmenity = [
  // Làm sạch dữ liệu đầu vào
  (req, res, next) => {
    sanitizeObject(req.body, ["name", "Aclass"]);
    next();
  },

  // Validate các trường
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Amenity name is required")
    .isLength({ max: 100 })
    .withMessage("Amenity name must not exceed 100 characters"),

  body("Aclass").trim().notEmpty().withMessage("Amenity class is required"),

  // Xử lý sau khi validate
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, Aclass } = req.body;

    try {
      // Tạo amenity mới
      const newAmenity = await Amenities.create({ name, Aclass });

      // Trả về phản hồi thành công
      return res.status(201).json({
        message: "Amenity created successfully",
        amenity: newAmenity,
      });
    } catch (error) {
      console.error("Error creating amenity:", error);

      // Phản hồi lỗi server
      return res.status(500).json({
        error: "Internal Server Error",
        details: error.message,
      });
    }
  },
];
const getAllAmenity = async (req, res) => {
  const { name, type } = req.query;
  try {
    let queryOptions = {};

    if (name) {
      queryOptions.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (type) {
      queryOptions.type = type;
    }

    const AmenityList = await Amenities.findAll({
      where: queryOptions,
    });

    res.status(200).send(AmenityList);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getDetailAmenity = async (req, res) => {
  const { id } = req.params;
  try {
    const detailAmenity = await Amenities.findOne({
      where: {
        id,
      },
    });
    res.status(200).send(detailAmenity);
  } catch (error) {
    res.status(500).send(error);
  }
};

// const updateAmenity = async (req, res) => {
//   const { id } = req.params;
//   const { name, adress, province } = req.body;
//   try {
//     const detailAmenity = await Amenitys.findOne({
//       where: {
//         id,
//       },
//     });
//     detailAmenity.name = name;
//     detailAmenity.adress = adress;
//     detailAmenity.province = province;
//     await detailAmenity.save();
//     res.status(200).send(detailAmenity);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// };

// // const deleteAmenity = async (req, res) => {
// //   const { id } = req.params;
// //   try {
// //     await Amenity.destroy({
// //       where: {
// //         id,
// //       },
// //     });
// //     res.status(200).send("xoa thanh cong");
// //   } catch (error) {
// //     res.status(500).send(error);
// //   }
// // };

module.exports = {
  createAmenity,
  getAllAmenity,
  getDetailAmenity,

  //   updateAmenity,
  //   deleteAmenity,
};
