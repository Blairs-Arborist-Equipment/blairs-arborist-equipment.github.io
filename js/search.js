---
---

document.addEventListener('DOMContentLoaded', () => {
  applyQueryFromUrl();
  initSearchHandlers();
  // Initial render to show all products and count
  renderResults();
});

// Seed the search box from ?q=, which the WebSite SearchAction in
// _includes/schema.html advertises to search engines.
function applyQueryFromUrl() {
  const searchInput = document.getElementById('product-search-input');
  if (!searchInput) return;
  const q = new URLSearchParams(window.location.search).get('q');
  if (q) {
    searchInput.value = q;
  }
}

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

  const query = (searchInput?.value || '').trim().toLowerCase();
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
      const categoryTags = category.split('|').map(tag => tag.trim());
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
  if (noResults) {
    noResults.classList.toggle('d-none', visibleCount !== 0);
  }
  if (resultCount) {
    resultCount.textContent = visibleCount === 0
      ? ''
      : `${visibleCount} product${visibleCount === 1 ? '' : 's'} found`;
  }
}
