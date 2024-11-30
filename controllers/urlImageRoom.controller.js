const { UrlImageRoom } = require("../models");
const cloudinary = require("cloudinary").v2;
const { body, validationResult } = require("express-validator");
const { sanitizeObject } = require("../middlewares/validations/sanitize");

const createUrlImageRoom = [
  // Validate IdRoom
  body("IdRoom").notEmpty().withMessage("Room ID is required"),

  // Xử lý sau khi validate
  async (req, res) => {
    // Sanitize request body
    sanitizeObject(req.body, ["IdRoom"]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { IdRoom } = req.body;
      const { files } = req;

      if (!files || files.length === 0) {
        return res.status(400).send("No files uploaded.");
      }

      console.log(files);
      // Iterate over each file and create a corresponding UrlImageRoom record
      for (const file of files) {
        const imagePath = file.path;
        const name = file.filename;

        // Create UrlImageRoom record associated with the new room
        const imageUrlRecord = await UrlImageRoom.create({
          url: imagePath,
          file_name: name,
          IdRoom: IdRoom,
        });

        console.log("Created UrlImageRoom record:", imageUrlRecord);
      }

      res.status(201).send("Images uploaded successfully");
    } catch (error) {
      console.error("Error creating UrlImageRoom:", error);
      res.status(500).json({
        error: "Failed to create UrlImageRoom",
        message: error.message,
      });
    }
  },
];

const getUrlImageRoomById = async (req, res) => {
  const { IdRoom } = req.query;

  try {
    const urls = await UrlImageRoom.findAll({ where: { IdRoom: IdRoom } });
    if (!urls) {
      return res.status(404).json({ error: "urlRoom not found" });
    }
    res.status(200).json(urls);
  } catch (error) {
    console.error("Error fetching urlRoom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUrlImageRoom = async (req, res) => {
  const { id } = req.params;
  const { url, IdRoom } = req.body; // Change HotelId to IdRoom

  try {
    const urlRoom = await UrlImageRoom.findByPk(id);
    if (!urlRoom) {
      return res.status(404).json({ error: "urlRoom not found" });
    }
    await urlRoom.update({ url, IdRoom }); // Change HotelId to IdRoom
    res.status(200).json(urlRoom);
  } catch (error) {
    console.error("Error updating urlRoom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUrlImageRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const urlRoom = await UrlImageRoom.findOne({
      where: {
        id: id,
      },
    });

    if (!urlRoom) {
      return res.status(404).json({ error: "urlRoom not found" });
    }
    await cloudinary.uploader.destroy(urlRoom.file_name);
    await urlRoom.destroy();
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting urlRoom:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllUrlImageRoom = async (req, res) => {
  try {
    const urlImageRooms = await UrlImageRoom.findAll();

    if (!urlImageRooms || urlImageRooms.length === 0) {
      return res.status(404).json({ error: "No UrlImageRoom records found" });
    }

    res.status(200).json(urlImageRooms);
  } catch (error) {
    console.error("Error fetching UrlImageRoom records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createUrlImageRoom,
  getUrlImageRoomById,
  updateUrlImageRoom,
  deleteUrlImageRoom,
  getAllUrlImageRoom,
};
