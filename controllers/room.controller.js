const {
  Room,
  Hotels,
  roomService,
  Amenities,
  UrlImageRoom,
} = require("../models");
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const { sanitizeObject } = require("../middlewares/validations/sanitize");
const getHotelIdByOwnerId = async (ownerId) => {
  try {
    const hotel = await Hotels.findOne({ where: { ownerId } }); // Chỉ lấy một khách sạn
    if (!hotel) {
      console.log("No hotels found for the specified owner.");
      throw new Error("No hotels found for the specified owner.");
    }
    return hotel.id; // Trả về ID của khách sạn
  } catch (error) {
    console.error("Error fetching hotel for owner:", error);
    throw error;
  }
};
const createRoom = [
  // Validate các trường
  body("name")
    .notEmpty()
    .withMessage("Room name is required")
    .isLength({ max: 100 })
    .withMessage("Room name must not exceed 100 characters"),
  body("status")
    .notEmpty()
    .withMessage("Room status is required")
    .isIn([(1, 0)])
    .withMessage(
      "Room status must be one of 'available', 'unavailable', or 'maintenance'"
    ),
  body("price")
    .notEmpty()
    .withMessage("Room price is required")
    .isFloat({ min: 0 })
    .withMessage("Room price must be a positive number"),
  body("quantity")
    .notEmpty()
    .withMessage("Room quantity is required")
    .isInt({ min: 1 })
    .withMessage("Room quantity must be at least 1"),
  body("quantity_people")
    .notEmpty()
    .withMessage("Number of people allowed is required")
    .isInt({ min: 1 })
    .withMessage("Number of people must be at least 1"),
  body("type_bed")
    .notEmpty()
    .withMessage("Type of bed is required")
    .isIn(["Single", "Double", "Queen", "King"])
    .withMessage(
      "Type of bed must be one of 'single', 'double', 'queen', or 'king'"
    ),

  // Xử lý sau khi validate
  async (req, res) => {
    // Sanitize request body
    sanitizeObject(req.body, [
      "name",
      "status",
      "price",
      "quantity",
      "quantity_people",
      "type_bed",
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, status, price, quantity, quantity_people, type_bed } =
      req.body;
    const ownerId = req.user.userId; // Lấy ownerId từ thông tin người dùng đã xác thực
    const hotelId = await getHotelIdByOwnerId(ownerId);
    if (!hotelId) {
      return res.status(404).send("Không tìm thấy khách sạn");
    }
    try {
      // Create a new room record in the database
      const newRoom = await Room.create({
        name,
        status,
        price,
        quantity,
        quantity_people,
        hotelId,
        type_bed,
      });

      // Retrieve uploaded files from the request
      const { files } = req;
      console.log(files);
      // Iterate over each file and create a corresponding UrlImageRoom record
      for (const file of files) {
        const imagePath = file.path;
        const fileName = file.filename;

        // Create UrlImageRoom record associated with the new room
        const imageUrlRecord = await UrlImageRoom.create({
          url: imagePath,
          file_name: fileName,
          IdRoom: newRoom.id,
        });

        console.log("Created UrlImageRoom record:", imageUrlRecord);
      }

      // Send a success response with the newly created room
      res.status(201).send(newRoom);
    } catch (error) {
      // Handle errors and send an error response
      console.error("Error creating room:", error);
      res
        .status(500)
        .send({ error: "Failed to create room", message: error.message });
    }
  },
];
const getOwnerRoom = async (req, res) => {
  const { hotelId } = req.query;

  try {
    console.log("Query hotelId:", hotelId);

    let whereClause = {};
    if (hotelId) {
      whereClause.hotelId = hotelId; // Sử dụng hotelId từ req.query
    }

    console.log("Constructed whereClause:", whereClause);

    // Tìm tất cả các phòng phù hợp với điều kiện từ bảng Room
    const roomList = await Room.findAll({
      where: whereClause,
    });

    console.log("Room list retrieved:", roomList);

    res.status(200).send(roomList);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send(error);
  }
};
const getAllRoom = async (req, res) => {
  const { hotelId } = req.query;

  try {
    let whereClause = {};

    if (hotelId) {
      whereClause.hotelId = hotelId; // Sử dụng hotelId từ req.query
    }

    // Tìm tất cả các phòng phù hợp với điều kiện từ bảng Room
    const roomList = await Room.findAll({
      where: whereClause,
      include: [
        {
          model: Hotels, // Include thông tin của Hotel
          as: "Hotel", // Đặt alias là "Hotel"
        },
        {
          model: roomService, // Include thông tin về dịch vụ của phòng
          include: [
            {
              model: Amenities, // Include thông tin của dịch vụ
              as: "Amenity", // Đặt alias là "Amenity"
            },
          ],
        },
        {
          model: UrlImageRoom,
        },
      ],
    });

    res.status(200).send(roomList);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getDetailRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const detailroom = await Room.findOne({
      where: {
        id,
      },
    });
    res.status(200).send(detailroom);
  } catch (error) {
    res.status(500).send(error);
  }
};
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name, status, price, quantity, quantity_people, type_bed } = req.body;
  try {
    const detailRoom = await Room.findOne({
      where: {
        id,
      },
    });
    detailRoom.name = name;
    detailRoom.status = status;
    detailRoom.quantity = quantity;
    detailRoom.quantity_people = quantity_people;
    detailRoom.type_bed = type_bed;
    detailRoom.price = price;
    await detailRoom.save();
    res.status(200).send(detailRoom);
  } catch (error) {
    res.status(500).send(error);
  }
};
const deleteRoom = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  try {
    // Tìm khách sạn cần xóa
    const deletedRoom = await Room.findOne({
      where: {
        id,
      },
    });

    if (!deletedRoom) {
      return res.status(404).send("Không tìm thấy khách sạn");
    }

    // Sau khi đã xóa hết các hình ảnh liên quan, tiến hành xóa khách sạn
    await deletedRoom.destroy({ cascade: true });

    // Phản hồi thành công sau khi xóa khách sạn và hình ảnh
    res.status(200).send("Xóa khách sạn và các hình ảnh liên quan thành công");
  } catch (error) {
    console.error("Lỗi khi xóa khách sạn và hình ảnh:", error);
    res.status(500).send("Lỗi máy chủ nội bộ");
  }
};

const getDetailRoomByHotelAndName = async (req, res) => {
  const { hotelId, roomName } = req.body;

  try {
    // Kiểm tra sự hiện diện của hotelId và roomName
    if (!hotelId || !roomName) {
      return res
        .status(400)
        .send({ message: "Both hotelId and roomName are required." });
    }

    // Tìm phòng dựa trên hotelId và roomName
    const detailRoom = await Room.findOne({
      where: {
        hotelId,
        name: roomName, // Lọc theo tên phòng
      },
      include: [
        {
          model: Hotels, // Include thông tin của khách sạn
          as: "Hotel", // Alias để sử dụng trong truy vấn
          attributes: ["name", "star", "userRating", "TypeHotel"], // Chỉ lấy các thuộc tính cần thiết
        },
        {
          model: UrlImageRoom, // Include thông tin hình ảnh của phòng
        },
      ],
    });

    // Kiểm tra nếu không tìm thấy phòng
    if (!detailRoom) {
      return res.status(404).send({
        message: "Room not found with the specified hotelId and roomName.",
      });
    }

    // Trả về chi tiết phòng
    res.status(200).send(detailRoom);
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).send({ error: "Internal server error" });
  }
};
module.exports = {
  createRoom,
  deleteRoom,
  updateRoom,
  getOwnerRoom,
  getDetailRoom,
  getAllRoom,
  getDetailRoomByHotelAndName,
};
