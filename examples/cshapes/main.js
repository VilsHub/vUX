/*
 * vUX CShapes: runnable example.
 *
 * `new CShapes()` is a factory, not a component: it has no initialize(). Its three read-only
 * methods, arc(), animatedRectangle() and fixedRectangle(), each return a fresh
 * { config, draw, ... } object. One shape object draws on one canvas at a time, so every
 * canvas on this page gets its own object.
 *
 * Every canvas is sized in CSS. draw() reads the canvas's CSS box, sizes the backing store
 * by devicePixelRatio and draws in CSS pixels, so width/height attributes would be
 * overwritten anyway.
 */
import { CShapes } from "../../vUX-cShapes.js";

const $ = (sel, root = document) => root.querySelector(sel);
const shapes = new CShapes();

//The page honours prefers-reduced-motion itself: the library animates whatever it is told to,
//so it is the consumer's job to pass duration 0 and to avoid infinite loops for these users.
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reducedMotion) document.documentElement.classList.add("reduced");

//The core's easing table is a global (`timing`) once any vUX module is imported. The easing
//config of both animated shapes accepts exactly its keys, so the selects are built from it.
const EASINGS = Object.keys(timing);
function fillEasing(select, chosen) {
    EASINGS.forEach(name => {
        const option = document.createElement("option");
        option.textContent = name;
        option.selected = name == chosen;
        select.appendChild(option);
    });
}

//Redraw a canvas when its CSS size changes. draw() measures the canvas each time it is called
//(the animated rectangle also at the start of each cycle), so a resize only needs a fresh draw.
//The first observation is skipped: every canvas is drawn on load anyway.
function onResize(canvas, redraw) {
    let last = null, queued = false;
    new ResizeObserver(() => {
        const size = canvas.clientWidth + "x" + canvas.clientHeight;
        if (last == null || size == last) { last = size; return; }
        last = size;
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => { queued = false; redraw(); });
    }).observe(canvas);
}

//Canvas text is pixels: a screen reader cannot read the percentage off a ring. Each ring keeps
//role="img" and an aria-label in step with the value it shows.
function labelRing(canvas, prefix, progress) {
    canvas.setAttribute("aria-label", prefix + ": " + Math.round(progress) + " percent");
}

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const str = s => `<span class="s">"${esc(s)}"</span>`;

function logTo(pre, line) {
    const lines = (pre.textContent ? pre.textContent.split("\n") : []);
    lines.push(line);
    //long runs add a line per cycle, so the log keeps only the tail
    pre.textContent = lines.slice(-40).join("\n");
    pre.scrollTop = pre.scrollHeight;
}

function setStatus(el, textEl, state, text) {
    el.className = "status" + (state ? " " + state : "");
    textEl.textContent = text;
}

/* ------------------------------------------------------------------ *
 * 1. Hero: a big ring and three bordered cards
 * ------------------------------------------------------------------ */

const heroCanvas = $("#heroRing");
let heroTarget = 87;

const heroRing = shapes.arc();
heroRing.config.strokeWidth = 18;
heroRing.config.lineCap = "round";
heroRing.config.strokeColor = "#5ccfe6";
heroRing.config.progressBackground = "#1c2636";
heroRing.config.percentageFontColor = "#d7e0ec";
heroRing.config.labelFontColor = "#7b8ba3";
//bowShootingEaseOut overshoots and settles back; the ring still ends exactly on the value
heroRing.config.easing = "bowShootingEaseOut";
heroRing.config.duration = reducedMotion ? 0 : 2200;
//callback(progress) runs once, when the draw has finished: the right moment to update the label
heroRing.config.callback = progress => labelRing(heroCanvas, "Build progress", progress);

function heroDraw() {
    $("#heroValue").textContent = heroTarget;
    heroRing.draw(heroCanvas, heroTarget, "deployed");
}
heroDraw();

//destroy() clears the canvas and forgets the last value, so the next draw animates up from 0
$("#heroReplay").addEventListener("click", () => { heroRing.destroy(); heroDraw(); });
//a plain draw() animates from whatever the ring shows now, even mid-animation
$("#heroRandom").addEventListener("click", () => { heroTarget = Math.round(Math.random() * 100); heroDraw(); });
onResize(heroCanvas, heroDraw);

//Card 1: rounded, with its colour tweened through the page palette.
const PALETTE = ["#c8a2ff", "#5ccfe6", "#a7e05f", "#ffb454"];
const rgb = PALETTE.map(hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)));
//colour at a tween value v: leg floor(v) of the palette loop, blended by the fraction of v
function paletteAt(value) {
    const leg = Math.floor(value), t = value - leg, n = rgb.length;
    const from = rgb[((leg % n) + n) % n], to = rgb[(((leg + 1) % n) + n) % n];
    return "rgb(" + from.map((c, i) => Math.round(c + (to[i] - c) * t)).join(",") + ")";
}

const ant1 = $("#ant1"), ant2 = $("#ant2"), ant3 = $("#ant3");

const card1 = shapes.animatedRectangle();
card1.config.lineColor = PALETTE[0];
card1.config.lineWidth = 3;
card1.config.segment = [14, 7];
card1.config.radius = 16;          //match the card's border-radius so the border hugs it
card1.config.duration = 3200;
card1.config.easing = "linear";    //linear keeps a looping march at a constant speed
card1.config.iterationCount = reducedMotion ? 1 : "infinite";

const card2 = shapes.animatedRectangle();
card2.config.lineColor = "#5ccfe6";
card2.config.lineWidth = 4;        //square corners: half of it (2px) shows, the edge clips the rest
card2.config.segment = [6, 6];
card2.config.duration = 2600;
card2.config.clockWise = false;
card2.config.iterationCount = reducedMotion ? 1 : "infinite";

const card3 = shapes.fixedRectangle();
card3.config.lineColor = "#ffb454";
card3.config.lineWidth = 4;
card3.config.segment = [3, 5];

function drawCards() {
    card1.draw(ant1);
    card2.draw(ant2);
    //draw() paints its first frame synchronously, so stopping at once leaves a still border
    if (reducedMotion) { card1.stop(); card2.stop(); }
    card3.draw(ant3);
}
drawCards();
[ant1, ant2, ant3].forEach(canvas => onResize(canvas, drawCards));

//The colour tween is the core's $$.sm().animate(). It remembers its end value on the element,
//so each 2.2s leg starts where the last ended and adds 1: the running value v is a leg number.
//animate() has no completion callback, so the next leg is chained on a timer of its duration.
if (!reducedMotion) {
    const LEG = 2200;
    (function nextLeg() {
        $$.sm(ant1).animate((_el, value) => { card1.config.lineColor = paletteAt(value); }, 1,
            { duration: LEG, timingFunction: "linear", startValue: 0 });
        setTimeout(nextLeg, LEG);
    })();
}

/* ------------------------------------------------------------------ *
 * 2. arc() playground
 * ------------------------------------------------------------------ */

const arcCanvas = $("#arcCanvas");
const arcUi = {
    progress: $("#arcProgress"), label: $("#arcLabel"), start: $("#arcStart"), cap: $("#arcCap"),
    stroke: $("#arcStroke"), radius: $("#arcRadius"), radiusAuto: $("#arcRadiusAuto"), clock: $("#arcClock"),
    strokeColor: $("#arcStrokeColor"), bg: $("#arcBg"), pctColor: $("#arcPctColor"), labelColor: $("#arcLabelColor"),
    showPct: $("#arcShowPct"), showLabel: $("#arcShowLabel"), pctFont: $("#arcPctFont"), labelFont: $("#arcLabelFont"),
    duration: $("#arcDuration"), easing: $("#arcEasing"),
    status: $("#arcStatus"), statusText: $("#arcStatusText"), log: $("#arcLog"), snippet: $("#arcSnippet")
};
fillEasing(arcUi.easing, "swingEaseOut");
if (reducedMotion) arcUi.duration.value = 0;

//config is write-only across vUX (reading a property returns undefined), so the page builds
//its own copy from the controls and writes it in full.
function arcConfig() {
    return {
        start: Number(arcUi.start.value),            //a number: 12, 3, 6 or 9
        clockWise: arcUi.clock.checked,
        progressLabel: arcUi.showLabel.checked,
        showPercentage: arcUi.showPct.checked,
        progressBackground: arcUi.bg.value,
        strokeColor: arcUi.strokeColor.value,
        strokeWidth: Number(arcUi.stroke.value),
        radius: arcUi.radiusAuto.checked ? "auto" : Number(arcUi.radius.value),
        lineCap: arcUi.cap.value,
        percentageFontColor: arcUi.pctColor.value,
        percentageFont: arcUi.pctFont.value.trim(),
        labelFontColor: arcUi.labelColor.value,
        labelFont: arcUi.labelFont.value.trim(),
        duration: Number(arcUi.duration.value),
        easing: arcUi.easing.value
    };
}

//Sharp edge: once percentageFont or labelFont has been set, there is no value that puts the
//radius-scaled default back (null and "" are not accepted as "default"). So the page only sets
//a font when its field is filled, and when a field is emptied it swaps in a fresh arc() object.

function newArc() {
    const arc = shapes.arc();
    arc.config.callback = progress => {
        labelRing(arcCanvas, "Progress", progress);
        setStatus(arcUi.status, arcUi.statusText, "", "callback(" + progress + ") fired");
        logTo(arcUi.log, "callback(" + progress + ")");
    };
    return arc;
}
let playArc = newArc();

function applyArc(arc, c) {
    for (const key of Object.keys(c)) {
        //an empty font field hands the setter null, which restores the default that scales
        //with the radius
        if (key == "percentageFont" || key == "labelFont") {
            arc.config[key] = c[key] != "" ? c[key] : null;
            continue;
        }
        arc.config[key] = c[key];
    }
}

function arcDraw() {
    const c = arcConfig();
    try {
        applyArc(playArc, c);
        const progress = Number(arcUi.progress.value);
        if (c.duration > 0) setStatus(arcUi.status, arcUi.statusText, "run", "animating to " + progress + "...");
        //a change that keeps the value (a colour, a font) repaints at once: draw() skips the
        //animation when the new value equals the one already on this canvas
        playArc.draw(arcCanvas, progress, arcUi.label.value);
    } catch (error) {
        //a typed font string is the only free-text input; the library accepts any string there,
        //so this catch is for safety, not a validation path
        setStatus(arcUi.status, arcUi.statusText, "err", error.message);
    }
}

function arcSnippet() {
    const c = arcConfig();
    const p = k => `<span class="p">ring</span>.config.${k.padEnd(19)} = `;
    const lines = [
        `<span class="k">const</span> <span class="p">ring</span> = <span class="k">new</span> CShapes().arc();`,
        "",
        p("start") + c.start + ";",
        p("clockWise") + `<span class="k">${c.clockWise}</span>;`,
        p("strokeWidth") + c.strokeWidth + ";",
        p("radius") + (c.radius == "auto" ? str("auto") : c.radius) + ";",
        p("lineCap") + str(c.lineCap) + ";",
        p("strokeColor") + str(c.strokeColor) + ";",
        p("progressBackground") + str(c.progressBackground) + ";",
        p("showPercentage") + `<span class="k">${c.showPercentage}</span>;`,
        p("percentageFontColor") + str(c.percentageFontColor) + ";",
        c.percentageFont ? p("percentageFont") + str(c.percentageFont) + ";" : `<span class="c">// percentageFont: default, scaled to the radius</span>`,
        p("progressLabel") + `<span class="k">${c.progressLabel}</span>;`,
        p("labelFontColor") + str(c.labelFontColor) + ";",
        c.labelFont ? p("labelFont") + str(c.labelFont) + ";" : `<span class="c">// labelFont: default, scaled to the radius</span>`,
        p("duration") + c.duration + ";",
        p("easing") + str(c.easing) + ";",
        p("callback") + "progress => { <span class=\"c\">/* done */</span> };",
        "",
        `<span class="p">ring</span>.draw(canvas, ${arcUi.progress.value}, ${str(arcUi.label.value)});`
    ];
    arcUi.snippet.innerHTML = lines.join("\n");
}

function arcReadouts() {
    $("#arcProgressV").textContent = arcUi.progress.value;
    $("#arcStrokeV").textContent = arcUi.stroke.value;
    $("#arcDurationV").textContent = arcUi.duration.value;
    arcUi.radius.disabled = arcUi.radiusAuto.checked;
    $("#arcRadiusV").textContent = arcUi.radiusAuto.checked ? "auto" : arcUi.radius.value + " (shrunk to fit)";
}

//Sliders redraw on "change" (release), not "input": every animated draw restarts from the value
//currently shown, so redrawing on each input step would just chase the thumb.
Object.values(arcUi).forEach(el => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
    const onRelease = el.type == "range" || el.type == "text";
    el.addEventListener("input", () => { arcReadouts(); arcSnippet(); if (!onRelease) arcDraw(); });
    if (onRelease) el.addEventListener("change", arcDraw);
});

$("#arcDraw").addEventListener("click", arcDraw);
$("#arcStop").addEventListener("click", () => {
    playArc.stop();
    setStatus(arcUi.status, arcUi.statusText, "", "stop(): frame frozen, no callback");
    logTo(arcUi.log, "stop()");
});
$("#arcDestroy").addEventListener("click", () => {
    playArc.destroy();
    arcCanvas.setAttribute("aria-label", "Progress: cleared");
    setStatus(arcUi.status, arcUi.statusText, "", "destroy(): canvas cleared, next draw starts from 0");
    logTo(arcUi.log, "destroy()");
});
$("#arcZero").addEventListener("click", () => { arcUi.progress.value = 0; arcReadouts(); arcSnippet(); arcDraw(); });
$("#arcFull").addEventListener("click", () => { arcUi.progress.value = 100; arcReadouts(); arcSnippet(); arcDraw(); });

arcReadouts();
arcSnippet();
arcDraw();

/* ------------------------------------------------------------------ *
 * 3. animatedRectangle() playground
 * ------------------------------------------------------------------ */

const arCanvas = $("#arCanvas");
const arUi = {
    line: $("#arLine"), width: $("#arWidth"), dash: $("#arDash"), gap: $("#arGap"), ox: $("#arOx"), oy: $("#arOy"),
    radius: $("#arRadius"), duration: $("#arDuration"), easing: $("#arEasing"), iter: $("#arIter"),
    infinite: $("#arInfinite"), clock: $("#arClock"),
    status: $("#arStatus"), statusText: $("#arStatusText"), log: $("#arLog"), snippet: $("#arSnippet")
};
fillEasing(arUi.easing, "linear");
if (reducedMotion) { arUi.infinite.checked = false; arUi.iter.value = 1; }

const playRect = shapes.animatedRectangle();
let running = false, cycles = 0, cycleTarget = 0;

function arConfig() {
    return {
        lineColor: arUi.line.value,
        lineWidth: Number(arUi.width.value),
        segment: [Number(arUi.dash.value), Number(arUi.gap.value)],
        origin: [Number(arUi.ox.value), Number(arUi.oy.value)],
        radius: Number(arUi.radius.value),
        duration: Number(arUi.duration.value),
        easing: arUi.easing.value,
        clockWise: arUi.clock.checked,
        iterationCount: arUi.infinite.checked ? "infinite" : Number(arUi.iter.value)
    };
}

//the callback runs at the end of every cycle; it gets no arguments, so the page counts
playRect.config.callback = () => {
    cycles++;
    logTo(arUi.log, "callback(): cycle " + cycles + " ended");
    if (cycleTarget != "infinite" && cycles >= cycleTarget) {
        running = false;
        setStatus(arUi.status, arUi.statusText, "", "finished after " + cycles + " cycle(s)");
    }
};

function arDraw() {
    const c = arConfig();
    Object.keys(c).forEach(key => { playRect.config[key] = c[key]; });
    cycles = 0;
    cycleTarget = c.iterationCount;
    running = true;
    setStatus(arUi.status, arUi.statusText, "run", "running: " + (c.iterationCount == "infinite" ? "infinite" : c.iterationCount + " cycle(s)"));
    //calling draw() again replaces the running loop on this object, it never stacks a second one
    playRect.draw(arCanvas);
}

function arSnippet() {
    const c = arConfig();
    const p = k => `<span class="p">border</span>.config.${k.padEnd(14)} = `;
    arUi.snippet.innerHTML = [
        `<span class="k">const</span> <span class="p">border</span> = <span class="k">new</span> CShapes().animatedRectangle();`,
        "",
        p("lineColor") + str(c.lineColor) + ";",
        p("lineWidth") + c.lineWidth + ";" + (c.lineWidth <= 0 ? ` <span class="c">// becomes 1</span>` : ""),
        p("segment") + `[${c.segment.join(", ")}];`,
        p("origin") + `[${c.origin.join(", ")}];`,
        p("radius") + c.radius + ";",
        p("duration") + c.duration + ";",
        p("easing") + str(c.easing) + ";",
        p("clockWise") + `<span class="k">${c.clockWise}</span>;`,
        p("iterationCount") + (c.iterationCount == "infinite" ? str("infinite") : c.iterationCount) + ";",
        p("callback") + "() => { <span class=\"c\">/* end of a cycle */</span> };",
        "",
        `<span class="p">border</span>.draw(canvas);`
    ].join("\n");
}

function arReadouts() {
    $("#arWidthV").textContent = arUi.width.value;
    $("#arDashV").textContent = arUi.dash.value;
    $("#arGapV").textContent = arUi.gap.value;
    $("#arOxV").textContent = arUi.ox.value;
    $("#arOyV").textContent = arUi.oy.value;
    $("#arRadiusV").textContent = arUi.radius.value;
    $("#arDurationV").textContent = arUi.duration.value;
    arUi.iter.disabled = arUi.infinite.checked;
    $("#arIterV").textContent = arUi.infinite.checked ? "infinite" : arUi.iter.value;
}

Object.values(arUi).forEach(el => {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
    el.addEventListener("input", () => {
        arReadouts();
        arSnippet();
        if (el == arUi.line) {
            //lineColor is read on every frame: set it on a running border and it shows on the
            //next frame, with no restart. A stopped border needs a repaint to show it.
            playRect.config.lineColor = el.value;
            if (!running) { playRect.draw(arCanvas); playRect.stop(); }
            return;
        }
    });
    //everything else is read at the start of a cycle, so the page redraws to apply it now
    if (el != arUi.line) el.addEventListener("change", arDraw);
});

$("#arDraw").addEventListener("click", arDraw);
$("#arStop").addEventListener("click", () => {
    playRect.stop();
    running = false;
    setStatus(arUi.status, arUi.statusText, "", "stop(): last frame left painted");
    logTo(arUi.log, "stop()");
});
$("#arDestroy").addEventListener("click", () => {
    playRect.destroy();
    running = false;
    setStatus(arUi.status, arUi.statusText, "", "destroy(): stopped and cleared");
    logTo(arUi.log, "destroy()");
});

//Tween lineColor through the palette and back to the picker's colour, on a running border.
//animate() remembers its end value on the canvas, so the page tracks where each tween starts.
let tweenEnd = 0;
$("#arTween").addEventListener("click", () => {
    if (!running) arDraw();
    const start = tweenEnd, legs = PALETTE.length;
    tweenEnd += legs;
    const home = arUi.line.value;
    const homeRgb = [1, 3, 5].map(i => parseInt(home.slice(i, i + 2), 16));
    const stops = [homeRgb, ...rgb, homeRgb];
    const span = stops.length - 1;
    $$.sm(arCanvas).animate((_el, value) => {
        const at = Math.max(0, Math.min(span, (value - start) * span / legs));
        const leg = Math.min(span - 1, Math.floor(at)), t = at - leg;
        const from = stops[leg], to = stops[leg + 1];
        playRect.config.lineColor = "rgb(" + from.map((ch, i) => Math.round(ch + (to[i] - ch) * t)).join(",") + ")";
    }, legs, { duration: reducedMotion ? 1 : 4000, timingFunction: "linear", startValue: 0 });
    logTo(arUi.log, "tweening lineColor while the dashes run");
});

onResize(arCanvas, () => { if (running) arDraw(); else { playRect.draw(arCanvas); playRect.stop(); } });

arReadouts();
arSnippet();
arDraw();
if (reducedMotion) { playRect.stop(); running = false; setStatus(arUi.status, arUi.statusText, "", "reduced motion: press draw() to run it"); }

/* ------------------------------------------------------------------ *
 * 4. fixedRectangle() playground
 * ------------------------------------------------------------------ */

const frCanvas = $("#frCanvas");
const frUi = {
    line: $("#frLine"), width: $("#frWidth"), dash: $("#frDash"), gap: $("#frGap"),
    ox: $("#frOx"), oy: $("#frOy"), radius: $("#frRadius"), snippet: $("#frSnippet")
};
const playFixed = shapes.fixedRectangle();

function frConfig() {
    return {
        lineColor: frUi.line.value,
        lineWidth: Number(frUi.width.value),
        segment: [Number(frUi.dash.value), Number(frUi.gap.value)],
        origin: [Number(frUi.ox.value), Number(frUi.oy.value)],
        radius: Number(frUi.radius.value)
    };
}

//no animation, so every input event can redraw straight away
function frDraw() {
    const c = frConfig();
    Object.keys(c).forEach(key => { playFixed.config[key] = c[key]; });
    playFixed.draw(frCanvas);
    ["width", "dash", "gap", "ox", "oy", "radius"].forEach(k => {
        $("#fr" + k[0].toUpperCase() + k.slice(1) + "V").textContent = frUi[k].value;
    });
    const p = k => `<span class="p">zone</span>.config.${k.padEnd(9)} = `;
    frUi.snippet.innerHTML = [
        `<span class="k">const</span> <span class="p">zone</span> = <span class="k">new</span> CShapes().fixedRectangle();`,
        "",
        p("lineColor") + str(c.lineColor) + ";",
        p("lineWidth") + c.lineWidth + ";" + (c.lineWidth <= 0 ? ` <span class="c">// becomes 1</span>` : ""),
        p("segment") + `[${c.segment.join(", ")}];`,
        p("origin") + `[${c.origin.join(", ")}];`,
        p("radius") + c.radius + ";",
        "",
        `<span class="p">zone</span>.draw(canvas);`
    ].join("\n");
}

Object.values(frUi).forEach(el => { if (el instanceof HTMLInputElement) el.addEventListener("input", frDraw); });
$("#frDraw").addEventListener("click", frDraw);
//fixedRectangle has no destroy(): clearing is the consumer's job. Reset the transform first,
//because draw() left a devicePixelRatio scale on the context.
$("#frClear").addEventListener("click", () => {
    const ctx = frCanvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, frCanvas.width, frCanvas.height);
});
onResize(frCanvas, frDraw);
frDraw();

/* ------------------------------------------------------------------ *
 * 5. Many rings: a simulated upload list
 * ------------------------------------------------------------------ */

const FILES = [
    ["invoice-2026-11.pdf", "1.2 MB"], ["site-photos.zip", "48.6 MB"], ["brand-guidelines.key", "12.9 MB"],
    ["interview-raw.mov", "212 MB"], ["dataset-q3.csv", "3.4 MB"], ["cover-letter.docx", "88 KB"]
];
const COLORS = ["#5ccfe6", "#ffb454", "#c8a2ff", "#a7e05f", "#ff6b7f", "#5ccfe6"];
const host = $("#uploads");

//one arc() object per canvas: an arc animates from the value last drawn on ITS canvas, and a
//shared object would treat every other canvas as new and start it from 0
const uploads = FILES.map(([name, size], i) => {
    const row = document.createElement("div");
    row.className = "panel up";
    row.innerHTML = `<canvas role="img" aria-label="${esc(name)}: 0 percent"></canvas>
        <div class="meta"><div class="name">${esc(name)}</div><div class="size">${size}</div></div>
        <span class="state">queued</span>`;
    host.appendChild(row);
    const canvas = row.querySelector("canvas");
    const ring = shapes.arc();
    ring.config.strokeWidth = 6;
    ring.config.lineCap = "round";
    ring.config.strokeColor = COLORS[i];
    ring.config.progressBackground = "#1f2a3a";
    ring.config.percentageFontColor = "#d7e0ec";
    ring.config.progressLabel = false;
    ring.config.duration = reducedMotion ? 0 : 420;
    ring.config.easing = "swingEaseOut";
    const upload = { row, canvas, ring, name, value: 0, timer: null };
    ring.config.callback = progress => {
        labelRing(canvas, name, progress);
        if (progress >= 100) {
            row.className = "panel up done";
            row.querySelector(".state").textContent = "done";
            checkAllDone();
        }
    };
    ring.draw(canvas, 0);
    onResize(canvas, () => ring.draw(canvas, upload.value));
    return upload;
});

function checkAllDone() {
    if (uploads.every(u => u.value >= 100)) $("#upNote").textContent = "all six callbacks fired at 100";
}

function step(upload) {
    //uneven chunks, like a real upload; a draw that lands mid-animation restarts from the frame shown
    upload.value = Math.min(100, upload.value + 4 + Math.random() * 22);
    upload.ring.draw(upload.canvas, Math.round(upload.value * 10) / 10);
    if (upload.value < 100) upload.timer = setTimeout(() => step(upload), 250 + Math.random() * 700);
}

$("#upStart").addEventListener("click", () => {
    $("#upNote").textContent = "uploading...";
    uploads.forEach(u => {
        if (u.value >= 100 || u.timer) return;
        u.row.className = "panel up busy";
        u.row.querySelector(".state").textContent = "uploading";
        u.timer = setTimeout(() => step(u), Math.random() * 400);
    });
});
$("#upStop").addEventListener("click", () => {
    uploads.forEach(u => {
        clearTimeout(u.timer); u.timer = null;
        u.ring.stop();
        if (u.value < 100) { u.row.className = "panel up"; u.row.querySelector(".state").textContent = "paused"; }
    });
    $("#upNote").textContent = "stop(): each ring frozen where it was";
});
$("#upReset").addEventListener("click", () => {
    uploads.forEach(u => {
        clearTimeout(u.timer); u.timer = null;
        u.value = 0;
        //destroy() clears and forgets the last value; drawing 0 then paints the empty ring
        u.ring.destroy();
        u.ring.draw(u.canvas, 0);
        u.row.className = "panel up";
        u.row.querySelector(".state").textContent = "queued";
    });
    $("#upNote").textContent = "";
});

/* ------------------------------------------------------------------ *
 * 6. Failure modes: each button makes one bad call
 * ------------------------------------------------------------------ */

//every call uses a throwaway shape object, so nothing above is disturbed
const BAD = [
    ["arc: start = 5",              () => { shapes.arc().config.start = 5; }],
    ["arc: strokeWidth = 0",        () => { shapes.arc().config.strokeWidth = 0; }],
    ["arc: radius = -2",            () => { shapes.arc().config.radius = -2; }],
    ['arc: lineCap = "square"',     () => { shapes.arc().config.lineCap = "square"; }],
    ['arc: easing = "elastic"',     () => { shapes.arc().config.easing = "elastic"; }],
    ["arc: strokeColor = 255",      () => { shapes.arc().config.strokeColor = 255; }],
    ['arc: clockWise = "yes"',      () => { shapes.arc().config.clockWise = "yes"; }],
    ['arc: duration = "1s"',        () => { shapes.arc().config.duration = "1s"; }],
    ["arc: draw(canvas, 140)",      () => { shapes.arc().draw(document.createElement("canvas"), 140); }],
    ['arc: draw(canvas, "50")',     () => { shapes.arc().draw(document.createElement("canvas"), "50"); }],
    ['arc: draw("#ring", 50)',      () => { shapes.arc().draw("#ring", 50); }],
    ["arc: draw(canvas, 50, 7)",    () => { shapes.arc().draw(document.createElement("canvas"), 50, 7); }],
    ["rect: segment = [10]",        () => { shapes.animatedRectangle().config.segment = [10]; }],
    ["rect: segment = [0, 4]",      () => { shapes.animatedRectangle().config.segment = [0, 4]; }],
    ["rect: iterationCount = 2.5",  () => { shapes.animatedRectangle().config.iterationCount = 2.5; }],
    ['rect: iterationCount = "forever"', () => { shapes.animatedRectangle().config.iterationCount = "forever"; }],
    ['rect: easing = "wobble"',     () => { shapes.animatedRectangle().config.easing = "wobble"; }],
    ["rect: radius = -1",           () => { shapes.animatedRectangle().config.radius = -1; }],
    ['rect: callback = "done"',     () => { shapes.animatedRectangle().config.callback = "done"; }],
    ["rect: draw(null)",            () => { shapes.animatedRectangle().draw(null); }],
    ["fixed: lineColor = 0",        () => { shapes.fixedRectangle().config.lineColor = 0; }],
    ['fixed: segment = "10,2"',     () => { shapes.fixedRectangle().config.segment = "10,2"; }],
    ["fixed: radius = NaN",         () => { shapes.fixedRectangle().config.radius = NaN; }]
];

BAD.forEach(([text, call]) => {
    const button = document.createElement("button");
    button.className = "tiny";
    button.textContent = text;
    button.addEventListener("click", () => {
        try {
            call();
            $("#errOut").textContent = text + "\nNo error thrown: that should not happen.";
        } catch (error) {
            //the validateX helpers throw TypeError, the shape-specific checks throw Error
            $("#errOut").textContent = text + "\n" + error.constructor.name + ": " + error.message;
        }
    });
    $("#badGrid").appendChild(button);
});

/* expose the shapes for console poking */
window.heroRing = heroRing;
window.playArc = playArc;
window.playRect = playRect;
window.playFixed = playFixed;
