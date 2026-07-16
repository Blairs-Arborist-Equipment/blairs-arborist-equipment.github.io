---
---

document.addEventListener('DOMContentLoaded', () => {
  initSearchHandlers();
  // Initial render to show all products and count
  renderResults();
});

function initSearchHandlers() {
  const searchInput = document.getElementById('product-search-input');
  const categorySelect = document.getElementById('product-search-category');

  let searchTimeout;

  // Debounced search input
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(renderResults, 200);
    });
  }

  // Category filter
  if (categorySelect) {
    categorySelect.addEventListener('change', renderResults);
  }
}

function renderResults() {
  const searchInput = document.getElementById('product-search-input');
  const categorySelect = document.getElementById('product-search-category');
  const container = document.getElementById('products-container');
  const noResults = document.getElementById('search-no-results');
  const resultCount = document.getElementById('search-result-count');

  if (!container) return;

  const query = (searchInput?.value || '').toLowerCase();
  const selectedCategory = categorySelect?.value || '';

  // Get all product cards
  const cards = container.querySelectorAll('.card[role="listitem"]');
  let visibleCount = 0;

  cards.forEach(card => {
    const name = card.getAttribute('data-name') || '';
    const description = card.getAttribute('data-description') || '';
    const category = card.getAttribute('data-category') || '';
    const skus = card.getAttribute('data-skus') || '';

    // Category filter
    let matchesCategory = true;
    if (selectedCategory) {
      const categoryTags = category.split('|');
      matchesCategory = categoryTags.includes(selectedCategory);
    }

    // Search filter (case-insensitive substring match)
    let matchesQuery = true;
    if (query) {
      const searchFields = [name, description, category, skus].join(' ').toLowerCase();
      matchesQuery = searchFields.includes(query);
    }

    const shouldShow = matchesCategory && matchesQuery;
    if (shouldShow) {
      card.classList.remove('d-none');
      visibleCount++;
    } else {
      card.classList.add('d-none');
    }
  });

  // Update result count and no-results message
  if (visibleCount === 0) {
    noResults.classList.remove('d-none');
    resultCount.textContent = '';
  } else {
    noResults.classList.add('d-none');
    resultCount.textContent = `${visibleCount} product${visibleCount === 1 ? '' : 's'} found`;
  }
}
