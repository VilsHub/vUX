/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2026-11-09
 *
 *
 */
// Import vUX core
import {
    validateNumber, validateString, validateBoolean, validateFunction,
    validateObjectLiteral, matchString
} from "./src/helpers.js";
import "./src/vUX-core-4.0.0.js";

/****************************Prompt******************************/
export function Prompt() {
    /**
     * Modal dialogs that ask the visitor something and hand the answer back as a
     * Promise: alert() (acknowledge), confirm() (yes or no) and input() (a value).
     * They replace window.alert/confirm/prompt with a styled, themable dialog
     * that does not freeze the page's scripts.
     *
     * Each dialog is a native <dialog> opened with showModal(), so it sits in the
     * browser's top layer, above every z-index on the page (ModalDisplayer
     * layers included), and the page behind it is inert: no clicks, no focus, no
     * tabbing out. The page is also held still while it is up.
     *
     * One dialog is shown at a time, across every Prompt on the page. A call made
     * while another dialog is up waits in a shared QUEUE and opens when the one
     * before it has closed, so two questions never land on top of each other.
     */

    var self = this;
    var initialized = false, destroyed = false;
    var settings = {
        theme: "light",
        okText: "OK",
        cancelText: "Cancel",
        width: "420px",
        speed: 180,
        closeOnBackdrop: false,
        respectReducedMotion: true
    };

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This Prompt has been destroyed, create a new instance instead of re-initializing");
        if (typeof HTMLDialogElement != "function" || typeof HTMLDialogElement.prototype.showModal != "function"){
            throw new Error("Prompt needs a browser with <dialog> showModal() support");
        }
        initialized = true;
    }

    //Resolves with undefined once acknowledged (OK, Escape or a backdrop click).
    this.alert = function(message, options){
        assertUsable("alert");
        return ask("alert", message, options, "promptObj.alert");
    }

    //Resolves with true for OK, false for Cancel, Escape or a backdrop click.
    this.confirm = function(message, options){
        assertUsable("confirm");
        return ask("confirm", message, options, "promptObj.confirm");
    }

    //Resolves with the entered string for OK, null for Cancel, Escape or a backdrop click.
    this.input = function(message, options){
        assertUsable("input");
        return ask("input", message, options, "promptObj.input");
    }

    //Dismisses this instance's open dialog and drops its queued ones, each resolving
    //as if cancelled. Other instances' dialogs are left alone.
    this.closeAll = function(){
        assertUsable("closeAll");
        cancelOwn();
    }

    this.destroy = function(){
        if (destroyed) return;
        cancelOwn();
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    function ask(kind, message, options, where){
        if (typeof message != "string" && !(message instanceof Element)){
            throw new TypeError(where + "(x.) argument 1 must be a string or an element");
        }
        var opts = resolveOptions(kind, options, where);
        return new Promise(function(resolve){
            queue.push({ owner: self, kind: kind, message: message, opts: opts, resolve: resolve });
            next();
        });
    }

    //Per-call options are the config with some properties replaced for this one dialog.
    function resolveOptions(kind, options, where){
        var opts = {};
        for (var name in settings) opts[name] = settings[name];
        opts.title = "";
        opts.danger = false;
        opts.value = "";
        opts.placeholder = "";
        opts.inputType = "text";
        opts.maxLength = 0;
        opts.required = false;
        opts.validate = null;

        if (options === undefined) return opts;
        //null is checked here: the helper below would fail on it with an engine error
        if (options === null || typeof options != "object") throw new TypeError(where + "(.x) argument 2 must be an object literal of options");
        validateObjectLiteral(options, where + "(.x) argument 2 must be an object literal of options");
        var allowed = kind == "input" ? OPTION_KEYS.concat(INPUT_KEYS) : OPTION_KEYS;
        for (var key in options){
            if (allowed.indexOf(key) == -1){
                var hint = INPUT_KEYS.indexOf(key) != -1 ? " ('" + key + "' only applies to input())" : "";
                throw new Error(where + "(.x) argument 2: unknown option '" + key + "'" + hint + "; use " + allowed.join(", "));
            }
            opts[key] = check(key, options[key], where + "(.x) argument 2 option '" + key + "'");
        }
        return opts;
    }

    function cancelOwn(){
        for (var x = queue.length - 1; x >= 0; x--){
            if (queue[x].owner === self){
                var req = queue.splice(x, 1)[0];
                req.resolve(CANCEL_VALUE[req.kind]);
            }
        }
        if (current != null && current.req.owner === self) finish(current, CANCEL_VALUE[current.req.kind], true);
    }

    function assertUsable(method){
        if (destroyed) throw new Error("promptObj." + method + "() called on a destroyed Prompt");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling promptObj." + method + "()");
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        alert: { writable: false },
        confirm: { writable: false },
        input: { writable: false },
        closeAll: { writable: false },
        destroy: { writable: false },
        config: { writable: false },
        //this instance's dialogs that are open or waiting their turn
        pending: {
            get: function(){
                var n = queue.filter(function(r){ return r.owner === self; }).length;
                return n + (current != null && current.req.owner === self && !current.closing ? 1 : 0);
            }
        }
    });

    var props = {};
    Object.keys(settings).forEach(function(name){
        props[name] = {
            set: function(value){
                settings[name] = check(name, value, "promptObj.config." + name + " property value");
            }
        };
    });
    Object.defineProperties(this.config, props);
}

var OPTION_KEYS = ["title", "okText", "cancelText", "danger", "theme", "width", "speed", "closeOnBackdrop"];
var INPUT_KEYS = ["value", "placeholder", "inputType", "maxLength", "required", "validate"];
var INPUT_TYPES = ["text", "password", "email", "number", "tel", "url", "search"];
var CANCEL_VALUE = { alert: undefined, confirm: false, input: null };
var LENGTH = /^\d+(\.\d+)?(px|em|rem|%|vw|ch)$/;
var idCount = 0;

//Returns the value to store (a width given as a number becomes px) or throws.
function check(name, value, what){
    switch (name){
        case "theme":
            matchString(value, ["light", "dark"], what + " must be \"light\" or \"dark\"");
            return value;
        case "inputType":
            matchString(value, INPUT_TYPES, what + " must be one of " + INPUT_TYPES.map(quote).join(", "));
            return value;
        case "speed":
            validateNumber(value, what + " must be a number of milliseconds");
            if (!(value >= 0) || value > 5000) throw new RangeError(what + " must be from 0 to 5000 milliseconds");
            return value;
        case "maxLength":
            validateNumber(value, what + " must be a number");
            if (value % 1 != 0 || value < 0) throw new RangeError(what + " must be a whole number, 0 for no limit");
            return value;
        case "width":
            if (typeof value == "number"){
                if (!(value > 0) || !isFinite(value)) throw new RangeError(what + " must be more than 0");
                return value + "px";
            }
            validateString(value, what + " must be a number (px) or a CSS length string");
            if (!LENGTH.test(value)) throw new Error(what + ": '" + value + "' is not a length, as in 420 or \"26rem\"");
            if (!(parseFloat(value) > 0)) throw new RangeError(what + " must be more than 0");
            return value;
        case "okText":
        case "cancelText":
            validateString(value, what + " must be a string");
            if (value.trim() == "") throw new Error(what + " must not be empty: it is the button's only label");
            return value;
        case "title":
        case "value":
        case "placeholder":
            validateString(value, what + " must be a string");
            return value;
        case "validate":
            if (value === null) return null;
            validateFunction(value, what + " must be a function, or null");
            return value;
        default:    //the boolean switches
            validateBoolean(value, what + " must be a boolean");
            return value;
    }
}

function quote(s){ return "\"" + s + "\""; }

function reducedMotion(){
    return window.matchMedia != null && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/*--------------------------- the shared queue ---------------------------*/

var queue = [];         //requests from every instance waiting their turn, oldest first
var current = null;     //the dialog on screen: { req, dialog, ... }
var pageState = { overflow: "", paddingRight: "", frozen: false };

function next(){
    //A dialog taken out of the page by other code never answered; it must not hold the queue.
    if (current != null && !current.dialog.isConnected && !current.closing) finish(current, CANCEL_VALUE[current.req.kind], true);
    if (current != null || queue.length == 0) return;
    open(queue.shift());
}

function open(req){
    var opts = req.opts, kind = req.kind, id = "vpr-" + (++idCount);
    var cur = { req: req, closing: false, returnFocus: document.activeElement, validating: false };
    current = cur;

    //role alertdialog for the ones that interrupt to ask or tell; an input is an ordinary dialog
    var dialog = $$.ce("DIALOG", {
        class: "vpr-dialog vpr-" + opts.theme + " vpr-kind-" + kind + (opts.danger ? " vpr-danger" : ""),
        role: kind == "input" ? "dialog" : "alertdialog",
        "aria-describedby": id + "-msg"
    });
    var overlay = $$.ce("DIV", { class: "vpr-overlay" });
    var box = $$.ce("FORM", { class: "vpr-box", novalidate: "" });
    var title = null, field = null, error = null;

    box.style["width"] = opts.width;

    if (opts.title != ""){
        title = $$.ce("H2", { class: "vpr-title", id: id + "-title" });
        title.textContent = opts.title;
        box.appendChild(title);
        dialog.setAttribute("aria-labelledby", id + "-title");
    }else{
        dialog.setAttribute("aria-label", kind == "input" ? "Enter a value" : kind == "confirm" ? "Confirm" : "Message");
    }

    //For input() the message is the field's label, so a screen reader reads it with the field.
    var msg = $$.ce(kind == "input" ? "LABEL" : "DIV", { class: "vpr-message", id: id + "-msg" });
    //a string is always text, never markup: a question often carries user input such as a name
    if (typeof req.message == "string") msg.textContent = req.message; else msg.appendChild(req.message);
    box.appendChild(msg);

    if (kind == "input"){
        field = $$.ce("INPUT", { class: "vpr-input", type: opts.inputType, id: id + "-field", autocomplete: "off" });
        field.value = opts.value;
        if (opts.placeholder != "") field.placeholder = opts.placeholder;
        if (opts.maxLength > 0) field.maxLength = opts.maxLength;
        msg.setAttribute("for", id + "-field");
        error = $$.ce("DIV", { class: "vpr-error", id: id + "-err", "aria-live": "polite" });
        field.setAttribute("aria-describedby", id + "-err");
        box.appendChild(field);
        box.appendChild(error);
        field.addEventListener("input", function(){ setError(cur, ""); });
    }

    var actions = $$.ce("DIV", { class: "vpr-actions" });
    var cancel = null;
    if (kind != "alert"){
        cancel = $$.ce("BUTTON", { class: "vpr-btn vpr-cancel", type: "button" });
        cancel.textContent = opts.cancelText;
        actions.appendChild(cancel);
        cancel.addEventListener("click", function(){ finish(cur, CANCEL_VALUE[kind]); });
    }
    var ok = $$.ce("BUTTON", { class: "vpr-btn vpr-ok", type: "submit" });
    ok.textContent = opts.okText;
    actions.appendChild(ok);
    box.appendChild(actions);

    dialog.appendChild(overlay);
    dialog.appendChild(box);
    cur.dialog = dialog;
    cur.box = box;
    cur.field = field;
    cur.error = error;
    cur.ok = ok;

    box.addEventListener("submit", function(e){
        e.preventDefault();
        submit(cur);
    });
    overlay.addEventListener("click", function(){
        if (opts.closeOnBackdrop) finish(cur, CANCEL_VALUE[kind]);
    });

    //Escape is taken here and stopped, so it answers this dialog only: left to bubble, it
    //would reach page-level handlers too, such as ModalDisplayer closing the panel beneath.
    dialog.addEventListener("keydown", function(e){
        if (e.key == "Escape"){
            e.preventDefault();
            e.stopPropagation();
            finish(cur, CANCEL_VALUE[kind]);
        }
    });
    //Other close requests the browser makes (a phone's back gesture) end as a cancel, with
    //the exit animation, rather than the browser closing the dialog outright.
    dialog.addEventListener("cancel", function(e){
        e.preventDefault();
        finish(cur, CANCEL_VALUE[kind]);
    });
    //Closed by anything other than this module (page code calling close()): answered as a
    //cancel, so the Promise settles and the shared queue moves on.
    dialog.addEventListener("close", function(){
        if (!cur.closing) finish(cur, CANCEL_VALUE[kind], true);
    });

    var speed = opts.speed;
    if (speed > 0 && opts.respectReducedMotion && reducedMotion()) $$.sm(dialog).class.add("vpr-still");
    overlay.style["transition-duration"] = speed + "ms";
    box.style["transition-duration"] = speed + "ms";
    cur.speed = speed;

    freezePage();
    document.body.appendChild(dialog);
    dialog.showModal();

    //Focus goes where the answer most likely is, except for a destructive question, where
    //it starts on Cancel so a stray Enter cannot delete anything.
    if (field != null){
        field.focus();
        field.select();
    }else if (opts.danger && cancel != null){
        cancel.focus();
    }else{
        ok.focus();
    }

    dialog.scrollHeight;    //styled at rest first, so the class below is animated
    $$.sm(dialog).class.add("vpr-in");
}

async function submit(cur){
    if (cur.closing || cur.validating) return;
    var kind = cur.req.kind, opts = cur.req.opts;
    if (kind == "alert"){ finish(cur, undefined); return; }
    if (kind == "confirm"){ finish(cur, true); return; }

    var value = cur.field.value;
    if (opts.required && value.trim() == ""){
        setError(cur, "Please enter a value.");
        cur.field.focus();
        return;
    }
    if (opts.validate != null){
        //validate(value) returns an error message to keep the dialog open, or nothing to accept.
        //It may be async (a server check); OK is held off while it runs.
        cur.validating = true;
        cur.ok.disabled = true;
        var problem;
        try{
            problem = await opts.validate(value);
        }catch(err){
            problem = err != null && err.message ? err.message : String(err);
        }
        cur.validating = false;
        cur.ok.disabled = false;
        if (cur.closing) return;    //cancelled while the check ran
        if (typeof problem == "string" && problem != ""){
            setError(cur, problem);
            cur.field.focus();
            return;
        }
    }
    finish(cur, value);
}

function setError(cur, text){
    if (cur.error == null) return;
    cur.error.textContent = text;
    if (text == "") cur.field.removeAttribute("aria-invalid"); else cur.field.setAttribute("aria-invalid", "true");
}

//Answers the dialog at once, then animates it out and opens the next one in the queue.
function finish(cur, result, immediate){
    if (cur.closing) return;
    cur.closing = true;
    cur.req.resolve(result);
    $$.sm(cur.dialog).class.remove("vpr-in");
    $$.sm(cur.dialog).class.add("vpr-leaving");
    if (immediate || cur.speed == 0) teardown(cur);
    else setTimeout(function(){ teardown(cur); }, cur.speed);
}

function teardown(cur){
    if (cur.dialog.open) cur.dialog.close();
    cur.dialog.remove();
    if (current === cur) current = null;
    if (current == null && queue.length == 0){
        releasePage();
        var back = cur.returnFocus;
        if (back != null && back.isConnected && typeof back.focus == "function") back.focus({ preventScroll: true });
    }
    next();
}

//The page is held still with overflow, and the scrollbar it hides is handed back to the body
//as right padding so the content behind does not jump sideways. A page that is already held,
//by a ModalDisplayer layer for instance, is left to whoever holds it: taking a copy of its
//"hidden" and restoring that later would lock the page for good if that layer closed first.
function freezePage(){
    if (pageState.frozen) return;
    if (document.body.style["overflow"] == "hidden") return;
    var scrollbar = window.innerWidth - document.documentElement.clientWidth;
    pageState.overflow = document.body.style["overflow"];
    pageState.paddingRight = document.body.style["padding-right"];
    if (scrollbar > 0){
        var padding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
        document.body.style["padding-right"] = (padding + scrollbar) + "px";
    }
    document.body.style["overflow"] = "hidden";
    pageState.frozen = true;
}

function releasePage(){
    if (!pageState.frozen) return;
    document.body.style["overflow"] = pageState.overflow;
    document.body.style["padding-right"] = pageState.paddingRight;
    pageState.frozen = false;
}

//Linked when the module is imported and appended at once, as MessageBox's sheet is, so a
//page that asks something while it boots does not show the dialog unstyled.
(async function addStyles() {
    try {
        var path = await processAssetPath();
        if (path instanceof Error) throw new Error(path);
        if (document.querySelector("link[data-id='prompt']") != null) return;
        var link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.dataset.id = "prompt";
        link.setAttribute("href", path + "css/prompt.css");
        document.head.appendChild(link);
    } catch (error) {
        console.error(error)
    }
})();
/**********************************************************************/
