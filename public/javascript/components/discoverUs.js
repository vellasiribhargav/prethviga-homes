// navigation bar : color change while clicking

const navLinks = document.querySelectorAll(".pages-list li a");

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((l) => l.classList.remove("active"));
    this.classList.add("active");
  });
});

// scroll option

const scrollBtn = document.getElementById("scrollToTopBtn");
window.addEventListener("scroll", () => {
  scrollBtn.classList.toggle("show", window.scrollY > 200);
});
scrollBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// mobile view :navigation bar

const menuBtn = document.querySelector(".menu-btn");
const mobileContainer = document.querySelector(".mobile-container");
const mobileOverlay = document.querySelector(".mobile-overlay");
const closeBtn = document.querySelector(".menuclose");

menuBtn.addEventListener("click", () => {
  mobileContainer.classList.add("active");
  mobileOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
});

closeBtn.addEventListener("click", () => {
  mobileContainer.classList.remove("active");
  mobileOverlay.classList.remove("active");
  document.body.style.overflow = "auto";
});

mobileOverlay.addEventListener("click", () => {
  mobileContainer.classList.remove("active");
  mobileOverlay.classList.remove("active");
});

//projects:  header-container

const images = document.querySelectorAll(".rotator-img");
let index = 0;
function imageslide() {
  images.forEach((img) => img.classList.remove("active"));
  images[index].classList.add("active");
  index = (index + 1) % images.length;
}

imageslide();
setInterval(imageslide, 2500);

// project:  project-container

const tabs = document.querySelectorAll(".project-active");
const buttons = document.querySelectorAll(".project-buttons");
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    if (index === 0) {
      buttons.forEach((btn) => (btn.style.display = "flex"));
    }

    if (index === 1) {
      buttons.forEach((btn) => (btn.style.display = "none"));
    }
  });
});

// project and on_going :  question container

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  item.querySelector(".question-types").addEventListener("click", () => {
    item.classList.toggle("active");
  });
});
