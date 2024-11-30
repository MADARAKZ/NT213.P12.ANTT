document.addEventListener("DOMContentLoaded", () => {
  const chatbotToggler = document.querySelector(".chatbot-toggler");
  const closeBtn = document.querySelector(".close-btn");
  const chatbox = document.querySelector(".chatbox");
  const sendChatBtn = document.getElementById("send-btn");
  const fileInput = document.querySelector('.chat-input input[type="file"]');
  const sendBtn = document.getElementById("send-btn");

  const tokencsrf = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute("content");

  $("#send-btn").click(function () {
    try {
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append("ModelAlImage", file);

        $.ajax({
          url: "http://localhost:3030/api/v1/chatbotAl/findlocation",
          method: "POST",
          credentials: "include",
          headers: {
            "CSRF-Token": tokencsrf,
          },
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            console.log("API response:", response);

            const selectedLocation = response.find((item) => item.score > 0.5);
            if (selectedLocation) {
              const locationName = selectedLocation.class;
              const message = `Địa điểm bạn cần tìm là ${locationName}, đây là một số gợi ý về khách sạn của chúng tôi.`;
              chatbox.appendChild(createChatLi(message, "incoming"));
              chatbox.scrollTop = chatbox.scrollHeight;

              const diaDiemToTinhThanh = {
                "Bà Nà Hill": "Đà Nẵng",
                "Phố Cổ Hội An": "Đà Nẵng",
                "Phong Nha Kẻ Bàng": "Quảng Bình",
                "Nha Trang": "Nha Trang",
                "Vịnh Hạ Long": "Quảng Ninh",
                "Phú Quốc": "Phú Quốc",
                Huế: "Huế",
                "Đà Lạt": "Đà Lạt",
              };

              const layTinhThanh = (tenDiaDiem) =>
                diaDiemToTinhThanh[tenDiaDiem] || tenDiaDiem;
              const tinh = layTinhThanh(locationName);

              setTimeout(() => {
                window.location.href = `/hotelList?destination=${tinh}`;
              }, 1500);
            } else {
              const message =
                "Hình ảnh bạn cung cấp không phù hợp với hệ thống của chúng tôi.";
              chatbox.appendChild(createChatLi(message, "incoming"));
              console.log("Không có địa điểm nào có score > 0.5.");
            }
          },
          error: function (error) {
            console.error("Error sending file:", error);
            const message =
              error.status === 401
                ? "Vui lòng đăng nhập để tìm kiếm."
                : "Có lỗi xảy ra. Vui lòng thử lại sau.";
            chatbox.appendChild(createChatLi(message, "incoming"));
            chatbox.scrollTop = chatbox.scrollHeight;
          },
        });
      } else {
        console.error("No file selected.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      const errorMessage = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.";
      chatbox.appendChild(createChatLi(errorMessage, "incoming"));
      chatbox.scrollTop = chatbox.scrollHeight;
    }
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      sendBtn.style.display = "inline-block";
    }
  });

  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);

    const chatContent =
      className === "outgoing"
        ? `
        <span class="material-symbols-outlined">smart_toy</span>
        <img id="chatlo" src="${message}" >
      `
        : `
        <span class="material-symbols-outlined">smart_toy</span>
        <p>${message}</p>
      `;

    chatLi.innerHTML = chatContent;
    return chatLi;
  };

  const handleChat = () => {
    const file = fileInput.files[0];
    if (!file) {
      console.error("No file selected.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      chatbox.appendChild(createChatLi(imageUrl, "outgoing"));
      chatbox.scrollTop = chatbox.scrollHeight;
    };

    reader.readAsDataURL(file);
  };

  sendChatBtn.addEventListener("click", handleChat);

  closeBtn.addEventListener("click", () => {
    document.body.classList.remove("show-chatbot");
  });

  chatbotToggler.addEventListener("click", () => {
    document.body.classList.toggle("show-chatbot");
  });
});
