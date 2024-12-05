"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Coupons extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here (if needed)
    }

    // Phương thức kiểm tra và xóa bản ghi hết hạn
    async removeExpiredCoupon() {
      const today = new Date();
      if (new Date(this.end) < today) {
        console.log(`Xóa mã giảm giá đã hết hạn: ${this.code}`);
        await this.destroy();
      }
    }
  }

  Coupons.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      percent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 80, // Đảm bảo percent không lớn hơn 80
          isInt: true, // Phải là số nguyên
        },
      },
      quantities: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: true, // Phải là số nguyên
          min: 0, // Không cho phép số lượng âm
        },
      },
      begin: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true, // Phải là một ngày hợp lệ
        },
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: true, // Phải là một ngày hợp lệ
          isAfterBegin(value) {
            if (this.begin && new Date(value) <= new Date(this.begin)) {
              throw new Error("Ngày kết thúc phải sau ngày bắt đầu.");
            }
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Coupons",
      hooks: {
        // Hook tự động xóa các bản ghi hết hạn sau khi tìm kiếm
        afterFind: async (coupons) => {
          if (Array.isArray(coupons)) {
            for (const coupon of coupons) {
              await coupon.removeExpiredCoupon();
            }
          } else if (coupons) {
            await coupons.removeExpiredCoupon();
          }
        },
      },
    }
  );

  return Coupons;
};
