/*
 * vUX core utilities — runnable example.
 *
 * There is no component to construct here. Importing the core (directly, or through any
 * vUX-*.js module) is what does the work: it puts $$ on window, promotes every helper in
 * src/helpers.js to a global, patches a few built-ins, and links assets/css/core.css,
 * which several $$.sm() methods rely on for their classes.
 */
import "../../vUX-core.js";

//$$ is the library's; these two are the page's own shorthands and touch nothing global
const $ = (sel, root = document) => root.querySelector(sel);
const $all = (sel, root = document) => root.querySelectorAll(sel);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const show = v => v === undefined ? "undefined" : JSON.stringify(v);

/* ------------------------------------------------------------------ *
 * Hero — fill() + animate() on the headline, counters, a flip card
 * ------------------------------------------------------------------ */

const heroTitle = $("#heroTitle");

//fill() sets background-image and, because an <h1> is a text element, adds .xFill from
//core.css (background-clip: text) — so the gradient paints the glyphs, not the box.
//animate() then turns the angle: the draw function is called with each tweened value.
function paintTitle(el, angle) {
    $$.sm(el).fill(`linear-gradient(${angle}deg, #5ccfe6 0%, #d7e0ec 40%, #ffb454 75%, #c8a2ff 100%)`);
}
paintTitle(heroTitle, 100);

//animate()'s value is a CHANGE, and the core remembers where each element ended, so
//calling it again with +360 carries on from the last angle instead of snapping back
function spinTitle() {
    $$.sm(heroTitle).animate(paintTitle, 360, { duration: 9000, startValue: 100 });
    setTimeout(spinTitle, 9000);
}
spinTitle();

//the counters are counted from the live objects, not typed in
const COUNTS = {
    top: Object.keys($$).length,
    sm: Object.keys($$.sm(document.body)).length,
    ease: Object.keys(timing).length            //`timing` is a helper promoted to a global
};
$all("[data-count]").forEach(el => {
    $$.sm(el).animate((node, v) => { node.textContent = Math.round(v); },
        COUNTS[el.dataset.count], { duration: 1400, timingFunction: "bounceEaseOut" });
});

//flip.card() reads the option object on EVERY call (axis and angle are re-applied each
//time), so keep one object and pass it each click. The first call sets the card up.
const FLIP = { frontClass: "face-b", backClass: "face-a", axis: "y", angle: "180deg", speed: ".7s",
    timingFunction: "cubic-bezier(.3,.7,.2,1)" };
const flipCard = $("#flipCard");
$("#flipHost").addEventListener("click", () => {
    //the second argument names the face that should sit on top once the card has turned
    const next = $$.sm(flipCard).class.has("flip") ? "face-a" : "face-b";
    $$.sm(flipCard).flip.card(FLIP, next);
});
//There is no separate set-up call: the FIRST flip.card() call builds the 3D parent, positions
//the faces and turns the card. Calling it twice at load (turn, turn back, in one frame)
//leaves a ready card showing face-a, with nothing visibly moving.
$$.sm(flipCard).flip.card(FLIP, "face-a");
$$.sm(flipCard).flip.card(FLIP, "face-a");

/* ------------------------------------------------------------------ *
 * 01 Select and manipulate
 * ------------------------------------------------------------------ */

const board = $("#board");
const TILE_KINDS = ["warm", "cool", "warm", "mute", "cool", "warm", "cool", "mute", "warm", "cool", "warm", "cool"];

function buildBoard() {
    board.innerHTML = "";
    TILE_KINDS.forEach((kind, i) => {
        //$$.ce takes the tag and an object of attributes
        const tile = $$.ce("div", { class: "tile " + kind, "data-n": i + 1 });
        tile.textContent = i + 1;
        board.appendChild(tile);
    });
    //two tiles start hidden so $$.sav("…", "hidden") has something to find
    $$.sm("#board .mute").hide();
}
buildBoard();
$("#boardReset").addEventListener("click", () => { buildBoard(); print("buildBoard()", "board rebuilt"); });

const selInput = $("#sel");
const selOut = $("#selOut");

function print(call, ret, bad = false) {
    selOut.innerHTML = `<span class="call">${esc(call)}</span>\n<span class="${bad ? "bad" : "ret"}">→ ${esc(ret)}</span>`;
}

function flash(nodes) {
    const list = nodes instanceof Element ? [nodes] : Array.from(nodes || []);
    list.forEach(n => $$.sm(n).class.add("hit"));
    setTimeout(() => list.forEach(n => $$.sm(n).class.remove("hit")), 900);
}

const describe = el => el ? `<div class="${el.className}"> #${el.dataset.n}` : "null";

//each operation returns [call text, return value text, nodes to highlight]
const OPS = {
    ss:     s => { const el = $$.ss(s); return [`$$.ss("${s}")`, describe(el), el]; },
    sa:     s => { const l = $$.sa(s); return [`$$.sa("${s}")`, `NodeList(${l.length})`, l]; },
    //$$.sav filters by computed display; its second argument is required
    savV:   s => { const l = $$.sav(s, "visible"); return [`$$.sav("${s}", "visible")`, `Array(${l.length})`, l]; },
    savH:   s => { const l = $$.sav(s, "hidden"); return [`$$.sav("${s}", "hidden")`, `Array(${l.length})`, l]; },
    //with a selector, hide/unHide/class act on every match
    hide:   s => { $$.sm(s).hide(); return [`$$.sm("${s}").hide()`, "undefined — display:none on every match", null]; },
    unHide: s => { $$.sm(s).unHide("flex"); return [`$$.sm("${s}").unHide("flex")`, "undefined — display:flex on every match", $$.sa(s)]; },
    add:    s => { $$.sm(s).class.add("lit"); return [`$$.sm("${s}").class.add("lit")`, "undefined", $$.sa(s)]; },
    remove: s => { $$.sm(s).class.remove("lit"); return [`$$.sm("${s}").class.remove("lit")`, "undefined", $$.sa(s)]; },
    //swap toggles between the two: whichever one an element has is replaced by the other
    swap:   s => { const l = $$.sa(s); $$.sm(s).class.swap(["warm", "cool"]); return [`$$.sm("${s}").class.swap(["warm", "cool"])`, "undefined", l]; },
    xSwap:  s => { const l = $$.sa(s); $$.sm(s).class.xSwap({ remove: "warm", add: "mute" }); return [`$$.sm("${s}").class.xSwap({ remove: "warm", add: "mute" })`, "undefined", l]; },
    //readers look at the first match only
    has:    s => [`$$.sm("${s}").class.has("warm")`, show($$.sm(s).class.has("warm")), $$.ss(s)],
    index:  s => [`$$.sm("${s}").index()`, show($$.sm(s).index()) + "  (1-based)", $$.ss(s)],
    css:    s => [`$$.sm("${s}").cssStyle("background-color")`, show($$.sm(s).cssStyle("background-color")), $$.ss(s)],
    //$$.styleElement takes an element or a NodeList and an object of style properties
    style:  s => { const l = $$.sa(s); $$.styleElement(l, { borderRadius: "50%" }); return [`$$.styleElement($$.sa("${s}"), { borderRadius: "50%" })`, "undefined", l]; }
};

$all("#ops [data-op]").forEach(btn => btn.addEventListener("click", () => {
    const s = selInput.value.trim();
    try {
        const [call, ret, nodes] = OPS[btn.dataset.op](s);
        print(call, ret);
        flash(nodes);
    } catch (error) {
        //$$.sm() with a selector that matches nothing throws; $$.ss() just returns null
        print(btn.textContent + "  with  " + s, error.name + ": " + error.message, true);
    }
}));
$all("[data-sel]").forEach(b => b.addEventListener("click", () => { selInput.value = b.dataset.sel; }));

//makeActive: the parent scopes which elements lose the class. Without it, every element
//in the document carrying "active" would be cleared, including ones in other widgets.
const TAB_TEXT = [
    "$$.ss, $$.sa, $$.sav and $$.sm — the board above.",
    "slide, flip.card, animate and filter — section 02.",
    "$$.attachEventHandler — one listener on window, filtered by class — section 04.",
    "getTimeSegments, ScreenBreakPoint, IO.get, randomString — section 05."
];
const tabs = $("#tabs");
function activate(btn) {
    $$.sm(btn).makeActive("active", tabs);
    $("#tabBody").textContent = TAB_TEXT[btn.dataset.tab];
}
$all("#tabs button").forEach(b => b.addEventListener("click", () => activate(b)));
activate($("#tabs button"));

/* ------------------------------------------------------------------ *
 * 02 Motion — slides
 * ------------------------------------------------------------------ */

const slSpeed = $("#slSpeed"), slTiming = $("#slTiming");
slSpeed.addEventListener("input", () => { $("#slSpeedV").textContent = slSpeed.value; });

//A fresh object per call: the core writes its defaults INTO the object you pass, so a
//shared one would carry the last call's values into the next. Five keys at most.
function slideOptions(extra) {
    return Object.assign({ speed: Number(slSpeed.value), timingFunction: slTiming.value }, extra);
}

const drawer = $("#drawer");
let drawerOpen = false;
$("#drawerOpen").addEventListener("click", () => {
    if (drawerOpen) return;
    drawerOpen = true;
    //position mode: the start value is written with transitions off, then the end value
    //is animated. right goes -260 -> 0, so the panel travels left: hence toLeft.
    $$.sm(drawer).slide.toLeft(slideOptions({ use: "position", positionProperty: "right", positions: { x: [-260, 0] } }));
});
$("#drawerClose").addEventListener("click", () => {
    if (!drawerOpen) return;
    drawerOpen = false;
    $$.sm(drawer).slide.toRight(slideOptions({ use: "position", positionProperty: "right", positions: { x: [0, -260] } }));
});

const reveal = $("#reveal"), revealOut = $("#revealOut");
$("#revealOpen").addEventListener("click", () => {
    //dimension mode, no end width: x[1] left undefined opens the element to its scrollWidth.
    //Leaving `dimensions` out entirely would apply the default { x: [0, 200] } instead.
    $$.sm(reveal).slide.toRight(slideOptions({ use: "dimension", dimensions: { x: [0] } }),
        (el, size) => { revealOut.textContent = `callback: ${el.offsetWidth}px (size arg: ${size})`; });
});
$("#revealClose").addEventListener("click", () => {
    //toLeft writes width = x[1]; x[1] = 0 collapses it. It starts from the current width.
    $$.sm(reveal).slide.toLeft(slideOptions({ use: "dimension", dimensions: { x: [0, 0] } }),
        (el, size) => { revealOut.textContent = `callback: ${el.offsetWidth}px (size arg: ${size})`; });
});

//accordion: toBottom grows from 0 to the content height and then hands height back to
//CSS (height:auto); toTop shrinks from the measured height to 0. Both need `use` given.
$all("#accordion .acc").forEach(acc => {
    const body = $(".acc-b", acc);
    $(".acc-h", acc).addEventListener("click", () => {
        const open = $$.sm(acc).class.has("open");
        $$.sm(acc).class.swap(["open", "closed"]);
        if (open) $$.sm(body).slide.toTop(slideOptions({ use: "dimension" }));
        else      $$.sm(body).slide.toBottom(slideOptions({ use: "dimension" }));
    });
});

/* ------------------------------------------------------------------ *
 * 02 Motion — animate() easing lab
 * ------------------------------------------------------------------ */

const easeSel = $("#easeSel");
Object.keys(timing).forEach(name => {
    const option = $$.ce("option", { value: name });
    option.textContent = name;
    easeSel.appendChild(option);
});
easeSel.value = "bounceEaseOut";

const curve = $("#curve"), ctx = curve.getContext("2d");
function drawCurve() {
    const fn = timing[easeSel.value];
    const W = curve.width, H = curve.height, pad = 40;
    //bow-shooting curves overshoot both ends, so the plot leaves room above 1 and below 0
    const lo = -0.45, hi = 1.45, y = v => H - pad - ((v - lo) / (hi - lo)) * (H - 2 * pad);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "#1f2a3a"; ctx.lineWidth = 1;
    [0, 1].forEach(v => { ctx.beginPath(); ctx.moveTo(pad, y(v)); ctx.lineTo(W - pad, y(v)); ctx.stroke(); });
    ctx.fillStyle = "#4d5b71"; ctx.font = "20px ui-monospace, monospace";
    ctx.fillText("1", 12, y(1) + 6); ctx.fillText("0", 12, y(0) + 6);
    ctx.strokeStyle = "#ffb454"; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
        const t = i / 200, px = pad + t * (W - 2 * pad), py = y(fn(t));
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
}
easeSel.addEventListener("change", drawCurve);
drawCurve();

const ball = $("#ball"), ballV = $("#ballV"), ballDur = $("#ballDur");
ballDur.addEventListener("input", () => { $("#ballDurV").textContent = ballDur.value; });
let ballAt = "home", ballBusy = false, travelled = 0;

function drawBall(el, v) {
    el.style.transform = `translateX(${v}px)`;
    ballV.textContent = v.toFixed(1);
}
function moveBall(sign) {
    if (ballBusy) return;            //two animate() calls on one element would both write
    const duration = Number(ballDur.value);
    //forward uses the track's current width; back returns exactly what went forward
    const delta = sign > 0 ? $("#track").clientWidth - 56 : -travelled;
    if (sign > 0) travelled = delta;
    ballBusy = true;
    $$.sm(ball).animate(drawBall, delta, { duration, timingFunction: easeSel.value });
    setTimeout(() => { ballBusy = false; ballAt = sign > 0 ? "end" : "home"; }, duration + 30);
}
$("#ballFwd").addEventListener("click", () => { if (ballAt === "home") moveBall(1); });
$("#ballBack").addEventListener("click", () => { if (ballAt === "end") moveBall(-1); });

/* ------------------------------------------------------------------ *
 * 02 Motion — filter()
 * ------------------------------------------------------------------ */

const poster = $("#poster"), fOut = $("#fOut");
const fGray = $("#fGray"), fBlur = $("#fBlur");

function applyFilter() {
    $("#fGrayV").textContent = fGray.value;
    $("#fBlurV").textContent = fBlur.value + "px";
    //arrays of types and values set several filters at once; with no options it is instant
    $$.sm(poster).filter(["grayscale", "blur"], [fGray.value, fBlur.value + "px"]);
    fOut.textContent = `filter: ${poster.style.filter}`;
}
[fGray, fBlur].forEach(r => r.addEventListener("input", applyFilter));

let pulsing = false;
$("#fPulse").addEventListener("click", () => {
    if (pulsing) return;
    pulsing = true;
    //With options the filter transitions from `init` to the value, and when the transition
    //ends the core resets it to none and takes the transition off again: a pulse, not a
    //setting. callBack runs once `duration` has passed.
    fOut.textContent = "pulse: grayscale(0) blur(0px) → grayscale(1) blur(8px) → none";
    $$.sm(poster).filter(["grayscale", "blur"], [1, "8px"], {
        init: [0, "0px"], duration: "700ms",
        callBack: () => {
            fGray.value = 0; fBlur.value = 0;
            $("#fGrayV").textContent = "0"; $("#fBlurV").textContent = "0px";
            fOut.textContent += "  · callBack ran";
            pulsing = false;
        }
    });
});
$("#fClear").addEventListener("click", () => { fGray.value = 0; fBlur.value = 0; applyFilter(); });

/* ------------------------------------------------------------------ *
 * 03 Layout helpers
 * ------------------------------------------------------------------ */

$("#centerRun").addEventListener("click", () => {
    //the chips are position:absolute, so the core takes the 50% + translate route
    $$.sm("#cX").centerX();
    $$.sm("#cY").centerY();
    $$.sm("#cXY").center();
});
$("#centerReset").addEventListener("click", () => {
    ["#cX", "#cY", "#cXY"].forEach(s => { $(s).style.cssText = ""; });
});

const shot = $("#shot");
const OVERLAY_ID = "core-example-overlay";
$("#overlayAdd").addEventListener("click", () => {
    if ($(".mOverlay", shot)) return;     //each call appends another overlay
    //"first" inserts the overlay before the content and positions the content so it paints
    //above it. core.css covers the host edge to edge and follows its border-radius.
    //The CSS text is only needed once, so pass the id and css on the first call only.
    const firstTime = !document.querySelector(`style[data-id="${OVERLAY_ID}"]`);
    $$.sm(shot).addOverlay("first",
        firstTime ? OVERLAY_ID : null,
        firstTime ? "#shot .mOverlay::before{background-image:linear-gradient(to top, rgba(8,11,17,.92) 0%, rgba(8,11,17,.2) 75%)}" : null);
});
$("#overlayRemove").addEventListener("click", () => {
    const o = $(".mOverlay", shot);
    if (o) o.remove();
    $$.sm(shot).class.remove("xOverlay");
});

const scroller = $("#scroller"), scrollStatus = $("#scrollStatus");
for (let i = 1; i <= 30; i++) {
    const li = $$.ce("li");
    li.textContent = `row ${String(i).padStart(2, "0")} · ${$$.randomString(10)}`;
    $("#scrollList").appendChild(li);
}
//scroll.y(true): the argument hides the bar; scroll.y() keeps it
$$.sm(scroller).scroll.y(true);
$("#scrollLock").addEventListener("click", () => {
    $$.sm(scroller).scroll.lock("y");
    scrollStatus.className = "status err"; scrollStatus.lastChild.textContent = "locked — overflow-y: hidden";
});
$("#scrollUnlock").addEventListener("click", () => {
    $$.sm(scroller).scroll.unlock("y");
    scrollStatus.className = "status run"; scrollStatus.lastChild.textContent = "unlocked — overflow-y: auto";
});

/* ------------------------------------------------------------------ *
 * 04 Delegated events
 * ------------------------------------------------------------------ */

const chips = $("#chips"), evLog = $("#evLog"), tagInput = $("#tagInput");
function log(line) {
    evLog.textContent = line + "\n" + evLog.textContent;
}
function addTag(text, extra = "") {
    const t = $$.ce("span", { class: ("tag " + extra).trim() });
    t.innerHTML = text;
    chips.appendChild(t);
    $("#tagCount").textContent = $$.sa("#chips .tag").length + " tags";
}
["vanilla", "es6", "no build", "delegated"].forEach(t => addTag(t));
addTag("core", "pinned");
addTag("<b>bold</b> inside");

//"tag, pinned": the target must have `tag` and must not have `pinned`.
//Only e.target is tested — a click on a child of a .tag is a click on the child.
const removeHandler = { handle: null };
function attachRemove() {
    removeHandler.handle = $$.attachEventHandler("click", "tag, pinned", e => {
        log(`click → removed "${e.target.textContent}"`);
        e.target.remove();
        $("#tagCount").textContent = $$.sa("#chips .tag").length + " tags";
    });
}
attachRemove();

//the array form matches any of the classes and passes the one that matched
$$.attachEventHandler("click", ["pinned"], (e, cls) => {
    log(`click on .${cls} → excluded by "tag, pinned", caught by ["pinned"]`);
});

//"event:prop=value" — the handler only runs when e.key is "Enter"
$$.attachEventHandler("keyup:key=Enter", "tag-input", e => {
    const v = tagInput.value.trim();
    if (!v) return;
    addTag(esc(v));
    log(`keyup:key=Enter → added "${v}" (a new element, no rebinding)`);
    tagInput.value = "";
});

$("#evDetach").addEventListener("click", e => {
    if (removeHandler.handle) {
        removeHandler.handle.detach();             //the handle returned by attachEventHandler
        removeHandler.handle = null;
        e.target.textContent = "attach it again";
        $("#evState").textContent = "detached"; $("#evState").className = "pill";
        log("detach() → tag clicks do nothing now");
    } else {
        attachRemove();
        e.target.textContent = "detach() the click handler";
        $("#evState").textContent = "attached"; $("#evState").className = "pill on";
        log("attachEventHandler again → tag clicks remove tags");
    }
});
log("ready — click a tag, or type one and press Enter");

/* ------------------------------------------------------------------ *
 * 05 Data, time and the environment
 * ------------------------------------------------------------------ */

const cdAt = $("#cdAt");
const inThreeDays = new Date(Date.now() + (3 * 86400 + 5 * 3600 + 17 * 60) * 1000);
//datetime-local wants local time without a zone
cdAt.value = new Date(inThreeDays - inThreeDays.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

function tick() {
    const target = Math.floor(new Date(cdAt.value).getTime() / 1000);
    //getTimeSegments warns to the console for a past time; check first so a ticking
    //countdown that has finished does not warn every second
    const seg = target > Date.now() / 1000 ? $$.getTimeSegments(target) : null;
    const parts = seg || { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, units: { hours: "hrs", minutes: "mins" } };
    //the core splits days into 30-day months and 360-day years; fold them back for a day count
    const days = parts.years * 360 + parts.months * 30 + parts.days;
    $('[data-seg="days"]').textContent = days;
    ["hours", "minutes", "seconds"].forEach(k => { $(`[data-seg="${k}"]`).textContent = String(parts[k]).padStart(2, "0"); });
    $('[data-unit="hours"]').textContent = parts.units.hours;
    $('[data-unit="minutes"]').textContent = parts.units.minutes;
}
cdAt.addEventListener("input", tick);
tick();
setInterval(tick, 1000);

const bpMed = $("#bpMed"), bpLg = $("#bpLg");
let breakpoints;
function rebuildBreakpoints() {
    $("#bpMedV").textContent = bpMed.value; $("#bpLgV").textContent = bpLg.value;
    breakpoints = new ScreenBreakPoint({ mediumStart: Number(bpMed.value), largeStart: Number(bpLg.value) });
    showBreakpoint();
}
function showBreakpoint() {
    const s = breakpoints.screen;            //a getter: read it whenever you need it
    $("#bpMode").textContent = s.mode;
    $("#bpSize").textContent = `actualSize: ${s.actualSize}px`;
}
[bpMed, bpLg].forEach(r => r.addEventListener("input", rebuildBreakpoints));
addEventListener("resize", showBreakpoint);
rebuildBreakpoints();

const rsLen = $("#rsLen"), rsOut = $("#rsOut");
let lastRandom = "";
function generate() {
    $("#rsLenV").textContent = rsLen.value;
    lastRandom = $$.randomString(Number(rsLen.value));
    //randomInteger is inclusive at both ends
    rsOut.innerHTML = `<span class="ret">${esc(lastRandom)}</span>  (${lastRandom.length} chars)\n` +
        `randomInteger(1, 6) → ${$$.randomInteger(1, 6)}`;
}
rsLen.addEventListener("input", generate);
$("#rsGo").addEventListener("click", generate);
$("#rsCopy").addEventListener("click", () => {
    //copy() returns execCommand's boolean; it must run inside a user gesture
    const ok = $$.clipboard.copy(lastRandom);
    rsOut.innerHTML += `\nclipboard.copy → ${ok}`;
});
generate();

$("#ioGo").addEventListener("click", () => {
    const urls = ["../../README.md", "../../doc/README.md", "./README.md"];
    $("#ioBar").style.width = "0";
    $("#ioOut").textContent = "fetching…";
    //fn runs once per response; `data` is keyed by the url's index in the array.
    //There is no error callback — a url that fails never reports, and status never ends true.
    $$.IO.get(urls, (data, state) => {
        $("#ioBar").style.width = state.progress + "%";
        $("#ioOut").textContent = Object.keys(data).map(i => `${urls[i]}  ${data[i].length} bytes`).join("\n") +
            `\nprogress ${Math.round(state.progress)}%  status ${state.status}`;
    });
});

(function environment() {
    //browserType() parses navigator.userAgent; an agent it does not know reports name "unknown"
    $("#envOut").textContent =
        `$$.getURLParams("name") → ${show($$.getURLParams("name"))}\n` +
        `$$.browserType() → ${show($$.browserType())}\n` +
        `$$.browserType("firefox") → ${$$.browserType("firefox")}`;
})();

/* ------------------------------------------------------------------ *
 * 06 Built-in extensions and global helpers — evaluated live
 * ------------------------------------------------------------------ */

const EXT = [
    ['"  /api/users/ ".xTrim()', () => "  /api/users/ ".xTrim()],
    ['"--a-b--".trimChar("-")', () => "--a-b--".trimChar("-"), true],
    ['"hello".toUpperCaseFirst()', () => "hello".toUpperCaseFirst()],
    ['["a", "b"].has("b")', () => ["a", "b"].has("b")],
    ['new Date("not a date").isValid()', () => new Date("not a date").isValid()],
    ['sessionStorage.setIterable("demo", { a: [1, 2] }); sessionStorage.getIterable("demo")',
        () => { sessionStorage.setIterable("demo", { a: [1, 2] }); return sessionStorage.getIterable("demo"); }],
    ['RegExp.parseChars("1+1=2.")', () => RegExp.parseChars("1+1=2.")],
    ['for (const k in [1, 2]) keys.push(k)', () => { const k = []; for (const i in [1, 2]) k.push(i); return k; }, true],
    ['hyphenatedToCamel("background-color")', () => hyphenatedToCamel("background-color")],
    ['minMaxInt(140, 0, 100)', () => minMaxInt(140, 0, 100)],
    ['sanitizeInteger("0803-555 12")', () => sanitizeInteger("0803-555 12")],
    ['validateEmailAddress("ada@example.com")', () => validateEmailAddress("ada@example.com")],
    ['validateString(42, "name must be a string")', () => validateString(42, "name must be a string")],
    ['validateInteger(1.5, "must be an integer")', () => validateInteger(1.5, "must be an integer"), true],
    ['getDayName(2026, 10, 7)', () => getDayName(2026, 10, 7)],
    ['isPositioned($$.ss("#shot"))', () => isPositioned($$.ss("#shot"))],
    ['getCssStyle($$.ss("h1"), "font-weight")', () => getCssStyle($$.ss("h1"), "font-weight")],
    ['timing.bounceEaseOut(0.5)', () => timing.bounceEaseOut(0.5)]
];
$("#extTable").innerHTML = EXT.map(([expr, fn, warn]) => {
    let out;
    try { out = "→ " + show(fn()); } catch (e) { out = "throws " + e.name + ": " + e.message; }
    return `<tr><td>${esc(expr)}</td><td class="${warn ? "warn" : ""}">${esc(out)}</td></tr>`;
}).join("");

/* ------------------------------------------------------------------ *
 * 07 Bad input and repaired calls
 * ------------------------------------------------------------------ */

//throwaway nodes for the calls that need an element; never attached to the page
const scratch = () => { const wrap = $$.ce("div"); const el = $$.ce("div"); wrap.appendChild(el); return el; };

const BAD = {
    "$$.ss(42)": () => $$.ss(42),
    '$$.sm("#nope")': () => $$.sm("#nope"),
    '$$.ce("div", "class=x")': () => $$.ce("div", "class=x"),
    "$$.delay(-5)": () => $$.delay(-5),
    'animate(…, { timingFunction: "ease" })': () => $$.sm(scratch()).animate(() => {}, 10, { timingFunction: "ease" }),
    'slide.toLeft({ colour: "red" })': () => $$.sm(scratch()).slide.toLeft({ colour: "red" }),
    'slide.toLeft({ use: "position" })': () => $$.sm(scratch()).slide.toLeft({ use: "position" }),
    'flip.card({ axis: "y" })': () => $$.sm(scratch()).flip.card({ axis: "y" }),
    'attachEventHandler("click", 5, fn)': () => $$.attachEventHandler("click", 5, () => {}),
    "new ScreenBreakPoint({ big: 1200 })": () => new ScreenBreakPoint({ big: 1200 }),
    '$$.ajax({ url, method })': () => $$.ajax({ url: "./README.md", method: "GET" }),
    '$$.browserType("netscape")': () => $$.browserType("netscape"),
    '$$.sav("li")': () => $$.sav("li"),
    'slide.toRight({ colour: "red" })': () => $$.sm(scratch()).slide.toRight({ colour: "red" }),
    "$$.randomString(2.5)": () => $$.randomString(2.5)
};

//calls that threw or misbehaved earlier in v4.0.0-beta, shown returning what they return now
const DEFECTS = {
    "scroll.x()": () => { const el = scratch(); $$.sm(el).scroll.x(); return `class="${el.className}"`; },
    "$$.scroll.direction()": () => $$.scroll.direction(),
    "browserResizeProperty": () => {
        browserResizeProperty();          //starts listening; call once, then read the getters
        return { mode: browserResizeProperty.mode, change: browserResizeProperty.change, hint: "resize the window, press again" };
    },
    '$$.IO.save({ demo: true }, …)': () => { $$.IO.save({ demo: true }, { type: "json", name: "vux-demo.json" }); return "vux-demo.json downloaded"; },
    'camelToCSSstandard("fontSize")': () => camelToCSSstandard("fontSize"),
    'validatePhoneNumber("+2348012345")': () => validatePhoneNumber("+2348012345"),
    "new ScreenBreakPoint()": () => new ScreenBreakPoint().screen,
    "$$.browserType()": () => $$.browserType(),
    "randomString(4) × 3000": () => {
        const lengths = new Set();
        for (let i = 0; i < 3000; i++) lengths.add($$.randomString(4).length);
        return "lengths seen: " + [...lengths].sort().join(", ");
    }
};

function wire(map, row, out) {
    Object.keys(map).forEach(label => {
        const b = $$.ce("button", { class: "tiny" });
        b.textContent = label;
        b.addEventListener("click", () => {
            try {
                const r = map[label]();
                out.textContent = `${label}\n→ ${typeof r === "string" ? r : show(r)}  (no error)`;
            } catch (e) {
                out.textContent = `${label}\n${e.name}: ${e.message}`;
            }
        });
        row.appendChild(b);
    });
}
wire(BAD, $("#badRow"), $("#errOut"));
wire(DEFECTS, $("#defRow"), $("#defOut"));

$("#freeze").addEventListener("click", () => {
    const t0 = performance.now();
    //a busy-wait loop: nothing paints, no input is handled, timers and animations stall
    $$.delay(1500, () => {
        $("#freezeOut").textContent = `callback ran after ${Math.round(performance.now() - t0)}ms, synchronously — use setTimeout instead`;
    });
});

//exposed for the console
Object.assign(window, { flipCard, board, breakpoints });
