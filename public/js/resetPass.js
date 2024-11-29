$(document).ready(function () {
  console.log("Document ready");
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  // Sự kiện 'click' cho nút xác nhận
  $(".btn").on("click", function () {
    const token = $("#token").val();
    const newpassword = $("#password").val();
    const confirmPassword = $("#password1").val();

    if (newpassword !== confirmPassword) {
      showErrorModal("Passwords do not match");
      return;
    }

    $.ajax({
      url: "http://localhost:3030/api/v1/authen/resetpassword", // Thay đổi URL này theo endpoint của bạn
      type: "POST",
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
      contentType: "application/json",
      data: JSON.stringify({ token, newpassword }),
      success: function (response) {
        alert("Password reset successful");
        window.location.href = "http://localhost:3030/signin";
      },
      error: function (xhr) {
        alert("Mã xác thực không chính xác");
      },
    });
  });

  // Hàm hiển thị modal lỗi
  function showErrorModal(message) {
    $("#errorMessageModal").text(message);
    $("#errorModal").modal("show");
  }
});
