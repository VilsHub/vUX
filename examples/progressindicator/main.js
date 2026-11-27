/*
 * vUX ProgressIndicator, runnable example.
 *
 * ProgressIndicator renders a loading indicator inside a "progress space" element: a linear bar,
 * a circular spinner over an overlay, or an animated grid border. You set config, call
 * initialize() once, then pair showProgress() with hideProgress() around the work.
 *
 * Two sharp edges shape this page:
 *  - The markup is built on the FIRST showProgress() in a space and reused after that, so config
 *    changed later does not reach a space that already has a block. The playground rebuilds the
 *    instance on every change for that reason.
 *  - config.progressStyle.circular.icon becomes one page-wide rule (".vProgressItem .spinner::before").
 *    Section 02 styles its spinner with a scoped selector in index.html instead.
 *
 * Importing the module boots the vUX core, so $$ and the validateX helpers are globals by the time
 * this body runs.
 */
import { ProgressIndicator } from "../../vUX-progressIndicator.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const wait = (ms) => new Promise((done) => setTimeout(done, ms));

/* ------------------------------------------------------------------ *
 * Hero: a style 3 bar under a browser's address bar
 * ------------------------------------------------------------------ */

const heroSpace = $("#heroSpace");
const heroProgress = new ProgressIndicator(heroSpace); //the strip is the default space
heroProgress.config.progressType = "linear";
heroProgress.config.progressStyle = {
    //style 3 is the request bar: use it for real network work, 1 and 2 for open-ended waits
    linear: { progressColor: "#ffb454", trackColor: "rgba(255,255,255,0.04)", location: "top", style: 3 }
};
heroProgress.initialize();

const PAGES = [
    ["start", "Getting started"], ["guides/store", "Shared state with Store"],
    ["reference/carousel", "Carousel reference"], ["examples", "Every module, running"],
    ["release-notes", "Release notes"], ["guides/spa", "Routing with SPAEngine"]
];
let pageIndex = 0;
let loading = false;
let loadStarted = 0;
let pendingLoad = null; //resolves the simulated request early when "hideProgress() now" is pressed

//The library has no events, so the phase pills read the bar's own classes: style 3 moves through
//no class (fill to 57%), "slow" (to 85%), "halted" (crawl) and "completed" (snap to 100%).
function syncPhase() {
    const bar = $(".vProgressItem .style3", heroSpace);
    const item = $(".vProgressItem", heroSpace);
    let phase = null;
    if (bar && item && !item.classList.contains("done")) {
        if (bar.classList.contains("completed")) phase = "complete";
        else if (bar.classList.contains("halted")) phase = "crawl";
        else if (bar.classList.contains("slow")) phase = "slow";
        else phase = "fill";
    }
    $all("#heroPhase .pill").forEach((p) => p.classList.toggle("on", p.dataset.phase === phase));
}
new MutationObserver(syncPhase).observe(heroSpace, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });

async function navigate(duration) {
    if (loading) return;
    loading = true;
    pageIndex = (pageIndex + 1) % PAGES.length;
    const [path, title] = PAGES[pageIndex];
    $("#heroUrl").innerHTML = "docs.example.com/<b>" + path + "</b>";
    $("#heroPage").classList.add("loading");
    $("#heroStatus").className = "status run";
    $("#heroStatusText").textContent = "GET /" + path;
    loadStarted = performance.now();

    heroProgress.showProgress(); //when the request starts
    await new Promise((done) => {
        pendingLoad = done;
        setTimeout(done, duration);
    });
    pendingLoad = null;
    heroProgress.hideProgress(); //when it completes: the bar fills to 100%, then hides itself

    $("#heroTitle").textContent = title;
    $("#heroMeta").textContent = "loaded in " + ((performance.now() - loadStarted) / 1000).toFixed(1) + "s";
    $("#heroPage").classList.remove("loading");
    $("#heroStatus").className = "status";
    $("#heroStatusText").textContent = "200 OK, /" + path;
    loading = false;
}

//A loop of page loads of random length, so the fill, slow and crawl phases all get seen
let auto = true;
async function loop() {
    while (true) {
        if (auto && !loading) await navigate(900 + Math.random() * 3600);
        await wait(1600);
    }
}
loop();

function stopAuto() {
    auto = false;
    $("#heroAuto").textContent = "Resume the loop";
}
$("#heroGo").addEventListener("click", () => { stopAuto(); navigate(1200 + Math.random() * 1800); });
$("#heroSlow").addEventListener("click", () => { stopAuto(); navigate(14000); });
$("#heroDone").addEventListener("click", () => { stopAuto(); if (pendingLoad) pendingLoad(); });
$("#heroAuto").addEventListener("click", () => {
    auto = !auto;
    $("#heroAuto").textContent = auto ? "Pause the loop" : "Resume the loop";
});

/* ------------------------------------------------------------------ *
 * 01 Playground
 * ------------------------------------------------------------------ */

const ICONS = {
    ring:  "border:4px solid rgba(255,255,255,.12); border-top-color:#ffb454; border-radius:50%; box-sizing:border-box;",
    twin:  "border:4px solid transparent; border-top-color:#5ccfe6; border-bottom-color:#5ccfe6; border-radius:50%; box-sizing:border-box;",
    orbit: "width:12px; height:12px; top:0; left:19px; border-radius:50%; background:#a7e05f; box-shadow:0 0 14px #a7e05f;"
};

const stage = $("#stage");
const ui = {
    lnColor: $("#lnColor"), lnTrack: $("#lnTrack"), lnLoc: $("#lnLoc"), lnCustom: $("#lnCustom"),
    ciIcon: $("#ciIcon"), ciOverlay: $("#ciOverlay"), ciLabel: $("#ciLabel"), ciLabelStyle: $("#ciLabelStyle"),
    grColor: $("#grColor"), grGab: $("#grGab")
};
ui.ciIcon.value = ICONS.ring;

//config is write-only across vUX, so the page keeps its own copy of what it set
const state = { type: "linear", style: 3, shown: false };
let playProgress = null;
let simTimer = null;

function readStyle() {
    if (state.type === "linear") {
        return { linear: {
            progressColor: ui.lnColor.value,
            trackColor: ui.lnTrack.value,
            location: ui.lnLoc.value === "custom" ? ui.lnCustom.value : ui.lnLoc.value,
            style: state.style
        } };
    }
    if (state.type === "circular") {
        return { circular: {
            icon: ui.ciIcon.value, overlay: ui.ciOverlay.value,
            labelContent: ui.ciLabel.value, labelStyle: ui.ciLabelStyle.value
        } };
    }
    return { grid: { gridColor: ui.grColor.value, gridGab: Number(ui.grGab.value) } };
}

//Every change rebuilds the instance: a space keeps the block built by its first showProgress(),
//and destroy() is what removes that block (and the old instance's window listeners).
function rebuild() {
    const wasShown = state.shown;
    if (playProgress) playProgress.destroy();
    playProgress = new ProgressIndicator(stage);
    //progressType before initialize(): initialize() only adds the circular icon rule for a
    //non-linear type, and choosing "grid" is what starts the cShapes import
    playProgress.config.progressType = state.type;
    playProgress.config.progressStyle = readStyle();
    playProgress.initialize();
    window.playProgress = playProgress;
    setShown(false);
    if (wasShown) show();
    renderSnippet();
}

function setShown(on) {
    state.shown = on;
    $("#pgStatus").className = "status" + (on ? " run" : "");
    $("#pgStatusText").textContent = on ? "showing: " + state.type + (state.type === "linear" ? " style " + state.style : "") : "hidden";
}
function show() { clearTimeout(simTimer); playProgress.showProgress(); setShown(true); }
function hide() { clearTimeout(simTimer); playProgress.hideProgress(); setShown(false); }

$("#pgShow").addEventListener("click", show);
$("#pgHide").addEventListener("click", hide);
$("#pgSim").addEventListener("click", () => {
    show();
    simTimer = setTimeout(hide, 3000);
});

function pressed(seg, attr, value) {
    $all("button", seg).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === value)));
}
$("#typeSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    state.type = b.dataset.type;
    pressed($("#typeSeg"), "type", state.type);
    $("#grpLinear").hidden = state.type !== "linear";
    $("#grpCircular").hidden = state.type !== "circular";
    $("#grpGrid").hidden = state.type !== "grid";
    rebuild();
});
$("#styleSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    state.style = Number(b.dataset.style);
    pressed($("#styleSeg"), "style", b.dataset.style);
    rebuild();
});
$("#iconSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    pressed($("#iconSeg"), "icon", b.dataset.icon);
    ui.ciIcon.value = ICONS[b.dataset.icon];
    rebuild();
});
ui.lnLoc.addEventListener("change", () => {
    $("#lnCustomWrap").hidden = ui.lnLoc.value !== "custom";
    rebuild();
});
ui.grGab.addEventListener("input", () => { $("#grGabVal").textContent = ui.grGab.value; });
//colour pickers fire "input" continuously; rebuilding on "change" keeps it to one per pick
[ui.lnColor, ui.lnTrack, ui.grColor, ui.grGab].forEach((el) => el.addEventListener("change", rebuild));
[ui.lnCustom, ui.ciIcon, ui.ciOverlay, ui.ciLabel, ui.ciLabelStyle].forEach((el) => el.addEventListener("change", rebuild));

function renderSnippet() {
    const style = readStyle();
    const group = Object.keys(style)[0];
    const lines = Object.entries(style[group]).map(([k, v]) =>
        '        <span class="p">' + k + '</span>: ' +
        (typeof v === "number" ? v : '<span class="s">"' + escapeHtml(v) + '"</span>')).join(",\n");
    $("#snippet").innerHTML =
        '<span class="k">const</span> progress = <span class="k">new</span> ProgressIndicator($$.ss(<span class="s">"#stage"</span>));\n' +
        'progress.config.progressType = <span class="s">"' + state.type + '"</span>;\n' +
        "progress.config.progressStyle = {\n    <span class=\"p\">" + group + "</span>: {\n" + lines + "\n    }\n};\n" +
        "progress.initialize();\n\n" +
        'progress.showProgress();   <span class="c">// the request starts</span>\n' +
        'progress.hideProgress();   <span class="c">// the request ends</span>';
}
function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

rebuild();

/* ------------------------------------------------------------------ *
 * 02 Three ways to wait: one instance per card
 * ------------------------------------------------------------------ */

const saveProgress = new ProgressIndicator($("#cardLinear"));
saveProgress.config.progressStyle = { linear: { progressColor: "#a7e05f", trackColor: "transparent", style: 3 } };
saveProgress.initialize();
$("#saveBtn").addEventListener("click", async () => {
    const btn = $("#saveBtn");
    btn.disabled = true;
    $("#saveState").textContent = "saving";
    $("#saveState").classList.add("on");
    saveProgress.showProgress();
    await wait(1400 + Math.random() * 1400);
    saveProgress.hideProgress();
    $("#saveState").textContent = "saved";
    $("#saveState").classList.remove("on");
    btn.disabled = false;
});

const previewProgress = new ProgressIndicator($("#cardCircular"));
previewProgress.config.progressType = "circular";
previewProgress.config.progressStyle = { circular: {
    //no icon here: the spinner is styled by "#cardCircular .vProgressItem .spinner::before" in
    //index.html, because icon would set one rule for every circular spinner on the page
    overlay: "background:rgba(8,11,17,.78); border-radius:12px;",
    labelContent: "Fetching preview",
    labelStyle: "font-family:monospace; font-size:12px; color:#5ccfe6; letter-spacing:.1em; margin-top:100px"
} };
previewProgress.initialize();
$("#previewBtn").addEventListener("click", async () => {
    previewProgress.showProgress();
    await wait(2200);
    previewProgress.hideProgress();
});

const syncProgress = new ProgressIndicator($("#cardGrid"));
syncProgress.config.progressType = "grid"; //lazy-imports vUX-cShapes.js
syncProgress.config.progressStyle = { grid: { gridColor: "#ffb454", gridGab: 8 } };
syncProgress.initialize();
let syncing = false;
$("#syncBtn").addEventListener("click", () => {
    if (syncing) return;
    syncing = true;
    syncProgress.showProgress();
});
$("#syncStop").addEventListener("click", () => {
    if (!syncing) return;
    syncing = false;
    syncProgress.hideProgress();
});

/* ------------------------------------------------------------------ *
 * 03 Where it renders: one instance, three spaces
 * ------------------------------------------------------------------ */

const spaceProgress = new ProgressIndicator($("#panelA"));
//The data attribute is off until it has a name: data-progress-space on a trigger now picks the space
spaceProgress.config.dataAttributeNames = { progressSpaceId: "progress-space" };
spaceProgress.config.progressStyle = { linear: { progressColor: "#5ccfe6", trackColor: "transparent", style: 1 } };
spaceProgress.initialize();

["#toDefault", "#selfBtn", "#toPanel"].forEach((sel) => {
    $(sel).addEventListener("click", async (e) => {
        const trigger = e.currentTarget;
        //the same element goes to both calls, so hideProgress() resolves the same space
        spaceProgress.showProgress(trigger);
        await wait(2200);
        spaceProgress.hideProgress(trigger);
    });
});

/* ------------------------------------------------------------------ *
 * 04 Lifecycle
 * ------------------------------------------------------------------ */

let lifeProgress = null;
let lifeLines = [];
function createLife() {
    lifeProgress = new ProgressIndicator($("#lifeSpace"));
    lifeProgress.config.progressStyle = { linear: { progressColor: "#c8a2ff", trackColor: "#1f2a3a", style: 2 } };
    lifeProgress.initialize();
    window.lifeProgress = lifeProgress;
}
function log(line) {
    const blocks = $all("#lifeSpace .vProgressItem").length;
    lifeLines.push(line + "\n  blocks in the space: " + blocks);
    lifeLines = lifeLines.slice(-6);
    $("#lifeLog").textContent = lifeLines.join("\n");
    $("#lifeLog").scrollTop = $("#lifeLog").scrollHeight;
}
function lifeState(label) {
    $("#lifeState").textContent = label;
    $("#lifeState").classList.toggle("on", label === "initialized");
    $("#lifeNew").disabled = label === "initialized";
}
createLife();
lifeState("initialized");
log("new ProgressIndicator(lifeSpace) + initialize()");

$("#lifeShow").addEventListener("click", () => {
    try {
        lifeProgress.showProgress();
        log("showProgress()");
    } catch (e) {
        //a destroyed instance is no longer initialized, so showProgress() refuses
        log("showProgress() threw: " + e.message);
    }
});
$("#lifeDestroy").addEventListener("click", () => {
    lifeProgress.destroy(); //safe to call twice: a second call does nothing
    lifeState("destroyed");
    log("destroy()");
});
$("#lifeNew").addEventListener("click", () => {
    //initialize() on the destroyed instance would throw, so a fresh one is made
    createLife();
    lifeState("initialized");
    log("new ProgressIndicator(lifeSpace) + initialize()");
});

/* ------------------------------------------------------------------ *
 * 05 Bad input: each case throws, on a scratch instance
 * ------------------------------------------------------------------ */

const scratch = () => new ProgressIndicator(document.createElement("div"));

const BAD = {
    ctor:    () => { new ProgressIndicator("#space"); },
    early:   () => { scratch().showProgress(); },
    noSpace: () => {
        const p = new ProgressIndicator(); //no default space
        p.initialize();
        try { p.showProgress(); } finally { p.destroy(); }
    },
    type:    () => { scratch().config.progressType = "bar"; },
    group:   () => { scratch().config.progressStyle = { spinner: {} }; },
    key:     () => { scratch().config.progressStyle = { linear: { height: "3px" } }; },
    style:   () => { scratch().config.progressStyle = { linear: { style: 4 } }; },
    color:   () => { scratch().config.progressStyle = { linear: { progressColor: 5 } }; },
    gab:     () => { scratch().config.progressStyle = { grid: { gridGab: 0 } }; },
    attr:    () => { scratch().config.dataAttributeNames = { spaceId: "x" }; },
    missing: () => {
        //the attribute names an id that is not in the page
        const trigger = document.createElement("button");
        trigger.dataset.progressSpace = "nope";
        spaceProgress.showProgress(trigger);
    },
    reinit:  () => {
        const p = scratch();
        p.initialize();
        p.destroy();
        p.initialize();
    }
};

$all("[data-bad]").forEach((btn) => btn.addEventListener("click", () => {
    const out = $("#errOut");
    try {
        BAD[btn.dataset.bad]();
        out.textContent = "No error thrown.";
    } catch (e) {
        out.textContent = btn.textContent + "\n\n" + e.name + ": " + e.message;
    }
}));

//exposed for the console
Object.assign(window, { heroProgress, spaceProgress, saveProgress, previewProgress, syncProgress });
