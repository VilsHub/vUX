/*
 * vUX MessageBox — runnable example.
 *
 * One instance drives the playground and the effect cards; a second, with its
 * own fixed settings, posts the hero and task messages. Both share the same
 * lanes, so their messages stack together instead of overlapping.
 */
import { MessageBox } from "../../vUX-messageBox.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);

/* ------------------------------------------------------------------ *
 * 1. Hero — the four typed shorthands
 * ------------------------------------------------------------------ */

const hero = new MessageBox();
hero.config.theme = "dark";             //the page is dark; so are its own messages
hero.initialize();                      //nothing can be posted before this

const HERO = {
    info:    ["Version 4.0 is out", "Release notes are in the docs."],
    success: ["Done", "Changes saved"],
    warning: ["Storage almost full", "92% of your quota is in use."],
    error:   ["Upload failed", "The server did not answer. Try again in a moment."]
};

//info(), success(), warning() and error() are show() with options.type set
$$$("[data-hero]").forEach(btn => btn.addEventListener("click", () => {
    const [title, text] = HERO[btn.dataset.hero];
    hero[btn.dataset.hero](text, { title });
}));

//Lead with the component: one message drops in as the page opens.
setTimeout(() => hero.info("Press the coloured buttons to post your own.", { title: "Welcome to MessageBox" }), 500);

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const box = new MessageBox();
window.box = box;

//config is write-only across vUX, so the page keeps its own copy of what it set
//(the "Equivalent code" panel is built from it).
const state = {
    effect: "drop", alignment: "right", type: "info", theme: "light",
    duration: 4000, speed: 450, width: 360, offset: 16, maxVisible: 5,
    closeButton: true, pauseOnHover: true, closeOnClick: false,
    showProgress: true, newestOnTop: true, respectReducedMotion: true
};
const DEFAULTS = { ...state };

function apply(name, value) {
    box.config[name] = value;   //throws on a bad value; the controls cannot produce one
    state[name] = value;
    render();
}

const logEl = $("#log");
function log(line) {
    const t = new Date().toLocaleTimeString([], { hour12: false });
    logEl.textContent += `${t}  ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
}

//onShow fires when the message has LANDED, which is also when its timer starts.
//onClose gets the reason: timeout, button, click, api, overflow or destroy.
box.config.onShow = h => { log(`onShow   "${short(h)}"`); render(); };
box.config.onClose = (h, reason) => { log(`onClose  "${short(h)}"  reason: ${reason}`); render(); };
box.initialize();

function short(handle) {
    const s = handle.element.querySelector(".vmb-content").textContent;
    return s.length > 28 ? s.slice(0, 27) + "…" : s;
}

//Segmented pickers: one "on" button per group, each a config property.
function seg(group, attr, name) {
    $$$(`${group} [data-${attr}]`).forEach(btn => btn.addEventListener("click", () => {
        $$$(`${group} [data-${attr}]`).forEach(b => b.classList.toggle("on", b === btn));
        apply(name, btn.dataset[attr]);
        if (name == "alignment") $("#alignV").textContent = btn.dataset[attr];
    }));
}
seg("#lanes", "align", "alignment");
seg("#effectSeg", "effect", "effect");
seg("#typeSeg", "type", "type");
seg("#themeSeg", "theme", "theme");

const UNITS = { duration: "ms", speed: "ms", width: "px", offset: "px", maxVisible: "" };
Object.keys(UNITS).forEach(name => {
    const input = $("#" + name);
    input.addEventListener("input", () => {
        const v = Number(input.value);
        $(`#${name}V`).textContent = name == "duration" && v == 0 ? "0 (stays)" : v + UNITS[name];
        apply(name, v);     //a width given as a number is taken as px
    });
});

$$$("[data-flag]").forEach(cb => cb.addEventListener("change", () => apply(cb.dataset.flag, cb.checked)));

function post() {
    const title = $("#title").value.trim();
    //title is a per-call option, not config: every message has its own
    box.show($("#text").value, title ? { title } : undefined);
    render();
}
$("#post").addEventListener("click", post);

const BURST = ["Build #1824 passed", "3 new comments", "Backup finished", "Invoice sent to Ada", "Sync complete"];
$("#burst").addEventListener("click", () => {
    //Posted 140ms apart: each new arrival pushes the others along, and past
    //maxVisible the oldest leave with reason "overflow".
    BURST.forEach((text, i) => setTimeout(() => { box.show(text); render(); }, i * 140));
});
$("#closeAll").addEventListener("click", () => { box.closeAll(); render(); });
$("#clearLog").addEventListener("click", () => { logEl.textContent = ""; });

function render() {
    const n = box.count;
    $("#status").className = "status" + (n ? " run" : "");
    $("#statusText").textContent = n + " open";

    //only what differs from the defaults needs setting
    const lines = [`<span class="k">const</span> box = <span class="k">new</span> MessageBox();`];
    for (const name in state) {
        if (state[name] === DEFAULTS[name]) continue;
        const v = typeof state[name] == "string" ? `<span class="s">"${state[name]}"</span>` : state[name];
        lines.push(`box.config.<span class="p">${name}</span> = ${v};`);
    }
    lines.push(`box.initialize();`, ``);
    const title = $("#title").value.trim();
    const text = esc($("#text").value);
    lines.push(title
        ? `box.show(<span class="s">"${text}"</span>, { title: <span class="s">"${esc(title)}"</span> });`
        : `box.show(<span class="s">"${text}"</span>);`);
    $("#snippet").innerHTML = lines.join("\n");
}
function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]); }
$("#title").addEventListener("input", render);
$("#text").addEventListener("input", render);
render();

/* ------------------------------------------------------------------ *
 * 3. Effect cards — per-call options override config for one message
 * ------------------------------------------------------------------ */

const EFFECT_TEXT = {
    drop: "Dropped in from above.",
    slideLeft: "Slid in from the right edge.",
    slideRight: "Slid in from the left edge.",
    fade: "Faded in where it sits.",
    none: "Simply there."
};
$$$("[data-try]").forEach(btn => btn.addEventListener("click", () => {
    const [effect, alignment] = btn.dataset.try.split(":");
    //The playground's config still supplies everything not named here.
    box.show(EFFECT_TEXT[effect], { effect, alignment, title: `${effect} · ${alignment}` });
    render();
}));

/* ------------------------------------------------------------------ *
 * 4. Handles
 * ------------------------------------------------------------------ */

$("#save").addEventListener("click", () => {
    //duration 0: no timer, no progress bar, and no close button either, because
    //this message must not be dismissed before the work it reports on is done.
    const saving = hero.show("Saving “Q3 report.docx”…", { duration: 0, closeButton: false });
    $("#save").disabled = true;

    fakeRequest(1800).then(() => {
        saving.close();     //the handle, not a timer, decides when it goes
        hero.success("All changes are stored.", { title: "Saved" });
        $("#save").disabled = false;
    });
});

let files = 3;
$("#del").addEventListener("click", () => {
    if (files == 0) files = 3;
    const removed = files;
    files = 0;
    $("#files").textContent = "0 files";

    //Content may be an element. It is moved into the message, so build a fresh one
    //per message, and wire it before posting: show() only lays it out.
    const row = document.createElement("div");
    row.className = "undo-row";
    const label = document.createElement("span");
    label.textContent = `${removed} files moved to the bin.`;
    const undo = document.createElement("button");
    undo.className = "undo-btn";
    undo.type = "button";
    undo.textContent = "Undo";
    row.append(label, undo);

    const handle = hero.warning(row, { duration: 6000 });
    undo.addEventListener("click", () => {
        files = removed;
        $("#files").textContent = files + " files";
        handle.close();
        hero.info(`${removed} files restored.`, { duration: 2500 });
    });
});

function fakeRequest(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/* ------------------------------------------------------------------ *
 * 5. Validation — every rejection is a synchronous throw
 * ------------------------------------------------------------------ */

const BAD = {
    align:    () => { box.config.alignment = "top"; },
    content:  () => { box.show(42); },
    option:   () => { box.show("a", { colour: "red" }); },
    duration: () => { box.config.duration = -1; },
    width:    () => { box.config.width = "wide"; },
    init:     () => { new MessageBox().show("never shown"); }
};
$$$("[data-bad]").forEach(btn => btn.addEventListener("click", () => {
    try {
        BAD[btn.dataset.bad]();
        $("#errOut").textContent = "No error thrown.";
    } catch (e) {
        $("#errOut").textContent = `${e.name}: ${e.message}`;
    }
}));
