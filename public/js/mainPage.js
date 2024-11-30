// Function to toggle collapse and button styles

// loading hotel data

$(document).ready(function () {
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  // Bắt sự kiện click trên các thẻ <a>
  document.querySelectorAll(".HotelLocate a").forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Ngăn chặn hành động mặc định của thẻ <a>
      event.preventDefault();
      // Lấy dữ liệu từ phần tử con <span class="hotelPlace">
      var place = this.querySelector(".hotelPlace").textContent.trim();
      // Chuyển hướng đến trang tìm kiếm với dữ liệu đã lấy
      var des = $("#hotel-destination");
      des.val(place);
      const search = $("#search-hotel");
      setTimeout(function () {
        search.trigger("click");
      }, 500);
      setTimeout(function () {
        window.location.reload(true);
      }, 1000); //
    });
  });
  $.ajax({
    url: `/api/v1/hotels`,
    method: "GET",
    success: function (data) {
      const numberOfHotels = data.length;
      console.log(numberOfHotels);
      // Hiển thị số lượng khách sạn trong một phần tử HTML có id là "numberHotelCount"
      $("#numberHotelCount").text(numberOfHotels);

      // Khởi tạo giá trị giá thấp nhất và giá cao nhất ban đầu
      var minPrice = Infinity; // Giả sử giá thấp nhất là vô cực (cực lớn)
      var maxPrice = 0; // Giả sử giá cao nhất là 0

      // Lặp qua từng khách sạn trong dữ liệu
      data.forEach(function (hotel) {
        // Lặp qua từng phòng trong khách sạn để so sánh giá
        hotel.Rooms.forEach(function (room) {
          // So sánh giá của phòng với giá thấp nhất và cao nhất hiện tại
          if (room.price < minPrice) {
            minPrice = room.price; // Cập nhật giá thấp nhất nếu tìm thấy giá nhỏ hơn
          }
          if (room.price > maxPrice) {
            maxPrice = room.price; // Cập nhật giá cao nhất nếu tìm thấy giá lớn hơn
          }
        });
      });

      // Hiển thị giá thấp nhất và cao nhất
      $("#lowestPrice").text(numberWithCommas(minPrice));
      $("#highestPrice").text(numberWithCommas(maxPrice));
      console.log("Lowest Price: " + minPrice);
      console.log("Highest Price: " + maxPrice);
    },
  });

  function ChangeToSlug(title) {
    var slug;
    slug = title.toLowerCase();
    slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, "a");
    slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, "e");
    slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, "i");
    slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, "o");
    slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, "u");
    slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, "y");
    slug = slug.replace(/đ/gi, "d");
    slug = slug.replace(
      /\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi,
      ""
    );
    slug = slug.replace(/ /gi, "-");
    slug = slug.replace(/\-\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-\-/gi, "-");
    slug = slug.replace(/\-\-\-/gi, "-");
    slug = slug.replace(/\-\-/gi, "-");
    slug = "@" + slug + "@";
    slug = slug.replace(/\@\-|\-\@|\@/gi, "");
    slug = slug.trim();
    return slug;
  }

  document.querySelectorAll(".hotelName").forEach(function (link) {
    link.addEventListener("click", function (event) {
      // Ngăn chặn hành động mặc định của thẻ <a>
      event.preventDefault();
      // Lấy tên của khách sạn từ nội dung của thẻ <a> được click
      var hotelName = this.textContent.trim();
      var slug = ChangeToSlug(hotelName);
      // Gửi yêu cầu AJAX để tìm hotelId tương ứng
      $.ajax({
        url: "/api/v1/hotels/getIdByHotelName",
        method: "POST",
        
      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
        data: { hotelName: hotelName },
        success: function (response) {
          // Xử lý dữ liệu phản hồi (response) từ máy chủ
          var hotelId = response.hotelId;

          console.log("Hotel ID:", hotelId);
          window.location.href = "/hotel/" + slug + "/" + hotelId;
        },
        error: function (xhr, status, error) {
          console.error("Error:", error);
        },
      });
    });
  });

  $.ajax({
    url: `/api/v1/reviews/getFullReview`,
    method: "GET",
    success: function (data) {
      const numberOfHotels = data.length;
      // console.log(numberOfHotels)
      // Hiển thị số lượng khách sạn trong một phần tử HTML có id là "numberHotelCount"
      $("#numberRating").text(numberOfHotels);
    },
  });
  // Xử lý sự kiện khi người dùng nhấp vào một liên kết khách sạn
});

// Gắn sự kiện click cho nút có id là "search-btn"
document.querySelector(".search-button").addEventListener("click", function () {
  // Thu thập dữ liệu từ form
  let destination = document.getElementById("hotel-destination").value.trim();
  let checkIn = document.getElementById("checkIn").value;
  let checkOut = document.getElementById("checkOut").value;
  let roomCount = document.getElementById("room-count").textContent;
  let adultsCount = document.getElementById("adults-count").textContent;
  let childrenCount = document.getElementById("children-count").textContent;

  // Kiểm tra dữ liệu nhập
  if (!destination || !checkIn || !checkOut) {
    alert("Vui lòng điền đầy đủ thông tin tìm kiếm!");
    return;
  }

  // Tạo URL với query parameters
  let queryParams = new URLSearchParams({
    destination: destination,
    checkIn: checkIn,
    checkOut: checkOut,
    rooms: roomCount,
    adults: adultsCount,
    children: childrenCount,
  }).toString();

  // Chuyển hướng sang trang hotelList với các tham số tìm kiếm
  window.location.href = `/hotelList?${queryParams}`;
});
