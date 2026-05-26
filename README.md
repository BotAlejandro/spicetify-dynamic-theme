# Dynamic Theme for Spicetify

Dynamic Spicetify theme with album-art color extraction, cover-based backgrounds, light/dark switching, and additional UI cleanup.

## Preview

![Theme preview](./preview.gif)

## Features

- Dynamic accent colors pulled from the current track artwork
- Blurred background based on the current cover art
- Light and dark variants, plus a top-bar toggle button
- Album or show metadata shown next to the now playing info
- Extra UI cleanup across headers, gradients, queue, and side panels

## Requirements

- Spotify desktop
- [Spicetify CLI](https://github.com/spicetify/cli) installed and working
- A valid Spicetify config directory already created

## Install / Update

Re-running the installer updates the existing theme files in place.

### Windows (PowerShell)

```powershell
Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/BotAlejandro/spicetify-dynamic-theme/main/install.ps1" | Invoke-Expression
```

### Linux / macOS (sh)

```bash
curl -fsSL https://raw.githubusercontent.com/BotAlejandro/spicetify-dynamic-theme/main/install.sh | sh
```

Both installers do the following:

- Copy `color.ini` and `user.css` into `Themes/DefaultDynamic`
- Copy `default-dynamic.js` and `Vibrant.min.js` into `Extensions`
- Set `current_theme` to `DefaultDynamic`
- Set `color_scheme` to `Dark-Base`
- Enable `inject_css` and `replace_colors`
- Add the required `xpui.js_find_8008` and `xpui.js_repl_8008` patch entries

### Manual Install

1. Clone this repo or download the current `main` branch as a zip.
2. Run `spicetify -c` and open the folder that contains `config-xpui.ini`.
3. Create `Themes/DefaultDynamic` inside that folder, then copy `color.ini` and `user.css` into it.
4. Copy `default-dynamic.js` and `Vibrant.min.js` into the `Extensions` folder next to `Themes`.
5. Add these lines under `[Patch]` in `config-xpui.ini`:

```ini
xpui.js_find_8008 = ,(\w+=)32,
xpui.js_repl_8008 = ,${1}28,
```

If you do not already have a `[Patch]` section, create one first.

6. Run:

```bash
spicetify config extensions default-dynamic.js extensions Vibrant.min.js
spicetify config current_theme DefaultDynamic color_scheme Dark-Base
spicetify config inject_css 1 replace_colors 1
spicetify apply
```

`default-dynamic.js` is required. If you only copy the CSS files, the theme will not work correctly.

## Theme Modes

Use Spicetify settings to switch between the included color schemes:

- `Dark-Base`
- `Light-Base`
- `Dark-NoAnimation`
- `Light-NoAnimation`

The top bar also includes a light/dark toggle button.

## Uninstall

### Windows (PowerShell)

```powershell
Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/BotAlejandro/spicetify-dynamic-theme/main/uninstall.ps1" | Invoke-Expression
```

### Linux / macOS (sh)

```bash
curl -fsSL https://raw.githubusercontent.com/BotAlejandro/spicetify-dynamic-theme/main/uninstall.sh | sh
```

### Manual Uninstall

1. Run:

```bash
spicetify config current_theme SpicetifyDefault color_scheme green-dark extensions default-dynamic.js- extensions Vibrant.min.js-
spicetify apply
```

2. Remove these lines from the `[Patch]` section in `config-xpui.ini`:

```ini
xpui.js_find_8008 = ,(\w+=)32,
xpui.js_repl_8008 = ,${1}28,
```

3. Delete `Themes/DefaultDynamic`, `Extensions/default-dynamic.js`, and `Extensions/Vibrant.min.js`.
