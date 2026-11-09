/*
 * vUX Prompt: runnable example.
 *
 * One instance drives the hero and the playground; the real-flow cards use it
 * too, plus a second instance to show two askers sharing one queue.
 */
import { Prompt } from "../../vUX-prompt.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);

const ask = new Prompt();
ask.initialize();                       //nothing can be asked before this
window.ask = ask;

//How an answer reads in the log and the hero: strings quoted, so "" and null differ.
const show = v => v === undefined ? "undefined" : JSON.stringify(v);

/* ------------------------------------------------------------------ *
 * Hero: each kind once, and what it resolved with
 * ------------------------------------------------------------------ */

const HERO = {
    alert:   () => ask.alert("Your cards are ready to download.", { title: "All done" }),
    confirm: () => ask.confirm("Delete these cards from your account?", { title: "Delete cards", okText: "Delete", danger: true }),
    input:   () => ask.input("What should the guest list be called?", { title: "New list", placeholder: "e.g. Family" })
};

$$$("[data-hero]").forEach(btn => btn.addEventListener("click", async () => {
    //The call returns at once with a Promise; the page keeps running while the dialog is up.
    const answer = await HERO[btn.dataset.hero]();
    $("#heroAnswer").textContent = show(answer);
}));

/* ------------------------------------------------------------------ *
 * 01 Playground
 * ------------------------------------------------------------------ */

//config is write-only across vUX, so the page keeps its own copy of what it set
//(the "Equivalent code" panel is built from it).
const state = { theme: "light", okText: "OK", cancelText: "Cancel", width: 420, speed: 180, closeOnBackdrop: false, respectReducedMotion: true };
const DEFAULTS = { ...state };
let kind = "confirm";

function apply(name, value) {
    try {
        ask.config[name] = value;   //throws on a bad value, e.g. an empty okText
        state[name] = value;
    } catch (e) {
        log("config." + name + " refused: " + e.message);
    }
    render();
}

function segment(id, attr, onPick) {
    $$$("#" + id + " button").forEach(btn => btn.addEventListener("click", () => {
        $$$("#" + id + " button").forEach(b => b.classList.toggle("on", b === btn));
        onPick(btn.dataset[attr]);
    }));
}

segment("themeSeg", "theme", v => apply("theme", v));
segment("kindSeg", "kind", v => { kind = v; render(); });
$("#okText").addEventListener("input", e => apply("okText", e.target.value));
$("#cancelText").addEventListener("input", e => apply("cancelText", e.target.value));
$("#width").addEventListener("input", e => { $("#widthV").textContent = e.target.value + "px"; apply("width", Number(e.target.value)); });
$("#speed").addEventListener("input", e => { $("#speedV").textContent = e.target.value + "ms"; apply("speed", Number(e.target.value)); });
$$$("[data-flag]").forEach(box => box.addEventListener("change", () => apply(box.dataset.flag, box.checked)));
["#title", "#message", "#danger", "#required"].forEach(sel => $(sel).addEventListener("input", render));

function options() {
    const o = {};
    if ($("#title").value != "") o.title = $("#title").value;
    if ($("#danger").checked) o.danger = true;
    //required is an input() option; passed to confirm() it would throw "unknown option"
    if (kind == "input" && $("#required").checked) o.required = true;
    return o;
}

$("#ask").addEventListener("click", async () => {
    const opts = options();
    log(kind + "() opened");
    const answer = await ask[kind]($("#message").value, opts);
    log(kind + "() resolved with " + show(answer));
});

const logEl = $("#log");
function log(line) {
    const t = new Date().toLocaleTimeString([], { hour12: false });
    logEl.textContent += `${t}  ${line}\n`;
    logEl.scrollTop = logEl.scrollHeight;
}
$("#clearLog").addEventListener("click", () => { logEl.textContent = ""; });

function render() {
    const lines = ['<span class="k">const</span> ask = <span class="k">new</span> Prompt();'];
    for (const name in state) {
        if (state[name] === DEFAULTS[name]) continue;
        const v = typeof state[name] == "string" ? `<span class="s">"${esc(state[name])}"</span>` : `<span class="p">${state[name]}</span>`;
        lines.push(`ask.config.${name} = ${v};`);
    }
    lines.push("ask.initialize();", "");
    const o = options();
    const parts = Object.keys(o).map(k => `${k}: ` + (typeof o[k] == "string" ? `<span class="s">"${esc(o[k])}"</span>` : `<span class="p">${o[k]}</span>`));
    const arg2 = parts.length ? `, { ${parts.join(", ")} }` : "";
    lines.push(`<span class="k">const</span> answer = <span class="k">await</span> ask.${kind}(<span class="s">"${esc($("#message").value)}"</span>${arg2});`);
    $("#snippet").innerHTML = lines.join("\n");
}
function esc(s) { return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
render();

/* ------------------------------------------------------------------ *
 * 02 Real flows
 * ------------------------------------------------------------------ */

$("#delete").addEventListener("click", async () => {
    const files = $("#files");
    if (files.children.length == 0) return ask.alert("There is nothing left to delete.");
    const n = files.children.length;
    //danger: Cancel takes focus and OK turns red. The message is text, never markup, so a
    //file name with "<" in it is safe to put straight into it.
    const yes = await ask.confirm(`Delete ${n} file${n > 1 ? "s" : ""}? This cannot be undone.`,
        { title: "Delete files", okText: "Delete", danger: true });
    if (yes) files.textContent = "";
});

//Pretend server: "taken" is in use. validate() returns a message to refuse, nothing to accept,
//and may return a Promise, which the dialog waits on with OK disabled.
const fakeServerCheck = name => new Promise(res => setTimeout(() => res(name.trim().toLowerCase() == "taken" ? "That name is already in use" : ""), 600));

$("#rename").addEventListener("click", async () => {
    const current = $("#projectName").textContent;
    const name = await ask.input("Project name", {
        title: "Rename project", value: current, okText: "Rename",
        required: true, maxLength: 40, validate: fakeServerCheck
    });
    if (name !== null) $("#projectName").textContent = name.trim();   //null means cancelled
});

//A second instance: its own config, the same queue. The dark one asks while the first
//dialog is still up, and opens only after it closes.
const other = new Prompt();
other.config.theme = "dark";
other.initialize();

$("#queue").addEventListener("click", () => {
    ask.confirm("Save the card layout before leaving?", { title: "First question" })
        .then(a => log("first resolved with " + show(a)));
    other.alert("This one waited for the first to close.", { title: "Second question" })
        .then(() => log("second resolved"));
});

/* ------------------------------------------------------------------ *
 * 03 Bad input
 * ------------------------------------------------------------------ */

const BAD = {
    theme:   () => { ask.config.theme = "blue"; },
    message: () => ask.confirm(42),
    option:  () => ask.confirm("a", { value: "x" }),
    ok:      () => { ask.config.okText = ""; },
    type:    () => ask.input("a", { inputType: "date" }),
    init:    () => new Prompt().confirm("x")
};

$$$("[data-bad]").forEach(btn => btn.addEventListener("click", () => {
    const out = $("#errOut");
    try {
        BAD[btn.dataset.bad]();
        out.textContent = "No error thrown.";
    } catch (e) {
        out.textContent = `${e.name}: ${e.message}`;
    }
}));
