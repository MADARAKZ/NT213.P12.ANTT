
$(document).ready(async function () {
  const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");
  const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 phút (tính bằng mili giây)
  let sessionTimer;
  let hotelId;
  let roomId;

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
  
  function extractHotelAndRoomNames(url) {
    // Tách phần sau dấu `?` (query string)
    const queryString = url.split("?")[1];
  
    if (!queryString) {
      throw new Error("Invalid URL: No query string found.");
    }
  
    // Thay thế `%20` bằng khoảng trắng để giải mã chuỗi
    const decodedString = decodeURIComponent(queryString);
  
    // Tách hotelName và roomName bằng dấu `_`
    const [hotelName, roomName] = decodedString.split("_");
  
    if (!hotelName || !roomName) {
      throw new Error("Invalid query string: Missing hotelName or roomName.");
    }
  
    return { hotelName, roomName };
  }
  
  // Sử dụng hàm
    const { hotelName, roomName } = extractHotelAndRoomNames(window.location.href);
    console.log("Hotel Name:", hotelName);
    console.log("Room Name:", roomName);
  

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
    headers: {
      'CSRF-Token': token // <-- là token CSRF
    },
    data: JSON.stringify({ hotelName: hotelName }),
    success: function(response) {
      // Lưu hotelId từ response
      console.log(response);
      hotelId = response.hotelId;
  
      // AJAX tiếp theo để lấy thông tin khách sạn
      $.ajax({
        url: "http://localhost:3030/api/v1/hotels/" + hotelId,
        method: "GET",
        success: function(hotelData) {
          console.log(hotelData);
          $("#hotelName").text(hotelData.name);
  
          // AJAX cuối cùng để lấy thông tin phòng và giá
          $.ajax({
            url: "/api/v1/rooms/getByRoomAndHotel/",
            data: {
              roomName: roomName, // Tên phòng
              hotelId: hotelId
            },
            method: "POST",
            success: (roomData) => {
              console.log(roomData);
              roomId=roomData.id;
              const discountRate = 0.1 * numberOfChildren;
              const discountedPrice = Math.ceil(roomData.price * (1 - discountRate));
              console.log(roomData.price);
              const totalPrice = discountedPrice * all;
              newTotalPrice = totalPrice;
              $("#totalPrice").text(numberWithCommas(totalPrice) + " VND");
              $("#Price").text(numberWithCommas(roomData.price) + " VND");
            },
            error: function(err) {
              console.error("Failed to fetch room details:", err);
            }
          });
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
var fullName = $("#fname").val();
var fullNameURL =  removeVietnameseAccents(fullName);
    var data = {
      room_id: roomId,
      user_id: currentUser.id,
      hotel_id: hotelId,
      check_in_date: hotelData.checkInDate,
      check_out_date: hotelData.checkOutDate,
      total_price: newTotalPrice, // Use newTotalPrice here
      full_name: fullName,
      special_requests: $("#specialRequest").val(),
      quantity: numberOfRooms,
      status: false,
    };
    console.log(data);

    $.ajax({
      url: "http://localhost:3030/api/v1/booking/",
      method: "POST",
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
      data: JSON.stringify(data),
      contentType: "application/json",
      success: function (response) {
        var paymentMethod = $("input[name='dbt']:checked").val();
        console.log(response);

        if (paymentMethod === "dbt") {
          window.location.href = `http://localhost:3030/paymentmethod?name=${fullNameURL}&hotel=${hotelName}`;
        } else if (paymentMethod === "cd") {
          window.location.href = `http://localhost:3030/resultTT?name=${fullNameURL}&hotel=${hotelName}`;
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

function removeVietnameseAccents(str) {
  return str
    .normalize("NFD") // Chuẩn hóa chuỗi thành dạng Unicode chuẩn
    .replace(/[\u0300-\u036f]/g, "") // Loại bỏ các ký tự dấu
    .replace(/đ/g, "d") // Thay đ thành d
    .replace(/Đ/g, "D"); // Thay Đ thành D
}
