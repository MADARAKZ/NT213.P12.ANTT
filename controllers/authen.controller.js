const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { sanitizeObject } = require("../middlewares/validations/sanitize");

const register = async (req, res) => {
  const { name, email, password, numberPhone } = req.body;

  try {
    // Sanitize dữ liệu đầu vào
    const userData = { name, email, password, numberPhone };
    sanitizeObject(userData, ["name", "email", "password", "numberPhone"]);

    // Tạo chuỗi salt và mã hóa mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(userData.password, salt);

    // Tạo người dùng mới
    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashPassword,
      numberPhone: userData.numberPhone,
    });

    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send({ error: "Lỗi khi tạo người dùng", details: error });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sanitize dữ liệu đầu vào
    const loginData = { email, password };
    sanitizeObject(loginData, ["email", "password"]);

    // Tìm người dùng theo email
    const user = await User.findOne({
      where: {
        email: loginData.email,
      },
    });

    if (user) {
      // Xác thực mật khẩu
      const isAuthen = bcrypt.compareSync(loginData.password, user.password);

      if (isAuthen) {
        // Tạo JWT
        const token = jwt.sign(
          { email: user.email, type: user.type },
          process.env.JWT_SECRET,
          { expiresIn: "1h" } // Token hết hạn sau 1 giờ
        );

        res.status(200).send({
          message: "Đăng nhập thành công",
          token,
          type: user.type,
          id: user.id,
        });
      } else {
        res
          .status(401)
          .send({ message: "Đăng nhập thất bại, kiểm tra lại mật khẩu" });
      }
    } else {
      res.status(404).send({ message: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).send({ error: "Lỗi khi đăng nhập", details: error });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Sanitize email đầu vào
    const inputData = { email };
    sanitizeObject(inputData, ["email"]);

    const user = await User.findOne({ where: { email: inputData.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Tạo JWT token
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Gửi email chứa link reset mật khẩu
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: inputData.email,
      subject: "Password Reset Request",
      text: `Your password reset token is: ${token}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resetPassword = async (req, res) => {
  const { token, newpassword } = req.body;

  try {
    // Kiểm tra và sanitize mật khẩu mới
    const inputData = { token, newpassword };
    sanitizeObject(inputData, ["token", "newpassword"]);

    if (!inputData.newpassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Xác minh JWT token
    const decoded = jwt.verify(inputData.token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token" });
    }

    // Reset mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(inputData.newpassword, salt);
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
