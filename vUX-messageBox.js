/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2026-10-09
 *
 *
 */
// Import vUX core
import {
    validateElement, validateNumber, validateString, validateBoolean, validateFunction,
    validateObjectLiteral, matchString
} from "./src/helpers.js";
import "./src/vUX-core-4.0.0.js";

/**************************MessageBox****************************/
export function MessageBox() {
    /**
     * Notification messages that arrive at the top of the window, stay for
     * config.duration, and leave again on their own.
     *
     * Messages are laid out in LANES: one fixed column per alignment (left,
     * center, right) and offset, shared by every MessageBox on the page, so two
     * instances aligned the same way stack their messages instead of drawing
     * them over each other.
     *
     * Each message sits in a SLOT. The slot is what takes up room in the lane:
     * it opens to the message's height when a message arrives and closes to
     * nothing when one leaves, so the messages around it move aside smoothly
     * rather than jumping. Both the slot and the message are moved by the core
     * slide utility, $$.sm(el).slide - the slot in dimension mode, the message in
     * position mode - and every end of animation is taken from that utility's
     * callback, not from transitionend.
     *
     * The display time starts when a message has landed, not when show() was
     * called, and it pauses while the pointer is over the message or focus is
     * inside it, so nobody loses a message they are in the middle of reading.
     */

    var self = this;
    var initialized = false, destroyed = false;
    var settings = {
        effect: "drop",
        alignment: "right",
        duration: 4000,
        speed: 450,
        type: "info",
        theme: "light",
        width: "360px",
        offset: 16,
        maxVisible: 5,
        closeButton: true,
        pauseOnHover: true,
        closeOnClick: false,
        showProgress: true,
        newestOnTop: true,
        respectReducedMotion: true,
        onShow: null,
        onClose: null
    };
    var open = [];              //this instance's messages that have not finished leaving, oldest first

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This MessageBox has been destroyed, create a new instance instead of re-initializing");
        initialized = true;
    }

    this.show = function(content, options){
        assertUsable("show");
        return post(content, options, null, "messageBoxObj.show");
    }

    //One per type: the same as show() with options.type already set.
    TYPES.forEach(function(type){
        self[type] = function(content, options){
            assertUsable(type);
            return post(content, options, type, "messageBoxObj." + type);
        }
    });

    this.closeAll = function(){
        assertUsable("closeAll");
        open.slice().forEach(function(rec){ close(rec, "api"); });
    }

    this.destroy = function(){
        if (destroyed) return;
        //Removed at once, with no exit animation: the page may be about to discard
        //everything around them. onClose still fires, once per message, as it always does.
        open.slice().forEach(function(rec){ remove(rec, "destroy"); });
        open = [];
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    /*--------------------------- posting ---------------------------*/

    function post(content, options, type, where){
        if (typeof content != "string" && !(content instanceof Element)){
            throw new TypeError(where + "(x.) argument 1 must be a string or an element");
        }
        var opts = resolveOptions(options, where);
        if (type != null) opts.type = type;

        var rec = build(content, opts);
        open.push(rec);

        //Over the limit: the oldest messages make way. Counted after the new one is in,
        //and only among messages not already on their way out.
        var staying = open.filter(function(r){ return r.state == "entering" || r.state == "shown"; });
        for (var x = 0; x < staying.length - settings.maxVisible; x++) close(staying[x], "overflow");

        enter(rec);
        return rec.handle;
    }

    //Per-call options are the config with some properties replaced for this one message.
    function resolveOptions(options, where){
        var opts = {};
        for (var name in settings) opts[name] = settings[name];
        opts.title = "";
        opts.onClose = null;    //the config's onClose is called separately, after this one

        if (options === undefined) return opts;
        validateObjectLiteral(options, where + "(.x) argument 2 must be an object literal of options");
        for (var key in options){
            if (OPTION_KEYS.indexOf(key) == -1){
                throw new Error(where + "(.x) argument 2: unknown option '" + key + "'; use " + OPTION_KEYS.join(", "));
            }
            opts[key] = check(key, options[key], where + "(.x) argument 2 option '" + key + "'");
        }
        return opts;
    }

    function build(content, opts){
        var slot = $$.ce("DIV", { class: "vmb-slot" });
        //warnings and errors interrupt a screen reader; the rest wait their turn
        var msg = $$.ce("DIV", {
            class: "vmb-msg vmb-" + opts.type + " vmb-" + opts.theme,
            role: opts.type == "warning" || opts.type == "error" ? "alert" : "status"
        });
        var body = $$.ce("DIV", { class: "vmb-body" });
        var icon = $$.ce("SPAN", { class: "vmb-icon", "aria-hidden": "true" });
        var text = $$.ce("DIV", { class: "vmb-text" });
        var gap = $$.ce("DIV", { class: "vmb-gap" });  //the space between messages, inside the slot so it opens and closes with it
        var close_ = null, bar = null;

        msg.style["width"] = opts.width;
        icon.innerHTML = ICONS[opts.type];

        if (opts.title != ""){
            var title = $$.ce("STRONG", { class: "vmb-title" });
            title.textContent = opts.title;
            text.appendChild(title);
        }
        var holder = $$.ce("DIV", { class: "vmb-content" });
        //a string is always text, never markup: a message often carries server or user input
        if (typeof content == "string") holder.textContent = content; else holder.appendChild(content);
        text.appendChild(holder);

        body.appendChild(icon);
        body.appendChild(text);
        if (opts.closeButton){
            close_ = $$.ce("BUTTON", { class: "vmb-close", type: "button", "aria-label": "Dismiss" });
            close_.innerHTML = ICON_CLOSE;
            body.appendChild(close_);
        }
        msg.appendChild(body);
        if (opts.showProgress && opts.duration > 0){
            bar = $$.ce("DIV", { class: "vmb-bar" });
            bar.appendChild($$.ce("I"));
            msg.appendChild(bar);
        }
        slot.appendChild(msg);
        slot.appendChild(gap);

        var effect = opts.effect;
        if (opts.speed == 0) effect = "none";
        else if (effect != "none" && opts.respectReducedMotion && reducedMotion()) effect = "fade";

        //Faded from the start: added later, the class would itself be animated - the slot's
        //opening styles the message at full opacity first - and the fade would barely show.
        if (effect == "fade"){
            $$.sm(msg).class.add("vmb-fade");
            msg.style["transition-duration"] = opts.speed + "ms";
        }

        var rec = {
            slot: slot, msg: msg, bar: bar, opts: opts, effect: effect,
            lane: null, state: "entering", pendingClose: null,
            timer: null, remaining: 0, startedAt: 0, hovered: false, focused: false,
            handle: {}
        };

        if (close_ != null) close_.addEventListener("click", function(e){
            e.stopPropagation();
            close(rec, "button");
        });
        if (opts.closeOnClick) msg.addEventListener("click", function(){ close(rec, "click"); });
        if (opts.pauseOnHover){
            msg.addEventListener("mouseenter", function(){ rec.hovered = true; pause(rec); });
            msg.addEventListener("mouseleave", function(){ rec.hovered = false; resume(rec); });
            msg.addEventListener("focusin", function(){ rec.focused = true; pause(rec); });
            msg.addEventListener("focusout", function(e){
                if (msg.contains(e.relatedTarget)) return;  //focus moved within the message
                rec.focused = false;
                resume(rec);
            });
        }

        Object.defineProperties(rec.handle, {
            element: { get: function(){ return msg; } },
            //entering | shown | leaving | closed
            state: { get: function(){ return rec.state == "gone" ? "closed" : rec.state; } },
            close: { value: function(){ close(rec, "api"); } }
        });
        return rec;
    }

    /*--------------------------- arriving ---------------------------*/

    function enter(rec){
        var opts = rec.opts, msg = rec.msg, slot = rec.slot;
        //On a narrow window every lane spans the full width, so messages aligned
        //differently would land on top of each other; there they all share the centre lane.
        rec.lane = laneFor(window.innerWidth < NARROW ? "center" : opts.alignment, opts.offset);
        if (settings.newestOnTop) rec.lane.insertBefore(slot, rec.lane.firstChild);
        else rec.lane.appendChild(slot);

        if (rec.effect == "none"){
            landed(rec);
            return;
        }

        //Landed once both the slot has opened and the message has arrived.
        var parts = 2;
        function part(){ if (--parts == 0) landed(rec); }

        //The slot first: it opens from nothing to the message's height (the core opens a
        //dimension slide with no end size to the content's height), pushing the other
        //messages aside. The core class clips it while it does, which would hide a message
        //travelling in from outside it, so the clipping is lifted straight after.
        $$.sm(slot).slide.toBottom({ use: "dimension", speed: opts.speed, timingFunction: ENTER_CURVE }, part);
        slot.style["overflow"] = "visible";

        //Measured where it will land - inside the slot, at the slot's top - so the
        //start positions below put it exactly one gap past the window's edge.
        var rect = msg.getBoundingClientRect();

        if (rec.effect == "drop"){
            //From above the window, the full distance down to where it lands. Jumped to,
            //not animated to: having just been measured, the message would otherwise
            //transition from its resting place up to the start and barely move.
            var start = -Math.ceil(rect.bottom + EDGE_GAP);
            msg.style["transition-property"] = "none";
            msg.style["top"] = start + "px";
            msg.scrollHeight;
            msg.style["transition-property"] = "";
            $$.sm(msg).slide.toBottom(slideY([start, 0], opts.speed, ENTER_CURVE), part);
        }else if (rec.effect == "slideLeft" || rec.effect == "slideRight"){
            //slideLeft travels leftwards, so it comes in from the right edge; slideRight
            //mirrors it. Both end at the lane position the alignment gave it, which is why
            //a centred message slides in to the middle and stops there.
            var travel = rec.effect == "slideLeft" ? window.innerWidth - rect.left + EDGE_GAP : -(rect.right + EDGE_GAP);
            var direction = rec.effect == "slideLeft" ? "toLeft" : "toRight";
            $$.sm(msg).slide[direction](slideX([Math.ceil(travel), 0], opts.speed, ENTER_CURVE), part);
        }else{
            msg.scrollHeight;
            $$.sm(msg).class.add("vmb-in");
            setTimeout(part, opts.speed);
        }
    }

    function landed(rec){
        if (rec.state != "entering") return;   //removed by destroy() mid entry
        rec.state = "shown";

        //A close asked for while it was still arriving waits until now: reversing a core
        //slide half way would jump the message, and the slot's own timer would reopen it.
        if (rec.pendingClose != null){
            close(rec, rec.pendingClose);
            return;
        }

        if (rec.opts.duration > 0){
            rec.remaining = rec.opts.duration;
            if (rec.bar != null){
                rec.bar.firstChild.style["animation-duration"] = rec.opts.duration + "ms";
                $$.sm(rec.msg).class.add("vmb-run");
            }
            resume(rec);
        }
        if (settings.onShow != null) settings.onShow(rec.handle);
    }

    /*--------------------------- the timer ---------------------------*/

    function resume(rec){
        if (rec.state != "shown" || rec.opts.duration <= 0 || rec.timer != null) return;
        if (rec.hovered || rec.focused) return;
        rec.startedAt = now();
        rec.timer = setTimeout(function(){
            rec.timer = null;
            close(rec, "timeout");
        }, rec.remaining);
        $$.sm(rec.msg).class.remove("vmb-paused");
    }

    function pause(rec){
        if (rec.timer == null) return;
        clearTimeout(rec.timer);
        rec.timer = null;
        rec.remaining = Math.max(0, rec.remaining - (now() - rec.startedAt));
        $$.sm(rec.msg).class.add("vmb-paused");    //the progress bar holds where it is
    }

    /*--------------------------- leaving ---------------------------*/

    function close(rec, reason){
        if (rec.state == "entering"){
            if (rec.pendingClose == null) rec.pendingClose = reason;
            return;
        }
        if (rec.state != "shown") return;
        rec.state = "leaving";
        clearTimeout(rec.timer);
        rec.timer = null;

        var opts = rec.opts, msg = rec.msg;
        $$.sm(msg).class.add("vmb-leaving");       //no more clicks or hover pauses on the way out
        if (rec.effect == "none"){
            remove(rec, reason);
            return;
        }

        function collapse(){ collapseSlot(rec, reason); }
        var rect = msg.getBoundingClientRect();

        //Exits are aimed a quarter past the edge: the core's callback fires on a timer
        //at the transition's duration, which can land a frame before the transition
        //ends, and the message must already be out of view when its slot closes.
        if (rec.effect == "drop"){
            $$.sm(msg).slide.toTop(slideY([-Math.ceil((rect.bottom + EDGE_GAP) * 1.25)], opts.speed, EXIT_CURVE), collapse);
        }else if (rec.effect == "slideLeft" || rec.effect == "slideRight"){
            //back out through the edge it came in from
            var back = rec.effect == "slideLeft" ? window.innerWidth - rect.left + EDGE_GAP : -(rect.right + EDGE_GAP);
            var direction = rec.effect == "slideLeft" ? "toRight" : "toLeft";
            $$.sm(msg).slide[direction](slideX([0, Math.ceil(back * 1.25)], opts.speed, EXIT_CURVE), collapse);
        }else{
            $$.sm(msg).class.remove("vmb-in");
            setTimeout(collapse, opts.speed);
        }
    }

    //The message is out of view; its slot now closes so the others close the gap.
    function collapseSlot(rec, reason){
        if (rec.state != "leaving") return;     //removed by destroy() mid exit
        rec.msg.style["visibility"] = "hidden";
        rec.slot.style["overflow"] = "hidden";
        $$.sm(rec.slot).slide.toTop({ use: "dimension", speed: Math.round(rec.opts.speed * 0.6), timingFunction: "ease" }, function(){
            remove(rec, reason);
        });
    }

    function remove(rec, reason){
        if (rec.state == "gone") return;
        rec.state = "gone";
        clearTimeout(rec.timer);
        rec.timer = null;
        rec.slot.remove();
        releaseLane(rec.lane);
        var at = open.indexOf(rec);
        if (at != -1) open.splice(at, 1);

        if (rec.opts.onClose != null) rec.opts.onClose(rec.handle, reason);
        if (settings.onClose != null) settings.onClose(rec.handle, reason);
    }

    function assertUsable(method){
        if (destroyed) throw new Error("messageBoxObj." + method + "() called on a destroyed MessageBox");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling messageBoxObj." + method + "()");
    }

    var methods = {
        initialize: { writable: false },
        show: { writable: false },
        closeAll: { writable: false },
        destroy: { writable: false },
        config: { writable: false },
        count: {
            get: function(){ return open.filter(function(r){ return r.state != "leaving"; }).length; }
        }
    };
    TYPES.forEach(function(type){ methods[type] = { writable: false }; });
    Object.defineProperties(this, methods);

    //Every property is checked by the same rule whether it is set on config or passed
    //to show() for one message; only the wording of the error differs.
    var props = {};
    Object.keys(settings).forEach(function(name){
        props[name] = {
            set: function(value){
                settings[name] = check(name, value, "messageBoxObj.config." + name + " property value");
            }
        };
    });
    Object.defineProperties(this.config, props);
}

var TYPES = ["info", "success", "warning", "error"];
var EFFECTS = ["drop", "slideLeft", "slideRight", "fade", "none"];
var ALIGNMENTS = ["left", "center", "right"];
var OPTION_KEYS = ["type", "title", "effect", "alignment", "duration", "speed", "theme", "width", "offset",
    "closeButton", "pauseOnHover", "closeOnClick", "showProgress", "onClose"];
var LENGTH = /^\d+(\.\d+)?(px|em|rem|%|vw|ch)$/;
var NARROW = 600;                                   //px; below this every message uses the centre lane
var EDGE_GAP = 24;                                  //px a message starts and ends past the window's edge
var ENTER_CURVE = "cubic-bezier(.16,1,.3,1)";      //fast, then a long gentle settle
//Exits accelerate away steadily. A steeper ease-in sits almost still for most of the
//duration and is cut off by the core's timed callback while still in view.
var EXIT_CURVE = "cubic-bezier(.4,0,1,1)";

//Returns the value to store - a width given as a number becomes px - or throws.
function check(name, value, what){
    switch (name){
        case "effect":
            matchString(value, EFFECTS, what + " must be one of " + EFFECTS.map(quote).join(", "));
            return value;
        case "alignment":
            matchString(value, ALIGNMENTS, what + " must be \"left\", \"center\" or \"right\"");
            return value;
        case "type":
            matchString(value, TYPES, what + " must be one of " + TYPES.map(quote).join(", "));
            return value;
        case "theme":
            matchString(value, ["light", "dark"], what + " must be \"light\" or \"dark\"");
            return value;
        case "duration":
            validateNumber(value, what + " must be a number of milliseconds (0 keeps the message until it is closed)");
            if (!(value >= 0) || !isFinite(value)) throw new RangeError(what + " must be 0 or more milliseconds");
            return value;
        case "speed":
            validateNumber(value, what + " must be a number of milliseconds");
            if (!(value >= 0) || value > 10000) throw new RangeError(what + " must be from 0 to 10000 milliseconds");
            return value;
        case "offset":
            validateNumber(value, what + " must be a number of pixels");
            if (!(value >= 0) || value > 1000) throw new RangeError(what + " must be from 0 to 1000 pixels");
            return value;
        case "maxVisible":
            validateNumber(value, what + " must be a number");
            if (value % 1 != 0 || value < 1 || value > 50) throw new RangeError(what + " must be a whole number from 1 to 50");
            return value;
        case "width":
            if (typeof value == "number"){
                if (!(value > 0) || !isFinite(value)) throw new RangeError(what + " must be more than 0");
                return value + "px";
            }
            validateString(value, what + " must be a number (px) or a CSS length string");
            if (!LENGTH.test(value)) throw new Error(what + ": '" + value + "' is not a length, as in 360 or \"24rem\"");
            return value;
        case "title":
            validateString(value, what + " must be a string");
            return value;
        case "onShow":
        case "onClose":
            if (value === null) return null;
            validateFunction(value, what + " must be a function, or null");
            return value;
        default:    //the boolean switches
            validateBoolean(value, what + " must be a boolean");
            return value;
    }
}

function quote(s){ return "\"" + s + "\""; }

//A fresh object per call, because the core slide writes its defaults into the one it is given.
function slideY(y, speed, timingFunction){
    return { use: "position", positions: { y: y }, speed: speed, timingFunction: timingFunction };
}

//Moved by "left" only: core.css transitions "right" only from this release on, so a
//page holding an older or cached core.css would jump a message moved by it.
function slideX(x, speed, timingFunction){
    return { use: "position", positionProperty: "left", positions: { x: x }, speed: speed, timingFunction: timingFunction };
}

function reducedMotion(){
    return window.matchMedia != null && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function now(){
    return window.performance != null ? performance.now() : Date.now();
}

/*--------------------------- lanes ---------------------------*/

//One fixed column per alignment and offset, shared by every instance on the page.
var lanes = {};

function laneFor(alignment, offset){
    var key = alignment + "@" + offset;
    var lane = lanes[key];
    if (lane == null || !lane.isConnected){
        lane = $$.ce("DIV", { class: "vmb-lane vmb-" + alignment });
        lane.dataset.key = key;
        lane.style["top"] = offset + "px";
        lane.style["padding-left"] = offset + "px";
        lane.style["padding-right"] = offset + "px";
        document.body.appendChild(lane);
        lanes[key] = lane;
    }
    return lane;
}

function releaseLane(lane){
    if (lane == null || lane.firstChild != null) return;
    lane.remove();
    if (lanes[lane.dataset.key] === lane) delete lanes[lane.dataset.key];
}

var ICONS = {
    info: '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M7 7h2v5H7zM7 4h2v2H7z"/></svg>',
    success: '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3.5 8.5l3 3 6-7"/></svg>',
    warning: '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M7 3h2v6H7zM7 10.5h2v2H7z"/></svg>',
    error: '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>'
};
var ICON_CLOSE = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 4l8 8M12 4l-8 8"/></svg>';

//Linked when the module is imported, and appended at once, as the skeleton's sheet is,
//rather than through vModel.core.functions.linkStyleSheet() from initialize(): that
//helper waits 300ms before it appends, and a page often posts a message while it boots.
(async function addStyles() {
    try {
        var path = await processAssetPath();
        if (path instanceof Error) throw new Error(path);
        if (document.querySelector("link[data-id='messageBox']") != null) return;
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.dataset.id = "messageBox";
        link.setAttribute("href", path + "css/messageBox.css");
        document.head.appendChild(link);
    } catch (error) {
        console.error(error)
    }
})();
/**********************************************************************/
