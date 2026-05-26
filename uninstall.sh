#!/bin/sh

set -e

if ! command -v spicetify >/dev/null 2>&1; then
    echo "Spicetify not found. Install Spicetify first, then run this script again." >&2
    exit 1
fi

config_dir="$(dirname "$(spicetify -c)")"
config_file="${config_dir}/config-xpui.ini"
theme_dir="${config_dir}/Themes/DefaultDynamic"
ext_dir="${config_dir}/Extensions"

echo "Unpatching (1/3)"
perl -0pi -e 's/^\s*xpui\.js_find_8008\s*=.*\R?//mg; s/^\s*xpui\.js_repl_8008\s*=.*\R?//mg;' "${config_file}"

echo "Uninstalling (2/3)"
spicetify config current_theme SpicetifyDefault color_scheme green-dark extensions default-dynamic.js- extensions Vibrant.min.js-

echo "Deleting files (3/3)"
rm -rf "${theme_dir}"
rm -f "${ext_dir}/default-dynamic.js"
rm -f "${ext_dir}/Vibrant.min.js"

spicetify apply
