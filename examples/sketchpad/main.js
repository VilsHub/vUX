/*
 * vUX SketchPad — runnable example.
 *
 * Three pads share this page: the whiteboard in the hero (`pad`), a constrained pad laid
 * over an invitation card (`card`) and a stamp pad on paper (`paper`). They are the same
 * component with different config: a SketchPad's look and its rules are all settings.
 *
 * Two things about the API shape everything below:
 *  - `.config` is write-only, as across vUX. The page keeps its own copy (`cfg`) of what
 *    it set, which is what the "Equivalent code" panel prints and what a rebuild reapplies.
 *  - Callbacks receive the pad as their last argument. Use that rather than the variable
 *    you assign the pad to: `change` already fires once inside initialize(), before
 *    `const pad = ...` has finished assigning.
 */
import { SketchPad } from "../../vUX-sketchPad.js";

const $ = sel => document.querySelector(sel);

/* the page's design tokens, so pad colours and the stylesheet cannot drift apart */
const T = {
    ink:"#080b11", line:"#1f2a3a", fg:"#d7e0ec", muted:"#7b8ba3",
    amber:"#ffb454", cyan:"#5ccfe6", green:"#a7e05f", red:"#ff6b7f", violet:"#c8a2ff"
};

/* ------------------------------------------------------------------ *
 * Stamps: SVG source, inline so the page needs no network
 * ------------------------------------------------------------------ */

//Mono: no colours of their own, so they render black and take the fill colour once placed.
const SVG_HEART = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8.4 2.2 4.5 6 4.5c2.2 0 3.6 1.3 4.5 2.6.9-1.3 2.3-2.6 4.5-2.6 3.8 0 5.6 3.9 4 7.2C19.5 16.4 12 21 12 21z"/></svg>`;
const SVG_SPARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z"/></svg>`;
//Coloured: explicit fills, so it is not mono and keeps them.
const SVG_SUN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48"><g stroke="#ffb454" stroke-width="3" stroke-linecap="round"><path d="M24 3v6M24 39v6M3 24h6M39 24h6M9 9l4.2 4.2M34.8 34.8L39 39M9 39l4.2-4.2M34.8 13.2L39 9"/></g><circle cx="24" cy="24" r="10" fill="#ffb454"/><circle cx="24" cy="24" r="5" fill="#c8a2ff"/></svg>`;

//The same encoding createStamp() uses, done synchronously so the seed scene can carry an image.
const svgDataUrl = svg => "data:image/svg+xml;base64," + btoa(svg);

/* ------------------------------------------------------------------ *
 * 1. The whiteboard
 * ------------------------------------------------------------------ */

//A starting scene, in scene (world) coordinates. Two connectors are bound to the shapes
//they join: startBind/endBind hold the target's id and a spot on its border as a 0..1
//fraction of its box, so they re-route when you move either shape.
const SEED = [
    { id:1, type:"rect", x:60, y:70, w:210, h:110, stroke:T.cyan, fill:"#5ccfe61f", strokeWidth:2, lineStyle:"solid", dashGap:8 },
    { id:2, type:"text", x:96, y:108, text:"pointer in", fontSize:26, stroke:T.fg },
    { id:3, type:"ellipse", x:420, y:60, w:190, h:130, stroke:T.amber, fill:"#ffb4541a", strokeWidth:2, lineStyle:"solid", dashGap:8 },
    { id:4, type:"text", x:465, y:111, text:"scene", fontSize:26, stroke:T.fg },
    { id:5, type:"arrow", x:270, y:125, x2:420, y2:125, stroke:T.fg, strokeWidth:2, lineStyle:"solid", dashGap:8,
      startBind:{ id:1, tx:1, ty:0.5 }, endBind:{ id:3, tx:0, ty:0.5 } },
    { id:6, type:"diamond", x:720, y:70, w:150, h:110, stroke:T.violet, fill:"transparent", strokeWidth:2, lineStyle:"dashed", dashGap:8 },
    { id:7, type:"hexagon", x:640, y:290, w:130, h:112, stroke:T.red, fill:"#ff6b7f14", strokeWidth:3, lineStyle:"dotted", dashGap:7 },
    //a curved connector: two joints (pts), each rounded where its segments meet
    { id:8, type:"arrow", x:515, y:190, x2:705, y2:290, pts:[[515,240],[705,240]], stroke:T.amber, strokeWidth:2, lineStyle:"dashed", dashGap:8,
      startBind:{ id:3, tx:0.5, ty:1 }, endBind:{ id:7, tx:0.5, ty:0 } },
    { id:9, type:"star", x:110, y:250, w:120, h:118, stroke:T.green, fill:"#a7e05f26", strokeWidth:2, lineStyle:"solid", dashGap:8 },
    //freehand ink is a point list, smoothed with quadratic curves when drawn
    { id:10, type:"pen", stroke:T.cyan, strokeWidth:3, lineStyle:"solid", dashGap:8,
      points:Array.from({ length:48 }, (_, i) => [290 + i * 6.5, 340 + Math.sin(i / 4.2) * 26 - i * 0.5]) },
    { id:11, type:"text", x:300, y:410, text:"drag anything · double-click to type", fontSize:17, stroke:T.muted },
    { id:12, type:"image", x:820, y:300, w:84, h:84, dataUrl:svgDataUrl(SVG_SUN) }
];

const TOOLS = [
    ["select", "➤", "V"], ["pan", "✥", "H"], ["rect", "▭", "R"], ["ellipse", "◯", "O"],
    ["diamond", "◇", "D"], ["triangle", "△", "3"], ["pentagon", "⬠", "5"], ["hexagon", "⬡", "6"],
    ["star", "★", "S"], ["line", "─", "L"], ["arrow", "→", "A"], ["pen", "✎", "P"],
    ["text", "T", "T"], ["icon", "❀", ""], ["stamp", "⬚", ""]
];
//config.shortcuts REPLACES the map rather than merging into it, so turning shortcuts back
//on means handing the whole default map over again.
const DEFAULT_SHORTCUTS = {
    v:"select", h:"pan", r:"rect", o:"ellipse", d:"diamond", "3":"triangle", "5":"pentagon",
    "6":"hexagon", s:"star", l:"line", a:"arrow", p:"pen", t:"text"
};

//The page's copy of the hero pad's config. The defaults that differ from the library's
//are the colours, chosen to sit on this page's dark board.
const cfg = {
    tools: TOOLS.map(t => t[0]),
    grid: true, gridColor: T.line, accentColor: T.amber,
    panZoom: true, bounded: false, returnToSelect: true,
    maxElements: 0, historyLimit: 100, shortcuts: true,
    keyboardScope: "element", invert: false
};
const style = { stroke: T.fg, fill: "transparent", strokeWidth: 2, fontSize: 24, lineStyle: "solid", dashGap: 8 };

const board = $("#board");
const toolBox = $("#tools");
const logEl = $("#log");
const json = $("#sceneJson");
//declared before the first pad is built: its callbacks run inside initialize()
let renders = 0, statusQueued = false;
const lines = [];
let heroStamp = null;                       //armed once createStamp() resolves
const ICON = { family: "serif", char: "❀" }; //a font glyph for the icon tool; any loaded font works

function buildPad(scene, camera, tool) {
    const p = new SketchPad(board);
    //keyboardScope is read by initialize() and refused after it, so it goes first
    p.config.keyboardScope = cfg.keyboardScope;
    p.config.tools = cfg.tools;
    p.config.grid = cfg.grid;
    p.config.gridColor = cfg.gridColor;
    p.config.accentColor = cfg.accentColor;
    p.config.panZoom = cfg.panZoom;
    p.config.bounded = cfg.bounded;
    p.config.returnToSelect = cfg.returnToSelect;
    p.config.maxElements = cfg.maxElements;
    p.config.historyLimit = cfg.historyLimit;
    p.config.shortcuts = cfg.shortcuts ? DEFAULT_SHORTCUTS : {};
    p.config.style = style;
    p.config.callbacks = {
        change: onChange,
        toolChange: (t, pad) => { markTool(t); log("toolChange", JSON.stringify(t)); },
        zoomChange: (z) => { $("#stZoom").textContent = Math.round(z * 100) + "%"; log("zoomChange", z.toFixed(2), true); }
    };
    p.initialize();
    p.counterInvertImages = cfg.invert;
    p.icon = ICON;
    if (heroStamp) p.stamp = heroStamp;
    p.load(scene);
    if (camera) p.camera = camera;
    if (tool && cfg.tools.includes(tool)) p.tool = tool;
    return p;
}

let pad = buildPad(SEED);
window.pad = pad;
//Fit the seed scene to the board, and keep fitting as the board resizes (a rotated phone,
//a late layout) until someone touches the view; after that the camera is theirs.
let viewTouched = false;
board.addEventListener("pointerdown", () => { viewTouched = true; }, true);
board.addEventListener("wheel", () => { viewTouched = true; }, true);
new ResizeObserver(() => { if (!viewTouched) fitView(); }).observe(board);

pad.createStamp(SVG_SUN).then(s => { heroStamp = s; pad.stamp = s; });

/* ---------- toolbar ---------- */

for (const [name, glyph, key] of TOOLS) {
    const b = document.createElement("button");
    b.textContent = glyph;
    b.dataset.tool = name;
    b.title = name + (key ? " (" + key + ")" : "") + (name == "icon" ? ": places ❀" : name == "stamp" ? ": places the sun" : "");
    b.addEventListener("click", () => { pad.tool = name; board.focus(); });
    toolBox.appendChild(b);
}
function markTool(t) {
    toolBox.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.dataset.tool == t));
    $("#stTool").textContent = t;
}
function showTools() {
    toolBox.querySelectorAll("button").forEach(b => { b.hidden = !cfg.tools.includes(b.dataset.tool); });
}
markTool(pad.tool);

//Every action goes through the pad's public API: the keyboard shortcuts and these buttons
//end up in the same place.
$("#undo").onclick = () => pad.undo();
$("#redo").onclick = () => pad.redo();
$("#dup").onclick = () => pad.duplicateSelected();
$("#del").onclick = () => pad.deleteSelected();
$("#all").onclick = () => pad.selectAll();
$("#zoomIn").onclick = () => pad.zoomBy(1.2);
$("#zoomOut").onclick = () => pad.zoomBy(1 / 1.2);
$("#zoomFit").onclick = fitView;
$("#clear").onclick = () => pad.clear(); //undoable: clear() records a history step

//The pad has no "fit" of its own; the camera is plain data, so the page computes one.
function sceneBounds(els) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const add = (x, y) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); };
    for (const el of els) {
        if (el.type == "line" || el.type == "arrow") { add(el.x, el.y); add(el.x2, el.y2); (el.pts || []).forEach(p => add(...p)); }
        else if (el.type == "pen") el.points.forEach(p => add(...p));
        else if (el.type == "text") { add(el.x, el.y); add(el.x + el.text.length * el.fontSize * 0.55, el.y + el.fontSize * 1.25); }
        else if (el.type == "icon") { add(el.x, el.y); add(el.x + el.size, el.y + el.size); }
        else { add(el.x, el.y); add(el.x + el.w, el.y + el.h); }
    }
    return x0 == Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function fitView() {
    const b = sceneBounds(pad.elements);
    if (!b) { pad.resetView(); return; }
    const W = board.clientWidth, H = board.clientHeight, m = 28;
    const zoom = Math.min(1.25, (W - m * 2) / b.w, (H - m * 2) / b.h);
    //camera.x/y is the scene point at the board's top-left corner
    pad.camera = { x: b.x + b.w / 2 - W / (2 * zoom), y: b.y + b.h / 2 - H / (2 * zoom), zoom };
}

/* ---------- status, log, scene JSON ---------- */

function onChange(p) {
    renders++;
    //change fires on every repaint (each pointermove of a drag), so keep this cheap and
    //push anything heavier to the next frame
    $("#renders").textContent = renders + " renders";
    if (!statusQueued) { statusQueued = true; requestAnimationFrame(() => { statusQueued = false; refreshStatus(p); }); }
}
function refreshStatus(p) {
    if (p !== pad) return; //a destroyed pad's last frame
    const n = p.elements.length, s = p.selection.length;
    $("#stCount").textContent = n + (n == 1 ? " element" : " elements") + (cfg.maxElements ? " / " + cfg.maxElements : "");
    $("#stSel").textContent = s ? s + " selected" : "nothing selected";
    $("#stTool").textContent = p.tool + (p.editing ? " · typing" : "");
    showJson(p);
}

//zoomChange fires on every wheel step; collapse a run of them into one line
function log(name, detail, collapse = false) {
    const line = name + "(" + detail + ")";
    if (collapse && lines.length && lines[lines.length - 1].startsWith(name)) lines[lines.length - 1] = line;
    else lines.push(line);
    if (lines.length > 60) lines.shift();
    logEl.textContent = lines.join("\n");
    logEl.scrollTop = logEl.scrollHeight;
}
log("initialize", "");

//one element per line, numbers rounded: readable, and still valid input for load()
function sceneText(els) {
    const round = (k, v) => typeof v == "number" ? Math.round(v * 100) / 100 : v;
    return "[\n  " + els.map(el => JSON.stringify(el, round)).join(",\n  ") + "\n]";
}
//Once someone edits the text it stops following the board, so a stray repaint (or the
//blur of clicking load()) cannot throw their edit away. load() or "Follow" resumes it.
let jsonEdited = false;
function showJson(p) {
    if (jsonEdited) return;
    json.value = sceneText(p.elements);
}
json.addEventListener("input", () => {
    if (!jsonEdited) jsonStatus("", "edited: no longer following the board until load() or Follow");
    jsonEdited = true;
});
function jsonStatus(state, text) {
    $("#jsonStatus").className = "status" + (state ? " " + state : "");
    $("#jsonStatusText").textContent = text;
}
$("#jsonLoad").onclick = () => {
    try {
        //{history: true} makes the replacement one undo step, so Ctrl+Z brings the old scene back
        pad.load(JSON.parse(json.value), { history: true });
        jsonEdited = false;
        showJson(pad);
        jsonStatus("run", "loaded " + pad.elements.length + " elements; undo() reverts");
    } catch (e) {
        jsonStatus("err", e.name + ": " + e.message);
    }
};
$("#jsonCopy").onclick = async () => {
    try { await navigator.clipboard.writeText(json.value); jsonStatus("run", "copied"); }
    catch { json.select(); jsonStatus("err", "clipboard unavailable; the text is selected, copy it by hand"); }
};
$("#jsonFollow").onclick = () => {
    jsonEdited = false;
    showJson(pad);
    jsonStatus("", "follows the board; edit it and press load()");
};

/* ---------- export ---------- */

let exportUrl = null;
$("#exRun").onclick = () => {
    const bg = $("#exBg").value;
    //Cropped to the content plus the margin, never counter-inverted: an export always
    //comes out as stored, whatever the page does to the board on screen.
    const c = pad.exportCanvas({ scale: 2, margin: 32, background: bg });
    if (!c) { $("#exInfo").textContent = "the scene is empty: exportCanvas() returned null"; return; }
    c.toBlob(blob => {
        if (exportUrl) URL.revokeObjectURL(exportUrl);
        exportUrl = URL.createObjectURL(blob);
        $("#exView").innerHTML = "";
        const img = new Image();
        img.src = exportUrl;
        img.alt = "exported scene";
        if (bg == "transparent") img.style.background = "repeating-conic-gradient(#1f2a3a 0 25%, #141c2a 0 50%) 0 0/16px 16px";
        $("#exView").appendChild(img);
        $("#exInfo").textContent = c.width + " × " + c.height + " px, " + Math.round(blob.size / 1024) + " KB";
        const a = $("#exDl");
        a.href = exportUrl;
        a.hidden = false;
    });
};

/* ---------- setStyle() sidebar ---------- */

//setStyle() changes the default for new elements AND restyles the selection, as one undo
//step each. 'change' rather than 'input' keeps a colour-picker drag to one step.
function restyle(changes) { Object.assign(style, changes); pad.setStyle(changes); }

$("#stStroke").addEventListener("change", e => restyle({ stroke: e.target.value }));
$("#stFillOn").addEventListener("change", e => {
    $("#stFill").disabled = !e.target.checked;
    restyle({ fill: e.target.checked ? $("#stFill").value : "transparent" });
});
$("#stFill").addEventListener("change", e => restyle({ fill: e.target.value }));
for (const [id, key] of [["stWidth", "strokeWidth"], ["stGap", "dashGap"], ["stFont", "fontSize"]]) {
    const input = $("#" + id);
    input.addEventListener("input", () => { $("#" + id + "V").textContent = input.value; });
    input.addEventListener("change", () => restyle({ [key]: Number(input.value) }));
}
$("#stLine").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    $("#stLine").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
    restyle({ lineStyle: b.dataset.v });
});

/* ------------------------------------------------------------------ *
 * 2. Config playground (section 01)
 * ------------------------------------------------------------------ */

const cErr = $("#cErr");
//Every setter validates and throws; the playground shows the message instead of failing silently.
function setConfig(key, value, apply) {
    try {
        apply();
        cfg[key] = value;
        cErr.textContent = "";
    } catch (e) {
        cErr.textContent = e.name + ": " + e.message;
    }
    snippet();
}

const checks = $("#toolChecks");
for (const [name] of TOOLS) {
    const l = document.createElement("label");
    l.className = "switch";
    l.innerHTML = `<input type="checkbox" value="${name}" checked${name == "select" ? " disabled" : ""}> ${name}`;
    checks.appendChild(l);
}
checks.addEventListener("change", () => {
    const list = [...checks.querySelectorAll("input:checked")].map(i => i.value);
    //a tool that is switched off while active sends the pad back to select by itself
    setConfig("tools", list, () => { pad.config.tools = list; });
    showTools();
    $("#toolsCount").textContent = cfg.tools.length + " of " + TOOLS.length;
});
$("#toolsCount").textContent = TOOLS.length + " of " + TOOLS.length;

const flag = (id, key, after) => $(id).addEventListener("change", e => {
    const v = e.target.checked;
    setConfig(key, v, () => { pad.config[key] = v; });
    if (after) after(v);
});
flag("#cGrid", "grid");
flag("#cPanZoom", "panZoom");
flag("#cBounded", "bounded");
flag("#cReturn", "returnToSelect");
$("#cShortcuts").addEventListener("change", e => {
    const on = e.target.checked;
    setConfig("shortcuts", on, () => { pad.config.shortcuts = on ? DEFAULT_SHORTCUTS : {}; });
});
$("#cInvert").addEventListener("change", e => {
    const on = e.target.checked;
    //counterInvertImages is a property on the pad, not config: a page flips it with its theme
    setConfig("invert", on, () => { pad.counterInvertImages = on; });
    board.classList.toggle("inverted", on);
});
$("#cGridColor").addEventListener("input", e => setConfig("gridColor", e.target.value, () => { pad.config.gridColor = e.target.value; }));
$("#cAccent").addEventListener("input", e => setConfig("accentColor", e.target.value, () => { pad.config.accentColor = e.target.value; }));
//Number() on purpose: "" or "2.5" reach the setter and are refused there, which is the point
$("#cMax").addEventListener("change", e => { const v = Number(e.target.value); setConfig("maxElements", v, () => { pad.config.maxElements = v; }); refreshStatus(pad); });
$("#cHistory").addEventListener("change", e => { const v = Number(e.target.value); setConfig("historyLimit", v, () => { pad.config.historyLimit = v; }); });

$("#cScope").addEventListener("change", e => {
    //keyboardScope cannot change on a live pad, so rebuild around the same scene, view and
    //tool. destroy() removes the canvas and every listener; the host element stays.
    const scene = pad.elements, camera = pad.camera, tool = pad.tool;
    pad.destroy();
    cfg.keyboardScope = e.target.value;
    pad = buildPad(scene, camera, tool);
    window.pad = pad;
    log("rebuild", "keyboardScope: " + JSON.stringify(cfg.keyboardScope));
    snippet();
});

/* the "Equivalent code" panel: what the current settings look like as a consumer's code */
function snippet() {
    const k = s => `<span class="k">${s}</span>`, s = v => `<span class="s">${v}</span>`, p = v => `<span class="p">${v}</span>`, c = v => `<span class="c">${v}</span>`;
    const val = v => typeof v == "string" ? s(JSON.stringify(v)) : p(JSON.stringify(v));
    const out = [];
    out.push(`${k("const")} pad = ${k("new")} SketchPad(document.querySelector(${s('"#board"')}));`);
    if (cfg.tools.length != TOOLS.length) out.push(`pad.config.tools = [${cfg.tools.map(t => s(JSON.stringify(t))).join(", ")}];`);
    else out.push(c("// config.tools: all fifteen (the default)"));
    for (const key of ["keyboardScope", "grid", "gridColor", "accentColor", "panZoom", "bounded", "returnToSelect", "maxElements", "historyLimit"]) {
        out.push(`pad.config.${key} = ${val(cfg[key])};`);
    }
    out.push(cfg.shortcuts ? c("// config.shortcuts: the default V/H/R/O/D/3/5/6/S/L/A/P/T map") : `pad.config.shortcuts = {};`);
    out.push(`pad.config.style = { stroke: ${s(JSON.stringify(style.stroke))}, fontSize: ${p(style.fontSize)} };`);
    out.push(`pad.config.callbacks = { change, toolChange, zoomChange };`);
    out.push(`pad.initialize();`);
    if (cfg.invert) out.push(`pad.counterInvertImages = ${p("true")};`);
    out.push(`pad.load(scene);`);
    $("#snippet").innerHTML = out.join("\n");
}
snippet();

/* ------------------------------------------------------------------ *
 * 3. Constrained: one box on a card (section 03)
 * ------------------------------------------------------------------ */

const surface = $("#cardSurface");
const card = new SketchPad(surface);
card.config.tools = ["select", "rect"];   //no connectors, no double-click text
card.config.panZoom = false;              //the card never scrolls or zooms
card.config.bounded = true;               //drawing, moving and resizing stay on the card
card.config.maxElements = 1;              //one name box
card.config.grid = false;                 //the canvas is transparent; the card shows through
card.config.shortcuts = {};
card.config.accentColor = T.cyan;
card.config.style = { stroke: T.amber, fill: "#ffb4541f", strokeWidth: 2, lineStyle: "dashed", dashGap: 6 };
card.config.callbacks = {
    change: p => updateCard(p),
    toolChange: t => {
        $("#bDraw").classList.toggle("primary", t == "rect");
        $("#bSelect").classList.toggle("primary", t == "select");
    }
};
card.initialize();
window.card = card;

$("#bDraw").onclick = () => { card.tool = "rect"; };
$("#bSelect").onclick = () => { card.tool = "select"; };
$("#bDelete").onclick = () => {
    const box = card.elements[0];
    if (!box) return;
    card.select([box.id]);
    card.deleteSelected();
};

function updateCard(p) {
    const box = p.elements[0];
    $("#bDraw").disabled = !!box;
    $("#bDelete").disabled = !box;
    if (!box) {
        $("#bReadout").innerHTML = "No box yet. Press <b>Draw box</b> and drag across the card.";
        return;
    }
    //The pad stores surface pixels. Percentages of the surface survive the card being
    //shown at a different size, which is what a server stamping the full-size image needs.
    const W = surface.clientWidth, H = surface.clientHeight;
    const pct = (v, of) => (v / of * 100).toFixed(1) + "%";
    const r = v => Math.round(v);
    $("#bReadout").innerHTML =
        `x <b>${r(box.x)}</b>px · <b>${pct(box.x, W)}</b><br>` +
        `y <b>${r(box.y)}</b>px · <b>${pct(box.y, H)}</b><br>` +
        `w <b>${r(box.w)}</b>px · <b>${pct(box.w, W)}</b><br>` +
        `h <b>${r(box.h)}</b>px · <b>${pct(box.h, H)}</b><br>` +
        `surface <b>${W} × ${H}</b>`;
}

/* ------------------------------------------------------------------ *
 * 4. Stamps (section 04)
 * ------------------------------------------------------------------ */

const paperEl = $("#paper");
const paper = new SketchPad(paperEl);
paper.config.tools = ["select", "stamp"];
paper.config.panZoom = false;
paper.config.bounded = true;
paper.config.gridColor = "#d9d2c3";
paper.config.accentColor = "#d6336c";
paper.config.returnToSelect = false;      //keep stamping until the user switches tool
paper.config.style = { fontSize: 32 };    //a stamp is placed at 2 × fontSize wide
paper.config.callbacks = { toolChange: t => { $("#stampHint").textContent = t == "stamp" ? "click the paper to place" : "select: move, resize, Del removes"; } };
paper.initialize();
window.paper = paper;

(async () => {
    //createStamp() decodes the SVG to learn its aspect ratio and checks whether it is mono
    const stamps = {
        heart: await paper.createStamp(SVG_HEART),
        spark: await paper.createStamp(SVG_SPARK),
        sun: await paper.createStamp(SVG_SUN)
    };
    $("#stampNote").innerHTML = `mono: heart <b>${stamps.heart.mono}</b>, spark <b>${stamps.spark.mono}</b>, sun <b>${stamps.sun.mono}</b>. ` +
        `Mono stamps land in black; select one and pick a fill.`;

    //A few placed up front with insertImage(), then one mono stamp re-tinted the same way
    //a user would: select it, then setStyle({fill}).
    const heartId = await paper.insertImage(stamps.heart.dataUrl, { mono: true, width: 72, at: { x: 90, y: 110 } });
    await paper.insertImage(stamps.spark.dataUrl, { mono: true, width: 56, at: { x: 190, y: 200 } });
    await paper.insertImage(stamps.sun.dataUrl, { width: 80, at: { x: 290, y: 100 } });
    paper.select([heartId]);
    paper.setStyle({ fill: $("#stampFill").value });
    paper.select([]);

    const pick = $("#stampPick");
    for (const [name, s] of Object.entries(stamps)) {
        const b = document.createElement("button");
        b.title = name + (s.mono ? " (mono)" : " (coloured)");
        b.innerHTML = `<img alt="${name}" src="${s.dataUrl}">`;
        b.onclick = () => {
            paper.stamp = s;            //arms it; the stamp tool places whatever is armed
            paper.tool = "stamp";
            pick.querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
        };
        pick.appendChild(b);
    }
    pick.firstChild.click();
})();

$("#stampFill").addEventListener("change", e => paper.setStyle({ fill: e.target.value }));

/* ------------------------------------------------------------------ *
 * 5. Failure modes (section 05)
 * ------------------------------------------------------------------ */

const BAD = {
    ctor:     () => new SketchPad("#board"),             //wants an element, not a selector
    tool:     () => { pad.tool = "lasso"; },
    disabled: () => { card.tool = "pen"; },              //a real tool, but not in card's config.tools
    style:    () => pad.setStyle({ strokeWidth: -2 }),
    styleKey: () => pad.setStyle({ colour: "red" }),
    scope:    () => { pad.config.keyboardScope = "document"; },
    early:    () => new SketchPad(document.createElement("div")).undo(),
    tools:    () => { pad.config.tools = ["rect"]; },   //every pad needs "select" to return to
    load:     () => card.load([{ x: 1 }]),               //checked before the scene is replaced
    max:      () => { pad.config.maxElements = 1.5; }
};
document.querySelectorAll("[data-bad]").forEach(b => b.addEventListener("click", () => {
    const out = $("#errOut");
    try {
        BAD[b.dataset.bad]();
        out.textContent = "Did not throw.";
    } catch (e) {
        out.textContent = e.name + ": " + e.message;
    }
}));
