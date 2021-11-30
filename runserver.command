#!/bin/bash
cd "$(dirname "$0")" || exit

VERSION="0.88.1"
function download_binary() {
    [ -f "hugo" ] && rm hugo
    if [ "$(uname)" == "Darwin" ]; then
        curl -L https://github.com/gohugoio/hugo/releases/download/v${VERSION}/hugo_extended_${VERSION}_macOS-64bit.tar.gz | tar -xz -C . hugo
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        curl -L https://github.com/gohugoio/hugo/releases/download/v${VERSION}/hugo_extended_${VERSION}_Linux-64bit.tar.gz | tar -xz -C . hugo
    fi
    echo "./hugo"
}

HUGO=$(which hugo)
if [ -z "$HUGO" ]; then
    HUGO="./hugo"
fi

if [ -f "$HUGO" ]; then
    if [ -z "$($HUGO version | grep "$VERSION")" ]; then
        HUGO="$(download_binary)"
    fi
else
    HUGO="$(download_binary)"
fi

$HUGO server --watch --verbose --buildDrafts --cleanDestinationDir --disableFastRender