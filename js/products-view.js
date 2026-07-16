---
---

document.addEventListener('DOMContentLoaded', () => {
  // Wrap embedded description tables in responsive div
  wrapDescriptionTables();

  // Initialize grid/list toggle
  initProductsViewToggle();
});

// Wrap any <table> found inside .description-content in a real .table-responsive div
function wrapDescriptionTables() {
  const descriptions = document.querySelectorAll('.description-content');
  descriptions.forEach(desc => {
    const tables = desc.querySelectorAll('table');
    tables.forEach(table => {
      // Check if already wrapped
      if (table.parentElement.classList.contains('table-responsive')) {
        return;
      }

      // Create wrapper div
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';

      // Add Bootstrap table classes to the table itself
      table.classList.add('table', 'table-sm', 'table-striped');

      // Insert wrapper before table, move table inside it
      table.parentElement.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  });
}

// Grid/list toggle for products container
function initProductsViewToggle() {
  const container = document.getElementById('products-container');
  if (!container) return;

  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');

  if (!gridBtn || !listBtn) return;

  // Load saved preference
  const savedView = localStorage.getItem('productViewPref') || 'list';
  applyViewPreference(savedView);

  // Grid button click
  gridBtn.addEventListener('click', () => {
    applyViewPreference('grid');
    localStorage.setItem('productViewPref', 'grid');
  });

  // List button click
  listBtn.addEventListener('click', () => {
    applyViewPreference('list');
    localStorage.setItem('productViewPref', 'list');
  });
}

function applyViewPreference(view) {
  const container = document.getElementById('products-container');
  const gridBtn = document.getElementById('view-grid-btn');
  const listBtn = document.getElementById('view-list-btn');

  if (view === 'grid') {
    container.classList.add('view-grid');
    if (gridBtn) gridBtn.setAttribute('aria-pressed', 'true');
    if (listBtn) listBtn.setAttribute('aria-pressed', 'false');
  } else {
    container.classList.remove('view-grid');
    if (gridBtn) gridBtn.setAttribute('aria-pressed', 'false');
    if (listBtn) listBtn.setAttribute('aria-pressed', 'true');
  }
}
