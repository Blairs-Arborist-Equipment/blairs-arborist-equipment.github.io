# Blair's Arborist Equipment

[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io&metric=alert_status)](https://sonarcloud.io/summary/overall?id=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io)
[![CodeQL](https://github.com/Blairs-Arborist-Equipment/blairs-arborist-equipment.github.io/actions/workflows/dynamic/github-code-scanning/codeql/badge.svg)](https://github.com/Blairs-Arborist-Equipment/blairs-arborist-equipment.github.io/actions/workflows/dynamic/github-code-scanning/codeql)
[![Pages](https://github.com/Blairs-Arborist-Equipment/blairs-arborist-equipment.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://blairsae.com/)

[![Security](https://sonarcloud.io/api/project_badges/measure?project=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io&metric=security_rating)](https://sonarcloud.io/summary/overall?id=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io)
[![Reliability](https://sonarcloud.io/api/project_badges/measure?project=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io&metric=reliability_rating)](https://sonarcloud.io/summary/overall?id=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io)
[![Maintainability](https://sonarcloud.io/api/project_badges/measure?project=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io&metric=sqale_rating)](https://sonarcloud.io/summary/overall?id=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io&metric=vulnerabilities)](https://sonarcloud.io/summary/overall?id=Blairs-Arborist-Equipment_blairs-arborist-equipment.github.io)

This is the repository for the Blair's Arborist Equipment static website (hosted on GitHub Pages, proxied through Cloudflare).

## Technology Stack

- **Jekyll** 3.10.0 (Liquid templating and static site generation)
- **Bootstrap** 5.3.8 (responsive UI layout and styles via CDN)
- **Vanilla JavaScript (ES6)** (shopping/quote cart, interactive forms, no jQuery dependencies)
- **Cloudflare Turnstile** (invisible spam prevention widget)
- **Font Awesome** v6.7.2 (icons via CDN)
- **SASS (SCSS)** (custom theme color overrides and masthead transitions in `_sass/_styles.scss`)

---

## Directory Structure

```
├── _config.yml         # Jekyll settings, Turnstile site key, mailer url
├── .sonarcloud.properties # SonarQube Cloud automatic-analysis scope
├── _data/
│   ├── categories.yml  # Flat list of top-level product categories
│   └── products.csv    # Inventory items (downloaded via make csv)
├── _includes/          # Reusable component HTML fragments
│   ├── contact.html    # Balanced email/facebook footer contact columns
│   ├── footer.html     # Dynamic copyright year & Privacy Policy link
│   ├── head.html       # Cloudflare analytics, SEO/schema, CDN imports
│   └── scripts.html    # Script tags + window.BAE_CONFIG for the JS below
├── _layouts/           # Page structures (home, products, quote, page, article)
├── _sass/              # SASS styling files (custom theme rules only)
├── css/                # Main CSS stylesheet entries
├── email/
│   └── template.html   # Email body template sent by mailer backend
├── js/                 # Plain ES6 — no Liquid, no front matter
│   ├── products-view.js # Wraps description tables for responsiveness
│   ├── quote.js        # Cart localstorage state + vanilla form handlers
│   ├── scripts.js      # Navbar collapse & responsive styling scripts
│   ├── search.js       # Client-side product search/filter
│   └── theme.js        # Light/dark theme toggle
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

The `turnstile.site_key` and the mailer API endpoint live in `_config.yml`. Neither is
a secret — both are public by design and ship in the built HTML. The corresponding
Turnstile **secret** key is held only by the mailer backend and must never appear in
this repository.

> [!NOTE]
> The backend server (which receives quotes and contact requests, validates the Turnstile response token, and sends emails) lives in a separate repository under `api.blairsae.com`.
