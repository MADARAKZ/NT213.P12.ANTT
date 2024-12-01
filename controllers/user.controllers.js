const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
require("dotenv").config();
const { validationResult } = require("express-validator"); // Import validationResult
const { body } = require("express-validator");
const { sanitizeObject } = require("../middlewares/validations/sanitize");

const register = [
  // Làm sạch dữ liệu đầu vào
  (req, res, next) => {
    sanitizeObject(req.body, ["name", "email", "password", "numberPhone"]);
    next();
  },

  // Validate các trường
  body("name").trim().notEmpty().withMessage("Vui lòng nhập tên"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ")
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { email: value } });
      if (existingUser) {
        throw new Error("Email đã tồn tại");
      }
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Mật khẩu phải có ít nhất 8 ký tự")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    ),

  body("confirmpassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Mật khẩu và xác nhận mật khẩu không khớp");
    }
    return true;
  }),

  body("numberPhone")
    .trim()
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
    .withMessage("Số điện thoại không hợp lệ")
    .custom(async (value) => {
      const existingUser = await User.findOne({
        where: { numberPhone: value },
      });
      if (existingUser) {
        throw new Error("Số điện thoại đã tồn tại");
      }
    }),

  // Xử lý sau khi validate
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, numberPhone, type } = req.body;

    try {
      // Băm mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);

      // Tạo người dùng mới
      const newUser = await User.create({
        name,
        email,
        password: hashPassword,
        numberPhone,
        type,
      });

      // Trả về thông tin người dùng mới
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          numberPhone: newUser.numberPhone,
        },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

const loginGG = async (req, res) => {
  try {
    const { email, name, authGgId, refreshToken } = req.body;
    console.log("<<check body>>>>", req.body);

    // Tìm hoặc tạo user
    const user = await User.findOne({ where: { email } });

    console.log("check userrrrrrrrrrrrr", user);
    // Nếu user đã tồn tại, update thông tin
    await user.update({ token: refreshToken }, { where: { id: user.id } });
    console.log(created ? "New user created" : "User updated", user);

    res.status(200).send({
      message: "Login successful",
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // B1: Tìm user dựa trên email
  const user = await User.findOne({ where: { email } });
  if (user) {
    // B2: Kiểm tra mật khẩu có đúng hay không

    const isAuthen = bcrypt.compareSync(password, user.password);
    if (isAuthen) {
      const accessToken = jwt.sign(
        { userId: user.id, type: user.type },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { userId: user.id, type: user.type },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
      );
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 phút
      });
      console.log("refreshToken", refreshToken);
      console.log("<<<<<check USER>>>>>>", user);
      await user.update({ token: refreshToken }, { where: { id: user.id } });

      res.status(200).send({
        message: "successful",
        // token,
        // name: user.name,
        // type: user.type,
        // id: user.id,
        // refreshToken: refreshToken,
        // accessToken: accessToken,
      });
    } else {
      res
        .status(401)
        .send({ message: "dang nhap that bai, kiem tra lai mat khau" });
    }
  } else {
    res.status(404).send({ message: "khong co nguoi dung nay" });
  }
};

const getCurrentUser = async (req, res) => {
  console.log("Headers:", req.headers); // In ra headers
  console.log("Query Params:", req.query); // In ra query parameters
  console.log("Body:", req.body); // In ra body của request
  console.log("Cookies:", req.cookies); // In ra cookies, nếu có

  const token = req.cookies.accessToken; // Lấy token từ cookie
  //console.log("accessToken", token);

  if (!token) {
    console.log("fail");
    return res.status(401).send("No token found in cookies"); // Không tìm thấy token
  }

  try {
    console.log("ok");
    // Giải mã token và lấy thông tin người dùng
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN); // Giải mã token
    console.log("Decode:", decode);
    const userId = decode.userId;

    // Find the user in the database based on the userId
    const currentUser = await User.findOne({ where: { id: userId } });

    if (currentUser) {
      // Exclude the password from the response
      const { password, token, ...userWithoutPassword } = currentUser.toJSON();
      res.status(200).send(userWithoutPassword); // Return user info without password
    } else {
      res.status(404).send("User not found"); // User not found
    }
  } catch (error) {
    // Check for JWT specific errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).send("Invalid token"); // Invalid token
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired"); // Expired token
    }

    // Handle other errors
    console.error("Error decoding token:", error);
    res.status(500).send("Internal server error"); // Server error
  }
};

const getAllUser = async (req, res) => {
  const { name } = req.query;
  // console.log(data);
  try {
    if (name) {
      const UserList = await User.findAll({
        where: {
          name: {
            numberPhone,
            email,
          },
        },
      });
      res.status(200).send(UserList);
    } else {
      const UserList = await User.findAll();
      res.status(200).send(UserList);
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const displayUser = async (req, res) => {
  {
    try {
      const users = await User.findAll({ raw: true });
      res.render("user", { datatable: users });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
};
const editUser = async (req, res) => {
  console.log("10");
  try {
    const userId = req.user.userId;
    const {
      name,
      email,
      password,
      numberPhone,
      birthDate,
      gender,
      type,
      cccd,
      address,
    } = req.body;
    const detailUser = await User.findOne({
      where: {
        id: userId,
      },
    });
    if (!detailUser) {
      res.status(400).send({
        status: `error`,
        message: `User with id ${id}  not found`,
      });
    }
    if (name) detailUser.name = name;
    if (email) detailUser.email = email;
    if (password) detailUser.password = password;
    if (numberPhone) detailUser.numberPhone = numberPhone;
    if (birthDate) detailUser.birthDate = birthDate;
    if (gender) detailUser.gender = gender;
    if (type) detailUser.type = type;
    if (cccd) detailUser.cccd = cccd;
    if (address) detailUser.address = address;

    const updateUser = await detailUser.save();
    if (!updateUser)
      res.status(400).send({
        error: `error`,
        message: `Data fail to ${id} update`,
      });
    res.status(200).send({ updateUser }); // Gửi lại detailUser sau khi đã cập nhật thành công
  } catch (error) {
    res.status(500).send(error);
  }
};

const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const {userId} = req.user;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // So sánh mật khẩu hiện tại với mật khẩu đã được băm trong cơ sở dữ liệu
    const isPasswordValid = bcrypt.compareSync(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Kiểm tra mật khẩu mới phải có ít nhất 8 ký tự, có chữ hoa, chữ thường và ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        error:
          "New password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    // Băm mật khẩu mới
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

    // Cập nhật mật khẩu mới
    await user.update({ password: hashedNewPassword });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.user;
  try {
    const deletedUsers = await User.findOne({
      where: {
        id,
      },
    });
    await deletedUsers.destroy({ cascade: true });

    res.status(200).send("Successful");
  } catch (error) {
    res.status(500).send(error);
  }
};
const updateImage = async (req, res) => {
  const { id } = req.user;
  console.log("id", id);
  try {
    const updateHotel = await User.findOne({
      where: {
        id,
      },
    });

    if (!updateHotel) {
      return res.status(404).send("User not found");
    }

    const { file } = req;

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    console.log(file);
    const imagePath = file.path;
    console.log(imagePath);

    updateHotel.url = imagePath;
    await updateHotel.save(); // Sửa từ updateUser thành updateHotel
    res.status(200).send("Successful");
  } catch (error) {
    res.status(500).send(error);
  }
};

const getDetailUser = async (req, res) => {
  console.log("3");
  try {
    const userId = req.user.userId;
    const detailHotel = await User.findOne({
      where: {
        id: userId,
      },
    });
    res.status(200).send(detailHotel);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Xử lí logout
const Logout = async (req, res) => {
  try {
    // Lấy thông tin người dùng từ token
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token" });
    }

    // Giải mã token để lấy userId
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN);
    const userId = decode.userId;

    // Tìm người dùng
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Xóa refresh token trong database
    await user.update({ token: null });

    // Xóa access token trong cookie
    res.clearCookie("accessToken");

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);

    // Nếu là lỗi token hết hạn hoặc không hợp lệ
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    // Trả về lỗi server nếu có lỗi khác
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
};
module.exports = {
  register,
  Logout,
  login,
  getAllUser,
  displayUser,
  editUser,
  deleteUser,
  updateImage,
  getDetailUser,
  // checkEmailExist,
  updatePassword,
  loginGG,
  getCurrentUser,
};
