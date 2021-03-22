.PHONY: all build dockertest local test

JIGGLE_DIR=$(shell pwd)
JIGGLE_VERSION ?= latest
JIGGLE_DEV_DIR := "${HOME}/.local/share/gnome-shell/extensions/jiggle-dev@jeffchannell.com"

build: compile
	@rm jiggle_${JIGGLE_VERSION}.zip 2> /dev/null || true
	@zip -r jiggle_${JIGGLE_VERSION}.zip \
		compat/ \
		effects/ \
		icons/ \
		schemas/ \
		ui/ \
		cursor.js \
		extension.js \
		history.js \
		LICENSE.txt \
		math.js \
		metadata.json \
		prefs.js \
		settings.js

test: compile
	@LD_LIBRARY_PATH=/usr/lib/gnome-shell gjs --include-path=. test.js

docker: compile
	@./dockertest.sh

local: compile
	@echo "installing locally to ${JIGGLE_DEV_DIR}"
	@rm -rvf "${JIGGLE_DEV_DIR}" || true
	@mkdir -p "${JIGGLE_DEV_DIR}" || true
	@cp -rv \
		compat/ \
		effects/ \
		icons/ \
		schemas/ \
		ui/ \
		cursor.js \
		extension.js \
		history.js \
		LICENSE.txt \
		math.js \
		metadata.json \
		prefs.js \
		settings.js \
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
	@docker build -t gtk4-builder-tool -f Dockerfile.gtk4 .
	@docker run -v "${JIGGLE_DIR}/ui:/home/gtk4/app" --rm -ti gtk4-builder-tool simplify --3to4 gtk3.ui > ui/gtk4.ui

all: test build
