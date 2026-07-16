.PHONY: prereqs mise bundle pipenv init lint test build serve clean clean-all csv csv-commit toolbox-setup toolbox-shell

TOOLBOX_CONTAINER ?= blairs-arborist

# One-time setup: create the toolbox container (atomic OS users)
# On traditional RHEL/Fedora, install system libraries directly instead.
toolbox-setup:
	@if command -v toolbox &> /dev/null; then \
		echo "Creating toolbox container '$(TOOLBOX_CONTAINER)'..."; \
		toolbox create --assumeyes -c $(TOOLBOX_CONTAINER) 2>/dev/null || echo "Container already exists."; \
		echo "Installing prerequisites inside toolbox..."; \
		toolbox run -c $(TOOLBOX_CONTAINER) sudo yum install -y wget curl zip dos2unix gcc gcc-c++ make patch \
			openssl-devel readline-devel libyaml-devel zlib-devel \
			libffi-devel gdbm-devel ncurses-devel rpm-build redhat-rpm-config; \
	else \
		echo "toolbox not found. On traditional RHEL/Fedora, run: make prereqs"; \
		exit 1; \
	fi

# Open an interactive shell in the toolbox container
toolbox-shell:
	@if command -v toolbox &> /dev/null; then \
		toolbox run -c $(TOOLBOX_CONTAINER) bash; \
	else \
		echo "toolbox not found. Falling back to host shell."; \
		bash; \
	fi

# One-time OS-level setup for traditional RHEL/Fedora machines (non-atomic).
# ruby-build (mise's ruby backend) needs to compile Ruby from source.
# Requires sudo, so it's intentionally NOT part of `init` — run it once
# per fresh machine before `make init`.
prereqs:
	@echo "Note: On atomic OS, use 'make toolbox-setup' instead."
	sudo yum install -y wget curl zip dos2unix gcc gcc-c++ make patch \
		openssl-devel readline-devel libyaml-devel zlib-devel \
		libffi-devel gdbm-devel ncurses-devel rpm-build redhat-rpm-config

mise:
	echo "Installing pinned Ruby/Python via mise..."
	mise install

bundle: mise
	echo "Installing Ruby gems..."
	bundle config set --local path 'vendor/bundle'
	bundle install

pipenv: mise
	echo "Creating pipenv environment..."
	pipenv install -d

init: mise bundle pipenv
	echo "Environment initialized."

lint:
	echo "Linting..."
	pipenv run yamllint _data/

build:
	echo "Building..."
	bundle exec jekyll build

test: lint build
	echo "Checking for broken internal links/images..."
	bundle exec htmlproofer ./_site --disable-external

serve:
	echo "Starting server..."
	bundle exec jekyll serve --host 0.0.0.0 --port 8080

clean:
	echo "Cleaning..."
	rm -rf _site/ .jekyll-cache/ .jekyll-metadata

clean-all: clean
	echo "Cleaning..."
	rm -rf .bundle/ .venv/ vendor/

DOC_ID="1hn2bz8tPRGwoSZ5PfDPWYf_MhcGC691MwMG7QG2YDLQ"
SHT_ID="78365660"
CSV="_data/products.csv"
csv:
	echo "Downloading CSV..."
	wget -q "https://docs.google.com/spreadsheets/d/$(DOC_ID)/export?format=csv&gid=$(SHT_ID)" -O "$(CSV)"
	dos2unix $(CSV)

csv-commit: csv
	echo "Committing CSV..."
	git add $(CSV)
	git commit -m 'updated inventory'
	git push origin main
