const otpModal = document.getElementById("otpModal");
const otpForm = document.getElementById("otpForm");
const otpInput = document.getElementById("otpInput");
const otpError = document.getElementById("otpError");
const resendOTPLink = document.getElementById("resendOTP");
const closeOTPModalBtn = document.querySelector(".close-btn");

let currentUserEmail = null;

function closeOTPModal() {
  $("#otpModal").css("display", "none");
}

// Click event close otpmodal
closeOTPModalBtn.addEventListener("click", closeOTPModal);

const registerUser = (event) => {
  event.preventDefault();

  const name = $("#name").val().trim();
  const email = $("#email").val().trim();
  const password = $("#password").val().trim();
  const confirmpassword = $("#re-password").val().trim();
  const numberPhone = $("#numberPhone").val().trim();

  // Lấy `type` từ query parameter
  const urlParams = new URLSearchParams(window.location.search);
  let type = urlParams.get("type");
  if (type !== "owner") {
    alert("Type không phù hợp, làm client thôi");
    type = "client";
  }

  // Validate trước khi gửi
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  let isValid = true;

  // Reset error messages
  $(
    "#name-error, #email-error, #phone-error, #password-error, #re-password-error"
  ).text("");

  // Validate name
  if (name === "") {
    $("#name-error").text("Tên không được để trống");
    isValid = false;
  }

  // Validate email
  if (!emailRegex.test(email)) {
    $("#email-error").text("Email không hợp lệ");
    isValid = false;
  }

  // Validate phone
  if (!phoneRegex.test(numberPhone)) {
    $("#phone-error").text("Số điện thoại không hợp lệ");
    isValid = false;
  }

  // Validate password
  if (!passwordRegex.test(password)) {
    $("#password-error").text(
      "Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
    );
    isValid = false;
  }

  // Validate confirm password
  if (password !== confirmpassword) {
    $("#re-password-error").text("Mật khẩu xác nhận không khớp");
    isValid = false;
  }

  // Nếu không hợp lệ, không gửi request
  if (!isValid) {
    return;
  }

  // Chuẩn bị dữ liệu
  const data = {
    name: name,
    email: email,
    password: password,
    confirmpassword: confirmpassword,
    numberPhone: numberPhone,
    type: type,
  };

  // Lấy CSRF token
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  // Gửi request đăng ký
  $.ajax({
    url: "/api/v1/users/register",
    type: "POST",
    credentials: "same-origin",
    headers: {
      "CSRF-TOKEN": token,
      "Content-Type": "application/json",
    },
    data: JSON.stringify(data),
    success: function (result) {
      // Lưu email để sử dụng cho việc xác thực OTP sau này
      currentUserEmail = email;

      // Hiển thị modal OTP
      $("#otpModal").css("display", "flex");

      // Hiển thị thông báo thành công
      otpError.textContent = "OTP đã được gửi tới email của bạn";
      otpError.style.color = "green";
    },
    error: function (xhr, status, error) {
      console.error("Error:", xhr.responseJSON);

      // Xử lý các lỗi từ backend
      if (xhr.responseJSON && xhr.responseJSON.errors) {
        const errors = xhr.responseJSON.errors;

        // Hiển thị các lỗi chi tiết từ backend
        errors.forEach((err) => {
          switch (err.path) {
            case "name":
              $("#name-error").text(err.msg);
              break;
            case "email":
              $("#email-error").text(err.msg);
              break;
            case "password":
              $("#password-error").text(err.msg);
              break;
            case "confirmpassword":
              $("#re-password-error").text(err.msg);
              break;
            case "numberPhone":
              $("#phone-error").text(err.msg);
              break;
          }
        });
      } else {
        // Lỗi chung
        otpError.textContent = "Có lỗi xảy ra khi đăng ký";
        otpError.style.color = "red";
      }
    },
  });
};

// Thêm các sự kiện để kiểm tra dữ liệu khi người dùng nhập
$(document).ready(function () {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  $("#name").on("blur", function () {
    if ($(this).val().trim() === "") {
      $("#name-error").text("Tên không được để trống");
    } else {
      $("#name-error").text("");
    }
  });

  $("#email").on("blur", function () {
    if (!emailRegex.test($(this).val().trim())) {
      $("#email-error").text("Email không hợp lệ");
    } else {
      $("#email-error").text("");
    }
  });

  $("#numberPhone").on("blur", function () {
    if (!phoneRegex.test($(this).val().trim())) {
      $("#phone-error").text("Số điện thoại không hợp lệ");
    } else {
      $("#phone-error").text("");
    }
  });

  $("#password").on("blur", function () {
    const password = $(this).val().trim();
    if (!passwordRegex.test(password)) {
      $("#password-error").text(
        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
      );
    } else {
      $("#password-error").text("");
    }
  });

  $("#re-password").on("blur", function () {
    const password = $("#password").val().trim();
    const confirmpassword = $(this).val().trim();
    if (password !== confirmpassword) {
      $("#re-password-error").text("Mật khẩu xác nhận không khớp");
    } else {
      $("#re-password-error").text("");
    }
  });

  $("#registerButton").click(registerUser);
});

// OTP form Submit Event
otpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const otp = otpInput.value;
  console.log("OTP nhan duoc tu front end", otp);
  // Validate OTP length
  if (otp.length !== 6) {
    otpError.textContent = "OTP phải có 6 chữ số";
    otpError.style.color = "red";
    return;
  }

  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  $.ajax({
    url: "/api/v1/users/verify-register-otp",
    type: "POST",
    credentials: "same-origin",
    headers: {
      "CSRF-Token": token,
    },
    contentType: "application/json",
    data: JSON.stringify({
      email: currentUserEmail,
      otp: otp,
    }),
    success: function (result) {
      const user = result.user;
      console.log("DA tao tai khoan thanh cong");
      window.location.href = "/signin";
    },
    error: function (xhr, status, error) {
      otpError.textContent =
        xhr.responseJSON.message || "Xác thực OTP thất bại";
      otpError.style.color = "red";
    },
  });

  // fetch("/api/v1/users/verify-register-otp", {
  //   method: "POST",
  //   credentials: "include",
  //   headers: {
  //     "Content-Type": "application/json",
  //     'CSRF-Token': token
  //   },
  //   body: JSON.stringify({
  //     email: currentUserEmail,
  //     otp: otp
  //   }),
  // })
  //   .then(async (response) => {
  //     const result = await response.json();
  //     if (!response.ok) {
  //       throw new Error(result.message || "Xác thực OTP thất bại");
  //     }
  //     return result;
  //   })
  //   .then((result) => {
  //     // Redirect based on user type
  //     const user = result.user;
  //     switch(user.type) {
  //       case "admin":
  //         window.location.href = "/dashboard";
  //         break;
  //       case "owner":
  //         window.location.href = "/agentInfo";
  //         break;
  //       default:
  //         window.location.href = "/";
  //     }
  //   })
  //   .catch((error) => {
  //     otpError.textContent = error.message;
  //     otpError.style.color = "red";
  //   });
});

// Resend OTP Event
resendOTPLink.addEventListener("click", (e) => {
  e.preventDefault();
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  $.ajax({
    url: "/api/v1/users/verify-register-resendotp",
    type: "POST",
    credentials: "same-origin",
    headers: {
      "CSRF-TOKEN": token,
    },
    contentType: "application/json",
    data: JSON.stringify({
      email: currentUserEmail,
    }),
    success: function (result) {
      otpError.textContent = "OTP mới đã được gửi";
      otpError.style.color = "green";
    },
    error: function (xhr, status, error) {
      otpError.textContent = xhr.responseJSON.message || "Gửi lại OTP thất bại";
      otpError.style.color = "red";
    },
  });
});
