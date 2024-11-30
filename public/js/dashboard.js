$(document).ready(async function () {

  const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
      
  async function getLogout() {
    try {
      // Gửi yêu cầu đăng xuất tới backend
      const response = await fetch("/api/v1/users/logout", {
        method: "POST",

      credentials: "include",
      headers: {
      'CSRF-Token': token // <-- is the csrf token as a header
      },
      });

      if (response.ok) {
        // Nếu đăng xuất thành công ở backend
        // Điều hướng về trang đăng nhập
        window.location.href = "/signin";
      } else {
        // Xử lý lỗi nếu đăng xuất không thành công
        const errorText = await response.text();
        console.error("Logout failed:", errorText);
        alert("Đăng xuất không thành công. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.");
    }
  }
  /* script.js */
  // Lắng nghe sự kiện nhấp vào nút tương ứng
  document.getElementById("button1").addEventListener("click", function () {
    // Hiển thị phần tử content1
    document.getElementById("content1").style.display = "block";
    document.getElementById("content2").style.display = "none";
    document.getElementById("contentManageRoom").style.display = "none";
    document.getElementById("contentAddHotel").style.display = "none";
    document.getElementById("chart").style.display = "none";
    document.getElementById("contentBooking").style.display = "none";
    document.getElementById("manageCoupon").style.display = "none";
  });

  document.getElementById("button2").addEventListener("click", function () {
    // Hiển thị phần tử content2
    document.getElementById("content2").style.display = "block";
    document.getElementById("content1").style.display = "none";
    document.getElementById("contentBooking").style.display = "none";
    document.getElementById("contentAddHotel").style.display = "none";
    document.getElementById("chart").style.display = "none";
    document.getElementById("contentBooking").style.display = "none";
    document.getElementById("manageCoupon").style.display = "none";
  });

  document.getElementById("button3").addEventListener("click", function () {
    // Hiển thị phần tử contentBooking
    document.getElementById("content2").style.display = "none";
    document.getElementById("content1").style.display = "none";
    document.getElementById("contentBooking").style.display = "block";
    document.getElementById("contentAddHotel").style.display = "none";
    document.getElementById("chart").style.display = "none";
    document.getElementById("manageCoupon").style.display = "none";
  });

  document.getElementById("button4").addEventListener("click", () => {
    document.getElementById("content2").style.display = "none";
    document.getElementById("content1").style.display = "none";
    document.getElementById("chart").style.display = "block";
    document.getElementById("contentAddHotel").style.display = "none";
    document.getElementById("contentBooking").style.display = "none";
    document.getElementById("manageCoupon").style.display = "none";
  });

  document.getElementById("button5").addEventListener("click", () => {
    document.getElementById("content2").style.display = "none";
    document.getElementById("content1").style.display = "none";
    document.getElementById("chart").style.display = "none";
    document.getElementById("contentAddHotel").style.display = "none";
    document.getElementById("contentBooking").style.display = "none";
    document.getElementById("manageCoupon").style.display = "block";
  });

  document.getElementById("button6").addEventListener("click", async () => {
    await getLogout();
  });

  var header = document.getElementById("menu-content");
  var btns = header.getElementsByClassName("btn");
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
      var current = document.getElementsByClassName("active");
      current[0].className = current[0].className.replace(" active", "");
      this.className += " active";
    });
  }
  const bodyLeft = document.querySelector(".body-left");
  const btnShow = bodyLeft.querySelector(".fa-bars");
  const btnHidden = bodyLeft.querySelector(".fa-xmark");
  btnShow.addEventListener("click", () => {
    bodyLeft.classList.add("show-menu");
  });
  btnHidden.addEventListener("click", () => {
    bodyLeft.classList.remove("show-menu");
  });
});
