"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Room, { foreignKey: "room_id" });
      this.belongsTo(models.User, { foreignKey: "user_id" });
      this.belongsTo(models.Hotels, { foreignKey: "hotel_id" });
    }
  }
  Booking.init(
    {
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Room ID phải là một số nguyên.",
          },
        },
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "User ID phải là một số nguyên.",
          },
        },
      },
      hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Hotel ID phải là một số nguyên.",
          },
        },
      },
      check_in_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Ngày check-in phải là một ngày hợp lệ.",
          },
          isBefore: {
            args: [sequelize.fn("NOW")],
            msg: "Ngày check-in phải lớn hơn hoặc bằng ngày hiện tại.",
          },
        },
      },
      check_out_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Ngày check-out phải là một ngày hợp lệ.",
          },
          isAfterField(value) {
            if (
              this.check_in_date &&
              new Date(value) <= new Date(this.check_in_date)
            ) {
              throw new Error("Ngày check-out phải sau ngày check-in.");
            }
          },
        },
      },
      total_price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
        validate: {
          isDecimal: {
            msg: "Total price phải là một số thập phân hợp lệ.",
          },
          min: {
            args: [0],
            msg: "Total price phải lớn hơn hoặc bằng 0.",
          },
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      special_requests: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          is: {
            args: /^[a-zA-Z0-9À-ỹ\s]+$/i, // Chỉ cho phép ký tự chữ, số, khoảng trắng, và ., !, ?
            msg: "Special requests không được chứa ký tự đặc biệt.",
          },
          len: {
            args: [0, 500],
            msg: "Special requests không được dài hơn 500 ký tự.",
          },
        },
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Full name không được để trống.",
          },
          is: {
            args: /^[a-zA-Z0-9À-ỹ\s]+$/i, // Chỉ cho phép ký tự chữ và khoảng trắng
            msg: "Full name chỉ được chứa chữ cái và khoảng trắng.",
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Quantity phải là một số nguyên.",
          },
          min: {
            args: [1],
            msg: "Quantity phải lớn hơn hoặc bằng 1.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
