const config = require("config");
const crypto = require("crypto");
const moment = require("moment");
const queryString = require("qs");
const { Booking,User,Room,Hotels } = require("../models");
const nodemailer = require("nodemailer");
// Lấy cấu hình VNPAY từ file config/default.json
const vnpConfig = config.get("vnpay");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function createPaymentUrl(req, res) {
  let ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  let tmnCode = vnpConfig.tmnCode;
  let secretKey = vnpConfig.hashSecret;
  let vnpUrl = vnpConfig.url;
  let returnUrl = vnpConfig.returnUrl;

  let date = new Date();

  let createDate = moment(date).format("YYYYMMDDHHmmss");
  const { orderId, amount, orderInfo, orderType, bankCode } = req.body;
  let locale = req.body.locale || "vn";
  let currCode = "VND";

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  let signData = queryString.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + queryString.stringify(vnp_Params, { encode: false });

  res.json({ code: "00", data: { url: vnpUrl } });
}
async function vnpayReturn(req, res, next) {
  try {
    const vnp_Params = req.query;
    const secureHash = vnp_Params["vnp_SecureHash"];
    const orderId = vnp_Params["vnp_TxnRef"];
    const responseCode = vnp_Params["vnp_ResponseCode"];
    const transID = vnp_Params["vnp_TransactionNo"];

    // Loại bỏ các trường không cần thiết để xác minh chữ ký
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sắp xếp lại các tham số theo thứ tự abc và chuẩn bị dữ liệu để xác minh
    const sortedParams = sortObject(vnp_Params);
    const signData = Object.keys(sortedParams)
      .reduce((acc, key) => {
        acc.push(`${key}=${sortedParams[key]}`);
        return acc;
      }, [])
      .join("&");

    const hmac = crypto.createHmac("sha512", config.get("vnpay.hashSecret"));
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash !== signed) {
      throw new Error("Invalid signature");
    }

    const booking = await Booking.findOne({
      where: { id: orderId },
      include: [
        { model: User },
      ],
    });
    if (!booking) {
      throw new Error("Order not found");
    }
    const user = booking.User;
    const room = await Room.findOne({ where: { id: booking.room_id } });
    const hotel = await Hotels.findOne({ where: { id: booking.hotel_id } });


    // Giao dịch thành công
    if (responseCode === "00") {
      await Booking.update({ status: true, trans_id: transID }, { where: { id: orderId } });

      // Gửi email thông báo
      await sendSuccessEmail(user,booking,room,hotel,transID);

      // Redirect đến trang kết quả thành công
      return res.redirect("/result?status=success");
    } else {
      // Giao dịch thất bại
      await Booking.destroy({ where: { id: orderId } });

      // Redirect đến trang kết quả thất bại
      return res.redirect("/result?status=failure&code="+responseCode); 
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error" });
  }
}
async function sendSuccessEmail(user, booking, room, hotel, transid) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Hoặc SMTP server của bạn
    auth: {
      user: process.env.EMAIL_USER, // Thay bằng email của bạn
      pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email, // Email người dùng từ thông tin booking
    subject: "Thông báo thanh toán thành công",
    html: `
      <h1>Thanh toán thành công</h1>
      <p>Chào ${user.name},</p>
      <p>Đơn hàng của bạn với mã số <strong>${transid}</strong> đã được thanh toán thành công.</p>
      <p>Chi tiết:</p>
      <ul>
        <li><strong>Ngày đặt:</strong> ${booking.check_in_date}</li>
        <li><strong>Tổng tiền:</strong> ${booking.total_price} VND</li>
        <li><strong>Khách sạn:</strong> ${hotel.name}</li>
        <li><strong>Phòng:</strong> ${room.name}</li>
        <li><strong>Loại giường:</strong> ${room.type_bed}</li>
      </ul>
      <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
  }
}
function sortObject(obj) {
  var sorted = {};
  var str = [];
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

module.exports = {
  createPaymentUrl,
  vnpayReturn,
};
