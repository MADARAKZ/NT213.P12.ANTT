const passport = require("passport");
const jwt = require("jsonwebtoken");
const session = require("express-session");
// const { checkExist } = require("../middlewares/validations/checkExist");
require("../passport");
const ratelimit = require("express-rate-limit");
const {authenticationMiddleware} = require("../middlewares/authen/token");
const {authenticateToken, requireAdmin, requireCustomer, requireOwner} = require("../middlewares/authen/auth.middleware");
// const { checkExist } = require("../middlewares/validations/checkExist");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const { uploadImage } = require("../middlewares/upload/upload-image");
const express = require("express");
const { User } = require("../models");
const {
  register,
  login,
  getAllUser,
  updateImage,
  displayUser,
  editUser,
  editUserAdmin,
  deleteUser,
  getDetailUser,
  loginGG,
  getDetailingUser,
  // checkEmailExist,
  updatePassword,
  getCurrentUser,
  Logout,
  verifyOTP,
  resendOTP
} = require("../controllers/user.controllers");

var {
  csrfProtection,
  parseForm,
} = require("../middlewares/authen/csrfProtection");

const userRouter = express.Router();
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many API request from this IP",
});

userRouter.post("/register", limiter, parseForm, csrfProtection, register);
// userRouter.get("/", getAllUser);
// userRouter.get("/:id", getDetailUser);
// userRouter.put("/:id", checkExist(user), updateUser);
// userRouter.delete("/:id", checkExist(user), deleteUser);

userRouter.post("/login", limiter, parseForm, csrfProtection, login);
userRouter.post("/loginGG", limiter, loginGG);
userRouter.post("/resend-otp", limiter, parseForm,csrfProtection, resendOTP);
userRouter.post("/verifyotp", limiter, parseForm, csrfProtection, verifyOTP);
userRouter.post("/logout", limiter, parseForm, csrfProtection, Logout);
userRouter.get("/getAllUser",limiter,authenticationMiddleware, requireAdmin, getAllUser);
userRouter.get("/getDetailUser",limiter,authenticationMiddleware, getDetailUser);
userRouter.get("/manageUsers", displayUser);
userRouter.get("/getDetailingUser/:id", limiter, authenticationMiddleware, requireAdmin, getDetailingUser);
userRouter.put("/editUserAdmin/:id", limiter,parseForm, csrfProtection, authenticationMiddleware, requireAdmin, editUserAdmin);
userRouter.post(
  "/updateImage/:id",
  uploadImage,
  parseForm,
  csrfProtection,
  limiter,

  uploadCloud.single("user"),
  updateImage
);

userRouter.put("/editUser", limiter, parseForm, csrfProtection,authenticationMiddleware, editUser);
userRouter.put(
  "/updatePassword",
  limiter,
  parseForm,
  csrfProtection,
  authenticationMiddleware,
  updatePassword
);

userRouter.delete(
  "/deleteUser/:id",
  limiter,
  parseForm,
  csrfProtection,
  authenticateToken,
  requireAdmin,
  deleteUser
);
userRouter.get("/getCurrentUser", limiter, authenticationMiddleware, getCurrentUser);
require("dotenv").config();
userRouter.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Đặt thành true nếu sử dụng HTTPS
  })
);
userRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
    session: false,
  })
);

userRouter.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", async (error, profile) => {
    try {
      if (error) {
        return next(error);
      }

      if (!profile) {
        return res.status(401).redirect("/login");
      }
      console.log("Profile", profile);
      // Tạo JWT tokens
      const accessToken = jwt.sign(
        {
          userId: profile.id,
          name: profile.name,
          type: profile.type,
        },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        {
          userId: profile.id,
          email: profile.email,
        },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
      );

      // Set cookies trực tiếp
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 phút
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1440 * 60 * 1000 // 15 phút
      });
      // Gọi API login để lưu refresh token vào database
      const response = await fetch(
        `http://localhost:3030/api/v1/users/loginGG`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: profile.email,
            name: profile.name,
            authGgId: profile.id,
            refreshToken: refreshToken,
          }),
        }
      );

      const data = await response.json();
      console.log("API response:", data);

      // Redirect sau khi xử lý thành công
      res.redirect(`/`);
    } catch (err) {
      console.error("Authentication error:", err);

      // // Xóa cookies nếu có lỗi
      // res.clearCookie("accessToken");
      // res.clearCookie("refreshToken");

      // Xử lý lỗi chi tiết
      if (err.name === "FetchError") {
        return res.status(500).json({ error: "Failed to call login API" });
      } else if (err instanceof TypeError) {
        return res.status(400).json({ error: "Invalid data received" });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  })(req, res, next);
});


// Middleware to refresh access token
userRouter.post("/token", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({message: "Không có Refreshtoken"});

  const refreshTokendecode = jwt.verify(refreshToken,process.env.REFRESH_TOKEN);

  const user = await User.findById(refreshTokendecode.userId);
  if(!user)
  {
    return res.status(401).json({message: 'User không hợp lệ'});
  }
  const newAccessToken = jwt.sign(
    { userId: user.id, type: user.type},
    process.env.ACCESS_TOKEN,
    { expiresIn: "15m" }
  )


  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 phút
  });
  console.log("Da refresh token")
  req.user = jwt.verify(newAccessToken, JWT_SECRET);
  return res.status(200).json({message: 'Da refresh token'})
});


module.exports = {
  userRouter,
  getAllUser,
  displayUser,
  editUser,
  deleteUser,
  getDetailUser,
  updatePassword,
  loginGG,
};
