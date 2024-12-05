document.getElementById("register").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "/register/?type=owner";
});
document.getElementById("loggin").addEventListener("click", function (event) {
  event.preventDefault();
  window.location.href = "/signin/";
});
