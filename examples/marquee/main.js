/*
 * vUX Marquee: runnable example.
 *
 * Every strip on this page is a plain container of items handed to `new Marquee(container)`.
 * The page never duplicates the items itself: Marquee clones them as many times as the width
 * needs, and again whenever the width or the items change.
 */
import { Marquee } from "../../vUX-marquee.js";

const $ = sel => document.querySelector(sel);

/* ------------------------------------------------------------------ *
 * Hero: two rows in opposite directions at different speeds
 * ------------------------------------------------------------------ */

const heroA = new Marquee($("#heroA"));
heroA.config.speed = 70;
heroA.config.gap = 56;
//the hero is decoration, so it keeps moving under the pointer
heroA.config.pauseOnHover = false;
heroA.initialize();

const heroB = new Marquee($("#heroB"));
heroB.config.speed = 50;
heroB.config.gap = 56;
heroB.config.direction = "right";
heroB.config.pauseOnHover = false;
heroB.initialize();

/* ------------------------------------------------------------------ *
 * 01 Playground
 * ------------------------------------------------------------------ */

const WORDS = ["layout", "motion", "data", "forms", "routing", "modals", "charts", "icons", "themes", "a11y"];
const strip = $("#playStrip");

//config properties are write-only (the vUX convention), so the page keeps its own copy to
//print the code panel and to rebuild after destroy()
const state = { speed: 60, gap: 16, fade: 80, direction: "left", pauseOnHover: true, respectReducedMotion: true };
let play = null, added = 0;

function fillStrip() {
    strip.textContent = "";
    for (const w of WORDS) strip.append(Object.assign(document.createElement("span"), { className: "pillx", textContent: w }));
}

function build() {
    play = new Marquee(strip);
    for (const key in state) play.config[key] = state[key];
    play.initialize();
    showState();
}

function showState() {
    const status = $("#status");
    let text;
    if (play == null) text = "destroyed: the items are back in the container as a plain list";
    else text = play.paused ? "paused (pause() was called)" : "moving";
    status.className = "status " + (play && !play.paused ? "run" : "");
    $("#statusText").textContent = text;
    $("#btnPause").textContent = play && play.paused ? "play()" : "pause()";
    $("#btnDestroy").textContent = play ? "destroy()" : "rebuild";

    $("#snippet").innerHTML =
        `<span class="k">const</span> m = <span class="k">new</span> Marquee(box);\n` +
        `m.config.speed = <span class="p">${state.speed}</span>;        <span class="c">// px per second</span>\n` +
        `m.config.gap = <span class="p">${state.gap}</span>;          <span class="c">// px between items</span>\n` +
        `m.config.fade = <span class="p">${state.fade}</span>;         <span class="c">// px of edge fade, 0 = none</span>\n` +
        `m.config.direction = <span class="s">"${state.direction}"</span>;\n` +
        `m.config.pauseOnHover = <span class="p">${state.pauseOnHover}</span>;\n` +
        `m.config.respectReducedMotion = <span class="p">${state.respectReducedMotion}</span>;\n` +
        `m.initialize();`;
}

function bindRange(id, key, unit) {
    $("#" + id).addEventListener("input", e => {
        state[key] = Number(e.target.value);
        $("#" + id + "Val").textContent = state[key] + " " + unit;
        //setters take effect on a running strip; speed and fade keep the loop's position
        if (play) play.config[key] = state[key];
        showState();
    });
}
bindRange("speed", "speed", "px/s");
bindRange("gap", "gap", "px");
bindRange("fade", "fade", "px");

$("#direction").addEventListener("change", e => {
    state.direction = e.target.value;
    if (play) play.config.direction = state.direction;
    showState();
});
$("#hover").addEventListener("change", e => {
    state.pauseOnHover = e.target.checked;
    if (play) play.config.pauseOnHover = state.pauseOnHover;
    showState();
});
$("#motion").addEventListener("change", e => {
    state.respectReducedMotion = e.target.checked;
    if (play) play.config.respectReducedMotion = state.respectReducedMotion;
    showState();
});

$("#btnPause").addEventListener("click", () => {
    if (!play) return;
    if (play.paused) play.play(); else play.pause();
    showState();
});

//New items go into the container, not the track: refresh() adopts them and re-clones
$("#btnAdd").addEventListener("click", () => {
    if (!play) return;
    added++;
    strip.append(Object.assign(document.createElement("span"), { className: "pillx new", textContent: "new " + added }));
    play.refresh();
});

$("#btnDestroy").addEventListener("click", () => {
    if (play) {
        play.destroy();
        play = null;
        showState();
    } else {
        //a destroyed instance throws from initialize(), so rebuilding means a new instance
        fillStrip();
        build();
    }
});

fillStrip();
build();

/* ------------------------------------------------------------------ *
 * 02 Cards with links
 * ------------------------------------------------------------------ */

const cards = new Marquee($("#cards"));
cards.config.speed = 35;
cards.config.gap = 18;
cards.config.fade = 60;
cards.initialize();

/* ------------------------------------------------------------------ *
 * 03 Bad input: each case runs a real call and prints what it throws
 * ------------------------------------------------------------------ */

const CASES = [
    ["Not an element", "new Marquee(\"#strip\")", () => new Marquee("#strip")],
    ["Empty container", "new Marquee(emptyDiv).initialize()", () => new Marquee(document.createElement("div")).initialize()],
    ["Speed of zero", "m.config.speed = 0", () => { new Marquee(document.createElement("div")).config.speed = 0; }],
    ["Speed as text", "m.config.speed = \"fast\"", () => { new Marquee(document.createElement("div")).config.speed = "fast"; }],
    ["Unknown direction", "m.config.direction = \"up\"", () => { new Marquee(document.createElement("div")).config.direction = "up"; }],
    ["Negative gap", "m.config.gap = -4", () => { new Marquee(document.createElement("div")).config.gap = -4; }],
    ["Fade as a string", "m.config.fade = \"40px\"", () => { new Marquee(document.createElement("div")).config.fade = "40px"; }],
    ["Refresh too early", "m.refresh()  // before initialize()", () => {
        const box = document.createElement("div");
        box.append(document.createElement("span"));
        new Marquee(box).refresh();
    }],
    ["Reuse after destroy", "m.destroy(); m.initialize()", () => {
        const box = document.createElement("div");
        box.append(document.createElement("span"));
        const m = new Marquee(box);
        m.destroy();
        m.initialize();
    }]
];

const errCards = $("#errCards"), errOut = $("#errOut");
for (const [title, code, run] of CASES) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3></h3><p><code></code></p><button class="tiny">Run</button>`;
    card.querySelector("h3").textContent = title;
    card.querySelector("code").textContent = code;
    card.querySelector("button").addEventListener("click", () => {
        try {
            run();
            errOut.textContent = `${code}\n\n(no error thrown)`;
        } catch (error) {
            errOut.textContent = `${code}\n\n${error.name}: ${error.message}`;
        }
    });
    errCards.append(card);
}
