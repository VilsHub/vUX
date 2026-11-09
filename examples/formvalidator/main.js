/*
 * vUX FormValidator: runnable example.
 *
 * FormValidator never decides WHEN to check a field: the page calls validate() on focusout and
 * on submit. What it owns is the checking (rules in a fixed order), the message boxes, the
 * formOk() record, and the submit cycle (overlay, loader, feedback box).
 *
 * The page is served by a static server, so there is no backend. Two things stand in for one:
 *  - a GET to "../../LICENSE" answers 200 with a file, which drives the success path
 *    (a feedBackController decides what the user sees), and
 *  - a POST, PUT or DELETE is answered 501 by python's http.server, which drives the error box.
 */
import { FormValidator } from "../../vUX-formValidator.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => root.querySelectorAll(sel);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

//a static URL that exists, so a GET answers 200 (http.server ignores the query string)
const OK_URL = "../../LICENSE";
//a path that does not exist, for the error box
const MISSING_URL = "./no-such-endpoint";

//the loader ring, as CSS for .vFormLoader::before. It replaces the module's own ring, so it
//must bring its own content:''. The loader element itself is what spins.
const AMBER_RING = "content:''; box-sizing:border-box; border:3px solid rgba(255,180,84,.18); border-top-color:#ffb454; border-radius:50%";

//the feedback box on a dark page: one entry per type, each part optional
const darkBox = (accent, ink) => ({
    container: "background:#0f1520; border:1px solid #1f2a3a; border-radius:14px; max-width:320px; width:92%; box-shadow:0 24px 60px -20px rgba(0,0,0,.9)",
    title: "background:" + accent + "; color:" + ink + "; box-shadow:none; font-size:16px; height:44px; line-height:44px",
    body: "color:#d7e0ec; font-style:normal; padding-top:26px; line-height:1.55",
    button: "background:" + accent + "; color:" + ink + "; font-weight:600; padding:0 18px"
});
const DARK_FEEDBACK = {
    success: darkBox("#a7e05f", "#101a06"),
    warning: darkBox("#ffb454", "#20160a"),
    error: darkBox("#ff6b7f", "#22070d")
};
const DARK_OVERLAY = "background:rgba(8,11,17,.8); backdrop-filter:blur(3px)";

/* ------------------------------------------------------------------ *
 * 1. Hero: a sign-up form validated on focusout and on submit
 * ------------------------------------------------------------------ */

const signup = $("#signup");
const signupValidator = new FormValidator(signup);
const sc = signupValidator.config;

//each radio sits in its own <label>, so its parent is not a useful wrapper. The radios carry
//data-wrap="plans", and this tells the validator to put the message on that ancestor instead
sc.wrapperClassAttribute = "data-wrap";

//the left/right fields carry data-small-view="1100": below 1100px their message falls back to
//the bottom, because the card leaves no room beside it on a narrower window
sc.smallViewAttribute = "data-small-view";

//box text does not wrap by default; let bottom boxes wrap on a phone. The height is measured
//after the text is in, so a two-line box still fits. Left/right boxes are as tall as the
//wrapper (44px here), so their line-height centres the text
sc.bottomConStyle = "white-space:normal; line-height:1.5; padding:7px 12px; text-align:left";
sc.leftConStyle = "line-height:42px";
sc.rightConStyle = "line-height:42px";

sc.overlayStyle = DARK_OVERLAY + "; border-radius:18px";
sc.progressIndicatorStyle = AMBER_RING;
sc.feedbackModalStyles = DARK_FEEDBACK;

//The success path. A GET puts the string fields in the query string (the file is not sent),
//which is fine for a static file. A real form would POST to an endpoint.
sc.submissionMethod = "GET";

//Called on a 2xx answer. Returning anything but true leaves the overlay and loader up, which
//is what lets this demo hold the loader for a moment: a local answer arrives in a few ms.
sc.feedBackController = (v, text, xhr) => {
    const first = signup.fullName.value.trim().split(/\s+/)[0] || "there";
    setTimeout(() => {
        //showFeedback() inserts the message as HTML, so the user's own text is escaped
        v.showFeedback(
            null,
            "Welcome aboard, <b>" + esc(first) + "</b>.<br>The demo server answered " + xhr.status +
            " with " + text.length + " bytes (the LICENSE file).",
            "success",
            { title: "Account created", buttonLabel: "Done" }
        );
    }, 1100);
    return false;   //the user closes the box with its button
};

signupValidator.initialize();

const taken = ["ada", "grace", "linus", "vilshub"];

//One entry per field: the element (or the radio group), its rules and where its message goes.
//Rule keys run in a fixed order whatever order they are written in, and the first failure wins.
const SIGNUP = {
    fullName: {
        field: signup.fullName, loc: "left",
        rules: {
            trim: "",   //runs first, so "   " does not pass 'required'
            required: "Your name, please",
            alpha: "Letters and spaces only",
            "fullName:3": ["First and last name", "Three names at most", "2+ letters per name"]
        }
    },
    username: {
        field: signup.username, loc: "right",
        rules: {
            required: "Pick a username",
            "minLength:3": "3 characters or more",
            "maxLength:16": "16 characters at most",
            alphaNum: "Letters and digits only",
            noSpace: "No spaces",
            "notIn:admin root": "Contains a reserved word",
            //true = valid, false = message 1, a number = that message. Message 2 has the s:-
            //prefix, so a free name answers with a success box and still counts as valid
            callBack: [
                (v, field) => taken.includes(field.value.toLowerCase()) ? 1 : 2,
                "Already taken",
                "s:- Available"
            ]
        }
    },
    email: {
        field: signup.email, loc: "right",
        rules: { trim: "", required: "Enter your email", email: "Not an email address" }
    },
    password: {
        field: signup.password, loc: "bottom",
        rules: {
            required: "Choose a password",
            "minLength:8": "8 characters or more",
            //the slash form keeps flags; w:- makes it a warning, which formOk() ignores
            "match:/^(?=.*\\d)(?=.*[A-Z])/": "w:- Add a digit and a capital"
        }
    },
    confirm: {
        field: signup.confirm, loc: "bottom",
        rules: {
            required: "Confirm it",
            callBack: [(v, field) => field.value === signup.password.value, "Does not match"]
        }
    },
    plan: {
        //a RadioNodeList: required means one of them is checked
        field: signup.elements.plan, loc: "bottom",
        rules: { required: "Pick a plan" }
    },
    avatar: {
        //optional: with no file the field passes and ext/maxSize are skipped
        field: signup.avatar, loc: "bottom",
        rules: { "ext:jpg png webp": "JPG, PNG or WebP only", "maxSize:200KB": "200KB at most" }
    },
    terms: {
        field: signup.terms, loc: "bottom",
        rules: { required: "Accept the terms to continue" }
    }
};

function setReadout(id, text, cls) {
    const b = $(id);
    b.textContent = text;
    b.className = cls || "";
}

function check(name) {
    const entry = SIGNUP[name];
    const ok = signupValidator.validate(entry.field, entry.rules, entry.loc);
    setReadout("#roLast", name + " → " + ok, ok ? "ok" : "bad");
    return ok;
}

//text fields are checked when the user leaves them...
signup.addEventListener("focusout", e => {
    const name = e.target.name;
    if (SIGNUP[name] && e.target.type != "radio" && e.target.type != "checkbox" && e.target.type != "file") check(name);
});
//...choices when they change. The validator's own click handler clears the field's message
//first (click fires before change), so the field is re-judged from clean
signup.addEventListener("change", e => {
    const name = e.target.name;
    if (name == "plan" || name == "terms" || name == "avatar") check(name);
});

signup.addEventListener("submit", e => {
    e.preventDefault();
    //validate EVERY field, then ask formOk() once: it reports what this round recorded
    Object.keys(SIGNUP).forEach(check);
    const ok = signupValidator.formOk();
    setReadout("#roOk", String(ok), ok ? "ok" : "bad");
    if (!ok) { setReadout("#roSubmit", "not sent", ""); return; }
    //submit() returns false, and sends nothing, while a request is already pending
    const sent = signupValidator.submit({ source: "vux-example" }, OK_URL);
    setReadout("#roSubmit", sent ? "sent (GET)" : "ignored, pending", sent ? "ok" : "bad");
});

$("#heroFill").addEventListener("click", () => {
    signup.fullName.value = "Ada King Lovelace";
    signup.username.value = "lovelace";
    signup.email.value = "ada@example.com";
    signup.password.value = "engine1843";       //valid, but earns the warning: no capital
    signup.confirm.value = "engine1843";
    signup.elements.plan.value = "pro";
    signup.terms.checked = true;
    Object.keys(SIGNUP).forEach(check);
    const ok = signupValidator.formOk();
    setReadout("#roOk", String(ok), ok ? "ok" : "bad");
});

$("#heroReset").addEventListener("click", () => {
    signup.reset();
    Object.keys(SIGNUP).forEach(name => signupValidator.message.clear(SIGNUP[name].field));
    ["#roLast", "#roOk", "#roSubmit"].forEach(id => setReadout(id, "-"));
});

/* ------------------------------------------------------------------ *
 * 2. Playground
 * ------------------------------------------------------------------ */

const specimen = $("#specimen");
const sName = $("#sName");
const logEl = $("#log");

function log(line) {
    const t = new Date();
    const stamp = String(t.getMinutes()).padStart(2, "0") + ":" + String(t.getSeconds()).padStart(2, "0");
    logEl.textContent += stamp + "  " + line + "\n";
    logEl.scrollTop = logEl.scrollHeight;
}
function setStatus(state, text) {
    $("#pStatus").className = "status" + (state ? " " + state : "");
    $("#pStatusText").textContent = text;
}
//every playground call goes through here, so a throw (after destroy(), a bad JSON rule...) is
//printed instead of breaking the page
function attempt(label, fn) {
    try {
        const result = fn();
        setStatus("run", label + (result === undefined ? "" : " → " + result));
        return result;
    } catch (error) {
        setStatus("err", error.message);
        log(label + " threw " + error.constructor.name + ": " + error.message);
    }
}

const RULE_PRESETS = {
    basic: { trim: "", required: "A name is required", "minLength:3": "3 characters or more", noSpace: "w:- Spaces will be dashes" },
    match: { required: "Required", "match:/^[a-z][a-z0-9_]*$/i": "A letter, then letters, digits or _" },
    warn: { "maxLength:6": "w:- Long for a badge", "notIn:admin root": "Reserved word" }
};
$("#rules").value = JSON.stringify(RULE_PRESETS.basic, null, 2);

//config is write-only across vUX, so the page keeps its own copy of what it set
const S = {
    loc: "right", type: "error", small: 866, custom: false,
    loader: "style", overlay: "dark", method: "GET", success: "close",
    controller: true, themed: true, boxStyle: false
};

//a stand-in for a ModalDisplayer: the success button calls config.modal.close()
const fakeModal = { close: () => log("config.modal.close() called by the success button") };

const PILL = "border-radius:999px; padding:0 14px";

let playValidator = null;

//The settings read every time they are used. Safe to set on a running validator.
function applyLive(v) {
    v.config.submissionMethod = S.method;
    v.config.successButtonAction = S.success;
    v.config.redirectTo = "#playground";
    v.config.modal = fakeModal;
    v.config.smallViewAttribute = "data-small-view";
    sName.setAttribute("data-small-view", String(S.small));
    v.config.bottomConStyle = S.boxStyle ? PILL : "";
    v.config.leftConStyle = S.boxStyle ? PILL + "; line-height:42px" : "line-height:42px";
    v.config.rightConStyle = S.boxStyle ? PILL + "; line-height:42px" : "line-height:42px";
    v.config.CSRFTokenElement = $("#sToken");
}

//The settings initialize() reads (overlay, loader, progress type), and two that cannot be
//unset once given (feedBackController and feedbackModalStyles only accept a value), need a
//new instance. destroy() first: it takes the overlay, the boxes and the listeners back.
function build(reason) {
    if (playValidator) playValidator.destroy();
    specimen.classList.remove("sending");
    $("#sSend").textContent = "Send";

    const v = new FormValidator(specimen);
    const c = v.config;
    //lighter than the hero's, so the button loader and the custom sweep stay visible behind it
    if (S.overlay == "dark") c.overlayStyle = "background:rgba(8,11,17,.5); backdrop-filter:blur(1px); border-radius:14px";
    //no progressIndicatorStyle = the module's own ring, drawn dark for its white overlay: pick
    //"module default (white)" under overlayStyle to see the pair as shipped
    if (S.loader == "style") c.progressIndicatorStyle = AMBER_RING;
    if (S.loader == "button") {
        c.loaderLocation = "button";
        c.submitButtonClass = "sendBtn";   //required with "button", checked by initialize()
    }
    if (S.loader == "custom") {
        c.progressAnimationType = "custom";
        //both are required. onReceive runs once per onSend: when the answer arrives on the
        //default path, or at hideProgress() when a controller keeps the form busy
        c.progressAnimationCallbacks = {
            onSend: () => { specimen.classList.add("sending"); $("#sSend").textContent = "Sending…"; log("onSend(validator)"); },
            onReceive: () => { specimen.classList.remove("sending"); $("#sSend").textContent = "Send"; log("onReceive(validator)"); }
        };
    }
    if (S.themed) c.feedbackModalStyles = DARK_FEEDBACK;
    if (S.controller) {
        c.feedBackController = (self, text, xhr) => {
            log("feedBackController(v, " + text.length + " chars, status " + xhr.status + ") returned false");
            setTimeout(() => {
                if (self !== playValidator) return;   //rebuilt or destroyed meanwhile
                //showFeedback() ends the loading state (button loader off, custom onReceive)
                //and puts the box up in the same overlay
                self.showFeedback(null, "Saved. The controller held the loader for 1.2s, then called showFeedback().", "success", { title: "Saved", buttonLabel: "Ok" });
            }, 1200);
            return false;
        };
    }
    applyLive(v);
    v.initialize();
    playValidator = window.playValidator = v;
    log("new FormValidator(specimen) + initialize()" + (reason ? "  [" + reason + "]" : ""));
    renderCode();
}

function customStyles() {
    //[height of a bottom box in px, CSS appended to a left/right box]
    return S.custom ? [64, "font-weight:700"] : null;
}

function currentRules() {
    return JSON.parse($("#rules").value);   //a JSON parse error is printed by attempt()
}

/* message.write / clear */
$("#pWrite").addEventListener("click", () => attempt("message.write()", () => {
    playValidator.message.write(sName, S.type, S.loc, $("#pText").value, customStyles());
    const fallback = (S.loc != "bottom" && innerWidth < S.small) ? " (fell back to bottom: window " + innerWidth + "px < " + S.small + "px)" : "";
    log("message.write(field, \"" + S.type + "\", \"" + S.loc + "\", ...)" + fallback);
}));
$("#pClear").addEventListener("click", () => attempt("message.clear()", () => { playValidator.message.clear(sName); log("message.clear(field)"); }));

/* validate / formOk */
$("#pValidate").addEventListener("click", () => attempt("validate()", () => {
    const ok = playValidator.validate(sName, currentRules(), S.loc, customStyles());
    log("validate(field, rules, \"" + S.loc + "\") returned " + ok);
    return ok;
}));
$("#pFormOk").addEventListener("click", () => attempt("formOk()", () => {
    const ok = playValidator.formOk();
    log("formOk() returned " + ok + (ok ? "" : " and reset its record: ask again and it says true"));
    return ok;
}));
$$$("[data-rules]").forEach(b => b.addEventListener("click", () => {
    $("#rules").value = JSON.stringify(RULE_PRESETS[b.dataset.rules], null, 2);
}));

/* the specimen's own submit button: validate, then submit */
specimen.addEventListener("submit", e => {
    e.preventDefault();
    attempt("submit", () => {
        playValidator.validate(sName, currentRules(), S.loc, customStyles());
        if (!playValidator.formOk()) { log("formOk() false: not sent"); return "not sent"; }
        const sent = playValidator.submit({ demo: "playground" }, OK_URL);
        log("submit(data, url) with " + S.method + " returned " + sent);
        return sent;
    });
});

/* actions */
const act = (id, label, fn) => $(id).addEventListener("click", () => attempt(label, fn));

act("#aSubmit", "submit()", () => {
    const r = playValidator.submit(null, OK_URL);
    log("submit(null, \"" + OK_URL + "\") with " + S.method + " returned " + r);
    return r;
});
act("#aTwice", "submit() twice", () => {
    const a = playValidator.submit(null, OK_URL);
    const b = playValidator.submit(null, OK_URL);   //the first is still pending: ignored
    log("submit() then submit() returned " + a + ", " + b);
    return a + ", " + b;
});
act("#aPost", "POST", () => {
    //the method is read when submit() is called, so it can be switched just for this call.
    //python's http.server answers ANY POST with 501; a server that takes POSTs answers this
    //made-up path with 404. Either way the error box shows, with the status's own text
    playValidator.config.submissionMethod = "POST";
    const r = playValidator.submit(null, MISSING_URL);
    playValidator.config.submissionMethod = S.method;
    log("POST to \"" + MISSING_URL + "\": a static server refuses it, so the error box shows");
    return r;
});
act("#aFbS", "showFeedback()", () => playValidator.showFeedback(null, "Your <b>changes</b> are saved.", "success", { title: "Done" }));
act("#aFbW", "showFeedback()", () => playValidator.showFeedback(null, "Saved, but 2 photos were too large.", "warning", { title: "Partly saved", buttonLabel: "Got it" }));
act("#aFbE", "showFeedback()", () => playValidator.showFeedback(null, "The server is not answering.", "error"));
act("#aServer", "logServerError()", () => {
    //server messages are written as TEXT: the tags below show up literally
    playValidator.logServerError([{ name: "displayName", message: "<b>Taken</b> on the server", location: S.loc }]);
    log("logServerError([{ name: \"displayName\", message: \"<b>Taken</b> on the server\" }])");
});
act("#aHide", "hideProgress()", () => { playValidator.hideProgress(); log("hideProgress()"); });
act("#aCsrf", "updateCSRFToken()", () => {
    const token = "tok-" + Math.random().toString(36).slice(2, 10);
    playValidator.updateCSRFToken(token);
    $("#sTokenV").textContent = $("#sToken").value;   //read back from the element itself
    log("updateCSRFToken(\"" + token + "\")");
});
act("#aDestroy", "destroy()", () => {
    playValidator.destroy();
    specimen.classList.remove("sending");
    log("destroy(): listeners, overlay, boxes and classes removed. Every other call now throws; press Rebuild");
});
act("#aRebuild", "Rebuild", () => build("Rebuild"));
$("#logClear").addEventListener("click", () => { logEl.textContent = ""; });

/* controls */
$("#pLoc").addEventListener("change", e => { S.loc = e.target.value; renderCode(); });
$("#pType").addEventListener("change", e => {
    S.type = e.target.value;
    $("#pText").value = { error: "Check the spelling", warning: "Looks unusual", success: "Looks good" }[S.type];
    renderCode();
});
$("#pSmall").addEventListener("input", e => {
    S.small = Number(e.target.value);
    $("#pSmallV").textContent = S.small + "px";
    sName.setAttribute("data-small-view", String(S.small));   //read on the next write
    renderCode();
});
//customStyles and the *ConStyle settings are applied when a box is CREATED. A write to a box
//that is already showing (same type, same side) only swaps its text, so the box is cleared
//here and the next write builds a fresh one with the new styles
function restyle(what) {
    attempt(what, () => { playValidator.message.clear(sName); log(what + " changed: box cleared, the next write builds a new one"); });
}
$("#pCustom").addEventListener("change", e => { S.custom = e.target.checked; restyle("customStyles"); renderCode(); });

//colours are not config at all: they are custom properties on the form
$$$(".colors input[type=color]").forEach(input => {
    input.addEventListener("input", () => specimen.style.setProperty(input.dataset.var, input.value));
});

const rebuildOn = { pLoader: "loader", pOverlay: "overlay", pController: "controller", pThemed: "themed" };
const liveOn = { pMethod: "method", pSuccess: "success", pBoxStyle: "boxStyle" };
Object.keys(rebuildOn).forEach(id => $("#" + id).addEventListener("change", e => {
    S[rebuildOn[id]] = e.target.type == "checkbox" ? e.target.checked : e.target.value;
    attempt("rebuild", () => build(rebuildOn[id] + " is read by initialize() or cannot be unset"));
}));
Object.keys(liveOn).forEach(id => $("#" + id).addEventListener("change", e => {
    S[liveOn[id]] = e.target.type == "checkbox" ? e.target.checked : e.target.value;
    attempt("config", () => { applyLive(playValidator); log("config." + liveOn[id] + " set on the running validator"); });
    if (id == "pBoxStyle") restyle("box style");
    renderCode();
}));

function renderCode() {
    const s = t => '<span class="s">' + esc(t) + "</span>";
    const p = '<span class="p">v</span>';
    const L = [];
    L.push('<span class="k">const</span> ' + p + ' = <span class="k">new</span> FormValidator(form);');
    if (S.overlay == "dark") L.push(p + ".config.overlayStyle = " + s('"background:rgba(8,11,17,.5); backdrop-filter:blur(1px)"') + ";");
    if (S.loader == "style") L.push(p + ".config.progressIndicatorStyle = " + s('"content:\'\'; border:3px solid ...; border-radius:50%"') + ";");
    if (S.loader == "button") {
        L.push(p + ".config.loaderLocation = " + s('"button"') + ";");
        L.push(p + ".config.submitButtonClass = " + s('"sendBtn"') + ";");
    }
    if (S.loader == "custom") {
        L.push(p + ".config.progressAnimationType = " + s('"custom"') + ";");
        L.push(p + ".config.progressAnimationCallbacks = { onSend: v =&gt; ..., onReceive: v =&gt; ... };");
    }
    if (S.themed) L.push(p + ".config.feedbackModalStyles = { success: {...}, warning: {...}, error: {...} };");
    if (S.controller) L.push(p + ".config.feedBackController = (v, text, xhr) =&gt; { <span class=\"c\">/* ... */</span> <span class=\"k\">return false</span>; };");
    L.push(p + ".config.submissionMethod = " + s('"' + S.method + '"') + ";");
    L.push(p + ".config.successButtonAction = " + s('"' + S.success + '"') + ";");
    if (S.success == "redirect") L.push(p + ".config.redirectTo = " + s('"#playground"') + ";");
    L.push(p + ".config.modal = modal;   <span class=\"c\">// anything with close()</span>");
    L.push(p + ".config.smallViewAttribute = " + s('"data-small-view"') + ";   <span class=\"c\">// field: data-small-view=\"" + S.small + "\"</span>");
    if (S.boxStyle) L.push(p + ".config.bottomConStyle = " + s('"' + PILL + '"') + ";   <span class=\"c\">// and left/right</span>");
    L.push(p + ".config.CSRFTokenElement = form.querySelector(" + s('"[name=_token]"') + ");");
    L.push(p + ".initialize();");
    L.push("");
    const cs = S.custom ? ", [64, " + s('"font-weight:700"') + "]" : "";
    L.push(p + ".validate(field, rules, " + s('"' + S.loc + '"') + cs + ");");
    L.push(p + ".message.write(field, " + s('"' + S.type + '"') + ", " + s('"' + S.loc + '"') + ", text" + cs + ");");
    L.push(p + ".submit(data, url);");
    $("#code").innerHTML = L.join("\n");
}

build();

/* ------------------------------------------------------------------ *
 * 3. Theming: the same calls on two forms, one with its own custom properties
 * ------------------------------------------------------------------ */

const themeValidators = ["#themePlain", "#themeViolet"].map(sel => {
    const v = new FormValidator($(sel));
    v.initialize();
    return v;
});
const THEME_FIELDS = [["#tp1", "#tp2", "#tp3"], ["#tv1", "#tv2", "#tv3"]];

$("#themeShow").addEventListener("click", () => {
    themeValidators.forEach((v, i) => {
        const [a, b, c] = THEME_FIELDS[i].map(sel => $(sel));
        v.message.write(a, "error", "bottom", "Not an email address");
        v.message.write(b, "warning", "bottom", "A very common password");
        v.message.write(c, "success", "bottom", "Available");
    });
});
$("#themeClear").addEventListener("click", () => {
    themeValidators.forEach((v, i) => THEME_FIELDS[i].forEach(sel => v.message.clear($(sel))));
});

/* ------------------------------------------------------------------ *
 * 4. Formatters: static, no instance needed
 * ------------------------------------------------------------------ */

const F = FormValidator.format;

function showCurrency() {
    const n = Number($("#fmCur").value);   //currencyField needs a number, not the input's string
    try {
        const out = F.currencyField(n, $("#fmSep").value);
        $("#fmCurOut").textContent = JSON.stringify(out) + "   (" + typeof out + ")";
    } catch (error) { $("#fmCurOut").textContent = error.message; }
}
function showRound() {
    const out = F.roundToDec(Number($("#fmRound").value), Number($("#fmDec").value));
    $("#fmRoundOut").textContent = String(out) + "   (" + typeof out + ")";
}
["#fmCur", "#fmSep"].forEach(sel => $(sel).addEventListener("input", showCurrency));
["#fmRound", "#fmDec"].forEach(sel => $(sel).addEventListener("input", showRound));
showCurrency();
showRound();

//integerField adds its own input listener first; this one runs after it and sees the result
F.integerField($("#fmInt"));
$("#fmInt").addEventListener("input", e => { $("#fmIntOut").textContent = "value = " + JSON.stringify(e.target.value); });

//"-" repeated twice. The module's blur listener is added first, so this one reads the result
F.wordSeperator($("#fmWord"), "-", 2);
$("#fmWord").addEventListener("blur", e => { $("#fmWordOut").textContent = "value = " + JSON.stringify(e.target.value); });

/* ------------------------------------------------------------------ *
 * 5. Failure modes: every call below throws
 * ------------------------------------------------------------------ */

//A throwaway form, never attached to the page, so the bad calls cannot touch the demos above
function scratch(init = true) {
    const form = document.createElement("form");
    form.innerHTML = '<div><input type="text" name="nick" value="ab"></div><div><input type="file" name="doc"></div><input type="number" name="qty">';
    const v = new FormValidator(form);
    if (init) v.initialize();
    return { form, v, nick: form.nick, doc: form.doc, qty: form.qty };
}

const BAD = [
    ['new FormValidator("#signup")', () => new FormValidator("#signup")],
    ["new FormValidator(divWithNoForm)", () => new FormValidator(document.createElement("div"))],
    ["validate() before initialize()", () => { const t = scratch(false); t.v.validate(t.nick, { required: "x" }, "bottom"); }],
    ['rule "minLen:3"', () => { const t = scratch(); t.v.validate(t.nick, { "minLen:3": "x" }, "bottom"); }],
    ["callBack: fn (not an array)", () => { const t = scratch(); t.v.validate(t.nick, { callBack: () => true }, "bottom"); }],
    ['fullName: "one message"', () => { const t = scratch(); t.v.validate(t.nick, { fullName: "x" }, "bottom"); }],
    ['message.write(f, "danger", ...)', () => { const t = scratch(); t.v.message.write(t.nick, "danger", "bottom", "x"); }],
    ['message.write(f, "error", "top", ...)', () => { const t = scratch(); t.v.message.write(t.nick, "error", "top", "x"); }],
    ['config.submissionMethod = "PATCH"', () => { scratch(false).v.config.submissionMethod = "PATCH"; }],
    ['config.progressAnimationType = "spin"', () => { scratch(false).v.config.progressAnimationType = "spin"; }],
    ["progressAnimationCallbacks = { onSend }", () => { scratch(false).v.config.progressAnimationCallbacks = { onSend() {} }; }],
    ['"custom" with no callbacks, initialize()', () => { const t = scratch(false); t.v.config.progressAnimationType = "custom"; t.v.initialize(); }],
    ['loaderLocation "button", no class, initialize()', () => { const t = scratch(false); t.v.config.loaderLocation = "button"; t.v.initialize(); }],
    ["config.modal = {}", () => { scratch(false).v.config.modal = {}; }],
    ["feedbackModalStyles = { info: {} }", () => { scratch(false).v.config.feedbackModalStyles = { info: {} }; }],
    ["submit(null, 42)", () => { scratch().v.submit(null, 42); }],
    ['submit(null, url, { "X-Id": 7 })', () => { scratch().v.submit(null, "./", { "X-Id": 7 }); }],
    ['showFeedback(null, "Hi", "info")', () => { scratch().v.showFeedback(null, "Hi", "info"); }],
    ['showFeedback(..., { heading: "x" })', () => { scratch().v.showFeedback(null, "Hi", "success", { heading: "x" }); }],
    ["updateCSRFToken() with no element", () => { scratch().v.updateCSRFToken("t"); }],
    ["initialize() after destroy()", () => { const t = scratch(); t.v.destroy(); t.v.initialize(); }],
    ['format.currencyField("12", ",")', () => F.currencyField("12", ",")],
    ["format.integerField(numberInput)", () => F.integerField(scratch(false).qty)],
    ['validate(f, rules, "top"): pass, then fail', () => {
        const t = scratch();
        //the location is only checked when a message is written: a passing field never writes
        const first = t.v.validate(t.nick, { "minLength:2": "x" }, "top");
        lazyNote = "1st call (field passes) returned " + first + " without complaint.\n2nd call (field fails) ";
        t.v.validate(t.nick, { "minLength:5": "x" }, "top");
    }],
    ['"maxSize:2 megs": no file, then a file', () => {
        const t = scratch();
        //an empty optional field skips its rules, so the bad size is not even parsed yet
        const first = t.v.validate(t.doc, { "maxSize:2 megs": "x" }, "bottom");
        const dt = new DataTransfer();
        dt.items.add(new File(["hello"], "note.txt", { type: "text/plain" }));
        t.doc.files = dt.files;
        lazyNote = "No file: returned " + first + ".\nWith a file chosen: ";
        t.v.validate(t.doc, { "maxSize:2 megs": "x" }, "bottom");
    }]
];
let lazyNote = "";

BAD.forEach(([label, fn]) => {
    const b = document.createElement("button");
    b.className = "tiny" + (label.indexOf("then") != -1 ? " lazy" : "");
    b.textContent = label;
    b.addEventListener("click", () => {
        lazyNote = "";
        try {
            fn();
            $("#errOut").textContent = lazyNote + "No error thrown. That should not happen.";
        } catch (error) {
            $("#errOut").textContent = lazyNote + error.constructor.name + ": " + error.message;
        }
    });
    $("#bad").appendChild(b);
});

/* expose the validators for console poking */
window.signupValidator = signupValidator;
window.themeValidators = themeValidators;
