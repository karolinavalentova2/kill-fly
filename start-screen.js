const menu = document.querySelector(".menu");

document.querySelector("#mobileMenu").addEventListener("click", displayMenu);

function displayMenu() {
  if ((menu.style.display = "none")) {
    menu.style.display = "flex";
    document.querySelector("#mobileMenu").style.background =
      "url('http://petragergely.dk/kea/imgs/delete.png')";
    document.querySelector("#mobileMenu").style.backgroundSize = "cover";
  } else {
    menu.style.display = "none";
    document.querySelector("#mobileMenu").style.background =
      "url('http://petragergely.dk/kea/imgs/menu.png')";
  }
}
