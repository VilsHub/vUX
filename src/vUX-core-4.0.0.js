/*
 * vUX JavaScript library v4.0.0
 * https://github.com/VilsHub/vUX
 *
 *
 * Released under the MIT license
 * https://github.com/VilsHub/vUX/blob/master/LICENSE
 *
 * Date: 2021-07-19=T22:30Z
 */
import * as vUxHelpers from "./helpers.js"
for (let name in vUxHelpers) {
    window[name] = vUxHelpers[name];
}
/**********************Global modules*********************/
let $$ = {
    ss:function(selector){ //Select single
        validateString(selector, "$$.ss(x) method argument 1 must be a string");
        return document.querySelector(selector);
    },
    sa:function(selector){ //Select All
        validateString(selector, "$$.sa(x) method argument 1 must be a string");
        return document.querySelectorAll(selector);
    },
    sav:function (selector, visibiltyType){ //Select All Visible
        validateString(selector, "$$.sav(x.) method argument 1 must be a string");
        if (typeof visibiltyType != "string" || ["visible", "hidden"].indexOf(visibiltyType.toLowerCase()) == -1) throw new TypeError("$$.sav(.x) method argument 2 must be either 'visible' or 'hidden'");
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
            var self =this, ele;
            if(selector instanceof Element){
                ele = selector;
            }else{
                ele = {
                    all:document.querySelectorAll(selector), 
                    single:document.querySelectorAll(selector)[0]
                }
                validateElement(ele.single, "$$.sm(x) argument 1 must be an element or a string of CSS selector");
            }
 
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
                if (ntimes != null && !validateInteger(ntimes)) throw new TypeError("$$.sm(.).hasParent(.x) method argument 2 must be an integer");
                parentId = parentId.replace(/^[.#]/, ""); //".menu" and "#menu" mean "menu", as in getParent
                var cEle = (selector instanceof Element)?selector:ele.single;
                if(document.querySelector("." + parentId) != null) { //Has class
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
                }else if (document.querySelector("#" + parentId) != null) { //Has id
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
                    var id = parentIDorLevel.replace(/^[.#]/, ""); //a leading # used to be kept, so an id given as "#x" never matched
                    while (cEle) {
                        cEle = cEle.parentNode;
                        if (cEle != null) {
                            if (cEle.classList.contains(id) || cEle.id == id) {
                                foundElement = cEle;
                                break;
                            }
                            if(cEle.nodeName == "HTML"){
                                console.warn("Travesing finished!, and no parent found with class or id = '"+id+"'")
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
                        if(cEle.nodeName == "HTML"){
                            console.warn("Travesing finished!, and the specified dept level '"+parentIDorLevel+"' is higher above the DOM root (HTML)")
                            break;
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
                var currentElements = (parent != null)?parent.querySelectorAll("."+className):document.querySelectorAll("."+className); //a list either way: querySelector returned one element, whose missing length skipped the clearing loop
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
            this.addOverlay = function(position="last", id=null, overlayStyle=null){
                var cEle = (selector instanceof Element)?selector:ele.single;
                if(!isPositioned(cEle)) cEle.style["position"] = "relative";
                var overlayEle = $$.ce("div", {class:"mOverlay"});
                cEle.classList.add("xOverlay");

                if(overlayStyle != null && id != null){
                    validateString(overlayStyle, "$$.sm().addOverlay(x) argument 1 must be a string");
                    attachStyleSheet(id, overlayStyle);
                }
                position = position == "first" ? "first" : "last";
                
                if (position == "last"){
                    cEle.appendChild(overlayEle)
                }else{
                    cEle.insertBefore(overlayEle, cEle.childNodes[0]); 
                    
                    //ensure the rest of the siblings are positioned
                    let totalSiblings = cEle.childElementCount;
                    for (let i = 1; i < totalSiblings; i++) {
                        if(!isPositioned(cEle.children[i])) cEle.children[i].style["position"] = "relative";
                    }
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
                        checkSupport(type); //an unsupported name used to be ignored silently
                        prop = setValue(type, value);
                        if(options != null && options.init != null) initProp = setValue(type, options.init);
                    }
                    function setValue(filterType, val){
                        switch (filterType.toLowerCase()) {
                            case 'grayscale':
                                return "grayscale("+val+")";
                            case 'blur':
                                return "blur("+val+")";
                            default:
                                break;
                        }
                    }
                    function checkSupport(t){
                        validateString(t, "$$.sm(.).filter(x..) filter names must be strings");
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
                        if (options.duration != null) {
                            validateString(options.duration, "obj.filter(..x) method argument 3 property 'duration' must be a CSS time string, e.g. '300ms'");
                            defaultOptions.duration = options.duration;
                        } //left out, it keeps the 200ms default instead of writing an invalid transition
                        
                        cEle.style["transition"] = "filter "+defaultOptions.duration+" "+defaultOptions.effect;
                        //one-shot: when the pulse ends, clear the filter and take the transition and this listener off
                        //again. Both used to stay, so every later filter() on the element was transitioned and reset too.
                        var onEnd = function(e){
                            if(e.target != cEle || e.propertyName != "filter") return;
                            cEle.removeEventListener("transitionend", onEnd, false);
                            cEle.style["filter"] = "none";
                            cEle.style["transition"] = "";
                            cEle.classList.remove("vFilter");
                        };
                        cEle.addEventListener("transitionend", onEnd, false);
                        cEle.style["filter"] = initProp;
                        cEle.scrollHeight;
                    }
                    cEle.classList.add("vFilter");
                    
                    cEle.style["filter"] = prop;
                    if(defaultOptions.callBack != null){
                        //a timer, not $$.delay: $$.delay busy-waits and froze the page for the whole pulse
                        var d = String(defaultOptions.duration);
                        var ms = /ms$/i.test(d) ? parseFloat(d) : parseFloat(d) * 1000;
                        setTimeout(function(){
                            defaultOptions.callBack()
                        }, ms);
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
            this.scroll = {
                x:function (hideBar=false){
                    var element = (selector instanceof Element)?selector:ele.single;
                    element.classList.add("scroll", "x");
                    if(hideBar) element.classList.add("bar-hide"); //added separately: an empty class name made classList.add throw
                },
                y:function (hideBar=false){
                    var element = (selector instanceof Element)?selector:ele.single;
                    element.classList.add("scroll", "y");
                    if(hideBar) element.classList.add("bar-hide"); //added separately: an empty class name made classList.add throw
                },
                lock: function (axis=null) {
                    var element = (selector instanceof Element)?selector:ele.single;
                    if (axis != null) {
                        var temp = "$$.sroll.lock(x) argument 1 must be a string";
                        validateString(axis, temp);
                        axis = axis.toLowerCase();
                        if (axis != "x" && axis != "y") throw new Error(temp + " of either x or y");
                    }else{
                        axis = "y";
                    }
                    element.style["overflow-"+axis] = "hidden";
                },
                unlock: function (axis=null) {
                    var element = (selector instanceof Element)?selector:ele.single;
                    if (axis != null) {
                        var temp = "$$.sroll.unlock(x) argument 1 must be a string";
                        validateString(axis, temp);
                        axis = axis.toLowerCase();
                        if (axis != "x" && axis != "y") throw new Error(temp + " of either x or y");
                    }else{
                        axis = "y";
                    }
                    element.style["overflow-"+axis] = "auto";
                },
            } 
            this.slide = {
                toLeft:function(configs, callback=null){
                    var newSize=0;
                    vModel.slide.functions.validateConfigs(configs, "toLeft"); //throws as is: re-wrapping it doubled the "Error: " prefix
                    
                    var element = (selector instanceof Element)?selector:ele.single; 

                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
                    configs.use = configs.use == undefined? vModel.slide.data.effectConfigs.use : configs.use;
                    configs.positions = configs.positions == undefined? vModel.slide.data.effectConfigs.positions : configs.positions;
                    configs.dimensions = configs.dimensions == undefined? vModel.slide.data.effectConfigs.dimensions : configs.dimensions;
                    configs.positionProperty = configs.positionProperty == undefined? vModel.slide.data.effectConfigs.positionProperty : configs.positionProperty;
                    //after the defaults, so an omitted use gets the class of the default (dimension)
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    var speed = vModel.slide.functions.miliToSeconds(configs.speed);
                  
                    element.classList.add("vSlide", classes);
                    element.style["transition-timing-function"] = configs.timingFunction;
                    element.style["transition-duration"] = speed+"s";

                    if(configs.use == "dimension"){
                        element.style["display"] = "block";
                        if(configs.dimensions.x[1] == null){
                            element.style["width"] = "0px"
                        }else{
                            element.style["width"] = configs.dimensions.x[1]+"px";
                        }

                        vModel.slide.functions.slideOn(element);
                        newSize = configs.dimensions.x[1];
                    }else{
                        element.style["display"] = "block";
                        //jump to the start position, don't animate to it: an element that isn't there yet
                        //(just shown, or left elsewhere) would otherwise slide to x[0] and barely move
                        element.style["transition-property"] = "none";
                        
                        if(configs.positions.x[0] == null){
                            element.style[configs.positionProperty] = "0px"
                        }else{
                            element.style[configs.positionProperty] = configs.positions.x[0]+"px";
                        }

                        vModel.slide.functions.slideOn(element);
                        element.style["transition-property"] = "";
                        element.style[configs.positionProperty] = configs.positions.x[1]+"px";
                        newSize = configs.positions.x[1];
                    }   
            
                    var postCall =  setTimeout(function(){
                        if(callback != null){
                            callback(element, newSize);
                        }
                        clearTimeout(postCall);
                    }, configs.speed) 
                },
                toRight:function(configs, callback=null){
                    var newSize=0;
                    vModel.slide.functions.validateConfigs(configs, "toRight"); //throws, as toLeft does: it used to log and carry on
                    
                    var element = (selector instanceof Element)?selector:ele.single; 

                    //the same defaults as toLeft: toRight used to read configs.use, positions and dimensions as given
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
                    configs.use = configs.use == undefined? vModel.slide.data.effectConfigs.use : configs.use;
                    configs.positions = configs.positions == undefined? vModel.slide.data.effectConfigs.positions : configs.positions;
                    configs.dimensions = configs.dimensions == undefined? vModel.slide.data.effectConfigs.dimensions : configs.dimensions;
                    configs.positionProperty = configs.positionProperty == undefined? vModel.slide.data.effectConfigs.positionProperty : configs.positionProperty;
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    var speed = vModel.slide.functions.miliToSeconds(configs.speed);
                  
                    element.classList.add("vSlide", classes);
                    element.style["transition-timing-function"] = configs.timingFunction;
                    element.style["transition-duration"] = speed+"s";

                    if(configs.use == "dimension"){
                        element.style["display"] = "block";

                        if(configs.dimensions.x[0] == null){
                            element.style["width"] = "0px"
                        }else{
                            element.style["width"] = configs.dimensions.x[0]+"px";
                        }

                        vModel.slide.functions.slideOn(element);
                        
                        if(configs.dimensions.x[1] == null){
                            element.style["width"] = element.scrollWidth+"px"; //no end width: open to the content's width
                        }else{
                            element.style["width"] = configs.dimensions.x[1]+"px";
                        }

                        newSize = configs.dimensions.x[1];
                    }else{
                        element.style["display"] = "block";
                        element.style["transition-property"] = "none"; //jump to the start position, as in toLeft
                        element.style[configs.positionProperty] = configs.positions.x[0]+"px";

                        vModel.slide.functions.slideOn(element);

                        element.style["transition-property"] = "";
                        element.style[configs.positionProperty] = configs.positions.x[1]+"px";
                        newSize = configs.positions.x[1];
                    }  

                    var postCall =   setTimeout(function(){
                        if(callback != null){
                            callback(element, newSize);
                        }
                        clearTimeout(postCall);
                    }, configs.speed) 
                },
                toTop:function(configs, callback=null){
                    var newSize=0;
                    vModel.slide.functions.validateConfigs(configs, "toTop"); //throws, as toLeft does: it used to log and carry on
                    
                    var element = (selector instanceof Element)?selector:ele.single; 
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
                    //use and positions default as in toLeft/toRight (use was read as given, so leaving it out threw);
                    //dimensions do not, because toBottom without them opens to the content's height
                    configs.use = configs.use == undefined? vModel.slide.data.effectConfigs.use : configs.use;
                    configs.positions = configs.positions == undefined? vModel.slide.data.effectConfigs.positions : configs.positions;
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    var speed = vModel.slide.functions.miliToSeconds(configs.speed);
                  
                    element.classList.add("vSlide", classes);
                    element.style["transition-timing-function"] = configs.timingFunction;
                    element.style["transition-duration"] = speed+"s";
                    
                    if(configs.use == "dimension"){
                        var height= element.scrollHeight;
                        vModel.slide.functions.slideOn(element, {height:height+"px"});
                        element.style["height"] = "0px";
                    }else{
                        vModel.slide.functions.slideOn(element);
                        if(configs.positions.y[0] != null){
                            element.style["top"] = configs.positions.y[0]+"px";
                        }else{
                            element.style["top"] = "0px";
                        }
                    }

                    var postCall = setTimeout(function(){
                        if(callback != null){
                            callback(element, newSize);
                        }
                        clearTimeout(postCall);
                    }, configs.speed) 
                    
                },
                toBottom:function(configs, callback=null){
                    var newSize=0;
                    vModel.slide.functions.validateConfigs(configs, "toBottom"); //throws, as toLeft does: it used to log and carry on
                    
                    var element = (selector instanceof Element)?selector:ele.single;
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
                    //use and positions default as in toLeft/toRight (use was read as given, so leaving it out threw);
                    //dimensions do not, because toBottom without them opens to the content's height
                    configs.use = configs.use == undefined? vModel.slide.data.effectConfigs.use : configs.use;
                    configs.positions = configs.positions == undefined? vModel.slide.data.effectConfigs.positions : configs.positions;
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    var speed = vModel.slide.functions.miliToSeconds(configs.speed);
                  
                    element.classList.add("vSlide", classes);
                    element.style["transition-timing-function"] = configs.timingFunction;
                    element.style["transition-duration"] = speed+"s";
                    
                    if(configs.use == "dimension"){
                        //Set initial point
                        if(configs.dimensions != undefined){
                            if(configs.dimensions.y != undefined){
                                if(configs.dimensions.y[0] != null){
                                    element.style["height"] = configs.dimensions.y[0]+"px";
                                }else{
                                    element.style["height"] = "0px";
                                }
                            }else{
                                element.style["height"] = "0px";
                            }
                        }else{
                            element.style["height"] = "0px";
                        }

                        element.style["display"] = "block";

                        vModel.slide.functions.slideOn(element);
                        var height = element.scrollHeight;
                                    
                        if(configs.dimensions == undefined){
                            element.style["height"] = height+"px"
                            newSize = height;
                        }else{
                            if(configs.dimensions.y != undefined){
                                if(configs.dimensions.y[1] != undefined){
                                    element.style["height"] = configs.dimensions.y[1]+"px";
                                    newSize = configs.dimensions.y[1];
                                }else{
                                    element.style["height"] = height+"px"; //unitless, it was ignored and nothing opened
                                    newSize = height;
                                }
                            }else{
                                element.style["height"] = height+"px";
                                newSize = height;
                            }
                        }
                    }else{
                        element.style["display"] = "block";
                        element.style["top"] = configs.positions.y[0]+"px"; 
                        vModel.slide.functions.slideOn(element);
                        element.style["top"] = configs.positions.y[1]+"px";
                        newSize = configs.positions.y[1];
                    }
  
                    var postCall = setTimeout(function(){
                        vModel.slide.functions.slideOff(element, {height:"auto"});

                        if(callback != null){
                            callback(element, newSize);
                        }
                        
                        clearTimeout(postCall);
                    }, configs.speed) 
                }
            },      
            this.class = {
                add:function(className){
                    var cEles = (selector instanceof Element)?selector:ele.all;
                    if(cEles instanceof Element){
                        cEles.classList.add(className);
                    }else{
                        cEles.forEach(function(cEle){
                            cEle.classList.add(className);
                        });
                    }
                },
                remove:function(className){
                    var cEles = (selector instanceof Element)?selector:ele.all;
                    if(cEles instanceof Element){
                        cEles.classList.remove(className);
                    }else{
                        cEles.forEach(function(cEle){
                            cEle.classList.remove(className);
                        });
                    }
                },
                swap:function(swap){
                    var cEles = (selector instanceof Element)?selector:ele.all;
                    if(cEles instanceof Element){
                        if(cEles.classList.contains(swap[0])){
                            cEles.classList.remove(swap[0]);
                            cEles.classList.add(swap[1]);
                        }else{
                            cEles.classList.add(swap[0]);
                            cEles.classList.remove(swap[1]);
                        }
                    }else{
                        cEles.forEach(function(cEle){
                            if(cEle.classList.contains(swap[0])){
                                cEle.classList.remove(swap[0]);
                                cEle.classList.add(swap[1]);
                            }else{
                                cEle.classList.add(swap[0]);
                                cEle.classList.remove(swap[1]);
                            }
                        });
                    }
                },
                has:function(className){
                    var cEles = (selector instanceof Element)?selector:ele.single;
                    return cEles.classList.contains(className);
                },
                xSwap:function(option){
                    var cEles = (selector instanceof Element)?selector:ele.all;
                    var toRemove = option.remove;
                    var toAdd = option.add;
                    if(cEles instanceof Element){
                        cEles.classList.remove(toRemove);
                        cEles.classList.add(toAdd);
                    }else{
                        cEles.forEach(function(cEle){
                            cEle.classList.remove(toRemove);
                            cEle.classList.add(toAdd);
                        })
                    }
                }
            },
            this.flip = {
                card:function(option, currentSide=null){
                    var cEles = (selector instanceof Element)?selector:ele.single;
                    var parent = cEles.parentNode;
                    var state = Boolean(parent.getAttribute("initialized"));

                    if(!state){
                        parent.classList.add("flip-card-parent");
                        
                        //validate options
                        var temp = "$$.sm(.).flip.card(x) method object argument";
                        if (option.perspective != null){
                           validateString(option.perspective, " perspective property must be a string"); 
                        }else{
                            option.perspective = "900px";
                        } 
                        if (option.frontClass == null){
                            throw new Error(temp+" frontClass property must be specified");
                        }else{
                            if (option.frontClass != null) validateString(option.frontClass, " frontClass property must be a string");
                        }
                        if (option.backClass == null){
                            throw new Error(temp+" backClass property must be specified");
                        }else{
                            if (option.backClass != null) validateString(option.backClass, " backClass property must be a string");
                        }
                        if (option.axis == null){
                            throw new Error(temp+" axis property must be specified");
                        }else{
                            if (option.axis != null) validateString(option.axis, " axis property must be a string");
                            option.axis = option.axis.toLowerCase();
                            if (option.axis != "x" && option.axis != "y" && option.axis != "z"){
                                throw new Error(temp+" axis property value must be one of these: 'x', 'y' or 'z'");
                            }
                        }
                        if (option.speed != null){
                            validateString(option.speed, " speed property must be a string"); 
                        }
                        if (option.angle != null){
                            validateString(option.angle, " angle property must be a string"); 
                        }if (option.timingFunction != null){
                            validateString(option.timingFunction, " timingFunction property must be a string"); 
                        }

                        //Add perspective
                        parent.style["perspective"] = option.perspective;

                        //set direction
                        if (option.axis != null){
                            cEles.querySelector("."+option.frontClass).classList.add(option.axis);
                            cEles.querySelector("."+option.backClass).classList.add(option.axis);
                        }

                        //set default values


                        //flip effect
                        cEles.style["transition"] = vModel.flip.functions.effectValue(option.speed, option.timingFunction); 

                        // if parent is not position, position it
                        if (!isPositioned(parent)) parent.style["position"] = "relative";
                        
                        // Card
                        cEles.classList.add("vCard");

                        if (option.backClass != null) cEles.querySelector("."+option.backClass).classList.add("back", "flip-item");
                        if (option.frontClass != null) cEles.querySelector("."+option.frontClass).classList.add("front", "flip-item");

                        parent.setAttribute("initialized", "true");
                    }

                    if(cEles.classList.contains("flip")){
                        //flip = rotate to the 0deg
                        cEles.classList.remove("flip");
                        cEles.style["transform"] = vModel.flip.functions.flipValue(option.axis, "0deg");
                    }else{
                        //flip = rotate to the given angle
                        cEles.classList.add("flip");
                        cEles.style["transform"] = vModel.flip.functions.flipValue(option.axis, option.angle);
                    }

                    // Set proper z-index
                    if(currentSide != null){
                        validateString(currentSide, "$$.flip.card(.x) argument 2 must be a string or null");
                        var prev =  parent.querySelector(".flip-item.current-side")
                        if(prev != null) prev.classList.remove("current-side") //previous at the bottom
                        parent.querySelector("."+currentSide).classList.add("current-side") // current at the top

                    }
                }
            },
            this.animate = function(draw, value, animationOptions=null){
                //draw =>  the function that handles the actual drawing, it must accepts 2 an arguments, which would be used for the animation
                //draw(ele, x) means, draw the property of the element (ele) with the value 'x' for duration using the the timing function
                
                
                var cEle = (selector instanceof Element)?selector:ele.single;

                var animationId = vModel.animate.functions.elementTag(cEle);

                var options = {
                    duration:1000,//duration is in miliseconds
                    timingFunction:"linear",
                    startValue:null
                }
                
                if(animationOptions != null){
                    validateObjectLiteral(animationOptions, "'$$.animate()' method argument 3 must be an object or null");

                    if(animationOptions.duration != undefined){
                        validateNumber(animationOptions.duration, "'$$.animate()' method argument 3 object 'duration' property must be a number");
                        options.duration = animationOptions.duration < 0? 1000 : animationOptions.duration
                    }

                    if(animationOptions.timingFunction != undefined){
                        validateString(animationOptions.timingFunction, "'$$.animate()' method argument 3 object 'timingFunction' property  must be a string");
                        var validFns = Object.keys(timing);
                        if(validFns.indexOf(animationOptions.timingFunction) == -1) throw new Error ("'$$.animate()' method argument 3 object 'timingFunction' property must be one of the followings: "+ validFns.join(","))
                        options.timingFunction = animationOptions.timingFunction
                    }

                    if(animationOptions.startValue != undefined){
                        validateNumber(animationOptions.startValue, "'$$.animate()' method argument 3 object 'startValue' property must be a number");
                        options.startValue = animationOptions.startValue;
                    }
                }

                validateFunction(draw, "'$$.animate()' method argument 1 must be a function");
                validateNumber(value, "'$$.animate()' method argument 2 must be numeric");

                options.startValue = vModel.animate.data.startValue[animationId] != null? vModel.animate.data.startValue[animationId]:options.startValue;
                var start = performance.now();

                requestAnimationFrame(function animate(time) {
                    
                    // timeFraction goes from 0 to 1
                    var timeFrac = (time - start) / options.duration;
                    if (timeFrac > 1) timeFrac = 1;
                    //the first frame's timestamp can be earlier than performance.now() taken above, which
                    //made the first value fall below the start value
                    if (timeFrac < 0) timeFrac = 0;
        
                    // calculate the current animation state
                    var progress = timing[options.timingFunction](timeFrac);
                    var nextValue = options.startValue + (progress * value);

                    vModel.animate.data.startValue[animationId] = nextValue;

                    draw(cEle, nextValue); // draw it
                    
                    if (timeFrac < 1) requestAnimationFrame(animate);

                })
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
    delay:function(duration, callback = null){
        //duration is in miliseconds
        validateNumber(duration, "'$$.delay(x.)' method argument 1 must be numeric");
        if (callback != null) validateFunction(callback, "'$$.delay(.x)' method argument 2 must be a function or null");
        if (duration < 0) throw new Error("'$$.delay(x.)' method argument 1 must be greater than 0");
        let startTime = new Date();
        let done = false;
        while (!done){
            if(((new Date()) - startTime) >= duration){
                done = true;
                if (callback != null) callback();
            }
        }
    },
    attachEventHandler:function(event, DomClass, fn) {
        var idType = null;
        validateString(event, "'$$.attachEventHandler(x..)' argument 1 must be a string specifying the event type");

        if (typeof DomClass == "string") {//class name and class to exclude
            // string value = "include, exclude" | "include"
            idType = "single";
        } else if (Array.isArray(DomClass)) {// DOM list of elements classes
            validateArrayMembers(DomClass, "string", "'$$.attachEventHandler()' argument 2 must be an array of string(s)");
            idType = "multiple";
        } else {
            throw new Error("'$$.attachEventHandler()' argument 2 must be a string or array of string, specifying the class name of the element(s) o");
        }

        validateFunction(fn, "'$$.attachEventHandler(..x)' argument 3 must be a function to be called on the trigger");
        var eventComponents = event.split(":");

        var listener = function(e) {
            if (idType == "single") {
                var constraints = DomClass.split(",");
                if (e.target.classList != null) {
                    if (e.target.classList.contains(constraints[0])){

                        if(constraints[1] != undefined){
                            if (!e.target.classList.contains(constraints[1].trim())){
                                if(eventComponents.length == 1){
                                    fn(e);
                                }else{
                                    try {
                                        checkAndExecute(e, eventComponents, fn);
                                    } catch (error) {
                                        console.error(error);
                                    }
                                }
                            }
                        }else{
                            if(eventComponents.length == 1){
                                fn(e);
                            }else{
                                try {
                                    checkAndExecute(e, eventComponents, fn);
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                        
                    }
                }
            } else {
                var total = DomClass.length;
                for (var x = 0; x < total; x++) {
                    if(e.target.classList != undefined){
                        if (e.target.classList.contains(DomClass[x])) {
                            fn(e, DomClass[x]);
                            break;
                        }
                    }
                   
                }
            }
        };

        addEventListener(eventComponents[0], listener, false);

        //Returned so that a component can detach the delegated listener again in its destroy().
        //Older callers that ignore the return value keep working unchanged.
        return {
            detach: function(){
                removeEventListener(eventComponents[0], listener, false);
            }
        };
    },
    ajax:function(options=null, returnDataType=null){
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
            if (returnDataType != null) validateString(returnDataType, "$$.ajax(.x) method argument 2, must be a string or null"); //optional: left out, Accept is */*
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
            //rewritten: it validated and saved variables that did not exist (urls, urlOrData), so every call threw
            validateObjectLiteral(options, "$$.IO.save(.x) static method argument 2, must be a literal object with a 'name' and an optional 'type'");
            validateString(options.name, "$$.IO.save(.x) static method argument 2 object 'name' property must be a string");
            var kind = options.type == undefined ? "html" : String(options.type).toLowerCase();
        
            var type = "";
            if(kind == "json"){
                type = "application/json";
                if(typeof data != "string") data = JSON.stringify(data);
            }else if(kind == "csv"){
                type = "text/csv";
            }else if(kind == "text" || kind == "txt"){
                type = "text/plain";
            }else{
                type = "text/html";
            }
            var blob = new Blob([typeof data == "string" ? data : String(data)], {type:type})
            var url = window.URL.createObjectURL(blob);
            var link = $$.ce("a");
            link.setAttribute("hidden", "");
            link.setAttribute("href", url);
            link.setAttribute("download", options.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(function(){ window.URL.revokeObjectURL(url); }, 1000);
        },
        download: function(url, fn){
        
        },
        upload: function(){
        
        }
    },
    randomString:function(length = 8){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; //had T twice and no Y or j
        //validateInteger() reports, it does not throw
        if (!validateInteger(length) || length < 0) throw new TypeError("$$.randomString(x) argument 1 must be a non-negative integer");
        var randomstring = '';
        for (var i=0; i<length; i++) {
            //the last valid index is length - 1: drawing up to length sometimes picked past the end and dropped a character
            var rnum = $$.randomInteger(0, chars.length - 1);
            randomstring += chars.substring(rnum,rnum+1);
        }
        return randomstring;
    },
    randomInteger:function(min, max){
        if (!validateInteger(min)) throw new TypeError("$$.randomInteger(x.) argument 1 must be an integer");
        if (!validateInteger(max)) throw new TypeError("$$.randomInteger(.x) argument 2 must be an integer");
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    scroll:{
        lock:function(){
            var lastPointY = scrollY;
            var lastPointX = scrollX;
            addEventListener("scroll", function(){
                // scrollTo(scrollX, lastPointY)
            },false)
        },
        x:function(hide){

        },
        yStatus:function(totalHeight = null){
            var TotalHeightBelow = totalHeight - window.innerHeight;
            var remainingHeightBelow = totalHeight - (scrollY + window.innerHeight);
            var state = "";
            if (scrollY == TotalHeightBelow || scrollY == TotalHeightBelow - 1) {
                state = "end";
            } else {
                state = "ON";//scroll has not reached the end
            }
            return {
                TotalHeightBelow: TotalHeightBelow,
                status: state,
                remainingHeightBelow: remainingHeightBelow
            }
        },
        direction:function(){
            vModel.scroll.functions.init();
            return vModel.scroll.data.state; //vModel is a global, not an export of helpers.js
        }
    },
    linkStyleSheet:function(url){
        linkStyleSheet(url);
    },
    browserType:function(name=null, callBack=null){
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
    },
    getTimeSegments: function(targetTime){
        //TargetTime in seconds
        let currentTime = parseInt(Date.now()/1000);
        
        if(targetTime < currentTime){
            console.warn("The specified time stamp  in $$.getTimeSegments(x) is behind current time, nothing to return");
            return null;
        } 

        let remainingTime   = targetTime - currentTime;
        let seconds         = remainingTime;
        let minutes         = Math.floor(remainingTime/60);
        let hours           = Math.floor(remainingTime/3600);
        let days            = Math.floor(remainingTime/86400);
        let months          = Math.floor(remainingTime/2592100);
        let years           = Math.floor(remainingTime/31104000);

        
        //Get remainders
        let remSeconds      = remainingTime % 60;
        let remMinutes      = minutes % 60;
        let remHours        = hours % 24;
        let remDays         = days % 30;
        let remMonths       = months % 12;
        let remYears        = years % 360;


        let hoursUnit       = remHours > 1?"hrs":"hr";
        let minutesUnit     = remMinutes > 1?"mins":"min";

        return{
            years:remYears,
            months:remMonths,
            days:remDays,
            hours:remHours,
            minutes:remMinutes,
            seconds:remSeconds,
            units:{
                hours:hoursUnit,
                minutes:minutesUnit
            }
        }
    },
    xhrData: function(rawData){
        if(rawData.target != undefined){
            if (rawData.target.responseText != undefined){
                return JSON.parse(rawData.target.responseText);
            }
        }
    },
    getURLParams: function(key){
        let searchParams = new URL(location.href).search;
        const queryParams = new URLSearchParams(searchParams);
        return queryParams.get(key);
    },
    fn: {}    
}
window.ScreenBreakPoint = function(breakPoints = {}) {
    validateObjectLiteral(breakPoints, "ScreenBreakPoint(x) argument 1 must be an object literal");
    var screenMode = "";
    var baseBeakPoints = {
        largeStart: 1000, //large start point
        mediumStart: 600 //medium start point
    }
    validateObjectMembers(breakPoints, baseBeakPoints);

    //each key is optional: a missing one keeps its default instead of failing validateNumber
    if (breakPoints["largeStart"] !== undefined && validateNumber(breakPoints["largeStart"], "ScreenBreakPoint(x) argument 1 object 'largeStart' property must be a number")) {
        baseBeakPoints.largeStart = breakPoints["largeStart"];
    }
    if (breakPoints["mediumStart"] !== undefined && validateNumber(breakPoints["mediumStart"], "ScreenBreakPoint(x) argument 1 object 'mediumStart' property must be a number")) {
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
//The state lives outside the function: the getters below used to read variables private to it, and threw.
var resizeState = {listening:false, size:window.innerWidth, change:0, mode:"null"};
window.browserResizeProperty = function(){
    if (resizeState.listening) return; //one listener, however many times it is called
    resizeState.listening = true;
    resizeState.size = window.innerWidth;
    window.addEventListener("resize", function() {
        var now = window.innerWidth;
        resizeState.change = Math.abs(now - resizeState.size);
        resizeState.mode = now > resizeState.size ? "expanded" : "shrinked";
        resizeState.size = now;
    }, false);
};
Object.defineProperties(browserResizeProperty, {
    mode: {
        get: function() {
            return resizeState.mode;
        }
    },
    change: {
        get: function() {
            return resizeState.change;
        }
    }
})
Object.defineProperties(window, {
    vUxModules: {
        get: function() {
           console.log(vModel.core.data.modules);
        }
    }
})
/****************************************************************/

/**********************modules for enhancing standard object*********************/
RegExp.parseChars = function (chars){
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
    //to strip out the character '/' from both ends
    return this.replace(/^[\s\uFEFF\xA0\/]+|[\s\uFEFF\xA0\/]+$/g, '');
};
String.prototype.trimChar = function (chars) {
    //to strip out the specified character(s) from both ends
    var allChars = chars.split(",");
    var parsed ="";
    allChars.forEach(function(item){
        parsed += "\\"+item;
    })
    
    var pattern = "^["+parsed+"]|["+parsed+"]+";
    var regEx = new RegExp(pattern, "g");
    return this.replace(regEx, '');
};
String.prototype.toUpperCaseFirst = function(){
    return this.charAt(0).toUpperCase() + this.slice(1)
}
Storage.prototype.setIterable = function (key, iterable){
    // This is used to assign literal object as value to storage API
    // To update already stored iterable, you would need to retrieve, and set the new value, then set again using the static method
    
    this[key] = JSON.stringify(iterable);
}
Storage.prototype.getIterable = function (key){
    // This is used to retireve stored literal object from storage API
    return JSON.parse(this[key]);
}
Date.prototype.isValid = function() {
    return this.getTime() == this.getTime();
}
Array.prototype.unique = function(){

}
Array.prototype.has = function(value){
    return this.indexOf(value) != -1;
}
/****************************************************************/

/**********************Expose useful helpers*********************/
$$.styleElement = vUxHelpers["cssGroupStyler"];
/****************************************************************/

window.$$ = $$;
