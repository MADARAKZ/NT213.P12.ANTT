// Lấy thông tin từ URL
const urlParams = new URLSearchParams(window.location.search);
const status = urlParams.get('status');
const responseCode = urlParams.get('responseCode');

// Hiển thị thông báo tương ứng
document.addEventListener("DOMContentLoaded", function () {
  const resultSuccess = document.getElementById('resultSuccess');
  const resultFailure = document.getElementById('resultFailure');

  if (status === 'success') {
    resultSuccess.innerHTML = `<p>Thanh toán thành công. Cảm ơn bạn đã sử dụng dịch vụ!
    <br>
    Vui lòng check mail!
    </p>`;
    resultSuccess.style.display = "block";
    resultFailure.style.display = "none";
  } else if (status === 'failure') {
    const responseMessages = {
      "07": "Trừ tiền thành công nhưng giao dịch bị nghi ngờ. Vui lòng liên hệ hỗ trợ.",
      "09": "Giao dịch không thành công: Tài khoản chưa đăng ký dịch vụ InternetBanking.",
      "10": "Giao dịch không thành công: Xác thực thông tin sai quá 3 lần.",
      "11": "Giao dịch không thành công: Hết thời gian chờ thanh toán. Vui lòng thử lại.",
      "12": "Giao dịch không thành công: Tài khoản của bạn đã bị khóa.",
      "13": "Giao dịch không thành công: Sai mật khẩu OTP. Vui lòng thử lại.",
      "24": "Giao dịch không thành công: Bạn đã hủy giao dịch.",
      "51": "Giao dịch không thành công: Không đủ số dư trong tài khoản.",
      "65": "Giao dịch không thành công: Tài khoản đã vượt quá hạn mức giao dịch trong ngày.",
      "75": "Ngân hàng thanh toán đang bảo trì. Vui lòng thử lại sau.",
      "79": "Giao dịch không thành công: Sai mật khẩu thanh toán quá số lần quy định.",
      "99": "Giao dịch không thành công: Lỗi không xác định. Vui lòng thử lại sau."
    };

    const errorMessage = responseMessages[responseCode] || "Giao dịch thất bại: Mã lỗi không xác định.";
    resultFailure.innerHTML = `<p>${errorMessage}</p>`;
    resultSuccess.style.display = "none";
    resultFailure.style.display = "block";
  } else {
    resultSuccess.style.display = "none";
    resultFailure.style.display = "block";
    resultFailure.innerHTML = `<p>Không có thông tin thanh toán.</p>`;
  }
  setTimeout(() => {
    window.location.href = '/'; // URL của trang Home
  }, 10000); // 10 giây
});