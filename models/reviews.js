"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reviews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Hotels, User }) {
      // define association here
      this.belongsTo(Hotels, { foreignKey: "hotelId", onDelete: "CASCADE" });
      this.belongsTo(User, { foreignKey: "guestId", onDelete: "CASCADE" });
    }
  }
  Reviews.init(
    {
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Đánh giá phải là số nguyên.",
          },
          min: {
            args: 1,
            msg: "Đánh giá phải từ 1 trở lên.",
          },
          max: {
            args: 5,
            msg: "Đánh giá phải nhỏ hơn hoặc bằng 5.",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true, // Có thể null nếu không cần thiết
        validate: {
          is: {
            args: /^[a-zA-Z0-9À-ỹ\s.,!?]+$/i, // Chỉ cho phép ký tự chữ, số, khoảng trắng, và ., !, ?
            msg: "Mô tả không được chứa ký tự đặc biệt.",
          },
          len: {
            args: [0, 1000], // Độ dài tối đa 1000 ký tự
            msg: "Mô tả không được dài hơn 1000 ký tự.",
          },
        },
      },

      file: {
        type: DataTypes.TEXT,
        allowNull: true, // File có thể null
        validate: {
          is: {
            args: /\.(jpg|jpeg|png|gif|webp)$/i, // Chỉ cho phép các đuôi file ảnh
            msg: "File phải là URL có đuôi ảnh hợp lệ (jpg, jpeg, png, gif, webp).",
          },
          isUrl: {
            args: true,
            msg: "File phải là một URL hợp lệ.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Reviews",
    }
  );

  return Reviews;
};
