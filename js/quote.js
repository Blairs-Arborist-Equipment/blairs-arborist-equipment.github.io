---
---

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Popovers
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
  [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));

  quoteBadge();
});

//------------------------------------------------------------------------------
// add new item to the quote
function saveItem(category, product) {
  const selectEl = document.getElementById("sku-" + product);
  if (!selectEl) return;
  const sku = selectEl.options[selectEl.selectedIndex].text;
  const nameEl = document.getElementById("name-" + product);
  const name = nameEl ? nameEl.textContent.trim() : "";
  const key = sku + "|!|" + product + "|!|" + name + "|!|" + category;
  const val = 1;
  localStorage.setItem("bae_" + btoa(key), val);

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
  let val = parseInt(localStorage.getItem("bae_" + key)) || 1;
  val += 1;
  localStorage.setItem("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//------------------------------------------------------------------------------
// decrease item quantity
function decreaseItem(key) {
  let val = parseInt(localStorage.getItem("bae_" + key)) || 1;
  if (val === 1) {
    return;
  }
  val -= 1;
  localStorage.setItem("bae_" + key, val);
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// empty quote
function emptyQuote() {
  localStorage.clear();
  quoteShowAll();
  quoteBadge();
}

//-------------------------------------------------------------------------------------
// return total quote item quantity
function totalQuantity() {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key.startsWith('bae_')) {
      continue;
    }
    const qty = parseInt(localStorage.getItem(key)) || 0;
    count += qty;
  }
  return count;
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

    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey.startsWith('bae_')) {
        continue;
      }
      const rawKey = storageKey.replace('bae_', '');
      const decodedKey = atob(rawKey);
      const parts = decodedKey.split('|!|');
      sku = parts[0];
      const slug = parts[1];
      name = parts[2];
      const category = parts[3];
      qty = parseInt(localStorage.getItem(storageKey)) || 1;
      const item = qty + '|!|' + decodedKey;

      let decreaseButtonDisabled = "";
      if (qty === 1) {
        decreaseButtonDisabled = ' disabled aria-disabled="true"';
      }

      list += '<tr>'
        + '<th scope="row">'
        + '<div class="mb-4">'
        + '<input type="hidden" name="item-' + slug + '" value="' + btoa(item) + '" />'
        + '<a href="/products/' + category + '.html#' + slug + '" class="text-wrap">' + name + '</a>'
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
        + '<td class="text-center">' + sku + '</td>'
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
        const contactFormDiv = document.getElementById('contact-form-div');
        if (contactFormDiv) contactFormDiv.style.display = 'none';

        if (response.ok) {
          const successDiv = document.getElementById('contact-form-success');
          if (successDiv) {
            successDiv.classList.remove('d-none');
          }
        } else {
          const errorDiv = document.getElementById('contact-form-error');
          if (errorDiv) {
            errorDiv.classList.remove('d-none');
          }
        }
      })
      .catch(() => {
        const contactFormDiv = document.getElementById('contact-form-div');
        if (contactFormDiv) contactFormDiv.style.display = 'none';
        const errorDiv = document.getElementById('contact-form-error');
        if (errorDiv) {
          errorDiv.classList.remove('d-none');
        }
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
        const quoteFormClient = document.getElementById('quote-form-client');
        if (quoteFormClient) quoteFormClient.style.display = 'none';

        if (response.ok) {
          emptyQuote();
          const successDiv = document.getElementById('quote-form-success');
          if (successDiv) {
            successDiv.classList.remove('d-none');
          }
        } else {
          const errorDiv = document.getElementById('quote-form-error');
          if (errorDiv) {
            errorDiv.classList.remove('d-none');
          }
        }
      })
      .catch(() => {
        const quoteFormClient = document.getElementById('quote-form-client');
        if (quoteFormClient) quoteFormClient.style.display = 'none';
        const errorDiv = document.getElementById('quote-form-error');
        if (errorDiv) {
          errorDiv.classList.remove('d-none');
        }
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
