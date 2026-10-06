#!/usr/bin/env bash
# Builds a minified copy of vUX into dist/<version>/.
#
# Each file is minified on its own (no bundling): components load each other
# through relative dynamic imports such as import("./vUX-toolTip.js"), so the
# output must keep the same file names and folder layout as the source.
# Export names and free globals ($$, validateElement, ...) are never renamed,
# so the helpers-to-window promotion in the core keeps working.
#
# assets/ is copied alongside because the core resolves CSS through
# data-library-root + "/assets/". Point data-library-root at dist/<version>/.
#
# Usage: ./minify.sh            (needs Node 18+; esbuild is fetched by npx)
set -euo pipefail

ESBUILD_VERSION="0.28.2"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$root"

# The version is baked into the core's filename: src/vUX-core-<version>.js
core=$(ls src/vUX-core-*.js)
version=${core#src/vUX-core-}
version=${version%.js}
out="dist/$version"

rm -rf "$out"
mkdir -p "$out"

npx --yes "esbuild@$ESBUILD_VERSION" vUX-*.js src/*.js \
    --minify --format=esm --target=es2017 \
    --outdir="$out" --outbase=. \
    --legal-comments=none --log-level=warning

cp -r assets "$out/"
cp LICENSE "$out/"

src_size=$(cat vUX-*.js src/*.js | wc -c)
min_size=$(cat "$out"/vUX-*.js "$out"/src/*.js | wc -c)
echo "vUX $version -> $out"
echo "JS: $src_size bytes -> $min_size bytes ($(( 100 - min_size * 100 / src_size ))% smaller)"
