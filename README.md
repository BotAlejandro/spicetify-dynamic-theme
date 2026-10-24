# Dynamic Theme for Spicetify

Dynamic Spicetify theme with album-art color extraction, cover-based backgrounds, light/dark switching, and additional UI cleanup.

A personal fork of [JulienMaille/spicetify-dynamic-theme](https://github.com/JulienMaille/spicetify-dynamic-theme), kept up to date with it.

## Preview

![Theme preview](./preview.gif)

## Features

- Accent colors pulled from the current track artwork, including Spotify's green play buttons and equalizers
- Blurred background based on the current cover art, or an optional animated background
- Light and dark variants, plus a top-bar toggle button
- Album name and year under the artist in the player bar, with Lossless shown as a small sound-wave icon (click it for Spotify's audio quality panel)
- Lyrics card in the Now Playing panel that follows the song, with the current line at the top; Show more opens the full lyrics
- Canvas videos blended into the Now Playing panel
- Track numbers sized to the playlist and centered, along with the playing song's equalizer
- Extra UI cleanup across headers, gradients, queue, and side panels

## Requirements

- Spotify desktop (tested on 1.3.6)
- [Spicetify CLI](https://github.com/spicetify/cli) installed and working (Spotify 1.3.6 needs 2.46 or newer)
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
- Remove the `xpui.js_find_8008` / `xpui.js_repl_8008` patch entries older versions added (they match nothing in current Spotify)

### Manual Install

1. Clone this repo or download the current `main` branch as a zip.
2. Run `spicetify -c` and open the folder that contains `config-xpui.ini`.
3. Create `Themes/DefaultDynamic` inside that folder, then copy `color.ini` and `user.css` into it.
4. Copy `default-dynamic.js` and `Vibrant.min.js` into the `Extensions` folder next to `Themes`.
5. Run:

```bash
spicetify config extensions default-dynamic.js extensions Vibrant.min.js
spicetify config current_theme DefaultDynamic color_scheme Dark-Base
spicetify config inject_css 1 replace_colors 1
spicetify apply
```

`default-dynamic.js` is required. If you only copy the CSS files, the theme will not work correctly.

### After a Spotify update

Spotify updates remove Spicetify, so the theme disappears. Run `spicetify backup apply` to bring it back. If that fails on a brand-new Spotify version, run `spicetify update` first.

## Theme Modes

The theme includes four color schemes:

- `Dark-Base`
- `Light-Base`
- `Dark-NoAnimation`
- `Light-NoAnimation`

Switch with `spicetify config color_scheme Light-Base` (or any of the names above), then `spicetify apply`. Marketplace users can pick one in Marketplace instead.

The top-bar button switches between light and dark until Spotify restarts; the color scheme sets the default.

## Animated Background

The background is a still, blurred copy of the cover by default. For a moving one, click your profile picture and turn on **Animated background**. It switches right away and is remembered. The `NoAnimation` color schemes keep it still.

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

2. If you installed an older version, remove these lines from the `[Patch]` section in `config-xpui.ini`:

```ini
xpui.js_find_8008 = ,(\w+=)32,
xpui.js_repl_8008 = ,${1}28,
```

3. Delete `Themes/DefaultDynamic`, `Extensions/default-dynamic.js`, and `Extensions/Vibrant.min.js`.
