---
---

document.addEventListener('DOMContentLoaded', () => {
  // Wrap embedded description tables in responsive div
  wrapDescriptionTables();
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
