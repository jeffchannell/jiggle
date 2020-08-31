.PHONY: all build dockertest local test

JIGGLE_VERSION ?= latest
JIGGLE_DEV_DIR := "${HOME}/.local/share/gnome-shell/extensions/jiggle-dev@jeffchannell.com"

build: compile
	@rm jiggle_${JIGGLE_VERSION}.zip 2> /dev/null || true
	@zip -r jiggle_${JIGGLE_VERSION}.zip \
		icons/ \
		schemas/ \
		cursor.js \
		extension.js \
		history.js \
		kill.js \
		LICENSE.txt \
		math.js \
		metadata.json \
		overlay.js \
		prefs.js \
		settings.js \
		stylesheet.css \
		widget.js

test: compile
	@LD_LIBRARY_PATH=/usr/lib/gnome-shell gjs --include-path=. test.js

docker: compile
	@./dockertest.sh

local: compile
	@echo "installing locally to ${JIGGLE_DEV_DIR}"
	@rm -rvf "${JIGGLE_DEV_DIR}" || true
	@mkdir -p "${JIGGLE_DEV_DIR}" || true
	@cp -rv \
		icons/ \
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
		widget.js \
		"${JIGGLE_DEV_DIR}"
	@echo "Overwriting metadata"
	@sed -e :a \
		-e 's/jiggle@/jiggle-dev@/' \
		-e 's/"name": ".*"/"name": "Jiggle (Development Version)"/' \
		-e 's/"version": ".*"/"version": "jiggle-dev"/' \
		metadata.json > "${JIGGLE_DEV_DIR}/metadata.json"

compile:
	@echo "compiling schemas"
	@glib-compile-schemas schemas/

all: test build
