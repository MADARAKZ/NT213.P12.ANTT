const editUser = [
  // Làm sạch dữ liệu đầu vào
  (req, res, next) => {
    sanitizeObject(req.body, [
      "name",
      "numberPhone",
      "gender",
      "type",
      "cccd",
      "address",
    ]);
    next();
  },
  // Validate các trường
  body("name").trim().notEmpty().withMessage("Vui lòng nhập tên."),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ.")
    .custom(async (value, { req }) => {
      const existingUser = await User.findOne({
        where: { email: value, id: { [Op.ne]: req.user.userId } },
      });
      if (existingUser) {
        throw new Error("Email đã tồn tại");
      }
    }),

  body("numberPhone")
    .trim()
    .matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/)
    .withMessage("Số điện thoại không hợp lệ."),

  body("cccd")
    .trim()
    .isNumeric()
    .isLength({ min: 9, max: 12 })
    .withMessage("CCCD phải chứa từ 9 đến 12 chữ số."),

  body("address").trim().notEmpty().withMessage("Địa chỉ không được để trống."),

  // Xử lý sau khi validate
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId; // Lấy ID người dùng từ token hoặc session
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

    try {
      // Tìm kiếm người dùng theo ID
      const detailUser = await User.findOne({ where: { id: userId } });

      if (!detailUser) {
        return res.status(404).send({
          status: "error",
          message: `User with id ${userId} not found`,
        });
      }

      // Cập nhật thông tin người dùng
      if (name) detailUser.name = name;
      if (email) detailUser.email = email;
      if (password) detailUser.password = password; // Nên mã hóa mật khẩu trước khi lưu vào CSDL
      if (numberPhone) detailUser.numberPhone = numberPhone;
      if (birthDate) detailUser.birthDate = birthDate;
      if (gender) detailUser.gender = gender;
      if (type) detailUser.type = type;
      if (cccd) detailUser.cccd = cccd;
      if (address) detailUser.address = address;

      // Lưu lại thông tin người dùng đã cập nhật
      const updatedUser = await detailUser.save(); // Gọi save để lưu các thay đổi

      // Kiểm tra việc cập nhật thành công
      if (!updatedUser) {
        return res.status(400).send({
          error: "error",
          message: `Failed to update user with id ${userId}`,
        });
      }

      // Gửi lại thông tin người dùng đã cập nhật
      res.status(200).send({ updatedUser });
    } catch (error) {
      console.error("Error updating user:", error); // Log lỗi
      res.status(500).send({ error: "Internal Server Error" });
    }
  },
];
