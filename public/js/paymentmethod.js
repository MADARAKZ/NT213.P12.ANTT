$(document).ready(function () {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  let bookingID;

  function parseQueryParams(url) {
    const urlObj = new URL(url); // Tạo đối tượng URL
    const params = new URLSearchParams(urlObj.search); // Lấy phần query string

    const name = params.get("name"); // Lấy giá trị của "name"
    const hotel = params.get("hotel"); // Lấy giá trị của "hotel"

    return { name, hotel }; // Trả về kết quả dưới dạng đối tượng
  }
  let url = window.location.href;
  const result = parseQueryParams(url);
  console.log(result);

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  let totalP;
  let hotelName;
  // Helper function to extract a query parameter
  $.ajax({
    url: "http://localhost:3030/api/v1/hotels/getIdByHotelName",
    method: "POST",
    credentials: "include",
    headers: {
      "CSRF-Token": token, // <-- is the csrf token as a header
    },
    contentType: "application/json",
    data: JSON.stringify({ hotelName: result.hotel }),
    success: function (response) {
      console.log("Hotel ID response:", response);
      const hotelId = response.hotelId;
      console.log("Hotel ID:", hotelId);
      if (!hotelId) {
        alert("Hotel ID not found.");
        return;
      }
      $.ajax({
        url: "/api/v1/booking/getByHotelAndName/", // API endpoint
        method: "POST",
        credentials: "include",
        headers: {
          "CSRF-Token": token, // <-- is the csrf token as a header
        },
        data: {
          hotel_id: hotelId,
          full_name: result.name, // Tên khách hàng
        },
        success: (data) => {
          if (data.length === 0) {
            alert(
              "No bookings found for the specified hotel and customer name."
            );
            return;
          }

          const booking = data[0]; // Giả sử bạn chỉ quan tâm đến booking đầu tiên

          // Cập nhật thông tin phòng
          $("#RoomName").html("Loại phòng" + "<br>" + booking.Room.name);
          bookingID = booking.id;
          console.log(bookingID);
          // Chuyển đổi ngày check-in và check-out
          const checkInDate = new Date(booking.check_in_date);
          const checkInDateString = formatDate(checkInDate);
          const checkOutDate = new Date(booking.check_out_date);
          const checkOutDateString = formatDate(checkOutDate);

          // Cập nhật thông tin ngày tháng và người dùng
          $("#checkIn").text("Từ: " + checkInDateString);
          $("#checkOut").text("Đến: " + checkOutDateString);
          $("#fullName").text(booking.User.name);
          $("#totalPrice").text(numberWithCommas(booking.total_price) + " VND");
          $("#hotelName").text(booking.Room.Hotel.name);
          $("#email").text(booking.User.email);
          $("#numberphone").text(booking.User.numberPhone);

          // Cập nhật tổng giá và tên khách sạn
          totalP = booking.total_price; // Nếu cần cập nhật giá trị tổng
          hotelName = booking.Room.Hotel.name; // Tên khách sạn
        },
        error: (err) => {
          console.error("Error fetching booking details:", err);
          alert("Failed to fetch booking details.");
        },
      });
    },
    error: function (err) {
      console.error("Failed to fetch hotel ID:", err);
    },
  });

  // Hàm chuyển đổi ngày về 00:00:00
  var requestData = {
    tmn_code: "DJ863C7C",
  };

  // Chuyển đổi đối tượng thành chuỗi query string
  var formData = $.param(requestData);

  // Gửi POST request đến endpoint API
  $.ajax({
    url: "https://sandbox.vnpayment.vn/qrpayauth/api/merchant/get_bank_list",
    type: "POST",
    // headers: {
    //   "CSRF-Token": token, // <-- is the csrf token as a header
    // },
    contentType: "application/x-www-form-urlencoded",
    data: formData,
    success: (response) => {
      // Xử lý phản hồi thành công từ API và hiển thị dữ liệu lên trang web
      for (let i = 0; i < Math.min(response.length, 16); i++) {
        if (i == 13) {
          i++;
        }
        const bank = response[i];
        var bankElement = `<div class="bankItem">`;
        var logoLink = bank.logo_link.replace(
          "~",
          "https://sandbox.vnpayment.vn"
        );
        bankElement += `<input type="radio" name="bank" value="${bank.bank_code}" id="${bank.bank_code}">`;
        bankElement += `<label for="${bank.bank_code}">`;
        bankElement += `<img id="imghi" src="${logoLink}" alt="${bank.bank_name}" >`;
        bankElement += `<p>${bank.bank_name}</p>`;
        bankElement += `</label></div>`;
        $("#bankList").append(bankElement);
      }
    },
    error: function (xhr, status, error) {
      // Xử lý lỗi khi gửi yêu cầu đến API
      console.error(error);
      $("#bankList").html("<p>Đã xảy ra lỗi khi lấy danh sách ngân hàng.</p>");
    },
  });

  $("#placeOrderButton").click(function () {
    // Gọi API khi nhấn nút "Place Order"
    var data = {
      orderId: bookingID,
      amount: totalP,
      orderInfo: `trả tiền ${hotelName}`,
      orderType: "OnlinePayment",
      bankCode: $("input[name='bank']:checked").val(),
    };
    console.log(data);

    $.ajax({
      url: "http://localhost:3030/api/v1/vnpay/create-vnpay-url",
      method: "POST",
      credentials: "include",
      data: JSON.stringify(data), // Send data as JSON string
      contentType: "application/json",
      success: function (response) {
        // Chuyển hướng trang web tới URL nhận được từ API
        window.location.href = response.data.url;
        console.log(response.data.url);
      },
      error: function (xhr, status, error) {
        // Xử lý lỗi khi gọi API
        console.error("API call failed:", error);

        // Hiển thị thông báo lỗi cho người dùng nếu cần thiết
      },
    });
  });
});
$(window).on("beforeunload", function () {
  const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");
  if (bookingID && !placeOrderClicked) { // Only delete booking if "Place Order" wasn't clicked
    $.ajax({
      url: "/api/v1/booking/statusfail/" + bookingID, // Endpoint để xóa booking
      method: "DELETE",
      headers: {
        "CSRF-Token": token, // <-- CSRF token nếu cần
      },
      success: function () {
        console.log("Booking deleted successfully.");
      },
      error: function (xhr, status, error) {
        console.error("Failed to delete booking:", error);
      },
    });
  }
});