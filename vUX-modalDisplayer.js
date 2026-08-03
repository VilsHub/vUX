/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2021-07-19=T22:30Z
 *
 *
 */
// Import vUX core
import "./src/vUX-core-4.0.0-beta.js";

/************************ModalDisplayer***************************/

//Open modals are held in one stack shared by every ModalDisplayer instance, so a
//modal opened from inside a displayed modal nests on top of it instead of
//overwriting it. The stack has to be shared rather than per instance because the
//state it guards - the body freeze and the page scroll position - belongs to the
//document, not to an instance: it is captured when the stack becomes non empty and
//released only when it empties again.
var modalStack = [];
var pageState = { scrollY: 0, bodyPosition: "", frozen: false };
var globalHandlersAttached = false;

function topLayer() {
    return modalStack.length > 0 ? modalStack[modalStack.length - 1] : null;
}

function layerOf(node) {
    for (var x = modalStack.length - 1; x >= 0; x--) {
        if (modalStack[x].overlay.contains(node)) return modalStack[x];
    }
    return null;
}

function freezePage() {
    if (pageState.frozen) return; //only the bottom layer freezes; nested opens must not re-capture
    pageState.scrollY = window.scrollY;
    pageState.bodyPosition = document.body.style["position"];
    document.body.style["position"] = "fixed";
    document.body.style["top"] = "-" + pageState.scrollY + "px";
    pageState.frozen = true;
}

function releasePage() {
    if (!pageState.frozen) return;
    document.body.style["position"] = pageState.bodyPosition;
    document.body.style["top"] = "";
    pageState.frozen = false;

    //jump back instantly, then leave the page's own scroll-behavior as it was
    var htmlEle = $$.ss("html");
    var previousScrollBehavior = htmlEle.style["scroll-behavior"];
    htmlEle.style["scroll-behavior"] = "auto";
    scrollTo(0, pageState.scrollY);
    htmlEle.style["scroll-behavior"] = previousScrollBehavior;
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

        fillEffectBox(leftEle, layer)["style"]["left"] = "0px";
        fillEffectBox(rightEle, layer)["style"]["right"] = "0px";

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

        fillEffectBox(flipperFormElement, layer);

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

        fillEffectBox(box, layer);

        layer.overlay.classList.add("show");
        box.scrollHeight;
        box.style["width"] = "100%";
        box.style["height"] = "100%";
    }
};

var closeEffects = {
    none: function(layer) {
        completeClose(layer);
    },
    split: function(layer) {
        var leftE = startCloseTransition(layer, ".vLeft");
        var rightE = layer.effectsCon.querySelector(".vRight");

        fillEffectBox(leftE, layer)["style"]["left"] = "0px";
        leftE.style["transition"] = "left .4s cubic-bezier(.86,.01,.99,.48)";
        leftE.scrollWidth;
        leftE.style["left"] = "-200%";

        fillEffectBox(rightE, layer)["style"]["right"] = "0px";
        rightE.style["transition"] = "right .4s cubic-bezier(.86,.01,.99,.48)";
        rightE.scrollWidth;
        rightE.style["right"] = "-200%";
    },
    flip: function(layer) {
        var flipper = startCloseTransition(layer, ".vFlipper");
        var flipperFormE = layer.effectsCon.querySelector(".vFlipForm");
        var flipperBg = layer.effectsCon.querySelector(".vFlipBg");

        flipper.style["transform"] = "rotateX(0deg)";
        fillEffectBox(flipperFormE, layer);

        //bring the form face back to the front so the modal is what flips away
        flipperFormE.style["transform"] = "rotateX(0deg)";
        flipperFormE.style["z-index"] = "3";
        flipperBg.style["transform"] = "rotateX(180deg)";

        flipper.scrollWidth;
        flipper.style["transform"] = "rotateX(-180deg)";
    },
    box: function(layer) {
        var box = startCloseTransition(layer, ".vBoxForm");
        fillEffectBox(box, layer);
        box.scrollWidth;
        box.style["width"] = "0%";
        box.style["height"] = "0%";
    }
};

//Copies the modal into an animation box. The copy drops its id so that only the
//one finally handed to the user (in the layer host) carries it.
function fillEffectBox(box, layer) {
    box.innerHTML = layer.sourceOuter;
    var copy = box.childNodes[0];
    copy.removeAttribute("id");
    copy.style["display"] = "block";
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

    layer.host.innerHTML = layer.sourceOuter;
    layer.host.style["height"] = layer.height + "px";

    var content = layer.host.childNodes[0];
    if (content != null) {
        content.style["display"] = "block";
        content.style["width"] = "100%";
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
        opened: false,
        closing: false,
        destroyed: false
    };

    var dimension = getDimensionOfHidden(source);
    layer.height = dimension["height"];
    layer.width = dimension["width"];

    freezePage(); //must run before the overlay goes up, while the page scroll is still readable

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
    positionLayer(layer);

    //The displayed copy keeps the modal's id and the source gives it up, so that
    //getElementById() while a modal is open resolves to what the user can see.
    source.style["width"] = layer.effect == "split" ? layer.width + "px" : "100%";
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

    document.body.addEventListener("keydown", function(e) {
        if (topLayer() == null) return;
        if (keyboardEventHanler(e)["handled"] == true && e.key == "Escape") closeTopLayer();
    }, false);

    document.body.addEventListener("transitionend", function(e) {
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
    }, false);

    window.addEventListener("resize", function() {
        for (var x = 0; x < modalStack.length; x++) applyWidths(modalStack[x]);
    }, false);

    document.addEventListener("click", function(e) {
        var layer = topLayer();
        if (layer == null) return;
        if (layer.exitOnAway && e.target === layer.overlay) {
            closeTopLayer();
            return;
        }
        if (layer.closeButtonClass != "" && e.target.closest("." + layer.closeButtonClass) != null) {
            closeTopLayer();
        }
    }, false);
}

export function ModalDisplayer() {
    var self = this,initialized = false,effectName = "none",exitOnAway = true,overlayBackgroundType = "color",overlayStyle = "hsla(0, 0%, 100%, 0.48)",openProcessor = function() {},closeProcessor = function() {},pageContainer = null;
    var defaultModalWidths = ["500px", "500px", "86%"],modalWidths = defaultModalWidths,brkpoints = { largeStart: 1000, mediumStart: 520 },className = "",formIdAttribute = "",closeButtonClass = "",modalWidthsAttribute = "";

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
        document.addEventListener("click", function(e) {
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
        }, false);
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
    this.initialize = function() {
        if (!initialized) {
            if (className == "") throw new Error("Set up incomplete: No class name specified for modal, specify using 'config.className'");
            if (formIdAttribute == "") throw new Error("Set up incomplete: No formId attribute specified for modal, specify using 'config.formIdAttribute'");
            addVitalStyles();
            addEventhandler();
            initialized = true;
        }
    }
    Object.defineProperties(this, {
        config: { writable: false },
        close: { writable: false },
        closeAll: { writable: false },
        initialize: { writable: false },
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
