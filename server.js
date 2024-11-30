const express = require("express");
const path = require("path");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const exphbs = require("express-handlebars");
const { sequelize } = require("./models");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var store = require("store");
var LocalStorage = require("node-localstorage").LocalStorage;
const ratelimit = require("express-rate-limit");
const helmet = require("helmet");

const {
  csrfProtection,
  parseForm,
  cookieParser,
} = require("./middlewares/authen/csrfProtection");
// require("./passport");
const { rootRouter } = require("./routers");
const { User } = require("./models/User");
const { access } = require("fs");
var ls = require("local-storage");

const {
  authenticateToken,
  requireAdmin,
  requireCustomer,
} = require("./middlewares/authen/auth.middleware");
const c = require("config");
const { constants } = require("buffer");
require("dotenv").config();
const app = express();
// Sử dụng session middleware trước nếu bạn cần dùng session
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // Ensure this line is present
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3030", // Domain của frontend
    credentials: true, // Đảm bảo gửi và nhận cookies
  })
);
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many API request from this IP",
});

app.use(express.json({ extended: true }));
app.use(express.urlencoded());
app.use(
  session({
    secret: process.env.SECRET_KEY, // Thay bằng một chuỗi bí mật mạnh
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false, // Đặt true nếu dùng HTTPS
      sameSite: "Strict", // Ngăn chặn tấn công CSRF
    },
  })
);

// use helmet

// Cấu hình Helmet CSP (Content Security Policy)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow resources only from the same origin (self)

      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://apis.google.com",
        "https://ajax.googleapis.com",
        "https://code.jquery.com/",
        "https://sandbox.vnpayment.vn",
        "https://teachablemachine.withgoogle.com",
        "https://embed.pickaxeproject.com", // Allow scripts from Google APIs
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],
      scriptSrcAttr: ["'self'", "https://www.bing.com"], // Allow inline event handlers
      styleSrc: [
        "'self'", // Allow styles from the same origin
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com", // Font Awesome, Bootstrap from CDN
        "https://fonts.googleapis.com", // Google Fonts from CDN
        "https://fonts.gstatic.com", // Google Fonts static resources
        "https://cdn.jsdelivr.net", // Bootstrap styles
        "https://netdna.bootstrapcdn.com", // Bootstrap fonts // Allow inline styles (use this cautiously; hashes or nonces are safer)
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],

      imgSrc: [
        "'self'", // Allow images from the same origin
        "https://res.cloudinary.com",
        "https://th.bing.com",
        "https://www.bing.com",
        "https://phongreviews.com", // Cloudinary for images
        "data:", // Allow data URIs (used for inline images or icons)
      ],

      fontSrc: [
        "'self'", // Allow fonts from the same origin
        "https://cdnjs.cloudflare.com", // Font Awesome
        "https://fonts.googleapis.com", // Google Fonts stylesheets
        "https://fonts.gstatic.com", // Google Fonts static resources
        "https://netdna.bootstrapcdn.com", // Bootstrap fonts
      ],

      connectSrc: [
        "'self'", // Allow connections (e.g., API calls) from the same origin
        "https://example.com",
        "https://sandbox.vnpayment.vn",
        "https://teachablemachine.withgoogle.com", // Replace with your specific API endpoint if needed
      ],

      objectSrc: ["'none'"], // Disallow all object, embed, or plugin-based resources for security

      frameSrc: [
        "'self'", // Allow frames from the same origin (if embedding is required)
        "https://www.google.com",
        "https://www.bing.com",
        "https://teachablemachine.withgoogle.com",
        "https://embed.pickaxeproject.com", // Example: embedding Google Maps
      ],

      upgradeInsecureRequests: [], // Optionally enforce all requests to be over HTTPS (optional)
    },
  })
);

app.get("/image/classify", async (req, res) => {
  const { url } = req.query;

  return model
    .classify({
      imageUrl: url,
    })
    .then((predictions) => {
      console.log(predictions);
      return res.json(predictions);
    })
    .catch((e) => {
      console.error(e);
      res.status(500).send("Something went wrong!");
    });
});

// Setup JSON parsing
app.use(express.json());

const publicPathDirectory = path.join(__dirname, "./public");
app.use(express.static(publicPathDirectory));
// Use routers
app.use("/api/v1", rootRouter);

// Define routes
app.get("/", csrfProtection, (req, res) => {
  res.render("User/mainpage", { csrfToken: req.csrfToken() });
});

app.get("/chatbotimage", csrfProtection, (req, res) => {
  res.render("User/chatbotImage", { csrfToken: req.csrfToken() });
});
app.get("/chatbot", csrfProtection, (req, res) => {
  res.render("User/chatbot", { csrfToken: req.csrfToken() });
});

app.get("/hotelList", csrfProtection, (req, res) => {
  res.render("User/hotelList", { csrfToken: req.csrfToken() });
});

app.get("/supplier", csrfProtection, (req, res) => {
  res.render("User/supplier", { csrfToken: req.csrfToken() });
});

app.get("/register", csrfProtection, (req, res) => {
  // Render trang đăng ký với CSRF token
  res.render("User/register", { csrfToken: req.csrfToken() });
});

app.get("/aboutUs", csrfProtection, (req, res) => {
  res.render("User/aboutUs", { csrfToken: req.csrfToken() });
});

app.get(
  "/userInfo",
  csrfProtection,
  authenticateToken,
  requireCustomer,
  (req, res) => {
    res.render("User/userInfo", { csrfToken: req.csrfToken() });
  }
);
app.get("/signin", limiter, csrfProtection, (req, res) => {
  res.render("User/signin", { csrfToken: req.csrfToken() });
});

app.get("/user", csrfProtection, (req, res) => {
  // Render the sidebar template directly (no need for separate route)
  res.render("User/user", { csrfToken: req.csrfToken() });
});
app.get("/payment", csrfProtection, (req, res) => {
  res.render("User/payment", { csrfToken: req.csrfToken() });
});
app.get("/paymentmethod", csrfProtection, (req, res) => {
  res.render("User/paymentMethod", { csrfToken: req.csrfToken() });
});
app.get("/result", csrfProtection, (req, res) => {
  res.render("User/result", { csrfToken: req.csrfToken() });
});
app.get("/resultTT", csrfProtection, (req, res) => {
  res.render("User/resultTT", { csrfToken: req.csrfToken() });
});
app.get("/coupons", csrfProtection, (req, res) => {
  // Rendecouponsidebar template dir
  res.render("coupons", { csrfToken: req.csrfToken() });
});
app.get(
  "/dashboard",
  csrfProtection,
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.render("Admin/dashboard", { csrfToken: req.csrfToken() });
  }
);

app.get("/agentInfo", csrfProtection, (req, res) => {
  res.render("User/agentInfo", { csrfToken: req.csrfToken() });
});
app.get(
  "/ManageRoom/:id",
  csrfProtection,
  authenticateToken,
  requireAdmin,
  (req, res) => {
    var hotelId = req.params.id;
    res.render(
      "Admin/partials/room",
      { roomId: hotelId },
      { csrfToken: req.csrfToken() }
    );
  }
);
app.get(
  "/ManageHotelService/:id",
  csrfProtection,
  authenticateToken,
  requireAdmin,
  (req, res) => {
    var hotelId = req.params.id;
    res.render(
      "Admin/partials/HotelService",
      { id: hotelId },
      { csrfToken: req.csrfToken() }
    );
  }
);

app.get("/myBooking", csrfProtection, (req, res) => {
  res.render("User/myBooking", { csrfToken: req.csrfToken() });
});

app.get("/ManageRoomService/:id", csrfProtection, (req, res) => {
  var roomId = req.params.id;
  res.render(
    "Admin/partials/RoomService",
    { id: roomId },
    { csrfToken: req.csrfToken() }
  );
});

function ChangeToSlug(title) {
  var slug;
  slug = title.toLowerCase();
  slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
  slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
  slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
  slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
  slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
  slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
  slug = slug.replace(/đ/gi, "d");
  slug = slug.replace(
    /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
    ""
  );
  slug = slug.replace(/ /gi, "-");
  slug = slug.replace(/\-\-\-\-\-/gi, "-");
  slug = slug.replace(/\-\-\-\-/gi, "-");
  slug = slug.replace(/\-\-\-/gi, "-");
  slug = slug.replace(/\-\-/gi, "-");
  slug = "@" + slug + "@";
  slug = slug.replace(/\@\-|\-\@|\@/gi, "");
  slug = slug.trim();
  return slug;
}

function findHotelBySlug(slug) {
  return fetch("http://localhost:3030/api/v1/hotels/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Lỗi khi gọi API");
      }
      return response.json();
    })
    .then((hotels) => {
      // Tìm khách sạn với slug tương ứng trong danh sách
      const hotel = hotels.find((hotel) => ChangeToSlug(hotel.name) == slug);
      return hotel;
    })
    .catch((error) => {
      console.error("Lỗi khi gọi API:", error);
      throw error;
    });
}

app.get("/hotel/:slug/:id", csrfProtection, (req, res) => {
  var slug = req.params.slug;
  var hotel = findHotelBySlug(slug);

  if (hotel) {
    var hotelId = hotel.id;
    console.log(hotelId);
    res.render("User/hotel", { csrfToken: req.csrfToken() });
  } else {
    alert("loi");
  }
});

// app.get("/userInfo/:id", (req, res) => {
//   var id = req.params.id;
//   res.render("User/userInfor", { id: id });
// });

app.get("/userInfor", csrfProtection, (req, res) => {
  res.render("User/userInfor", { csrfToken: req.csrfToken() });
});

// app.get("/admin", (req, res) => {
//   res.render("Admin/partials/createHotel");
// });

// app.get("/admin/hotel", (req, res) => {
//   res.render("Admin/partials/agent");
// });
app.get("/admin/addHotel", csrfProtection, (req, res) => {
  res.render("Admin/partials/agentForm", { csrfToken: req.csrfToken() });
});
app.get("/agent/addHotel", csrfProtection, (req, res) => {
  res.render("Admin/partials/agentForm", { csrfToken: req.csrfToken() });
});
// app.get("/admin/Hotel/Service", (req, res) => {
//   res.render("Admin/partials/HotelService");
// });
// app.get("/admin/room/service", (req, res) => {
//   res.render("Admin/partials/RoomService");
// });
// app.get("/admin/room/", (req, res) => {
//   res.render("Admin/partials/room");
// });
// app.get("/BookingRoom", (req, res) => {
//   res.render("Admin/partials/Booking");
// });

app.get("/ForgotPass", csrfProtection, (req, res) => {
  res.render("User/forgotPass", { csrfToken: req.csrfToken() });
});

app.get("/resetpassword", csrfProtection, (req, res) => {
  res.render("user/resetPass", { csrfToken: req.csrfToken() });
});
app.get("/login-success", csrfProtection, (req, res) => {
  res.render("user/loginSuccess", { csrfToken: req.csrfToken() });
});

app.use(passport.initialize());
app.use(passport.session());

// Middleware to refresh access token
app.post("/token", csrfProtection, async (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) return res.sendStatus(401);

  const storedToken = await User.findOne({ where: { token: refreshToken } });
  if (!storedToken) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { userId: user.userId, type: user.type },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.json({ accessToken });
  });
});

// Configure Handlebars
const hbs = exphbs.create({
  extname: "hbs",
  defaultLayout: false,
  partialsDir: [
    __dirname + "/views/User/partials",
    __dirname + "/views/Admin/partials",
  ],
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");

const port = process.env.PORT || 3030; // Sử dụng port mặc định là 3030 nếu không có biến môi trường PORT

// app.get("/hotel/:id", (req, res) => {
//   const hotelId = req.params.id;

//   // Call API to get hotel information
//   fetch(`http://localhost:${port}/api/v1/hotels?id=${hotelId}`)
//     .then((response) => response.json())
//     .then((data) => {
//       // Render Handlebars template and pass data into it
//       res.render("User/hotel", { hotel: data });
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       res.status(500).send("Internal Server Error");
//     });
// });

// Listen for connection events
app.listen(port, async () => {
  console.log("App listening on http://localhost:3030");
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
