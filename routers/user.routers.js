const passport = require("passport");

const jwt = require("jsonwebtoken");
const session = require("express-session");
// const { checkExist } = require("../middlewares/validations/checkExist");
require("../passport");
const ratelimit = require("express-rate-limit");

// const { checkExist } = require("../middlewares/validations/checkExist");
const uploadCloud = require("../middlewares/upload/cloudinary.config");
const { uploadImage } = require("../middlewares/upload/upload-image");
const express = require("express");
const {
  register,
  login,
  getAllUser,
  updateImage,
  displayUser,
  editUser,
  deleteUser,
  getDetailUser,
  loginGG,
  // checkEmailExist,
  updatePassword,
  getCurrentUser,
  Logout,
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
userRouter.post("/loginGG", limiter, parseForm, csrfProtection, loginGG);
userRouter.post("/logout", limiter, parseForm, csrfProtection, Logout);
userRouter.get("/getAllUser", getAllUser);
userRouter.get("/getDetailUser/:id", getDetailUser);
userRouter.get("/manageUsers", displayUser);

userRouter.post(
  "/updateImage/:id",
  uploadImage,
  limiter,

  uploadCloud.single("user"),
  updateImage
);

userRouter.put("/editUser/:id", limiter, parseForm, csrfProtection, editUser);
userRouter.put(
  "/updatePassword",
  limiter,
  parseForm,
  csrfProtection,
  updatePassword
);

userRouter.delete(
  "/deleteUser/:id",
  limiter,
  parseForm,
  csrfProtection,
  deleteUser
);
userRouter.get("/getCurrentUser", limiter, getCurrentUser);
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

// userRouter.get("/auth/google/callback", (req, res, next) => {
//   passport.authenticate("google", (error, profile) => {
//     let user = profile;
//     console.log("profile", profile);
//     fetch(`/api/v1/users/loginGG`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(user),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         let userData = {};
//         console.log("API response:", data);
//         userData = data;
//         //req.session.data = userData;
//         res.redirect(
//           `/ff`
//         );
//       })
//       .catch((err) => {
//         console.error("Error calling API:", err);
//         res.status(500).json({ error: "Failed to call login API" });
//       });
//   })(req, res, next);
// });

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
