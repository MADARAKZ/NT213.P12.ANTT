// Lấy tham chiếu đến các phần tử HTML
const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessageModal = document.getElementById("errorMessageModal");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const otpModal = document.getElementById("otpModal");
const otpForm = document.getElementById("otpForm");
const otpInput = document.getElementById("otpInput");
const otpError = document.getElementById("otpError");
const resendOTPLink = document.getElementById("resendOTP");
const closeOTPModalBtn = document.querySelector('.close-btn');

let currentUserId = null
let currentUserEmail = null

// Kiểm tra email hợp lệ
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Kiểm tra mật khẩu hợp lệ
function validatePassword(password) {
  return password.length >= 6; // Ví dụ: mật khẩu phải dài tối thiểu 6 ký tự
}

// Thời gian tự động reset localStorage
let timeoutId = setTimeout(() => {
  localStorage.removeItem("type");
  console.log("Type removed from localStorage due to inactivity.");
}, 120000);

// Close OTP modal
function closeOTPModal(){
  $('#otpModal').css('display', 'none');
}

// Click event close otpmodal
closeOTPModalBtn.addEventListener('click', closeOTPModal);

// Sự kiện kiểm tra email trong thời gian thực
emailInput.addEventListener("input", () => {
  if (!validateEmail(emailInput.value)) {
    emailError.textContent = "Email không hợp lệ.";
    emailInput.classList.add("error");
  } else {
    emailError.textContent = "";
    emailInput.classList.remove("error");
  }
});

// Sự kiện kiểm tra mật khẩu trong thời gian thực
passwordInput.addEventListener("input", () => {
  if (!validatePassword(passwordInput.value)) {
    passwordError.textContent = "Mật khẩu phải có ít nhất 8 ký tự.";
    passwordInput.classList.add("error");
  } else {
    passwordError.textContent = "";
    passwordInput.classList.remove("error");
  }
});

// Sự kiện submit form
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Ngăn chặn hành vi gửi form mặc định
  clearTimeout(timeoutId);

  // Lấy giá trị từ các trường đầu vào
  const email = emailInput.value;
  const password = passwordInput.value;

  // Lấy giá trị reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();

  // Kiểm tra xem captcha đã được điền chưa
  if (recaptchaResponse.length === 0) {
    errorMessageModal.textContent = "Vui lòng xác nhận reCAPTCHA";
    return;
  }

  // Kiểm tra email và mật khẩu trước khi gửi
  if (!validateEmail(email)) {
    emailError.textContent = "Email không hợp lệ.";
    emailInput.classList.add("error");
    return;
  }
  if (!validatePassword(password)) {
    passwordError.textContent = "Mật khẩu phải có ít nhất 6 ký tự.";
    passwordInput.classList.add("error");
    return;
  }

  // Tạo một object chứa dữ liệu đăng nhập
  const data = {
    email: email,
    password: password,
    "g-recaptcha-response": recaptchaResponse, // Gửi dữ liệu của mã CAPTCHA
  };
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  console.log('CSRF Token:', token);


  // Gửi yêu cầu POST đến URL xử lý dữ liệu đăng nhập
  $.ajax({
    url: "http://localhost:3030/api/v1/users/login",
    type: "POST",
    credentials: 'same-origin', // <-- includes cookies in the request
    headers: {
    'CSRF-Token': token // <-- is the csrf token as a header
    },
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (result) {
      grecaptcha.reset(); // Reset CAPTCHA sau khi submit thành công

      // Store currentuser email
      currentUserEmail = email;
      currentUserId = result.userId;

      //Show otpmodal
      $('#otpModal').css('display', 'flex');

      //handle different login scenario
      switch(result.message){
        case "successfull":
          console.log("Sent OTP");
          break;
        case "email_not_found":
          errorMessageModal.textContent = "Email is invalid. Please Recheck!"
          break;
        case "incorrect_password":
          errorMessageModal.textContent = "Password is invalid. Please Recheck";
          break;
        default:
          errorMessageModal.textContent = "Login is Failed. Please Recheck your information";
      }
    },
    error: function (xhr, status, error) {
      console.error("Error:", error);
      errorMessageModal.textContent =
        "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.";
      $("#errorModal").modal("show");
      grecaptcha.reset();
    },
  });
});

//OTP form Submit Event
otpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const otp = otpInput.value;
  console.log("Da submit otp")
  // Validate OTP length
  if (otp.length !== 6) {
    otpError.textContent = "OTP phải có 6 chữ số";
    otpError.style.color = "red";
    return;
  }
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  console.log('CSRF Token:', token);
  $.ajax({
    url: "http://localhost:3030/api/v1/users/verifyotp",
    type: "POST",
    credentials: 'same-origin', // <-- includes cookies in the request
    headers: {
    'CSRF-Token': token // <-- is the csrf token as a header
    },
    contentType: "application/json",
    data: JSON.stringify({
      userId: currentUserId,
      email: currentUserEmail,
      otp: otp
    }),
    success: function (result) {
      // Redirect based on user type
      const user = result.user;
      console.log(">>>Da verity otp tu backend<<<<")
      switch(user.type) {
        case "admin":
          window.location.href = "/dashboard";
          break;
        case "owner":
          window.location.href = "/agentInfo";
          break;
        default:
          window.location.href = "/";
      }
    },
    error: function (xhr, status, error) {
      otpError.textContent = xhr.responseJSON.message || "Xác thực OTP thất bại";
      otpError.style.color = "red";
    }
  });
});

// Resend OTP Event
resendOTPLink.addEventListener("click", (e) => {
  e.preventDefault();
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  console.log('CSRF Token:', token);

  $.ajax({
    url: "http://localhost:3030/api/v1/users/resend-otp",
    type: "POST",
    credentials: 'same-origin', // <-- includes cookies in the request
    headers: {
    'CSRF-Token': token // <-- is the csrf token as a header
    },
    contentType: "application/json",
    data: JSON.stringify({
      userId: currentUserId,
      email: currentUserEmail
    }),
    success: function (result) {
      otpError.textContent = "OTP mới đã được gửi";
      otpError.style.color = "green";
    },
    error: function (xhr, status, error) {
      otpError.textContent = xhr.responseJSON.message || "Gửi lại OTP thất bại";
      otpError.style.color = "red";
    }
  });
});