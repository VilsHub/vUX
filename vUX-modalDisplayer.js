/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2021-07-19=T22:30Z
 *
 *
 */
// Import vUX core
import "./src/vUX-core-4.0.0.js";

/************************ModalDisplayer***************************/

//Open modals are held in one stack shared by every ModalDisplayer instance, so a
//modal opened from inside a displayed modal nests on top of it instead of
//overwriting it. The stack has to be shared rather than per instance because the
//state it guards - the body freeze and the page scroll position - belongs to the
//document, not to an instance: it is captured when the stack becomes non empty and
//released only when it empties again.
var modalStack = [];
var pageState = { bodyOverflow: "", bodyPaddingRight: "", frozen: false };
var globalHandlersAttached = false;
var liveInstances = 0; //initialized instances sharing the document-level handlers below

function topLayer() {
    return modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
}

function layerOf(node) {
    for (var x = modalStack.length - 1; x >= 0; x--) {
        if (modalStack[x].overlay.contains(node)) return modalStack[x];
    }
    return null;
}

//The page is held still with overflow rather than by taking the body out of flow:
//the document never moves, so the scroll position needs no capturing and no
//restoring, and the body keeps its own layout while a modal is up.
//Hiding the overflow also removes the page's vertical scrollbar, which widens the
//viewport and makes the content beneath the overlay jump sideways on open and back
//on close. The scrollbar's width is measured first and handed back to the body as
//extra right padding, so the content keeps the width it had.
function freezePage() {
    if (pageState.frozen) return; //only the bottom layer freezes; nested opens must not re-freeze
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    pageState.bodyOverflow = document.body.style["overflow"];
    pageState.bodyPaddingRight = document.body.style["padding-right"];
    if (scrollbarWidth > 0) {
        var padding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style["padding-right"] = (padding + scrollbarWidth) + "px";
    }
    document.body.style["overflow"] = "hidden";
    pageState.frozen = true;
}

function releasePage() {
    if (!pageState.frozen) return;
    document.body.style["overflow"] = pageState.bodyOverflow;
    document.body.style["padding-right"] = pageState.bodyPaddingRight;
    pageState.frozen = false;
}

function applyWidths(layer) {
    var mode = new ScreenBreakPoint(layer.brkpoints).screen.mode;
    if (mode == "large") {
        layer.space.style["width"] = layer.widths[0];
    } else if (mode == "medium") {
        layer.space.style["width"] = layer.widths[1];
    } else {
        layer.space.style["width"] = layer.widths[2];
    }
}

//Measures the modal at the size it is finally shown at: inside its own host, at the
//width applyWidths() gave the space, with its own id styles applied. The animation
//boxes are sized from this, so the effect ends exactly where the displayed modal sits.
//Measuring the hidden source on its own gave its shrink to fit width instead, which
//is unrelated to the configured width, and the modal snapped wider or narrower (and
//rewrapped to a new height) the moment the effect handed it to the host.
function measureLayer(layer) {
    var overlay = layer.overlay;
    overlay.style["visibility"] = "hidden";
    overlay.classList.add("show");

    layer.host.innerHTML = layer.source.outerHTML;
    var probe = layer.host.childNodes[0];
    probe.style["display"] = "block";
    probe.style["width"] = "100%";
    var box = probe.getBoundingClientRect();
    layer.width = box.width;
    layer.height = box.height;

    layer.host.innerHTML = "";
    overlay.classList.remove("show");
    overlay.style["visibility"] = "";
}

function positionLayer(layer) {
    //A modal at least as tall as the viewport less 100px is pinned below the top
    //edge and scrolls inside its own overlay; anything shorter stays centred by CSS.
    if ((window.innerHeight - layer.height) < 100) {
        layer.space.style["top"] = "50px";
        layer.space.style["padding-bottom"] = "50px";
        layer.space.style["transform"] = "translateY(0%) translateX(-50%)";
    }
}

var openEffects = {
    none: function(layer) {
        layer.overlay.classList.add("show");
        completeOpen(layer);
    },
    split: function(layer) {
        var effectsCon = $$.ce("DIV");
        var leftEle = $$.ce("DIV");
        var rightEle = $$.ce("DIV");
        var boxCSS = "position:absolute; top:0; width:50%; height:" + layer.height + "px; overflow:hidden;";

        effectsCon.setAttribute("style", "position:relative; width:" + layer.width + "px; height:" + layer.height + "px;");
        effectsCon.setAttribute("class", "vEffects trans_in split");

        leftEle.setAttribute("style", boxCSS + " left:-200%; transition:left .4s cubic-bezier(0,.87,.12,1) 0s;");
        leftEle.setAttribute("class", "vEffectBox vLeft");
        rightEle.setAttribute("style", boxCSS + " right:-200%; transition:right .4s cubic-bezier(0,.87,.12,1) 0s;");
        rightEle.setAttribute("class", "vEffectBox vRight");

        effectsCon.appendChild(leftEle);
        effectsCon.appendChild(rightEle);
        layer.space.appendChild(effectsCon);
        layer.effectsCon = effectsCon;

        fillSplitHalf(leftEle, layer, "left");
        fillSplitHalf(rightEle, layer, "right");

        layer.overlay.classList.add("show");
        leftEle.scrollWidth; //force reflow so the transition runs from the off screen position
        rightEle.scrollWidth;
        leftEle.style["left"] = "0%";
        rightEle.style["right"] = "0%";
    },
    flip: function(layer) {
        var effectsCon = $$.ce("DIV");
        var flipper = $$.ce("DIV");
        var flipperBGElement = $$.ce("DIV");
        var flipperFormElement = $$.ce("DIV");

        effectsCon.setAttribute("style", "position:relative; width:" + layer.width + "px; height:" + layer.height + "px; perspective:4000px;");
        effectsCon.setAttribute("class", "vEffects trans_in flip");

        flipper.setAttribute("class", "vEffectBox vFlipper");
        flipper.setAttribute("style", "transition:transform .6s linear 0s; width:100%; height:100%; transform-style:preserve-3d; backface-visibility:hidden; transform:rotateX(0deg);");

        flipperBGElement.setAttribute("class", "vFlipBg");
        flipperBGElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility:hidden; z-index:2; background-color:" + layer.backgroundColor + ";");

        flipperFormElement.setAttribute("class", "vFlipForm");
        flipperFormElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility:hidden; z-index:1; transform:rotateX(-180deg);");

        flipper.appendChild(flipperFormElement);
        flipper.appendChild(flipperBGElement);
        effectsCon.appendChild(flipper);
        layer.space.appendChild(effectsCon);
        layer.effectsCon = effectsCon;

        fillEffectBox(flipperFormElement, layer, true);

        layer.overlay.classList.add("show");
        flipper.scrollHeight;
        flipper.style["transform"] = "rotateX(180deg)";
    },
    box: function(layer) {
        var effectsCon = $$.ce("DIV");
        var box = $$.ce("DIV");

        effectsCon.setAttribute("style", "position:relative; width:" + layer.width + "px; height:" + layer.height + "px;");
        effectsCon.setAttribute("class", "vEffects trans_in box");

        box.setAttribute("class", "vEffectBox vBoxForm");
        box.setAttribute("style", "position:absolute; transition:all .3s linear 0s; width:0%; height:0%; top:50%; left:50%; transform:translateX(-50%) translateY(-50%); overflow:hidden;");

        effectsCon.appendChild(box);
        layer.space.appendChild(effectsCon);
        layer.effectsCon = effectsCon;

        fillEffectBox(box, layer, true);

        layer.overlay.classList.add("show");
        box.scrollHeight;
        box.style["width"] = "100%";
        box.style["height"] = "100%";
    },
    drop: function(layer) {
        var effectsCon = $$.ce("DIV");
        var slider = $$.ce("DIV");

        effectsCon.setAttribute("style", "position:relative; width:" + layer.width + "px; height:" + layer.height + "px;");
        effectsCon.setAttribute("class", "vEffects trans_in drop");

        //Not a vEffectBox: the core slide utility drives this one and reports the end through its
        //own callback, so the shared transitionend handler must leave it alone.
        slider.setAttribute("class", "vSlideForm");
        slider.setAttribute("style", "position:absolute; left:0; width:100%; height:100%;");

        effectsCon.appendChild(slider);
        layer.space.appendChild(effectsCon);
        layer.effectsCon = effectsCon;

        fillEffectBox(slider, layer, true);

        //shown first, because a transition does not run inside a display:none overlay
        layer.overlay.classList.add("show");
        $$.sm(slider).slide.toBottom(dropConfigs([dropOffset(layer), 0], 500, "cubic-bezier(.16,1,.3,1)"), function() {
            if (!layer.closing) completeOpen(layer); //closed mid drop: the close owns the boxes now
        });
    },
    slideLeft: function(layer) {
        openDocked(layer);
    },
    slideRight: function(layer) {
        openDocked(layer);
    }
};

var closeEffects = {
    none: function(layer) {
        completeClose(layer);
    },
    split: function(layer) {
        var leftE = startCloseTransition(layer, ".vLeft");
        var rightE = layer.effectsCon.querySelector(".vRight");

        fillSplitHalf(leftE, layer, "left");
        leftE.style["transition"] = "left .4s cubic-bezier(.86,.01,.99,.48)";
        leftE.scrollWidth;
        leftE.style["left"] = "-200%";

        fillSplitHalf(rightE, layer, "right");
        rightE.style["transition"] = "right .4s cubic-bezier(.86,.01,.99,.48)";
        rightE.scrollWidth;
        rightE.style["right"] = "-200%";
    },
    flip: function(layer) {
        var flipper = startCloseTransition(layer, ".vFlipper");
        var flipperFormE = layer.effectsCon.querySelector(".vFlipForm");
        var flipperBg = layer.effectsCon.querySelector(".vFlipBg");

        flipper.style["transform"] = "rotateX(0deg)";
        reclaimLiveCopy(flipperFormE, layer);

        //bring the form face back to the front so the modal is what flips away
        flipperFormE.style["transform"] = "rotateX(0deg)";
        flipperFormE.style["z-index"] = "3";
        flipperBg.style["transform"] = "rotateX(180deg)";

        flipper.scrollWidth;
        flipper.style["transform"] = "rotateX(-180deg)";
    },
    box: function(layer) {
        var box = startCloseTransition(layer, ".vBoxForm");
        reclaimLiveCopy(box, layer);
        box.scrollWidth;
        box.style["width"] = "0%";
        box.style["height"] = "0%";
    },
    drop: function(layer) {
        var slider = startCloseTransition(layer, ".vSlideForm");
        reclaimLiveCopy(slider, layer);
        $$.sm(slider).slide.toTop(dropConfigs([dropOffset(layer)], 400, EXIT_CURVE), function() {
            completeClose(layer);
        });
    },
    slideLeft: function(layer) {
        closeDocked(layer);
    },
    slideRight: function(layer) {
        closeDocked(layer);
    }
};

//The edge each sideways slide ends up docked to. A slide to the left travels in from
//the right edge, stays there, and leaves back out through the right edge; a slide to
//the right mirrors it on the left.
var dockSides = { slideLeft: "right", slideRight: "left" };

//A docked modal is a full height panel against its edge rather than a centred box: the
//space is taken off the centring transform and stretched to at least the viewport.
function dockLayer(layer) {
    var style = layer.space.style;
    style["top"] = "0px";
    style["left"] = layer.dock == "left" ? "0px" : "auto";
    style["right"] = layer.dock == "right" ? "0px" : "auto";
    style["transform"] = "none";
    style["min-height"] = "100%";
}

function openDocked(layer) {
    var effectsCon = $$.ce("DIV");
    var slider = $$.ce("DIV");
    var filler = $$.ce("DIV");

    //clipped, so the part of the panel still off its edge never shows or scrolls the overlay
    effectsCon.setAttribute("style", "position:relative; width:100%; height:" + Math.max(layer.height, window.innerHeight) + "px; overflow:hidden;");
    effectsCon.setAttribute("class", "vEffects trans_in " + layer.effect);

    //The core slide sets display:block on what it moves, so the column that stretches
    //the modal to the panel's height sits one level in, on the filler.
    slider.setAttribute("class", "vSlideForm");
    slider.setAttribute("style", "position:absolute; top:0; width:100%; height:100%;");
    filler.setAttribute("class", "vDockFill");
    filler.setAttribute("style", "display:flex; flex-direction:column; height:100%;");

    slider.appendChild(filler);
    effectsCon.appendChild(slider);
    layer.space.appendChild(effectsCon);
    layer.effectsCon = effectsCon;

    fillEffectBox(filler, layer, true)["style"]["flex"] = "1 0 auto";

    layer.overlay.classList.add("show");
    var travel = effectsCon.offsetWidth; //the panel's own width takes it fully past its edge
    var direction = layer.dock == "right" ? "toLeft" : "toRight";
    $$.sm(slider).slide[direction](dockConfigs([offEdge(layer, travel), 0], 500, "cubic-bezier(.16,1,.3,1)"), function() {
        if (!layer.closing) completeOpen(layer);
    });
}

function closeDocked(layer) {
    var slider = startCloseTransition(layer, ".vSlideForm");
    reclaimLiveCopy(slider.querySelector(".vDockFill"), layer)["style"]["flex"] = "1 0 auto";

    //Aimed a quarter past the edge: the core's callback fires on a timer at the transition's
    //duration, which can land a frame before the transition ends, and the panel must already
    //be out of view when completeClose() removes it.
    var travel = Math.ceil(layer.effectsCon.offsetWidth * 1.25);
    var direction = layer.dock == "right" ? "toRight" : "toLeft"; //back out the way it came
    $$.sm(slider).slide[direction](dockConfigs([0, offEdge(layer, travel)], 400, EXIT_CURVE), function() {
        completeClose(layer);
    });
}

//Both sides move the panel by "left", never "right": core.css transitions "right" only
//from this release on, so a page holding an older or cached core.css would jump a
//right docked panel into place with no animation at all.
function dockConfigs(x, speed, timingFunction) {
    return { use: "position", positionProperty: "left", positions: { x: x }, speed: speed, timingFunction: timingFunction };
}

//The "left" offset that puts the panel past its docked edge.
function offEdge(layer, travel) {
    return layer.dock == "right" ? travel : -travel;
}

//Exits accelerate away steadily. A steeper ease-in sat almost still for most of the
//duration and was removed by the core's timed callback while still half in view.
var EXIT_CURVE = "cubic-bezier(.4,0,1,1)";

//The drop effect's off screen start: a full viewport plus the modal's own height above
//where it lands, so even a tall modal pinned near the top starts entirely out of view.
function dropOffset(layer) {
    return -(window.innerHeight + layer.height);
}

//A fresh object per call, because the core slide writes its defaults into the one it is given.
function dropConfigs(y, speed, timingFunction) {
    return { use: "position", positions: { y: y }, speed: speed, timingFunction: timingFunction };
}

//Copies the modal into an animation box. An effect that animates one whole copy keeps
//that copy (liveCopy) and hands the node itself to the layer host once the animation
//ends, so it keeps the modal's id from the start. A copy that will be thrown away - the
//two halves of split - drops its id, so that only the one handed to the user carries it.
function fillEffectBox(box, layer, live) {
    box.innerHTML = layer.sourceOuter;
    var copy = box.childNodes[0];
    if (live) {
        layer.liveCopy = copy;
    } else {
        copy.removeAttribute("id");
    }
    copy.style["display"] = "block";
    return copy;
}

//Moves the displayed modal back into an animation box for the closing effect, so the
//exit plays with what the user sees - typed and autofilled values included - instead
//of a fresh copy of the markup with every field emptied.
function reclaimLiveCopy(box, layer) {
    var live = layer.liveCopy;
    if (live == null) return fillEffectBox(box, layer);
    if (live.parentNode !== box) {
        box.innerHTML = "";
        box.appendChild(live);
    }
    return live;
}

//Fills one half of the split effect with a whole copy of the modal, anchored to that
//half's outer edge so the left half shows the modal's left side and the right half
//its right side. The copy sits in a wrapper as wide as the host it ends up in, so it
//lays out (and wraps) exactly as the displayed modal does.
//The halves are two separate copies of the form, and the browser autofills only one
//of them - the left half showed filled, autofill-coloured fields beside empty ones on
//the right. Autofill state cannot be read or copied by script, so neither copy is
//left fillable: read-only fields are skipped by autofill, and inert keeps the
//decorative copies out of focus and interaction while they move.
function fillSplitHalf(half, layer, side) {
    var wrap = $$.ce("DIV");
    wrap.setAttribute("style", "position:absolute; top:0; " + side + ":0; width:" + layer.width + "px;");
    wrap.setAttribute("inert", "");
    half.innerHTML = "";
    half.appendChild(wrap);
    var copy = fillEffectBox(wrap, layer);
    var fields = copy.querySelectorAll("input, textarea, select");
    for (var x = 0; x < fields.length; x++) {
        fields[x].setAttribute("readonly", "");
        fields[x].setAttribute("autocomplete", "off");
    }
    return copy;
}

function startCloseTransition(layer, boxSelector) {
    layer.effectsCon.classList.remove("trans_in");
    layer.effectsCon.classList.add("trans_out");
    layer.effectsCon.style["display"] = "block";
    layer.host.style["display"] = "none";
    return layer.effectsCon.querySelector(boxSelector);
}

function completeOpen(layer) {
    if (layer.opened) return; //the box effect transitions two properties, so transitionend fires twice
    layer.opened = true;

    //The node that animated in is moved, not rebuilt from markup. A rebuilt copy is a new
    //set of form fields: their typed values are gone and the browser re-applies autofill a
    //few frames late, which showed as the modal content blinking as the effect ended.
    if (layer.liveCopy != null) {
        layer.host.appendChild(layer.liveCopy);
    } else {
        layer.host.innerHTML = layer.sourceOuter;
    }
    if (layer.dock != null) {
        //full height panel: the modal grows to fill it, and past it when its content is taller
        layer.host.style["display"] = "flex";
        layer.host.style["flex-direction"] = "column";
        layer.host.style["min-height"] = "100vh";
    } else {
        layer.host.style["height"] = layer.height + "px";
    }

    var content = layer.host.childNodes[0];
    if (content != null) {
        content.style["display"] = "block";
        content.style["width"] = "100%";
        if (layer.dock != null) content.style["flex"] = "1 0 auto";
    }
    //the animation boxes are kept, hidden, because the closing effect replays through them
    if (layer.effectsCon != null) layer.effectsCon.style["display"] = "none";
    layer.openProcessor();
}

function completeClose(layer) {
    if (layer.destroyed) return;
    layer.destroyed = true;

    restoreSource(layer);
    if (layer.overlay.parentNode != null) layer.overlay.parentNode.removeChild(layer.overlay);

    var index = modalStack.indexOf(layer);
    if (index > -1) modalStack.splice(index, 1);

    releaseBlur(layer);
    if (modalStack.length == 0) releasePage(); //the page stays frozen while any layer is still up
    layer.closeProcessor();
}

function restoreSource(layer) {
    var source = layer.source;
    if (layer.sourceId != null) source.setAttribute("id", layer.sourceId);
    if (layer.sourceClass != null) {
        source.setAttribute("class", layer.sourceClass);
    } else {
        source.removeAttribute("class");
    }
    source.innerHTML = layer.sourceInner;
    source.style["display"] = "none";
    source.style["width"] = layer.sourceInlineWidth;
}

function applyBlur(layer) {
    if (layer.overlayBackgroundType == "blur" && layer.pageContainer != null) {
        layer.pageContainer.classList.add("vxKit");
    }
}

function releaseBlur(layer) {
    if (layer.overlayBackgroundType != "blur" || layer.pageContainer == null) return;
    for (var x = 0; x < modalStack.length; x++) { //a layer still up may want the same container blurred
        if (modalStack[x].overlayBackgroundType == "blur" && modalStack[x].pageContainer === layer.pageContainer) return;
    }
    layer.pageContainer.classList.remove("vxKit");
}

function closeTopLayer() {
    var layer = topLayer();
    if (layer == null || layer.closing) return;
    layer.closing = true;
    closeEffects[layer.effect](layer);
}

function openLayer(settings, source) {
    var layer = {
        owner: settings.owner,
        source: source,
        sourceId: source.getAttribute("id"),
        sourceClass: source.getAttribute("class"),
        sourceInner: source.innerHTML,
        sourceInlineWidth: source.style["width"],
        sourceOuter: "",
        backgroundColor: $$.sm(source).cssStyle("background-color"),
        effect: settings.effect,
        dock: dockSides[settings.effect] || null,
        widths: settings.widths,
        brkpoints: settings.brkpoints,
        exitOnAway: settings.exitOnAway,
        closeButtonClass: settings.closeButtonClass,
        openProcessor: settings.openProcessor,
        closeProcessor: settings.closeProcessor,
        overlayBackgroundType: settings.overlayBackgroundType,
        overlayStyle: settings.overlayStyle,
        pageContainer: settings.pageContainer,
        effectsCon: null,
        liveCopy: null,
        opened: false,
        closing: false,
        destroyed: false
    };

    freezePage(); //no-op for every layer after the first

    var overlay = $$.ce("DIV");
    overlay.classList.add("vModal", "xScroll");
    overlay.style["z-index"] = 999 + modalStack.length; //each layer sits above the one it was opened from
    if (layer.overlayBackgroundType == "color" && layer.overlayStyle != "") {
        overlay.style["background"] = layer.overlayStyle;
    }

    var space = $$.ce("DIV");
    space.classList.add("modalSpace");

    var host = $$.ce("DIV");
    host.classList.add("vModalHost");

    if (modalStack.length == 0) { //keep the pre stacking markers on the first layer, for existing selectors
        overlay.setAttribute("data-id", "vModalStyles");
        host.setAttribute("id", "newModal");
    }

    space.appendChild(host);
    overlay.appendChild(space);
    document.body.appendChild(overlay);

    layer.overlay = overlay;
    layer.space = space;
    layer.host = host;

    modalStack.push(layer);
    applyWidths(layer);
    measureLayer(layer);
    if (layer.dock != null) {
        dockLayer(layer);
    } else {
        positionLayer(layer);
    }

    //The displayed copy keeps the modal's id and the source gives it up, so that
    //getElementById() while a modal is open resolves to what the user can see.
    source.style["width"] = "100%"; //split sizes its copies through fillSplitHalf()'s wrapper
    layer.sourceOuter = source.outerHTML;
    source.removeAttribute("id");
    source.classList.add("vOld");
    source.innerHTML = "";

    applyBlur(layer);
    openEffects[layer.effect](layer);
    return layer;
}

function attachGlobalHandlers() {
    //Escape, away clicks, close buttons and transition tracking act on the shared
    //stack, so they are bound once for the document rather than once per instance -
    //otherwise every instance would pop a layer for a single Escape press.
    if (globalHandlersAttached) return;
    globalHandlersAttached = true;

    document.body.addEventListener("keydown", handleEscapeKey, false);
    document.body.addEventListener("transitionend", handleEffectTransition, false);
    window.addEventListener("resize", handleViewportResize, false);
    document.addEventListener("click", handleAwayAndCloseClick, false);
}

//Detached once the last initialized ModalDisplayer is destroyed, so a page that tears all of
//its displayers down is left with nothing of the library's bound to the document.
function detachGlobalHandlers() {
    if (!globalHandlersAttached) return;
    globalHandlersAttached = false;

    document.body.removeEventListener("keydown", handleEscapeKey, false);
    document.body.removeEventListener("transitionend", handleEffectTransition, false);
    window.removeEventListener("resize", handleViewportResize, false);
    document.removeEventListener("click", handleAwayAndCloseClick, false);
}

function handleEscapeKey(e) {
    if (topLayer() == null) return;
    if (keyboardEventHanler(e)["handled"] == true && e.key == "Escape") closeTopLayer();
}

function handleEffectTransition(e) {
    //only the library's own animation boxes count; a transition on consumer
    //content inside the modal bubbles up here too and must be ignored
    if (e.target.classList == undefined || !e.target.classList.contains("vEffectBox")) return;

    var layer = layerOf(e.target);
    if (layer == null || layer.effectsCon == null || !layer.effectsCon.contains(e.target)) return;

    if (layer.effectsCon.classList.contains("trans_in")) {
        if (layer.effect == "split") {
            e.target.innerHTML = "";
            if (!e.target.classList.contains("vRight")) return; //wait for the second half
        }
        completeOpen(layer);
    } else if (layer.effectsCon.classList.contains("trans_out")) {
        if (layer.effect == "split" && !e.target.classList.contains("vLeft")) return;
        completeClose(layer);
    }
}

function handleViewportResize() {
    for (var x = 0; x < modalStack.length; x++) applyWidths(modalStack[x]);
}

function handleAwayAndCloseClick(e) {
    var layer = topLayer();
    if (layer == null) return;
    if (layer.exitOnAway && e.target === layer.overlay) {
        closeTopLayer();
        return;
    }
    if (layer.closeButtonClass != "" && e.target.closest("." + layer.closeButtonClass) != null) {
        closeTopLayer();
    }
}

export function ModalDisplayer() {
    var self = this,initialized = false,effectName = "none",exitOnAway = true,overlayBackgroundType = "color",overlayStyle = "hsla(0, 0%, 100%, 0.48)",openProcessor = function() {},closeProcessor = function() {},pageContainer = null;
    var defaultModalWidths = ["500px", "500px", "86%"],modalWidths = defaultModalWidths,brkpoints = { largeStart: 1000, mediumStart: 520 },className = "",formIdAttribute = "",closeButtonClass = "",modalWidthsAttribute = "";
    var destroyed = false;

    //modalWidths => [a, b, c] => a = large; b = medium; c = small
    //screenBreakPoints => [a,b] => a = largeStart ; b = mediumStart

    this.config = {};

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/modalDisplayer.css", "modalDisplayer");
            }else{
                throw new Error(path)
            }

        } catch (error) {
            console.error(error)
        }
    }

    function show(modal) {
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before triggering modal");
        for (var x = 0; x < modalStack.length; x++) { //a modal cannot be stacked on itself
            if (modalStack[x].source === modal) return;
        }
        openLayer({
            owner: self,
            effect: effectName,
            widths: modalWidths,
            brkpoints: brkpoints,
            exitOnAway: exitOnAway,
            closeButtonClass: closeButtonClass,
            openProcessor: openProcessor,
            closeProcessor: closeProcessor,
            overlayBackgroundType: overlayBackgroundType,
            overlayStyle: overlayStyle,
            pageContainer: pageContainer
        }, modal);
    }

    function addEventhandler() {
        attachGlobalHandlers();
        //Opening stays per instance: each instance recognises its own trigger class
        //and id attribute. Triggers inside a displayed modal work like any other.
        //Named rather than anonymous so that destroy() can detach this instance's listener
        //without disturbing the other instances sharing the document.
        document.addEventListener("click", handleTriggerClick, false);
    }

    function handleTriggerClick(e) {
        var trigger = e.target.closest("." + className);
        if (trigger == null) return;

        var modal = document.getElementById(trigger.getAttribute(formIdAttribute));
        if (modal == null) return;
        if (layerOf(modal) != null) return; //resolved to the displayed copy of an already open modal

        if (modalWidthsAttribute != "" && trigger.getAttribute(modalWidthsAttribute) != null) {
            modalWidths = trigger.getAttribute(modalWidthsAttribute).split(",");
        } else {
            modalWidths = defaultModalWidths;
        }
        show(modal);
    }

    this.close = function() {
        closeTopLayer();
    };
    this.closeAll = function() {
        while (modalStack.length > 0) { //unwound without animation, top down
            var layer = topLayer();
            layer.closing = true;
            completeClose(layer);
        }
    };
    this.destroy = function() {
        //Closes only the layers this instance opened, then detaches its own trigger listener. The
        //document-level Escape, away-click, resize and transition handlers are shared by every
        //ModalDisplayer on the page, so they are deliberately left attached.
        if (destroyed) return;

        for (var x = modalStack.length - 1; x >= 0; x--) {
            if (modalStack[x].owner === self) {
                modalStack[x].closing = true;
                completeClose(modalStack[x]);
            }
        }

        document.removeEventListener("click", handleTriggerClick, false);

        //The document-level handlers are shared, so they come off only with the last live instance.
        if (initialized){
            liveInstances--;
            if (liveInstances <= 0){
                liveInstances = 0;
                detachGlobalHandlers();
            }
        }

        initialized = false;
        destroyed = true;
    };
    this.initialize = function() {
        if (!initialized) {
            if (destroyed) throw new Error("This ModalDisplayer has been destroyed, create a new instance instead of re-initializing");
            if (className == "") throw new Error("Set up incomplete: No class name specified for modal, specify using 'config.className'");
            if (formIdAttribute == "") throw new Error("Set up incomplete: No formId attribute specified for modal, specify using 'config.formIdAttribute'");
            addVitalStyles();
            addEventhandler();
            initialized = true;
            liveInstances++;
        }
    }
    Object.defineProperties(this, {
        config: { writable: false },
        close: { writable: false },
        closeAll: { writable: false },
        initialize: { writable: false },
        destroy: { writable: false },
        mainForm: {
            get: function() {
                var layer = topLayer();
                if (layer == null) return null;
                return {
                    element: layer.source,
                    id: layer.sourceId
                };
            }
        },
        displayForm: {
            get: function() {
                var layer = topLayer();
                if (layer == null) return null;
                return {
                    element: layer.host.childNodes[0],
                    id: layer.sourceId
                };
            }
        },
        depth: {
            get: function() {
                return modalStack.length;
            }
        }
    });
    Object.defineProperties(this.config, {
        effect: {
            set: function(value) {
                validateObjectMember(openEffects, value, "Invalid effect type specified for the 'effect' property")
                effectName = value;
            }
        },
        overlayBackgroundType: {
            set: function(value) {
                if (matchString(value, ["color", "blur"], "Invalid overlay type specified for the 'overlayBackgroundType' property, it should be one of the followings: 'color' or 'blur'")) {
                    overlayBackgroundType = value;
                }
            }
        },
        overlayStyle: {
            set: function(value) {
                validateString(value, "'config.overlayStyle' property value must be a string");
                overlayStyle = value;
            }
        },
        openProcessor: {
            set: function(value) {
                validateFunction(value, "A function need as 'openProcessor' property value");
                openProcessor = value;
            }
        },
        closeProcessor: {
            set: function(value) {
                validateFunction(value, "A function need as 'closeProcessor' property value");
                closeProcessor = value;
            }
        },
        modalWidthsAttribute: {
            set: function(value) {
                validateString(value, "'modalWidthsAttribute' property expects a string as value");
                modalWidthsAttribute = value;
            }
        },
        screenBreakPoints: { // Needed only for active browser resiszing
            set: function(value) {
                var temp = "'config.screenBreakPoints' property value must be an array";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + " of 2 Elements");
                validateArrayMembers(value, "number", temp + " of numbers");

                function msg(n) {
                    return "'screenBreakPoints' property array value member " + n + " must be an integer";
                }
                if (!validateInteger(value[0])) throw new Error(msg(1));
                if (!validateInteger(value[1])) throw new Error(msg(2));
                brkpoints["largeStart"] = value[0];
                brkpoints["mediumStart"] = value[1];
            }
        },
        pageContainer: {
            set: function(value) {
                validateElement(value, "'pageContainer' property expects a valid HTML element");
                pageContainer = value;
            }
        },
        className: {
            set: function(value) {
                validateString(value, "'className' property expects a string as value");
                className = value;
            }
        },
        formIdAttribute: {
            set: function(value) {
                validateString(value, "'formIdAttribute' property expects a string as value");
                formIdAttribute = value;
            }
        },
        closeButtonClass: {
            set: function(value) {
                validateString(value, "'closeButtonClass' property expects a string as value");
                closeButtonClass = value;
            }
        },
        exitOnAway:{
            set:function(value){
                validateBoolean(value, "'config.exitOnAway' property must be a boolean");
                exitOnAway = value;
            }
        }
    });
}
/****************************************************************/
