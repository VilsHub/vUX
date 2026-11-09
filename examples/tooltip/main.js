/*
 * vUX ToolTip, runnable example.
 *
 * ToolTip is class-driven: you name a class, call initialize(), and every element with that
 * class and a `title` becomes a member. One shared tip box per class is appended to <body>.
 * This page runs six instances, one per class, to show that different classes stay
 * independent (own box, own colours, own generated stylesheet).
 *
 * Importing the module boots the vUX core, so $$ and the validateX helpers are globals
 * by the time this body runs.
 */
import { ToolTip } from "../../vUX-toolTip.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ------------------------------------------------------------------ *
 * Hero: a chart of 24 bars, each a member of class "tip-bar"
 * ------------------------------------------------------------------ */

const HOURLY = [212, 168, 121, 96, 88, 104, 240, 512, 940, 1284, 1190, 1096,
                1322, 1418, 1210, 1046, 1002, 1124, 980, 812, 640, 498, 364, 270];
const MAX = Math.max(...HOURLY);
const PEAKS = new Set([9, 12, 13]);
const pad = (n) => String(n).padStart(2, "0");

//The bars are built BEFORE initialize(), so initialize() adopts them in one pass. Each
//bar holds a child (.cap): hovering the child still shows the bar's tip, because the
//module looks for the closest member of the event target.
const bars = $("#bars");
HOURLY.forEach((count, h) => {
    const bar = document.createElement("div");
    bar.className = "bar tip-bar" + (PEAKS.has(h) ? " peak" : "");
    bar.style.height = Math.max(4, Math.round(count / MAX * 100)) + "%";
    //the tip text is just the title attribute: plain text, exactly like a native title
    bar.title = pad(h) + ":00 to " + pad((h + 1) % 24) + ":00, " + count.toLocaleString("en-US") +
        " requests" + (PEAKS.has(h) ? " (peak)" : "");
    bar.dataset.hour = h;
    bar.appendChild(Object.assign(document.createElement("span"), { className: "cap" }));
    bars.appendChild(bar);
});

const barTip = new ToolTip();
barTip.config.className = "tip-bar";
//all three keys are optional; arrowColor is left out, so the arrow takes the background
barTip.config.tipBoxStyles = { backgroundColor: "#ffb454", fontColor: "#20160a" };
barTip.initialize();

//The module has no events, so the readout listens on the bars itself
bars.addEventListener("mouseover", (e) => {
    const bar = e.target.closest(".bar");
    if (!bar) return;
    const h = Number(bar.dataset.hour);
    $("#chartReadout").innerHTML = "<b>" + pad(h) + ":00</b> " + HOURLY[h].toLocaleString("en-US") + " req";
});

//A second instance on another class: its own box and its own colours. The editor bar
//sits at the top of the window, so these tips flip below the pointer.
const toolTip = new ToolTip();
toolTip.config.className = "tip-tool";
toolTip.config.tipBoxStyles = { backgroundColor: "#f2f5f9", fontColor: "#0b0f16" };
toolTip.initialize();

/* ------------------------------------------------------------------ *
 * 01 Playground: class "tip-play"
 * ------------------------------------------------------------------ */

const playTip = new ToolTip();
playTip.config.className = "tip-play";
playTip.config.tipBoxStyles = { backgroundColor: "#c8a2ff", fontColor: "#140d22" };
playTip.initialize();

const stage = $("#stage");
const ui = {
    bg: $("#bg"), arrow: $("#arrow"), font: $("#font"), arrowSame: $("#arrowSame"),
    html: $("#html"), members: $("#members"), count: $("#memberCount"),
    newTitle: $("#newTitle"), snippet: $("#snippet"), attr: $("#attr"),
    statusBox: $("#status"), statusText: $("#statusText")
};

//config is write-only across vUX, so the page keeps its own copy for the code panel
const state = { styles: { backgroundColor: "#c8a2ff", fontColor: "#140d22" }, html: false };

function applyStyles() {
    const styles = { backgroundColor: ui.bg.value, fontColor: ui.font.value };
    //leaving arrowColor out (rather than passing "") is what makes the arrow follow the background
    if (!ui.arrowSame.checked) styles.arrowColor = ui.arrow.value;
    ui.arrow.disabled = ui.arrowSame.checked;
    //tipBoxStyles REPLACES the whole set each time, and after initialize() it applies at once:
    //the generated <style data-id="toolTipStyles-tip-play"> is rebuilt
    playTip.config.tipBoxStyles = styles;
    state.styles = styles;
    renderSnippet();
}
[ui.bg, ui.arrow, ui.font].forEach((input) => input.addEventListener("input", applyStyles));
ui.arrowSame.addEventListener("change", applyStyles);

ui.html.addEventListener("change", () => {
    //Chip 03's title holds markup. With html off it is shown as the literal characters;
    //with html on it is parsed. Only turn this on when every title is yours: a title built
    //from user input would be an injection point.
    playTip.config.html = ui.html.checked;
    state.html = ui.html.checked;
    renderSnippet();
});

//The member list: one row per chip, with an on()/off() toggle.
//off() gives the title back (so the native tooltip returns) and on() adopts it again.
function chipName(chip) {
    //"01" + "Plain" -> "01 Plain": the number lives in its own .k child
    const k = chip.querySelector(".k");
    return k ? k.textContent + " " + chip.textContent.slice(k.textContent.length).trim() : chip.textContent.trim();
}
function renderMembers() {
    const chips = $all(".chip", stage);
    ui.members.innerHTML = "";
    let on = 0;
    chips.forEach((chip) => {
        const isOn = chip.getAttribute("data-vToolTipSwitch") === "ON";
        if (isOn) on++;
        chip.classList.toggle("is-off", !isOn);
        const row = document.createElement("div");
        row.className = "member-row";
        row.innerHTML = '<span class="nm"></span><span class="ctl"><span class="st"></span><button class="tiny ghost"></button></span>';
        $(".nm", row).textContent = chipName(chip);
        $(".st", row).textContent = isOn ? "ON" : "OFF";
        $(".st", row).className = "st " + (isOn ? "on" : "off");
        const btn = $("button", row);
        btn.textContent = isOn ? "off()" : "on()";
        btn.addEventListener("click", () => {
            if (isOn) playTip.off(chip); else playTip.on(chip);
            renderMembers();
        });
        ui.members.appendChild(row);
    });
    ui.count.textContent = on + " / " + chips.length + " on";
}

//refresh() is the call that makes runtime changes visible to the module. It adopts new
//elements with the class and a title, and re-reads a title set again on an existing member.
let added = 0;
$("#addChip").addEventListener("click", () => {
    added++;
    const chip = document.createElement("span");
    chip.className = "chip is-new tip-play";
    chip.title = "Added at runtime (#" + added + "), adopted by refresh()";
    chip.innerHTML = '<span class="k">+' + added + "</span>Runtime";
    stage.appendChild(chip);
    playTip.refresh();
    renderMembers();
});

$("#retitle").addEventListener("click", () => {
    const first = $(".chip", stage);
    //Changing the tip text means setting the title attribute again: the module moved the
    //old one to data-tempTitle, and refresh() moves the new one across in the same way.
    first.setAttribute("title", ui.newTitle.value);
    playTip.refresh();
    renderAttr();
});

//The live markup of the first chip, so you can watch title move to data-tempTitle,
//aria-describedby come and go, and off() hand the title back.
function renderAttr() {
    const first = $(".chip", stage);
    const parts = Array.from(first.attributes).map((a) =>
        '<span class="a">' + a.name + '</span>="<span class="v">' + escapeHtml(a.value) + '</span>"');
    ui.attr.innerHTML = "&lt;span\n  " + parts.join("\n  ") + "&gt;";
}
function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function renderSnippet() {
    const styleLines = Object.entries(state.styles)
        .map(([k, v]) => '    <span class="p">' + k + '</span>: <span class="s">"' + v + '"</span>').join(",\n");
    ui.snippet.innerHTML =
        '<span class="k">const</span> tip = <span class="k">new</span> ToolTip();\n' +
        'tip.config.className = <span class="s">"tip-play"</span>;\n' +
        "tip.config.tipBoxStyles = {\n" + styleLines + "\n};\n" +
        "tip.config.html = " + state.html + ";" +
        (state.html ? '  <span class="c">// trusted titles only</span>' : "") + "\n" +
        "tip.initialize();";
}

//Which member is showing a tip? The module sets aria-describedby on it, so one observer
//over the page drives both the playground status line and the keyboard pill.
function syncShown() {
    const shown = $('[aria-describedby="vToolTip-tip-play"]');
    ui.statusBox.className = "status" + (shown ? " run" : "");
    ui.statusText.textContent = shown ? "showing: " + chipName(shown) : "no tip showing";
    const key = $('[aria-describedby="vToolTip-tip-key"]');
    $("#describedBy").textContent = "aria-describedby: " + (key ? key.getAttribute("aria-describedby") : "none");
    $("#describedBy").classList.toggle("on", !!key);
    renderAttr();
}
new MutationObserver(syncShown).observe(document.body, {
    subtree: true, attributes: true, attributeFilter: ["aria-describedby", "title", "data-vtooltipswitch"]
});

renderMembers();
renderSnippet();
syncShown();

/* ------------------------------------------------------------------ *
 * 02 Keyboard: class "tip-key"
 * ------------------------------------------------------------------ */

const keyTip = new ToolTip();
keyTip.config.className = "tip-key";
keyTip.config.tipBoxStyles = { backgroundColor: "#5ccfe6", fontColor: "#06161b" };
keyTip.initialize();

$("#focusFirst").addEventListener("click", () => {
    //A focus-opened tip follows its member on scroll. A pointer-opened tip would hide.
    const first = $(".key");
    first.focus();
    setTimeout(() => window.scrollBy({ top: 140, behavior: "smooth" }), 250);
});

/* ------------------------------------------------------------------ *
 * 03 Edges: class "tip-edge"
 * ------------------------------------------------------------------ */

const edgeTip = new ToolTip();
edgeTip.config.className = "tip-edge";
//arrowColor set on its own: a contrasting arrow makes it easy to see it tracking the pointer
edgeTip.config.tipBoxStyles = { backgroundColor: "#a7e05f", arrowColor: "#ff6b7f", fontColor: "#0f1a05" };
edgeTip.initialize();

/* ------------------------------------------------------------------ *
 * 04 Lifecycle: class "tip-life"
 * ------------------------------------------------------------------ */

let lifeTip = null;
function createLife() {
    lifeTip = new ToolTip();
    lifeTip.config.className = "tip-life";
    lifeTip.config.tipBoxStyles = { backgroundColor: "#ff6b7f", fontColor: "#1d070b" };
    lifeTip.initialize();
    window.lifeTip = lifeTip;
}
function renderLife(label) {
    const chips = $all(".tip-life");
    const lines = chips.map((c) =>
        chipName(c) + "\n  title=" + JSON.stringify(c.getAttribute("title")) +
        "\n  data-temptitle=" + JSON.stringify(c.getAttribute("data-tempTitle")));
    lines.push("tip box in <body>: " + ($('.vToolTip[data-tooltipid="tip-life"]') ? "yes" : "no"));
    lines.push("generated <style>: " + ($('style[data-id="toolTipStyles-tip-life"]') ? "yes" : "no"));
    $("#lifeAttr").textContent = lines.join("\n");
    $("#lifeState").textContent = label;
    $("#lifeState").classList.toggle("on", label === "initialized");
    $("#destroy").disabled = label !== "initialized";
    $("#recreate").disabled = label === "initialized";
}
createLife();
renderLife("initialized");

$("#destroy").addEventListener("click", () => {
    lifeTip.destroy();
    renderLife("destroyed");
});
$("#recreate").addEventListener("click", () => {
    //initialize() on the destroyed instance would throw, so a fresh one is made
    createLife();
    renderLife("initialized");
});

/* ------------------------------------------------------------------ *
 * 05 Bad input: each case throws, and nothing changes
 * ------------------------------------------------------------------ */

const BAD = {
    key:       () => { playTip.config.tipBoxStyles = { borderColor: "red" }; },
    many:      () => { playTip.config.tipBoxStyles = { backgroundColor: "#000", arrowColor: "#000", fontColor: "#fff", padding: "4px" }; },
    nonstring: () => { playTip.config.tipBoxStyles = { backgroundColor: 5 }; },
    offNon:    () => { playTip.off(document.createElement("div")); },
    onNoTitle: () => { playTip.on(document.createElement("div")); },
    onEarly:   () => {
        const el = document.createElement("span");
        el.title = "has a title";
        new ToolTip().on(el);
    },
    className: () => { playTip.config.className = "something-else"; },
    html:      () => { playTip.config.html = "yes"; },
    noClass:   () => { new ToolTip().initialize(); }
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
Object.assign(window, { barTip, toolTip, playTip, keyTip, edgeTip });
