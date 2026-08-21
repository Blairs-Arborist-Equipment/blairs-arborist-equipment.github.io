---
---

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

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
  const existing = parseInt(localStorage.getItem(storageKey), 10);
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
  let val = parseInt(localStorage.getItem("bae_" + key), 10) || 1;
  val += 1;
  storageSet("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// decrease item quantity
function decreaseItem(key) {
  let val = parseInt(localStorage.getItem("bae_" + key), 10) || 1;
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
    return count + (parseInt(localStorage.getItem(key), 10) || 0);
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
// dynamically populate the table with shopping list items
function quoteShowAll() {
  if (CheckBrowser()) {
    let name = "";
    let sku = "";
    let qty = 0;
    let list = "";
    const quoteFormClient = document.getElementById("quote-form-client");

    for (const storageKey of quoteKeys()) {
      const rawKey = storageKey.replace('bae_', '');
      let decodedKey;
      try {
        decodedKey = b64decode(rawKey);
      } catch (err) {
        // A single malformed key must not blank the whole table. Drop it.
        localStorage.removeItem(storageKey);
        continue;
      }
      const parts = decodedKey.split('|!|');
      sku = parts[0];
      const slug = parts[1];
      name = parts[2];
      const category = parts[3];
      qty = parseInt(localStorage.getItem(storageKey), 10) || 1;
      const item = qty + '|!|' + decodedKey;
      // Items added from the search-all page carry no category; link to the
      // search page rather than building a dead /products/.html#slug URL.
      const href = category
        ? '/products/' + encodeURIComponent(category) + '.html#' + slug
        : '/products/#' + slug;

      let decreaseButtonDisabled = "";
      if (qty === 1) {
        decreaseButtonDisabled = ' disabled aria-disabled="true"';
      }

      list += '<tr>'
        + '<th scope="row">'
        + '<div class="mb-4">'
        + '<input type="hidden" name="item-' + escapeHtml(slug) + '" value="' + b64encode(item) + '" />'
        + '<a href="' + escapeHtml(href) + '" class="text-wrap">' + escapeHtml(name) + '</a>'
        + '</div>'
        + '<div class="btn-group me-2" role="group">'
        + '<button type="button" class="btn btn-sm btn-secondary"' + decreaseButtonDisabled + ' onclick="decreaseItem(' + "'" + rawKey + "'" + ');"><i class="fas fa-minus"></i></button>'
        + '<input type="text" class="form-control form-control-sm text-center" value="' + qty + '" size="1" style="width: 40px; display: inline-block;" readonly />'
        + '<button type="button" class="btn btn-sm btn-secondary" onclick="increaseItem(' + "'" + rawKey + "'" + ');"><i class="fas fa-plus"></i></button>'
        + '</div>'
        + '<div class="btn-group me-2" role="group">'
        + '<button type="button" class="btn btn-sm btn-secondary" onclick="removeItem(' + "'" + rawKey + "'" + ');"><i class="far fa-trash-alt"></i></button>'
        + '</div>'
        + '</th>'
        + '<td class="text-center">' + escapeHtml(sku) + '</td>'
        + '</tr>\n';
    }

    const tbody = document.querySelector("#quote-table tbody");
    if (tbody) {
      if (list === "") {
        tbody.innerHTML = '<tr><th scope="row" class="text-center" colspan="2"><i>No Items in Quote</i></th></tr>\n';
        if (quoteFormClient) {
          quoteFormClient.classList.add('d-none');
        }
      } else {
        tbody.innerHTML = list;
        if (quoteFormClient) {
          quoteFormClient.classList.remove('d-none');
        }
      }
    }
  } else {
    const tbody = document.querySelector("#quote-table tbody");
    if (tbody) {
      tbody.innerHTML = '<tr><th scope="row" colspan="2">Cannot save shopping list. Your browser does not support HTML 5</th></tr>';
    }
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

      fetch("{{ site.mailer.url }}", {
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

      fetch("{{ site.mailer.url }}", {
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
