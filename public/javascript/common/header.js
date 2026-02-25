const menuBtn = document.querySelectorAll(".header_tab_action .pagesList .pageLink a");
const menuBar = document.querySelectorAll(".navbarContainer .actionAreaMobile .pages .pagesList .pageLink a");

// Set active class based on current page
const currentPath = window.location.pathname;

function updateActiveLinks() {
    menuBtn.forEach(tab => {
        tab.classList.remove("active");
        const href = tab.getAttribute("href");
        const isHome = (href === "/home" || href === "/") && (currentPath === "/" || currentPath === "/home");
        const isProjects = href === "/ProjectPage" && (currentPath === "/ProjectPage" || currentPath.startsWith("/OnGoingPage"));
        const isDiscoverUs = href === "/discoverUs" && (currentPath === "/discoverUs" ||  currentPath.startsWith("/discoverUs/blog"));
        if (isHome || isProjects || isDiscoverUs) {
            tab.classList.add("active");
        }
    });

    menuBar.forEach(tab => {
        tab.classList.remove("activePageMobile");
        const href = tab.getAttribute("href");
        const isHome = (href === "/home" || href === "/") && (currentPath === "/" || currentPath === "/home");
        const isProjects = href === "/ProjectPage" && (currentPath === "/ProjectPage" || currentPath.startsWith("/OnGoingPage"));
        const isDiscoverUs = href === "/discoverUs" && (currentPath === "/discoverUs" || currentPath.startsWith("/blog") || currentPath.startsWith("/discoverUs/blog"));
        if (isHome || isProjects || isDiscoverUs) {
            tab.classList.add("activePageMobile");
        }
    });
}

updateActiveLinks();

menuBtn.forEach((item) => {
    item.addEventListener("click", (e) => {
        menuBtn.forEach(tab => tab.classList.remove("active"));
        item.classList.add("active");
    });
});

menuBar.forEach((item) => {
    item.addEventListener("click", (e) => {
        menuBar.forEach(tab => tab.classList.remove("activePageMobile"));
        item.classList.add("activePageMobile");
    });
});