

$(document).ready(async function () {
  const SESSION_TIMEOUT = 10000 * 60 * 1000; // 15 phút (tính bằng mili giây)
  let sessionTimer;

  // Hàm bắt đầu đếm thời gian
  function startSessionTimer() {
    // Nếu đã có timer cũ, xóa nó
    if (sessionTimer) {
      clearTimeout(sessionTimer);
    }

    // Đặt timer mới
    sessionTimer = setTimeout(() => {
      alert("Bạn đã không thực hiện thao tác nào trong 15 phút. Bạn sẽ được chuyển về trang chủ.");
      window.location.href = "http://localhost:3030/"; // URL của trang chủ
    }, SESSION_TIMEOUT);
  }

  // ======================= LẮNG NGHE SỰ KIỆN =======================
  // Reset bộ đếm khi người dùng thay đổi trang
  $(window).on("beforeunload", function () {
    clearTimeout(sessionTimer); // Xóa timer khi người dùng thay đổi trang
  });

  // Khởi động bộ đếm thời gian khi tải trang
  startSessionTimer();
  function getHotelAndRoom(url = window.location.href) {
    // Tìm toàn bộ query string sau dấu ?
    const queryStringIndex = url.indexOf("?");
    if (queryStringIndex === -1) return null; // Không có query string
  
    const queryString = url.substring(queryStringIndex + 1); // Lấy phần sau dấu ?
    const value = decodeURIComponent(queryString.replace(/\+/g, " ")); // Giải mã chuỗi
  
    // Tách chuỗi trước và sau dấu gạch dưới "_"
    const parts = value.split("_");
    if (parts.length !== 2) return null; // Nếu không đúng định dạng, trả về null
  
    const hotelName = parts[0];
    const roomID = parseInt(parts[1], 10);
  
    // Trả về kết quả là một đối tượng chứa hotelName và roomID
    return {
      hotelName,
      roomID: isNaN(roomID) ? null : roomID
    };
  }
  

  function getNumberOfNights(checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffInTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffInDays = Math.round(diffInTime / millisecondsPerDay);
    return diffInDays + 1;
  }

  const data = localStorage.getItem("searchData");
  let numberOfNights = 1;
  let numberOfRooms = 1;
  let numberOfChildren;
  let totalPrice = 0;
  let newTotalPrice = 0;
  
const urlData = getHotelAndRoom();
var roomId = urlData.roomID;
var hotelName = urlData.hotelName;
console.log(urlData)
  if (data) {
    var hotelData = JSON.parse(data);
    $("#checkIn").text("Từ: " + hotelData.checkInDate);
    $("#checkOut").text("Đến: " + hotelData.checkOutDate);
    $("#manyRooms").text(hotelData.numberOfRooms);
    numberOfNights = getNumberOfNights(
      hotelData.checkInDate,
      hotelData.checkOutDate
    );
    numberOfRooms = hotelData.numberOfRooms;
    numberOfChildren = hotelData.numberOfChildren || 0;
  } else {
    console.log("No data found in Local Storage");
  }
  let all = numberOfNights * numberOfRooms;
  $.ajax({
    url: "http://localhost:3030/api/v1/hotels/getIdByHotelName",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ hotelName: hotelName }),
    success: function(response) {
      // Lưu hotelId vào biến toàn cục
      console.log(response)
      const hotelId = response.hotelId;

      // AJAX thứ hai chỉ chạy sau khi nhận được globalHotelId
      $.ajax({
        url: "http://localhost:3030/api/v1/hotels/" + hotelId,
        method: "GET",
        success: function(data) {
          $("#hotelName").text(data.name);
        },
        error: function(err) {
          console.error("Failed to fetch hotel details:", err);
        }
      });
    },
    error: function(err) {
      console.error("Failed to fetch hotel ID:", err);
    }
  });
  async function getCurrentUser() {
    try {
      const response = await fetch("/api/v1/users/getCurrentUser", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch current user: ${errorText}`);
      }

      const currentUser = await response.json();
      if (!currentUser) {
        throw new Error("Current user data is not available");
      }

      return currentUser;
    } catch (error) {
      console.error("Error fetching current user:", error.message);
      return null; // Return null to indicate an error occurred
    }
  }
  const currentUser = await getCurrentUser();
  console.log(currentUser);
  // AJAX call to fetch hotel and room data
  $.ajax({
    url: "http://localhost:3030/api/v1/rooms/" + roomId,
    method: "GET",
    success: (data) => {
      const discountRate = 0.1 * numberOfChildren;
      const discountedPrice = Math.ceil(data.price * (1 - discountRate));
      totalPrice = discountedPrice * all;
      newTotalPrice = totalPrice;
      $("#totalPrice").text(numberWithCommas(totalPrice) + " VND");
      $("#Price").text(numberWithCommas(data.price) + " VND");
    },
  });

  function updateTotalPrice(discountPercent) {
    const discountAmount = totalPrice * (discountPercent / 100);
    newTotalPrice = totalPrice - discountAmount;
    $("#totalPrice").text(numberWithCommas(newTotalPrice.toFixed(2)) + " VND");
  }

  // Event listener for the apply button click event
  $("#applyCoupon").click(function () {
    const couponCode = $("#Coupon").val();
    if (couponCode) {
      $.ajax({
        url: "http://localhost:3030/api/v1/coupon/getByCode/" + couponCode,
        method: "GET",
        success: function (coupon) {
          if (coupon && coupon.percent) {
            updateTotalPrice(coupon.percent);
          } else {
            alert("Mã giảm giá không hợp lệ.");
          }
        },
        error: function () {
          alert("Không thể xác thực mã giảm giá.");
        },
      });
    } else {
      alert("Vui lòng nhập mã giảm giá.");
    }
  });



  $("#phoneNumber").val(currentUser.numberPhone); // Phone number in placeholder if empty
  $("#emailAddress").val(currentUser.email); // Adjusted the name attribute in HTML to `email`
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function validateAndSendBookingRequest() {
    if (
      $("#fname").val() === "" ||
      $("#phoneNumber").val() === "" ||
      $("#emailAddress").val() === "" ||
      $("#yearOfBirth").val() === "" ||
      $("#cccd").val() === "" ||
      $("#address").val() === "" ||
      !roomId ||
      !currentUser.id ||
      !hotelData.checkInDate ||
      !hotelData.checkOutDate ||
      !newTotalPrice
    ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    var data = {
      room_id: roomId,
      user_id: currentUser.id,
      hotel_id: hotelId,
      check_in_date: hotelData.checkInDate,
      check_out_date: hotelData.checkOutDate,
      total_price: newTotalPrice, // Use newTotalPrice here
      full_name: $("#fname").val(),
      special_requests: $("#specialRequest").val(),
      quantity: numberOfRooms,
      status: false,
    };
    console.log(data);

    $.ajax({
      url: "http://localhost:3030/api/v1/booking/",
      method: "POST",
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function (response) {
        var bookingId = response.id;
        var paymentMethod = $("input[name='dbt']:checked").val();
        console.log(response);

        if (paymentMethod === "dbt") {
          window.location.href = `http://localhost:3030/paymentmethod?bookingId=${bookingId}`;
        } else if (paymentMethod === "cd") {
          window.location.href = `http://localhost:3030/resultTT?bookingId=${bookingId}`;
        } else {
          alert("Vui lòng chọn phương thức thanh toán!");
        }
      },
      error: function (err) {
        console.log("Thanh toán thất bại", err);
      },
    });
  }

  $("#Order1").click(validateAndSendBookingRequest);
  $("#Order").click(validateAndSendBookingRequest);

  $(".return").click(function () {
    window.location.href = "http://localhost:3030/";
  });
  $(".confirm").click(function () {
    console.log(200);
    $(".Yorder").hide();
    $("form").show();
  });
});
