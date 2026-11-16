/*
 * Regression test for issue #156 (DJ mode: background stuck on a static image).
 *
 * Root cause: the "red-wash guard" in default-dynamic.js withheld every new
 * cover while the last-known palette was red-dominant, and the only code that
 * released the withheld cover (__kawarpApplyTint) itself bails out on red
 * palettes. When the current item's art reads red-dominant (common with DJ /
 * narration artwork), the warp canvas keeps whatever image it had before —
 * so the background stops following the song.
 *
 * This harness loads the real default-dynamic.js in a vm with minimal mocks
 * and drives the exact code path. Run with: node tests/dj-background.test.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SOURCE = path.join(__dirname, "..", "default-dynamic.js");
let source = fs.readFileSync(SOURCE, "utf8");
// The ESM import cannot run in a vm; the real code catches this and stays on
// the static path. We inject a mock Kawarp instance ourselves below.
source = source.replace(/await import\(["']https:\/\/cdn\.jsdelivr\.net\/npm\/@kawarp\/core\/\+esm["']\);/, '(() => { throw new Error("mock: dynamic import disabled in test"); })();');
// `textColor` is a module-level `let`, so expose it through a test-only hook.
source = source.replace("window.__dynamicBgSetCover = function (url) {", "window.__getTextColor = function () { return textColor; };\nwindow.__dynamicBgSetCover = function (url) {");

function makeEl(id) {
    const el = {
        id: id || "",
        innerHTML: "",
        textContent: "",
        width: 0,
        height: 0,
        style: {
            props: {},
            setProperty(k, v) {
                this.props[k] = v;
            }
        },
        dataset: {},
        classList: {
            add() {},
            remove() {},
            contains() {
                return false;
            }
        },
        setAttribute() {},
        getAttribute() {
            return null;
        },
        append() {},
        appendChild() {},
        insertBefore() {},
        addEventListener() {},
        getContext() {
            return null;
        },
        toDataURL() {
            return "data:image/jpeg;base64,mock";
        },
        querySelectorAll() {
            return [];
        },
        querySelector() {
            return null;
        },
        get firstChild() {
            return null;
        },
        get children() {
            return [];
        },
        get parentElement() {
            return null;
        }
    };
    return el;
}

function buildContext(state) {
    const canvas = makeEl("dynamic-bg-canvas");
    const root = makeEl();
    let imageUrl = "none";

    const document = {
        documentElement: root,
        body: makeEl(),
        getElementById(id) {
            return id === "dynamic-bg-canvas" ? canvas : null;
        },
        querySelector() {
            return null;
        },
        querySelectorAll() {
            return [];
        },
        createElement() {
            return makeEl();
        },
        addEventListener() {}
    };

    const getComputedStyle = () => ({
        getPropertyValue(name) {
            const map = {
                "--spice-main": "#0A0A0A",
                "--spice-dark": "#010101",
                "--is_light": "0",
                "--spice-animation": "#000001",
                "--image_url": imageUrl
            };
            return map[name] !== undefined ? map[name] : "";
        }
    });

    const window = {
        innerWidth: 1280,
        innerHeight: 720,
        devicePixelRatio: 1,
        requestAnimationFrame(cb) {
            /* don't flush: styles are not under test */
        },
        addEventListener() {}
    };

    const Spicetify = {
        Platform: {
            PlayerAPI: { _state: state },
            AuthorizationAPI: { getState: () => ({ token: { accessToken: "x" } }) },
            version: "1.3.9",
            PlatformData: { client_version_triple: "1.3.9", app_platform: "web", os_name: "windows" }
        },
        Player: {
            data: state,
            addEventListener() {},
            dispatchEvent() {}
        },
        Config: {},
        showNotification() {},
        Tippy() {},
        TippyProps: {},
        GraphQL: undefined,
        colorExtractor: undefined // force the Vibrant path so we control textColor
    };

    // Vibrant swatch used by getVibrant() to set the module-level `textColor`.
    let swatchHex = "#E63946";
    function Vibrant() {
        this.swatches = () => ({ Vibrant: { getHex: () => swatchHex } });
    }

    const sandbox = {
        window,
        document,
        getComputedStyle,
        Spicetify,
        Vibrant,
        fetch: async () => ({ json: async () => ({}) }),
        setTimeout: () => 0, // neutralise retry/startup timers
        clearTimeout: () => {},
        performance: { now: () => 0 },
        console: { log: console.log, error: console.error, warn: () => {} },
        Event: class {},
        Image: class {},
        URL,
        encodeURI,
        Date,
        Math,
        Map,
        JSON,
        Number,
        String,
        Object,
        Array,
        isNaN,
        parseInt,
        Promise
    };
    sandbox.globalThis = sandbox;
    const context = vm.createContext(sandbox);
    vm.runInContext(source, context, { filename: "default-dynamic.js" });

    return {
        context,
        canvas,
        window,
        setSwatch(hex) {
            swatchHex = hex;
        },
        setImageUrl(url) {
            imageUrl = url;
        }
    };
}

function assert(cond, msg) {
    if (!cond) {
        console.error("FAIL: " + msg);
        process.exitCode = 1;
        return false;
    }
    console.log("PASS: " + msg);
    return true;
}

// --- Test 1: red-dominant palette must NOT block the new cover ----------------
{
    const h = buildContext({ item: { uri: "spotify:track:dj", metadata: {}, type: "unknown", provider: "narration" } });
    const loaded = [];
    h.context.__kawarpInstance = {
        loadImage(url) {
            loaded.push(url);
            return Promise.resolve();
        },
        renderFrame() {},
        start() {},
        stop() {},
        resize() {}
    };

    // Force the palette red through the real getVibrant() code path.
    h.setSwatch("#E63946");
    h.context.getVibrant({});

    assert(h.context.__isRedDominantHex(h.window.__getTextColor()) === true, "setup: palette is detected as red-dominant");

    h.window.__dynamicBgSetCover("https://i.scdn.co/image/NEW_COVER_RED");

    assert(loaded.includes("https://i.scdn.co/image/NEW_COVER_RED"), "new cover is loaded into the warp canvas while the palette is red-dominant " + "(issue #156: must not leave the previous image stuck)");
    assert((h.canvas.style.filter || h.canvas.style.props.filter || "").includes("saturate"), "red wash is still neutralised on the canvas");
}

// --- Test 2: non-red palette after red still updates normally -----------------
{
    const h = buildContext({ item: { uri: "spotify:track:song", metadata: {}, type: "track" } });
    const loaded = [];
    h.context.__kawarpInstance = {
        loadImage(url) {
            loaded.push(url);
            return Promise.resolve();
        },
        renderFrame() {},
        start() {},
        stop() {},
        resize() {}
    };

    h.setSwatch("#3B5BDB"); // blue
    h.context.getVibrant({});
    h.window.__dynamicBgSetCover("https://i.scdn.co/image/COVER_BLUE");

    assert(loaded.includes("https://i.scdn.co/image/COVER_BLUE"), "non-red cover loads normally");
}

// --- Test 3: full DJ sequence — red narration then a blue song ---------------
{
    const h = buildContext({ item: { uri: "spotify:track:dj2", metadata: {}, type: "unknown", provider: "narration" } });
    const loaded = [];
    h.context.__kawarpInstance = {
        loadImage(url) {
            loaded.push(url);
            return Promise.resolve();
        },
        renderFrame() {},
        start() {},
        stop() {},
        resize() {}
    };

    // DJ narration art reads red: cover is painted but the canvas is tamed.
    h.setSwatch("#C1121F");
    h.context.getVibrant({});
    h.window.__dynamicBgSetCover("https://i.scdn.co/image/DJ_RED");
    h.context.__kawarpApplyTint();
    assert(loaded[loaded.length - 1] === "https://i.scdn.co/image/DJ_RED", "DJ narration cover is painted");
    assert((h.canvas.style.filter || "").includes("saturate(0.85)"), "canvas stays neutral on red art");

    // Next song has a blue cover: background must switch to it and the normal
    // per-luma tint (not the red-neutral fixed filter) must come back.
    h.setSwatch("#3B5BDB");
    h.context.getVibrant({});
    h.window.__dynamicBgSetCover("https://i.scdn.co/image/SONG_BLUE");
    h.context.__kawarpApplyTint();
    assert(loaded[loaded.length - 1] === "https://i.scdn.co/image/SONG_BLUE", "background follows the song after narration");
    assert(!(h.canvas.style.filter || "").includes("saturate(0.85)"), "normal tint is restored on the song's cover");
}

if (process.exitCode) {
    console.error("\nRegression test FAILED");
} else {
    console.log("\nRegression test PASSED");
}
