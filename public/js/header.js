document.addEventListener("DOMContentLoaded", async () => {
  // Lấy giá trị token từ localStorage
  console.log("da zo duoc header frontend");
  const token = getCookie("token");
  console.log("<<<<Check token op front end>>>>",token)
  // Hàm lấy thông tin người dùng hiện tại
  async function getCurrentUser() {
    try {
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const response = await fetch("/api/v1/users/getCurrentUser", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const currennUser = await getCurrentUser();

  // Kiểm tra token và cập nhật giao diện
  if (token) {
    const userName = currennUser.name;
    const userType = currennUser.type;
    if (userName) {
      // Nếu token hợp lệ và lấy được tên người dùng

      const signInSignUpLi = document.querySelector("#nav-login");
      let href_val = "";

      // Xác định đường dẫn theo loại người dùng
      if (userType === "client" || userType === "admin") {
        href_val = "/userInfor";
      } else if (userType === "owner") {
        href_val = "/agentInfo";
      }

      // Ẩn phần tử nếu cần
      if (userType === "admin" || userType === "owner") {
        document.getElementById("supplierTime").style.display = "none";
      }

      // Cập nhật nội dung HTML cho phần tử #account
      const signIn = document.querySelector("#account");
      signIn.innerHTML = `
        <a href="${href_val}" class="btn-group1">
          <i class="fa-regular fa-user"></i> ${userName}
        </a>
      `;

      // Cập nhật nội dung HTML cho phần tử li #nav-login
      signInSignUpLi.innerHTML = `
        <div class="btn-group1">
          <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
              data-bs-auto-close="false" aria-expanded="false" id="filte-dropdown">
            <i class="fa-regular fa-user"></i> ${userName}
          </button>
          <ul class="dropdown-menu" id="dropdownshown">
            <li><a class="dropdown-item2" href="${href_val}">Thông tin cá nhân</a></li>
            <li><hr class="dropdown-divider"></li>
            <li id="logout"><a class="dropdown-item" href="/">Đăng xuất</a></li>
          </ul>
        </div>
      `;

      // Thêm sự kiện cho nút "Đăng xuất"
      document.getElementById("logout").addEventListener("click", () => {
        // Xóa token và thông tin liên quan khỏi localStorage
        localStorage.removeItem("token");

        // Điều hướng về trang đăng nhập
        window.location.href = "http://localhost:3030/signin";
      });
    } else {
      console.error("Failed to fetch userName or userName is null");
    }
  }
});

// Hàm để lấy giá trị token, bạn cần thay đổi hàm này để phù hợp với cách lấy token của bạn

function toggleCollapse(btnNumber) {
  const buttons = document.querySelectorAll(".btn-outline-info");
  buttons.forEach((button, index) => {
    if (index + 1 === btnNumber) {
      button.classList.add("active");
      button.style.color = "#fff"; // White text color
      button.style.backgroundColor = "#10294D"; // Blue background color
    } else {
      button.classList.remove("active");
      button.style.color = "#10294D"; // Blue text color
      button.style.backgroundColor = "#f0f2f5"; // White background color
    }
  });

  for (let i = 1; i <= 3; i++) {
    const collapseId = "noi-dung-collapse" + i;
    const collapseElement = document.getElementById(collapseId);
    if (i === btnNumber) {
      collapseElement.classList.add("show");
    } else {
      collapseElement.classList.remove("show");
    }
  }
}

const toggleBtn = document.querySelector(".toggle_btn");
const toggleBtnIcon = document.querySelector(".toggle_btn i");
const dropDownMenu = document.querySelector(".dropdown_menu");

toggleBtn.addEventListener("click", function () {
  // Kiểm tra trạng thái hiện tại của dropdown menu
  const isOpen = dropDownMenu.style.display === "block";

  // Nếu dropdown menu đang ẩn, hiển thị nó và chuyển đổi biểu tượng
  if (!isOpen) {
    dropDownMenu.style.display = "block";
    toggleBtnIcon.classList.add("fa-xmark");
    toggleBtnIcon.classList.remove("fa-bars");
  } else {
    // Nếu dropdown menu đang hiển thị, ẩn nó và chuyển đổi biểu tượng
    dropDownMenu.style.display = "none";
    toggleBtnIcon.classList.remove("fa-xmark");
    toggleBtnIcon.classList.add("fa-bars");
  }
});

// Sự kiện click vào class toUserInfo
document.querySelector(".toUserInfo").addEventListener("click", function () {
  // Kiểm tra nếu có token
  if (token) {
    if (currentUser.type == "admin" || currentUser.type == "client") {
      // Di chuyển đến trang userInfor
      window.location.href = "/userInfor";
    } else if (currentUser.type == "owner") {
      // Di chuyển đến trang userInfor
      window.location.href = "/agentInfo";
    } else {
      // Hiển thị thông báo yêu cầu đăng nhập
      alert("Vui lòng đăng nhập để xem thông tin cá nhân.");
      // Chuyển hướng đến trang login
      window.location.href = "/signin";
    }
  }
});
document.querySelector(".toUserInf").addEventListener("click", function () {
  // Kiểm tra nếu có token
  if (token) {
    if (currentUser.type == "admin" || currentUser.type == "client") {
      // Di chuyển đến trang userInfor
      window.location.href = "/userInfor";
    } else if (currentUser.type == "owner") {
      // Di chuyển đến trang userInfor
      window.location.href = "/agentInfo";
    } else {
      // Hiển thị thông báo yêu cầu đăng nhập
      alert("Vui lòng đăng nhập để xem thông tin cá nhân.");
      // Chuyển hướng đến trang login
      window.location.href = "/signin";
    }
  }
});

// Các hàm khác như getToken và toggleCollapse vẫn giữ nguyên
