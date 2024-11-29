// Lấy tham chiếu đến các phần tử HTML
const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMessageModal = document.getElementById("errorMessageModal");

let timeoutId = setTimeout(() => {
  localStorage.removeItem("type");
  console.log("Type removed from localStorage due to inactivity.");
}, 120000);

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

  // Tạo một object chứa dữ liệu đăng nhập
  const data = {
    email: email,
    password: password,
    'g-recaptcha-response': recaptchaResponse   // gửi dữ liệu của mã capchat
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
      grecaptcha.reset(); //reset recapchat sau khi submit thành công

      if (result.message === "successful") {
        //console.log(result);
        document.cookie = `accessToken=${result.accessToken}; HttpOnly`;
        if (result.type === "admin") {
          window.location.href = "/dashboard";
        } else if (result.type === "owner") {
          // Nếu đăng nhập thành công, chuyển hướng đến trang chủ
          window.location.href = "/agentInfo";
        } else {
          window.location.href = "/";
        }
      } else if (result.message === "email_not_found") {
        errorMessageModal.textContent =
          "Email không tồn tại. Vui lòng kiểm tra lại.";
        $("#errorModal").modal("show"); // Hiển thị modal khi email không tồn tại
        grecaptcha.reset();
      } else if (result.message === "incorrect_password") {
        errorMessageModal.textContent =
          "Mật khẩu không chính xác. Vui lòng thử lại.";
        $("#errorModal").modal("show"); // Hiển thị modal khi mật khẩu sai
        grecaptcha.reset();
      } else {
        errorMessageModal.textContent =
          "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.";
        $("#errorModal").modal("show"); // Hiển thị modal khi đăng nhập thất bại
        grecaptcha.reset();
      }
      // Xử lý kết quả trả về từ máy chủ
     //console.log(result);
    },
    error: function (xhr, status, error) {
      // Xử lý lỗi nếu có
      console.error("Error:", error);
      errorMessageModal.textContent =
        "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.";
      $("#errorModal").modal("show"); // Hiển thị modal khi có lỗi xảy ra
      grecaptcha.reset();
    },
  });
});
