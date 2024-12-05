"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Reviews, Hotels, Booking }) {
      // define association here
      this.hasMany(Reviews, { foreignKey: "guestId", onDelete: "CASCADE" });
      this.hasOne(Hotels, { foreignKey: "ownerId", onDelete: "CASCADE" });
      this.hasMany(Booking, { foreignKey: "user_id", onDelete: "CASCADE" });
    }
  }
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Tên không được để trống.",
          },
          is: {
            args: /^[a-zA-ZÀ-ỹ\s]+$/i, // Chỉ cho phép ký tự chữ, khoảng trắng
            msg: "Tên chỉ được chứa chữ cái và khoảng trắng.",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false, // Email không được phép để trống
        unique: true, // Email phải là duy nhất
        validate: {
          isEmail: true, // Kiểm tra định dạng email hợp lệ
        },
      },
      password: {
        type: DataTypes.STRING,
        validate: {
          len: [8, 100], // Đảm bảo mật khẩu có tối thiểu 8 ký tự
          isStrongPassword(value) {
            const regex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[a-zA-Z0-9]).{8,}$/;
            if (!regex.test(value)) {
              throw new Error(
                "Mật khẩu phải có ít nhất 8 ký tự, chứa một ký tự đặc biệt và một ký tự viết hoa."
              );
            }
          },
        },
      },
      numberPhone: {
        type: DataTypes.STRING,
        validate: {
          is: {
            args: /^(84|0[3|5|7|8|9])+([0-9]{8})\b$/,
            msg: "Số điện thoại không hợp lệ",
          },
          async isUnique(value) {
            const existingUser = await User.findOne({
              where: { numberPhone: value },
            });
            if (existingUser) {
              throw new Error("Số điện thoại đã tồn tại");
            }
          },
        },
      },
      birthDate: {
        type: DataTypes.DATE,
        validate: {
          isBeforeToday(value) {
            const today = new Date();
            if (new Date(value) > today) {
              throw new Error("Ngày sinh phải là ngày trước hôm nay.");
            }
          },
        },
      },
      gender: DataTypes.BOOLEAN,
      type: {
        type: DataTypes.ENUM("client", "owner", "admin"),
        allowNull: false, // Make sure to set allowNull based on your requirements
        defaultValue: "client",
      },

      cccd: {
        type: DataTypes.STRING, // Not allowing null value
        validate: {
          len: {
            // Ensures length is exactly 12 characters
            args: [12, 12],
            msg: "Số CCCD phải có đúng 12 ký tự.",
          },
          isNumeric: {
            // Ensures only numeric values are allowed
            msg: "Số CCCD chỉ được chứa các chữ số.",
          },
        },
      },

      address: DataTypes.TEXT,
      url: DataTypes.STRING,
      authGgId: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
      authType: {
        type: DataTypes.ENUM("local", "google"),
        defaultValue: "local",
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeDestroy: async (instance) => {
          const guestId = instance.id;

          // Lấy danh sách các Hotels mà user sở hữu
          const hotels = await sequelize.models.Hotels.findAll({
            where: { ownerId: guestId },
            attributes: ["id"], // Chỉ lấy cột 'id' để sử dụng cho các truy vấn liên quan
          });
          const hotelIds = hotels.map((hotel) => hotel.id); // Trích xuất danh sách ID của Hotels

          // Xóa Hotel Amenities liên quan đến các Hotels này
          await sequelize.models.HotelAmenities.destroy({
            where: { hotelId: { [Op.in]: hotelIds } },
          });

          // Xóa Reviews liên quan đến các Hotels này
          await sequelize.models.Reviews.destroy({
            where: { hotelId: { [Op.in]: hotelIds } },
          });

          // Lấy danh sách các Rooms thuộc Hotels của user
          const rooms = await sequelize.models.Room.findAll({
            where: { hotelId: { [Op.in]: hotelIds } },
            attributes: ["id"], // Chỉ lấy cột 'id' để sử dụng
          });
          const roomIds = rooms.map((room) => room.id); // Trích xuất danh sách ID của Rooms

          // Xóa Room Services liên quan đến các Rooms này
          await sequelize.models.roomService.destroy({
            where: { roomId: { [Op.in]: roomIds } },
          });

          // Xóa UrlImageRoom liên quan đến các Rooms này
          await sequelize.models.UrlImageRoom.destroy({
            where: { IdRoom: { [Op.in]: roomIds } },
          });

          // Xóa Rooms thuộc Hotels của user
          await sequelize.models.Room.destroy({
            where: { hotelId: { [Op.in]: hotelIds } },
          });

          // Xóa UrlImageHotel liên quan đến các Hotels này
          await sequelize.models.UrlImageHotel.destroy({
            where: { hotelId: { [Op.in]: hotelIds } },
          });

          // Xóa Hotels của user
          await sequelize.models.Hotels.destroy({
            where: { ownerId: guestId },
          });

          // Xóa Bookings của user
          await sequelize.models.Booking.destroy({
            where: { user_id: guestId },
          });

          // Xóa Reviews mà user là guest
          await sequelize.models.Reviews.destroy({
            where: { guestId: guestId },
          });

          console.log(`Deleted all associated data for user id: ${guestId}`);
        },
      },
    }
  );
  return User;
};
