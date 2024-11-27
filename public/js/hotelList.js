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
// Function to update the displayed price value

// Function to format currency for display
function formatCurrency(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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
  const token = localStorage.getItem("token");
  if (token) {
    $("#broadcast").show();
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
                    <a href="/hotel//${slug}/${item.id}" class="hotel-link">${item.name}</a>
                    ${stars}
                  </h5>
                  <div class="card-describle">
                    <p>${description}</p>
                    <p>
                      <i class="fa-solid fa-location-dot"></i>${item.map}
                      <span><button class="btn" data-bs-toggle="modal" onclick="redirectToMap('${item.name}' )" style="color: blue">Xem bản đồ</button></span>
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

// Gọi hàm sendSelectedFacilities khi muốn gửi các giá trị đã chọn qua API

// Gọi hàm findhotel() khi trang được tải
window.addEventListener("beforeunload", function (event) {
  if (localStorage.getItem("hotelData")) {
    localStorage.removeItem("hotelData");
  }
});
function changeSort(sortType) {
  // Lấy phần tử button dropdown để thay đổi nội dung
  const dropdownButton = document.getElementById("filter-dropdown");

  // Thay đổi nội dung của button dropdown
  dropdownButton.innerHTML = `<i class="fa-solid fa-sort"></i> Sắp xếp theo: ${sortType}`;

  // Đóng dropdown sau khi người dùng chọn
  const dropdownMenu = document.querySelector(".dropdown-menu");
  const bsDropdown = new bootstrap.Dropdown(dropdownButton); // Sử dụng Bootstrap để tạo dropdown
  bsDropdown.hide(); // Đóng dropdown
}
$(document).ready(function () {
  // Gửi dữ liệu filter qua AJAX khi có sự thay đổi
  $(".form-check-input, #price_range1").on("change input", function () {
    let filters = {
      price: $("#price_range1").val(),
      propertyTypes: [],
      bedType: $("input[name='bed_type']:checked").val(),
      payment: $("input[name='payment']:checked").val(),
      roomType: $("input[name='room_type']:checked").val(),
      services: [],
      roomFacilities: [],
    };

    // Thu thập dữ liệu từ checkbox
    $(".type_hotel input[type='checkbox']:checked").each(function () {
      filters.propertyTypes.push($(this).val());
    });
    $(".services_hotel input[type='checkbox']:checked").each(function () {
      filters.services.push($(this).val());
    });
    $(".services_room input[type='checkbox']:checked").each(function () {
      filters.roomFacilities.push($(this).val());
    });

    console.log("Filters đã chọn:", filters);

    // Gửi yêu cầu AJAX đến API
    $.ajax({
      url: "http://localhost:3030/api/v1/hotelAmenities/hotel/amenities", // API lọc khách sạn
      type: "POST", // Hoặc "GET" tùy vào API
      data: JSON.stringify(filters), // Gửi dữ liệu bộ lọc
      contentType: "application/json", // Đảm bảo gửi dữ liệu ở định dạng JSON
      success: function (response) {
        console.log("Kết quả lọc:", response);

        // Hiển thị dữ liệu lọc
        $(".results-container").html(""); // Xóa kết quả cũ
        response.data.forEach((hotel) => {
          $(".results-container").append(`
            <div class="hotel">
              <h3>${hotel.name}</h3>
              <p>Giá: ${hotel.price} VND</p>
              <p>Loại hình: ${hotel.type}</p>
              <p>Tiện nghi: ${hotel.services.join(", ")}</p>
              <p>Phòng: ${hotel.roomType}</p>
            </div>
          `);
        });
      },
      error: function (xhr, status, error) {
        console.error("Lỗi khi lọc dữ liệu:", error, xhr.responseText);
      },
    });
  });
});
