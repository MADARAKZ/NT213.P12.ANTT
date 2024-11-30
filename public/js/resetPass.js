$(document).ready(function () {
  console.log("Document ready");

  const passwordInput = $("#password");
  const confirmPasswordInput = $("#password1");
  const passwordError = $("#password-error");
  const confirmPasswordError = $("#password1-error");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  // Kiểm tra sự thay đổi của mật khẩu và mật khẩu xác nhận
  passwordInput.add(confirmPasswordInput).on("input", function () {
    const password = passwordInput.val().trim();
    const confirmPassword = confirmPasswordInput.val().trim();

    // Kiểm tra mật khẩu không trống
    if (!password) {
      passwordError.text("Password is required").addClass("visible");
    } else {
      passwordError.removeClass("visible");
    }

    // Kiểm tra mật khẩu xác nhận
    if (!confirmPassword) {
      confirmPasswordError.text("Confirm password is required").addClass("visible");
    } else if (confirmPassword !== password) {
      confirmPasswordError.text("Passwords do not match").addClass("visible");
    } else {
      confirmPasswordError.removeClass("visible");
    }
  });

  // Sự kiện 'click' cho nút xác nhận
  $(".btn").on("click", function (e) {
    e.preventDefault(); // Ngăn chặn hành vi mặc định

    const token = $("#token").val().trim();
    const newPassword = passwordInput.val().trim();
    const confirmPassword = confirmPasswordInput.val().trim();

    // Kiểm tra mật khẩu và xác nhận mật khẩu trước khi gửi yêu cầu
    if (!newPassword || !confirmPassword) {
      showErrorModal("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorModal("Passwords do not match.");
      return;
    }

    // Gửi yêu cầu qua AJAX
    $.ajax({
      url: "/api/v1/authen/resetpassword", // Thay đổi URL này theo endpoint của bạn
      type: "POST",
      credentials: "include",
      headers: {
        "CSRF-Token": csrfToken, // Thêm CSRF token vào header
      },
      contentType: "application/json",
      data: JSON.stringify({ token, newpassword: newPassword }),
      success: function () {
        alert("Password reset successful");
        window.location.href = "/signin";
      },
      error: function (xhr) {
        const errorMessage =
          xhr.responseJSON?.message || "An error occurred. Please try again.";
        showErrorModal(errorMessage);
      },
    });
  });

  // Hàm hiển thị modal lỗi
  function showErrorModal(message) {
    $("#errorMessageModal").text(message);
    $("#errorModal").modal("show");
  }
});
