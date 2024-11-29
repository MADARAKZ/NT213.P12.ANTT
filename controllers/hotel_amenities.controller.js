const { HotelAmenities, Amenities, Hotels, Filter, Room,Reviews,UrlImageHotel } = require("../models/");
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
// Controller để lấy danh sách các amenities của một khách sạn
async function getHotelAmenities(req, res) {
  const hotelId = req.params.hotelId;

  try {
    // Tìm khách sạn dựa trên hotelId
    const hotelAmenities = await HotelAmenities.findAll({
      where: { hotelId },
      include: [{ model: Amenities }],
    });

    res.json(hotelAmenities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
async function getHotelAmenitiesByID(req, res) {
  const id = req.params.id;

  try {
    // Tìm khách sạn dựa trên hotelId
    const hotelAmenities = await HotelAmenities.findAll({
     where : {id : id}
    });

    res.status(200).send(hotelAmenities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getHotelHaveAmenities(req, res) {
  const amenityId = req.params.amenityId;

  try {
    // Tìm khách sạn dựa trên hotelId
    const hotelAmenities = await HotelAmenities.findAll({
      where: { amenityId },
      include: [{ model: Hotels }],
    });

    res.json(hotelAmenities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

function getOrderCriteria(sortType) {
  switch (sortType) {
    case "asc_price":
      return [["cost", "ASC"]];
    case "desc_price":
      return [["cost", "DESC"]];
    case "desc_rating":
      return [["star", "DESC"]];
    case "desc_feedback":
      return [["userRating", "DESC"]];
    default:
      return []; // Default to no sorting
  }
}







const searchHotelsByAmenities = async (req, res) => {
  try {
    const {
      destination,
      checkIn,
      checkOut,
      roomCount,
      adultsCount ,
      childrenCount,
      price,
      propertyTypes,
      type,
      servicesHotel,
      servicesRoom,
      paymentMethods,
      roomType,
      sortType,
      TypeBed
    } = req.body;



   



       // Tìm các dịch vụ của khách sạn
       let hotelIdsWithServicesHotel = [];
       if (servicesHotel && servicesHotel.length > 0) {
         const amenities = await Filter.findAll({
           where: {
             name: { [Op.in]: servicesHotel },
           },
           attributes: ["id"],
         });
         const IdServicesHotel = amenities.map((amenity) => amenity.id);
   
         const hotelsWithAllServicesHotel = await Hotels.findAll({
           where: {
             id: {
               [Op.in]: Sequelize.literal(`
                 (SELECT hotelId
                  FROM HotelAmenities
                  WHERE amenityId IN (${IdServicesHotel.join(",")})
                  GROUP BY hotelId
                  HAVING COUNT(DISTINCT amenityId) = ${IdServicesHotel.length})
               `),
             },
           },
           attributes: ["id"], // Chỉ lấy ID khách sạn
         });
   
         hotelIdsWithServicesHotel = hotelsWithAllServicesHotel.map((hotel) => hotel.id);
         console.log("Hotel IDs with all requested hotel services:", hotelIdsWithServicesHotel);
       }
   
       // Tìm các dịch vụ của phòng
       let hotelIdsWithServicesRoom = [];
       if (servicesRoom && servicesRoom.length > 0) {
         const amenities = await Filter.findAll({
           where: {
             name: { [Op.in]: servicesRoom },
           },
           attributes: ["id"],
         });
         const IdServicesRoom = amenities.map((amenity) => amenity.id);
   
         // Truy vấn các phòng có tất cả các dịch vụ yêu cầu
         const roomsWithAllServicesRoom = await Room.findAll({
           where: {
             id: {
               [Op.in]: Sequelize.literal(`
                 (SELECT roomId
                  FROM roomServices
                  WHERE serviceId IN (${IdServicesRoom.join(",")})
                  GROUP BY roomId
                  HAVING COUNT(DISTINCT serviceId) = ${IdServicesRoom.length})
               `),
             },
           },
           attributes: ["id"], // Chỉ lấy ID phòng
         });
   
         // Lấy các roomId từ kết quả tìm kiếm
         const roomIds = roomsWithAllServicesRoom.map((room) => room.id);
   
         // Truy vấn các khách sạn có các phòng này
         const roomsWithHotelIds = await Room.findAll({
           where: {
             id: {
               [Op.in]: roomIds,
             },
           },
           attributes: ["hotelId"], // Lấy hotelId từ bảng Rooms
         });
   
         // Lấy danh sách các hotelId
         hotelIdsWithServicesRoom = [...new Set(roomsWithHotelIds.map((room) => room.hotelId))];
         console.log("Hotel IDs with all requested room services:", hotelIdsWithServicesRoom);
       }
   
       // Bước 3: Tìm các ID khách sạn chung
       let commonHotelIds = [];

// Trường hợp: hotelIdsWithServicesHotel rỗng, lấy tất cả hotelIdsWithServicesRoom
if (hotelIdsWithServicesHotel.length === 0 && hotelIdsWithServicesRoom.length !== 0) {
  commonHotelIds = hotelIdsWithServicesRoom;
} 
// Trường hợp: hotelIdsWithServicesRoom rỗng, lấy tất cả hotelIdsWithServicesHotel
else if (hotelIdsWithServicesRoom.length === 0 && hotelIdsWithServicesHotel.length !== 0) {
  commonHotelIds = hotelIdsWithServicesHotel;
} 
// Trường hợp: Cả hai mảng đều có phần tử, tìm các hotelId chung
else if (hotelIdsWithServicesRoom.length !== 0 && hotelIdsWithServicesHotel.length !== 0) {
  commonHotelIds = hotelIdsWithServicesHotel.filter(hotelId =>
    hotelIdsWithServicesRoom.includes(hotelId)
  );
}

// In ra kết quả để kiểm tra
console.log("Common Hotel IDs:", commonHotelIds);


    const whereRoomClause = {};
    if (roomType && roomType !== "") {
      whereRoomClause.name = roomType;
    }
    if (TypeBed && TypeBed !== "") {
      whereRoomClause.type_bed = TypeBed;
    }
    const rooms = await Room.findAll({
      where: whereRoomClause,
    });
    if (roomCount && roomCount > 0) {
      whereRoomClause.quantity = { [Op.gte]: roomCount };
    }
    if ((adultsCount || childrenCount) && (adultsCount > 0 || childrenCount > 0)) {
      const totalPeople = (adultsCount || 0) + (childrenCount || 0); // Tổng số người
      whereRoomClause.quantity_people = { [Op.gte]: totalPeople }; // Sức chứa phòng >= tổng số người
    }
    if (rooms.length === 0) {
      return res.status(404).json({ message: "No rooms found matching the criteria." });
    }

    // Lấy danh sách các `hotelId` của các phòng đã lọc
    const hotelIds = [...new Set(rooms.map((room) => room.hotelId))];
    let commonHotels = "";
    // tìm khách sạn chung
    if (commonHotelIds.length === 0 && hotelIds.length !==0 ) {
      commonHotels = hotelIds;
    } 
    else if (commonHotelIds.length !== 0 && hotelIds.length !==0 ) {
      commonHotels = commonHotelIds.filter(hotelId => hotelIds.includes(hotelId));
    }

    let whereHotelClause = "";
    // Dynamically build the `whereClause` for the query
    if (commonHotels.length !== 0)
    {
      whereHotelClause = {
        id: { [Op.in]: commonHotels },
      };
    }
    whereHotelClause.cost = { [Op.gte]: price };
    if (paymentMethods !== undefined && paymentMethods !== null && paymentMethods !== "") whereHotelClause.payment = paymentMethods;
    if (propertyTypes && propertyTypes.length > 0 && propertyTypes[0] !== null)
      whereHotelClause.TypeHotel = { [Op.in]: propertyTypes };
    if (type && type.length > 0) whereHotelClause.TypeHotel = { [Op.in]: type };
    if (destination && destination !== "") {
      whereHotelClause.map = {[Op.like]: `%${destination}%`,
    };
  };
    // Query Hotels with or without amenities filtering
    const hotels = await Hotels.findAll({
      where: whereHotelClause,
      attributes: ["id"],
    });
    // Chuyển danh sách các ID thành một mảng
const hotelId = hotels.map((hotel) => hotel.id);
console.log("Hotel IDs from rooms:", hotelId);
if (hotelId.length === 0) {
  console.log("No hotels found matching the criteria.");
} else {
  console.log("Hotel IDs found:", hotelId);
}
  // Lấy tất cả thông tin của các khách sạn từ danh sách `hotels`
  const hotelDetails = await Hotels.findAll({
    where: {
      id: hotelId // Sử dụng danh sách `hotelId` để lấy thông tin khách sạn
    },
    include: [
      {
        model: Reviews,
        as: "Reviews", // Bao gồm thông tin Reviews (đánh giá)
      },
      {
        model: Room, // Bao gồm thông tin Room (phòng)
      },
      {
        model: UrlImageHotel,
        as: "UrlImageHotels", // Bao gồm thông tin hình ảnh khách sạn
      },
    ],
    order: getOrderCriteria(sortType),
  });

  // Gửi thông tin các khách sạn về cho người dùng
  res.status(200).send(hotelDetails);
  } catch (error) {
    console.error("Error while searching hotels:", error);
    res.status(500).json({ error: "An error occurred while searching for hotels." });
  }
};




// POST /api/v1/hotelAmenities
async function addHotelAmenity(req, res) {
  const { hotelId, amenityId } = req.body;
  console.log(req.body);

  try {
    const hotelAmenity = await HotelAmenities.create({
      hotelId,
      amenityId,
    });

    res.status(201).json(hotelAmenity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}async function updateHotelAmenity(req, res) {
  const id = req.params.id;
  console.log(req);
  const {  hotelId, amenityId } = req.body;
  console.log(id, " ", hotelId, " ", amenityId)
  try {
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!id || !hotelId || !amenityId) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Tìm hotelAmenity dựa trên id
    const hotelAmenity = await HotelAmenities.findByPk(id);

    // Kiểm tra nếu không tìm thấy hotelAmenity
    if (!hotelAmenity) {
      return res.status(404).json({ message: "Hotel amenity not found" });
    }

    // Cập nhật hotelId và amenityId
    hotelAmenity.hotelId = hotelId;
    hotelAmenity.amenityId = amenityId;

    // Lưu lại thông tin đã cập nhật
    await hotelAmenity.save();

    // Trả về thông tin hotelAmenity đã được cập nhật
    res.json(hotelAmenity);
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function deleteHotelAmenity(req, res) {
  const { id } = req.params; // Extract the id parameter from req.params

  try {
    const hotelAmenity = await HotelAmenities.findByPk(id); // Find the hotel amenity by id

    if (!hotelAmenity) {
      return res.status(404).json({ message: "Hotel amenity not found" });
    }

    await hotelAmenity.destroy(); // Delete the hotel amenity

    res.json({ message: "Hotel amenity deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
module.exports = {
  getHotelAmenities,
  getHotelHaveAmenities,
  addHotelAmenity,
  updateHotelAmenity,
  deleteHotelAmenity,
  searchHotelsByAmenities,
  getHotelAmenitiesByID
};
