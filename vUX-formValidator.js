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

/************************Form validator**************************/
var formValidatorCount = 0;   //gives every instance its own id, used to scope its styles and field ids

export function FormValidator(form = null) {
    var parseForm = null;
    if (form != null) {
        validateElement(form, "'config.form' property must be an element");
        var positionType = $$.sm(form).cssStyle("position");
        if(positionType == "static") form.style["position"] = "relative";
        parseForm = form.nodeName == "FORM"?form:form.querySelector("FORM");
        if(parseForm == null) throw new Error("The specified form in FormValidator(x) constructor has no FORM interface. Please wrap the form container with FORM element");
    }
    var uid = "vfv" + (++formValidatorCount);
    var bottomConStyle = "",initialized = false,leftConStyle = "",rightConStyle = "",self = this,submissionMethod="POST";
    var errorLog = {},n = 0,progressAnimationType = "default",progressAnimationCallbacks =null, progressIndicatorStyle = null,smallViewAttribute = "",wrapperClassAttribute = null, CSRFTokenElement=null;
    var modal = null, controller = null, submitButtonClass ="", loaderLocation="form", overlayStyle="", successButtonAction="close", redirectTo="/", feedbackModalStyles={};
    var destroyed = false;
    var inFlight = false;        //a submit() is waiting for its response
    var pendingXhr = null;       //that request, so destroy() can abort it
    var progressShowing = false; //showProgress() ran and neither the response nor hideProgress() has ended it
    var markedFields = [];       //fields this instance gave the 'vItem' class, so destroy() takes back only its own
    var supportedRules = {
        required: 1, minLength: 1, maxLength: 1, alpha: 1, integer: 1, alphaNum: 1, float: 1, ext: 1,
        minSize: 1, maxSize: 1, callBack: 1, email: 1, notIn: 1, trim: 1, noSpace: 1, fullName: 1, match: 1
    }
    var supportedMethod = {"POST":1, "GET":1, "PUT":1, "DELETE":1};
    //Input types whose value is typed text, so the length, email and notIn rules apply to them.
    //The 'type' property is read, not the attribute, so an input with no type counts as text.
    var nonTextTypes = {checkbox:1, radio:1, file:1, submit:1, button:1, reset:1, image:1, range:1, color:1};
    var BOX_TRANSITION_MS = 260; //.vMsgBox transitions run .2s; this is the fallback when none fires

    /*************************Message boxes*************************/
    //The boxes this wrapper owns: its direct children only, so a wrapper nested inside another
    //wrapper never has its box found, updated or cleared through the outer one.
    function ownBoxes(inputWrapper) {
        var boxes = [];
        for (var x = 0; x < inputWrapper.children.length; x++) {
            if (inputWrapper.children[x].classList.contains("vMsgBox")) boxes.push(inputWrapper.children[x]);
        }
        return boxes;
    }

    //Runs fn once, on the element's own transitionend or after the fallback delay, whichever comes
    //first. Without the fallback, a box whose transition never runs (reduced motion, a hidden form,
    //a consumer stylesheet without transitions) stayed transparent or was never removed.
    function afterTransition(element, fn) {
        var done = false;
        function finish(e) {
            if (e && e.target != element) return;
            if (done) return;
            done = true;
            element.removeEventListener("transitionend", finish);
            clearTimeout(timer);
            fn();
        }
        element.addEventListener("transitionend", finish);
        var timer = setTimeout(finish, BOX_TRANSITION_MS);
    }

    //Errors are recorded per field, not per wrapper: two fields can share a wrapper (both inputs
    //in one div, or both straight in the form), and one passing must never wipe the other's error.
    //A radio or checkbox group shares one key, so a click on any member reaches the group's record.
    var fieldKeys = new WeakMap();
    var keyWrappers = {};   //key -> the wrapper its message was written in (a group's first member's)
    function fieldKey(input) {
        var key = null;
        input.list.forEach(function(el){ if (key == null && fieldKeys.has(el)) key = fieldKeys.get(el); });
        if (key == null) key = uid + "-i" + (++n);
        input.list.forEach(function(el){ fieldKeys.set(el, key); });
        return key;
    }

    function logField(ownerKey, messageType) {
        if (messageType == "error") {
            errorLog[ownerKey] = 1;
        } else {
            delete errorLog[ownerKey];   //a warning or success message does not block formOk()
        }
    }

    function createMessageCon(inputWrapper, messageType, location, message, customStyles = null, paintWrapper = false, smallView, ownerKey) {
        //customStyles[a,b] : a=> bottom message box height, an integer, b=> left or right message box style, a string
        var isSmall = innerWidth < smallView;
        if ((location == "left" || location == "right") && isSmall) location = "bottom";
        var viewport = isSmall ? "small" : "large";

        if (inputWrapper.getAttribute("data-logStatus") == null) {
            inputWrapper.setAttribute("data-logStatus", "1");
            inputWrapper.setAttribute("data-fieldId", uid + "-w" + (++n));
        }

        //A box that is still fading out is removed at once: writing into it used to put the new
        //message in a box that was about to delete itself.
        var existing = null;
        ownBoxes(inputWrapper).forEach(function(b){
            if (b.classList.contains("clear")) b.remove(); else existing = b;
        });

        if (existing != null) {
            var sameShape = existing.getAttribute("data-type") == messageType && existing.getAttribute("data-location") == location && inputWrapper.getAttribute("data-vp") == viewport;
            if (sameShape) {
                existing.setAttribute("data-owner", ownerKey);   //a wrapper shows one box: the latest field's
                if (existing.innerHTML != message) {
                    existing.innerHTML = message;
                    resizeBox(existing, location, customStyles);
                }
                //customStyles given with an update apply to the box already showing
                if (customStyles != null) {
                    if (location == "bottom" && customStyles[0] != undefined) existing.style["height"] = Math.max(35, customStyles[0]) + "px";
                    if (location != "bottom" && customStyles[1] != null) existing.setAttribute("style", existing.getAttribute("style") + customStyles[1]);
                }
                finishWrite();
                return;
            }
            existing.remove();   //the type, side or viewport changed: build a fresh box
        }

        inputWrapper.setAttribute("data-vp", viewport);
        var box = $$.ce("DIV");
        var side = {left:["vLeft", "l"], right:["vRight", "r"], bottom:["vBottom", "b"]}[location];
        var suffix = {error:"e", warning:"w", success:"s"}[messageType];
        box.setAttribute("class", "vMsgBox " + side[0] + " " + messageType + " " + side[1] + suffix);
        box.setAttribute("data-type", messageType);
        box.setAttribute("data-location", location);
        box.setAttribute("data-owner", ownerKey);
        var conStyle = location == "left" ? leftConStyle : location == "right" ? rightConStyle : bottomConStyle;
        if (conStyle != "") box.setAttribute("style", conStyle);
        box.innerHTML = message;
        inputWrapper.appendChild(box);

        if (location == "bottom") {
            drop(box, customStyles != null && customStyles[0] != undefined ? customStyles[0] : null);
        } else {
            sendBehind(box, location, 15, customStyles);
        }
        //the text is transparent while the box grows, then takes its colour from the stylesheet,
        //which reads this form's own --error-color / --warning-color / --success-color
        afterTransition(box, function(){ box.classList.add("vShown"); });

        finishWrite();

        function finishWrite() {
            if (messageType == "error") {
                inputWrapper.classList.add("lerror");
                if (paintWrapper) inputWrapper.classList.add("wError");
            } else {
                inputWrapper.classList.remove("lerror", "wError");
            }
            logField(ownerKey, messageType);
        }
    }

    //Fits an existing box to new text without replaying its entrance
    function resizeBox(box, location, customStyles) {
        if (location == "bottom") {
            if (customStyles != null && customStyles[0] != undefined) return;
            box.style["height"] = "auto";
            var h = Math.max(35, box.scrollHeight);
            box.style["height"] = h + "px";
        } else {
            box.style["width"] = "auto";
            var w = box.scrollWidth;
            box.style["width"] = w + "px";
        }
    }

    //Clears the box this field owns in its wrapper and the field's error record. A box another
    //field in the same wrapper wrote is left alone, and so is that field's record.
    function clearMessage(inputWrapper, ownerKey) {
        ownBoxes(inputWrapper).forEach(function(box){
            if (box.classList.contains("clear")) return;
            if (box.getAttribute("data-owner") != ownerKey) return;
            box.classList.remove("vShown");
            box.classList.add("clear");
            if (box.classList.contains("vBottom")) {
                box.style["height"] = box.scrollHeight + "px";
                box.scrollHeight;
                box.style["height"] = "0";
            } else {
                box.style["width"] = box.scrollWidth + "px";
                box.scrollWidth;
                box.style["width"] = "0";
            }
            afterTransition(box, function(){ box.remove(); });
        });
        delete errorLog[ownerKey];
        var errorLeft = ownBoxes(inputWrapper).some(function(b){ return !b.classList.contains("clear") && b.getAttribute("data-type") == "error"; });
        if (!errorLeft) inputWrapper.classList.remove("lerror", "wError");
    }

    //For right and left display
    function sendBehind(element, direction, offset, customStyles) {
        if (direction == "left") {
            element.style["right"] = "calc(100% + " + offset + "px)";
        } else if (direction == "right") {
            element.style["left"] = "calc(100% + " + offset + "px)";
        }

        var width = element.scrollWidth;
        element.style["width"] = "0px";
        element.scrollWidth;
        if (customStyles != null && customStyles[1] != null) {
            var currentStyle = element.getAttribute("style");
            element.setAttribute("style", currentStyle + customStyles[1]);
        }
        element.style["width"] = width + "px";
    }

    //For bottom display
    function drop(element, height=null) {
        height = (height == null)?element.scrollHeight:height;
        height = height < 35 ? 35 : height;
        element.style["height"] = "0px";
        element.scrollHeight;
        element.style["height"] = height + "px";
    }
    /*******************************************************************/

    /***************************Event handling**************************/
    //All listeners sit on this instance's own form, so a focus or click in another form on the page
    //can never clear this form's messages, and destroy() detaches exactly what initialize() added.
    function addEventhandler() {
        form.addEventListener("focusin", handleFocusIn, false);
        form.addEventListener("click", handleClick, false);
    }

    function removeEventhandler() {
        form.removeEventListener("focusin", handleFocusIn, false);
        form.removeEventListener("click", handleClick, false);
    }

    function handleFocusIn(e) {
        if (e.target.classList.contains("vItem")) self.message.clear(e.target);
    }

    function handleClick(e) {
        //The feedback button acts on click. It used to act on focus, so tabbing onto it dismissed
        //the box, and on browsers that do not focus a clicked button (Safari) it did nothing.
        var fbButton = e.target.closest(".vFbBtn");   //labels are HTML: a click may land on markup inside
        if (fbButton != null && form.contains(fbButton)) {
            e.preventDefault();
            if (fbButton.getAttribute("data-rs") == "suc") {
                if (successButtonAction == "close") {
                    if (modal != null) modal.close();
                    hideProgress();
                } else {
                    location.assign(redirectTo);
                }
            } else {
                hideProgress();
            }
            return;
        }
        if (e.target.classList.contains("vItem")) self.message.clear(e.target);
    }
    /*******************************************************************/

    /*************************Progress and overlay**********************/
    function getOverlay() {
        return form.querySelector(".vFormOverlay");
    }

    function removeFeedbackBox() {
        var overlay = getOverlay();
        if (overlay == null) return;
        var old = overlay.querySelector(".FbMsgBox");
        if (old != null) old.remove();
    }

    function setLoaderVisible(visible) {
        var overlay = getOverlay();
        var loader = overlay != null ? overlay.querySelector(".vFormLoader") : null;
        if (loader != null) loader.classList.toggle("vFormLoaderHide", !visible);
    }

    function showOverlay() {
        var overlay = getOverlay();
        overlay.classList.remove("vFormOverlayHide");
        overlay.classList.add("vFormOverlayShow");
    }

    function showProgress(){
        removeFeedbackBox();
        showOverlay();
        progressShowing = true;
        if(progressAnimationType == "default"){
            setLoaderVisible(loaderLocation == "form");
            if(loaderLocation == "button"){
                var button = form.querySelector("."+submitButtonClass);
                if(button == null){
                    console.warn("No element matched with the specified class " + submitButtonClass + " for creating form loader");
                }else{
                    button.classList.add("initButtonLoader");
                    button.scrollHeight;
                    button.classList.add("vButtonLoader");
                }
            }
        }else{
            progressAnimationCallbacks.onSend(self);
        }
    }

    //Ends the loading state (custom onReceive, button loader) without touching the overlay.
    //Runs at most once per showProgress(), so onReceive is never called without an onSend.
    function endProgress() {
        if (!progressShowing) return;
        progressShowing = false;
        if(progressAnimationType == "default"){
            setLoaderVisible(false);
            if(loaderLocation == "button") offButtonloader();
        }else{
            progressAnimationCallbacks.onReceive(self);
        }
    }

    function hideProgress() {
        endProgress();
        var overlay = getOverlay();
        if (overlay == null) return;
        overlay.classList.remove("vFormOverlayShow");
        overlay.classList.add("vFormOverlayHide");
        removeFeedbackBox();
    }

    function offButtonloader(){
        var button = form.querySelector("."+submitButtonClass);
        if(button == null){
            console.warn("No element matched with the specified class " + submitButtonClass);
        }else{
            button.classList.remove("vButtonLoader");
            button.scrollHeight;
            setTimeout(function(){
                button.classList.remove("initButtonLoader");
            },300);
        }
    }

    function createLoader() {
        var overLay = $$.ce("DIV");
        overLay.classList.add("vFormOverlay");
        if(overlayStyle != "") overLay.style = overlayStyle;

        if(progressAnimationType == "default" && loaderLocation == "form"){
            var loader = $$.ce("DIV");
            loader.classList.add("vFormLoader", "vFormLoaderHide");
            //with no progressIndicatorStyle the loader draws its own ring; a consumer style
            //(usually an icon glyph) replaces it instead of being drawn inside it
            if (progressIndicatorStyle == null) loader.classList.add("vDefaultSpinner");
            overLay.appendChild(loader);
            form.appendChild(overLay);

            //The loader must be in the document, and positioned, before it is centred:
            //$$.sm().center() reads parentNode on its static-element branch, and
            //'formValidator.css' arrives asynchronously, so the class alone cannot be relied
            //on to have made the element absolute by this point. Setting it inline keeps
            //center() on its transform branch deterministically.
            loader.style["position"] = "absolute";
            $$.sm(loader).center();
            return;
        }
        form.appendChild(overLay);
    }
    /*******************************************************************/

    /*****************************Feedback box**************************/
    function createFeedBack(messageType, msgTxt, labels) {
        labels = labels == null ?{}:labels;
        var ui = {error:["terr", "merr"], warning:["twrn", "mwrn"], success:["tsuc", "msuc"]}[messageType] || ["tsuc", "msuc"];

        var con = $$.ce("DIV");
        var ttl = $$.ce("DIV");
        var msg = $$.ce("DIV");
        var btCon = $$.ce("DIV");
        var btn = $$.ce("BUTTON");

        con.classList.add("FbMsgBox");
        con.setAttribute("role", "alertdialog");
        ttl.setAttribute("class", "ttl " + ui[0]);
        msg.setAttribute("class", "msgCon " + ui[1]);
        btCon.classList.add("buttonCon");
        //type=button: without it the button submitted the form it sits in
        btn.setAttribute("type", "button");
        btn.setAttribute("id", "fbBtn");
        btn.classList.add("vFbBtn");

        //Styles: every type, warning included, is centred whether or not it has its own entry
        var styles = feedbackModalStyles[messageType] || {};
        if (styles["title"] != undefined) ttl.style = styles["title"];
        if (styles["button"] != undefined) btn.style = styles["button"];
        if (styles["body"] != undefined) msg.style = styles["body"];
        if (styles["container"] != undefined) {
            $$.sm(con).center(styles["container"]);
        } else {
            $$.sm(con).center();
        }

        //Labels: each one falls back to its default on its own
        ttl.innerHTML = labels["title"] != undefined ? labels["title"] : "Submission Feedback";
        btn.innerHTML = labels["buttonLabel"] != undefined ? labels["buttonLabel"] : (ui[0] == "terr" ? "Try again" : "Ok");
        msg.innerHTML = msgTxt;

        btn.setAttribute("data-rs", ui[0] == "terr" ? "err" : "suc");
        btCon.appendChild(btn);
        con.appendChild(ttl);
        con.appendChild(msg);
        con.appendChild(btCon);
        return con;
    }

    function showFeedback(url, msg, type, labels) {
        removeFeedbackBox();
        var overlay = getOverlay();
        //the feedback box lives in the overlay, which is shown here as well: called on its own,
        //showFeedback() used to add the box to an overlay that stayed hidden
        showOverlay();
        setLoaderVisible(false);
        overlay.appendChild(msg == null ? createFeedBack("success", "Form submitted successfully", labels) : createFeedBack(type, msg, labels));
        endProgress();   //the box replaces the loading state: button loader off, custom onReceive
    }
    /*******************************************************************/

    function InIError(methodName) {
        throw new Error("To use the '" + methodName + "()' method, initialization must be done. Initialize using the 'initialize()' method");
    }

    //create style styleSheet
    async function setStyleSheet() {
        try {
            var path = await processAssetPath();
            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/formValidator.css", "formValidator");
            }else{
                throw new Error(path)
            }
        } catch (error) {
            console.error(error)
        }

        //progressIndicatorStyle is scoped to this form; it used to be written once for the whole
        //page, so the first validator's loader style was applied to every form
        if (progressAnimationType == "default" && progressIndicatorStyle != null) {
            attachStyleSheet("formValidatorStyles-" + uid, "[data-vfv='" + uid + "'] .vFormLoader::before {" + progressIndicatorStyle + "}");
        }
    }

    /*****************************Field helpers*************************/
    //Normalises argument 1 of validate()/write()/clear(): a single element, or a group of elements
    //(NodeList, RadioNodeList from form.elements, HTMLCollection or an array of elements)
    function resolveInput(inputField, methodName) {
        if (inputField instanceof Element) return {kind:"single", first:inputField, list:[inputField]};
        var isGroup = inputField != null && typeof inputField == "object" &&
            (inputField instanceof NodeList || inputField instanceof HTMLCollection || Array.isArray(inputField));
        if (isGroup) {
            var list = Array.prototype.slice.call(inputField);
            if (list.length > 0 && list.every(function(el){ return el instanceof Element; })) {
                return {kind:"group", first:list[0], list:list};
            }
        }
        throw new Error("'" + methodName + "' method argument 1 expects a valid HTML element or a non-empty NodeList of elements");
    }

    function isTextLike(el) {
        if (el.nodeName == "TEXTAREA") return true;
        if (el.nodeName == "INPUT") return nonTextTypes[(el.type || "text").toLowerCase()] == undefined;
        return false;
    }

    function isCheckField(el) {
        return el.nodeName == "INPUT" && (el.type == "radio" || el.type == "checkbox");
    }

    function isFileField(el) {
        return el.nodeName == "INPUT" && el.type == "file";
    }

    function isEmpty(input) {
        var el = input.first;
        if (input.kind == "group" || isCheckField(el)) return !input.list.some(function(x){ return isCheckField(x) ? x.checked : x.value != ""; });
        if (isFileField(el)) return el.files == null || el.files.length == 0;
        return el.value == null || el.value.length == 0;
    }

    function checkRequired(input) {
        var el = input.first;
        if (input.kind == "single" && el.nodeName == "SELECT") {
            var selectedOption = el.selectedOptions[0];
            if (selectedOption == undefined) return false;   //a select with no options
            var value = selectedOption.getAttribute("value");
            if (value != null) return value.length > 0;
            return el.selectedIndex != 0;   //no value attribute: the first option is the placeholder
        }
        return !isEmpty(input);
    }

    function getInputWrapper(inputField) {
        var inputWrapper = null;
        if (wrapperClassAttribute != null) { //has prefered data atrribute set
            try {
                var attribValue = inputField.getAttribute(wrapperClassAttribute);
                if (attribValue != null) { //configured and set
                    inputWrapper = $$.sm(inputField).getParent(attribValue);
                } else if(inputField.classList.contains("dField") || inputField.classList.contains("vDateIcon")){//FormComponents date field
                    inputWrapper = $$.sm(inputField).getParent(3);
                }else{
                    inputWrapper = inputField.parentNode;
                }
            } catch (error) {
                inputWrapper = inputField.parentNode;
            }
        }else if(inputField.classList.contains("dField") || inputField.classList.contains("vDateIcon")){//FormComponents date field
            inputWrapper = $$.sm(inputField).getParent(3);
        }else{ //use default
            inputWrapper = inputField.parentNode;
        }
        return inputWrapper;
    }

    //'e:- message', 'w:- message', 's:- message' set the type; anything else is an error message.
    //Only a leading single-letter prefix counts, and only the first ':-' is the separator, so a
    //message may itself contain ':-'.
    function getMessageDetails(msg) {
        if (typeof msg != "string") throw new Error("A FormValidator rule message must be a string, got: " + msg);
        var found = /^\s*([ewsEWS])\s*:-\s?/.exec(msg);
        if (found == null) return ["error", msg];
        return [{e:"error", w:"warning", s:"success"}[found[1].toLowerCase()], msg.slice(found[0].length)];
    }

    //"/body/flags" becomes new RegExp(body, flags); anything else is used whole as the pattern.
    //All slashes used to be stripped, which dropped the flags and broke escaped slashes.
    function toRegExp(pattern) {
        var parts = /^\/(.*)\/([dgimsuy]*)$/.exec(pattern);
        return parts != null ? new RegExp(parts[1], parts[2]) : new RegExp(pattern);
    }

    //"500", "500B", "2KB", "1.5MB", "1GB" (1024-based) to bytes
    function parseSize(spec, rule) {
        var parts = /^\s*(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?\s*$/i.exec(spec);
        if (parts == null) throw new Error("FormValidator rule '" + rule + ":" + spec + "' needs a size such as 500KB, 2MB or 1024");
        var unit = (parts[2] || "B").toUpperCase();
        return parseFloat(parts[1]) * {B:1, KB:1024, MB:1048576, GB:1073741824}[unit];
    }

    function parseRules(rules) {
        var parsed = {};
        Object.keys(rules).forEach(function(key){
            //split at the first ':' only, so a value may contain ':' (a pattern, a word list)
            var at = key.indexOf(":");
            var name = at == -1 ? key : key.slice(0, at);
            var value = at == -1 ? null : key.slice(at + 1);
            if (supportedRules[name] == undefined) throw new Error("This rule " + key + " is not supported");
            if (name == "callBack") {
                var cb = rules[key];
                if (!Array.isArray(cb) || typeof cb[0] != "function") throw new Error("The 'callBack' rule value must be an array: [function, message1, message2, ...]");
            }
            if ((name == "minLength" || name == "maxLength") && !/^\d+$/.test(value || "")) throw new Error("The '" + name + "' rule needs a whole number of characters, such as '" + name + ":8'; got '" + key + "'");
            if (name == "fullName" && !Array.isArray(rules[key])) throw new Error("The 'fullName' rule value must be an array of 3 messages: [too few names, too many names, a name too short]");
            parsed[name] = {key:key, value:value, message:rules[key]};
        });
        return parsed;
    }

    function isFullName(value, maxNames){
        var names = value.trim().split(/\s+/).filter(function(x){ return x != ""; });
        maxNames = parseInt(maxNames);
        maxNames = isNaN(maxNames) || maxNames < 2 ? 2 : maxNames;
        if (names.length < 2) return 0;
        if (names.length > maxNames) return 1;
        for (var x = 0; x < names.length; x++) {
            if (names[x].length < 2) return 2;
        }
        return true;
    }

    function fileList(el) {
        return el.files != null ? Array.prototype.slice.call(el.files) : [];
    }
    /*******************************************************************/

    /*Message*/
    this.message = {
        write: function(inputField, messageType, location, message, customStyles = null) {
            //(optional) customStyles: [a, b], a = bottom box height (px), b = CSS appended to a left/right box
            if (initialized != true) InIError("write");
            var input = resolveInput(inputField, "Obj.message.write()");
            if (validateString(messageType, "'Obj.write()' method needs a string as argument 2")) {
                if (!(messageType == "success" || messageType == "error" || messageType == "warning")) {
                    throw new Error("'Obj.write()' method argument 2 must be string value of either: 'success', 'warning', or 'error'");
                }
            };
            if (validateString(location, "'Obj.write()' method needs a string as argument 3")) {
                if (!(location == "bottom" || location == "left" || location == "right")) {
                    throw new Error("'Obj.write()' method argument 3 must be string value of either: 'bottom', 'left', or 'right'");
                }
            };
            validateString(message, "'Obj.write()' method needs a string (The message) as argument 4");
            if(customStyles != null) validateArray(customStyles, "message.write() method argument 5 must be an array of string '[a, b]', which holds a valid CSS styles for bottom or right or left messageBox");

            var first = input.first;
            var smallView = smallViewAttribute != "" ? parseInt(first.getAttribute(smallViewAttribute)) : NaN;
            smallView = isNaN(smallView) ? 866 : smallView;
            var inputWrapper = getInputWrapper(first);
            inputWrapper.style.position = "relative";

            input.list.forEach(function(el){
                if (!el.classList.contains("vItem")) {
                    el.classList.add("vItem");
                    markedFields.push(el);
                }
            });
            var key = fieldKey(input);
            keyWrappers[key] = inputWrapper;
            createMessageCon(inputWrapper, messageType, location, message, customStyles, !isCheckField(first), smallView, key);
        },
        clear: function(inputField) {
            if (initialized != true) InIError("clear");
            var input = resolveInput(inputField, "Obj.message.clear()");
            //the message is in the wrapper it was written in: for a group that is the first member's,
            //which may not be the wrapper of the radio that was clicked
            var key = fieldKey(input);
            clearMessage(keyWrappers[key] || getInputWrapper(input.first), key);
        }
    }
    /**********/

    /*Teardown*/
    this.destroy = function() {
        //Detaches this instance's listeners and removes everything it put into the form: the
        //overlay and loader, every message box, and the classes and attributes it set on fields and
        //wrappers. 'vItem' is taken back only from fields this instance marked (FormComponents marks
        //its own natives). The 'config.modal' displayer is left alone: the consumer supplied it.
        if (destroyed) return;

        //a pending request is aborted, so its answer never reaches a torn-down form
        if (pendingXhr != null) { var xhrToAbort = pendingXhr; pendingXhr = null; inFlight = false; xhrToAbort.abort(); }
        if (form != null){
            removeEventhandler();
            var overlay = getOverlay();
            if (overlay != null) overlay.remove();
            form.querySelectorAll(".vMsgBox").forEach(function(b){ b.remove(); });
            form.querySelectorAll("[data-logStatus]").forEach(function(w){
                w.classList.remove("lerror", "wError");
                w.removeAttribute("data-logStatus");
                w.removeAttribute("data-fieldId");
                w.removeAttribute("data-vp");
            });
            form.removeAttribute("data-vfv");
        }
        markedFields.forEach(function(el){ el.classList.remove("vItem"); });
        markedFields = [];
        keyWrappers = {};
        var styleEle = $$.ss("style[data-id='formValidatorStyles-" + uid + "']");
        if (styleEle != null) styleEle.remove();
        errorLog = {};

        initialized = false;
        destroyed = true;
    }
    /**********/

    /*Initialize*/
    this.initialize = function() {
        if (initialized == false) {
            if (destroyed) throw new Error("This FormValidator has been destroyed, create a new instance instead of re-initializing");
            if (form == null) throw new Error("Cannot initialize without settinig a form to perform validation on, pass target form to FormValidator() contructor, to set target form");
            if(progressAnimationType == "custom" && progressAnimationCallbacks == null){
                throw new Error("Progress animation type is set to 'custom' and no handler is defined for it. Define a handler using the 'config.progressAnimationCallbacks' property");
            }
            if (loaderLocation == "button" && submitButtonClass == "") {
                throw new Error("config.loaderLocation is 'button' but no button is named: set config.submitButtonClass to the submit button's class");
            }
            form.setAttribute("data-vfv", uid);
            setStyleSheet();
            createLoader();
            addEventhandler();
            initialized = true;
        }
    }
    /**********/

    /*Config*/
    this.config = {

    }
    /**********/


    /*validator*/
    //Checks one field (or a radio/checkbox group) against the rules, in a fixed order, and writes
    //the first failing rule's message. Returns true when the field passes, false when it fails.
    //When it passes, a message left over from an earlier failure is cleared.
    this.validate = function(inputField, rules, location, customStyles = null) {
        if (initialized != true) InIError("validate");
        var input = resolveInput(inputField, "Obj.validate()");
        validateObjectLiteral(rules, "'Obj.validate()' method argument 2 is expected to be Object literal");
        validateString(location, "'Obj.validate()' method argument 3 expects a string");
        if(customStyles != null) validateArray(customStyles, "validate() method argument 4 must be an array of string '[a, b]', which holds a valid CSS styles for bottom or right or left messageBox");
        var field = input.first;
        if(["INPUT", "TEXTAREA", "SELECT"].indexOf(field.nodeName) == -1){
            console.warn(field, "The above element is not an input element");
        }
        var r = parseRules(rules);
        var inputWrapper = getInputWrapper(field);

        function fail(message) {
            var details = getMessageDetails(message);
            self.message.write(inputField, details[0], location, details[1], customStyles);
            return details[0] != "error";   //a rule that answers with a warning or success does not fail the field
        }
        var key = fieldKey(input);
        function pass() {
            clearMessage(inputWrapper, key);   //only this field's own box and record
            return true;
        }

        //trim first, so '   ' does not satisfy 'required'
        if (r.trim && isTextLike(field)) field.value = field.value.trim();

        if (r.required) {
            if (!checkRequired(input)) return fail(r.required.message);
        } else if (isEmpty(input)) {
            //an empty optional field skips the value-format rules, but a callBack still runs: it may
            //check across fields ("a phone or an email must be given")
            if (r.callBack) {
                var emptyAnswer = r.callBack.message[0](self, field);
                if (emptyAnswer === false) emptyAnswer = 1;
                if (typeof emptyAnswer == "number") {
                    emptyAnswer = emptyAnswer < 1 ? 1 : emptyAnswer;
                    if (r.callBack.message[emptyAnswer] != undefined) return fail(r.callBack.message[emptyAnswer]);
                }
            }
            return pass();
        }

        var text = isTextLike(field);
        var value = field.value;

        if (r.minLength && text && value.length < parseInt(r.minLength.value)) return fail(r.minLength.message);
        if (r.maxLength && text && value.length > parseInt(r.maxLength.value)) return fail(r.maxLength.message);
        if (r.email && text && !validateEmailAddress(value)) return fail(r.email.message);
        if (r.alpha && !/^[A-Za-z ]+$/.test(value)) return fail(r.alpha.message);
        if (r.alphaNum && !/^[A-Za-z0-9 ]+$/.test(value)) return fail(r.alphaNum.message);
        if (r.integer && !/^[0-9]+$/.test(value)) return fail(r.integer.message);
        if (r.fullName) {
            var names = isFullName(value, r.fullName.value);
            if (names !== true && r.fullName.message[names] != undefined) return fail(r.fullName.message[names]);
        }
        if (r.float && !/^[0-9]+\.[0-9]+$/.test(value)) return fail(r.float.message);
        if (r.noSpace && value.indexOf(" ") != -1) return fail(r.noSpace.message);
        if (r.notIn && text) {
            var banned = (r.notIn.value || "").split(" ").filter(function(x){ return x != ""; });
            if (banned.some(function(word){ return value.indexOf(word) != -1; })) return fail(r.notIn.message);
        }
        if (r.callBack) {
            var cb = r.callBack.message;
            var response = cb[0](self, field); //true = valid, false or a message index = invalid
            if (response === false) response = 1;
            if (typeof response == "number") {
                response = response < 1 ? 1 : response;
                if (cb[response] != undefined) return fail(cb[response]);
            }
        }
        if (r.match && !toRegExp(r.match.value || "").test(value)) return fail(r.match.message);
        if (isFileField(field)) {
            var files = fileList(field);
            if (r.ext) {
                var allowed = (r.ext.value || "").toLowerCase().split(" ").filter(function(x){ return x != ""; }).map(function(x){ return x.replace(/^\./, ""); });
                var badType = files.some(function(f){
                    var dot = f.name.lastIndexOf(".");
                    return allowed.indexOf(dot == -1 ? "" : f.name.slice(dot + 1).toLowerCase()) == -1;
                });
                if (badType) return fail(r.ext.message);
            }
            if (r.minSize) {
                var min = parseSize(r.minSize.value || "", "minSize");
                if (files.some(function(f){ return f.size < min; })) return fail(r.minSize.message);
            }
            if (r.maxSize) {
                var max = parseSize(r.maxSize.value || "", "maxSize");
                if (files.some(function(f){ return f.size > max; })) return fail(r.maxSize.message);
            }
        }
        return pass();
    }
    /**********/

    /*Update CSRF Token*/
    this.updateCSRFToken = function(token){
        if(CSRFTokenElement == null) throw new Error("No CSRF token element is set for this form: set config.CSRFTokenElement first")
        validateString(token, "'Obj.updateCSRFToken(x)' method argument 1 expects a string");
        CSRFTokenElement.value = token;
    }
    /**********/

    this.logServerError = function(log){
        validateArray(log, "Obj.logServerError(x) argument 1 must be an array of server logs");
        //log => [{name:'nameOfinputField', message:'errorLogMessage', location:'bottom'|'left'|'right'}, ...]
        //The messages come from the server, so they are written as text, never parsed as HTML.
        hideProgress();
        log.forEach(function(ele){
            if (ele == null || typeof ele.name != "string") return;
            var inputField = form.querySelector("[name='" + CSS.escape(ele.name) + "']");
            if(inputField == null) return;
            var holder = document.createElement("div");
            holder.textContent = ele.message == null ? "" : String(ele.message);
            self.message.write(inputField, "error", ele.location || "bottom", holder.innerHTML);
        });
    }

    /*Form validation status*/
    //true when no field has an error message; the record is reset each time it reports false, so
    //the next round of validate() calls decides the next answer
    this.formOk = function() {
        if (Object.keys(errorLog).length > 0) {
            errorLog = {};
            return false;
        } else {
            return true;
        }
    }

    /*Submit back*/
    this.submit = function(data = null, url, headers = null) {
        if (!initialized)throw new Error("'submit()' method must be called after initialization");
        validateString(url, "'submit()' method argument 2 must be a string specifying the URL");
        //every argument is checked before the form is locked, so a bad call cannot leave the overlay up
        if (data != null) validateObjectLiteral(data, "'submit()' method argument 1 must be a literal object specifying additonal data to be appended");
        if (headers != null) {
            validateObjectLiteral(headers, "'submit()' method argument 3 must be a literal object of request headers");
            Object.keys(headers).forEach(function(h){ validateString(headers[h], "'submit()' method argument 3: the header '" + h + "' must have a string value"); });
        }
        if (inFlight) return false;   //one request at a time: a second submit() while one is pending is ignored

        var formData = new FormData(parseForm);
        if (data != null) Object.keys(data).forEach(function(key){ formData.append(key, data[key]); });

        var requestUrl = url;
        var body = formData;
        if (submissionMethod == "GET") {
            //a GET request has no body, so the fields go in the query string (files cannot be sent)
            var query = new URLSearchParams();
            formData.forEach(function(value, key){ if (typeof value == "string") query.append(key, value); });
            var qs = query.toString();
            if (qs != "") requestUrl += (url.indexOf("?") == -1 ? "?" : "&") + qs;
            body = null;
        }

        var xhr = $$.ajax({method:submissionMethod, url:requestUrl}, "json");
        if (headers != null) Object.keys(headers).forEach(function(h){ xhr.setRequestHeader(h, headers[h]); });

        inFlight = true;
        pendingXhr = xhr;
        showProgress();
        //loadend fires once for every outcome (answered, network error, abort, timeout), so the
        //form is never left locked behind the overlay
        xhr.addEventListener("loadend", function() {
            if (pendingXhr != xhr) return;   //destroyed (and aborted) while waiting
            pendingXhr = null;
            inFlight = false;
            var status = xhr.status;
            if (status >= 200 && status < 300) {
                if (controller != null) {
                    var ok = controller(self, xhr.responseText, xhr);
                    if (ok) { //the controller returning true counts as the OK button being pressed
                        if (successButtonAction == "redirect") {
                            location.assign(redirectTo);
                        } else {
                            hideProgress();
                        }
                    }
                } else {
                    endProgress();
                    self.showFeedback();
                }
                return;
            }
            var messages = {0:"Network error, check your connection and try again", 404:"Not found", 405:"Method not allowed", 419:"Expired, reload and try again", 500:"The server ran into an error, please try again"};
            endProgress();
            self.showFeedback(null, messages[status] != undefined ? messages[status] : "The request failed (status " + status + "), please try again", "error");
        }, false);
        xhr.send(body);
        return true;
    }

    this.showFeedback = function(feedBackUrl = null, msg = null, type = null, labels=null) {
        if (!initialized) InIError("showFeedback");
        if (type != null) {
            type = type.toLowerCase();
            if (type != "warning" && type != "success" && type != "error") {
                throw new Error("'showFeedback()' method argument 3 must either be: null, 'error', 'warning' or 'success'");
            }
        }
        if(labels != null){
            validateObjectLiteral(labels, "validatorObj.showFeedback(...x) expects argument 4 to be an object");
            var keys = ["title", "buttonLabel"];
            var sourceKeys = Object.keys(labels);
            var totalSourceKeys = sourceKeys.length;
            if (totalSourceKeys > 2 || totalSourceKeys < 1) throw new Error ("validatorObj.showFeedback(...x) expects argument 4 to be an object of max, 2 entries");

            for (let x = 0; x < totalSourceKeys; x++) {
                if(keys.indexOf(sourceKeys[x]) == -1){
                    throw new Error ("validatorObj.showFeedback(...x) expects argument 4 object keys  to be any of the keys: "+keys.join(", ") +". The key: '"+sourceKeys[x]+"' is not one of them");
                }else{
                    validateString(labels[sourceKeys[x]], "validatorObj.showFeedback(...x) expects argument 4 object key: "+sourceKeys[x]+" expects a string as value");
                }
            }
        }
        showFeedback(feedBackUrl, msg, type, labels);
    }

    Object.defineProperties(this.config, {
        bottomConStyle: {
            set: function(value) {
                validateString(value, "A string of valid CSS style(s) needed for the 'config.bottomConStyle' property")
                bottomConStyle = value;
            }
        },
        leftConStyle: {
            set: function(value) {
                validateString(value, "A string of valid CSS style(s) needed for the 'config.leftConStyle' property")
                leftConStyle = value;
            }
        },
        rightConStyle: {
            set: function(value) {
                validateString(value, "A string of valid CSS style(s) needed for the 'config.rightConStyle' property")
                rightConStyle = value;
            }
        },
        overlayStyle: {
            set: function(value) {
                validateString(value, "A string of valid CSS style(s) needed for the 'config.overlayStyle' property")
                overlayStyle = value;
            }
        },
        modal: {
            set: function(value) {
                if (value == null || typeof value.close != "function") throw new TypeError("'config.modal' property must be an object with a close() method, such as a ModalDisplayer");
                modal = value;
            }
        },
        feedBackController: {
            set: function(value) {
                validateFunction(value, "'config.feedBackController' property value must be a function");
                controller = value;
            }
        },
        progressIndicatorStyle: {
            set: function(value) {
                validateString(value, "config.progressIndicatorStyle property must be a string of valid CSS style");
                progressIndicatorStyle = value;
            }
        },
        progressAnimationType:{
            set: function(value) {
                validateString(value, "config.progressAnimationType property must be a string");
                if(value != "default" &&  value != "custom"){
                    throw new Error("config.progressAnimationType property must be a string of value: 'custom' or 'default'");
                }
                progressAnimationType = value;
            }
        },
        progressAnimationCallbacks:{
            set: function(value) {
                validateObjectLiteral(value, "config.progressAnimationCallbacks property must be a literal object");
                var sourceKeys = Object.keys(value);
                if (sourceKeys.some(function(k){ return k != "onSend" && k != "onReceive"; })) throw new Error("config.progressAnimationCallbacks property object must have only these keys 'onSend' and 'onReceive'");
                if (typeof value.onSend != "function" || typeof value.onReceive != "function") throw new Error("config.progressAnimationCallbacks property object needs both 'onSend' and 'onReceive', each a function");
                progressAnimationCallbacks = value;
            }
        },
        wrapperClassAttribute: {
            set: function(value) {
                validateString(value, "config.wrapperClassAttribute property value expects a string");
                wrapperClassAttribute = value;
            }
        },
        smallViewAttribute:{
            set: function(value) {
                validateString(value, "config.smallViewAttribute property value expects a string");
                smallViewAttribute = value;
            }
        },
        submissionMethod:{
            set: function(value) {
                validateString(value, "config.submissionMethod property value expects a string");
                value = value.toUpperCase();
                if (supportedMethod[value] == undefined) throw new Error("config.submissionMethod property value must be one of: " + Object.keys(supportedMethod).join(", "));
                submissionMethod = value;
            }
        },
        loaderLocation:{
            set: function(value) {
                validateString(value, "config.loaderLocation property value expects a string");
                value = value.toLowerCase();
                if(value != "form" && value != "button") throw new Error("config.loaderLocation property value can either be 'form' or 'button'");
                loaderLocation = value;   //'button' needs config.submitButtonClass by initialize(), in either order
            }
        },
        submitButtonClass:{
            set: function(value) {
                validateString(value, "config.submitButtonClass property value expects a string");
                submitButtonClass = value;
            }
        },
        CSRFTokenElement:{
            set: function(value) {
                validateElement(value, "config.CSRFTokenElement property value expects a DOM Element");
                CSRFTokenElement = value;
            }
        },
        successButtonAction:{
            set: function(value) {
                validateString(value, "config.successButtonAction property value expects a string");
                if(value != "redirect" && value != "close") throw new Error("config.successButtonAction property value must either be: 'redirect' or 'close'");
                successButtonAction = value;
            }
        },
        redirectTo:{
            set: function(value) {
                validateString(value, "config.redirectTo property value expects a string");
                redirectTo = value;
            }
        },
        feedbackModalStyles:{
            set: function(value) {
                validateObjectLiteral(value, "config.feedbackModalStyles property value expects an object literal");
                var types = ["warning", "error", "success"];
                var styleKeys= ["body", "title", "button", "container"];
                var keys = Object.keys(value);
                var totalKeys = keys.length;
                if (totalKeys > 3 || totalKeys < 1) throw new Error ("config.feedbackModalStyles property value expects an object of max, 3 entries");

                for (var x = 0; x < totalKeys; x++) {
                    if(types.indexOf(keys[x]) == -1){
                        throw new Error ("config.feedbackModalStyles property value expects an object of any of the keys: "+types.join(", ") +" The key: '"+keys[x]+"' is not one of them");
                    }
                    validateObjectLiteral(value[keys[x]], "config.feedbackModalStyles property value object key: '"+ keys[x]+"' expect an object literal as value");
                    var subKeys = Object.keys(value[keys[x]]);
                    var subTotalKeys = subKeys.length;
                    if (subTotalKeys > 4 || subTotalKeys < 1) throw new Error ("config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect an object literal of max, 4 entries");
                    for (var y = 0; y < subTotalKeys; y++) {
                        if(styleKeys.indexOf(subKeys[y]) == -1){
                            throw new Error ("config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect an object literal of any of the keys: "+styleKeys.join(", "));
                        }
                        validateString(value[keys[x]][subKeys[y]], "config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect its object key: '"+ subKeys[y]+"' value to be a string");
                    }
                }
                feedbackModalStyles = value;
            }
        }
    });
    Object.defineProperties(this.message, {
        write: { writable: false },
        clear: { writable: false }
    });
    Object.defineProperties(this, {
        config: { writable: false},
        validate: { writable: false},
        message: { writable: false},
        initialize: { writable: false},
        destroy: { writable: false},
        submit: { writable: false},
        formOk: { writable: false},
        showFeedback: { writable: false},
        logServerError: { writable: false},
        hideProgress: {
            value: function() {
                hideProgress();
            }
        },
        updateCSRFToken: { writable: false},
    });
}

/*formatter*/
FormValidator.format = {
    //1234567.891 with "," gives "1,234,567.891": only the whole part is grouped, the sign and the
    //decimals are kept. Always returns a string.
    currencyField: function(inputS, seperator) {
        validateNumber(inputS, "Numeric (Amount) value needed as argument 1, for 'currencyField()' method");
        validateString(seperator, "A string of length 1 or 2 (seperator) needed as argument 2, for 'currencyField()' method");
        if (seperator.length > 2) throw new Error("String length exceeded, string length must be <= 2, for 'currencyField' method' 2nd argument");
        var s = String(inputS);
        var sign = s[0] == "-" ? "-" : "";
        if (sign != "") s = s.slice(1);
        var dot = s.indexOf(".");
        var whole = dot == -1 ? s : s.slice(0, dot);
        var fraction = dot == -1 ? "" : s.slice(dot);
        if (!/^\d+$/.test(whole)) return sign + s;   //exponent notation and the like: left as is
        return sign + whole.replace(/\B(?=(\d{3})+(?!\d))/g, seperator) + fraction;
    },
    roundToDec: function(value, decimals) {
        validateNumber(value, "'roundToDec' method argument 1 must be numeric value");
        validateNumber(decimals, "'roundToDec' method argument 2 must be numeric value");
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    },
    integerField: function(inputElement) {
        validateElement(inputElement, "'integerField()' argument must be a valid HTML Element");
        var type = (inputElement.type || "").toLowerCase();
        if (inputElement.nodeName != "INPUT" || (type != "text" && type != "tel" && type != "search")) throw new Error("'integerField()' argument must be an INPUT element of type 'text'");
        var eStatus = inputElement.getAttribute("eStatus");
        if(eStatus == null){
            inputElement.setAttribute("eStatus", "set")
            inputElement.addEventListener("input", function() {
                var inputValue = sanitizeInteger(inputElement.value);
                inputElement.value = inputValue;
            }, false);
        }
    },
    wordSeperator: function(inputElement, seperator, n=1) {
        validateElement(inputElement, "'wordSeperator(x..)' argument 1 must be a valid HTML Element");
        validateString(seperator, "'wordSeperator(.x.)' argument 2 must be a string");
        //n = number of times to repeat seperator
        if (!validateInteger(n)) throw new Error("'wordSeperator(..x)' argument 3 must be an integer");
        n = n < 1 ? 1 : n;
        var type = (inputElement.type || "").toLowerCase();
        if (inputElement.nodeName == "TEXTAREA" ? false : (inputElement.nodeName != "INPUT" || type != "text")) {
            throw new Error("'wordSeperator()' argument 1 must be an INPUT element of type 'text' or a TEXTAREA");
        }
        //one listener per element, on the element itself: a second call replaces the settings
        //instead of adding another document listener
        inputElement.__vWordSeperator = {seperator: seperator, n: n};
        if (inputElement.getAttribute("data-wordSeperator") != null) return;
        inputElement.setAttribute("data-wordSeperator", "set");
        inputElement.addEventListener("blur", function() {
            var settings = inputElement.__vWordSeperator;
            var words = inputElement.value.split(" ").filter(function(w){ return w != ""; });
            if (words.length > 1) inputElement.value = words.join(settings.seperator.repeat(settings.n));
        }, false);
    }
}

Object.defineProperties(FormValidator.format, {
    currencyField: { writable: false },
    roundToDec: { writable: false },
    integerField: { writable: false },
    wordSeperator: { writable: false }
});
/**********/
/****************************************************************/
