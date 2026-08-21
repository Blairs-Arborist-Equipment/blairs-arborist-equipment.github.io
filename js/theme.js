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

  // Read the stored preference, tolerating blocked storage.
  function storedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null;
    }
  }

  // Get current theme
  function getCurrentTheme() {
    return storedTheme() || getSystemTheme();
  }

  // Apply a theme without recording a preference. Used on load and when the
  // system preference changes, so that a visitor who never touched the toggle
  // keeps following their OS setting.
  function applyTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    html.setAttribute('data-bs-theme', theme);
    updateThemeButton(theme);
  }

  // Apply a theme AND remember it. Only an explicit toggle should do this.
  function setTheme(theme) {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* storage unavailable; the theme still applies for this page view */
    }
  }

  // Update button appearance
  function updateThemeButton(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;

    const icon = btn.querySelector('i');
    const isDark = theme === 'dark';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
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
      if (!storedTheme()) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Re-run once the nav exists so the toggle button reflects the theme.
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getCurrentTheme());
  });

  // Also set immediately for flash prevention
  applyTheme(getCurrentTheme());
})();
