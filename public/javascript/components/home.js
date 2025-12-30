const menuIcon = document.querySelector('.menuIcon');
const closeIcon = document.querySelector('.closeIcon');
const mobileMenu = document.querySelector('.actionAreaMobile');
const contact = document.querySelector('.contactLink');


// Toggle mobile menu open
menuIcon.onclick = () => {
  mobileMenu.classList.add('showMenu');
  closeIcon.style.display = 'block';
};

// Toggle mobile menu close
closeIcon.onclick = () => {
  mobileMenu.classList.remove('showMenu');
};

contact.onclick = () => {
  mobileMenu.classList.remove('showMenu');
};



// scroll option

const scrollBtn = document.getElementById("scrollToTopBtn");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("show", window.scrollY > 200);
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

