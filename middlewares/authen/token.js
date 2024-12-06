const jwt = require("jsonwebtoken");
const { User } = require("../../models");
const { Hotels, Room, roomService } = require("../../models");
const { error } = require("winston");
const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      message: "Access token is missing. Please login.",
    });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({ message: "User is not authenticated" });
    }
    if (user.isAdmin) {
      next();
    } else {
      return res.status(403).json({
        message: "User is not authorized",
      });
    }
  });
};

async function authenticationMiddleware(req, res, next) {
  const token = req.cookies.accessToken; // Lấy token từ cookie
  const refreshToken = req.cookies.refreshToken;
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) return res.status(403).json({ message: "Token không hợp lệ." });
      req.user = user;
      console.log("User", user);
      next();
    });
  } else {
    if (refreshToken == null) {
      return res.status(401).json({ message: "Phiên đăng nhập hết hạn." });
    } else {
      try {
        const refeshTokendecode = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN
        );

        const newAccessToken = await RefreshToken(refeshTokendecode.userId);
        console.log("token moi trong cookie", newAccessToken);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000, // 15 phút
        });
        console.log("Da refresh token");
        req.user = jwt.verify(newAccessToken, process.env.ACCESS_TOKEN);
        next();
      } catch (refreshError) {
        return res
          .status(401)
          .json({ message: "Phiên đăng nhập không hợp lệ, hãy đăng nhập lại" });
      }
    }
  }
}

async function RefreshToken(userID) {
  const user = await User.findOne({ where: { id: userID } });
  console.log("Refresh USer", user);
  if (!user) {
    throw new error("User is Invalid");
  }
  const newAccessToken = jwt.sign(
    { userId: user.id, type: user.type },
    process.env.ACCESS_TOKEN,
    { expiresIn: "15m" }
  );
  console.log("Token moi", newAccessToken);
  return newAccessToken;
}

const confirmOwnerOfHotel = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming req.user contains the authenticated user's info
    const userType = req.user.type; // Assuming req.user contains the user's type (e.g., 'admin', 'owner')
    const hotelId = req.body.hotelId || req.params.hotelId || req.params.id;
    if (!hotelId) {
      return res.status(400).send("Hotel ID is required");
    }

    // If the user is an admin, bypass the ownership check
    if (userType === "admin") {
      return next();
    }

    // Find the hotel by ID
    const hotel = await Hotels.findOne({ where: { id: hotelId } });

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    // Check if the authenticated user is the owner of the hotel
    if (hotel.ownerId !== userId) {
      return res
        .status(403)
        .send("You do not have permission to perform this action");
    }

    // If the user is the owner, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error confirming hotel ownership:", error);
    res.status(500).send("Internal Server Error");
  }
};
const confirmOwnerOfRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming req.user contains the authenticated user's info
    const userType = req.user.type; // Assuming req.user contains the user's type (e.g., 'admin', 'owner')
    const roomId = req.body.roomId || req.params.roomId || req.params.id; // Get roomId from request body or params

    if (!roomId) {
      return res.status(400).send("Room ID is required");
    }

    // If the user is an admin, bypass the ownership check
    if (userType === "admin") {
      return next();
    }

    // Find the room by ID
    const room = await Room.findOne({ where: { id: roomId } });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Find the hotel by ID
    const hotel = await Hotels.findOne({ where: { id: room.hotelId } });

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    // Check if the authenticated user is the owner of the hotel
    if (hotel.ownerId !== userId) {
      return res
        .status(403)
        .send("You do not have permission to perform this action");
    }

    // If the user is the owner, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error confirming room ownership:", error);
    res.status(500).send("Internal Server Error");
  }
};

async function blockLogin(req, res, next) {
  const token = req.cookies.accessToken; // Lấy token từ cookie
  if (token) {
    // Nếu token tồn tại, trả về thông báo lỗi và không cho truy cập
    return res.status(403).json({
      message: "Bạn đã đăng nhập. Không thể truy cập vào trang này.",
    });
  }
  // Nếu không có token, tiếp tục xử lý router
  next();
}
const confirmServicePermissionForRoom = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Assuming req.user contains the authenticated user's info
    const userType = req.user.type; // Assuming req.user contains the user's type (e.g., 'admin', 'owner')
    const roomServiceId =
      req.body.id || req.params.roomServiceId || req.params.id; // Get roomServiceId from request body or params

    if (!roomServiceId) {
      return res.status(400).send("Room Service ID is required");
    }

    // If the user is an admin, bypass the ownership check
    if (userType === "admin") {
      return next();
    }

    // Find the room service by ID
    const roomservice = await roomService.findOne({
      where: { id: roomServiceId },
    });

    if (!roomservice) {
      return res.status(404).send("Room Service not found");
    }

    // Find the room associated with the room service
    const room = await Room.findOne({ where: { id: roomservice.roomId } });

    if (!room) {
      return res.status(404).send("Room not found");
    }

    // Find the hotel associated with the room
    const hotel = await Hotels.findOne({ where: { id: room.hotelId } });

    if (!hotel) {
      return res.status(404).send("Hotel not found");
    }

    // Check if the authenticated user is the owner of the hotel
    if (hotel.ownerId !== userId) {
      return res
        .status(403)
        .send("You do not have permission to perform this action");
    }

    // If the user is the owner, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error confirming room service ownership:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  authMiddleware,
  authenticationMiddleware,
  confirmOwnerOfHotel,
  confirmOwnerOfRoom,
  confirmServicePermissionForRoom,
  blockLogin,
};
