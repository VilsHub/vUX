/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2026-10-06
 *
 *
 */
// Import vUX core
import {
    validateElement, validateNumber, validateString, validateBoolean, validateFunction,
    validateObjectLiteral, matchString
} from "./src/helpers.js";
import "./src/vUX-core-4.0.0-beta.js";

/***************************FontSplash*****************************/
export function FontSplash(container) {
    /**
     * A splash screen whose loader IS a word: config.text set in config.font, filled
     * with a gradient that flows through the letters while they fade in a wave.
     *
     * With no argument the splash covers the viewport (fixed, over everything); given
     * an element, it covers only that element, for a panel or a card that is loading.
     *
     * The font is the point of the thing, so the word is never shown in a fallback
     * face if it can be helped: show() starts loading config.font at once, the
     * backdrop goes up straight away, and the word fades in only when the font is
     * ready - or when config.fontTimeout runs out, in which case the fallback is used
     * and the real face swaps in whenever it does arrive.
     *
     * Timing follows Skeleton: show() waits config.delay before anything appears, and
     * once the word has appeared hide() holds it for config.minDuration, so a fast
     * load does not flash a splash and a slow one does not flicker it. hide() returns
     * a promise that resolves once the exit transition is over.
     *
     * Each letter carries its own copy of the gradient, sized to the whole word and
     * offset by the letter's measured position, so the letters read as one continuous
     * fill while each is free to fade on its own.
     */
    if (container !== undefined && container !== null){
        validateElement(container, "FontSplash(x) constructor argument 1 must be an element to cover, or omitted to cover the whole viewport");
    }else{
        container = null;
    }

    var self = this;
    var initialized = false, destroyed = false;
    var state = "idle";             //idle | pending | visible | hiding
    var showTimer = null, hideTimer = null, revealTimer = null;
    var revealedAt = 0;
    var hideWaiters = [];
    var reshow = false;             //show() arrived while hiding: show again once the hide is done
    var activeWork = 0;             //overlapping during() calls; the splash stays up until the last one settles
    var showToken = 0;              //bumped by every hide, so a stale async step of an older show() stands down

    var text = "Loading";
    var font = null;                //{ family, src, weight, style, fallback } or null for the page's own font
    var size = "clamp(2.75rem, 13vw, 8.5rem)";
    var colors = ["#ff5f6d", "#ffc371", "#47cacc", "#7b6cff"];
    var background = "#ffffff";
    var trackColor = "rgba(127,127,127,.16)";
    var caption = "";
    var animation = "fade";
    var speed = 2400;
    var fadeSpeed = 1500;
    var stagger = 110;
    var minOpacity = 0.12;
    var delay = 0;
    var minDuration = 800;
    var fontTimeout = 3000;
    var exit = "fade";
    var exitDuration = 500;
    var zIndex = null;              //null: the stylesheet's default, top of the page full-screen and 1 in a container
    var label = "Loading";
    var progress = null;            //null while indeterminate, else 0..1
    var onShow = null, onHide = null;

    //The font as last loaded: the FontFace this instance added to document.fonts (so
    //it can be taken out again), the promise that settles when it is usable, and
    //where that stands, for the fontStatus getter.
    var fontJob = { key: null, face: null, promise: Promise.resolve(), status: "none" };

    //What is on the page, so teardown removes exactly that.
    var built = null;

    this.initialize = function(){
        if (initialized) return;
        if (destroyed) throw new Error("This FontSplash has been destroyed, create a new instance instead of re-initializing");
        initialized = true;
        loadFont();                 //a font set before initialize() starts loading now, ahead of show()
    }

    this.show = function(){
        assertUsable("show");
        if (state == "pending" || state == "visible") return;
        if (state == "hiding"){
            //Let the exit in flight finish - something may be awaiting it - and start
            //a fresh show afterwards, delay included.
            reshow = true;
            return;
        }

        state = "pending";
        loadFont();                 //started now, so the font loads during the delay
        if (delay <= 0){
            appear();
        }else{
            showTimer = setTimeout(appear, delay);
        }
    }

    this.hide = function(){
        reshow = false;
        if (destroyed || state == "idle") return Promise.resolve();

        var done = new Promise(function(resolve){ hideWaiters.push(resolve); });
        if (state == "pending"){
            //The work finished inside the delay, or before the stylesheet was in: nothing
            //was ever shown, and nothing will be.
            clearTimeout(showTimer);
            showTimer = null;
            showToken++;
            state = "idle";
            uncloak();
            releaseWaiters();
            return done;
        }
        if (state == "visible"){
            state = "hiding";
            //minDuration runs from the moment the WORD appeared. If it never did - the
            //work beat the font - there is nothing on screen worth holding.
            var wait = revealedAt == 0 ? 0 : Math.max(0, minDuration - (now() - revealedAt));
            if (wait == 0){
                leave();
            }else{
                hideTimer = setTimeout(leave, wait);
            }
        }
        return done;
    }

    this.during = function(work){
        assertUsable("during");
        if (typeof work == "function") work = work();
        if (work == null || typeof work.then != "function"){
            throw new TypeError("fontSplashObj.during(x) argument 1 must be a promise, or a function returning one");
        }

        self.show();
        activeWork++;

        //The value or the rejection of 'work' is passed through untouched, but only
        //once the splash is gone, so the caller can reveal the page as soon as they have it.
        return Promise.resolve(work).then(
            function(value){ return settle().then(function(){ return value; }); },
            function(error){ return settle().then(function(){ throw error; }); }
        );

        function settle(){
            activeWork--;
            return activeWork > 0 ? Promise.resolve() : self.hide();
        }
    }

    this.setProgress = function(value){
        if (destroyed) throw new Error("fontSplashObj.setProgress() called on a destroyed FontSplash");
        if (value !== null){
            validateNumber(value, "fontSplashObj.setProgress(x) argument 1 must be a number from 0 to 1, or null for an indeterminate splash");
            if (!(value >= 0 && value <= 1)) throw new RangeError("fontSplashObj.setProgress(x) argument 1 must be from 0 to 1 (got " + value + "); pass null for an indeterminate splash");
        }
        progress = value;
        applyProgress();
    }

    this.destroy = function(){
        if (destroyed) return;
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(revealTimer);
        showTimer = hideTimer = revealTimer = null;
        showToken++;
        teardown();
        uncloak();
        state = "idle";
        reshow = false;
        releaseWaiters();
        dropFont();
        initialized = false;
        destroyed = true;
    }

    this.config = {}

    /*--------------------------- timing ---------------------------*/

    function appear(){
        showTimer = null;
        var token = showToken;
        //The overlay is not put on the page before its stylesheet has loaded: unstyled,
        //it is a word in 8rem type dropped into the middle of the consumer's layout.
        styleReady.then(function(){
            if (token != showToken || state != "pending") return;
            build();
            state = "visible";
            uncloak();
            waitForFont(token);
        });
    }

    function waitForFont(token){
        var settled = false;
        function reveal(){
            if (settled || token != showToken || built == null) return;
            settled = true;
            clearTimeout(revealTimer);
            revealTimer = null;
            if (state != "visible") return;
            measure();
            built.overlay.classList.add("vux-fs-ready");
            revealedAt = now();
            if (onShow != null) onShow(self);
        }
        fontJob.promise.then(reveal, reveal);
        if (fontTimeout > 0){
            revealTimer = setTimeout(function(){
                if (!settled && fontJob.status == "loading") fontJob.status = "timeout";
                reveal();
            }, fontTimeout);
        }else{
            reveal();
        }
    }

    function leave(){
        hideTimer = null;
        clearTimeout(revealTimer);
        revealTimer = null;
        showToken++;
        if (built == null){
            finishHide();
            return;
        }
        built.overlay.classList.add("vux-fs-out");
        built.overlay.setAttribute("aria-busy", "false");
        if (exit == "none" || exitDuration == 0){
            finishHide();
        }else{
            //A timer, not transitionend: an exit that is interrupted, or never runs
            //because the tab is hidden, must still resolve the promise.
            hideTimer = setTimeout(finishHide, exitDuration);
        }
    }

    function finishHide(){
        hideTimer = null;
        var wasRevealed = revealedAt != 0;
        teardown();
        uncloak();
        state = "idle";
        if (wasRevealed && onHide != null) onHide(self);
        releaseWaiters();

        if (reshow){
            reshow = false;
            self.show();
        }
    }

    function releaseWaiters(){
        var waiters = hideWaiters;
        hideWaiters = [];
        for (var x = 0; x < waiters.length; x++) waiters[x]();
    }

    /*--------------------------- the font ---------------------------*/

    function loadFont(){
        //The text is part of the key only for a declared family: fonts.load() fetches the
        //unicode-range subsets that text needs. A face of our own is one file whatever the text.
        var key = font == null ? null : font.serial + (font.src == null ? "|" + text : "");
        if (key === fontJob.key && fontJob.status != "failed") return;
        dropFont();
        fontJob = { key: key, face: null, promise: Promise.resolve(), status: "none" };
        if (font == null) return;

        var job = fontJob;
        job.status = "loading";
        var loading;
        if (font.src != null){
            //A source of our own: register the face under the family name, so the
            //font-family the overlay asks for resolves to it.
            try{
                job.face = new FontFace(font.family, font.src, { weight: String(font.weight), style: font.style });
            }catch(error){
                job.status = "failed";
                console.warn("FontSplash: config.font.src could not be used for '" + font.family + "' (" + error.message + "); the fallback font is shown instead");
                return;
            }
            document.fonts.add(job.face);
            loading = job.face.load();
        }else{
            //A family the page already declares with @font-face, or a system font.
            //fonts.load() fetches a declared face now rather than at first paint, which
            //is what lets the word wait for it.
            loading = document.fonts.load(font.style + " " + font.weight + " 1em " + quoteFamily(font.family), text);
        }
        job.promise = loading.then(function(faces){
            if (job.status == "loading" || job.status == "timeout"){
                //A family-only font that matched no @font-face is a system font, or a
                //typo; the browser cannot tell those apart, and neither can we.
                job.status = Array.isArray(faces) && faces.length == 0 ? "system" : "loaded";
            }
            //Arriving after the timeout swaps the face in, and the letters move: measure again.
            if (built != null) measure();
        }, function(error){
            job.status = "failed";
            console.warn("FontSplash: the font '" + font.family + "' failed to load (" + (error && error.message ? error.message : error) + "); the fallback font is shown instead");
        });
    }

    function dropFont(){
        if (fontJob.face != null){
            try{ document.fonts.delete(fontJob.face); }catch(e){}
        }
        fontJob = { key: null, face: null, promise: Promise.resolve(), status: "none" };
    }

    /*--------------------------- the DOM ---------------------------*/

    function build(){
        teardown();
        var host = container || document.body;
        var restorePosition = false;
        if (container != null && getComputedStyle(container).position == "static"){
            //The overlay is absolutely positioned over the container, which therefore
            //has to be its containing block. Put back on teardown.
            container.style.position = "relative";
            restorePosition = true;
        }

        var overlay = document.createElement("div");
        overlay.className = "vux-fs" + (container != null ? " vux-fs-local" : "");
        overlay.setAttribute("role", "status");
        overlay.setAttribute("aria-live", "polite");
        overlay.setAttribute("aria-busy", "true");

        var stage = document.createElement("div");
        stage.className = "vux-fs-stage";

        //The word is drawn twice, in the same box: the track underneath in a flat
        //colour, and the fill on top with the gradient. The fill's letters fade to
        //show the track; in progress mode the fill is clipped to the progress.
        var word = document.createElement("div");
        word.className = "vux-fs-word";
        word.setAttribute("aria-hidden", "true");
        var track = letters("vux-fs-track");
        var fill = letters("vux-fs-fill");
        word.appendChild(track);
        word.appendChild(fill);

        var cap = document.createElement("div");
        cap.className = "vux-fs-caption";

        stage.appendChild(word);
        stage.appendChild(cap);
        overlay.appendChild(stage);

        built = {
            host: host, overlay: overlay, word: word, fill: fill, track: track, caption: cap,
            restorePosition: restorePosition, observer: null
        };
        applyAll();
        host.appendChild(overlay);

        //Re-measure whenever the word's box changes: a resize, a font swapping in late,
        //the text wrapping onto a second line.
        if (window.ResizeObserver){
            built.observer = new ResizeObserver(function(){ measure(); });
            built.observer.observe(fill);
        }
        measure();
    }

    function letters(className){
        var holder = document.createElement("div");
        holder.className = className;
        var words = text.split(/(\s+)/);
        var index = 0;
        for (var x = 0; x < words.length; x++){
            if (words[x] == "") continue;
            if (/^\s+$/.test(words[x])){
                holder.appendChild(document.createTextNode(" "));
                continue;
            }
            //Letters of one word never part across a line; the text wraps between words.
            var group = document.createElement("span");
            group.className = "vux-fs-w";
            var chars = graphemes(words[x]);
            for (var y = 0; y < chars.length; y++){
                var ch = document.createElement("span");
                ch.className = "vux-fs-ch";
                ch.textContent = chars[y];
                ch.style.setProperty("--vux-fs-i", index++);
                group.appendChild(ch);
            }
            holder.appendChild(group);
        }
        return holder;
    }

    function measure(){
        if (built == null) return;
        var width = built.fill.offsetWidth;
        if (width == 0) return;     //not laid out (display:none host); the observer calls again
        built.fill.style.setProperty("--vux-fs-span", width + "px");
        var chars = built.fill.querySelectorAll(".vux-fs-ch");
        for (var x = 0; x < chars.length; x++){
            //offsetLeft is relative to the fill, which is the letters' offsetParent.
            chars[x].style.setProperty("--vux-fs-x", chars[x].offsetLeft + "px");
        }
    }

    function teardown(){
        if (built == null) return;
        if (built.observer != null) built.observer.disconnect();
        if (built.overlay.parentNode != null) built.overlay.parentNode.removeChild(built.overlay);
        if (built.restorePosition){
            container.style.position = "";
            if (container.getAttribute("style") == "") container.removeAttribute("style");
        }
        built = null;
        revealedAt = 0;
    }

    //Every look-only setting is a custom property on the overlay, so changing one on
    //a splash already up is a style write, not a rebuild.
    function applyAll(){
        if (built == null) return;
        var o = built.overlay;
        o.style.setProperty("--vux-fs-bg", background);
        if (zIndex === null){
            o.style.removeProperty("--vux-fs-z");
        }else{
            o.style.setProperty("--vux-fs-z", zIndex);
        }
        o.style.setProperty("--vux-fs-size", size);
        o.style.setProperty("--vux-fs-family", font == null ? "inherit" : quoteFamily(font.family) + ", " + font.fallback);
        o.style.setProperty("--vux-fs-weight", font == null ? "700" : String(font.weight));
        o.style.setProperty("--vux-fs-style", font == null ? "normal" : font.style);
        o.style.setProperty("--vux-fs-gradient", gradient());
        o.style.setProperty("--vux-fs-track", trackColor == null ? "transparent" : trackColor);
        o.style.setProperty("--vux-fs-speed", speed + "ms");
        o.style.setProperty("--vux-fs-fade", fadeSpeed + "ms");
        o.style.setProperty("--vux-fs-stagger", stagger + "ms");
        o.style.setProperty("--vux-fs-min", minOpacity);
        o.style.setProperty("--vux-fs-exit", exitDuration + "ms");
        o.className = o.className.replace(/\s*vux-fs-(anim|exit)-\S+/g, "") + " vux-fs-anim-" + animation + " vux-fs-exit-" + exit;
        o.setAttribute("aria-label", label);
        built.caption.textContent = caption;
        built.caption.hidden = caption == "";
        applyProgress();
    }

    function applyProgress(){
        if (built == null) return;
        var o = built.overlay;
        o.classList.toggle("vux-fs-determinate", progress !== null);
        o.style.setProperty("--vux-fs-p", progress === null ? 1 : progress);
        if (progress === null){
            o.setAttribute("role", "status");
            o.removeAttribute("aria-valuemin");
            o.removeAttribute("aria-valuemax");
            o.removeAttribute("aria-valuenow");
        }else{
            o.setAttribute("role", "progressbar");
            o.setAttribute("aria-valuemin", "0");
            o.setAttribute("aria-valuemax", "100");
            o.setAttribute("aria-valuenow", Math.round(progress * 100));
        }
    }

    //Text or font changed while the splash is up: the letters themselves change.
    function rebuildWord(){
        if (built == null) return;
        var track = letters("vux-fs-track"), fill = letters("vux-fs-fill");
        if (built.observer != null) built.observer.unobserve(built.fill);
        built.word.replaceChild(track, built.track);
        built.word.replaceChild(fill, built.fill);
        built.track = track;
        built.fill = fill;
        if (built.observer != null) built.observer.observe(fill);
        measure();
    }

    //Two copies of the colour cycle side by side, each running c1..cn and back to c1,
    //over a background twice the word's width. Sliding it by one word-width lands on
    //an identical picture, which is what makes the loop seamless.
    function gradient(){
        var cycle = colors.concat([colors[0]]);
        var stops = [];
        for (var half = 0; half < 2; half++){
            for (var x = 0; x < cycle.length; x++){
                if (half == 1 && x == 0) continue;
                stops.push(cycle[x] + " " + round((half + x / (cycle.length - 1)) * 50) + "%");
            }
        }
        return "linear-gradient(90deg, " + stops.join(", ") + ")";
    }

    /*--------------------------- helpers ---------------------------*/

    function uncloak(){
        //Only a full-screen splash stands in for the page: the cloak hides the page
        //until the splash covers it, and goes once the splash is up or abandoned.
        if (container == null) document.documentElement.classList.remove("vux-fs-cloak");
    }

    function assertUsable(method){
        if (destroyed) throw new Error("fontSplashObj." + method + "() called on a destroyed FontSplash");
        if (!initialized) throw new Error("Please initialize using the 'initialize()' method, before calling fontSplashObj." + method + "()");
    }

    function cssColor(value, name){
        validateString(value, "fontSplashObj.config." + name + " must be a CSS colour string");
        if (window.CSS && CSS.supports && !CSS.supports("color", value)){
            throw new Error("fontSplashObj.config." + name + ": '" + value + "' is not a CSS colour");
        }
    }

    function whole(value, name, min, max, unit){
        validateNumber(value, "fontSplashObj.config." + name + " property value must be a number" + (unit ? " of " + unit : ""));
        if (!(value >= min && value <= max) || value % 1 != 0){
            throw new RangeError("fontSplashObj.config." + name + " property value must be a whole number from " + min + " to " + max + (unit ? " " + unit : "") + " (got " + value + ")");
        }
    }

    Object.defineProperties(this, {
        initialize: { writable: false },
        show: { writable: false },
        hide: { writable: false },
        during: { writable: false },
        setProgress: { writable: false },
        destroy: { writable: false },
        config: { writable: false },
        state: {
            get: function(){ return state; }
        },
        fontStatus: {
            get: function(){ return fontJob.status; }
        }
    })

    Object.defineProperties(this.config, {
        text: {
            set: function(value){
                validateString(value, "fontSplashObj.config.text property value must be a string (the word the splash is drawn with)");
                var trimmed = value.replace(/\s+/g, " ").trim();
                if (trimmed == "") throw new Error("fontSplashObj.config.text must contain at least one visible character");
                if (graphemes(trimmed).length > 80) throw new RangeError("fontSplashObj.config.text is limited to 80 characters; a splash is a word or two, not a paragraph");
                text = trimmed;
                if (initialized) loadFont();
                rebuildWord();
            }
        },
        font: {
            set: function(value){
                if (value === null){
                    font = null;
                }else if (typeof value == "string"){
                    font = normalizeFont({ family: value });
                }else{
                    if (typeof value != "object" || Array.isArray(value)){
                        throw new TypeError("fontSplashObj.config.font property value must be a family name, an object literal { family, src, weight, style, fallback }, or null");
                    }
                    validateObjectLiteral(value, "fontSplashObj.config.font property value must be a family name, an object literal { family, src, weight, style, fallback }, or null");
                    font = normalizeFont(value);
                }
                //Loaded at once, not at show(): setting the font early is a preload.
                if (initialized) loadFont();
                applyAll();
            }
        },
        size: {
            set: function(value){
                if (typeof value == "number") value = value + "px";
                validateString(value, "fontSplashObj.config.size property value must be a number (px) or a CSS font-size string");
                if (window.CSS && CSS.supports && !CSS.supports("font-size", value)){
                    throw new Error("fontSplashObj.config.size: '" + value + "' is not a font-size, as in 96, \"6rem\" or \"clamp(3rem, 12vw, 8rem)\"");
                }
                size = value;
                applyAll();
            }
        },
        colors: {
            set: function(value){
                if (!Array.isArray(value)) throw new TypeError("fontSplashObj.config.colors property value must be an array of CSS colours, as in [\"#ff5f6d\", \"#ffc371\"]");
                if (value.length < 2 || value.length > 8) throw new RangeError("fontSplashObj.config.colors must hold from 2 to 8 colours (got " + value.length + ")");
                for (var x = 0; x < value.length; x++) cssColor(value[x], "colors[" + x + "]");
                colors = value.slice();
                applyAll();
            }
        },
        background: {
            set: function(value){
                validateString(value, "fontSplashObj.config.background property value must be a CSS background string: a colour, or a gradient");
                if (window.CSS && CSS.supports && !CSS.supports("background", value)){
                    throw new Error("fontSplashObj.config.background: '" + value + "' is not a CSS background");
                }
                background = value;
                applyAll();
            }
        },
        trackColor: {
            set: function(value){
                if (value !== null) cssColor(value, "trackColor");
                trackColor = value;
                applyAll();
            }
        },
        caption: {
            set: function(value){
                validateString(value, "fontSplashObj.config.caption property value must be a string (\"\" for none)");
                caption = value;
                applyAll();
            }
        },
        animation: {
            set: function(value){
                matchString(value, ["fade", "flow", "breathe", "none"], "fontSplashObj.config.animation property value must be \"fade\", \"flow\", \"breathe\" or \"none\"");
                animation = value;
                applyAll();
            }
        },
        speed: {
            set: function(value){
                whole(value, "speed", 200, 20000, "milliseconds");
                speed = value;
                applyAll();
            }
        },
        fadeSpeed: {
            set: function(value){
                whole(value, "fadeSpeed", 200, 20000, "milliseconds");
                fadeSpeed = value;
                applyAll();
            }
        },
        stagger: {
            set: function(value){
                whole(value, "stagger", 0, 2000, "milliseconds");
                stagger = value;
                applyAll();
            }
        },
        minOpacity: {
            set: function(value){
                validateNumber(value, "fontSplashObj.config.minOpacity property value must be a number from 0 to 1");
                if (!(value >= 0 && value <= 1)) throw new RangeError("fontSplashObj.config.minOpacity property value must be from 0 to 1 (got " + value + ")");
                minOpacity = value;
                applyAll();
            }
        },
        delay: {
            set: function(value){
                whole(value, "delay", 0, 60000, "milliseconds");
                delay = value;
            }
        },
        minDuration: {
            set: function(value){
                whole(value, "minDuration", 0, 60000, "milliseconds");
                minDuration = value;
            }
        },
        fontTimeout: {
            set: function(value){
                whole(value, "fontTimeout", 0, 30000, "milliseconds");
                fontTimeout = value;
            }
        },
        exit: {
            set: function(value){
                matchString(value, ["fade", "lift", "zoom", "none"], "fontSplashObj.config.exit property value must be \"fade\", \"lift\", \"zoom\" or \"none\"");
                exit = value;
                applyAll();
            }
        },
        exitDuration: {
            set: function(value){
                whole(value, "exitDuration", 0, 5000, "milliseconds");
                exitDuration = value;
                applyAll();
            }
        },
        zIndex: {
            set: function(value){
                if (value !== null){
                    validateNumber(value, "fontSplashObj.config.zIndex property value must be a whole number, or null for the default");
                }
                if (value !== null && (value % 1 != 0 || !isFinite(value))) throw new RangeError("fontSplashObj.config.zIndex property value must be a whole number (got " + value + ")");
                zIndex = value;
                applyAll();
            }
        },
        label: {
            set: function(value){
                validateString(value, "fontSplashObj.config.label property value must be a string, announced to screen readers in place of the letters");
                if (value.trim() == "") throw new Error("fontSplashObj.config.label must not be empty: the word is hidden from screen readers, and the label is all they hear");
                label = value;
                applyAll();
            }
        },
        onShow: {
            set: function(value){
                validateFunction(value, "fontSplashObj.config.onShow property value must be a function");
                onShow = value;
            }
        },
        onHide: {
            set: function(value){
                validateFunction(value, "fontSplashObj.config.onHide property value must be a function");
                onHide = value;
            }
        }
    })
}

var FONT_KEYS = ["family", "src", "weight", "style", "fallback"];
var fontSerial = 0;             //every config.font assignment is a new font to load, even with the same family

function normalizeFont(value){
    for (var name in value){
        if (FONT_KEYS.indexOf(name) == -1) throw new Error("fontSplashObj.config.font: unknown key '" + name + "'; use " + FONT_KEYS.join(", "));
    }
    validateString(value.family, "fontSplashObj.config.font.family must be a string: the font-family name");
    var family = value.family.trim().replace(/^(["'])(.*)\1$/, "$2");
    if (family == "") throw new Error("fontSplashObj.config.font.family must not be empty");

    var src = null;
    if (value.src !== undefined && value.src !== null){
        if (typeof value.src == "string"){
            var raw = value.src.trim();
            if (raw == "") throw new Error("fontSplashObj.config.font.src must not be empty; leave it out to use a font the page already declares");
            //A plain path becomes url("..."); a CSS src list (url(...) format(...), local(...)) is passed through.
            src = /^(url|local)\(/i.test(raw) ? raw : "url(\"" + raw.replace(/"/g, "%22") + "\")";
        }else if (value.src instanceof ArrayBuffer || ArrayBuffer.isView(value.src)){
            src = value.src;        //the bytes of a font file, e.g. from a file input
        }else{
            throw new TypeError("fontSplashObj.config.font.src must be a URL, a CSS src list such as 'local(\"Georgia\")', or an ArrayBuffer of font data");
        }
    }

    var weight = value.weight === undefined ? 700 : value.weight;
    if (typeof weight == "number"){
        if (!(weight >= 1 && weight <= 1000)) throw new RangeError("fontSplashObj.config.font.weight must be from 1 to 1000 (got " + weight + ")");
    }else if (typeof weight != "string" || !/^(normal|bold|\d{1,4})$/.test(weight)){
        throw new TypeError("fontSplashObj.config.font.weight must be a number from 1 to 1000, \"normal\" or \"bold\"");
    }

    var style = value.style === undefined ? "normal" : value.style;
    matchString(style, ["normal", "italic", "oblique"], "fontSplashObj.config.font.style must be \"normal\", \"italic\" or \"oblique\"");

    var fallback = value.fallback === undefined ? "system-ui, sans-serif" : value.fallback;
    validateString(fallback, "fontSplashObj.config.font.fallback must be a CSS font-family list, as in \"Georgia, serif\"");

    return { family: family, src: src, weight: weight, style: style, fallback: fallback, serial: ++fontSerial };
}

function quoteFamily(family){
    return "\"" + family.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
}

//User-perceived characters, so an emoji or an accented letter built from two code
//points is one letter of the wave, not two halves of one.
function graphemes(value){
    if (window.Intl && Intl.Segmenter){
        var out = [];
        var seg = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(value);
        for (var part of seg) out.push(part.segment);
        return out;
    }
    return Array.from(value);
}

function round(n){
    return Math.round(n * 1000) / 1000;
}

function now(){
    return window.performance && performance.now ? performance.now() : Date.now();
}

//Linked when the module is imported, and appended at once, as Skeleton does: a splash
//belongs to the first moments of a page. styleReady settles when the sheet is in, and
//nothing is put on the page before then.
var styleReady = new Promise(function(resolve){
    processAssetPath().then(function(path){
        if (path instanceof Error) throw path;
        var link = document.querySelector("link[data-id='fontSplash']");
        if (link != null){
            if (link.sheet != null){
                resolve();
                return;
            }
        }else{
            link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.dataset.id = "fontSplash";
            link.setAttribute("href", path + "css/fontSplash.css");
            document.head.appendChild(link);
        }
        link.addEventListener("load", function(){ resolve(); });
        link.addEventListener("error", function(){
            console.error("FontSplash: " + link.href + " failed to load; the splash is shown unstyled");
            resolve();
        });
    }).catch(function(error){
        console.error(error);
        resolve();
    });
});
/**********************************************************************/
