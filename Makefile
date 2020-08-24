.PHONY: all build dockertest test

JIGGLE_VERSION ?= latest

build: compile
	@rm jiggle_${JIGGLE_VERSION}.zip 2> /dev/null || true
	@zip -r jiggle_${JIGGLE_VERSION}.zip \
		schemas/ \
		cursor.png \
		cursor.js \
		extension.js \
		history.js \
		LICENSE.txt \
		math.js \
		metadata.json \
		prefs.js \
		settings.js \
		stylesheet.css \
		widget.js \
		window.js

test: compile
	@./test.js

docker: compile
	@./dockertest.sh

compile:
	@echo "compiling schemas"
	@glib-compile-schemas schemas/

all: test build
