"use strict";
const { Model, where } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Hotels, roomService, UrlImageRoom, Booking }) {
      this.belongsTo(Hotels, { foreignKey: "hotelId" });
      this.hasMany(roomService, { foreignKey: "roomId", onDelete: "CASCADE" });
      this.hasMany(UrlImageRoom, { foreignKey: "IdRoom", onDelete: "CASCADE" });
      this.hasMany(Booking, { foreignKey: "room_id", onDelete: "CASCADE" });
    }
  }
  Room.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Tên phòng không được để trống.",
          },
          is: {
            args: /^[a-zA-Z0-9À-ỹ\s]+$/i, // Chỉ cho phép ký tự chữ, số, và khoảng trắng
            msg: "Tên phòng không được chứa ký tự đặc biệt.",
          },
        },
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Giá phải là số nguyên.",
          },
          min: {
            args: 0,
            msg: "Giá phải lớn hơn hoặc bằng 0.",
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Số lượng phải là số nguyên.",
          },
          min: {
            args: 0,
            msg: "Số lượng phải lớn hơn hoặc bằng 0.",
          },
        },
      },
      quantity_people: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: "Số lượng người phải là số nguyên.",
          },
          min: {
            args: 0,
            msg: "Số lượng người phải lớn hơn hoặc bằng 0.",
          },
        },
      },
      type_bed: {
        type: DataTypes.STRING,
        allowNull: true, // Có thể null nếu không cần thiết
        validate: {
          is: {
            args: /^[a-zA-Z\s]+$/i, // Chỉ cho phép chữ cái và khoảng trắng
            msg: "Loại giường không được chứa ký tự đặc biệt.",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Room",
      hooks: {
        beforeDestroy: async (instance) => {
          const roomId = instance.id;
          const UrlImageRoom = sequelize.models.UrlImageRoom;

          // Xóa tất cả các bản ghi trong bảng UrlImageHotel có HotelId tương ứng
          if (UrlImageRoom) {
            await UrlImageRoom.destroy({ where: { IdRoom: roomId } });
          }

          const roomService = sequelize.models.roomService;
          if (roomService) {
            await roomService.destroy({ where: { roomId: roomId } });
          }

          const booking = sequelize.models.Booking;
          if (booking) {
            await booking.destroy({ where: { room_id: roomId } });
          }
        },
      },
    }
  );
  return Room;
};
