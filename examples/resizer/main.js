/*
 * vUX Resizer — runnable example.
 *
 * Three things about this component shape the whole page:
 *
 *   1. `config` is read once, by initialize(). There is no live reconfiguration —
 *      to change a setting you destroy() the instance and build a new one. The
 *      playground below does exactly that on every control change.
 *   2. The module writes a *size* onto the target and nothing else. Where the
 *      element sits, and therefore which way it appears to grow, stays the page's
 *      problem. Section 03 is that problem solved with flexbox.
 *   3. Handles are identified by class name, globally. Styles pushed through
 *      config.resizeHandlerProperties.styles generate rules against
 *      `.resizeHandle.x` / `.resizeHandle.y`, so they reach every Resizer on the
 *      page — this file styles most boxes from the page's own CSS instead, and
 *      uses the config route only in the playground, where seeing it work is
 *      the point.
 */
import { Resizer } from "../../vUX-resizer.js";

const $ = (sel, root = document) => root.querySelector(sel);

/* ------------------------------------------------------------------ *
 * 1. Hero — both axes, clamped
 * ------------------------------------------------------------------ */

const heroBox = $("#heroBox");
const heroDim = $("#heroDim");

const heroResizer = new Resizer("#heroBox");

//`parent` is the element the handles get appended to. It is the target itself here,
//which is the usual arrangement — the module gives it position:relative if it has
//no positioning of its own, so the absolutely-positioned handles land on its edges.
heroResizer.config.resizeHandlerProperties = {
    parent: heroBox,
    direction: "both",
    position: { x: "right", y: "bottom" }
};

//0 is the "unset" sentinel for every one of these, so a bound you do not care
//about is written as 0 rather than omitted.
heroResizer.config.thresholdValues = {
    minWidth: 220, maxWidth: 980,
    minHeight: 120, maxHeight: 520
};

//The callback receives the Resizer, not the event — read the size off the instance.
heroResizer.config.callBack = function (r) {
    heroDim.innerHTML = r.resizedWidth + " &times; " + r.resizedHeight;
};

heroResizer.initialize();

//The hero box is sized by CSS as min(760px, 100%), so its real width on load is not
//knowable from the stylesheet. Seed the readout from the rendered box.
heroDim.innerHTML = heroBox.offsetWidth + " &times; " + heroBox.offsetHeight;

/* ------------------------------------------------------------------ *
 * 2. Playground — every config property, rebuilt on each change
 * ------------------------------------------------------------------ */

const playBox = $("#playBox");
const playCode = $("#playCode");
const playStatus = $("#playStatus");
const playStatusText = $("#playStatusText");
const rW = $("#rW"), rH = $("#rH"), rC = $("#rC");

let playResizer = null;
let callbackHits = 0;

const controls = {
    direction: $("#cDirection"),
    posX: $("#cPosX"),
    posY: $("#cPosY"),
    style: $("#cStyle"),
    styleOn: $("#cStyleOn"),
    minW: $("#cMinW"), maxW: $("#cMaxW"),
    minH: $("#cMinH"), maxH: $("#cMaxH"),
    callback: $("#cCallback")
};

function readSettings() {
    return {
        direction: controls.direction.value,
        posX: controls.posX.value,
        posY: controls.posY.value,
        style: controls.styleOn.checked ? controls.style.value : "",
        minWidth: parseInt(controls.minW.value, 10),
        maxWidth: parseInt(controls.maxW.value, 10),
        minHeight: parseInt(controls.minH.value, 10),
        maxHeight: parseInt(controls.maxH.value, 10),
        callback: controls.callback.checked
    };
}

function buildPlayResizer() {
    const s = readSettings();

    //destroy() is what makes a control panel possible at all. Without it the old
    //instance would keep its listeners and leave its handles in the box, so every
    //change would stack another live Resizer on the same element.
    if (playResizer != null) playResizer.destroy();

    playResizer = new Resizer("#playBox");

    const props = {
        parent: playBox,
        direction: s.direction,
        position: { x: s.posX, y: s.posY }
    };

    //styles.both fills in for whichever axis has no style of its own, so one entry
    //covers direction:"both" without repeating itself.
    if (s.style !== "") props.styles = { both: "background-color:" + s.style };

    playResizer.config.resizeHandlerProperties = props;

    playResizer.config.thresholdValues = {
        minWidth: s.minWidth, maxWidth: s.maxWidth,
        minHeight: s.minHeight, maxHeight: s.maxHeight
    };

    if (s.callback) {
        playResizer.config.callBack = function (r) {
            callbackHits++;
            rW.textContent = r.resizedWidth;
            rH.textContent = r.resizedHeight;
            rC.textContent = callbackHits;
            playStatus.classList.add("run");
            playStatusText.textContent = "resizing";
            clearTimeout(r._idle);
            r._idle = setTimeout(function () {
                playStatus.classList.remove("run");
                playStatusText.textContent = "idle";
            }, 400);
        };
    }

    playResizer.initialize();
    window.playResizer = playResizer;
    renderCode(s);
}

function esc(v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

function renderCode(s) {
    const q = (v) => '<span class="s">"' + esc(v) + '"</span>';
    const n = (v) => '<span class="p">' + v + '</span>';
    let out = "";
    out += '<span class="k">const</span> r = <span class="k">new</span> Resizer(' + q("#playBox") + ');\n\n';
    out += "r.config.resizeHandlerProperties = {\n";
    out += "    parent: box,\n";
    out += "    direction: " + q(s.direction) + ",\n";
    out += "    position: { x: " + q(s.posX) + ", y: " + q(s.posY) + " }";
    if (s.style !== "") {
        out += ",\n    styles: { both: " + q("background-color:" + s.style) + " }";
    }
    out += "\n};\n\n";
    out += "r.config.thresholdValues = {\n";
    out += "    minWidth: " + n(s.minWidth) + ", maxWidth: " + n(s.maxWidth) + ",\n";
    out += "    minHeight: " + n(s.minHeight) + ", maxHeight: " + n(s.maxHeight) + "\n";
    out += "};\n";
    if (s.callback) {
        out += '\nr.config.callBack = <span class="k">function</span> (r) {\n';
        out += '    <span class="c">//r.resizedWidth, r.resizedHeight</span>\n};\n';
    }
    out += "\nr.initialize();";
    playCode.innerHTML = out;
}

//Keep the number beside each slider in step with it.
function bindReadout(input, out) {
    const el = $(out);
    input.addEventListener("input", function () { el.textContent = input.value; });
}
bindReadout(controls.minW, "#cMinWVal");
bindReadout(controls.maxW, "#cMaxWVal");
bindReadout(controls.minH, "#cMinHVal");
bindReadout(controls.maxH, "#cMaxHVal");
controls.style.addEventListener("input", function () {
    $("#cStyleVal").textContent = controls.style.value;
});

//"change", never "input": every rebuild destroys and re-creates the instance, and
//"input" on a slider or a colour picker would do that on every pixel of travel.
Object.keys(controls).forEach(function (key) {
    controls[key].addEventListener("change", buildPlayResizer);
});

$("#playReset").addEventListener("click", function () {
    //The module writes width/height inline; clearing them hands the box back to CSS.
    playBox.style.width = "";
    playBox.style.height = "";
    callbackHits = 0;
    rC.textContent = "0";
    rW.textContent = playBox.offsetWidth;
    rH.textContent = playBox.offsetHeight;
});

buildPlayResizer();
rW.textContent = playBox.offsetWidth;
rH.textContent = playBox.offsetHeight;

/* ------------------------------------------------------------------ *
 * 3. A consumer-supplied handle
 * ------------------------------------------------------------------ */

const splitSide = $("#splitSide");
const splitPill = $("#splitPill");

const splitResizer = new Resizer("#splitSide");

//The class name of your own element — "grip" or ".grip", both are accepted. It has to
//be a class rather than an id, because the module matches with classList and closest().
splitResizer.config.myResizeHandler = "grip";

//Still worth setting: `direction` is what lets the module resolve the axis for a
//handle that carries no `x`/`y` marker class, and `position` supplies the edge that
//decides which way a drag grows the element. No `parent` — nothing is being built.
splitResizer.config.resizeHandlerProperties = {
    direction: "x",
    position: { x: "right" }
};

splitResizer.config.thresholdValues = {
    minWidth: 150, maxWidth: 520, minHeight: 0, maxHeight: 0
};

splitResizer.config.callBack = function (r) {
    splitPill.textContent = r.resizedWidth + "px";
    splitPill.classList.add("on");
};

splitResizer.initialize();

/* ------------------------------------------------------------------ *
 * 4. All four edges
 * ------------------------------------------------------------------ */

//One helper, four instances. The only thing that varies is the axis and the edge.
function edgeResizer(selector, axis, edge) {
    const el = $(selector);
    const r = new Resizer(selector);
    const position = (axis === "x") ? { x: edge } : { y: edge };

    r.config.resizeHandlerProperties = { parent: el, direction: axis, position: position };
    r.config.thresholdValues = (axis === "x")
        ? { minWidth: 60, maxWidth: 260, minHeight: 0, maxHeight: 0 }
        : { minWidth: 0, maxWidth: 0, minHeight: 52, maxHeight: 210 };
    r.initialize();
    return r;
}

const edges = {
    right:  edgeResizer("#edgeR", "x", "right"),
    left:   edgeResizer("#edgeL", "x", "left"),
    bottom: edgeResizer("#edgeB", "y", "bottom"),
    top:    edgeResizer("#edgeT", "y", "top")
};

/* ------------------------------------------------------------------ *
 * 5. Teardown
 * ------------------------------------------------------------------ */

const lifeBox = $("#lifeBox");
const lifeLog = $("#lifeLog");
const hCount = $("#hCount");

let lifeResizer = new Resizer("#lifeBox");
lifeResizer.config.resizeHandlerProperties = {
    parent: lifeBox, direction: "x", position: { x: "right" }
};
lifeResizer.config.thresholdValues = { minWidth: 140, maxWidth: 0, minHeight: 0, maxHeight: 0 };

function logLife(line) {
    lifeLog.textContent += line + "\n";
    lifeLog.scrollTop = lifeLog.scrollHeight;
    //Counting the handles in the target is the visible proof that destroy() cleaned up.
    hCount.textContent = lifeBox.querySelectorAll(".resizeHandle").length;
}

$("#lifeInit").addEventListener("click", function () {
    const before = lifeBox.querySelectorAll(".resizeHandle").length;
    lifeResizer.initialize();
    const after = lifeBox.querySelectorAll(".resizeHandle").length;
    logLife(before === after
        ? "initialize() — already live, no-op (handles still " + after + ")"
        : "initialize() — handles " + before + " -> " + after);
});

$("#lifeDestroy").addEventListener("click", function () {
    const before = lifeBox.querySelectorAll(".resizeHandle").length;
    lifeResizer.destroy();
    const after = lifeBox.querySelectorAll(".resizeHandle").length;
    logLife(before === after
        ? "destroy() — nothing live, no-op (handles still " + after + ")"
        : "destroy() — handles " + before + " -> " + after);
});

lifeResizer.initialize();
logLife("initialize() — handles 0 -> " + lifeBox.querySelectorAll(".resizeHandle").length);

/* ------------------------------------------------------------------ *
 * 6. Validation
 * ------------------------------------------------------------------ */

const errOut = $("#errOut");

//Each case is a thunk that is *meant* to throw. Nothing here is caught inside the
//library: the setters throw synchronously, out of the assignment itself, so a
//misconfiguration surfaces in your own stack rather than in a timer later on.
const cases = {
    ctor:            () => new Resizer(42),
    missing:         () => new Resizer("#nothing").initialize(),
    emptyProps:      () => { spare().config.resizeHandlerProperties = {}; },
    unknownProp:     () => { spare().config.resizeHandlerProperties = { handle: 1 }; },
    direction:       () => { spare().config.resizeHandlerProperties = { direction: "z" }; },
    position:        () => { spare().config.resizeHandlerProperties = { position: { x: "middle" } }; },
    parent:          () => { spare().config.resizeHandlerProperties = { parent: "#playBox" }; },
    noParent:        () => { spare().initialize(); },
    thresholdType:   () => { spare().config.thresholdValues = "200"; },
    thresholdKey:    () => { spare().config.thresholdValues = { width: 200 }; },
    thresholdValue:  () => { spare().config.thresholdValues = { minWidth: "200" }; },
    handlerType:     () => { spare().config.myResizeHandler = 5; },
    callback:        () => { spare().config.callBack = "nope"; }
};

//A throwaway instance per attempt, over a real element, so a rejected setter cannot
//leave one of the page's working Resizers in a half-configured state.
function spare() { return new Resizer("#errOut"); }

document.querySelectorAll("[data-err]").forEach(function (btn) {
    btn.addEventListener("click", function () {
        const key = btn.getAttribute("data-err");
        try {
            cases[key]();
            errOut.textContent = "No error thrown — that is itself a bug.\n\n" + btn.textContent;
        } catch (e) {
            errOut.textContent = btn.textContent.trim() + "\n\n" + e.name + ": " + e.message;
        }
    });
});

/* Exposed for the console. */
window.heroResizer = heroResizer;
window.splitResizer = splitResizer;
window.lifeResizer = lifeResizer;
window.edgeResizers = edges;
