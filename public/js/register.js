const registerUser = (event) => {
  event.preventDefault(); // Ngăn chặn hành vi mặc định của nút submit

  const name = $("#name").val().trim();
  const email = $("#email").val().trim();
  const password = $("#password").val().trim();
  const confirmpassword = $("#re-password").val().trim();
  const numberPhone = $("#numberPhone").val().trim();

  // Lấy `type` từ query parameter
  const urlParams = new URLSearchParams(window.location.search);
  var type = urlParams.get("type"); // Mặc định là "client" nếu không có `type`
  if (type != "owner") {
    type = "client";
  }
  console.log(type);

  const confirmPasswordInput = $("#re-password");
  const confirmPasswordError = $("#re-password-error");

  console.log("Sending registration request...");

  confirmPasswordInput.removeClass("error");
  confirmPasswordError.text("");
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
 
  // Gửi yêu cầu đăng ký người dùng
  fetch("/api/v1/users/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      'CSRF-Token': token // <-- is the csrf token as a header
    },
    body: JSON.stringify({
      name,
      email,
      password,
      confirmpassword,
      numberPhone,
      type,
    }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Đã có lỗi xảy ra");
      }
      return data;
    })
    .then((result) => {
      console.log("Đăng ký thành công:", result);
      // Chuyển hướng trang sau khi đăng ký thành công
      window.location.href = "/signin";
    })
    .catch((error) => {
      console.error("Đăng ký thất bại:", error);
      confirmPasswordInput.addClass("error");
      confirmPasswordError.text(error.message);
    });
};

// Thêm các sự kiện để kiểm tra dữ liệu khi người dùng nhập
$(document).ready(function () {
  console.log("Document ready");

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
