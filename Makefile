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

local: compile
	@echo "installing locally to ${JIGGLE_DEV_DIR}"
	@mkdir -p "${JIGGLE_DEV_DIR}" || true
	@cp -rv ./* "${JIGGLE_DEV_DIR}"
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
