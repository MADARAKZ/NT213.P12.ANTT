$(document).ready(function () {
  const emailInput = $("#email");
  const responseMessage = $("#responseMessage");
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  // Hàm kiểm tra email hợp lệ
  function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  }

  // Kiểm tra thời gian thực cho email
  emailInput.on("input", function () {
    const email = emailInput.val().trim();
    if (!email) {
      responseMessage.text("Email address is required.");
      responseMessage.removeClass("success-message").addClass("error-message");
    } else if (!validateEmail(email)) {
      responseMessage.text("Please enter a valid email address.");
      responseMessage.removeClass("success-message").addClass("error-message");
    } else {
      responseMessage.text(""); // Xóa thông báo lỗi nếu email hợp lệ
      responseMessage.removeClass("error-message success-message");
    }
  });

  // Xử lý sự kiện nhấn nút reset password
  $("#reset-password").click(function (e) {
    e.preventDefault(); // Ngăn hành vi mặc định của nút
    const email = emailInput.val().trim();

    // Kiểm tra email trước khi gửi yêu cầu
    if (!email) {
      responseMessage.text("Email address is required.");
      responseMessage.removeClass("success-message").addClass("error-message");
      return;
    }
    if (!validateEmail(email)) {
      responseMessage.text("Please enter a valid email address.");
      responseMessage.removeClass("success-message").addClass("error-message");
      return;
    }

    // Hiển thị spinner khi yêu cầu đang được xử lý
    $("#loading").show();

    // Gửi yêu cầu qua AJAX
    $.ajax({
      url: "/api/v1/authen/forgotpassword", // Thay bằng endpoint thực tế
      method: "POST",
      credentials: "include",
      headers: {
        'CSRF-Token': token, // Gửi CSRF token
      },
      data: JSON.stringify({ email: email }),
      contentType: "application/json",
      success: function (response) {
        // Ẩn spinner sau khi có phản hồi
        $("#loading").hide();

        if (response) {
          // Thành công: Chuyển hướng hoặc hiển thị thông báo
          responseMessage.text(
            "A password reset link has been sent to your email."
          );
          responseMessage
            .removeClass("error-message")
            .addClass("success-message");
          setTimeout(() => {
            window.location.href = `/resetpassword`;
          }, 1500); // Chuyển hướng sau 1.5 giây
        } else {
          // Lỗi từ phía server: Email không tồn tại
          responseMessage.text("Email does not exist.");
          responseMessage
            .removeClass("success-message")
            .addClass("error-message");
        }
      },
      error: function (xhr, status, error) {
        // Ẩn spinner khi có lỗi
        $("#loading").hide();

        // Lỗi khi gọi API
        responseMessage.text(
          "An error occurred while sending the reset link. Please try again."
        );
        responseMessage
          .removeClass("success-message")
          .addClass("error-message");
      },
    });
  });
});
