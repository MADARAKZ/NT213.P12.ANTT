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

  // Gửi yêu cầu đăng ký người dùng
  fetch("http://localhost:3030/api/v1/users/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, confirmpassword, numberPhone, type }),
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
      console.log("Đăng ký:", result);
      // Chuyển hướng trang sau khi đăng ký thành công
      window.location.href = "http://localhost:3030/signin";
    })
    .catch((error) => {
      console.error("Đăng ký thất bại:", error);
      confirmPasswordInput.addClass("error");
      confirmPasswordError.text(error.message);
    });
};

$(document).ready(function () {
  console.log("Document ready");
  $("#registerButton").click(registerUser);
});
