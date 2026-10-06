/*
 * vUX TimeLineList — runnable example.
 *
 * Every timeline here follows the same three steps: new TimeLineList(), set .config, autoBuild().
 * config.className picks the lists; config.dataAttributes names the attributes each list carries
 * its own styles in. Nothing is styled through JavaScript: the attributes ARE the API.
 */
import { TimeLineList } from "../../vUX-timeLineList.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);

//One attribute map shared by every instance on the page. The keys are fixed by vUX; the values
//are whatever attribute names you choose to put on your lists.
const ATTRIBUTES = {
    timeLineBorderStyle: "data-rail",   //CSS for the <ul> itself: the rail is its border-left
    listStyle: "data-item",             //CSS for every <li>
    listIconStyle: "data-marker",       //CSS for li::before, the dot on the rail
    timeLineLabel: "data-label-style",  //CSS for li::after, the label (its TEXT comes from each li's data-label)
    smallView: "data-small"             //window width in px at or below which the labels stack
};
//The label's TEXT is not configurable: timeLineList.css reads it from each <li>'s data-label
//with content: attr(data-label). Only the attribute holding the label's CSS is yours to name.

function makeTimeline(className) {
    const tl = new TimeLineList();
    tl.config.dataAttributes = ATTRIBUTES;
    tl.config.className = className;
    tl.autoBuild();
    return tl;
}

/* ------------------------------------------------------------------ *
 * 1. Hero and the gallery: build once, never touched again
 * ------------------------------------------------------------------ */

window.heroTimeline = makeTimeline("history");

//Three lists, one instance: each list's attributes become rules scoped to a class generated for
//that list alone, so the three looks never mix.
window.boardTimeline = makeTimeline("board");

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const PRESETS = {
    amber: {
        rail: "border-left:2px solid #ffb454",
        item: "margin-bottom:22px",
        marker: "width:12px;height:12px;left:-30px;top:6px;background:#ffb454;box-shadow:0 0 12px rgba(255,180,84,.8)",
        label: "color:#ffb454;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.78rem;top:2px"
    },
    rail: {
        rail: "border-left:6px solid #1f6fb5;border-radius:3px;padding-left:30px",
        item: "margin-bottom:20px;padding:10px 14px;background:#141c2a;border:1px solid #1f2a3a;border-radius:8px",
        marker: "width:14px;height:14px;left:-40px;top:14px;background:#5ccfe6;border:3px solid #080b11",
        label: "color:#5ccfe6;font-weight:700;top:12px;left:-146px"
    },
    minimal: {
        rail: "border-left:1px solid #4d5b71",
        item: "margin-bottom:16px",
        marker: "width:7px;height:7px;left:-27px;top:9px;background:#d7e0ec",
        label: "color:#7b8ba3;font-size:.75rem;top:3px"
    }
};

const ENTRIES = [
    ["Mon", "Kick-off", "Goals agreed."],
    ["Wed", "First draft", "Shared for review."],
    ["Fri", "Review", "Two rounds of notes."],
    ["Tue", "Final", "Signed off."]
];
let extra = 0;

const ui = {
    rail: $("#aRail"), item: $("#aItem"), marker: $("#aMarker"), label: $("#aLabel"),
    small: $("#aSmall"), smallV: $("#aSmallV"), preset: $("#preset"),
    stage: $("#stage"), status: $("#status"), statusText: $("#statusText"), playLabel: $("#playLabel"),
    snippet: $("#snippet")
};

let playTimeline = null, instanceNo = 0, destroyed = false;

function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function setStatus(cls, text) {
    ui.status.className = "status" + (cls ? " " + cls : "");
    ui.statusText.textContent = text;
}

//The list is rendered afresh on every rebuild: its attributes are what the textareas say. The
//class "playList" is what config.className selects. Pick a class used by nothing else: autoBuild()
//takes EVERY element carrying it, so a layout class shared with a wrapper <div> turns the wrapper
//into a timeline too.
function renderList() {
    const items = ENTRIES.concat(Array.from({ length: extra }, (_, i) => ["+" + (i + 1), "Added entry", "Appended after the build."]));
    ui.stage.innerHTML =
        `<ul class="playList" data-rail="${esc(ui.rail.value)}" data-item="${esc(ui.item.value)}"` +
        ` data-marker="${esc(ui.marker.value)}" data-label-style="${esc(ui.label.value)}" data-small="${ui.small.value}">` +
        items.map(([lbl, t, d]) => `<li class="tl-entry" data-label="${esc(lbl)}"><span class="t">${esc(t)}</span><span class="d">${esc(d)}</span></li>`).join("") +
        `</ul>`;
}

//Styles are baked into a generated stylesheet when a list is built, so a style change means a
//rebuild. destroy() first: it removes the old instance's stylesheet and resize listener, and
//strips its marker classes, so the new instance starts from clean markup.
function rebuild() {
    if (playTimeline) playTimeline.destroy();
    renderList();
    try {
        playTimeline = makeTimeline("playList");
        destroyed = false;
        window.playTimeline = playTimeline;
        $("#roInst").textContent = "#" + (++instanceNo);
        setStatus("run", "built — styles read from the list's attributes");
    } catch (error) {
        setStatus("err", error.message);
    }
    ui.playLabel.textContent = "built";
    readout();
    renderSnippet();
}

function readout() {
    $("#roWidth").textContent = innerWidth + "px";
    const ul = $("ul.playList", ui.stage);
    $("#roLayout").textContent = !ul || !ul.classList.contains("vtimeLine") ? "plain list" : ul.classList.contains("wrap") ? "stacked" : "label column";
}

function renderSnippet() {
    const attr = (name, v) => `\n    <span class="p">${name}</span>=<span class="s">"${esc(v)}"</span>`;
    ui.snippet.innerHTML =
        `<span class="c">&lt;!-- the list carries its own styles --&gt;</span>\n` +
        `&lt;ul class=<span class="s">"playList"</span>` +
        attr("data-rail", ui.rail.value) + attr("data-item", ui.item.value) +
        attr("data-marker", ui.marker.value) + attr("data-label-style", ui.label.value) +
        attr("data-small", ui.small.value) + `&gt;\n` +
        `    &lt;li <span class="p">data-label</span>=<span class="s">"Mon"</span>&gt;Kick-off&lt;/li&gt; …\n&lt;/ul&gt;\n\n` +
        `<span class="k">const</span> tl = <span class="k">new</span> TimeLineList();\n` +
        `tl.config.dataAttributes = {\n` +
        `    timeLineBorderStyle: <span class="s">"data-rail"</span>, listStyle: <span class="s">"data-item"</span>,\n` +
        `    listIconStyle: <span class="s">"data-marker"</span>, timeLineLabel: <span class="s">"data-label-style"</span>,\n` +
        `    smallView: <span class="s">"data-small"</span>\n};\n` +
        `tl.config.className = <span class="s">"playList"</span>;\n` +
        `tl.autoBuild();`;
}

function loadPreset(name) {
    const p = PRESETS[name];
    ui.rail.value = p.rail; ui.item.value = p.item; ui.marker.value = p.marker; ui.label.value = p.label;
}

let typingTimer = null;
[ui.rail, ui.item, ui.marker, ui.label].forEach(box => box.addEventListener("input", () => {
    //Debounced: a rebuild per keystroke would also rebuild on every half-typed declaration
    clearTimeout(typingTimer);
    typingTimer = setTimeout(rebuild, 250);
}));

ui.preset.addEventListener("change", () => { loadPreset(ui.preset.value); rebuild(); });

//smallView is NOT baked in: the threshold attribute is re-read on every window resize. So the
//slider only edits the attribute and then fires a resize event to make the module re-evaluate,
//which is exactly what a real window resize would do.
ui.small.addEventListener("input", () => {
    ui.smallV.textContent = ui.small.value + "px";
    const ul = $("ul.playList", ui.stage);
    if (ul) ul.setAttribute("data-small", ui.small.value);
    dispatchEvent(new Event("resize"));
    //Read the layout after the module's own resize listener has run. The page's readout listener
    //was bound before this instance was built, so on the event itself it fires first and sees the
    //old layout.
    readout();
    renderSnippet();
});

addEventListener("resize", readout);

$("#rebuild").addEventListener("click", rebuild);

$("#destroy").addEventListener("click", () => {
    if (!playTimeline || destroyed) return;
    playTimeline.destroy();
    destroyed = true;
    ui.playLabel.textContent = "destroyed";
    setStatus("", "destroyed — the list is back to plain markup; Rebuild makes a new instance");
    readout();
});

//An <li> appended to a list that is already built is styled at once: every rule is scoped to
//the list's class, not to particular items. No refresh() needed.
$("#addItem").addEventListener("click", () => {
    extra++;
    const ul = $("ul.playList", ui.stage);
    if (!ul) return;
    const li = document.createElement("li");
    li.className = "tl-entry";
    li.setAttribute("data-label", "+" + extra);
    li.innerHTML = `<span class="t">Added entry</span><span class="d">Appended after the build.</span>`;
    ul.append(li);
});

//Open on a threshold just above the current window, so the stacked layout is one slider nudge away
ui.small.value = Math.min(2000, Math.ceil((innerWidth - 100) / 20) * 20);
ui.smallV.textContent = ui.small.value + "px";
loadPreset("amber");
rebuild();

/* ------------------------------------------------------------------ *
 * 3. Lists that arrive later
 * ------------------------------------------------------------------ */

const feed = $("#feed");
const feedTimeline = makeTimeline("feedList");
window.feedTimeline = feedTimeline;
const FEED_COLOURS = ["#a7e05f", "#c8a2ff", "#ffb454", "#ff6b7f"];
let inserted = 0;

function feedCount() {
    const all = $$$("ul.feedList", feed).length, built = $$$("ul.feedList.vtimeLine", feed).length;
    $("#feedCount").textContent = `${all} list${all === 1 ? "" : "s"} · ${built} built`;
}

//Stands in for content that arrives after load: an Ajax fragment, a route change, a template.
$("#insert").addEventListener("click", () => {
    const c = FEED_COLOURS[inserted++ % FEED_COLOURS.length];
    feed.insertAdjacentHTML("beforeend",
        `<ul class="feedList" data-marker="background:${c}" data-label-style="color:${c}" data-rail="border-left-color:${c}" data-small="640">` +
        `<li class="tl-entry" data-label="+${inserted}"><span class="t">Inserted list ${inserted} <span class="raw-tag">not refreshed</span></span>` +
        `<span class="d">Arrived after autoBuild().</span></li></ul>`);
    feedCount();
});

//refresh(parent) only looks inside parent, and only at lists not already built, so calling it
//repeatedly is safe: built lists are skipped, never rebuilt or restyled twice.
$("#refresh").addEventListener("click", () => {
    feedTimeline.refresh(feed);
    $$$(".raw-tag", feed).forEach(tag => tag.remove());
    feedCount();
});

$("#append").addEventListener("click", () => {
    const ul = $("ul.feedList", feed);
    const n = ul.children.length + 1;
    ul.insertAdjacentHTML("beforeend", `<li class="tl-entry" data-label="+${n}h"><span class="t">Entry ${n}</span><span class="d">Styled on arrival.</span></li>`);
});

feedCount();

/* ------------------------------------------------------------------ *
 * 4. Bad input — every button throws on purpose
 * ------------------------------------------------------------------ */

const BAD = {
    classNum: () => { new TimeLineList().config.className = 5; },
    classDot: () => { new TimeLineList().config.className = ".history"; },
    attrKey: () => { new TimeLineList().config.dataAttributes = { color: "data-color" }; },
    attrVal: () => { new TimeLineList().config.dataAttributes = { listStyle: 3 }; },
    attrObj: () => { new TimeLineList().config.dataAttributes = "data-x"; },
    noClass: () => { new TimeLineList().autoBuild(); },
    early: () => { const t = new TimeLineList(); t.config.className = "feedList"; t.refresh(); },
    parent: () => { feedTimeline.refresh("#feed"); },   //wants the element, not a selector
    dead: () => {
        //A list class nothing on the page uses, so building and destroying this one is harmless
        const t = new TimeLineList(); t.config.className = "nothingHere"; t.autoBuild(); t.destroy(); t.autoBuild();
    }
};

$$$("[data-bad]").forEach(button => button.addEventListener("click", () => {
    const out = $("#errOut");
    try {
        BAD[button.dataset.bad]();
        out.textContent = "No error was thrown.";
    } catch (error) {
        out.textContent = `${button.textContent}\n→ ${error.name}: ${error.message}`;
    }
}));
