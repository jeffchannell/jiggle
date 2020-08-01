#!/usr/bin/env bash

cd "$(dirname "${BASH_SOURCE[0]}")"

echo "Updating Jiggle..."
echo ""
echo ""

git pull

echo "Press enter to close this window."
read x
