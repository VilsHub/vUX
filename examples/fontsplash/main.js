/* ============================================================================
   vUX FontSplash example — the loader is a word.

   Importing any vUX-*.js module boots the whole core, so $$ and the validateX
   helpers are globals by the time this file's body runs.

   The page has no font files: every "custom" font here is a local() face, a font
   already installed on the machine, so the example runs offline. Which of them
   exist differs between Windows, macOS and Linux; one that is missing simply
   fails to load, and the splash falls back, which is itself worth seeing.
   ========================================================================== */
import { FontSplash } from "../../vUX-fontSplash.js";

const PAGE_BG = "#080b11";      // --ink in examples/shared/example.css
const PALETTE = ["#ffb454", "#ff6b7f", "#c8a2ff", "#5ccfe6"];   // the page's own accents

/* Fonts offered by the hero and the playground. A face with 'src' is registered by
   FontSplash itself; a plain family name must already be known to the browser, as
   a system font or through the page's own @font-face ("Page Display" in index.html). */
const FONTS = {
    "system-ui":    null,
    "Georgia":      { family: "Georgia", fallback: "serif" },
    "Impact":       { family: "Splash Impact", src: 'local("Impact")', weight: 400, fallback: "Arial Black, sans-serif" },
    "Arial Black":  { family: "Splash Black", src: 'local("Arial Black"), local("ArialMT-Black")', weight: 900 },
    "Courier":      { family: "Splash Courier", src: 'local("Courier New Bold"), local("CourierNewPS-BoldMT"), local("DejaVu Sans Mono Bold")', fallback: "monospace" },
    "Page Display": "Page Display",
};

const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------------------------------------------------------------------------
   The page's own splash. new FontSplash() with no element covers the viewport.
   during() keeps it up until the promise settles - here, until the window has
   loaded plus a beat, standing in for a real app's boot. The cloak class on
   <html> comes off as soon as the splash is up; see index.html.
   ------------------------------------------------------------------------- */
const pageSplash = new FontSplash();
pageSplash.config.text = "vUX";
pageSplash.config.font = FONTS["Arial Black"];
pageSplash.config.size = "clamp(4rem, 22vw, 13rem)";
pageSplash.config.colors = PALETTE;
pageSplash.config.background = PAGE_BG;
pageSplash.config.caption = "FontSplash example";
pageSplash.config.label = "Loading the FontSplash example";
pageSplash.config.exit = "lift";
pageSplash.config.exitDuration = 650;
pageSplash.initialize();

const loaded = new Promise(r => document.readyState == "complete" ? r() : addEventListener("load", r, { once: true }));
pageSplash.during(loaded.then(() => wait(1400)));

$$.ss("#pageReplay").addEventListener("click", () => pageSplash.during(wait(2200)));
$$.ss("#heroReplay").addEventListener("click", () => pageSplash.during(wait(2200)));


/* ---------------------------------------------------------------------------
   Hero: a splash that never hides, in container mode. new FontSplash(el) puts
   an absolutely positioned overlay inside el, so it covers that box only.
   ------------------------------------------------------------------------- */
const hero = new FontSplash($$.ss("#heroStage"));
hero.config.text = "VilsHub";
hero.config.font = FONTS["Arial Black"];
hero.config.size = "clamp(3rem, 13vw, 9rem)";
hero.config.colors = PALETTE;
// A backdrop can be any CSS background, gradients included.
hero.config.background = "radial-gradient(120% 90% at 50% 110%, #16203a 0%, #080b11 62%)";
hero.config.trackColor = "rgba(255,255,255,.05)";
hero.config.minOpacity = 0.06;
hero.config.label = "VilsHub, an animated wordmark";
hero.initialize();
hero.show();

segmented("#heroFont", Object.keys(FONTS), "Arial Black", name => { hero.config.font = FONTS[name]; });
segmented("#heroAnim", null, null, value => { hero.config.animation = value; });

/* Builds (or wires) a row of toggle buttons; onPick gets the chosen value. */
function segmented(sel, values, initial, onPick){
    const root = $$.ss(sel);
    if (values){
        root.innerHTML = values.map(v => `<button data-v="${v}"${v == initial ? ' class="on"' : ""}>${v}</button>`).join("");
    }
    root.addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        root.querySelectorAll("button").forEach(x => x.classList.toggle("on", x == b));
        onPick(b.dataset.v);
    });
}


/* ---------------------------------------------------------------------------
   01 · Playground. Every control writes one config property. vUX config is
   write-only, so the page keeps its own copy in 'cfg' to print the code panel.
   ------------------------------------------------------------------------- */
const play = new FontSplash($$.ss("#playStage"));
const cfg = {
    text: "Starlight", font: "Georgia", size: 96, colors: ["#ff5f6d", "#ffc371", "#47cacc", "#7b6cff"],
    background: PAGE_BG, trackColor: "rgba(127,127,127,.16)", caption: "Tuning the telescope",
    animation: "fade", exit: "fade", speed: 2400, fadeSpeed: 1500, stagger: 110, minOpacity: 0.12,
    delay: 0, minDuration: 800, fontTimeout: 3000, exitDuration: 500, label: "Loading Starlight",
};
let fileFont = null;            // { name, buffer } once a file has been picked

$$.ss("#pFont").innerHTML = Object.keys(FONTS).map(n => `<option${n == cfg.font ? " selected" : ""}>${n}</option>`).join("");

function fontValue(){
    if (cfg.font == "(your file)") return { family: "Splash Upload", src: fileFont.buffer };
    return FONTS[cfg.font];
}

// Apply everything once, then one property per control.
play.config.text = cfg.text;
play.config.font = fontValue();
play.config.size = cfg.size;
play.config.colors = cfg.colors;
play.config.background = cfg.background;
play.config.trackColor = cfg.trackColor;
play.config.caption = cfg.caption;
play.config.label = cfg.label;
play.config.onShow = s => log(`onShow   · word visible · fontStatus ${s.fontStatus}`);
play.config.onHide = () => log("onHide   · splash removed");
play.initialize();
play.show();                    // up from the start, so every control has something to change

const bind = (id, key, parse = v => v, fmt = null) => {
    const el = $$.ss("#" + id);
    const evt = el.type == "range" || el.type == "text" || el.type == "color" ? "input" : "change";
    el.addEventListener(evt, () => {
        const value = parse(el.value);
        try {
            play.config[key] = value;
            cfg[key] = value;
            if (fmt) $$.ss("#" + fmt).textContent = typeof value == "number" && key != "minOpacity" ? value + (key == "size" ? "px" : "ms") : value;
            el.removeAttribute("aria-invalid");
        } catch (e) {
            // Typing in the text box passes through invalid states ("", 81 chars):
            // the setter throws and the previous value stays.
            el.setAttribute("aria-invalid", "true");
            log("error    · " + e.message);
        }
        renderCode();
    });
};
bind("pText", "text");
bind("pSize", "size", Number, "vSize");
bind("pBg", "background");
bind("pTrack", "trackColor", v => v == "null" ? null : v);
bind("pCaption", "caption");
bind("pAnim", "animation");
bind("pExit", "exit");
bind("pSpeed", "speed", Number, "vSpeed");
bind("pFadeSpeed", "fadeSpeed", Number, "vFadeSpeed");
bind("pStagger", "stagger", Number, "vStagger");
bind("pMinOpacity", "minOpacity", Number, "vMinOpacity");
bind("pDelay", "delay", Number, "vDelay");
bind("pMin", "minDuration", Number, "vMin");
bind("pTimeout", "fontTimeout", Number, "vTimeout");
bind("pExitDur", "exitDuration", Number, "vExitDur");
bind("pLabel", "label");

$$.ss("#pFont").addEventListener("change", e => {
    cfg.font = e.target.value;
    play.config.font = fontValue();
    renderCode();
});

/* A font file read into an ArrayBuffer is a valid font.src: FontSplash hands the
   bytes to new FontFace(), and nothing leaves the machine. */
$$.ss("#pFile").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    fileFont = { name: file.name, buffer: await file.arrayBuffer() };
    const select = $$.ss("#pFont");
    if (!select.querySelector("option[value='(your file)']")) select.insertAdjacentHTML("beforeend", "<option value=\"(your file)\">(your file)</option>");
    select.value = cfg.font = "(your file)";
    play.config.font = fontValue();
    log(`font     · ${file.name}, ${Math.round(file.size / 1024)} KB`);
    renderCode();
});

/* Colours: the swatches are the array, in order; - and + change its length (2 to 8). */
const swatches = $$.ss("#pColors");
function readColors(){
    cfg.colors = [...swatches.querySelectorAll("input")].map(i => i.value);
    play.config.colors = cfg.colors;
    renderCode();
}
swatches.addEventListener("input", readColors);
$$.ss("#pColorLess").addEventListener("click", () => {
    const all = swatches.querySelectorAll("input");
    if (all.length > 2) { all[all.length - 1].remove(); readColors(); }
});
$$.ss("#pColorMore").addEventListener("click", () => {
    const all = swatches.querySelectorAll("input");
    if (all.length >= 8) return;
    const next = document.createElement("input");
    next.type = "color";
    next.value = PALETTE[all.length % PALETTE.length];
    next.setAttribute("aria-label", "colour " + (all.length + 1));
    all[all.length - 1].after(next);
    readColors();
});

$$.ss("#pShow").addEventListener("click", () => { play.show(); log("show()"); });
$$.ss("#pHide").addEventListener("click", async () => {
    const t = performance.now();
    log("hide()");
    await play.hide();
    log(`hide()   · resolved after ${Math.round(performance.now() - t)}ms (minDuration remainder + exit)`);
});
$$.ss("#pRun").addEventListener("click", async () => {
    log("during() · a 2.5s load");
    const result = await play.during(wait(2500).then(() => "data"));
    log(`during() · resolved with "${result}" once the splash was down`);
});
$$.ss("#logClear").addEventListener("click", () => { $$.ss("#playLog").textContent = ""; });

function log(line){
    const out = $$.ss("#playLog");
    const t = (performance.now() / 1000).toFixed(2).padStart(7);
    out.textContent += `${t}s  ${line}\n`;
    out.scrollTop = out.scrollHeight;
}

// state and fontStatus are read-only getters; polled for the status line.
setInterval(() => {
    const el = $$.ss("#playStatus");
    el.classList.toggle("run", play.state != "idle");
    el.lastElementChild.textContent = `state ${play.state} · fontStatus ${play.fontStatus}`;
}, 120);

function renderCode(){
    const s = v => `<span class="s">${JSON.stringify(v).replace(/</g, "&lt;")}</span>`;
    const f = cfg.font == "(your file)" ? `{ family: ${s("Splash Upload")}, src: <span class="p">await</span> file.arrayBuffer() }`
        : FONTS[cfg.font] == null ? `<span class="k">null</span>`
        : typeof FONTS[cfg.font] == "string" ? s(FONTS[cfg.font])
        : "{ " + Object.entries(FONTS[cfg.font]).map(([k, v]) => `${k}: ${typeof v == "number" ? v : s(v)}`).join(", ") + " }";
    const lines = [
        `<span class="k">const</span> splash = <span class="k">new</span> FontSplash(stage);`,
        `splash.config.text = ${s(cfg.text)};`,
        `splash.config.font = ${f};`,
        `splash.config.size = ${cfg.size};`,
        `splash.config.colors = [${cfg.colors.map(s).join(", ")}];`,
        `splash.config.background = ${s(cfg.background)};`,
        `splash.config.trackColor = ${cfg.trackColor == null ? '<span class="k">null</span>' : s(cfg.trackColor)};`,
        `splash.config.caption = ${s(cfg.caption)};`,
        `splash.config.animation = ${s(cfg.animation)};`,
        `splash.config.speed = ${cfg.speed};`,
        `splash.config.fadeSpeed = ${cfg.fadeSpeed};`,
        `splash.config.stagger = ${cfg.stagger};`,
        `splash.config.minOpacity = ${cfg.minOpacity};`,
        `splash.config.delay = ${cfg.delay};`,
        `splash.config.minDuration = ${cfg.minDuration};`,
        `splash.config.fontTimeout = ${cfg.fontTimeout};`,
        `splash.config.exit = ${s(cfg.exit)};`,
        `splash.config.exitDuration = ${cfg.exitDuration};`,
        `splash.config.label = ${s(cfg.label)};`,
        `splash.initialize();`,
        ``,
        `<span class="k">const</span> data = <span class="k">await</span> splash.during(fetch(<span class="s">"/api/…"</span>));`,
    ];
    $$.ss("#playCode").innerHTML = lines.join("\n");
}
renderCode();


/* ---------------------------------------------------------------------------
   02 · Determinate. setProgress() between 0 and 1 clips the gradient fill; the
   caption is just config.caption, rewritten as the work moves on.
   ------------------------------------------------------------------------- */
const prog = new FontSplash($$.ss("#progStage"));
prog.config.text = "Updating";
prog.config.font = FONTS["Page Display"];
prog.config.size = "clamp(2.6rem, 10vw, 6.5rem)";
prog.config.colors = ["#a7e05f", "#5ccfe6"];
prog.config.background = PAGE_BG;
prog.config.trackColor = "rgba(255,255,255,.08)";
// "flow" rather than "fade": a fading letter would read as "not done yet" even
// where the fill has passed it.
prog.config.animation = "flow";
prog.config.minDuration = 600;
prog.config.caption = "Ready when you are";
prog.config.label = "Installing the update";
prog.initialize();
prog.setProgress(0);
prog.show();

const STEPS = [["Downloading", 0.38], ["Verifying", 0.55], ["Unpacking", 0.8], ["Migrating", 0.94], ["Cleaning up", 1]];
$$.ss("#progSteps").innerHTML = STEPS.map(([n]) => `<span class="pill">${n}</span>`).join("");
let progRunning = false;

$$.ss("#progRun").addEventListener("click", async () => {
    if (progRunning) return;
    progRunning = true;
    const pills = $$.ss("#progSteps").children;
    [...pills].forEach(p => p.classList.remove("done", "on"));
    prog.show();
    let at = 0;
    prog.setProgress(0);
    for (let i = 0; i < STEPS.length; i++){
        const [name, to] = STEPS[i];
        pills[i].classList.add("on");
        // Small increments, as a real download reports them.
        while (at < to - 0.0001){
            at = Math.min(to, at + 0.02 + Math.random() * 0.03);
            prog.setProgress(at);
            prog.config.caption = `${name} · ${Math.round(at * 100)}%`;
            await wait(70 + Math.random() * 90);
        }
        pills[i].classList.replace("on", "done");
    }
    prog.config.caption = "Done";
    await wait(500);
    await prog.hide();
    await wait(900);
    prog.config.caption = "Ready when you are";
    prog.setProgress(0);
    prog.show();
    progRunning = false;
});
$$.ss("#progIndet").addEventListener("click", () => {
    prog.setProgress(null);
    prog.config.caption = "No idea how long this takes";
});


/* ---------------------------------------------------------------------------
   03 · The font comes first. Each card is a fresh run: the timeline records,
   from show(), when the word appeared and what fontStatus said.
   ------------------------------------------------------------------------- */
const CASES = {
    face:     { text: "Grotesk", font: FONTS["Arial Black"] },
    declared: { text: "Display", font: "Page Display" },
    missing:  { text: "Missing", font: { family: "Not Here", src: "fonts/missing.woff2", fallback: "Georgia, serif" } },
    file:     { text: "Yours", font: null },
};
const caseSplashes = {};
for (const stage of document.querySelectorAll("#fontGrid .stage")){
    const name = stage.dataset.case;
    const s = new FontSplash(stage);
    s.config.text = CASES[name].text;
    // cqw: a share of the splash's own width, so the word fits whatever the card's width.
    s.config.size = "clamp(1.8rem, 17cqw, 3.4rem)";
    s.config.colors = PALETTE;
    s.config.background = PAGE_BG;
    s.config.minDuration = 0;
    s.config.exit = "none";
    s.initialize();
    caseSplashes[name] = s;
}

async function runCase(name){
    const s = caseSplashes[name];
    const line = s => document.querySelector(`#fontGrid [data-case="${name}"]`).parentNode.querySelector(".timeline").innerHTML = s;
    if (name == "file" && CASES.file.font == null){
        line("pick a font file above");
        return;
    }
    await s.hide();
    // A new assignment is a new font to load, even with the same family:
    // that is what makes this a cold run each time.
    s.config.font = CASES[name].font;
    const t0 = performance.now();
    s.config.onShow = sp => {
        const ms = Math.round(performance.now() - t0);
        const cls = sp.fontStatus == "failed" || sp.fontStatus == "timeout" ? "bad" : "good";
        line(`show() at <b>0ms</b><br>word visible at <b>${ms}ms</b><br>fontStatus <span class="${cls}">${sp.fontStatus}</span>`);
    };
    line(`show() at <b>0ms</b><br>waiting for the font…`);
    s.show();
}
$$.ss("#caseFile").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    CASES.file.font = { family: "Splash Yours", src: await file.arrayBuffer() };
    CASES.file.text = file.name.replace(/\.[^.]+$/, "").slice(0, 14) || "Yours";
    caseSplashes.file.config.text = CASES.file.text;
    runCase("file");
});
const replayFonts = () => Object.keys(CASES).forEach(runCase);
$$.ss("#fontReplay").addEventListener("click", replayFonts);
replayFonts();


/* ---------------------------------------------------------------------------
   04 · Animations and exits, one card each.
   ------------------------------------------------------------------------- */
const ANIMS = [["fade", "fade"], ["flow", "lift"], ["breathe", "zoom"], ["none", "none"]];
$$.ss("#animGrid").innerHTML = ANIMS.map(([a, x]) => `
    <div class="card anim-card">
        <div class="stage"></div>
        <div class="body">
            <span><code>animation "${a}"</code><br><code>exit "${x}"</code></span>
            <button class="tiny" data-anim="${a}">Hide</button>
        </div>
    </div>`).join("");
const animCards = [...document.querySelectorAll("#animGrid .anim-card")];
animCards.forEach((card, i) => {
    const [anim, exit] = ANIMS[i];
    const s = new FontSplash(card.querySelector(".stage"));
    s.config.text = anim;
    s.config.font = FONTS["Georgia"];
    s.config.size = "clamp(1.8rem, 19cqw, 3.6rem)";
    s.config.colors = [PALETTE[i], PALETTE[(i + 2) % 4], PALETTE[(i + 1) % 4]];
    s.config.background = PAGE_BG;
    s.config.animation = anim;
    s.config.exit = exit;
    s.config.exitDuration = 700;
    s.config.minDuration = 0;
    s.initialize();
    s.show();
    const button = card.querySelector("button");
    button.addEventListener("click", async () => {
        button.disabled = true;
        await s.hide();         // resolves when the exit has finished
        await wait(900);
        s.show();
        button.disabled = false;
    });
});


/* ---------------------------------------------------------------------------
   06 · What it refuses to do. Each entry misuses the API and prints the throw.
   ------------------------------------------------------------------------- */
const fresh = () => new FontSplash(document.createElement("div"));
const MISUSES = [
    ["new FontSplash(\"#app\")", () => new FontSplash("#app")],
    ["show() before initialize()", () => fresh().show()],
    ["config.text = \"   \"", () => { fresh().config.text = "   "; }],
    ["config.text = 81 characters", () => { fresh().config.text = "x".repeat(81); }],
    ["config.colors = [\"red\"]", () => { fresh().config.colors = ["red"]; }],
    ["config.colors = [\"red\", \"bleu\"]", () => { fresh().config.colors = ["red", "bleu"]; }],
    ["config.font = { family: \"X\", size: 9 }", () => { fresh().config.font = { family: "X", size: 9 }; }],
    ["config.font = { family: \"X\", weight: 1200 }", () => { fresh().config.font = { family: "X", weight: 1200 }; }],
    ["config.font = { family: \"X\", src: 42 }", () => { fresh().config.font = { family: "X", src: 42 }; }],
    ["config.font = { family: \"X\", style: \"slanted\" }", () => { fresh().config.font = { family: "X", style: "slanted" }; }],
    ["config.size = \"huge\"", () => { fresh().config.size = "huge"; }],
    ["config.background = \"url(\"", () => { fresh().config.background = "url("; }],
    ["config.animation = \"spin\"", () => { fresh().config.animation = "spin"; }],
    ["config.exit = \"explode\"", () => { fresh().config.exit = "explode"; }],
    ["config.speed = 50", () => { fresh().config.speed = 50; }],
    ["config.minOpacity = 1.5", () => { fresh().config.minOpacity = 1.5; }],
    ["config.label = \"\"", () => { fresh().config.label = ""; }],
    ["setProgress(42)", () => fresh().setProgress(42)],
    ["during(\"later\")", () => { const s = fresh(); s.initialize(); s.during("later"); }],
    ["show() after destroy()", () => { const s = fresh(); s.initialize(); s.destroy(); s.show(); }],
];
$$.ss("#errGrid").innerHTML = MISUSES.map(([label], i) => `<button data-i="${i}">${label.replace(/</g, "&lt;")}</button>`).join("");
$$.ss("#errGrid").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    try {
        MISUSES[b.dataset.i][1]();
        $$.ss("#errOut").textContent = "(no error thrown)";
    } catch (err) {
        $$.ss("#errOut").textContent = err.name + ": " + err.message;
    }
});
