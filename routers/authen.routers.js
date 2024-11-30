const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authen.controller");

const authenRouter = express.Router();
var { csrfProtection, parseForm, cookieParser } = require("../middlewares/authen/csrfProtection"); 
authenRouter.post("/register", parseForm, csrfProtection, register);
// userRouter.get("/", getAllUser);
// userRouter.get("/:id", getDetailUser);
// userRouter.put("/:id", checkExist(user), updateUser);
// userRouter.delete("/:id", checkExist(user), deleteUser);
authenRouter.post("/login",parseForm, csrfProtection, login);
authenRouter.post("/forgotpassword", parseForm, csrfProtection,forgotPassword);
authenRouter.post("/resetpassword",parseForm, csrfProtection, resetPassword);

module.exports = {
  authenRouter,
};
