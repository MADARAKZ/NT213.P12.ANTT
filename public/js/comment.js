function previewImage() {
  var fileInput = document.getElementById("fileInput");
  var preview = document.getElementById("preview");

  // Kiểm tra xem người dùng đã chọn tệp tin hay chưa
  if (fileInput.files && fileInput.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };

    reader.readAsDataURL(fileInput.files[0]);
  }
}

function resetPreview() {
  var preview = document.getElementById("preview");
  preview.src = "";
  preview.style.display = "none";
}
