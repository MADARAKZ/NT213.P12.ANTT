// $(document).on("click", ".hotel-link", function (event) {
//   event.preventDefault(); // Ngăn chặn hành vi mặc định của liên kết
//   var href = $(this).attr("href");
//   var hotelId = href.split("/").pop();
//   window.location.href = "/hotel/" + hotelId;
// });
function clearSelection() {
  var radios = document.getElementsByName("option");
  radios.forEach(function (radio) {
    radio.checked = false;
  });
}


document.addEventListener('DOMContentLoaded', function () {
  // Make sure the button exists before adding the event listener
  const button = document.getElementById('btnlo');
  if (button) {
    button.addEventListener('click', function () {
      // Get the hotel name (you can replace this with dynamic data if needed)
      const hotelName = 'Hotel XYZ';  // Replace this with actual dynamic value
      redirectToMap(hotelName);
    });
  }
});
// Function to update the displayed price value

// Function to format currency for display
function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
const tokencsrf = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");
document.addEventListener("DOMContentLoaded", function () {
  const priceRange1 = document.getElementById("price_range1");
  const valueElement1 = document.getElementById("value1");
  const priceRange2 = document.getElementById("price_range2");
  const valueElement2 = document.getElementById("value2");

  if (priceRange1 && valueElement1) {
    // Attach event listener for price_range1
    priceRange1.addEventListener("input", () => {
      updateValue("value1", "price_range1");
    });
  }

  if (priceRange2 && valueElement2) {
    // Attach event listener for price_range2
    priceRange2.addEventListener("input", () => {
      updateValue("value2", "price_range2");
    });
  }
});

function updateValue(valueId, rangeId) {
  const priceRange = document.getElementById(rangeId);
  const valueElement = document.getElementById(valueId);

  if (priceRange && valueElement) {
    const currentValue = priceRange.value;
    const formattedValue = numberWithCommas(currentValue) + " VND";
    valueElement.textContent = `Từ ${formattedValue}`;
  } else {
    console.error(
      `Không tìm thấy phần tử có id '${rangeId}' hoặc '${valueId}'.`
    );
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(() => {
  function redirectToMap(hotelName) {
    window.location.href =
      "https://www.bing.com/maps?q=" + encodeURIComponent(hotelName);
  }
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

  $("#registerTime").on("click", function () {
    window.location.href = "/register";
  });

  $("#loginTime").on("click", function () {
    window.location.href = "/signin";
  });
  $(document).on("click", "#filter-header", function () {
    $(".popup-overlay").show();
  });
  $(".close-btn").click(function () {
    $(".popup-overlay").hide();
  });

  const loaddata = (data) => {
    const numberOfResultsElement = document.getElementById("numberOfResults");
    const count = data.filter((item) => item.hasOwnProperty("id")).length;

    numberOfResultsElement.textContent = count;

    const container = document.getElementById("hotelList");
    container.innerHTML = ""; // Clear old data

    data.forEach((item) => {
      const slug = ChangeToSlug(item.name);
      const formattedCost = numberWithCommas(item.cost);
      const imgFeature = item.UrlImageHotels.map((item1) => item1.url);
      const imgRender = imgFeature[0];
      const reviews = item.Reviews.map((review) => ({
        rating: review.rating,
        description: review.description,
      }));
      const description = reviews[0] ? reviews[0].description : "Tốt";

      const roomType = item.Rooms.map((room) => ({
        roomName: room.name,
        numPeople: room.quantity_people,
        price: room.price,
        status: room.status,
      }));

      let roomWithMaxPrice = roomType.reduce((prev, current) => {
        if (current.status) {
          return prev.price < current.price ? prev : current;
        } else {
          return prev;
        }
      }, roomType[0]);

      let statusRoom = roomWithMaxPrice.status
        ? "Còn phòng"
        : "Tạm hết loại phòng này";

      let peopleNum = `<i class="fa-solid fa-user"></i>`.repeat(
        roomWithMaxPrice.numPeople
      );

      const stars = `<i class="fas fa-star"></i>`.repeat(item.star);
      const card = `
        <div class="card mb-3">
          <div class="row img-adjust g-0">
            <a href="/hotel/${slug}/${item.id}" class="hotel-link wrap-img">
              <div class="col-md-4">
                <img src="${imgRender}" alt="...">
              </div>
            </a>
            <div class="col-md-8">
              <div class="card-body">
                <div class="head-title">
                  <h5 class="card-title">
                    <a href="/hotel/${slug}/${item.id}" class="hotel-link">${item.name}</a>
                    ${stars}
                  </h5>
                  <div class="card-describle">
                    <p>${description}</p>
                    <p>
                      <i class="fa-solid fa-location-dot"></i>${item.map}
                      <span><button id="btnlo" class="btn" data-hotel-name="${item.name}">Xem bản đồ</button></span>
                    </p>
                  </div>
                </div>
                <div class="room-type-price">
                  <div class="room-type">
                    <p>${roomWithMaxPrice.roomName} ${peopleNum}<i class="fa-solid fa-bath"></i><i class="fa-solid fa-bed"></i></p>
                    <p class="card-text">
                      <small class="text-body-secondary">${statusRoom}</small>
                    </p>
                  </div>
                  <div class="room-price">
                    <p>VND ${formattedCost}</p>
                    <a href="/hotel/${slug}/${item.id}" class="btn btn-primary">Kiểm tra</a>
                  </div>
                </div>
                <div class="get-lower-price" id="broadcast">
                  <a href="/signin" ><span id="loginTime"><i class="fa-solid fa-key"></i>Đăng nhập</span> hoặc <span id="registerTime">đăng kí</span> để xem giá ưu đãi hơn</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML("beforeend", card);
    });
    $(document).on('click', '#btnlo', function () {
      const hotelName = $(this).data('hotel-name');
      console.log('Hotel Name:', hotelName);
      redirectToMap(hotelName);
    });

    let thisPage = 1;
    let limit = 5;
    let list = document.querySelectorAll("#hotelList .card");

    function loadItem() {
      let beginGet = limit * (thisPage - 1);
      let endGet = limit * thisPage - 1;

      list.forEach((item, key) => {
        if (key >= beginGet && key <= endGet) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
      listPage();
    }
    function listPage() {
      let count = Math.ceil(list.length / limit);
      let paginationElement = document.querySelector(".listPage");
      paginationElement.innerHTML = "";

      if (thisPage !== 1) {
        let prev = document.createElement("li");
        prev.innerText = "Prev";
        prev.classList.add("pagination-prev");
        prev.setAttribute("onclick", `changePage(${thisPage - 1})`);
        paginationElement.appendChild(prev);
      }

      if (count <= 1) {
        return;
      }

      const createPageItem = (pageNum) => {
        let page = document.createElement("li");
        page.innerText = pageNum;
        page.classList.add("pagination-page");
        if (pageNum === thisPage) {
          page.classList.add("active");
        }
        page.setAttribute("onclick", `changePage(${pageNum})`);
        return page;
      };

      paginationElement.appendChild(createPageItem(1));

      if (thisPage > 3) {
        let dots = document.createElement("li");
        dots.innerText = "...";
        dots.classList.add("pagination-dots");
        paginationElement.appendChild(dots);
      }

      let startPage = Math.max(2, thisPage - 1);
      let endPage = Math.min(count - 1, thisPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        paginationElement.appendChild(createPageItem(i));
      }

      if (thisPage < count - 2) {
        let dots = document.createElement("li");
        dots.innerText = "...";
        dots.classList.add("pagination-dots");
        paginationElement.appendChild(dots);
      }

      if (count > 1) {
        paginationElement.appendChild(createPageItem(count));
      }

      if (thisPage !== count) {
        let next = document.createElement("li");
        next.innerText = "Next";
        next.classList.add("pagination-next");
        next.setAttribute("onclick", `changePage(${thisPage + 1})`);
        paginationElement.appendChild(next);
      }

      paginationElement.style.display = list.length > limit ? "block" : "none";
    }
    
    window.changePage = function (i) {
      thisPage = i;
      loadItem();
    };

    loadItem();
  };

  const urlParams = new URLSearchParams(window.location.search);

  // Lấy giá trị từng tham số
  const destination = urlParams.get("destination");
  const checkIn = urlParams.get("checkIn");
  const checkOut = urlParams.get("checkOut");
  const rooms = urlParams.get("rooms");
  const adults = urlParams.get("adults");
  const children = urlParams.get("children");
  let sortType = "";
  $(document).ready(function () {
    filters = {
      destination: destination || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      rooms: rooms || "1",
      adults: adults || "1",
      children: children || "0",
      price: "0",
      propertyTypes: [],
      type: [],
      sortType: "",
      servicesHotel: [],
      servicesRoom: [],
      paymentMethods: "",
      TypeBed: "",
      roomType: "",
      ratings: [],
    };
    $.ajax({
      url: "/api/v1/hotelAmenities/hotel/amenities",
      type: "POST",
      credentials: "include",
      headers: {
        "CSRF-Token": tokencsrf, // <-- is the csrf token as a header
      },
      data: JSON.stringify(filters),
      contentType: "application/json",
      success: function (response) {
        console.log("Kết quả lọc (sắp xếp):", response);
        loaddata(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          console.warn(xhr.responseJSON.message); // Log lỗi từ server
          // Hiển thị thông báo cho người dùng
          $("#hotel-container").html(
            "<p>Không tìm thấy khách sạn phù hợp với tiêu chí tìm kiếm.</p>"
          );
        } else {
          console.error("Lỗi không xác định:", error);
        }
      },
    });
  });

  $(".dropdown-menu a.dropdown-item").on("click", function (event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của thẻ <a>
    // Reset các giá trị trong filters
    filters = {
      destination: destination || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      rooms: rooms || "1",
      adults: adults || "1",
      children: children || "0",
      price: "0",
      propertyTypes: [],
      type: [],
      servicesHotel: [],
      servicesRoom: [],
      paymentMethods: "",
      TypeBed: "",
      roomType: "",
      ratings: [],
    };

    // Lấy giá trị từ các input dạng range
    $('.col-10 input[type="range"]').each(function () {
      let value = $(this).val();
      let inputId = $(this).attr("id");
      console.log("Input ID:", inputId, "Value:", value);

      // Kiểm tra ID của input để xác định key tương ứng trong filters
      if (inputId === "price_range1" || inputId === "price_range2") {
        if (value != 0) filters.price = value;
      }
    });

    // Lấy giá trị từ các checkbox (loại hình khách sạn)
    $(".type_hotel input[type='checkbox']:checked").each(function () {
      filters.type.push($(this).val());
    });

    // Lấy giá trị từ các checkbox (dịch vụ khách sạn)
    $(".services_hotel input[type='checkbox']:checked").each(function () {
      filters.servicesHotel.push($(this).val());
    });

    // Lấy giá trị từ các checkbox (dịch vụ phòng)
    $(".services_room input[type='checkbox']:checked").each(function () {
      filters.servicesRoom.push($(this).val());
    });

    // Lấy giá trị từ radio (phương thức thanh toán)
    $("input[name='payment']:checked").each(function () {
      filters.paymentMethods = $(this).val();
    });

    // Lấy giá trị từ radio (loại giường)
    $("input[name='bed_type']:checked").each(function () {
      filters.TypeBed = $(this).val();
    });

    // Lấy giá trị từ select (loại hình bất động sản)
    filters.propertyTypes.push($("#property_type_select").val());

    // Lấy giá trị từ radio (đánh giá sao)
    $("input[name='rating']:checked").each(function () {
      filters.ratings.push($(this).val());
    });

    // Lấy giá trị từ radio (loại phòng)
    $("input[name='room_type']:checked").each(function () {
      filters.roomType = $(this).val();
    });

    console.log("Filters đã chọn:", filters);

    sortType = "";
    // Lấy giá trị sortType từ thuộc tính data-value
    sortType = $(this).data("value");
    filters.sortType = sortType;

    // Gửi request AJAX sau khi chọn giá trị sort
    console.log("Sort Type Selected:", filters.sortType);

    $.ajax({
      url: "/api/v1/hotelAmenities/hotel/amenities",
      type: "POST",
      credentials: "include",
      headers: {
        "CSRF-Token": tokencsrf, // <-- is the csrf token as a header
      },
      data: JSON.stringify(filters),
      contentType: "application/json",
      success: function (response) {
        console.log("Kết quả lọc (sắp xếp):", response);
        loaddata(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          console.warn(xhr.responseJSON.message); // Log lỗi từ server
          // Hiển thị thông báo cho người dùng
          $("#hotel-container").html(
            "<p>Không tìm thấy khách sạn phù hợp với tiêu chí tìm kiếm.</p>"
          );
        } else {
          console.error("Lỗi không xác định:", error);
        }
      },
    });
  });
  $(
    ".form-check-input, .col-10 input[type='range'], select, input[type='radio'], .dropdown-menu a.dropdown-item"
  ).on("change", function () {
    // Reset các giá trị trong filters
    filters = {
      destination: destination || "",
      checkIn: checkIn || "",
      checkOut: checkOut || "",
      rooms: rooms || "1",
      adults: adults || "1",
      children: children || "0",
      price: "0",
      propertyTypes: [],
      type: [],
      sortType: "",
      servicesHotel: [],
      servicesRoom: [],
      paymentMethods: "",
      TypeBed: "",
      roomType: "",
      ratings: [],
    };

    // Lấy giá trị từ các input dạng range
    $('.col-10 input[type="range"]').each(function () {
      let value = $(this).val();
      let inputId = $(this).attr("id");
      console.log("Input ID:", inputId, "Value:", value);

      // Kiểm tra ID của input để xác định key tương ứng trong filters
      if (inputId === "price_range1" || inputId === "price_range2") {
        if (value != 0) filters.price = value;
      }
    });

    // Lấy giá trị từ các checkbox (loại hình khách sạn)
    $(".type_hotel input[type='checkbox']:checked").each(function () {
      filters.type.push($(this).val());
    });

    // Lấy giá trị từ các checkbox (dịch vụ khách sạn)
    $(".services_hotel input[type='checkbox']:checked").each(function () {
      filters.servicesHotel.push($(this).val());
    });

    // Lấy giá trị từ các checkbox (dịch vụ phòng)
    $(".services_room input[type='checkbox']:checked").each(function () {
      filters.servicesRoom.push($(this).val());
    });

    // Lấy giá trị từ radio (phương thức thanh toán)
    $("input[name='payment']:checked").each(function () {
      filters.paymentMethods = $(this).val();
    });
    filters.sortType = sortType;

    // Lấy giá trị từ radio (loại giường)
    $("input[name='bed_type']:checked").each(function () {
      filters.TypeBed = $(this).val();
    });

    // Lấy giá trị từ select (loại hình bất động sản)
    filters.propertyTypes.push($("#property_type_select").val());

    // Lấy giá trị từ radio (đánh giá sao)
    $("input[name='rating']:checked").each(function () {
      filters.ratings.push($(this).val());
    });

    // Lấy giá trị từ radio (loại phòng)
    $("input[name='room_type']:checked").each(function () {
      filters.roomType = $(this).val();
    });

    console.log("Filters đã chọn:", filters);

    // Gửi yêu cầu AJAX với dữ liệu lọc
    $.ajax({
      url: "/api/v1/hotelAmenities/hotel/amenities",
      type: "POST",
      credentials: "include",
      headers: {
        "CSRF-Token": tokencsrf, // <-- is the csrf token as a header
      },
      data: JSON.stringify(filters),
      contentType: "application/json",
      success: function (response) {
        console.log("Kết quả lọc:", response);
        loaddata(response);
      },
      error: function (xhr, status, error) {
        if (xhr.status === 404) {
          console.warn(xhr.responseJSON.message); // Log lỗi từ server
          // Hiển thị thông báo cho người dùng
          $("#hotel-container").html(
            "<p>Không tìm thấy khách sạn phù hợp với tiêu chí tìm kiếm.</p>"
          );
        } else {
          console.error("Lỗi không xác định:", error);
        }
      },
    });
  });

  // Xử lý sự kiện khi thay đổi các filter
  // Hàm hiển thị kết quả lọc
});

// Nút show more
function showMoreFunc(elementID) {
  var dots = document.getElementById(elementID + "-dots");
  var moreText = document.getElementById(elementID + "-moreContent");
  var btnText = document.getElementById(elementID);

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Xem thêm";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Thu gọn";
    moreText.style.display = "inline";
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Lấy tất cả các item trong dropdown
  const dropdownItems = document.querySelectorAll('.dropdown-item');
  
  // Lặp qua tất cả các item và thêm sự kiện click
  dropdownItems.forEach(item => {
    item.addEventListener('click', function(event) {
      // Lấy giá trị text của mục đã chọn
      const sortType = event.target.textContent.trim();
      
      // Gọi hàm changeSort và truyền giá trị của mục đã chọn
      changeSort(sortType);
    });
  });
  // Lấy tất cả các nút "Xem thêm"
  const showMoreButtons = document.querySelectorAll('.change-color');
  
  // Lặp qua tất cả các nút "Xem thêm" và thêm sự kiện click
  showMoreButtons.forEach(button => {
    button.addEventListener('click', function(event) {
      const buttonId = event.target.id;
      // Gọi hàm showMoreFunc với ID của nút
      showMoreFunc(buttonId);
    });
  });
});

function changeSort(sortType) {
  // Lấy phần tử button dropdown
  const dropdownButton = document.getElementById("filter-dropdown");

  // Thay đổi nội dung của nút dropdown thành cụm người dùng chọn
  dropdownButton.innerHTML = `<i class="fa-solid fa-sort"></i> Sắp xếp theo: ${sortType}`;

  // Đóng dropdown menu sau khi chọn
  const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownButton);
  if (dropdownInstance) {
    dropdownInstance.hide();
  }

  // Gửi yêu cầu hoặc thực hiện hành động với `sortType`
  console.log("Người dùng đã chọn sắp xếp:", sortType);
}


