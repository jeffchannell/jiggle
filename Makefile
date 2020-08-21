.PHONY: all build dockertest test

JIGGLE_VERSION ?= latest

build:
	@rm jiggle_${JIGGLE_VERSION}.zip 2> /dev/null || true
	@glib-compile-schemas schemas/
	@zip -r jiggle_${JIGGLE_VERSION}.zip \
		schemas/ \
		cursor.js \
		extension.js \
		history.js \
		LICENSE.txt \
		math.js \
		metadata.json \
		prefs.js \
		settings.js \
		stylesheet.css \
		widget.js

test:
	@./test.js

docker:
	@./dockertest.sh

all: test build