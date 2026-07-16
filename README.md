# Blair's Arborist Equipment

This is the repository for the Blair's Arborist Equipment static website (hosted on GitHub Pages, proxied through Cloudflare).

## Technology Stack

- **Jekyll** 3.9.0 (Liquid templating and static site generation)
- **Bootstrap** 5.3.8 (responsive UI layout and styles via CDN)
- **Vanilla JavaScript (ES6)** (shopping/quote cart, interactive forms, no jQuery dependencies)
- **Cloudflare Turnstile** (invisible spam prevention widget)
- **Font Awesome** v6.7.2 (icons via CDN)
- **SASS (SCSS)** (custom theme color overrides and masthead transitions in `_sass/_styles.scss`)

---

## Directory Structure

```
├── _config.yml         # Jekyll settings, Turnstile site key, mailer url
├── _data/
│   ├── categories.yml  # Product categories hierarchy
│   └── products.csv    # Inventory items (downloaded via make csv)
├── _includes/          # Reusable component HTML fragments
│   ├── contact.html    # Balanced email/facebook footer contact columns
│   ├── footer.html     # Dynamic copyright year & Privacy Policy link
│   └── head.html       # Google/CF analytics and CSS CDN imports
├── _layouts/           # Page structures (home, products, quote, page, article)
├── _sass/              # SASS styling files (custom theme rules only)
├── css/                # Main CSS stylesheet entries
├── email/
│   └── template.html   # Email body template sent by mailer backend
├── js/
│   ├── quote.js        # Cart localstorage state + vanilla form handlers
│   └── scripts.js      # Navbar collapse & responsive styling scripts
└── privacy-policy.html # Minimal Privacy Policy (required by Turnstile terms)
```

---

## Local Development Setup

### For Atomic OS (Fedora CoreOS, RHEL CoreOS, etc.)

**First time only:**
```bash
make toolbox-setup
```
This creates an isolated Fedora container (`blairs-arborist`) where development happens.

**Then, run make commands inside the container:**
```bash
toolbox run -c blairs-arborist make init
toolbox run -c blairs-arborist make serve
```

Or **enter the container shell** for interactive work:
```bash
make toolbox-shell
# Now you're inside the container; use make normally
make init
make serve
```

### For Traditional RHEL/Fedora (non-atomic)

**First time only:**
```bash
make prereqs
```
This installs the system libraries mise's Ruby build needs. (Requires `sudo`.)

**Then:**
```bash
make init
make serve
```

---

### Common tasks (work the same way inside toolbox or on traditional systems)

**1. Initialize environment**
Installs the pinned Ruby/Python (via [mise](https://mise.jdx.dev)), Ruby gems (via Bundler), and Python tooling (via pipenv):
```bash
make init
```

**2. Download updated inventory**
Downloads the latest products spreadsheet from Google Docs and compiles `_data/products.csv`:
```bash
make csv
```

**3. Run development server**
Spins up a local Jekyll server at `http://localhost:8080`:
```bash
make serve
```

**4. Testing**
Lints YAML data files, does a full Jekyll build, and checks the built site for broken internal links/images:
```bash
make test
```
Or run the checks individually with `make lint` (YAML only) or `make build` (Jekyll build only).

---

## Secrets & Config

Secrets like the `turnstile.site_key` and backend mailer API endpoints are kept in `_config.yml`.

> [!NOTE]
> The backend server (which receives quotes and contact requests, validates the Turnstile response token, and sends emails) lives in a separate repository under `api.blairsae.com`.
