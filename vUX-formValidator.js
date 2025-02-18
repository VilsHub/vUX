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

/************************Form validator**************************/
export function FormValidator(form = null) {
    if (form != null) {
        validateElement(form, "'config.form' property must be an element");
        var positionType = $$.sm(form).cssStyle("position");
        if(positionType == "static") form.style["position"] = "relative";
        var parseForm = form.nodeName == "FORM"?form:form.querySelector("FORM");
        if(parseForm == null) throw new Error("The specified form in FormValidator(x) constructor has no FORM interface. Please wrap the form container with FORM element");
    }
    var bottomConStyle = "",initialized = false,leftConStyle = "",rightConStyle = "",self = this,submissionMethod="POST";
    var errorLog = {},n = 0,progressAnimationType = "default",progressAnimationCallbacks =null, progressIndicatorStyle = null,formSubmitted = false,smallViewAttribute = "",wrapperClassAttribute = null, CSRFTokenElement=null;
    var modal = null, controller = null, submitButtonClass ="", loaderLocation="form", overlayStyle="", successButtonAction="close", redirectTo="/", feedbackModalStyles={};
    var supportedRules = {
        required: 1, //done
        minLength: 1, //done
        maxLength: 1, //done
        alpha: 1, //done
        integer: 1, //done
        alphaNum: 1, //done
        float: 1, //done
        ext: 1,//done
        minSize: 1,
        maxSize: 1,
        callBack: 1, //done
        email: 1, //done
        notIn: 1, //done
        trim:1,//done
        noSpace:1,//done
        fullName:1,//done
        match:1
    }
    var supportedMethod = {"POST":1, "GET":1, "PUT":1, "DELETE":1};

    //Create Element
    function createMessageCon(inputWrapper, messageType, location, message, customStyles = null, paintWrapper = false, smallView) {
        //customStyles[a,b] : a=> bottom message box height, an integer, b=> left or right message box style, a string
        if (location == "left" || location == "right") {
            if (innerWidth < smallView) {
                location = "bottom";
            }
        }

        //__________________________//
        //create log status
        if (inputWrapper == null) {

        }
        if (inputWrapper.getAttribute("data-logStatus") == null) {
            inputWrapper.setAttribute("data-logStatus", "1");
            inputWrapper.setAttribute("data-fieldId", "f" + (n + 1));
            n++;
        }
        var checkExistence = inputWrapper.querySelector(".vMsgBox");

        function createMsgBox() {
            (innerWidth > smallView) ? inputWrapper.setAttribute("data-vp", "large") : inputWrapper.setAttribute("data-vp", "small");
            //Fix left and right
            var messageBoxWrapper = $$.ce("DIV");

            function styleLeft() {
                if (leftConStyle != "") {
                    messageBoxWrapper.setAttribute("style", leftConStyle);
                }
            }

            function styleRight() {
                if (rightConStyle != "") {
                    messageBoxWrapper.setAttribute("style", rightConStyle);
                }
            }

            function styleBottom() {
                if (bottomConStyle != "") {
                    messageBoxWrapper.setAttribute("style", bottomConStyle);
                }
            }

            if (location == "left") {
                if (messageType == "error") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vLeft error le");
                } else if (messageType == "warning") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vLeft warning lw");
                } else if (messageType == "success") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vLeft success ls");
                }
                //styleLeft
                styleLeft();
            } else if (location == "right") {
                if (messageType == "error") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vRight error re");
                } else if (messageType == "warning") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vRight warning rw");
                } else if (messageType == "success") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vRight success rs");
                }
                //styleRight
                styleRight();
            } else if (location == "bottom") {
                if (messageType == "error") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vBottom error be");
                } else if (messageType == "warning") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vBottom warning bw");
                } else if (messageType == "success") {
                    messageBoxWrapper.setAttribute("class", "vMsgBox vBottom success bs");
                }
                //StyleBottom
                styleBottom();
            }

            if (messageType == "error") {
                if (paintWrapper) {
                    inputWrapper.classList.add("wError");
                }
            }

            messageBoxWrapper.innerHTML = message;
            inputWrapper.appendChild(messageBoxWrapper);

            //Log error
            errorLog[inputWrapper.getAttribute("data-fieldId")] = 1;

            if (location == "left") {
                var m = inputWrapper.querySelector(".vLeft");
                sendBehind(m, location, 15, customStyles);
            } else if (location == "right") {
                var m = inputWrapper.querySelector(".vRight");
                sendBehind(m, location, 15, customStyles);
            } else if (location == "bottom") {
                var m = inputWrapper.querySelector(".vBottom");
                var height = customStyles != null?customStyles[0] != undefined? customStyles[0]:null :null;
                drop(m, height);
            }
        }

        function updateMsgBox() {
            if (location == "left" || location == "right") {
                checkExistence.style["white-space"] = "nowrap";
                checkExistence.style["line-height"] = "250%";
                checkExistence.style["width"] = "auto";
                checkExistence.style["text-align"] = "left";
                checkExistence.style["height"] = "auto";
                checkExistence.style["min-height"] = $$.sm(checkExistence).cssStyle("height");
                if (customStyles != null) {
                    var m = null;
                    location == "left" ? m = inputWrapper.querySelector(".vLeft") : m = inputWrapper.querySelector(".vRight");;
                    if (customStyles[1] != null || customStyles[1] != undefined) {
                        var currentStyle = m.getAttribute("style");
                        m.setAttribute("style", currentStyle + customStyles[1]);
                    }
                }
            }
            checkExistence.innerHTML = message;
            //Log error
            errorLog[inputWrapper.getAttribute("data-fieldId")] = 1;
        }
        
        if (checkExistence == null) {
            createMsgBox();
        } else {
            if (((innerWidth < smallView)?"small":"large") != inputWrapper.getAttribute("data-vp")) {
                var currentMsg = inputWrapper.querySelector(".vMsgBox");
                inputWrapper.removeChild(currentMsg);
                createMsgBox();
            } else {
                updateMsgBox();
            }
        }
        if (messageType == "error") {
            inputWrapper.classList.add("lerror");
        }
    }

    function clearMessage(inputWrapper) {
        var location = "",
            fieldId = null;
        var Vbox = inputWrapper.querySelector(".vMsgBox");
        if (Vbox != null) {
            if (Vbox.classList.contains("vRight")) {
                location = "right";
            } else if (Vbox.classList.contains("vLeft")) {
                location = "left";
            } else if (Vbox.classList.contains("vBottom")) {
                location = "bottom";
            }
            var checkExistence = inputWrapper.querySelector(".vMsgBox");
            if (checkExistence != null) {
                if (location == "left" || location == "right") {
                    if (checkExistence.classList.contains("vRight") || checkExistence.classList.contains("vLeft")) {
                        checkExistence.style["width"] = checkExistence.scrollWidth + "px";
                        checkExistence.scrollWidth;
                        checkExistence.classList.add("clear");
                        checkExistence.style["color"] = "transparent";
                        checkExistence.style["width"] = "0";

                        //Clear error log
                        fieldId = inputWrapper.getAttribute("data-fieldId");
                        delete errorLog[fieldId];
                    } else {
                        throw new Error("No left or right message found to clear, recheck 'clear()' method argument 2");
                    }
                } else if (location == "bottom") {
                    if (checkExistence.classList.contains("vBottom")) {
                        checkExistence.classList.add("clear");
                        checkExistence.scrollHeight;
                        checkExistence.style["color"] = "transparent";
                        checkExistence.style["height"] = "0";

                        //Clear error log
                        fieldId = inputWrapper.getAttribute("data-fieldId");
                        delete errorLog[fieldId];
                    }
                }
            }
            inputWrapper.classList.remove("lerror", "rerror", "berror", "wError");
        }
    }

    //Attach event handler
    function addEventhandler() {
        document.addEventListener("transitionend", function(e) {
            if (e.target.classList.contains("vMsgBox") && e.target.classList.contains("error") && e.target.classList.contains("clear") == false) {
                e.target.style["color"] = $$.sm(form).cssStyle("--error-color");
            } else if (e.target.classList.contains("vMsgBox") && e.target.classList.contains("warning") && e.target.classList.contains("clear") == false) {
                e.target.style["color"] = $$.sm(form).cssStyle("--warning-color");
            } else if (e.target.classList.contains("vMsgBox") && e.target.classList.contains("success") && e.target.classList.contains("clear") == false) {
                e.target.style["color"] =  $$.sm(form).cssStyle("--success-color");
            } else if (e.target.classList.contains("vMsgBox") && e.target.classList.contains("clear")) {
                var parent = e.target.parentNode;
                parent != null ? e.target.parentNode.removeChild(e.target) : null;
            }
        });
        document.addEventListener("focusin", function(e) {
            if (e.target.getAttribute("id") == "fbBtn") {
                if( e.target.getAttribute("data-rs") == "suc"){
                    if(successButtonAction == "close"){
                        if(modal != null) modal.close();
                        hideProgress();
                    }else{
                        location.assign(redirectTo);
                    }
                    
                }else{
                    hideProgress();
                }
            } 
            if (e.target.classList.contains("vItem")) self.message.clear(e.target);
        }, false);


        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("vItem")) self.message.clear(e.target);
        }, false);
    }

    function showProgress(){
         var overlay = form.querySelector(".vFormOverlay");
        overlay.classList.remove("vFormOverlayHide");
        overlay.classList.add("vFormOverlayShow");
        var oldVbox = $$.ss(".FbMsgBox");
       
        if(progressAnimationType == "default"){ 
            if (oldVbox != null) oldVbox.classList.add("vFormLoader");
            if(loaderLocation == "button"){
                var button = form.querySelector("."+submitButtonClass);
                if(button == null){
                    console.warn("No element matched with the specified class "+submitButtonClass + "for creating form loader");
                }else{
                    button.classList.add("initButtonLoader");
                    button.scrollHeight;
                    button.classList.add("vButtonLoader");
                }
            }
        }else{
            progressAnimationCallbacks.onSend(self);
        }
        
        if (oldVbox != null) {
            oldVbox.innerHTML = "";
            oldVbox.classList.remove("FbMsgBox");
        }
    }

    function hideProgress() {
        var loader = form.querySelector(".vFormOverlay");
        loader.classList.remove("vFormOverlayShow");
        loader.classList.add("vFormOverlayHide");
        if(progressAnimationType == "default"){
            if(loaderLocation == "button"){
                offButtonloader();
            }
        }else{
            progressAnimationCallbacks.onReceive(self);
        }
    }

    function offButtonloader(){
         var button = form.querySelector("."+submitButtonClass);
        if(button == null){
            console.warn("No element matched with the specified class ". submitButtonClass);
        }else{
            button.classList.remove("vButtonLoader");
            button.scrollHeight;
            setTimeout(function(){
                button.classList.remove("initButtonLoader");
            },300);
        }
    }

    function InIError(methodName) {
        throw new Error("To use the '" + methodName + "()' method, initialization must be done. Initialize using the 'initialize()' method");
    }

    //create style styleSheet
    async function setStyleSheet() {
        //link module css sheet

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

        //Attach custom style
        if ($$.ss("style[data-id='formValidatorStyles']") == null) {
            var css = "";
            if (progressAnimationType == "default") {
                progressIndicatorStyle != null ? css += " .vFormLoader::before {" + progressIndicatorStyle + "}" : null;
            }
            attachStyleSheet("formValidatorStyles", css)
        }
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
        if (customStyles != null) {
            if (customStyles[1] != null || customStyles[1] != undefined) {
                var currentStyle = element.getAttribute("style");
                element.setAttribute("style", currentStyle + customStyles[1]);
            }
        }

        // element.scrollWidth;
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

    function createLoader() {
        var overLay = $$.ce("DIV");
        overLay.classList.add("vFormOverlay");
        if(overlayStyle != "") overLay.style = overlayStyle;

        if(progressAnimationType == "default"){
            if(loaderLocation == "form"){
                var loader = $$.ce("DIV");
                loader.classList.add("vFormLoader");
                $$.sm(loader).center();
                overLay.appendChild(loader);
            }
        }
        
        
        form.appendChild(overLay);
    }

    function createFeedBack(messageType, msgTxt, labels) {
        labels = labels == null ?{}:labels;
        var hasStyle = Object.keys(feedbackModalStyles).length > 0? true:false;
        var hasLabel = Object.keys(labels).length > 0? true:false;
        var ui = null;
        if (messageType == "error") {
            ui = ["terr", "merr"];
        } else if (messageType == "warning") {
            ui = ["twrn", "mwrn"];
        } else if (messageType == "success") {
            ui = ["tsuc", "msuc"];
        }else{
            ui = ["tsuc", "msuc"];
        }

        var con = $$.ce("DIV");
        var ttl = $$.ce("DIV");
        var msg = $$.ce("DIV");
        var btCon = $$.ce("DIV");
        var btn = $$.ce("BUTTON");

        
        con.classList.add("FbMsgBox");
        ttl.setAttribute("class", "ttl " + ui[0]);
        msg.setAttribute("class", "msgCon " + ui[1]);
        btCon.classList.add("buttonCon");
        btn.setAttribute("id", "fbBtn");

        //Add styles
        if(hasStyle){
            if(messageType == "success"){
                if(feedbackModalStyles["success"] != undefined){//success styles
                    if(feedbackModalStyles["success"]["title"] != undefined){//style title
                        ttl.style = feedbackModalStyles["success"]["title"];
                    }
                    if(feedbackModalStyles["success"]["container"] != undefined){//style container
                        $$.sm(con).center(feedbackModalStyles["success"]["container"]);
                    }else{
                        $$.sm(con).center();
                    }
                    if(feedbackModalStyles["success"]["button"] != undefined){//style button
                        btn.style = feedbackModalStyles["success"]["button"];
                    }
                    if(feedbackModalStyles["success"]["body"] != undefined){//style body
                        msg.style = feedbackModalStyles["success"]["body"];
                    }
                }else{
                    $$.sm(con).center();
                }
            }else if(messageType == "error"){
                if(feedbackModalStyles["error"] != undefined){//error styles
                    if(feedbackModalStyles["error"]["title"] != undefined){//style title
                        ttl.style = feedbackModalStyles["error"]["title"];
                    }
                    if(feedbackModalStyles["error"]["container"] != undefined){//style container
                        $$.sm(con).center(feedbackModalStyles["error"]["container"]);
                    }else{
                        $$.sm(con).center();
                    }
                    if(feedbackModalStyles["error"]["button"] != undefined){//style button
                        btn.style = feedbackModalStyles["error"]["button"];
                    }
                    if(feedbackModalStyles["error"]["body"] != undefined){//style body
                        msg.style = feedbackModalStyles["error"]["body"];
                    }
                }else{
                    $$.sm(con).center();
                }
            }else if(messageType == "warning"){
                if(feedbackModalStyles["warning"] != undefined){//warning styles
                    if(feedbackModalStyles["warning"]["title"] != undefined){//style title
                        ttl.style = feedbackModalStyles["warning"]["title"];
                    }
                    if(feedbackModalStyles["warning"]["container"] != undefined){//style container
                        $$.sm(con).center(feedbackModalStyles["warning"]["container"]);
                    }else{
                        $$.sm(con).center();
                    }
                    if(feedbackModalStyles["warning"]["button"] != undefined){//style button
                        btn.style = feedbackModalStyles["warning"]["button"];
                    }
                    if(feedbackModalStyles["warning"]["body"] != undefined){//style body
                        msg.style = feedbackModalStyles["warning"]["body"];
                    }
                }
            }else{
                $$.sm(con).center();
            } 
        }else{
            $$.sm(con).center();
        }
       
        //set labels
        if(hasLabel){
            if(labels["title"] != undefined){
                ttl.innerHTML = labels["title"];
            }
            if(labels["buttonLabel"] != undefined){
                btn.innerHTML = labels["buttonLabel"];
            }
        }else{
            if (ui[0] == "terr") {
                btn.innerHTML = "Try again";
            } else {
                btn.innerHTML = "Ok";
            }
            ttl.innerHTML = "Submission Feedback";
        }

        
        msg.innerHTML = msgTxt;

        if (ui[0] == "terr") {
            btn.setAttribute("data-rs", "err");
        } else {
            btn.setAttribute("data-rs", "suc");
        }
        btCon.appendChild(btn);
        con.appendChild(ttl);
        con.appendChild(msg);
        con.appendChild(btCon);
        return con;
    }

    function showFeedback(url, msg, type, labels) {
        var oldVbox = $$.ss(".FbMsgBox");
        if(oldVbox != null)oldVbox.parentNode.removeChild(oldVbox);

        //show default 
        var overlay = form.querySelector(".vFormOverlay");

        // var loader = form.querySelector(".vFormLoader");
        // loader != null ? overlay.removeChild(loader) : null;
        
        msg == null ? overlay.appendChild(createFeedBack("success", "Form submitted successfully", labels)) : overlay.appendChild(createFeedBack(type, msg, labels));

        if(progressAnimationType == "default"){
            if(loaderLocation == "button"){
                offButtonloader();
            }
        }
    }

    function getVal(rulesInUse, key) {
        return rulesInUse[key] == 1 ? "" : ":" + rulesInUse[key];
    }

    /*Message*/
    this.message = {
        write: function(inputField, messageType, location, message, customStyles = null) {
            //(optional) customStyles: A valid CSS styles for bottom or right or left messageBox
            if (initialized == true) {
                var inputType = { val: null };
                var smallView = inputField.getAttribute(smallViewAttribute);
                smallView = smallView != undefined?parseInt(smallView):866;
                validateInputElement(inputField, inputType, "Obj.message()");
                if(customStyles != null) validateArray(customStyles, "message.write() method argument 5 must be an array of string '[a, b]', which holds a valid CSS styles for bottom or right or left messageBox");
                var xField = inputField;
                hideProgress();
                inputField = inputType.val == "single" ? inputField : inputField[0];
                var inputWrapper = getInputWrapper(inputField);
                inputWrapper.style.position = "relative";

                var paintWrapper = false;
                if (inputField.getAttribute("type") != "radio" && inputField.getAttribute("type") != "checkbox") {
                    paintWrapper = true;
                }

                if (inputType.val == "single") {
                    if (!xField.classList.contains("vItem")) {
                        xField.classList.add("vItem");
                    }
                } else {
                    if (!xField[0].classList.contains("vItem")) {
                        for (var x = 0; x < xField.length; x++) {
                            xField[x].classList.add("vItem");
                        }
                    }
                }
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
                createMessageCon(inputWrapper, messageType, location, message, customStyles, paintWrapper, smallView);
            } else {
                InIError("write");
            }
        },
        clear: function(inputField) {
            if (initialized == true) {
                validateElement(inputField, "'write' method needs a valid HTML element as argument 1");
                var inputWrapper = getInputWrapper(inputField);
                clearMessage(inputWrapper);
            } else {
                InIError("clear");
            }
        }
    }
    /**********/

    /*Initialize*/
    this.initialize = function() {
        if (initialized == false) {
            if (form == null) throw new Error("Cannot initialize without settinig a form to perform validation on, pass target form to FormValidator() contructor, to set target form");
            if(progressAnimationType == "custom" && progressAnimationCallbacks == null){
                throw new Error("Progress animation type is set to 'custom' and no handler is defined for it. Define a handler using the 'config.progressAnimationCallbacks' property");

            }
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
    this.validate = function(inputField, rules, location, customStyles = null) {
        if (initialized == true) {
            var validNodes = ["INPUT", "TEXTAREA", "SELECT"];
            var inputType = {
                val: null
            };
            validateInputElement(inputField, inputType, "Obj.validate()");
            validateObjectLiteral(rules, "'Obj.validate()' method argument 2 is expected to be Object literal");
            validateString(location, "'Obj.validate()' method argument 4 expects a string");
            if(customStyles != null) validateArray(customStyles, "validate() method argument 5 must be an array of string '[a, b]', which holds a valid CSS styles for bottom or right or left messageBox");
            if(validNodes.indexOf(inputField.nodeName) == -1){
                console.warn(inputField, "The above element is not an input element");
            }
            var rulesInUse = {};
            var parseRules = Object.keys(rules);
            var totalRules = parseRules.length;

            //build available contraints
            for (var x = 0; x < totalRules; x++) {
                //check for sub value
                var check = parseRules[x].split(":");
                var sub = check.length == 2 ? "sub" : null;
                checkRule(check, rulesInUse, sub, rules);
            }

            var xField = inputField; //Needed to check HTML Collection
            inputField = inputType.val == "single" ? inputField : inputField[0];
            var inputWrapper = getInputWrapper(inputField);

            if (rulesInUse["required"] != undefined) {
                var keyVal = getVal(rulesInUse, "required");
                if (!checkRequired(xField, inputType.val)) {
                    var matchMessage = getMessageDetails(rules["required" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["trim"] != undefined) {
                inputField.value = inputField.value.trim();
            }
            if (rulesInUse["minLength"] != undefined) {
                var keyVal = getVal(rulesInUse, "minLength");
                if (!minimumLength(inputField, keyVal.replace(":",""))) {
                    var matchMessage = getMessageDetails(rules["minLength" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper, customStyles)
                }
            }
            if (rulesInUse["maxLength"] != undefined) {
                var keyVal = getVal(rulesInUse, "maxLength");;
                if (!maximumLength(inputField, keyVal.replace(":",""))) {
                    var matchMessage = getMessageDetails(rules["maxLength" +keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["email"] != undefined) {
                var keyVal = getVal(rulesInUse, "email");
                if (!isEmailAddress(inputField, inputType.val)) {
                    var matchMessage = getMessageDetails(rules["email" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["alpha"] != undefined) {
                var keyVal = getVal(rulesInUse, "alpha");
                if (!isAlpha(inputField)) {
                    var matchMessage = getMessageDetails(rules["alpha" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["alphaNum"] != undefined) {
                var keyVal = getVal(rulesInUse, "alphaNum");
                if (!isAlphaNum(inputField)) {
                    var matchMessage = getMessageDetails(rules["alphaNum" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["integer"] != undefined) {
                var keyVal = getVal(rulesInUse, "integer");
                if (!isInteger(inputField)) {
                    var matchMessage = getMessageDetails(rules["integer" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper);
                }
            }
            if (rulesInUse["fullName"] != undefined) {
                var keyVal = getVal(rulesInUse, "fullName");
                var response = isFullName(inputField, keyVal.replace(":",""));
                if (typeof response == "number") {
                    if (rules["fullName"+ keyVal][response] != undefined) {
                        var matchMessage = getMessageDetails(rules["fullName" + keyVal][response]);
                        var messageType = matchMessage[0];
                        var messageBody = matchMessage[1];
                        self.message.write(inputField, messageType, location, messageBody, customStyles);
                        return;
                    }
                }else if (typeof response == "boolean") {
                    if (response == true) {
                        clearLastError(rules, keyVal, inputField, inputWrapper);
                    }
                }
            }
            if (rulesInUse["float"] != undefined) {
                var keyVal = getVal(rulesInUse, "float");
                if (!isFloat(inputField)) {
                    var matchMessage = getMessageDetails(rules["float" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["noSpace"] != undefined){
                var keyVal = getVal(rulesInUse, "noSpace");
                if (noSpace(inputField) != -1) {
                    var matchMessage = getMessageDetails(rules["noSpace" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody, customStyles);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper)
                }
            }
            if (rulesInUse["notIn"] != undefined) {
                var keyVal = getVal(rulesInUse, "notIn");
                if (!notIn(inputField, keyVal.replace(":",""))) {
                    var matchMessage = getMessageDetails(rules["notIn" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper, customStyles)
                }
            }
            if (rulesInUse["callBack"] != undefined) {
                var response = rulesInUse["callBack"][0](self); //index or true
                if (typeof response == "number") {
                    response = response < 1 ? 1 : response;
                    if (rulesInUse["callBack"][response] != undefined) {
                        var matchMessage = getMessageDetails(rulesInUse["callBack"][response]);
                        var messageType = matchMessage[0];
                        var messageBody = matchMessage[1];
                        self.message.write(inputField, messageType, location, messageBody, customStyles);
                        return;
                    }
                } else if (typeof response == "boolean") {
                    if (response == true) {
                        clearLastError(rules, "callBack", inputField, inputWrapper)
                    }
                }
            }
            if (rulesInUse["match"] != undefined) {
                var keyVal = getVal(rulesInUse, "match");
                if (!match(inputField, keyVal.replace(":",""))) {
                    var matchMessage = getMessageDetails(rules["match" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper, customStyles)
                }
            }
            if (rulesInUse["ext"] != undefined) {
                var keyVal = getVal(rulesInUse, "ext");
                if (!onlyExtensions(inputField, keyVal.replace(":",""))) {
                    var matchMessage = getMessageDetails(rules["ext" + keyVal]);
                    var messageType = matchMessage[0];
                    var messageBody = matchMessage[1];
                    self.message.write(inputField, messageType, location, messageBody);
                    return;
                } else {
                    clearLastError(rules, keyVal, inputField, inputWrapper, customStyles)
                }
            }
        } else {
            InIError("validate");
        }
    }
    /**********/

    /*Update CSRF Token*/ 
    this.updateCSRFToken = function(token){
        if(CSRFTokenElement == null) throw new Error("No CSRFToken Element specified for the form with the ID = '"+form.id+"'")
        validateString(token, "'Obj.updateCSRFToken(x)' method argument 1 expects a string");
        CSRFTokenElement.value = token;
    }
    /**********/

    this.logServerError = function(log){
        validateArray(log, "Obj.logServerError(x) argument 1 must be an array of server logs");
        /**
         * ZLightServerReturnData{
         *  status:true|false,
         *  msg:"string message from server",
         *  log: [log1, log2...] //exist when there is a validation error but not when return non validation error
         * } 
         */
        //log => [log1, log2...] => Zlight validator error response
        //log1 => {name:'nameOfinputField', message:'errorLogMessage', location:"messageLocation"}
        
        //loop and display all errors here, turn off loader first
        
        //hide loader
        hideProgress();

        //write errors
        log.forEach(function(ele){
            var inputField = form.querySelector("[name='"+ele.name+"']");
            if(inputField != null) self.message.write(inputField, "error", ele.location, ele.message);
        });
    }

    function checkRule(rule, saveRule, sub, definedRules) {
        if (sub == null) { //String and no sub
            if (supportedRules[rule[0]] != undefined) {
                rule[0] == "callBack"? saveRule[rule[0]] = definedRules[rule[0]] : saveRule[rule[0]] = 1;
            } else {
                throw new Error("This rule " + rule[0] + " is not supported");
            }
        } else if (sub != null) { //string and has sub
            var fullKey = rule.join(":");
            if (supportedRules[rule[0]] != undefined) {
                saveRule[rule[0]] = rule[1];
            } else {
                throw new Error("This rule " + fullKey + " is not supported");
            }
        }
    }

    function getMessageDetails(msg) {
        var ids = {
            e: "error",
            w: "warning",
            s: "success"
        }
        var msplit = msg.split(":-");   // Use the character combination ':-' to set message type, by default its error. Example:
                                        // E.g "e:- This is an error message", "s:- This is a success message"
                                        // E.g "w:- This is a warning message"
        if (msplit.length == 2) {
            var key = msplit[0].toLowerCase();
            if (ids[key] == undefined) { //Not Found
                return ["error", msplit[1]];
            } else { //found
                return [ids[key], msplit[1]];
            }
        } else {
            return ["error", msplit[0]];
        }
    }

    function checkRequired(inputField, inputType) {
        if (inputType == "single") {
            if (isTextField(inputField)) { //text field
                if (!textField(inputField)) {
                    return false;
                } else {
                    return true;
                }
            }else if (isCheckField(inputField)) { //check field
                if (!checkField(inputField)) {
                    return false;
                } else {
                    return true;
                }
            }else if (isFileField(inputField)) { //file field
                if (!fileField(inputField)) {
                    return false;
                } else {
                    return true;
                }
            }else if (isSelectField(inputField)) { //select field
                
                if (!selectField(inputField)) {
                    return false;
                } else {
                    return true;
                }
            }
        } else {
            var status = false;
            for (var x = 0; x < inputField.length; x++) {
                if (inputField[x].getAttribute("type") == "radio" || inputField[x].getAttribute("type") == "checkbox") {
                    if (inputField[x].checked) {
                        status = true;
                        break;
                    }
                }

            }
            return status;
        }

        function textField(x) {
            if (x.value.length < 1) {
                return false;
            } else {
                return true;
            }
        }

        function fileField(x) { 
            if (x.value != "") {
                return true;
            } else {
                return false;
            }
        }

        function selectField(x){
            var selectedOption = x.selectedOptions[0];
            var hasValueAttribute = selectedOption.getAttribute("value") != null?true:false;
            if((hasValueAttribute && selectedOption.getAttribute("value").length == 0)){
                return false;
            }else if(!hasValueAttribute && x.selectedIndex == 0){
                return false;
            }else{
                return true;
            }
        }
    }

    function minimumLength(inputField, min) {
        if (inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA") { //text field
            if (inputField.value.length < min) {
                return false;
            } else {
                return true;
            }
        }
    }

    function maximumLength(inputField, max) {
        if (inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA") { //text field
            if (inputField.value.length > max) {
                return false;
            } else {
                return true;
            }
        }
    }

    function notIn(inputField, list) {
        if (inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA" || inputField.getAttribute("type") == "password") { //text field
            var allList = list.split(" ");
            var total = allList.length;
            var value = inputField.value;
            var status = true;
            for (var x = 0; x < total; x++) {
                if (value.indexOf(allList[x]) != -1) {
                    status = false;
                    break;
                }
            }
            return status;
        }
    }

    function isTextField(inputField) {
        if (inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA" || inputField.getAttribute("type") == "password") { //text field
            return true;
        } else {
            return false;
        }
    }

    function isCheckField(inputField) {
        if (inputField.getAttribute("type") == "radio" || inputField.getAttribute("type") == "checkbox") { //check field
            return true;
        } else {
            return false;
        }
    }

    function isFileField(inputField) {
        if (inputField.getAttribute("type") == "file" ) { //file field
            return true;
        } else {
            return false;
        }
    }
    function isSelectField(inputField) {
        if (inputField.nodeName == "SELECT" ) { //Select field
            return true;
        } else {
            return false;
        }
    }

    function isEmailAddress(inputField, inputType) {
        if (inputType == "single") {
            if (inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA") {
                if (!validateEmailAddress(inputField.value)) {
                    return false;
                }
                return true;
            }
        }
    }

    function isAlpha(inputField) {
        return /^[A-Za-z ]+$/.test(inputField.value);
    }

    function isAlphaNum(inputField) {
        return /^[A-Za-z0-9 ]+$/.test(inputField.value);
    }

    function isInteger(inputField) {
        return /^[0-9]+$/.test(inputField.value);
    }

    function isFullName(inputField, maxNames){
        var totalNames = inputField.value.split(" ");
        var status = true;
        var totalNamesLength = totalNames.length;
        maxNames = maxNames < 2?2:maxNames;
        if (totalNamesLength < 2 ) {
            status = 0;
        }else if(totalNamesLength > maxNames){
            status = 1;
        }else{//check for length
            for (var x=0 ; x<totalNamesLength; x++){
                if(totalNames[x].length < 2){
                    status = 2;
                    break;
                }
            }
        }
        return status;
    }

    function isFloat(inputField) {
        return /^[0-9]+\.[0-9]+$/.test(inputField.value);
    }

    function noSpace(inputField){
        return inputField.value.search(" ");
    }
    function onlyExtensions(inputField, extensions){
        if (inputField.getAttribute("type") == "file") { //file field
            var allExtensions = extensions.split(" ");
            var fileNameParts = inputField.files[0].name.split(".");
            var extension = fileNameParts[fileNameParts.length-1];            
            var status = true;            
            if(allExtensions.indexOf(extension) == -1) status = false;
            return status;
        }
    }

    function clearLastError(rules, key, inputField, preferedWrapper) {
        if (rules[rules.length - 1] == key) {
            self.message.clear(inputField, preferedWrapper);
        }
    }

    function validateInputElement(inputField, flag, objName) {
        if (inputField instanceof Element) {
            flag.val = "single";
        } else {
            try {
                if (Object.getPrototypeOf(inputField).constructor.name == "NodeList") {
                    flag.val = "group";
                }
            } catch (error) {
                throw new Error("'" + objName + "' method argument 1 expects a valid HTML element or HTMLCollection");
            }
        }
    }

    function getInputWrapper(inputField) {
        var inputWrapper = null;
        if (wrapperClassAttribute != null) { //has prefered data atrribute set
            try {
                var attribValue = inputField.getAttribute(wrapperClassAttribute);
                if (attribValue != null) { //configured and set					
                    inputWrapper = $$.sm(inputField).getParent(attribValue);
                } else {
                    if(inputField.classList.contains("dField") || inputField.classList.contains("vDateIcon")){//for formValidator module support
                        inputWrapper = $$.sm(inputField).getParent(3);    
                    }else{
                       inputWrapper = inputField.parentNode; 
                    }
                }
            } catch (error) {
                inputWrapper = inputField.parentNode;
            }
        }else if(inputField.classList.contains("dField") || inputField.classList.contains("vDateIcon")){//for formValidator module support
            inputWrapper = $$.sm(inputField).getParent(3);    
        }else{ //use default
            inputWrapper = inputField.parentNode;
        }
        return inputWrapper;
    }

    function match(inputField, pattern){
        var inputValue = inputField.value;
        pattern = pattern.replace(/\//g, "");
        var regEx = new RegExp(pattern);
        return regEx.test(inputValue);
    }

    /*Form validation status*/
    this.formOk = function() {
        if (Object.keys(errorLog).length > 0) {
            //Reset error log
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
        showProgress();
        var formData = new FormData(parseForm);
        var xhr = $$.ajax({method:submissionMethod, url:url}, "json");
        if(data != null){ //Append additional data
            validateObjectLiteral(data, "'submit()' method argument 1 must be a literal object specifying additonal data to be appended");
            var keys = Object.keys(data);
            var totalRecords = keys.length;
            for(var x=0; x<totalRecords; x++ ){
                formData.append(keys[x], data[keys[x]]); 
            }
        }
        xhr.addEventListener("readystatechange", function() {
            if (xhr.readyState == 2) { //sent
                formSubmitted = true;
            } else if (xhr.readyState == 4) { //sent and received
                if (xhr.status == 200) {
                    if (controller != null) {
                            var status = controller(self, xhr.responseText);
                            if(status){//assumed the OK button is click on success when the controller returns true
                                if(successButtonAction == "close"){
                                    hideProgress();
                                }else if (successButtonAction == "redirect"){
                                    location.assign(redirectTo);
                                }
                            }
                            // else{
                            //     // hideProgress();
                            // }
                    } else {
                        self.showFeedback();
                    }
                }else if(xhr.status == 404){
                    self.showFeedback(null, "Not found", "error");
                }else if(xhr.status == 419){
                    self.showFeedback(null, "Expired, reload and try again", "error");
                }else if(xhr.status == 405){
                    self.showFeedback(null, "Method not allowed", "error");
                }else if(xhr.status == 500){
                    self.showFeedback(null, "Opps...., error from server", "error");
                }

                formSubmitted = false;
            }
        }, false);
        xhr.send(formData);
    }

    this.showFeedback = function(feedBackUrl = null, msg = null, type = null, labels=null) {
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
                validateObject(value, "'config.modal' property must be an object");
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
                var courceKeys = Object.keys(value);
                if(courceKeys.length > 2) throw new Error("config.progressAnimationCallbacks property object must have only two entries");
                if(courceKeys[0] != "onSend" && courceKeys[0] != "onReceive") throw new Error("config.progressAnimationCallbacks property object must have only these keys 'onSend' and 'onReceive'");
                if (typeof value.onSend != "function" && typeof value.onReceive != "function") throw new Error("config.progressAnimationCallbacks property object 'onSend' and 'onReceive' keys requires a function as value");
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
                if(supportedMethod[value] != undefined) submissionMethod = value; 
            }
        },
        loaderLocation:{
            set: function(value) {
                validateString(value, "config.loaderLocation property value expects a string");
                value = value.toLowerCase();
                if(value != "form" && value != "button") {
                    throw new Error("config.loaderLocation property value can either be 'form' or 'button'")                    
                }else{
                    if(submitButtonClass == "")throw new Error("You must specify the button class first, using config.submitButtonClass before selecting 'button' as loader location");
                    loaderLocation = value;
                }; 
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
                validateElement(value, "config.CSRFTokenName property value expects a DOM Element");
                CSRFTokenElement = value;
            }  
        },
        successButtonAction:{
            set: function(value) {
                validateString(value, "config.successButtonAction property value expects a string");
                value = value.toString();
                if(value != "redirect" && value != "close") throw new Error("config.successButtonAction property value must either be: 'redirect' or close");
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
                
                //validate object entries
                for (var x = 0; x < totalKeys; x++) {
                    if(types.indexOf(keys[x]) == -1){
                        throw new Error ("config.feedbackModalStyles property value expects an object of any of the keys: "+types.join(", ") +" The key: '"+keys[x]+"' is not one of them");
                    }else{
                        
                        validateObjectLiteral(value[keys[x]], "config.feedbackModalStyles property value object key: '"+ keys[x]+"' expect an object literal as value");

                        //validate sub keys

                        var subKeys = Object.keys(value[keys[x]]);
                        var subTotalKeys = subKeys.length;

                        if (subTotalKeys > 4 || subTotalKeys < 1) throw new Error ("config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect an object literal of max, 4 entries");

                        for (var y = 0; y < subTotalKeys; y++) {
                            if(styleKeys.indexOf(subKeys[y]) == -1){
                                throw new Error ("config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect an object literal of any of the keys: "+styleKeys.join(", "));
                            }else{
                                //validate value
                                validateString(value[keys[x]][subKeys[y]], "config.feedbackModalStyles property value object key: '"+ keys[x] +"' expect its object key: '"+ subKeys[y]+"' value to be a string");
                            }
                        }
                    }
                }

                feedbackModalStyles = value;
            }
        }
    });
    Object.defineProperties(this.message, {
        write: { writable: false }
    });
    Object.defineProperties(this, {
        config: { writable: false},
        format: { writable: false},
        validate: { writable: false},
        message: { writable: false},
        initialize: { writable: false},
        submit: { writable: false},
        formOk: { writable: false},
        showFeedback: { writable: false},
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
    currencyField: function(inputS, seperator) {
        validateNumber(inputS, "Numeric (Amount) value needed as argument 1, for 'currencyField()' method");
        if (validateString(seperator, "A string of lenght 1 (seperator) needed as argument 2, for 'currencyField()' method'")) {
            if (seperator.lenght > 2) {
                throw new Error("String lenght exceeded, string length must be <= 2, for 'currencyField' method' 2nd argument");
            }
        };
        var s = new String(inputS), StringLen = s.length,num = 0,start = 0,formatted = "",points = [],pointsRev = [],rc = 0;
        if (StringLen > 3) {
            while ((StringLen - 3) > 0) {
                StringLen = StringLen - 3;
                points[num] = StringLen;
                num++;
            }
            var res = s.split("");
            for (var c = points.length - 1; c >= 0; c--) {
                pointsRev[rc] = points[c];
                rc++;
            }
            for (var x = 0; x < res.length; x++) {
                if (x == pointsRev[start]) {
                    formatted = formatted + seperator + res[x];
                    start++;
                } else {
                    formatted = formatted + res[x];
                }
            }
            return formatted;
        } else {
            return s;
        }
    },
    roundToDec: function(value, decimals) {
        validateNumber(value, "'roundToDec' method argument 1 must be numeric value");
        validateNumber(decimals, "'roundToDec' method argument 2 must be numeric value");
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    },
    integerField: function(inputElement) {
        validateElement(inputElement, "'integerField()' argument must be a valid HTML Element");
        if (inputElement.getAttribute("type" != "text")) throw new Error("'integerField()' argument must be an INPUT element of type 'text'");
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
        if(n != 1){
           validateInteger(inputElement, "'wordSeperator(..x)' argument 3 must be an integer"); 
           n = n < 1 ? 1: n;
        }
              
        if (inputElement.getAttribute("type" != "text")) {
            throw new Error("'fullNameField()' argument must be an INPUT element of type 'text'");
        }
        
        document.addEventListener("focusout", function(e) {
            if(e.target == inputElement){
                var cleansed = "";
                var splitted = inputElement.value.split(" ");
                if (splitted.length > 1) {
                    for (var x = 0; x < splitted.length; x++) {
                        if (splitted[x] != "") {
                            if (x == 0) {
                                cleansed += splitted[x];
                            } else {
                                cleansed += seperator.repeat(n) + splitted[x];
                            }
                        }
                    }

                    //Update input value with cleansed name
                    inputElement.value = cleansed;
                }
            }
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