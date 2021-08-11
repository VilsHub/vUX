/*
 * vUX JavaScript library v4.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2021-07-19=T22:30Z
 */

"use strict";
var modules = ["cShapes","formValidator", "formComponents", "resizer", "modalDisplayer", "toolTip", "carousel", "contentLoader", "listScroller", "touchHandler", "timeLineList", "autoWriter"];
var assetURL = "";
var temp = null;
var path = null;
var mainScript = document.querySelector("script[src *='vUX']");

var host = location.protocol+"//"+location.host;
temp = mainScript.getAttribute("src");
var minified = temp.search("min") == -1?"":".min";
path = temp.replace(host, "").split("/");
path.pop();
var moduleList = mainScript.getAttribute("data-modules");
path = path.join("/");
if(moduleList != null){
    var selectedModules = mainScript.getAttribute("data-modules").split(",");
}

var loaded = [];
var eventsReg = {};
var model = {
    core:{
        loaded:[],

    },
    slide:{
        eventsReg:{

        }
    }
}

//set asset path
assetURL = path+"/assets/";

window.addEventListener("load", function() {
    linkStyleSheet(assetURL + "css/core"+minified+".css");
    if(moduleList != null){
        //Load selected modules
        var total = selectedModules.length;
        for (var x = 0; x < total; x++) {
            var trimmedName = selectedModules[x].trim();
            //validate
            if (trimmedName == "") continue;
            if (modules.indexOf(trimmedName) == -1) throw new Error("The specified module is not supported. The available modules are: "+modules.join(", "));

            if(loaded.indexOf(trimmedName) == -1){
                if(trimmedName == "formComponents"){
                    loadModule("toolTip", false, null);
                    loadModule("listScroller", false, null);
                }else if(trimmedName == "carousel"){
                    loadModule("touchHandler", false, null);
                }
                if(x==total-1){
                    loadModule(trimmedName, false, loadDependencies);
                }else{
                    loadModule(trimmedName, false, null);
                }
            }
        }
    }else{
        console.warn("No module specified with the 'data-modules' attribute");
        loadDependencies();
    }
}, false);

function loadModule(name, last=null, callBack=null){
    loadScript(name, path+"/src/"+name+minified+".js", last, callBack);
    if(name != "cShapes"){
        linkStyleSheet(assetURL + "css/" + name+minified+".css", name);
    }
}

function loadDependencies(){
     //load depencies
     var depencies = $$.sa("[data-src]");
     depencies.forEach(function(e) {
         var src = e.getAttribute("data-src");
         loadScript("", src, true);       
     });
}

function linkStyleSheet(url, name=null) {
    var linkEle = $$.ce("link");
    linkEle.setAttribute("rel", "stylesheet");
    linkEle.setAttribute("type", "text/css");
    if(name != null) linkEle.setAttribute("data-id", name);
    linkEle.setAttribute("href", url);
    document.head.appendChild(linkEle);
}

function loadScript(name, url, last=false, callBack=null) {
    var scriptEle = $$.ce("script");
    scriptEle.setAttribute("src", url);
    scriptEle.onload = function(){
        loaded.push(name);
        if(callBack != null) callBack();
    }
    if(last){    
        document.body.appendChild(scriptEle);
    }else{
        document.head.appendChild(scriptEle);
    }
    
}

/*************************Helper functions***********************/
function cssGroupStyler(elementObj, StyleObject) {
    if(elementObj instanceof Element){
        runGroupStyler(elementObj, StyleObject);
    }else{
        var totalEles = elementObj.length;
        for (var x = 0; x < totalEles; x++) {
            runGroupStyler(elementObj[x], StyleObject);
        }
    }
}

function percentageToAngle(percentage, start){
	var angle = (percentage/100)*(2*Math.PI);
	if(start == 12){
		return angle - (0.5*Math.PI);
	}else if(start == 3){
		return angle;
	}else{
		return angle;
	}
};

function runGroupStyler(element, StyleObject){
    for (var property in StyleObject) {
        var cleanCSSProperty = camelToCSSstandard(property);
        element.style[cleanCSSProperty] = StyleObject[property];
    }
}

function camelToCSSstandard(cameledName) {
    return cameledName.replace(/[A-Z]/g, function (m){"-" + m.toLowerCase()});
}

function validateNumber(number, msg = null) {
    if (typeof number != "number") {
        if (msg != null) {
            throw new TypeError(msg);
        } else {
            throw new TypeError("Please provide a real number");
        }
    } else {
        return true;
    }
};

function validateString(string, msg = null) {
    if (typeof string != "string") {
        if (msg == null) {
            throw new TypeError("Please provide a string");
        } else {
            throw new TypeError(msg);
        }
    } else {
        return true;
    }
};

function matchString(string, stringsArr, msg = null) {
    if (stringsArr.indexOf(string) != -1) {
        return true;
    } else {
        if (msg == null) {
            throw new TypeError("Invalid string value specified");
        } else {
            throw new TypeError(msg);
        }
    }
}

function matchNumbers(number, NumbersArr, msg = null) {
    if (NumbersArr.indexOf(number) != -1) {
        return true;
    } else {
        if (msg == null) {
            throw new TypeError("Invalid number value specified");
        } else {
            throw new TypeError(msg);
        }
    }
}

function validateArray(array, msg = null) {
    if (!Array.isArray(array)) {
        if (msg != null) {
            throw new TypeError(msg);
        } else {
            throw new TypeError("Please provide an array");
        }
    }
};

function validateArrayLength(array, totalMember, msg = null) {
    if (array.length != totalMember) {
        if (msg != null) {
            throw new Error(msg);
        } else {
            throw new Error("Incomplete member error: " + totalMember + " member(s) needed");
        }
    }
}

function validateArrayMembers(array, type, msg = null) {
    switch (type) {
        case "string":
            for (var x = 0; x < array.length; x++) {
                if (typeof array[x] != "string") {
                    if (msg != null) {
                        throw new Error(msg);
                    }
                }
            }
            break;
        case "number":
            for (var x = 0; x < array.length; x++) {
                if (typeof array[x] != "number") {
                    if (msg != null) {
                        throw new Error(msg);
                    }
                }
            }
            break;
        case "HTMLObject":
            for (var x = 0; x < array.length; x++) {
                if (Object.getPrototypeOf(array[x]).constructor.name != "NodeList") {
                    if (msg != null) {
                        throw new Error(msg);
                    }
                }
            }
            break;
        case "dimension":
            for (var x = 0; x < array.length; x++) {
                if (validateDimension(array[x], "bool") == false) {
                    if (msg != null) {
                        throw new Error(msg);
                    }
                }
            }
            break;
        case "HTMLElement":
            for (var x = 0; x < array.length; x++) {
                if (validateElement(array[x], "bool") == false) {
                    if (msg != null) {
                        throw new Error(msg);
                    }
                }
            }
    }
}

function validateBoolean(boolean, msg = null) {
    if (typeof boolean != "boolean") {
        if (msg != null) {
            throw new TypeError(msg);
        } else {
            throw new TypeError("A boolean needed");
        }
    } else {
        return true;
    }
};

function validateObjectMember(object, propery, msg = null) {
    if (object.hasOwnProperty(propery)) {
        return true;
    } else {
        var ObjArr = Object.keys(object);
        var AllProperties = ObjArr.toString();
        var rplc = AllProperties.replace(/,/g, ", ");
        if (msg != null) {
            throw new TypeError(msg + ", it should be any of the follwings : " + rplc);
        } else {
            throw new TypeError("Invlaid property specified, it should be any of the follwings : " + rplc);
        }
    }
}

function validateElement(element, msg = null) { //A single element
    if (element instanceof Element) {
        return true;
    } else {
        if (msg != null) {
            if (msg == "bool") {
                return false;
            } else {
                throw new TypeError(msg);
            }
        } else {
            throw new TypeError("Invalid data type : HTML Element must be provide");
        }
    }
}

function validateFunction(fn, msg = null) {
    if(typeof fn == "function") {
        return true;
    } else {
        if (msg == null) {
            throw new TypeError("Invalid assigned data : Please provide a function");
        } else {
            throw new TypeError(msg);
        }

    }
}

function validateHTMLObject(HTMLCollection) { //Group of elements
    if (Object.getPrototypeOf(HTMLCollection).constructor.name == "NodeList") {
        return true;
    } else {
        throw new TypeError("Invalid HTML Collection : HTML collection must be provide");
    }
}

function validateObjectLiteral(object, msg = null) {
    if (object.__proto__.isPrototypeOf(new Object()) == true) {
        return true;
    } else {
        if (msg != null) {
            throw new TypeError(msg);
        } else {
            throw new TypeError("Type error : literal object needed");
        }
    }
}

function validateObject(object, msg = null) {
    if (typeof object == "object") {
        return true;
    } else {
        if (msg != null) {
            throw new TypeError(msg);
        }
    }
}

function validateObjectMembers(object, ObjectBase) {
    var ObjArr = Object.keys(object);
    for (var x = 0; x < ObjArr.length; x++) {
        if (ObjectBase.hasOwnProperty(ObjArr[x])) {

        } else {
            var ObjBArr = Object.keys(ObjectBase);
            var AllProperties = ObjBArr.toString();
            var rplc = AllProperties.replace(/,/g, ", ");
            throw new TypeError("Invlaid property specified, it should be any of the following : " + rplc);
        }
    }
    return true;
}

function validateStringDigit(stringDigit) {
    if (/0-9/.test(stringDigit)) {
        return true;
    } else {
        return false;
    };
}

function validateDimension(dimension, msg = null) {
    var matched = 0;
    var units = [/[0-9\.]+px/, /[0-9\.]+%/, /[0-9\.]+pt/, /[0-9\.]+px/, /[0-9\.]+vh/, /[0-9\.]+vw/, /[0-9\.]+rem/, /[0-9\.]+em/];
    for (var x = 0; x < units.length; x++) {
        if (units[x].test(dimension)) {
            matched = 1;
            break;
        }
    }
    if (matched == 1) {
        return true;
    } else {
        if (msg == null) {
            throw new Error("Unrecognized dimension specified");
        } else {
            if (msg == "bool") {
                return false;
            } else {
                throw new Error(msg);
            }
        }
    }

}

function getDimensionOfHidden(element) {
    var height = 0,
        prePos = "",
        width = 0;
    prePos = $$.sm(element).cssStyle("position");
    element.style["position"] = "absolute";
    element.style["opacity"] = "0";
    element.style["display"] = "block";
    height = element.scrollHeight;
    width = element.scrollWidth;
    element.style["position"] = prePos;
    element.style["opacity"] = "1";
    element.style["display"] = "none";
    return {
        height: height,
        width: width
    };
};

function keyboardEventHanler(e) {
    var handled = false,
        type = 0;
    if (e.key !== undefined) {
        // Handle the event with KeyboardEvent.key and set handled true.
        var targetKeyPressed = e.key;
        handled = true;
        type = 1;

    } else if (e.keyIdentifier !== undefined) {
        // Handle the event with KeyboardEvent.keyIdentifier and set handled true.
        var targetKeyPressed = e.keyIdentifier;
        handled = true;
        type = 2;
    } else if (e.keyCode !== undefined) {
        // Handle the event with KeyboardEvent.keyCode and set handled true.
        var targetKeyPressed = e.keyCode;
        handled = true;
        type = 3;
    }
    return {
        type: type,
        handled: handled,
    }
}

function sanitizeInteger(value) {
    return value.replace(/[^0-9]+/g, "");
}

function minMaxInt(value, min, max) {
    if (value < max && value > min) {
        return value;
    } else if (value >= max) {
        return max;
    } else if (value <= min) {
        return min;
    }
}

function getDayName(year, month, day) {
    var date = year + "-" + month + "-" + day;
    var tempDate = new Date(date);
    var dayShortName = tempDate.toString().split(" ", 2)[0];
    var dayFullName = "";
    switch (dayShortName) {
        case "Sun":
            dayFullName = "Sunday";
            break;
        case "Mon":
            dayFullName = "Monday";
            break;
        case "Tue":
            dayFullName = "Tuesday";
            break;
        case "Wed":
            dayFullName = "Wednesday";
            break;
        case "Thu":
            dayFullName = "Thursday";
            break;
        case "Fri":
            dayFullName = "Friday";
            break;
        case "Sat":
            dayFullName = "Saturday";
            break;
            // default expression
    }

    return dayFullName;
}

function timeFraction(startTime, duration) {
    //startTime and Duration in milliseconds
    var timeFragment = (Date.now() - startTime) / duration;
    if (timeFragment > 1) {
        timeFragment = 1;
    }
    return timeFragment;
}

function attachStyleSheet(dataID, css) {
    var styleElement = $$.ce("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.setAttribute("data-id", dataID);
    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = css;
    } else {
        styleElement.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(styleElement);
}

function validateAlpha(input) {
    var target = /[^A-Za-z\ ]+/.test(input); //checks for other characters except A-Za-z and space
    if (target == true) {
        return false;
    } else {
        return true;
    }
}

function alphaNumeric(input) {
    var target = /[^A-Za-z0-9]+/.test(input); //checks for other characters except A-Za-z0-9
    if (target == true) {
        return false;
    } else {
        return true;
    }
}

function validateEmailAddress(input) {
    var email_filter = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{1,}$/.test(input); //matches email address pattern
    return email_filter;
}

function validateInteger(n) {
    return Number(n) === n && n % 1 === 0;
}

function validateFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

function validateFullName(value) {
    //Return values
    // 2=> incomplete names
    // 3=> All names must be alphabets
    // 4=> Name cannot be less than 2 characters

    var returnType = null,
        cleanedName = [],
        n = 0;
    var split = value.split(" ");
    //clean name
    var tn = split.length;
    if (tn >= 2) {
        //clean name
        for (var x = 0; x < tn; x++) {
            if (split[x] != " ") {
                cleanedName[cleanedName.length] = split[x];
            }
            if (x == tn - 1) {
                n = cleanedName.length;
            }
        }
        for (var x = 0; x < tn; x++) {
            //Check length
            if (split[x].length <= 1) {
                returnType = 4; //Name cannot be less than 2 characters
                break;
            }

            //Check for non alpha
            if (!validateAlpha(split[x])) {
                returnType = 3; //All names must be alphabets
                break;
            }

            if (x == tn - 1) {
                returnType = true; //All names are more than 2 characters
            }

        }
    } else {
        returnType = 2; //incomplete names
    }
    return returnType;
}

function validateSelectField(groupCollection) {
    var status = false;
    //check for any selected
    for (var x = 0; x < groupCollection.length; x++) {
        if (groupCollection[x].checked) {
            status == false ? status = true : null;
            break;
        }
    }
    return status;
}

function validatePhoneNumber() {
    var input_filter = /^(\+|[0-9])[0-9]+$/.test(input); //matches phone number pattern
    return input_filter;
}

function getCssStyle(ele, property, pEle=null){
    if (window.getComputedStyle){
        var styleHandler = getComputedStyle(ele, pEle);
    } else {
        var styleHandler = ele.currentStyle;
    }
    var propertyValue = styleHandler.getPropertyValue(property);
    if (propertyValue.length == 0) { //No computed value, try from style attribute
        propertyValue = ele.style[property];
    }
    return propertyValue;
}

function isPositioned(ele){
    var propertyValue = getCssStyle(ele, "position");
    return ["fixed", "relative", "absolute", "sticky"].indexOf(propertyValue) == -1?false:true;
}

function checkBrowser(id = null){
    var browserIds={
        "Safari-Edg": {id:"Safari-Edg", label:"Microsoft Edge", name:"edge"},
        "Chrome-Safari":{id:"Chrome-Safari", label:"Chrome or Chromium Based", name:"chrome"},
        "Mozilla-Trident": {id:"Mozilla-Trident", label:"Internet Explorer", name:"iexplorer"},
        "Gecko-Firefox":{id:"Gecko-Firefox", label:"Mozilla Firefox", name:"firefox"},
        "Safari-Opr":{id:"Safari-Opr", label:"Opera", name:"opera"},
        "UBrowser-Safari":{id:"UBrowser-Safari", label:"ucbrowser", name:"ucbrowser"},
        "Safari-main":{id:"Safari-main", label:"Safari", name:"safari"}
    }

    var idSegments = navigator.userAgent.split("/");
    var totalSegment = idSegments.length;
    var parentId = idSegments[totalSegment-3].split(" ");
    var parsedParentId = parentId[parentId.length-1].trim();
    var childId = idSegments[totalSegment-2].split(" ");
    var parsedChildId = childId[childId.length-1].trim();
    var browserId = parsedParentId+"-"+parsedChildId;
    
    if(id != null){
        switch (id) {
            case "edge":
                return browserIds["Safari-Edg"].id == browserId;
            case "chrome":
                return browserIds["Chrome-Safari"].id == browserId;
            case "iexplorer":
                return browserIds["Mozilla-Trident"].id == browserId;
            case "firefox":
                return browserIds["Gecko-Firefox"].id == browserId;
            case "safari":
                return browserIds["Safari-main"].id == browserId;
            case "ucbrowser":
                return browserIds["UBrowser-Safari"].id == browserId;
            case "opera":
                return browserIds["Safari-Opr"].id == browserId;
            default:
                return false
        }
    }else{
        return {id:browserIds[browserId].id, label:browserIds[browserId].label, name:browserIds[browserId].name};
    }
}

/*****************************Timing*****************************/
var timing = {
    //Linear easing
    linear: function(timeFrac) {
        //startTime and Duration in milliseconds
        var progress = timeFrac;
        return progress;
    },
    //Bow shooting easing
    bowShootingEaseIn: function(timeFrac) {
        //startTime and Duration in milliseconds
        var x = 1.5 //alterable
        var progress = Math.pow(timeFrac, 2) * ((x + 1) * timeFrac - x);
        return progress;
    },
    bowShootingEaseOut: function(timeFrac) {
        //startTime and Duration in milliseconds
        var x = 1.5 //alterable
        var progress = 1 - (Math.pow(1 - timeFrac, 2) * ((x + 1) * (1 - timeFrac) - x));
        return progress;
    },
    //Bounce
    bounceEaseIn: function(timeFrac) {
        for (var a = 0, b = 1; 1; a += b, b /= 2) {
            if (timeFrac >= (7 - 4 * a) / 11) {
                return -Math.pow((11 - 6 * a - 11 * timeFrac) / 4, 2) + Math.pow(b, 2);
            }
        }
    },
    bounceEaseOut: function(timeFrac) {
        for (var a = 0, b = 1; 1; a += b, b /= 2) {
            if (1 - timeFrac >= (7 - 4 * a) / 11) {
                return 1 - (-Math.pow((11 - 6 * a - 11 * (1 - timeFrac)) / 4, 2) + Math.pow(b, 2));
            }
        }
    },
    //swing
    swingEaseIn: function(timeFrac) {
        return 1 - Math.sin(Math.acos(timeFrac));
    },
    swingEaseOut: function(timeFrac) {
        return 1 - (1 - Math.sin(Math.acos(1 - timeFrac)));
    }
}
/****************************************************************/

/**********************Utility modules*********************/
var $$ = {
    ss: function(selector){ //Select single
        validateString(selector, "$$.ss(x) method argument 1 must be a string");
        return document.querySelector(selector);
    },
    sa: function(selector){ //Select All
        validateString(selector, "$$.sa(x) method argument 1 must be a string");
        return document.querySelectorAll(selector);
    },
    sav:function (selector, visibiltyType){ //Select All Visible
        validateString(selector, "$$.sav(x) method argument 1 must be a string");
        var allElements = document.querySelectorAll(selector);
        visibiltyType = visibiltyType.toLowerCase();
        var matchElements = [];
        var total = allElements.length;
        for (var x=0; x<total; x++){
            if(visibiltyType == "visible"){//all not set to none
                if ($$.sm(allElements[x]).cssStyle("display") != "none") matchElements.push(allElements[x]);
            }else if(visibiltyType == "hidden"){
                if ($$.sm(allElements[x]).cssStyle("display") == "none") matchElements.push(allElements[x]);
            }
        }
        return matchElements;
    },
    sm:function(selector){//select and manipulate
        if(!(selector instanceof Element) && typeof selector != "string"){
            throw new Error("$$.sm(x) method argument 1 must be either a string or HMTL Element")
        }

        function dom(){
            var self =this;
            var ele = (selector instanceof Element)?selector:{all:document.querySelectorAll(selector), single:document.querySelectorAll(selector)[0]};
            this.index = function() {
                var child = (selector instanceof Element)?selector:ele.single;
                var index = 0,
                    n = 0;
                while (child) {
                    child = child.previousElementSibling;
                    n++;
                }
                index = n++;
                return index;
            }
            this.cssStyle = function(property, pEle=null) {
                validateString(property, "$$.sm(.).cssStyle(x.) method argument 1 must be a string");
                if(pEle != null) validateString(pEle, "$$.sm(.).cssStyle(.x) method argument 2 must be a string or null");
                var cEle = (selector instanceof Element)?selector:ele.single;
                return getCssStyle(cEle, property, pEle);
            }
            this.centerY = function(otherStyles = null) {
                var cEle = (selector instanceof Element)?selector:ele.single;
                var positionType = getCssStyle(cEle, "position");
                var elementParent = cEle.parentNode;
                var support = getCssStyle(cEle, "transform");

                if(otherStyles != null){
                    //validate
                    validateString(otherStyles, "$$.sm().centerY(x) argument 1 must be a string");
                    cEle.style = otherStyles;
                }

                if (positionType != "static") { //Positioned element
                    if (support != undefined) { //Transform supported
                        //Centralize
                        cEle.style["top"] = "50%";
                        cEle.style["transform"] = "translateY(-50%)";
                    } else { //Transform not supported
                        function centerY() {
                            var parentHeight = elementParent.scrollHeight;
                            var elementHeight = ele[0].scrollHeight;
                            var top = (parentHeight - elementHeight) / 2;
                            ele[0].style["top"] = top + "px";
                        }
                        centerY();
                        window.addEventListener("resize", function() {
                            centerY();
                        }, false)
                    }
                } else { // static element
                    function centerY() {
                        var parentHeight = elementParent.scrollHeight;
                        var elementHeight = cEle.scrollHeight;
                        var marginTop = (parentHeight - elementHeight) / 2;
                        elementParent.style["padding-top"] = "1px";
                        cEle.style["margin-top"] = marginTop + "px";
                    }
                    centerY();
                    window.addEventListener("resize", function() {
                        centerY();
                    }, false);
                }
            }
            this.centerX = function(otherStyles = null) {
                var cEle = (selector instanceof Element)?selector:ele.single;
                var positionType = getCssStyle(cEle, "position");
                var elementParent = cEle.parentNode;
                var support = getCssStyle(cEle, "transform");

                if(otherStyles != null){
                    //validate
                    validateString(otherStyles, "$$.sm().centerX(x) argument 1 must be a string");
                    cEle.style = otherStyles;
                }

                if (positionType != "static") { //Positioned element
                    if (support != undefined) { //Transform supported
                        //Centralize
                        cEle.style["left"] = "50%";
                        cEle.style["transform"] = "translateX(-50%)";
                    } else { //Transform not supported
                        var parentWidth = elementParent.scrollWidth;
                        var elementWidth = cEle.scrollWidth;
                        var left = (parentWidth - elementWidth) / 2;
                        cEle.style["left"] = left + "px";
                    }
                } else { // static element
                    cEle.style["margin-left"] = "auto";
                    cEle.style["margin-right"] = "auto";
                }
            }
            this.center = function(otherStyles = null) {
                var cEle = (selector instanceof Element)?selector:ele.single;
            
                var positionType =  getCssStyle(cEle, "position");
                var elementParent = cEle.parentNode;
                var support = getCssStyle(cEle, "transform");

                if(otherStyles != null){
                    //validate
                    validateString(otherStyles, "$$.sm().center(x) argument 1 must be a string");
                    cEle.style = otherStyles;
                }
                
                if (positionType != "static") { //Positioned element
                    if (support != undefined) { //Transform supported
                        //Centralize
                        cEle.style["top"] = "50%";
                        cEle.style["left"] = "50%";
                        cEle.style["transform"] = "translateY(-50%) translateX(-50%)";
                    } else {
                        function center() {
                            var parentHeight = elementParent.scrollHeight;
                            var elementHeight = cEle.scrollHeight;
                            var top = (parentHeight - elementHeight) / 2;
                            var parentWidth = elementParent.scrollWidth;
                            var elementWidth = cEle.scrollWidth;
                            var left = (parentWidth - elementWidth) / 2;
                            cEle.style["left"] = left + "px";
                            cEle.style["top"] = top + "px";
                        }
                        center();
                        window.addEventListener("resize", function() {
                            center();
                        }, false);
                    }
                } else { // static element
                    cEle.style["margin-left"] = "auto";
                    cEle.style["margin-right"] = "auto";

                    function centerY() {
                        var parentHeight = elementParent.scrollHeight;
                        var elementHeight = cEle.scrollHeight;
                        var marginTop = (parentHeight - elementHeight) / 2;
                        elementParent.style["padding-top"] = "1px";
                        cEle.style["margin-top"] = marginTop + "px";
                    }
                    centerY();
                    window.addEventListener("resize", function() {
                        centerY();
                    }, false);
                }
            }
            this.hasParent = function(parentId, ntimes = null) {
                var status = false, n = 0;
                //parentId => class name , if not exist, then id name
                validateString(parentId, "$$.sm(.).hasParent(x.) method argument 1 must be a string");
                if (ntimes != null) validateInteger(ntimes, "$$.sm(.).hasParent(.x) method argument 2 must be an integer");
                var cEle = (selector instanceof Element)?selector:ele.single;
                if (document.querySelector("." + parentId) != null) { //Has class
                    while (cEle) {
                        if (cEle.nodeName == "BODY") break;
                        cEle = cEle.parentNode;
                        if (cEle != null) {
                            if (cEle.classList.contains(parentId)) {
                                status = true;
                                break;
                            }
                        }
                        if (ntimes != null) {
                            if (n == ntimes - 1) break;
                            n++;
                        }
                    }
                } else if (document.querySelector("#" + parentId) != null) { //Has id
                    while (cEle) {
                        if (cEle.nodeName == "BODY") break;
                        cEle = cEle.parentNode;
                        if (cEle != null) {
                            if (cEle.id == parentId) {
                                status = true;
                                break;
                            }
                        }
                        if (ntimes != null) {
                            if (n == ntimes - 1) break;
                            n++;
                        }
                    }
                }
                return status;
            },
            this.getParent = function(parentIDorLevel) {
                var type = null, foundElement = null;
                //parentIDorLevel => class name or DOM level
                var cEle = (selector instanceof Element)?selector:ele.single;

                if (typeof parentIDorLevel != "number" && typeof parentIDorLevel != "string") {
                    throw new Error("$$.m.getParent(x)  method argument 1 must either be a string or number");
                } else {
                    if (typeof parentIDorLevel == "number") {
                        type = "number";
                        
                    } else {
                        type = "string";
                    }
                }
                
                if (type == "string") {
                    var id = parentIDorLevel.replace(".", "");
                    while (cEle) {
                        cEle = cEle.parentNode;
                        if (cEle != null) {
                            if (cEle.classList.contains(id) || cEle.id == id) {
                                foundElement = cEle;
                                break;
                            }
                        }
                    }
                } else {
                    parentIDorLevel = parentIDorLevel < 0 ? 0 : parentIDorLevel;
                    for (var x = 0; x < parentIDorLevel; x++) {
                        cEle = cEle.parentNode;
                        if (cEle == null) {
                            foundElement = cEle;
                            break;
                        }
                        if (x == parentIDorLevel - 1) {
                            foundElement = cEle;
                        }
                    }
                }
                return foundElement;
            },
            this.hide = function (){
                var cEle = (selector instanceof Element)?selector:ele.all;
                cssGroupStyler(cEle, {display:"none"});
            },
            this.unHide = function (displayType=null){
                if(displayType != null) validateString(displayType, "$$.sm(.).unHide(x) method argument 1 must be a string");
                displayType = displayType==null?"block":displayType;
                var cEle = (selector instanceof Element)?selector:ele.all;
                cssGroupStyler(cEle, {display:displayType});
            },
            this.makeActive = function(className, parent=null){
                var cEle = (selector instanceof Element)?selector:ele.single;
                validateString(className, "$$.sm.makeActive(x.) method argument 1 must a string");
                if(parent != null) validateElement(parent, "$$.sm.makeActive(.x) method argument 2 must a valid HTML Element");
                var currentElements = (parent != null)?parent.querySelectorAll("."+className):document.querySelector("."+className);
                if (currentElements != null) {
                    var total = currentElements.length;
                    for (var x=0; x < total; x++ ){
                        currentElements[x].classList.remove(className, "cOff");
                        if(currentElements[x].nodeName == "BUTTON")  currentElements[x].removeAttribute("disabled");
                    }
                };
                cEle.classList.add(className, "cOff");
                if(cEle.nodeName == "BUTTON") cEle.setAttribute("disabled", true);
            
            },
            this.isPositioned = function(){
                var cEle = (selector instanceof Element)?selector:ele.single;
                return isPositioned(cEle);
            },
            this.addOverlay = function(overlayStyle=null){
                var cEle = (selector instanceof Element)?selector:ele.single;


                if(!isPositioned(cEle)) cEle.style["position"] = "relative";

                var overlayEle = $$.ce("div", {class:"mOverlay"});
                cEle.classList.add("xOverlay");
                cEle.appendChild(overlayEle)


                if(overlayStyle != null){
                    validateString(overlayStyle, "$$.sm().addOverlay(x) argument 1 must be a string");
                }
                    
            },
            this.filter =  function(type, value, options=null){
                    var supportedFilters = ["grayscale", "blur"];
                    var cEle = (selector instanceof Element)?selector:ele.single;
                    var prop = "", initProp="";
                    if(Array.isArray(type)){ // array
                        //value must be an array
                        prop = buildProperty(type, value);
                        if(options != null){
                            if(options.init != null){
                                initProp = buildProperty(type, options.init);
                            }
                        }
                    }else{// is string
                        prop = setValue(type, value);
                    }
                    function setValue(filterType, val){
                        switch (filterType) {
                            case 'grayscale':
                                return "grayscale("+val+")";
                            case 'blur':
                                return "blur("+val+")";
                            default:
                                break;
                        }
                    }
                    function checkSupport(t){
                        if(supportedFilters.indexOf(t.toLowerCase()) == -1){
                            throw new Error(t+" filter not supported, suported filters are: "+supportedFilters.join(", "));
                        }
                    }
                    function buildProperty(properties, values){
                        var total = properties.length;
                        var property = "";
                        for(var x=0; x<total; x++){
                            checkSupport(properties[x]);
                            property += " "+ setValue(properties[x], values[x]);
                        }
                        return property;
                    }
                    var defaultOptions = {
                        init : null,
                        duration:"200ms",
                        effect:"linear", 
                        callBack:null
                    }
                    if (options != null) {
                        //validate here
                        if (options.callBack != null) {
                            validateFunction(options.callBack, "obj.filter(..x) method argument 2 property 'callBack' must be a function");
                            defaultOptions.callBack = options.callBack;
                        }
                        defaultOptions.init = options.init;
                        defaultOptions.duration = options.duration;
                        
                        cEle.style["transition"] = "filter "+defaultOptions.duration+" "+defaultOptions.effect;
                        cEle.addEventListener("transitionend", function(e){
                            if(e.target.classList.contains("vFilter")){
                                e.target.style["filter"] = "none";
                                e.target.classList.remove("vFilter")
                            }
                        }, false) 
                        cEle.style["filter"] = initProp;
                        cEle.scrollHeight;
                    }
                    cEle.classList.add("vFilter");
                    
                    cEle.style["filter"] = prop;
                    if(defaultOptions.callBack != null){
                        $$.delay(parseInt(defaultOptions.duration), function(){
                            defaultOptions.callBack()
                        });
                    };
            }
            this.fill = function (backgroundImageValue){
                var element = (selector instanceof Element)?selector:ele.single;
                var textTags = ["SPAN", "P", "H1", "H2", "H3", "H4", "H5", "H6"];
                var elementNode = element.nodeName;
                if(textTags.indexOf(elementNode) != -1){// a text element
                    element.classList.add("xFill");
                }
                element.style["background-image"] = backgroundImageValue;
            }
            this.xScroll = function (){
                var element = (selector instanceof Element)?selector:ele.single;
                element.classList.add("xScroll");
            }
            this.slide =  function (direction, config){
                var element = (selector instanceof Element)?selector:ele.single;
                var directions = ["left", "right", "up", "down"];
                element.setAttribute("vDirection", direction);
                element.classList.add("vSlide");
                (function (){
                    if(!eventsReg["slide"]){
                        addEventListener("transitionend", function(e){
                            if(e.target.classList.contains("vSlide")){
                                var slideDirection = e.target.getAttribute("vDirection");
                                if(slideDirection == "down"){
                                    if(e.target.classList.contains("progOn")){
                                        slideOff(e.target, {height:"auto"});
                                    }
                                }else if(slideDirection == "up"){
                                    if(e.target.classList.contains("progOn")){
                                        e.target.style["display"] = "none";
                                    }
                                }
                            }
                        },false)
                        eventsReg["slide"] = true;
                    }
                })()
                function slideOn(e, objProp = null){
                    e.classList.add("progOn");
                    e.classList.remove("progOff");
                    e.classList.remove("done");
                    if(objProp != null){
                        var properties = Object.entries(objProp);
                        properties.forEach(function(element) {
                            e.style[element[0]] = element[1];
                        });
                    }
                    e.scrollHeight;
                }
                function slideOff(e, objProp = null){
                    e.classList.add("done");
                    e.classList.add("progOff");
                    e.classList.remove("progOn");
                    if(objProp != null){
                        var properties = Object.entries(objProp);
                        properties.forEach(function(element) {
                            e.style[element[0]] = element[1];
                        });
                    }
                }
                switch (direction) {
                    case 'down':
                        element.style["display"] = "block";
                        element.style["height"] = "0px";
                        var height = element.scrollHeight;
                        slideOn(element);
                        element.style["height"] = height+"px";
                        break;
                    case 'up':
                        var height= element.scrollHeight;
                        slideOn(element, {height:height+"px"});
                        element.style["height"] = "0px";
                        break;
                    default:
                        break;
                }
            }
        }
        return new dom();
    },
    ce:function(node, attributes = null){//create element
        validateString(node, "$$.ce(x.) method argument 1 must be a string");
        if (attributes != null) validateObjectLiteral(attributes, "$$.ce(.x) method argument 2 must be an object literal");
        
        var element = document.createElement(node);
        if(attributes != null){
            var allAttributes = Object.entries(attributes);
            allAttributes.forEach(attribute => {
                element.setAttribute(attribute[0], attribute[1]);
            });
        }
        return element;
    },
    animate:function(draw, value, duration, timingFn = "linear"){
        //draw =>  the function that handles the actual drawing, it must accept an argument, which would be used for the animation
        //draw(x) means, draw the value 'x' for duration using the the timing function
        //duration is in miliseconds
        validateFunction(draw, "'$$.animate()' method argument 1 must be a function");
        validateNumber(value, "'$$.animate()' method argument 2 must be numeric");
        if (value < 0) {
            throw new Error("'$$.animate()' method argument 2 must be greater than 0");
        }
        validateNumber(duration, "'$$.animate()' method argument 3 must be numeric");
        if (duration < 0) throw new Error("'$$.animate()' method argument 3 must be greater than 0");
        validateObjectMember(timing, timingFn, "'$$.animate()' method argument 4 value invalid ");


        var start = performance.now();
        requestAnimationFrame(function animate(time) {
            // timeFraction goes from 0 to 1
            var timeFrac = (time - start) / duration;
            if (timeFrac > 1) timeFrac = 1;

            // calculate the current animation state
            var progress = timing[timingFn](timeFrac);
            draw(progress * value); // draw it
            if (timeFrac < 1) {
                requestAnimationFrame(animate);
            }
        })
    },
    delay:function(duration, callBack = null, ){
        validateNumber(duration, "'$$.delay()' method argument 1 must be numeric");
        if (duration < 0) throw new Error("'$$.delay()' method argument 1 must be greater than 0");
        var start = performance.now();
        requestAnimationFrame(function animate(time) {
            // timeFraction goes from 0 to 1
            var timeFrac = (time - start) / duration;
            if (timeFrac > 1) timeFrac = 1;
            if (timeFrac < 1){
                requestAnimationFrame(animate);
            }else{
            if (callBack != null) callBack();
            }
        })
    },
    attachEventHandler: function(event, DomClass, fn) {
        var idType = null;
        validateString(event, "'$$.attachEventHandler()' argument 1 must be a string specifying the event type");
        if (typeof DomClass == "string") {//class name and class to exclude
            // string value = "include, exclude" | "include"
            idType = "single";
        } else if (Array.isArray(DomClass)) {// DOM list of elements
            validateArrayMembers(DomClass, "string", "'$$.attachEventHandler()' argument 2 must be an array of string(s)");
            idType = "multiple";
        } else {
            throw new Error("'$$.attachEventHandler()' argument 2 must be a string or array of string, specifying the class name of the element(s) o");
        }
        validateFunction(fn, "'$$.attachEventHandler()' argument 3 must be a function to be called on the trigger");

        document.addEventListener(event, function(e) {
            if (idType == "single") {
                var constraints = DomClass.split(",");
                if (e.target.classList != null) {
                    if (e.target.classList.contains(constraints[0])){
                        if(constraints[1] != undefined){
                            if (!e.target.classList.contains(constraints[1].trim())){
                                fn(e);
                            }
                        }else{
                            fn(e);
                        }
                        
                    }
                }
            } else {
                var total = DomClass.length;
                for (var x = 0; x < total; x++) {
                    if (e.target.classList.contains(DomClass[x])) {
                        fn(e, DomClass[x]);
                        break;
                    }
                }
            }
        }, false);
    },
    ajax: function(options=null, returnDataType=null){
        var xmlhttp = null;  

        if (window.XMLHttpRequest) {
            // code for modern browsers
            xmlhttp = new XMLHttpRequest();
        } else {
            // code for old IE browsers
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (options != null ){  
            validateObjectLiteral(options, "$$.ajax(x.) method argument 1, must be an object with 2 properties 'url' and 'method'");
            validateString(returnDataType, "$$.ajax(.x) method argument 2, must be a string");
            if (returnDataType != null ) returnDataType  = returnDataType.toLowerCase();
            var dataType = null;
            if(returnDataType == "xml"){
                dataType = "application/xml, text/xml, */*;";
            }else if(returnDataType == "json"){
                dataType = "application/json, text/javascript, */*;q=0.01";
            }else if(returnDataType == "html"){
                dataType = "text/html, */*;q=0.01";
            }else{
                dataType = "*/*";
            }
            xmlhttp.open(options.method, options.url, true);
            xmlhttp.setRequestHeader("Accept", dataType);
        }

        return xmlhttp;
    },
    clipboard:{
        copy:function(content){
            var tempInput = $$.ce("textarea");
            tempInput.appendChild(document.createTextNode(content));
            document.body.appendChild(tempInput);
            tempInput.select();
            var run = document.execCommand("copy");
            document.body.removeChild(tempInput);
            return run;
        },
        clear:function(){

        },
        paste:function(contianer){

        }
    },
    IO:{
        get: function(urls, fn){
            validateArray(urls, "$$.IO.get(x.) static method argument 1, must be an array");
            validateFunction(fn, "$$.IO.get(.x) static method argument 2, must be a function");
            var xhrs = [], xhrURLs = [], total = urls.length, data={}, done=0;
            for (var x = 0; x < total; x++) {
                xhrs[x] = $$.ajax();
                xhrURLs[x] = urls[x];
                if (x == total - 1) {
                    assignEventHandlers();
                }
            }
        
            function assignEventHandlers() {
                xhrs.forEach(function(itemContent, arrayIndex, targetArray) {
                    xhrs[arrayIndex].onload = function() { 
                        done++;
                        setData(arrayIndex, xhrs[arrayIndex].responseText);
                        var status = done == total ;
                        
                        fn(data, {status:status,progress:(done/total)*100});//return data, status and progress
                        if (status){     
                        xhrs = null;
                        xhrURLs= null;
                        };
                    };
                    if (arrayIndex == total - 1) {
                        get();
                    }
                })
            };
        
            function get() {
                xhrs.forEach(function(itemContent, arrayIndex, targetArray) {
                    xhrs[arrayIndex].open("GET", xhrURLs[arrayIndex], true);
                    if (arrayIndex == total - 1) {
                        fireGet();
                    }
                })
            }
        
            function setData(index, rData) {
                data[index] = rData;
            }
        
            function fireGet() {
                xhrs.forEach(function(itemContent, arrayIndex, targetArray) {
                    xhrs[arrayIndex].send();
                })
            }
        },
        save: function(data, options){
            validateObjectLiteral(urls, "IO.save(.x) static method argument 1, must be a literal object");
        
            var type = "";
            if(options.type.toLowerCase == "json"){
                type = "text/json";
            }else if(options.type.toLowerCase == "csv"){
                type = "text/csv";
            }else{
                type = "text/html";
            }
            var data = new Blob([urlOrData], {type:type})
            var url = window.URL.createObjectURL(data);
            var link = $$.ce("a");
            link.setAttribute("hidden", "");
            link.setAttribute("href", url);
            link.setAttribute("download", options.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        download: function(url, fn){
        
        },
        upload: function(){
        
        }
    },
    randomString:function(length = 8){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        if (length != 8) validateInteger(length, "$$.randomString(x) argument 1 must be an integer");
        var randomstring = '';
        for (var i=0; i<length; i++) {
            var rnum = this.randomInteger(0, chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    randomInteger:function(min, max){
        validateInteger(min, "$$.randomInteger(x.) argument 1 must be an integer");
        validateInteger(max, "$$.randomInteger(.x) argument 2 must be an integer");
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    scroll:{
        lock:function(){
            var lastPointY = scrollY;
            var lastPointX = scrollX;
            addEventListener("scroll", function(){
                // scrollTo(scrollX, lastPointY)
            },false)
        }
    },
    linkStyleSheet:function(url){
        linkStyleSheet(url);
    },
    browserType: function(name=null, callBack=null){
        var browserNames = ["opera", "firefox", "chrome", "safari", "iexplorer", "ucbrowser", "edge"];
        
        if(name !=null){
            name = name.toLowerCase();
            if(browserNames.indexOf(name) == -1){
                throw new Error("$$.browserType(x.) argument 1 (browser name) must either be null or any of the followings: "+ browserNames.join(", "));
            }
            if(callBack != null){
                validateFunction(callBack, "$$.browserType(.x) argument 2 must be either null or a callback");
            }
        }    

        if(name != null && callBack == null){ //check and return boolean
            return checkBrowser(name);
        }else if(name != null && callBack != null){ //check and call
            if(checkBrowser(name)){
                callBack();
            }
        }else{//return browser name
            return checkBrowser();
        }
    },
    vRhythm:{
        setHeight:function(targetElement, height) {
            validateNumber(height, "vRhythm.setHeight(.x) static method must be a number");
            validateElement(targetElement, "vRhythm.setHeight(x.) static method must be an HTML Object");
            var newHeight = window.innerHeight;
            var root = $$.ss("html");
            if (newHeight % height != 0) {
                while (newHeight % height != 0) {
                    newHeight++;
                }
                targetElement.style["height"] = newHeight + "px";
                var TotalHeight = root.scrollHeight;
                root.style["height"] = TotalHeight + "px";
            }
        },
        placeAtCenter:function(targetElement, height) {
                validateNumber(height);
                validateElement(targetElement);
                var transformValue = $$.sm(targetElement).cssStyle("transform");
                var split = transformValue.split(", ");
                var targetIndex = split[split.length - 1];
                var filteredValue = targetIndex.replace(")", "");
                filteredValue = Math.round(-1 * filteredValue);
                if (filteredValue % height != 0) {
                    while (filteredValue % height != 0) {
                        filteredValue--;
                    }
                    targetElement.style["transform"] = "matrix(1, 0, 0, 1, 0, -" + filteredValue + ")";
                }
        }
    }
}
/****************************************************************/

RegExp.parseChars = function (char){
    var characters = ["+", "[", "]","/",".", "^", "$"];
    var parserChars = "";
    Array.from(chars).forEach(function (element){
        if(characters.indexOf(element) != -1){
            parserChars += "\\"+element;
        }else{
            parserChars += element;
        }
    });

    return parserChars;
}
String.prototype.xTrim = function () {
    return this.replace(/^[\s\uFEFF\xA0\/]+|[\s\uFEFF\xA0\/]+$/g, '');
};

/************************ScreenBreakPoint************************/
function ScreenBreakPoint(breakPoints) {
    validateObjectLiteral(breakPoints);

    var screenMode = "";
    var baseBeakPoints = {
        largeStart: 1000, //large start point
        mediumStart: 600 //medium start point
    }
    validateObjectMembers(breakPoints, baseBeakPoints);

    if (validateNumber(breakPoints["largeStart"])) {
        baseBeakPoints.largeStart = breakPoints["largeStart"];
    }
    if (validateNumber(breakPoints["mediumStart"])) {
        baseBeakPoints.mediumStart = breakPoints["mediumStart"];
    }
    Object.defineProperties(this, {
        screen: {
            get: function() {
                if (innerWidth > baseBeakPoints["largeStart"]) {
                    return { mode: "large", actualSize: innerWidth };
                } else if (innerWidth >= baseBeakPoints["mediumStart"] && innerWidth < baseBeakPoints["largeStart"]) {
                    return { mode: "medium", actualSize: innerWidth };
                } else {
                    return { mode: "small", actualSize: innerWidth };
                }
            }
        }
    })
}
/****************************************************************/

/********************Vertical scroll handler*******************/
function VerticalScroll() {
    var iniSY = 0,
        state = { direction: "", change: 0 };
    window.addEventListener("scroll", function() {
        if (scrollY > iniSY) { //scrolled down
            state["change"] = scrollY - iniSY;
            state["direction"] = "down";
            iniSY = scrollY;
        } else {
            state["change"] = iniSY - scrollY;
            state["direction"] = "up";
            iniSY = scrollY;
        }
    }, false);
    Object.defineProperty(this, "query", {
        get: function() {
            return state;
        }
    });
}
VerticalScroll.query = function(totalHeight = null) {
    var TotalHeightBelow = totalHeight - window.innerHeight;
    var remainingHeightBelow = totalHeight - (scrollY + window.innerHeight);
    var state = "";
    if (scrollY == TotalHeightBelow || scrollY == TotalHeightBelow - 1) {
        state = "end";
    } else {
        state = "ON";
    }
    return {
        TotalHeightBelow: TotalHeightBelow,
        status: state,
        remainingHeightBelow: remainingHeightBelow
    }
}
/****************************************************************/


/*****************browserResizePropertyHandler*******************/
function BrowserResizeProperty() {
    var currentSize = window.innerWidth,alter = 0,mode = "null";
    window.addEventListener("resize", function() {
        if (window.innerWidth > currentSize) {
            var diff = window.innerWidth - currentSize;
            alter = diff;
            currentSize = window.innerWidth;
            mode = "expanded";
        } else {
            var diff = currentSize - window.innerWidth;
            alter = diff;
            currentSize = window.innerWidth;
            mode = "shrinked";
        }
    }, false);
    Object.defineProperties(this, {
        mode: {
            get: function() {
                return mode;
            }
        },
        change: {
            get: function() {
                return alter;
            }
        }
    })
}
/****************************************************************/













