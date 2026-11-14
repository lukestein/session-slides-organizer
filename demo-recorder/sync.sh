#!/bin/sh
# Rebuild serve/ : the site as committed, plus the sample decks the demo drags in.
#
# The site comes from a git ref (main by default), not the working tree, so a take
# always matches something that actually shipped. demo-assets/ is the only
# addition and nothing in docs/ ever references it.
#
# serve/ is gitignored: it holds copies of real, unpublished decks.
set -eu
here=$(cd "$(dirname "$0")" && pwd)
ref=${REF:-main}
slides=${SLIDES:-"$here/../../sample slides"}

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git -C "$here/.." archive "$ref" docs | tar -x -C "$tmp"
mkdir -p "$here/serve"
rsync -a --delete --exclude demo-assets "$tmp/docs/" "$here/serve/"

mkdir -p "$here/serve/demo-assets"
for f in "barnes-stein.pdf" "rd174_don_2026_lehigh.pdf" \
         "Stein discussion - Hamdi et al.pptx" "Stein perceived skin tone NBER SI.key"; do
  cp "$slides/$f" "$here/serve/demo-assets/"
done
echo "serve/ rebuilt from $ref ($(git -C "$here/.." rev-parse --short "$ref"))"
