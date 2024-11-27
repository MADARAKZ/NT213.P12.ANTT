const { prototype } = require("@sashido/teachablemachine-node");
const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op, where } = require("sequelize");
require('dotenv').config();
const register = async (req, res) => {
  const { name, email, password, confirmpassword, numberPhone, type } = req.body;
  try {
    // kiểm tra đã nhập đủ các trường thông tin hay chưa
    if(!name || !email || !password || !confirmpassword || !numberPhone) {
      return res
          .status(400)
          .json({message: "Vui lòng nhập đầy đủ các trường thông tin"});
    }

    // Kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau không
    if (password !== confirmpassword) {
      return res
          .status(400)
          .json({message: "Mật khẩu và xác nhận mật khẩu không khớp"});
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 8) {
      return res
          .status(400)
          .json({message: "Mật khẩu phải có ít nhất 8 ký tự"});
    }

    // Kiểm tra các yêu cầu về độ mạnh của mật khẩu
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      return res
          .status(400)
          .json({
            message: "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
          });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
          .status(400)
          .json({message: "Email không hợp lệ"});
    }

    // Kiểm tra số điện thoại hợp lệ (số điện thoại Việt Nam)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(numberPhone)) {
      return res
          .status(400)
          .json({message: "Số điện thoại không hợp lệ"});
    }

    // Kiểm tra xem email hoặc số điện thoại đã tồn tại hay chưa
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { numberPhone }],
      },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email hoặc số điện thoại đã tồn tại" });
    }

    // Nếu không tồn tại, tiến hành tạo người dùng mới
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      numberPhone,
      type,
    });
    return res.status(201).send(newUser);
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const loginGG = async (req, res) => {
  const body = req.body;
  const email = body.email;
  console.log("<<check body>>>>",body);
  const user = await User.findOne({ where: { email} });
  console.log("<<<user sau khi nhan>>>>",user)
  const token = jwt.sign(
    { id: user.id, email: user.email, type: user.type },
    "firewallbase64",
    { expiresIn: 60 * 60 }
  );
   
  const accessToken = jwt.sign(
    {email: user.email, id: user.id, type: user.type, name: user},
    process.env.ACCESS_TOKEN,
    {expiresIn: "15m"}
  );

  const refreshToken = jwt.sign(
    {id: user.id, type: user.type},
    process.env.REFRESH_TOKEN,
    {expiresIn: "7d"}
  );
  res.cookie("accessToken", accessToken, {httpOnly: true});
  console.log("<<<<<<<token cuar gooogle", accessToken);
  await user.update(
    { token: refreshToken },
    { where: { id: user.id } }
  );

  res.status(200).send({
    message: "successful",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // B1: Tìm user dựa trên email
  const user = await User.findOne({ where: { email } });
  if (user) {
    // B2: Kiểm tra mật khẩu có đúng hay không
    
    const isAuthen = bcrypt.compareSync(password, user.password);
    if (isAuthen) {
      const token = jwt.sign(
        { email: user.email, type: user.type },
        "firewallbase64",
        { expiresIn: 60 * 60 }
      );
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
      res.cookie("accessToken", accessToken, { httpOnly: true });
      console.log("refreshToken", refreshToken);
      console.log("<<<<<check USER>>>>>>",user)
      await user.update(
        { token: refreshToken },
        { where: { id: user.id } }
      );
  
      res.status(200).send({
        message: "successful",
        // token,
        // name: user.name,
        // type: user.type,
        // id: user.id,
        refreshToken: refreshToken,
        accessToken: accessToken,
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
  console.log("accessToken", token);

  if (!token) {
    console.log("fail");
    return res.status(401).send("No token found in cookies"); // Không tìm thấy token
  }

  try {
    console.log("ok")
    // Giải mã token và lấy thông tin người dùng
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN); // Giải mã token
    console.log("Decode:", decode);
    const userId = decode.userId;

    // Find the user in the database based on the userId
    const currentUser = await User.findOne({ where: { id: userId } });

    if (currentUser) {
      // Exclude the password from the response
      const { password,token, ...userWithoutPassword } = currentUser.toJSON();
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
    const userId = req.params.id;
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
  const { userId, currentPassword, newPassword } = req.body;

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
  const { id } = req.params;
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
    const detailHotel = await User.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).send(detailHotel);
  } catch (error) {
    res.status(500).send(error);
  }
};
module.exports = {
  register,
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
