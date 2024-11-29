$(document).ready(function () {
  console.log("Document ready");

  // Kiểm tra sự thay đổi của mật khẩu và mật khẩu xác nhận
  $("#password, #password1").on("input", function () {
    var password = $("#password").val();
    var confirmPassword = $("#password1").val();

    // Kiểm tra mật khẩu không trống
    if (password.length === 0) {
      $("#password-error").text("Password is required").addClass("visible");
    } else {
      $("#password-error").removeClass("visible");
    }

    // Kiểm tra mật khẩu xác nhận
    if (confirmPassword.length === 0) {
      $("#password1-error")
        .text("Confirm password is required")
        .addClass("visible");
    } else if (confirmPassword !== password) {
      $("#password1-error").text("Passwords do not match").addClass("visible");
    } else {
      $("#password1-error").removeClass("visible");
    }
  });

  // Sự kiện 'click' cho nút xác nhận
  $(".btn").on("click", function () {
    const token = $("#token").val();
    const newpassword = $("#password").val();
    const confirmPassword = $("#password1").val();

    // Kiểm tra mật khẩu và xác nhận mật khẩu trước khi gửi yêu cầu
    if (!newpassword || !confirmPassword) {
      showErrorModal("Please fill in all fields.");
      return;
    }

    if (newpassword !== confirmPassword) {
      showErrorModal("Passwords do not match.");
      return;
    }

    $.ajax({
      url: "/api/v1/authen/resetpassword", // Thay đổi URL này theo endpoint của bạn
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ token, newpassword }),
      success: function (response) {
        alert("Password reset successful");
        window.location.href = "/signin";
      },
      error: function (xhr) {
        showErrorModal("Mã xác thực không chính xác");
      },
    });
  });

  // Hàm hiển thị modal lỗi
  function showErrorModal(message) {
    $("#errorMessageModal").text(message);
    $("#errorModal").modal("show");
  }
});
