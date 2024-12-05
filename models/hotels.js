"use strict";
const { Model } = require("sequelize");
const { Op, literal } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Hotels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Room, Reviews, HotelAmenities, UrlImageHotel, User }) {
      this.hasMany(Room, { foreignKey: "hotelId", onDelete: "CASCADE" });
      this.hasMany(Reviews, { foreignKey: "hotelId", onDelete: "CASCADE" });
      this.hasMany(HotelAmenities, {
        foreignKey: "hotelId",
        onDelete: "CASCADE",
      });
      this.hasMany(UrlImageHotel, {
        foreignKey: "HotelId",
        onDelete: "CASCADE",
      });
      this.belongsTo(User, { foreignKey: "ownerId", onDelete: "CASCADE" });
    }
  }

  Hotels.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Tên khách sạn không được để trống.",
          },
          is: {
            args: /^[a-zA-Z0-9À-ỹ\s]+$/i, // Chỉ cho phép ký tự chữ, số và khoảng trắng
            msg: "Tên khách sạn không được chứa ký tự đặc biệt.",
          },
          len: {
            args: [1, 255], // Độ dài từ 1 đến 255 ký tự
            msg: "Tên khách sạn phải có độ dài từ 1 đến 255 ký tự.",
          },
        },
      },
      star: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Số sao phải là số nguyên.",
          },
          min: {
            args: 1,
            msg: "Số sao phải từ 1 trở lên.",
          },
          max: {
            args: 5,
            msg: "Số sao phải nhỏ hơn hoặc bằng 5.",
          },
        },
      },
      userRating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isFloat: {
            msg: "Đánh giá người dùng phải là số thực.",
          },
          max: {
            args: 5,
            msg: "Đánh giá người dùng phải nhỏ hơn hoặc bằng 5.",
          },
        },
      },
      map: {
        type: DataTypes.STRING,
        allowNull: true, // Map có thể null nếu không cần thiết
      },
      TypeHotel: {
        type: DataTypes.STRING,
        allowNull: true, // Loại hình khách sạn có thể null nếu không cần thiết
      },
      payment: {
        type: DataTypes.STRING,
        allowNull: true, // Phương thức thanh toán có thể null
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: "Giá phải là số nguyên.",
          },
          min: {
            args: 0,
            msg: "Giá không được nhỏ hơn 0.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Hotels",
      hooks: {
        beforeDestroy: async (instance) => {
          const hotelId = instance.id;

          // Lấy danh sách IdRoom
          const roomIds = await sequelize.models.Room.findAll({
            where: { hotelId: hotelId },
            attributes: ["id"],
          });
          const roomIdArray = roomIds.map((room) => room.id);

          // Xóa dịch vụ phòng
          await sequelize.models.roomService.destroy({
            where: { roomId: { [Op.in]: roomIdArray } },
          });

          // Xóa hình ảnh phòng
          if (roomIdArray.length > 0) {
            await sequelize.models.UrlImageRoom.destroy({
              where: { IdRoom: { [Op.in]: roomIdArray } },
            });
          }

          // Xóa các phòng
          await sequelize.models.Room.destroy({ where: { hotelId: hotelId } });

          // Xóa hình ảnh khách sạn
          await sequelize.models.UrlImageHotel.destroy({
            where: { HotelId: hotelId },
          });

          // Xóa đánh giá
          await sequelize.models.Reviews.destroy({
            where: { hotelId: hotelId },
          });

          // Xóa tiện nghi khách sạn
          await sequelize.models.HotelAmenities.destroy({
            where: { hotelId: hotelId },
          });
        },

        afterFind: async (hotels) => {
          if (Array.isArray(hotels)) {
            for (const hotel of hotels) {
              await hotel.updateAverageUserRating();
              await hotel.updateMinPriceHotel();
            }
          } else if (hotels) {
            await hotels.updateAverageUserRating();
            await hotels.updateMinPriceHotel();
          }
        },
        afterCreate: async (hotel) => {
          await hotel.updateAverageUserRating();
          await hotel.updateMinPriceHotel();
        },
      },
    }
  );

  Hotels.prototype.updateAverageUserRating = async function () {
    const hotelId = this.id;

    const [result] = await sequelize.query(
      `
        UPDATE Hotels AS h
        SET userRating = (
          SELECT ROUND(AVG(r.rating), 1)
          FROM Reviews AS r
          WHERE r.hotelId = :hotelId
          HAVING COUNT(r.rating) > 0
        )
        WHERE h.id = :hotelId AND EXISTS (
          SELECT 1
          FROM Reviews AS r
          WHERE r.hotelId = :hotelId
        )
      `,
      {
        replacements: { hotelId }, // Ràng buộc tham số
        type: sequelize.QueryTypes.UPDATE, // Xác định kiểu truy vấn
      }
    );

    return result;
  };

  Hotels.prototype.updateMinPriceHotel = async function () {
    const hotelId = this.id;

    const [result] = await sequelize.query(
      `
        UPDATE Hotels AS h
        SET cost = (
          SELECT MIN(price)
          FROM Rooms AS r
          WHERE r.hotelId = :hotelId
          HAVING COUNT(r.price) > 0
        )
        WHERE h.id = :hotelId AND EXISTS (
          SELECT 1
          FROM Rooms AS r
          WHERE r.hotelId = :hotelId
        )
      `,
      {
        replacements: { hotelId }, // Sử dụng ràng buộc tham số
        type: sequelize.QueryTypes.UPDATE, // Xác định kiểu truy vấn là UPDATE
      }
    );

    return result;
  };

  return Hotels;
};
