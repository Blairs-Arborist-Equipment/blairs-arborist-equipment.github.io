/*!
 * Start Bootstrap - Creative v6.0.4 (https://startbootstrap.com/theme/creative)
 * Copyright 2013-2020 Start Bootstrap
 * Ported to Vanilla JS for Bootstrap 5 by Antigravity (2026)
 */

document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  // Smooth scroll for scroll-trigger links
  document.querySelectorAll('a.js-scroll-trigger[href*="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.hash;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 72;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Closes responsive menu when a scroll trigger link is clicked
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarCollapse = document.getElementById('navbarResponsive');
  if (navbarCollapse && navbarToggler) {
    const links = navbarCollapse.querySelectorAll('.js-scroll-trigger');
    links.forEach(link => {
      link.addEventListener('click', () => {
        // Only trigger collapse close if the toggler is visible (i.e. mobile view)
        if (window.getComputedStyle(navbarToggler).display !== 'none') {
          // toggle:false — the constructor would otherwise show the menu
          // before hide() runs, causing a flash.
          const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse)
            || new bootstrap.Collapse(navbarCollapse, { toggle: false });
          bsCollapse.hide();
        }
      });
    });
  }

  // Collapse Navbar handler
  const navbarShrink = () => {
    const mainNav = document.body.querySelector('#mainNav');
    if (!mainNav) return;
    if (window.scrollY > 100) {
      mainNav.classList.add('navbar-scrolled');
    } else {
      mainNav.classList.remove('navbar-scrolled');
    }
  };

  // Shrink now if page is not at top
  navbarShrink();

  // Shrink the navbar when page is scrolled
  document.addEventListener('scroll', navbarShrink, { passive: true });

  // Initialize Bootstrap ScrollSpy
  const mainNav = document.body.querySelector('#mainNav');
  if (mainNav) {
    new bootstrap.ScrollSpy(document.body, {
      target: '#mainNav',
      rootMargin: '0px 0px -40%'
    });
  }
});
