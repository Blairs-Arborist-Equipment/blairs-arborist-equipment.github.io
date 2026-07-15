# Agent Instructions: Blair's Arborist Equipment Site

These are codebase rules and stack guidelines for AI agents working on this repository.

## 🛠️ Stack & Library Constraints

1. **Bootstrap 5.3.8:**
   - The site uses Bootstrap 5.3.8 loaded via jsDelivr CDN. Do NOT rollback classes to Bootstrap 4 names.
   - Use Bootstrap 5 attributes (`data-bs-toggle`, `data-bs-target`, etc.) instead of BS4 version (`data-toggle`).
   - Use standard flex utility classes: e.g. `ms-auto` instead of `ml-auto`, `me-auto` instead of `mr-auto`.
   - Use `.row.g-3` instead of `.form-row`.
   - Use `.mb-3` or `.mb-4` instead of `.form-group` (which was deprecated/removed in BS5).
   - Use `.form-select` instead of `.custom-select`.

2. **Vanilla JavaScript (No jQuery):**
   - Keep this codebase dependency-free. Do NOT add jQuery back into script tags.
   - All state management (Quote shopping cart) and DOM manipulation must be written in clean, vanilla ES6 JavaScript.
   - Form submissions use `fetch()` API. Do NOT use `$.ajax`.

3. **No Magnific Popup:**
   - Magnific Popup and jQuery Easing have been completely removed. Do not import them or call their APIs.
   - Carousel, modals, and collapsed states are managed natively by Bootstrap 5 elements or standard vanilla DOM transitions.

## 📁 File Guidelines

1. **Custom SCSS:**
   - The file `_sass/_styles.scss` must ONLY contain custom Creative theme overrides (~200 lines).
   - Do NOT compile or check-in full vendor library styles (like Bootstrap source) into this file. Bootstrap is loaded from CDN in `_includes/head.html`.

2. **Secrets & Keys:**
   - Secrets like site keys or backend URLs belong in `_config.yml`. Do NOT hardcode Turnstile site keys or mailer URLs directly in JS or HTML files.

3. **Inventory Data:**
   - The database file `_data/products.csv` is populated automatically from a Google Sheets doc. Run `make csv` to fetch it. Do NOT edit this CSV manually.

## 🔒 Sensitive Data

- Under no circumstances should the business phone number `(888) 800-3633` be re-added to the site files.
- Placeholders for customer inputs (like tel input placeholder) must use generic indicators such as `(555) 555-5555`, not the business's number.
- Always run `grep` audits after performing changes to guarantee that phone number text, old reCAPTCHA keys, or private details do not exist in the files.
