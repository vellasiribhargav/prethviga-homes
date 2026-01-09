// Sidebar interactions and smooth animations
document.addEventListener('DOMContentLoaded', function() {
  // Dropdown functionality for all dropdowns
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = this.parentElement;
      dropdown.classList.toggle('open');
      
      // Close other dropdowns
      dropdownToggles.forEach(otherToggle => {
        if (otherToggle !== this) {
          otherToggle.parentElement.classList.remove('open');
        }
      });
    });
  });

  // Mobile menu functionality
  const menuBtn = document.querySelector('.menu-btn');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const navToggle = document.querySelector('.nav-toggle');

  function openDrawer() {
    navDrawer.classList.add('open');
    drawerOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    navDrawer.classList.remove('open');
    drawerOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', openDrawer);
  }

  if (navToggle) {
    navToggle.addEventListener('click', closeDrawer);
  }
  
  // Close drawer on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Smooth transitions for sidebar links
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
      this.style.transform = 'translateX(4px)';
    });
    
    link.addEventListener('mouseleave', function() {
      this.style.transform = 'translateX(0)';
    });
  });
});