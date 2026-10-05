/*
 * vUX ListScroller — runnable example.
 *
 * Every scroller here follows the same steps: new ListScroller(container, list), set .config,
 * initialize(), then onScroller(). The container is the viewport, the list is the row, and the
 * two buttons are the page's own elements: ListScroller never creates or styles them beyond
 * toggling the inactive class, the cursor and aria-disabled.
 */
import { ListScroller } from "../../vUX-listScroller.js";

const $ = (sel, root = document) => root.querySelector(sel);

const GRADIENTS = ["g1", "g2", "g3", "g4", "g5", "g6"];
const NAMES = ["Arc", "Bloom", "Cinder", "Drift", "Ember", "Flare", "Grove", "Haze", "Iris", "Jade", "Koi", "Lumen",
    "Moss", "Nova", "Opal", "Pine", "Quartz", "Rift", "Slate", "Tide"];

function tile(index, className = "tile") {
    const li = document.createElement("li");
    li.className = className + " " + GRADIENTS[index % GRADIENTS.length];
    li.innerHTML = `<span class="n">${String(index + 1).padStart(2, "0")}</span><span class="t">${NAMES[index % NAMES.length]}</span>`;
    return li;
}

/* ------------------------------------------------------------------ *
 * 1. Hero
 * ------------------------------------------------------------------ */

const heroBox = $("#heroBox");
const hero = new ListScroller(heroBox, $("#heroList"));
hero.config.buttons = [$("#heroPrev"), $("#heroNext")];   //[left, right], always in that order
hero.config.inactiveButtonClassName = "is-off";           //required: initialize() throws without it
//One step = one tile plus its gap, measured rather than hard-coded because the tiles shrink on
//phones. scrollSize is read on every press, so re-setting it on resize is enough.
function tileStep() {
    const first = $("#heroList").firstElementChild;
    return first.getBoundingClientRect().width + parseFloat(getComputedStyle(first).marginRight);
}
hero.config.scrollSize = tileStep();
addEventListener("resize", () => hero.config.scrollSize = tileStep());
hero.config.scrollSpeed = 420;
hero.initialize();
//initialize() lays the row out; onScroller() is what arms the buttons. Until then both stay inactive.
hero.onScroller();
window.heroScroller = hero;

//The position readout is the page's own: ListScroller has no events, so listen to the container
const heroPos = $("#heroPos");
function showHeroPos() {
    const max = heroBox.scrollWidth - heroBox.clientWidth;
    heroPos.innerHTML = `<b>${Math.round(heroBox.scrollLeft)}</b> / ${max} px`;
}
heroBox.addEventListener("scroll", showHeroPos);
new ResizeObserver(showHeroPos).observe(heroBox);

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const playBox = $("#playBox"), playList = $("#playList"), playPrev = $("#playPrev"), playNext = $("#playNext");
for (let x = 0; x < 10; x++) playList.append(tile(x));

const settings = {
    scrollSize: 166, scrollSpeed: 290, paddingLeft: 0, paddingRight: 0,
    wrapperStyle: "width:100%", inactiveButtonClassName: "is-off", hasButtons: true, listening: true
};
let play = null;

function buildPlay() {
    play = new ListScroller(playBox, playList);
    play.config.buttons = [playPrev, playNext];
    for (const key of ["scrollSize", "scrollSpeed", "paddingLeft", "paddingRight", "wrapperStyle", "inactiveButtonClassName", "hasButtons"]) {
        play.config[key] = settings[key];
    }
    play.initialize();
    if (settings.listening) play.onScroller();
    window.playScroller = play;
    setStatus(true, settings.listening ? "initialize(); onScroller();" : "initialize(); (not listening)");
}

function setStatus(running, text) {
    $("#playStatus").className = "status" + (running ? " run" : "");
    $("#playStatusText").textContent = text;
    $("#stageNote").textContent = running ? (settings.listening ? "running" : "parked") : "destroyed";
}

//Live config: each control writes straight to play.config. No rebuild needed for any of them.
function bindRange(id, key, out) {
    const input = $(id);
    input.addEventListener("input", () => {
        settings[key] = Number(input.value);
        $(out).textContent = input.value + (key == "scrollSpeed" ? "ms" : "px");
        if (play) play.config[key] = settings[key];
        renderCode();
    });
}
bindRange("#cSize", "scrollSize", "#vSize");
bindRange("#cSpeed", "scrollSpeed", "#vSpeed");
bindRange("#cPadL", "paddingLeft", "#vPadL");
bindRange("#cPadR", "paddingRight", "#vPadR");

$("#cWrap").addEventListener("change", e => {
    settings.wrapperStyle = e.target.value;
    //Merged into the container's own inline style; destroy() removes exactly these properties again
    if (play) play.config.wrapperStyle = settings.wrapperStyle;
    renderCode();
});

$("#cInactive").addEventListener("change", e => {
    settings.inactiveButtonClassName = e.target.value;
    if (play) play.config.inactiveButtonClassName = settings.inactiveButtonClassName;
    renderCode();
});

$("#cButtons").addEventListener("change", e => {
    settings.hasButtons = e.target.checked;
    //Off: the buttons are released (class, cursor and listener removed) and do nothing.
    //The row still scrolls by touch and trackpad.
    if (play) play.config.hasButtons = settings.hasButtons;
    renderCode();
});

$("#cListen").addEventListener("change", e => {
    settings.listening = e.target.checked;
    if (play) settings.listening ? play.onScroller() : play.offScroller();
    $("#pillListen").classList.toggle("on", settings.listening);
    $("#pillListen").textContent = settings.listening ? "listening" : "parked";
    if (play) setStatus(true, settings.listening ? "onScroller();" : "offScroller();  // both buttons inactive");
    renderCode();
});
$("#pillListen").classList.add("on");

//Items can come and go at any time: the row's width is its content, and ListScroller watches it
$("#addItem").addEventListener("click", () => playList.append(tile(playList.children.length)));
$("#removeItem").addEventListener("click", () => playList.lastElementChild && playList.lastElementChild.remove());

$("#destroyPlay").addEventListener("click", () => {
    if (!play) return;
    play.destroy();   //listeners, classes and inline styles go; the list is a plain <ul> again
    play = null;
    window.playScroller = null;
    setStatus(false, "destroy();  // the list is an ordinary <ul> again");
});
$("#rebuildPlay").addEventListener("click", () => {
    //A destroyed instance refuses initialize(), so a rebuild is always a new ListScroller
    if (play) play.destroy();
    buildPlay();
});

//Readout: read straight off the DOM, the same signals a consumer would have
function readout() {
    const max = playBox.scrollWidth - playBox.clientWidth;
    $("#rPos").textContent = Math.round(playBox.scrollLeft);
    $("#rMax").textContent = max;
    for (const [id, button] of [["#rLeft", playPrev], ["#rRight", playNext]]) {
        const cell = $(id);
        if (!play || !settings.hasButtons) {
            cell.textContent = "released";
            cell.className = "";
        } else {
            const inactive = button.classList.contains(settings.inactiveButtonClassName);
            cell.textContent = inactive ? "inactive" : "active";
            cell.className = inactive ? "off" : "on";
        }
    }
}
playBox.addEventListener("scroll", readout);
new ResizeObserver(readout).observe(playList);
new MutationObserver(readout).observe(playPrev, { attributes: true, attributeFilter: ["class"] });
new MutationObserver(readout).observe(playNext, { attributes: true, attributeFilter: ["class"] });

function renderCode() {
    const s = settings;
    const k = t => `<span class="k">${t}</span>`, str = t => `<span class="s">"${t}"</span>`, p = t => `<span class="p">${t}</span>`;
    const lines = [
        `${k("const")} ls = ${k("new")} ListScroller(box, list);`,
        s.hasButtons
            ? `ls.config.${p("buttons")} = [prev, next];\nls.config.${p("inactiveButtonClassName")} = ${str(s.inactiveButtonClassName)};`
            : `ls.config.${p("hasButtons")} = ${k("false")};`,
        `ls.config.${p("scrollSize")} = ${s.scrollSize};`,
        `ls.config.${p("scrollSpeed")} = ${s.scrollSpeed};${s.scrollSpeed == 0 ? ` <span class="c">// jump, no animation</span>` : ""}`
    ];
    if (s.paddingLeft) lines.push(`ls.config.${p("paddingLeft")} = ${s.paddingLeft};`);
    if (s.paddingRight) lines.push(`ls.config.${p("paddingRight")} = ${s.paddingRight};`);
    if (s.wrapperStyle != "width:100%") lines.push(`ls.config.${p("wrapperStyle")} = ${str(s.wrapperStyle)};`);
    lines.push(`ls.initialize();`);
    lines.push(s.listening ? `ls.onScroller();` : `<span class="c">// ls.onScroller() not called: buttons parked</span>`);
    $("#code").innerHTML = lines.join("\n");
}

buildPlay();
renderCode();
readout();

/* ------------------------------------------------------------------ *
 * 3. The buttons follow the list
 * ------------------------------------------------------------------ */

const fBox = $("#fBox"), fList = $("#fList"), fPrev = $("#fPrev"), fNext = $("#fNext");
for (let x = 0; x < 6; x++) fList.append(tile(x, "chip-tile"));

const follow = new ListScroller(fBox, fList);
follow.config.buttons = [fPrev, fNext];
follow.config.inactiveButtonClassName = "is-off";
follow.config.scrollSize = 130;
follow.initialize();
follow.onScroller();
window.followScroller = follow;

//A log of every button state change, whatever caused it: a press, a swipe, the frame being
//resized or items arriving. Watching the class is all a consumer needs to react to the state.
const fLog = $("#fLog");
let lastState = "";
let cause = "start";
function logState() {
    const state = `left ${fPrev.classList.contains("is-off") ? "off" : "on "}  right ${fNext.classList.contains("is-off") ? "off" : "on "}`;
    if (state == lastState) return;
    lastState = state;
    fLog.textContent += `${state}   ← ${cause}\n`;
    fLog.scrollTop = fLog.scrollHeight;
}
new MutationObserver(logState).observe(fPrev, { attributes: true, attributeFilter: ["class"] });
new MutationObserver(logState).observe(fNext, { attributes: true, attributeFilter: ["class"] });
fPrev.addEventListener("click", () => cause = "left press");
fNext.addEventListener("click", () => cause = "right press");
fBox.addEventListener("wheel", () => cause = "wheel / trackpad", { passive: true });
fBox.addEventListener("touchstart", () => cause = "swipe", { passive: true });
logState();

const frame = $("#frame");
new ResizeObserver(() => {
    cause = "frame resized";
    $("#fStatusText").textContent = `frame ${Math.round(frame.getBoundingClientRect().width)}px, row ${fBox.scrollWidth}px`;
}).observe(frame);

$("#fAdd").addEventListener("click", () => {
    cause = "items added";
    for (let x = 0; x < 3; x++) fList.append(tile(fList.children.length, "chip-tile"));
});

/* ------------------------------------------------------------------ *
 * 4. No buttons
 * ------------------------------------------------------------------ */

const FILTERS = [["All", 248], ["Layout", 31], ["Forms", 44], ["Motion", 19], ["Data", 27], ["Navigation", 22],
    ["Feedback", 16], ["Overlays", 12], ["Media", 9], ["Charts", 14], ["Touch", 8], ["Text", 21], ["Utilities", 25]];
const chipList = $("#chipList");
for (const [name, count] of FILTERS) {
    const li = document.createElement("li");
    li.className = "chip";
    li.innerHTML = `<b>${name}</b> ${count}`;
    chipList.append(li);
}
const chips = new ListScroller($("#chipBox"), chipList);
chips.config.hasButtons = false;   //no buttons, so no inactiveButtonClassName either
chips.initialize();
window.chipScroller = chips;

/* ------------------------------------------------------------------ *
 * 5. Bad input
 * ------------------------------------------------------------------ */

//Each case runs against throwaway elements, so nothing on the page is touched
function scratch() {
    const box = document.createElement("div");
    const list = document.createElement("ul");
    box.append(list);
    return { box, list, ls: new ListScroller(box, list) };
}
const btn = () => document.createElement("button");

const MISTAKES = [
    ["Selector instead of element", "new ListScroller(\"#box\", list)", () => new ListScroller("#box", document.createElement("ul"))],
    ["List outside the container", "new ListScroller(box, otherList)", () => new ListScroller(document.createElement("div"), document.createElement("ul"))],
    ["One button", "config.buttons = [prev]", () => { scratch().ls.config.buttons = [btn()]; }],
    ["The same button twice", "config.buttons = [b, b]", () => { const b = btn(); scratch().ls.config.buttons = [b, b]; }],
    ["A zero step", "config.scrollSize = 0", () => { scratch().ls.config.scrollSize = 0; }],
    ["Negative speed", "config.scrollSpeed = -100", () => { scratch().ls.config.scrollSpeed = -100; }],
    ["Two class names", "config.inactiveButtonClassName = \"is off\"", () => { scratch().ls.config.inactiveButtonClassName = "is off"; }],
    ["A string for a boolean", "config.hasButtons = \"no\"", () => { scratch().ls.config.hasButtons = "no"; }],
    ["Buttons never given", "initialize()  // no config.buttons", () => {
        const { ls } = scratch();
        ls.config.inactiveButtonClassName = "is-off";
        ls.initialize();
    }]
];

const errCards = $("#errCards"), errOut = $("#errOut");
for (const [title, code, run] of MISTAKES) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${title}</h3><p><code></code></p>`;
    card.querySelector("code").textContent = code;
    const button = document.createElement("button");
    button.className = "tiny";
    button.textContent = "Try it";
    button.addEventListener("click", () => {
        try {
            run();
            errOut.textContent = `${code}\n\n(no error thrown)`;
        } catch (error) {
            errOut.textContent = `${code}\n\n${error.name}: ${error.message}`;
        }
    });
    card.append(button);
    errCards.append(card);
}
