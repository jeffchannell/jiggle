#!/usr/bin/env bash

set +x

# init
GNOME_EXTENSION_DIR=~/.local/share/gnome-shell/extensions
GNOME_EXTENSION_NAME='jiggle@jeffchannell.com'

# display header
echo "Uninstalling Jiggle"
echo ""

# check for dependencies
if [ ! -f "$(command -v gnome-extensions)" ]
then
    >&2 echo "Could not find command 'gnome-extensions'. Please install: sudo apt install gnome-extensions"
    exit 1
fi

if [ "" == "$(gnome-extensions list | grep "${GNOME_EXTENSION_NAME}")" ]
then
    >&2 echo "Jiggle is not installed!"
    exit 1
else
    if [ "${GNOME_EXTENSION_NAME}" == "$(gnome-extensions list --enabled | grep "${GNOME_EXTENSION_NAME}")" ]
    then
        gnome-extensions disable "${GNOME_EXTENSION_NAME}"
    fi
    gnome-extensions uninstall "${GNOME_EXTENSION_NAME}"
    busctl --user call org.gnome.Shell /org/gnome/Shell org.gnome.Shell Eval s 'Meta.restart("Restarting…")' > /dev/null
fi

echo "Uninstallation complete"
