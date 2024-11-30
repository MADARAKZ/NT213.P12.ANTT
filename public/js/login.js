// Lấy tham chiếu đến các phần tử HTML
const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessageModal = document.getElementById("errorMessageModal");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

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
    url: "/api/v1/users/login",
    type: "POST",
    credentials: 'same-origin', // <-- includes cookies in the request
    headers: {
    'CSRF-Token': token // <-- is the csrf token as a header
  },
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (result) {
      grecaptcha.reset(); // Reset CAPTCHA sau khi submit thành công

      if (result.message === "successful") {
        document.cookie = `accessToken=${result.accessToken}; HttpOnly`;
        if (result.type === "admin") {
          window.location.href = "/dashboard";
        } else if (result.type === "owner") {
          window.location.href = "/agentInfo";
        } else {
          window.location.href = "/";
        }
      } else if (result.message === "email_not_found") {
        errorMessageModal.textContent =
          "Email không tồn tại. Vui lòng kiểm tra lại.";
        $("#errorModal").modal("show");
        grecaptcha.reset();
      } else if (result.message === "incorrect_password") {
        errorMessageModal.textContent =
          "Mật khẩu không chính xác. Vui lòng thử lại.";
        $("#errorModal").modal("show");
        grecaptcha.reset();
      } else {
        errorMessageModal.textContent =
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
        $("#errorModal").modal("show");
        grecaptcha.reset();
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
