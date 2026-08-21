// Mailer endpoint is injected by _includes/scripts.html so this file can
// stay plain JavaScript rather than a Liquid-templated asset.
const MAILER_URL = (window.BAE_CONFIG && window.BAE_CONFIG.mailerUrl) || '';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  popoverTriggerList.forEach(el => new bootstrap.Popover(el));

  quoteBadge();
});

//------------------------------------------------------------------------------
// Unicode-safe base64. btoa/atob only handle code points <= U+00FF, but product
// names contain characters like U+2033 (") and U+2013 (-), which made btoa throw
// and silently killed "Add to Quote". Pure-ASCII input encodes identically to
// plain btoa, so keys stored by earlier versions still decode.
function b64encode(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function b64decode(str) {
  return new TextDecoder().decode(Uint8Array.from(atob(str), c => c.charCodeAt(0)));
}

// Escape text before it is interpolated into a table row. Values come from
// localStorage, which the user can edit, and product names legitimately
// contain & and ".
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

// Write to localStorage, reporting quota/permission failures instead of
// aborting mid-flow (Safari private mode throws on setItem).
function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    alert("Unable to save your quote. Your browser's storage may be full or unavailable.");
    return false;
  }
}

//------------------------------------------------------------------------------
// add new item to the quote
function saveItem(category, product) {
  const selectEl = document.getElementById("sku-" + product);
  if (!selectEl || selectEl.selectedIndex < 0) return;
  const sku = selectEl.options[selectEl.selectedIndex].text;
  const nameEl = document.getElementById("name-" + product);
  const name = nameEl ? nameEl.textContent.trim() : "";
  const key = sku + "|!|" + product + "|!|" + name + "|!|" + category;
  const storageKey = "bae_" + b64encode(key);
  // Keep any quantity the user already set rather than resetting it to 1.
  const existing = Number.parseInt(localStorage.getItem(storageKey), 10);
  const val = existing > 0 ? existing : 1;
  if (!storageSet(storageKey, val)) return;

  // Show popover notification
  const buttonEl = document.getElementById("btn-" + product);
  if (buttonEl) {
    const popover = bootstrap.Popover.getInstance(buttonEl) || new bootstrap.Popover(buttonEl);
    popover.show();
    setTimeout(() => {
      popover.hide();
    }, 1500);
  }
  quoteBadge();
}

//-------------------------------------------------------------------------
// delete an item from the quote
function removeItem(key) {
  localStorage.removeItem("bae_" + key);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// increase item quantity
function increaseItem(key) {
  let val = Number.parseInt(localStorage.getItem("bae_" + key), 10) || 1;
  val += 1;
  storageSet("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// decrease item quantity
function decreaseItem(key) {
  let val = Number.parseInt(localStorage.getItem("bae_" + key), 10) || 1;
  if (val === 1) {
    return;
  }
  val -= 1;
  storageSet("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// return the storage keys belonging to the quote
function quoteKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bae_')) {
      keys.push(key);
    }
  }
  return keys;
}

//-------------------------------------------------------------------------------------
// empty quote
function emptyQuote() {
  // Only remove quote items. localStorage.clear() also wiped unrelated keys
  // such as the site-theme preference written by theme.js.
  quoteKeys().forEach(key => localStorage.removeItem(key));
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// return total quote item quantity
function totalQuantity() {
  return quoteKeys().reduce((count, key) => {
    return count + (Number.parseInt(localStorage.getItem(key), 10) || 0);
  }, 0);
}

//-------------------------------------------------------------------------------------
// display quote item count badge
function quoteBadge() {
  const count = totalQuantity();
  const navQuote = document.getElementById('nav-quote');
  if (navQuote) {
    if (count > 0) {
      navQuote.innerHTML = 'Quote<span class="mx-1"></span><span class="badge rounded-pill bg-warning text-dark">' + count + '</span>';
    } else {
      navQuote.innerHTML = 'Quote';
    }
  }
}

//--------------------------------------------------------------------------------------
// Decode one stored item. Returns null (and drops the key) if it is unreadable,
// so a single malformed entry cannot blank the whole table.
function readQuoteItem(storageKey) {
  const rawKey = storageKey.replace('bae_', '');
  let decodedKey;
  try {
    decodedKey = b64decode(rawKey);
  } catch (err) {
    localStorage.removeItem(storageKey);
    return null;
  }
  const [sku, slug, name, category] = decodedKey.split('|!|');
  const qty = Number.parseInt(localStorage.getItem(storageKey), 10) || 1;
  return { rawKey, decodedKey, sku, slug, name, category, qty };
}

// Items added from the search-all page carry no category; link to the search
// page rather than building a dead /products/.html#slug URL.
function quoteItemHref(item) {
  return item.category
    ? '/products/' + encodeURIComponent(item.category) + '.html#' + item.slug
    : '/products/#' + item.slug;
}

function quoteItemRow(item) {
  const { rawKey, decodedKey, sku, slug, name, qty } = item;
  const hidden = b64encode(qty + '|!|' + decodedKey);
  const decreaseDisabled = qty === 1 ? ' disabled aria-disabled="true"' : '';
  const btn = (action, icon, extra) =>
    '<button type="button" class="btn btn-sm btn-secondary"' + (extra || '')
    + ' onclick="' + action + "('" + rawKey + "');\">"
    + '<i class="' + icon + '"></i></button>';

  return '<tr>'
    + '<th scope="row">'
    + '<div class="mb-4">'
    + '<input type="hidden" name="item-' + escapeHtml(slug) + '" value="' + hidden + '" />'
    + '<a href="' + escapeHtml(quoteItemHref(item)) + '" class="text-wrap">' + escapeHtml(name) + '</a>'
    + '</div>'
    + '<div class="btn-group me-2" role="group">'
    + btn('decreaseItem', 'fas fa-minus', decreaseDisabled)
    + '<input type="text" class="form-control form-control-sm text-center" value="' + qty + '" size="1" style="width: 40px; display: inline-block;" readonly />'
    + btn('increaseItem', 'fas fa-plus')
    + '</div>'
    + '<div class="btn-group me-2" role="group">'
    + btn('removeItem', 'far fa-trash-alt')
    + '</div>'
    + '</th>'
    + '<td class="text-center">' + escapeHtml(sku) + '</td>'
    + '</tr>\n';
}

//--------------------------------------------------------------------------------------
// dynamically populate the table with shopping list items
function quoteShowAll() {
  const tbody = document.querySelector("#quote-table tbody");
  if (!tbody) return;

  if (!CheckBrowser()) {
    tbody.innerHTML = '<tr><th scope="row" colspan="2">Cannot save shopping list. Your browser does not support HTML 5</th></tr>';
    return;
  }

  const list = quoteKeys()
    .map(readQuoteItem)
    .filter(Boolean)
    .map(quoteItemRow)
    .join('');

  const isEmpty = list === "";
  tbody.innerHTML = isEmpty
    ? '<tr><th scope="row" class="text-center" colspan="2"><i>No Items in Quote</i></th></tr>\n'
    : list;

  const quoteFormClient = document.getElementById("quote-form-client");
  if (quoteFormClient) {
    quoteFormClient.classList.toggle('d-none', isEmpty);
  }
}

//--------------------------------------------------------------------------------------
// Checking browser support
function CheckBrowser() {
  return ('localStorage' in window && window['localStorage'] !== null);
}

//--------------------------------------------------------------------------------------
// Show the contact error and leave the form usable so the send can be retried.
function contactFailed() {
  const errorDiv = document.getElementById('contact-form-error');
  if (errorDiv) {
    errorDiv.classList.remove('d-none');
  }
  const btn = document.getElementById('submit-contact');
  if (btn) {
    btn.value = "Send";
    btn.disabled = false;
  }
}

//--------------------------------------------------------------------------------------
// Contact form handler
const submitContact = document.getElementById("submit-contact");
if (submitContact) {
  submitContact.addEventListener("click", function(e) {
    const form = this.form;
    const valid = form.checkValidity();
    if (valid) {
      e.preventDefault();
      submitContact.value = "Sending...";
      submitContact.disabled = true;

      // Extract Turnstile Token
      const token = typeof turnstile !== "undefined" ? turnstile.getResponse() : "";
      if (!token) {
        alert("Please complete the security check.");
        submitContact.value = "Send";
        submitContact.disabled = false;
        return;
      }

      const payload = {
        recaptcha: token,
        'cf-turnstile-response': token,
        name: document.getElementById("name").value,
        company: document.getElementById("company").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        message: document.getElementById("message").value,
        type: form.querySelector("#form-type").value
      };

      fetch(MAILER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (response.ok) {
          // Only retire the form once the message actually went through.
          const contactFormDiv = document.getElementById('contact-form-div');
          if (contactFormDiv) contactFormDiv.style.display = 'none';
          const successDiv = document.getElementById('contact-form-success');
          if (successDiv) {
            successDiv.classList.remove('d-none');
          }
        } else {
          contactFailed();
        }
      })
      .catch(() => {
        contactFailed();
      })
      .finally(() => {
        if (typeof turnstile !== "undefined") {
          turnstile.reset();
        }
      });
    } else {
      form.reportValidity();
    }
  });
}

//--------------------------------------------------------------------------------------
// Show the quote error and leave the form usable so the request can be retried.
function quoteFailed() {
  const errorDiv = document.getElementById('quote-form-error');
  if (errorDiv) {
    errorDiv.classList.remove('d-none');
  }
  const btn = document.getElementById('submit-quote');
  if (btn) {
    btn.value = "Request a Quote";
    btn.disabled = false;
  }
}

//--------------------------------------------------------------------------------------
// Quote form handler
const submitQuote = document.getElementById("submit-quote");
if (submitQuote) {
  submitQuote.addEventListener("click", function(e) {
    const form = this.form;
    const valid = form.checkValidity();
    if (valid) {
      e.preventDefault();
      submitQuote.value = "Requesting...";
      submitQuote.disabled = true;

      // Extract Turnstile Token
      const token = typeof turnstile !== "undefined" ? turnstile.getResponse() : "";
      if (!token) {
        alert("Please complete the security check.");
        submitQuote.value = "Request a Quote";
        submitQuote.disabled = false;
        return;
      }

      // Gather quote items
      const items = [];
      form.querySelectorAll('input[name^="item-"]').forEach(elem => {
        items.push(elem.value);
      });

      const payload = {
        recaptcha: token,
        'cf-turnstile-response': token,
        name: document.getElementById("name").value,
        company: document.getElementById("company").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        address2: document.getElementById("address2").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        items: items,
        type: form.querySelector("#form-type").value
      };

      fetch(MAILER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (response.ok) {
          // Hide via d-none, the same mechanism quoteShowAll() toggles. An
          // inline display:none could not be undone by that function.
          const quoteFormClient = document.getElementById('quote-form-client');
          if (quoteFormClient) quoteFormClient.classList.add('d-none');
          emptyQuote();
          const successDiv = document.getElementById('quote-form-success');
          if (successDiv) {
            successDiv.classList.remove('d-none');
          }
        } else {
          quoteFailed();
        }
      })
      .catch(() => {
        quoteFailed();
      })
      .finally(() => {
        if (typeof turnstile !== "undefined") {
          turnstile.reset();
        }
      });
    } else {
      form.reportValidity();
    }
  });
}
