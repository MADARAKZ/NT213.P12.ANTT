const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, where } = require("sequelize");
require("dotenv").config();
const { validationResult } = require("express-validator"); // Import validationResult
const { body } = require("express-validator");
const {
  sanitizeObject,
  validateAndSanitizeEmail,
} = require("../middlewares/validations/sanitize");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const otpResendLimits = {};
const otpSendLimits = {};


let registrationOTPCode = null;
let registrationUserData = null;

const otpStoragelogin = {};
const otpStorageregister = {}

//Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Hàm kiểm tra giới hạn gửi OTP
function canSendOTP(email) {
  const RESEND_COOLDOWN = 30000; // 30 giây giữa các lần gửi
  const currentTime = Date.now();
  
  if (!otpResendLimits[email]) {
    return true;
  }
  
  const timeSinceLastSend = currentTime - otpResendLimits[email];
  return timeSinceLastSend >= RESEND_COOLDOWN;
}

//Generate OTP
function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return {
    code: otp,
    createdAt: Date.now(),
    attempts: 0
  };
}

//Check OTP Valid
function isOTPvalid(storedotp, userProvidedOTP){

  const OTP_EXPIRATION = 10*60*1000;
  const MAX_ATTEMPTS = 5;
  
  if(!storedotp) return {valid: false, message: 'No OTP found'};
  
  //check otp expired
  if(Date.now()- storedotp.createdAt > OTP_EXPIRATION)
  {
    return {valid: false, message: 'OTP has expired'};
  }
  //check maximum attempts
  if(storedotp.attempts > MAX_ATTEMPTS){
    return {valid: false, message: 'Too many verifycation attemps. OTP đã bị vô hiệu hóa'}
  }
  const isCorrect = storedotp.code === userProvidedOTP
  storedotp.attempts++;
  return {
    valid: isCorrect,
    message: isCorrect ? 'OTP verified succes' : 'Incorrect OTP'
  }
}

const register = [
  // Làm sạch dữ liệu đầu vào
  (req, res, next) => {
    sanitizeObject(req.body, ["name", "password", "confirmpassword", "numberPhone", "type"]);
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

    const { name, email, password, cofirmpassword, numberPhone, type } = req.body;
   

    try {
      // limit send otp
      if (!canSendOTP(email)) {
        return res.status(429).json({ 
          message: 'Vui lòng đợi 30s trước khi gửi lại OTP' 
        });
      }
      const otp = generateOTP()
      otpStorageregister[email] = otp
      //registrationOTPCode = otp
      registrationUserData = { 
        name, 
        email, 
        password, 
        numberPhone, 
        type 
      };

      // Cập nhật thời gian gửi OTP
      otpResendLimits[email] = Date.now();
      // Send OTP email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Xác Nhận Đăng Ký Tài Khoản',
        html: `
          <h2>Mã Xác Nhận Đăng Ký</h2>
          <p>Mã OTP của bạn là: <strong>${otp.code}</strong></p>
          <p>Mã này sẽ hết hạn sau 10 phút</p>
        `
      };

      await transporter.sendMail(mailOptions);
      // Băm mật khẩu
      // const salt = await bcrypt.genSalt(10);
      // const hashPassword = await bcrypt.hash(password, salt);

      // // Tạo người dùng mới
      // const newUser = await User.create({
      //   name,
      //   email,
      //   password: hashPassword,
      //   numberPhone,
      //   type,
      // });

      // Trả về thông tin người dùng mới
      return res.status(200).json({
        message: "OTP Da duoc gui",
        email: email
        // user: {
        //   id: newUser.id,
        //   name: newUser.name,
        //   email: newUser.email,
        //   numberPhone: newUser.numberPhone,
        // },
      });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

// OTP Verification for Registration
const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("OTP phia back end", registrationOTPCode)
    // Validate OTP
    const storedotp = otpStorageregister[email];
    const validationResult = isOTPvalid(storedotp, otp)
    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Check if user data exists
    if (!registrationUserData) {
      return res.status(400).json({ message: 'Không tìm thấy thông tin đăng ký' });
    }

    // Destructure user data
    const { name, mail, password, numberPhone, type } = registrationUserData;
    console.log("name",name)
    console.log("pasword", password)



    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      numberPhone,
      type,
    });

    // Clear registration data
    //registrationOTPCode = null;
    registrationUserData = null;
    delete otpStorageregister[email];

    // Return user info
    return res.status(201).json({
      message: "Đăng ký thành công",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        numberPhone: newUser.numberPhone,
      },
    });

  } catch (error) {
    console.error("Error verifying registration OTP:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// Resend Registration OTP
const resendRegistrationOTP = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email tu ")


    // Kiểm tra giới hạn gửi OTP
    if (!canSendOTP(email)) {
      return res.status(429).json({ 
        message: 'Vui lòng đợi 30s trước khi gửi lại OTP' 
      });
    }

    // Check if registration data exists
    if (!registrationUserData || registrationUserData.email !== email) {
      return res.status(400).json({ message: 'Không tìm thấy thông tin đăng ký' });
    }

    // Generate new OTP
    const otp = generateOTP();
    otpStorageregister[email]= otp

    // Cập nhật thời gian gửi OTP
    otpResendLimits[email] = Date.now();

    // Send new OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Mã OTP Mới - Đăng Ký Tài Khoản',
      html: `
        <h2>Mã OTP Mới Của Bạn</h2>
        <p>Mã OTP mới là: <strong>${otp.code}</strong></p>
        <p>Mã này sẽ hết hạn sau 10 phút</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'OTP mới đã được gửi' });

  } catch (error) {
    console.error('Lỗi gửi lại OTP đăng ký:', error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

const loginGG = async (req, res) => {
  try {
    const { email, name, authGgId, refreshToken } = req.body;
    console.log("<<check body>>>>", req.body);

    // Tìm hoặc tạo user
    const user = await User.findOne({ where: { email } });

    console.log("check userrrrrrrrrrrrr", user);

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
  try {
    const { email, password } = req.body;

    // B1: Kiểm tra email có hợp lệ
    if (!email) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    // B2: Kiểm tra mật khẩu có hợp lệ
    if (!password || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Mật khẩu không hợp lệ hoặc bị thiếu" });
    }
    
    // Kiểm tra giới hạn gửi OTP
    if (!canSendOTP(email)) {
      return res.status(429).json({ 
        message: 'Vui lòng đợi 30s trước khi gửi OTP' 
      });
    }

    // B3: Tìm user dựa trên email đã được làm sạch
    const user = await User.findOne({
      where: { email }, // Sequelize sẽ xử lý tránh SQL Injection
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    // B4: Kiểm tra mật khẩu
    const isAuthen = await bcrypt.compare(password, user.password);

    if (!isAuthen) {
      return res
        .status(401)
        .json({ message: "Đăng nhập thất bại, kiểm tra lại mật khẩu" });
    }

    // B5: Tạo mã OTP
    const otp = generateOTP();
    otpStoragelogin[email]=otp;

    // Cập nhật thời gian gửi OTP
    otpResendLimits[email] = Date.now();

    // Gửi OTP qua email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Mã OTP Đăng Nhập",
      html: `
        <h2>Mã OTP Của Bạn</h2>
        <p>Mã OTP của bạn là: <strong>${otp.code}</strong></p>
        <p>Mã này sẽ hết hạn sau 10 phút</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP đã được gửi");

    // Phản hồi thành công
    return res.status(200).json({
      message: "Đăng nhập thành công. OTP đã được gửi đến email của bạn.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
  }
};

//Xác thực OTP
async function verifyOTP(req, res) {
  try {
    const { userId, email, otp } = req.body;

    //kiểm tra otp từ redis
    //const otpkey = `otp:${userId}`;
    //const storedotp = await redisClient.get(otpkey);
    console.log("<<<OTP nhan duoc>>", otp);
    const storedotp = otpStoragelogin[email];

    const validationResult = isOTPvalid(storedotp, otp)

    if (!validationResult.valid) {
      return res.status(400).json({ message: validationResult.message });
    }

    // Reset OTP after successful verification
    delete otpStoragelogin[email];
    //await redisClient.del(otpkey);
    console.log(">>>>Da xasc thuc otp>>>>");
    //Xử lí khi xác thực thành công
    const user = await User.findOne({ where: { email } });
    const accessToken = jwt.sign(
      { userId: user.id, type: user.type },
      process.env.ACCESS_TOKEN,
      { expiresIn: "40m" }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.REFRESH_TOKEN,
      { expiresIn: "7d" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1440 * 60 * 1000, // 15 phút
    });
    console.log("refreshToken", refreshToken);
    console.log("<<<<<check USER>>>>>>", user);
    await user.update({ token: refreshToken }, { where: { id: user.id } });
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Lỗi xác thực OTP:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

//Gửi lại OTP
async function resendOTP(req, res) {
  try {
    const { userId, email } = req.body;

     // Kiểm tra giới hạn gửi OTP
    if (!canSendOTP(email)) {
      return res.status(429).json({ 
        message: 'Vui lòng đợi 1 phút trước khi gửi lại OTP' 
      });
    }

    // 1. Tìm người dùng
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }

    // 2. Sinh OTP mới
    const otp = generateOTP();
    otpStoragelogin[email] = otp
    //const otpKey = `otp:${userId}`;
    
    // Cập nhật thời gian gửi OTP
    otpResendLimits[email] = Date.now();

    // 4. Gửi email OTP mới
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "OTP Mới - Đăng Nhập",
      html: `
              <h2>Mã OTP Mới Của Bạn</h2>
              <p>Mã OTP mới là: <strong>${otp.code}</strong></p>
              <p>Mã này sẽ hết hạn sau 10 phút</p>
          `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP mới đã được gửi" });
  } catch (error) {
    console.error("Lỗi gửi lại OTP:", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

const getCurrentUser = async (req, res) => {
  console.log("Headers:", req.headers); // In ra headers
  console.log("Query Params:", req.query); // In ra query parameters
  console.log("Body:", req.body); // In ra body của request
  console.log("Cookies:", req.cookies); // In ra cookies, nếu có

  const token = req.cookies.accessToken; // Lấy token từ cookie
  const refreshToken = req.cookies.Token;
  //console.log("accessToken", token);

  if (!token) {
    if (!refreshToken) {
      console.log("fail");
      return res.status(401).send("No token found in cookies"); // Không tìm thấy token
    }
    const decodeRefreshtoken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN
    );
    const newAccessToken = await RefreshToken(decodeRefreshtoken.userId);
    console.log("Token moi", newAccessToken);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 phút
    });
    token = newAccessToken;
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

//Hàm refresh token thông qua id
async function RefreshToken(userId) {
  const user = await User.findOne({ where: { id: userId } });
  console.log("Useerr token", user);
  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  const newAccessToken = jwt.sign(
    { userId: user.id, type: user.type },
    process.env.ACCESS_TOKEN,
    { expiresIn: "40m" }
  );
  console.log("Token moi,", newAccessToken);
  return newAccessToken;
}

const getAllUser = async (req, res) => {
  // Check if the user is an admin
  if (!req.user || req.user.type !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  const { name } = req.query;

  try {
    let UserList;
    if (name) {
      UserList = await User.findAll({
        where: {
          name: name,
        },
      });
    } else {
      UserList = await User.findAll();
    }
    res.status(200).send(UserList);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Internal server error");
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

const getDetailingUser = async (req, res) => {
  console.log("3");
  try {
    const { id } = req.params; // Extract the id from req.params
    console.log("id", id);
    const detailUser = await User.findOne({
      where: {
        id: id,
      },
    });
    console.log("detailUser", detailUser);
    if (!detailUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).send(detailUser);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal Server Error");
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

const editUserAdmin = async (req, res) => {
  console.log("10");
  try {
    const userId = req.params.id;
    const { name, email, numberPhone, type } = req.body;
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
    if (numberPhone) detailUser.numberPhone = numberPhone;
    if (type) detailUser.type = type;

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
  const { userId } = req.user.userId;
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
  const { id } = req.params;
  console.log("id", id);
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
  const id = req.user.userId;
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
    res.clearCookie("refreshToken");

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
  getDetailingUser,
  Logout,
  login,
  getAllUser,
  displayUser,
  editUser,
  editUserAdmin,
  deleteUser,
  updateImage,
  getDetailUser,
  // checkEmailExist,
  updatePassword,
  loginGG,
  getCurrentUser,
  verifyOTP,
  resendOTP,
  verifyRegistrationOTP,
  resendRegistrationOTP
};
