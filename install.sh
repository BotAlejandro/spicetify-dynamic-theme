#!/bin/sh

set -e

if ! command -v spicetify >/dev/null 2>&1; then
    echo "Spicetify not found. Install Spicetify first, then run this script again." >&2
    exit 1
fi

repo_owner="BotAlejandro"
repo_name="spicetify-dynamic-theme"
ref="${1:-main}"
config_dir="$(dirname "$(spicetify -c)")"
config_file="${config_dir}/config-xpui.ini"
theme_dir="${config_dir}/Themes/DefaultDynamic"
ext_dir="${config_dir}/Extensions"
raw_base_url="https://raw.githubusercontent.com/${repo_owner}/${repo_name}/${ref}"

echo "Patching (1/3)"
if ! grep -q '^\[Patch\]' "${config_file}"; then
    printf '\n[Patch]\n' >>"${config_file}"
fi
perl -0pi -e 's/^\s*xpui\.js_find_8008\s*=.*\R?//mg; s/^\s*xpui\.js_repl_8008\s*=.*\R?//mg;' "${config_file}"
perl -0pi -e 's/\[Patch\]\R/[Patch]\nxpui.js_find_8008 = ,(\\w+=)32,\nxpui.js_repl_8008 = ,\${1}28,\n/' "${config_file}"

echo "Downloading ${ref} (2/3)"
mkdir -p "${theme_dir}" "${ext_dir}"
curl --fail --location --progress-bar --output "${theme_dir}/color.ini" "${raw_base_url}/color.ini"
curl --fail --location --progress-bar --output "${theme_dir}/user.css" "${raw_base_url}/user.css"
curl --fail --location --progress-bar --output "${ext_dir}/default-dynamic.js" "${raw_base_url}/default-dynamic.js"
curl --fail --location --progress-bar --output "${ext_dir}/Vibrant.min.js" "${raw_base_url}/Vibrant.min.js"

echo "Applying theme (3/3)"
spicetify config extensions dribbblish.js- extensions dribbblish-dynamic.js- extensions default-dynamic.js- extensions Vibrant.min.js-
spicetify config extensions default-dynamic.js extensions Vibrant.min.js
spicetify config current_theme DefaultDynamic color_scheme Dark-Base
spicetify config inject_css 1 replace_colors 1
spicetify apply

echo "All done!"
