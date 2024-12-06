const { UrlImageHotel, Hotels } = require("../models");

const cloudinary = require("cloudinary").v2;

const createUrlImageHotel = async (req, res) => {
  try {
    const { HotelId } = req.body;
    const { files } = req;

    // Validate HotelId
    if (!HotelId || isNaN(HotelId)) {
      console.log("Invalid HotelId:", HotelId);
      return res.status(400).send("Invalid HotelId.");
    }

    // Validate files
    if (!files || files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }

    // Iterate over each file and create a corresponding UrlImageHotel record
    for (const file of files) {
      const imagePath = file.path;
      const name = file.filename;

      // Create UrlImageHotel record associated with the hotel
      const imageUrlRecord = await UrlImageHotel.create({
        url: imagePath,
        file_name: name,
        HotelId: HotelId,
      });

      console.log("Created UrlImageHotel record:", imageUrlRecord);
    }

    res.status(201).send("Images uploaded successfully");
  } catch (error) {
    console.error("Error creating UrlImageHotel:", error);
    res.status(500).send("Internal Server Error");
  }
};
const getUrlImageHotelById = async (req, res) => {
  const ownerId = req.user.userId; // Lấy ownerId từ thông tin người dùng đã xác thực
  const { HotelId } = req.query; // Lấy HotelId từ URL parameter
  try {
    let targetHotelId;

    // Nếu HotelId không được cung cấp, tìm tất cả HotelId thuộc ownerId
    if (!HotelId) {
      const hotels = await Hotels.findAll({ where: { ownerId: ownerId } });
      if (!hotels || hotels.length === 0) {
        return res
          .status(404)
          .json({ error: "No hotels found for this ownerId" });
      }

      // Lấy HotelId đầu tiên (hoặc tùy theo logic của bạn)
      targetHotelId = hotels[0].id; // Có thể tùy chỉnh để lấy nhiều HotelId nếu cần
    } else {
      // Nếu HotelId được cung cấp, kiểm tra xem HotelId có thuộc về ownerId không
      const hotel = await Hotels.findOne({
        where: { id: HotelId },
      });
      if (!hotel) {
        return res
          .status(403)
          .json({ error: "You do not have access to this HotelId" });
      }
      targetHotelId = HotelId;
    }

    // Tìm tất cả các đường dẫn ảnh có HotelId tương ứng
    const urls = await UrlImageHotel.findAll({
      where: { HotelId: targetHotelId },
    });
    if (!urls || urls.length === 0) {
      return res
        .status(404)
        .json({ error: "No image URLs found for this hotelId" });
    }

    // Tạo danh sách mới chứa thông tin hình ảnh bao gồm id
    const imageList = urls.map((image) => {
      const processedUrl = image.url.replace(/\\/g, "/"); // Xử lý chuỗi URL
      return {
        id: image.id, // ID của ảnh
        url: processedUrl, // Đường dẫn ảnh đã được xử lý
      };
    });

    // Trả về danh sách các đường dẫn ảnh với id
    res.status(200).json(imageList);
  } catch (error) {
    console.error("Error fetching image URLs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUrlImageHotel = async (req, res) => {
  const { id } = req.params;
  const { url, HotelId } = req.body;

  try {
    const urlHotel = await UrlImageHotel.findByPk(id);
    if (!urlHotel) {
      return res.status(404).json({ error: "UrlHotel not found" });
    }
    await urlHotel.update({ url, HotelId });
    res.status(200).json(urlHotel);
  } catch (error) {
    console.error("Error updating UrlHotel:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const deleteUrlImageHotel = async (req, res) => {
  const { id } = req.params;

  try {
    // Tìm ảnh cần xóa dựa trên imageId
    const imageToDelete = await UrlImageHotel.findByPk(id);

    if (!imageToDelete) {
      return res.status(404).json({ error: "Không tìm thấy ảnh để xóa" });
    }

    // Xóa ảnh từ Cloudinary
    await cloudinary.uploader.destroy(imageToDelete.file_name);

    // Xóa bản ghi ảnh từ cơ sở dữ liệu
    await imageToDelete.destroy();

    // Phản hồi với thông báo xóa thành công
    res.status(200).send("Xóa ảnh thành công");
  } catch (error) {
    console.error("Lỗi khi xóa ảnh:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

const getAllUrlImageHotel = async (req, res) => {
  try {
    const urlImageHotels = await UrlImageHotel.findAll();

    if (!urlImageHotels || urlImageHotels.length === 0) {
      return res.status(404).json({ error: "No UrlImageHotel records found" });
    }

    res.status(200).json(urlImageHotels);
  } catch (error) {
    console.error("Error fetching UrlImageHotel records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getAllUrlImageHotel,
  createUrlImageHotel,
  getUrlImageHotelById,
  updateUrlImageHotel,
  deleteUrlImageHotel,
};
