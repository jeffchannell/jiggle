#!/usr/bin/env bash

set +x
set -e

# init
GNOME_EXTENSION_DIR=~/.local/share/gnome-shell/extensions
GNOME_EXTENSION_NAME='jiggle@jeffchannell.com'
GNOME_EXTENSION_URL='https://github.com/jeffchannell/jiggle.git'

# display header
echo "Installing Jiggle"
echo ""

# check for dependencies
echo -n "* checking dependencies ... "
if [ "" == "$(command -v git)" ]
then
    echo "failed"
    >&2 echo "Could not find command 'git'. Please install: sudo apt install git"
    exit 1
fi

if [ "" == "$(command -v gnome-extensions)" ]
then
    echo "failed"
    >&2 echo "Could not find command 'gnome-extensions'. Please install: sudo apt install gnome-extensions"
    exit 1
fi
echo "done"

# create extension dir if it hasn't been created yet
echo -n "* checking extensions dir ... "
if [ ! -d "${GNOME_EXTENSION_DIR}" ]
then
    mkdir -p "${GNOME_EXTENSION_DIR}"
fi
echo "done"

# clone repo, if it doesn't exist
echo -n "* checking sources ... "
cd "${GNOME_EXTENSION_DIR}"
if [ ! -d "${GNOME_EXTENSION_NAME}" ]
then
    echo "downloading"
    git clone "${GNOME_EXTENSION_URL}" "${GNOME_EXTENSION_NAME}"
else
    echo "done"
fi

# install
echo -n "* checking extension ... "
if [ "" == "$(gnome-extensions list --enabled | grep "${GNOME_EXTENSION_NAME}")" ]
then
    echo "installing"
    busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting…")' > /dev/null
    gnome-extensions enable "${GNOME_EXTENSION_NAME}"
else
    echo "done"
fi

echo ""
echo "Installation complete"
