---
---

// Theme toggle with system preference detection
(function() {
  const THEME_KEY = 'site-theme';

  // Detect system preference
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Get current theme
  function getCurrentTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored;
    return getSystemTheme();
  }

  // Set theme
  function setTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeButton(theme);
  }

  // Update button appearance
  function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    if (theme === 'dark') {
      btn.setAttribute('aria-label', 'Switch to light mode');
      if (icon) {
        icon.className = 'fas fa-sun';
      }
    } else {
      btn.setAttribute('aria-label', 'Switch to dark mode');
      if (icon) {
        icon.className = 'fas fa-moon';
      }
    }
  }

  // Toggle theme
  window.toggleTheme = function() {
    const current = getCurrentTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      const stored = localStorage.getItem(THEME_KEY);
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    setTheme(getCurrentTheme());
  });

  // Also set immediately for flash prevention
  setTheme(getCurrentTheme());
})();
