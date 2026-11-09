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

/***************************Tool tip*****************************/
//Instances on the same class share one tip box and one set of listeners. This counts them, so
//only the last one destroyed tears the shared parts down, and holds the settings the shared
//listeners read.
var toolTipShared = {};

export function ToolTip() {
    var tipBoxStyles = {backgroundColor:"", arrowColor:"", fontColor:""},initialized = 0,toolTipClassName="",destroyed = false;
    var allowHTML = false;     //tip text is set as text unless config.html is true
    var htmlSet = false;       //config.html was set on this instance
    var listeners = [];        //[target, type, fn, options] for every listener added, so destroy() can remove them
    var current = null;        //the member whose tip is showing
    var currentByFocus = false;//it was opened by keyboard focus, so a scroll moves it instead of hiding it
    var GAP = 12;              //pixels between the pointer and the tip (the arrow sits in this gap)
    var EDGE = 4;              //the tip keeps this far from the window edges

    function tipBox() {
        return $$.ss("div[data-toolTipId='" + toolTipClassName + "']");
    }

    function createStyles() {
        //Rebuilt whenever tipBoxStyles changes, so a change after initialize() applies at once.
        //Only the keys that were set are written: an unset key used to come out as 'undefined'.
        var old = $$.ss("style[data-id='toolTipStyles-" + toolTipClassName + "']");
        if (old != null) old.remove();
        var sel = ".vToolTip[data-tooltipid='" + toolTipClassName + "']";
        var css = "";
        var arrow = tipBoxStyles.arrowColor != "" ? tipBoxStyles.arrowColor : tipBoxStyles.backgroundColor;
        if (tipBoxStyles.backgroundColor != "") css += sel + "{background-color:" + tipBoxStyles.backgroundColor + "}";
        if (tipBoxStyles.fontColor != "") css += sel + "{color:" + tipBoxStyles.fontColor + "}";
        if (arrow != "") {
            css += sel + ".vToolTipTop::before{border-top-color:" + arrow + "}";
            css += sel + ".vToolTipBottom::before{border-bottom-color:" + arrow + "}";
        }
        if (css != "") attachStyleSheet("toolTipStyles-" + toolTipClassName, css);
    }

    function createTipElement() {
        if (tipBox() != null) return false;
        var tipElement = $$.ce("DIV");
        tipElement.setAttribute("class", "vToolTip vToolTipTop");
        tipElement.setAttribute("data-tTipEvent", "off");
        tipElement.setAttribute("data-toolTipId", toolTipClassName);
        tipElement.setAttribute("role", "tooltip");
        tipElement.setAttribute("id", "vToolTip-" + toolTipClassName);
        //toolTip.css arrives asynchronously: the box is hidden and fixed inline, so a tip shown before
        //the sheet loads is still placed at the pointer instead of at the bottom of the page
        tipElement.style.cssText = "display:none;position:fixed;z-index:10000;pointer-events:none";
        document.body.appendChild(tipElement);
        return true;
    }

    //Turns an element's title into its tip: the title moves to data-tempTitle, so the browser's own
    //tooltip does not show over this one
    function adopt(element) {
        var title = element.getAttribute("title");
        if (title != null) {
            element.setAttribute("data-tempTitle", title);
            element.removeAttribute("title");
        }
        element.classList.add("vtip");
        element.setAttribute("data-TID", toolTipClassName);
        element.setAttribute("data-vToolTipSwitch", "ON");
    }

    function setCustomTitle(){
        $$.sa("."+toolTipClassName).forEach(function(element){
            //a member turned off with off() stays off until on(); refresh() does not re-enable it
            if (element.getAttribute("data-vToolTipSwitch") == "OFF") return;
            if (element.getAttribute("title") != null) adopt(element);
        });
    }

    //The member an event belongs to: the target itself or the nearest ancestor with the class,
    //so a member's own children (an icon inside a button) show the member's tip
    function memberOf(target) {
        if (!(target instanceof Element)) return null;
        var member = target.closest("." + toolTipClassName);
        if (member == null || member.getAttribute("data-vToolTipSwitch") != "ON") return null;
        return member;
    }

    function show(member, x, y) {
        var box = tipBox();
        if (box == null) return;
        var text = member.getAttribute("data-tempTitle");
        if (text == null || text.length < 1) { hide(); return; }
        var html = toolTipShared[toolTipClassName] ? toolTipShared[toolTipClassName].html : allowHTML;
        var mode = html ? "html" : "text";
        if (current != member || box.getAttribute("data-text") != text || box.getAttribute("data-mode") != mode) {
            if (html) box.innerHTML = text; else box.textContent = text;
            box.setAttribute("data-text", text);
            box.setAttribute("data-mode", mode);
        }
        if (current != null && current != member) releaseDescribedBy(current);
        current = member;
        describeBy(member, box.id);
        box.style["display"] = "block";
        place(box, x, y);
    }

    //Positions the fixed tip above the point (x, y) in viewport coordinates, flipped below it when
    //there is no room above, and kept inside the window on both sides
    function place(box, x, y) {
        var vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
        //the stylesheet's max-width (320px by default, or the consumer's) still applies; the window
        //width only lowers it on a narrow screen. An inline value alone used to override the sheet.
        box.style["maxWidth"] = "";
        var sheetMax = parseFloat(getComputedStyle(box).maxWidth);
        //no number: toolTip.css has not arrived yet, so its 320px default is used
        box.style["maxWidth"] = Math.min(isNaN(sheetMax) ? 320 : sheetMax, Math.max(120, vw - 2 * EDGE)) + "px";
        var w = box.offsetWidth, h = box.offsetHeight;
        var left = Math.min(Math.max(EDGE, x - 10), vw - w - EDGE);
        var top = y - h - GAP;
        var below = top < EDGE;
        if (below) top = Math.min(y + GAP + 8, vh - h - EDGE);
        box.classList.toggle("vToolTipTop", !below);
        box.classList.toggle("vToolTipBottom", below);
        //the arrow follows the point even when the box was pushed in from an edge
        box.style.setProperty("--vtt-arrow-left", Math.min(Math.max(6, x - left - 5), w - 16) + "px");
        box.style["left"] = left + "px";
        box.style["top"] = top + "px";
    }

    function showAtMember(member) {
        var r = member.getBoundingClientRect();
        show(member, r.left + Math.min(20, r.width / 2), r.top);
    }

    function hide() {
        var box = tipBox();
        if (box != null) box.style["display"] = "none";
        if (current != null) releaseDescribedBy(current);
        current = null;
    }

    //The tip id is added to the member's own aria-describedby list and taken out again on hide,
    //so a description the page set itself is kept
    function describeBy(member, id) {
        if (member.getAttribute("data-vttAria") == null) member.setAttribute("data-vttAria", member.getAttribute("aria-describedby") || "");
        var own = member.getAttribute("data-vttAria");
        member.setAttribute("aria-describedby", own != "" ? own + " " + id : id);
    }
    function releaseDescribedBy(member) {
        var own = member.getAttribute("data-vttAria");
        if (own == null) return;
        if (own != "") member.setAttribute("aria-describedby", own); else member.removeAttribute("aria-describedby");
        member.removeAttribute("data-vttAria");
    }

    //The member showing its tip and hide() live with the instance that owns the class's listeners;
    //another instance on the same class reaches them through the shared entry
    function sharedCurrent() {
        var sh = toolTipShared[toolTipClassName];
        return sh != undefined ? sh.current() : current;
    }
    function sharedHide() {
        var sh = toolTipShared[toolTipClassName];
        if (sh != undefined) sh.hide(); else hide();
    }

    function listen(target, type, fn, options) {
        target.addEventListener(type, fn, options);
        listeners.push([target, type, fn, options]);
    }

    function addEvent() {
        function onPointer(e) {
            var member = memberOf(e.target);
            if (member != null) { currentByFocus = false; show(member, e.clientX, e.clientY); }
        }
        listen(document, "mouseover", onPointer, false);
        listen(document, "mousemove", onPointer, false);
        listen(document, "mouseout", function(e) {
            var member = memberOf(e.target);
            if (member == null) return;
            //moving onto one of the member's own children is not leaving it
            if (e.relatedTarget instanceof Node && member.contains(e.relatedTarget)) return;
            if (member == current) hide();
        }, false);
        //keyboard: a focused member shows its tip at the member (above it, below near the top edge)
        listen(document, "focusin", function(e) {
            var member = memberOf(e.target);
            if (member == null) return;
            currentByFocus = true;
            showAtMember(member);
        }, false);
        listen(document, "focusout", function(e) {
            var member = memberOf(e.target);
            if (member != null && member == current) hide();
        }, false);
        //a touch shows the tip through the emulated mouseover but never sends a mouseout, so a
        //touch elsewhere, a scroll or Escape takes it down
        listen(document, "pointerdown", function(e) {
            if (current != null && !current.contains(e.target)) hide();
        }, true);
        //focusing an off-screen member scrolls it into view: that tip follows its member
        listen(window, "scroll", function() {
            if (current == null) return;
            if (currentByFocus) showAtMember(current); else hide();
        }, true);
        listen(document, "keydown", function(e) { if (e.key == "Escape" && current != null) hide(); }, false);
    }

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/toolTip.css", "toolTip");
            }else{
                throw new Error(path)
            }

        } catch (error) {
            console.error(error)
        }
    }
    this.initialize = function() {
        if (initialized == 0) {
            if (destroyed) throw new Error("This ToolTip has been destroyed, create a new instance instead of re-initializing");
            if (toolTipClassName == "") {
                throw new Error("Setup incomplete: the ToolTip class name must be supplied, specify it using the 'config.className' property");
            }
            //a second instance on the same class shares the first one's box and listeners
            if (createTipElement()) {
                addEvent();
                toolTipShared[toolTipClassName] = {count: 0, html: allowHTML, teardown: teardown, hide: hide, current: function(){ return current; }};
            } else if (toolTipShared[toolTipClassName] == undefined) {
                toolTipShared[toolTipClassName] = {count: 0, html: allowHTML, teardown: teardown, hide: hide, current: function(){ return current; }};   //box left by older code
            }
            toolTipShared[toolTipClassName].count++;
            if (htmlSet) toolTipShared[toolTipClassName].html = allowHTML;
            addVitalStyles();
            createStyles();
            setCustomTitle();
            initialized = 1;
        }
    };
    this.refresh = function(){
        //adopts members added since initialize() and picks up titles set on existing ones
        if (initialized == 0) return;
        setCustomTitle();
        var shown = sharedCurrent();
        if (shown != null && !shown.isConnected) sharedHide();
    }
    this.destroy = function(){
        //The last instance on a class removes the listeners, the tip box and the generated
        //stylesheet, and hands every member its original 'title' back, so the page is left as it was
        //before initialize(). An earlier one only drops out of the count.
        if (destroyed) return;
        var shared = toolTipShared[toolTipClassName];
        if (initialized == 1 && shared != undefined) {
            shared.count--;
            if (shared.count <= 0) {
                delete toolTipShared[toolTipClassName];
                shared.teardown();
            }
        } else if (initialized == 1) {
            teardown();
        }
        destroyed = true;
        initialized = 0;
    }
    function teardown(){
        hide();

        for (var x = 0; x < listeners.length; x++) listeners[x][0].removeEventListener(listeners[x][1], listeners[x][2], listeners[x][3]);
        listeners = [];

        var box = tipBox();
        if (box != null) box.remove();

        var styleEle = $$.ss("style[data-id='toolTipStyles-" + toolTipClassName + "']");
        if (styleEle != null) styleEle.remove();

        if (toolTipClassName != "") {
            $$.sa("." + toolTipClassName).forEach(function(element){
                var storedTip = element.getAttribute("data-tempTitle");
                if (storedTip != null) element.setAttribute("title", storedTip);
                element.removeAttribute("data-tempTitle");
                element.removeAttribute("data-vToolTipSwitch");
                element.removeAttribute("data-TID");
                releaseDescribedBy(element);
                element.classList.remove("vtip");
            });
        }
    }
    this.config = {};
    //Gives an element a tip from its title. The element is given the tip class if it lacks it.
    this.on = function(element) {
        validateElement(element, "Argument 1 of the obj.on() method must be a valid HTML element");
        if (initialized == 0) throw new Error("obj.on() needs an initialized ToolTip: call initialize() first");
        if (element.getAttribute("title") == null && element.getAttribute("data-tempTitle") == null) {
            throw new Error("The specified element title attribute cannot be null, Please specify the tip to use.");
        }
        element.classList.add(toolTipClassName);
        adopt(element);
    }
    //Turns an element's tip off and gives it its title back
    this.off = function(element) {
        validateElement(element, "Argument 1 of the obj.off() method must be a valid HTML element");
        if (element.getAttribute("data-vToolTipSwitch") == null) throw new Error("No tool tip applied on target element");
        if (element.getAttribute("data-vToolTipSwitch") == "ON") {
            if (element == sharedCurrent()) sharedHide();
            var storedTip = element.getAttribute("data-tempTitle");
            if (storedTip != null) element.setAttribute("title", storedTip);
            element.removeAttribute("data-tempTitle");
            element.setAttribute("data-vToolTipSwitch", "OFF");
        }
    }
    Object.defineProperties(this.config, {
        tipBoxStyles: {
            //{backgroundColor, arrowColor, fontColor}, each a CSS colour, all optional. The arrow
            //takes the background colour unless arrowColor is given.
            set: function(value) {
                var validKeys = Object.keys(tipBoxStyles);
                validateObjectLiteral(value, "config.tipBoxStyles property expects an object of: " + validKeys.join(", "));
                var sourceKeys = Object.keys(value);
                if (sourceKeys.length > validKeys.length) throw new Error("config.tipBoxStyles cannot have more than " + validKeys.length + " properties: " + validKeys.join(", "));
                for (var x = 0; x < sourceKeys.length; x++) {
                    if (validKeys.indexOf(sourceKeys[x]) == -1) {
                        throw new Error("config.tipBoxStyles property can only accept these keys: " + validKeys.join(", ") + ". The key: '" + sourceKeys[x] + "' is not one of them");
                    }
                    validateString(value[sourceKeys[x]], "config.tipBoxStyles object key: " + sourceKeys[x] + " expects a string as value");
                }
                tipBoxStyles = {backgroundColor:"", arrowColor:"", fontColor:""};
                sourceKeys.forEach(function(key){ tipBoxStyles[key] = value[key]; });
                if (initialized == 1) createStyles();
            }
        },
        className:{
            set: function(value) {
                validateString(value, "ToolTip config.className property expects a string as value");
                if (!/^-?[_a-zA-Z][_a-zA-Z0-9-]*$/.test(value)) throw new Error("ToolTip config.className must be a single CSS class name (letters, digits, '-' and '_', not starting with a digit), got: '" + value + "'");
                if (initialized == 1) throw new Error("ToolTip config.className cannot change after initialize()");
                toolTipClassName = value;
            }
        },
        html:{
            //true sets each tip as HTML; by default it is plain text, as the native title is
            set: function(value) {
                validateBoolean(value, "ToolTip config.html property expects a boolean");
                allowHTML = value;
                htmlSet = true;
                //instances on one class share their listeners, so the latest setting applies to all
                if (initialized == 1 && toolTipShared[toolTipClassName]) toolTipShared[toolTipClassName].html = value;
            }
        }
    })
    Object.defineProperties(this, {
        initialize: {writable: false},
        config: {writable: false},
        on: {writable: false},
        off: {writable: false},
        refresh: {writable: false},
        destroy: {writable: false}
    })
}
/****************************************************************/
