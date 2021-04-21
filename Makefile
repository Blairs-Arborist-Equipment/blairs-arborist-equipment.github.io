prereqs:
	sudo yum install -y wget curl zip python-pip gcc zlib-devel libxml2 libxslt rpm-build gcc-c++ libffi-devel redhat-rpm-config

rvm:
	echo "Installing rvm..."
	gpg2 --keyserver hkp://pool.sks-keyservers.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
	\curl -sSL https://get.rvm.io | bash -s stable

ruby:
	echo "Installing ruby..."
	rvm install 2.7.2
	# NOTE: rvm use not working
	rvm alias create default 2.7.2
	$(rvm 2.7.2 do rvm env --path)
	ruby --version

gem: ruby
	echo "Installing bundler..."
	gem install bundle bundler

bundle: gem
	echo "Installing bundle..."
	bundle install --full-index --path vendor/bundle

pipenv:
	echo "Create pipenv environment"
	pipenv install -d

init: rvm ruby gem bundle pipenv
	echo "Initializing..."

lint:
	echo "Linting..."
	pipenv run yamllint _data/

clean:
	echo "Cleaning..."
	rm -rf build/ _site/

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

build:
	echo "Building..."
	mkdir -p build/
	bundle exec jekyll build

serve:
	echo "Starting server..."
	bundle exec jekyll serve --host 0.0.0.0 --port 8080
