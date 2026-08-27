/*
 * vUX ModalDisplayer — runnable example.
 *
 * The component is declarative: you never call an "open" method. A single delegated
 * click listener on `document` watches for config.className and reads the modal's id
 * off config.formIdAttribute. Everything here is either config, or page chrome
 * reacting to the open/close processors.
 */
import { ModalDisplayer } from "../../vUX-modalDisplayer.js";

const $ = sel => document.querySelector(sel);
const $$$ = sel => document.querySelectorAll(sel);

/* ------------------------------------------------------------------ *
 * Main instance
 * ------------------------------------------------------------------ */

const modal = new ModalDisplayer();

modal.config.className = "open-modal";          // click targets that open a modal
modal.config.formIdAttribute = "data-form";     // attribute holding the modal element's id
modal.config.closeButtonClass = "modal-close";  // any element with this class closes the top layer
modal.config.modalWidthsAttribute = "data-widths";
modal.config.effect = "box";
modal.config.overlayStyle = "hsla(215, 40%, 9%, 0.55)";
modal.config.openProcessor = () => {
    log("open  " + (modal.mainForm ? modal.mainForm.id : "?") + "  → depth " + modal.depth);
    showDepth();
};
modal.config.closeProcessor = () => {
    log("close → depth " + modal.depth);
    showDepth();
};
modal.initialize();                             // nothing works before this

/* A second instance, to show the stack is shared. Different trigger class and a
 * different effect, but the same stack: a modal it opens layers on top of one the
 * main instance opened, and one Escape still pops exactly one layer. */
const altModal = new ModalDisplayer();

altModal.config.className = "alt-modal";
altModal.config.formIdAttribute = "data-form";
altModal.config.closeButtonClass = "modal-close";
altModal.config.effect = "flip";
altModal.config.overlayStyle = "hsla(185, 40%, 8%, 0.55)";
altModal.config.openProcessor = () => {
    log("open  helpModal (alt instance) → depth " + altModal.depth);
    showDepth();
};
altModal.config.closeProcessor = showDepth;
altModal.initialize();

/* ------------------------------------------------------------------ *
 * Page chrome
 * ------------------------------------------------------------------ */

function log(message) {
    const box = $("#log");
    box.textContent += message + "\n";
    box.scrollTop = box.scrollHeight;
}
function showDepth() {
    //depth is a live getter on the instance; both instances report the one shared stack
    $("#depth").textContent = modal.depth;
}

$("#clearLog").addEventListener("click", () => { $("#log").textContent = ""; });

/* ------------------------------------------------------------------ *
 * Live config
 * ------------------------------------------------------------------ */

const ui = {
    effect: $("#effect"), overlayType: $("#overlayType"),
    color: $("#overlayColor"), alpha: $("#overlayAlpha"),
    exit: $("#exitOnAway"), bpLarge: $("#bpLarge"), bpMedium: $("#bpMedium")
};

//config is write-only across vUX, so the page keeps its own copy of what it set
const hexToRgba = (hex, alpha) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

function applyConfig() {
    const overlay = hexToRgba(ui.color.value, ui.alpha.value);

    //effect belongs to the main instance only, so the alt instance stays visibly distinct
    modal.config.effect = ui.effect.value;

    [modal, altModal].forEach(instance => {
        instance.config.overlayBackgroundType = ui.overlayType.value;
        instance.config.overlayStyle = overlay;
        instance.config.exitOnAway = ui.exit.checked;
        //blur filters config.pageContainer instead of tinting the overlay. #page wraps
        //the page content only — the modal markup sits outside it, so the dialog stays sharp.
        if (ui.overlayType.value === "blur") instance.config.pageContainer = $("#page");
    });

    //screenBreakPoints only matters while the browser is actively resized
    const large = Number(ui.bpLarge.value);
    const medium = Number(ui.bpMedium.value);
    if (Number.isInteger(large) && Number.isInteger(medium)) {
        [modal, altModal].forEach(i => { i.config.screenBreakPoints = [large, medium]; });
        $("#bpV").textContent = large + " / " + medium;
    }

    $("#overlayAlphaV").textContent = Number(ui.alpha.value).toFixed(2);
    renderSnippet(overlay);
}

function renderSnippet(overlay) {
    $("#snippet").innerHTML =
`<span class="k">const</span> <span class="p">modal</span> = <span class="k">new</span> ModalDisplayer();

<span class="p">modal</span>.config.className             = <span class="s">"open-modal"</span>;
<span class="p">modal</span>.config.formIdAttribute       = <span class="s">"data-form"</span>;
<span class="p">modal</span>.config.closeButtonClass      = <span class="s">"modal-close"</span>;
<span class="p">modal</span>.config.modalWidthsAttribute  = <span class="s">"data-widths"</span>;
<span class="p">modal</span>.config.effect                = <span class="s">"${ui.effect.value}"</span>;
<span class="p">modal</span>.config.overlayBackgroundType = <span class="s">"${ui.overlayType.value}"</span>;
<span class="p">modal</span>.config.overlayStyle          = <span class="s">"${overlay}"</span>;
<span class="p">modal</span>.config.exitOnAway            = <span class="k">${ui.exit.checked}</span>;
<span class="p">modal</span>.config.screenBreakPoints     = [${ui.bpLarge.value}, ${ui.bpMedium.value}];${
ui.overlayType.value === "blur" ? `\n<span class="p">modal</span>.config.pageContainer         = document.getElementById(<span class="s">"page"</span>);` : ""}

<span class="p">modal</span>.initialize();  <span class="c">// required — nothing works before this</span>`;
}

Object.values(ui).forEach(control => control.addEventListener("input", applyConfig));
applyConfig();

/* Delegated, because these buttons live inside modal content: the component copies
 * that content into the overlay, so a listener bound to the original node would not
 * be on the copy the user actually clicks. */
document.addEventListener("click", event => {
    if (event.target.closest(".close-all") != null) {
        modal.closeAll();                       //unwinds the whole stack at once
        log("closeAll() → depth " + modal.depth);
        showDepth();
    }
});

/* ------------------------------------------------------------------ *
 * Validation — every one of these throws
 * ------------------------------------------------------------------ */

const BAD = {
    noClass:     () => new ModalDisplayer().initialize(),
    noAttr:      () => { const m = new ModalDisplayer(); m.config.className = "x"; m.initialize(); },
    effect:      () => { modal.config.effect = "fade"; },
    overlay:     () => { modal.config.overlayBackgroundType = "tint"; },
    breakpoints: () => { modal.config.screenBreakPoints = [1000]; },
    fraction:    () => { modal.config.screenBreakPoints = [1000.5, 520]; },
    exit:        () => { modal.config.exitOnAway = "yes"; },
    container:   () => { modal.config.pageContainer = "#page"; },
    processor:   () => { modal.config.openProcessor = "log"; },
    className:   () => { modal.config.className = 42; }
};

$$$("[data-bad]").forEach(button => {
    button.addEventListener("click", () => {
        try {
            BAD[button.dataset.bad]();
            $("#errOut").textContent = "No error thrown — that should not happen.";
        } catch (error) {
            $("#errOut").textContent = error.constructor.name + ": " + error.message;
        }
        //the effect/overlay demos above mutate the live instance, so put it back
        applyConfig();
    });
});

/* exposed for the console */
window.demoModal = modal;
window.altModal = altModal;
