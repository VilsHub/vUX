/*
 * vUX Carousel — runnable example.
 *
 * Every carousel here follows the same three steps: new Carousel(container, viewport),
 * set .config, then initialize() and start(). initialize() builds the dots and wires the
 * listeners; start() begins autoplay. They are separate so a carousel can be built paused.
 *
 * The markup contract lives in index.html's <style> block: the library positions slides
 * with percentages but sets no position/overflow/height itself, so the page must.
 */
import { Carousel } from "../../vUX-carousel.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);

//The viewport is always the container's first child. TouchHandler (which Carousel builds
//when touchResponse is on) drags container.children[0], whatever you passed as viewport.
const viewportOf = container => container.firstElementChild;

/* ------------------------------------------------------------------ *
 * 1. Hero
 * ------------------------------------------------------------------ */

const heroCarousel = new Carousel($("#heroCarousel"), $("#heroViewport"));
heroCarousel.config.delay = 2600;
heroCarousel.config.speed = 900;
heroCarousel.config.slideEffect = "cubic-bezier(.16,1,.3,1)";
//buttonStyle is plain CSS text for the normal and the active dot. It is scoped to this
//carousel, and beats carousel.css without !important.
heroCarousel.config.buttonStyle = [
    "width:10px;height:10px;background:rgba(255,255,255,.5)",
    "width:30px;border-radius:6px;background:#fff;box-shadow:0 0 14px rgba(255,255,255,.8)"
];
heroCarousel.initialize();
heroCarousel.start();

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const ui = {
    delay: $("#delay"), speed: $("#speed"), effect: $("#effect"),
    bsNormal: $("#bsNormal"), bsActive: $("#bsActive"), touch: $("#touch"),
    status: $("#status"), statusText: $("#statusText"), label: $("#playLabel"),
    snippet: $("#snippet"), bsState: $("#bsState")
};

let playCarousel = null;
let playState = "idle";       //"running" | "built" | "destroyed": config is write-only, so the page tracks state itself
let builtWithTouch = true;
let instanceNo = 0;

function setStatus(cls, text) {
    ui.status.className = "status" + (cls ? " " + cls : "");
    ui.statusText.textContent = text;
    ui.label.textContent = playState;
}

function buttonStyleValue() {
    //buttonStyle takes one or two strings: [normal] or [normal, active]
    const a = ui.bsNormal.value.trim(), b = ui.bsActive.value.trim();
    return b ? [a, b] : [a];
}

function buildPlay() {
    playCarousel = new Carousel($("#playCarousel"), $("#playViewport"));
    playCarousel.config.delay = Number(ui.delay.value);
    playCarousel.config.speed = Number(ui.speed.value);
    playCarousel.config.slideEffect = ui.effect.value;
    playCarousel.config.buttonStyle = buttonStyleValue();
    //touchResponse is read by initialize() to decide whether to build a TouchHandler at all.
    //After that the setter can only enable/disable the one it built, so remember which it was.
    playCarousel.config.touchResponse = ui.touch.checked;
    builtWithTouch = ui.touch.checked;
    playCarousel.initialize();
    playCarousel.start();
    window.playCarousel = playCarousel;
    playState = "running";
    $("#roInst").textContent = "#" + (++instanceNo);
    watchActive($("#playViewport"), $("#roActive"));
    setStatus("run", "autoplaying");
}

//Each setter below runs against the live instance. delay and speed restart the interval
//(it spans delay + speed); speed and slideEffect also update the viewport's transition.
function live(apply) {
    if (playState === "destroyed" || !playCarousel) return;
    try {
        apply(playCarousel);
    } catch (error) {
        setStatus("err", error.message);
    }
    renderSnippet();
}

ui.delay.addEventListener("input", () => {
    $("#delayV").textContent = ui.delay.value + "ms";
    live(c => { c.config.delay = Number(ui.delay.value); });
});
ui.speed.addEventListener("input", () => {
    $("#speedV").textContent = ui.speed.value + "ms";
    live(c => { c.config.speed = Number(ui.speed.value); });
});
ui.effect.addEventListener("change", () => live(c => { c.config.slideEffect = ui.effect.value; }));

[ui.bsNormal, ui.bsActive].forEach(input => input.addEventListener("input", () => live(c => {
    //An empty normal style is not a string the setter will take as useful; keep the last good one
    if (!ui.bsNormal.value.trim()) { ui.bsState.textContent = "normal is empty"; ui.bsState.className = "pill"; return; }
    c.config.buttonStyle = buttonStyleValue();   //restyles the live carousel's own <style> block
    ui.bsState.textContent = "styles ok"; ui.bsState.className = "pill on";
})));

ui.touch.addEventListener("change", () => {
    if (ui.touch.checked && !builtWithTouch) {
        //No TouchHandler exists to switch on, so rebuild the carousel with touch enabled
        rebuild();
        return;
    }
    live(c => { c.config.touchResponse = ui.touch.checked; });
});

$("#start").addEventListener("click", () => {
    if (playState === "destroyed") { setStatus("err", "destroyed — press Rebuild"); return; }
    playCarousel.start();      //idempotent: a second call while running is a no-op
    playState = "running";
    setStatus("run", "autoplaying (start() is a no-op when already running)");
});

$("#destroy").addEventListener("click", () => {
    if (!playCarousel) return;
    //Stops the interval, removes the dots and this instance's <style>, detaches every listener,
    //tears down the TouchHandler and clears the inline positions it wrote. The slides stack
    //again because the page's CSS puts them all at top:0, left:auto.
    playCarousel.destroy();
    playState = "destroyed";
    setStatus("err", "destroyed — dots, listeners, interval and inline styles removed");
});

function rebuild() {
    //A destroyed Carousel refuses to re-initialize; a fresh instance is the intended path.
    if (playCarousel && playState !== "destroyed") playCarousel.destroy();
    buildPlay();
    renderSnippet();
}
$("#rebuild").addEventListener("click", rebuild);

function renderSnippet() {
    const bs = buttonStyleValue().map(s => `<span class="s">"${s.replace(/</g, "&lt;")}"</span>`).join(",\n    ");
    ui.snippet.innerHTML =
`<span class="k">const</span> <span class="p">carousel</span> = <span class="k">new</span> Carousel(container, viewport);

<span class="p">carousel</span>.config.delay         = ${ui.delay.value};
<span class="p">carousel</span>.config.speed         = ${ui.speed.value};
<span class="p">carousel</span>.config.slideEffect   = <span class="s">"${ui.effect.value}"</span>;
<span class="p">carousel</span>.config.touchResponse = <span class="k">${ui.touch.checked}</span>;
<span class="p">carousel</span>.config.buttonStyle   = [
    ${bs}
];

<span class="p">carousel</span>.initialize();
<span class="p">carousel</span>.start();   <span class="c">// interval: ${Number(ui.delay.value) + Number(ui.speed.value)}ms (delay + speed)</span>`;
    $("#roInterval").textContent = (Number(ui.delay.value) + Number(ui.speed.value)) + "ms";
}

/* The component reports no slide-change callback, but it marks the visible slide with
 * data-activeDisplay="1" once each move settles. Observing that attribute is the
 * consumer-side way to follow along. */
const observers = new WeakMap();
function watchActive(viewport, out, onChange) {
    if (observers.has(viewport)) observers.get(viewport).disconnect();
    const read = () => {
        const i = [...viewport.children].findIndex(el => el.getAttribute("data-activeDisplay") === "1");
        if (i >= 0) { out.textContent = i; onChange && onChange(i); }
    };
    const mo = new MutationObserver(read);
    mo.observe(viewport, { subtree: true, attributes: true, attributeFilter: ["data-activeDisplay"] });
    observers.set(viewport, mo);
    read();
}

buildPlay();
renderSnippet();

/* ------------------------------------------------------------------ *
 * 3. Two on one page — independent state and scoped buttonStyle
 * ------------------------------------------------------------------ */

const twinA = new Carousel($("#twinA"), viewportOf($("#twinA")));
twinA.config.delay = 1800;
twinA.config.speed = 600;
twinA.config.buttonStyle = [
    "width:12px;height:12px;background:rgba(255,255,255,.35)",
    "background:#ffb454;box-shadow:0 0 0 3px rgba(255,180,84,.35),0 0 14px #ffb454"
];
twinA.initialize();
twinA.start();

//This viewport has no id attribute; the slides are its direct <div> children.
const twinB = new Carousel($("#twinB"), viewportOf($("#twinB")));
twinB.config.delay = 3200;
twinB.config.speed = 1100;
twinB.config.slideEffect = "ease-in-out";
twinB.config.buttonStyle = [
    "width:18px;height:4px;border-radius:0;background:rgba(255,255,255,.35)",
    "width:34px;background:#5ccfe6"
];
twinB.initialize();
twinB.start();

/* ------------------------------------------------------------------ *
 * 4. Swipe and hover
 * ------------------------------------------------------------------ */

const gestEl = $("#gestCarousel");
const gestCarousel = new Carousel(gestEl, viewportOf(gestEl));
gestCarousel.config.delay = 2400;
gestCarousel.config.speed = 700;
gestCarousel.config.slideEffect = "cubic-bezier(.16,1,.3,1)";
gestCarousel.config.buttonStyle = ["width:10px;height:10px;background:rgba(255,255,255,.4)", "background:#fff"];
gestCarousel.initialize();
gestCarousel.start();

//Hover-pause is the component's own mouseenter/mouseleave; these listeners only narrate it.
//They are added with addEventListener, which the component also uses, so neither replaces the other.
const gestStatus = $("#gestStatus"), gestText = $("#gestText");
gestEl.addEventListener("mouseenter", () => {
    gestStatus.className = "status";
    gestText.textContent = "pointer over the frame — autoplay paused";
});
gestEl.addEventListener("mouseleave", () => {
    gestStatus.className = "status run";
    gestText.textContent = "pointer outside — autoplaying";
});
const gestOut = document.createElement("span");
watchActive(viewportOf(gestEl), gestOut, i => {
    if (gestEl.matches(":hover")) gestText.textContent = "settled on slide " + i + " — autoplay paused while you point";
});
gestStatus.className = "status run";

/* ------------------------------------------------------------------ *
 * 5. Validation — each of these throws synchronously
 * ------------------------------------------------------------------ */

const BAD = {
    ctor:  () => new Carousel("#heroCarousel", null),                  //a selector string is not an element
    ctor2: () => new Carousel($("#heroCarousel"), "heroViewport"),     //neither is an id
    bs3:   () => { new Carousel($("#twinA"), viewportOf($("#twinA"))).config.buttonStyle = ["a", "b", "c"]; },
    bsNum: () => { new Carousel($("#twinA"), viewportOf($("#twinA"))).config.buttonStyle = [12]; },
    bsStr: () => { new Carousel($("#twinA"), viewportOf($("#twinA"))).config.buttonStyle = "background:red"; },
    delay: () => { new Carousel($("#twinA"), viewportOf($("#twinA"))).config.delay = "x"; },
    //A throwaway instance: start() refuses to run before initialize() has built the dots
    early: () => new Carousel($("#twinA"), viewportOf($("#twinA"))).start(),
    //Built on a detached copy so the page's own carousels are untouched
    dead:  () => {
        const box = document.createElement("div");
        box.innerHTML = "<div><div></div><div></div></div>";
        const c = new Carousel(box, box.firstElementChild);
        c.config.touchResponse = false;
        c.initialize();
        c.destroy();
        c.initialize();
    }
};

$$$("[data-bad]").forEach(button => {
    button.addEventListener("click", () => {
        try {
            BAD[button.dataset.bad]();
            $("#errOut").textContent = "No error thrown — that should not happen.";
        } catch (error) {
            $("#errOut").textContent = error.constructor.name + ": " + error.message;
        }
    });
});

/* expose the instances for console poking */
Object.assign(window, { heroCarousel, twinA, twinB, gestCarousel });
