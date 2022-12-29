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
                if (ntimes != null) validateInteger(ntimes, "$$.sm(.).hasParent(.x) method argument 2 must be an integer");
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
                    var id = parentIDorLevel.replace(".", "");
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
                            console.warn("Travesing finished!, and the specified dept level '"+id+"' is higher above the DOM root (HTML)")
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
            this.scroll = {
                x:function (hideBar=false){
                    var element = (selector instanceof Element)?selector:ele.single;
                    var hide = hideBar?"bar-hide":"";
                    element.classList.add("scroll", hide, "x");
                },
                y:function (hideBar=false){
                    var element = (selector instanceof Element)?selector:ele.single;
                    var hide = hideBar?"bar-hide":"";
                    element.classList.add("scroll", hide, "y");
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
                    try {
                        vModel.slide.functions.validateConfigs(configs, "toLeft"); 
                    } catch (error) {
                        throw new Error(error);
                    }
                    
                    var element = (selector instanceof Element)?selector:ele.single; 

                    var classes = configs.use == "dimension"? "dim" : "pos";
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
                    configs.use = configs.use == undefined? vModel.slide.data.effectConfigs.use : configs.use;
                    configs.positions = configs.positions == undefined? vModel.slide.data.effectConfigs.positions : configs.positions;
                    configs.dimensions = configs.dimensions == undefined? vModel.slide.data.effectConfigs.dimensions : configs.dimensions;
                    configs.positionProperty = configs.positionProperty == undefined? vModel.slide.data.effectConfigs.positionProperty : configs.positionProperty;
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
                        
                        if(configs.positions.x[0] == null){
                            element.style[configs.positionProperty] = "0px"
                        }else{
                            element.style[configs.positionProperty] = configs.positions.x[0]+"px";
                        }

                        vModel.slide.functions.slideOn(element);
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
                    try {
                        vModel.slide.functions.validateConfigs(configs, "toRight"); 
                    } catch (error) {
                        console.error(error)
                    }
                    
                    var element = (selector instanceof Element)?selector:ele.single; 

                    var classes = configs.use == "dimension"? "dim" : "pos";
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
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
                            element.style["width"] = width+"px";
                        }else{
                            element.style["width"] = configs.dimensions.x[1]+"px";
                        }

                        newSize = configs.dimensions.x[1];
                    }else{
                        element.style["display"] = "block";
                        element.style["left"] = configs.positions.x[0]+"px";

                        vModel.slide.functions.slideOn(element);

                        element.style["left"] = configs.positions.x[1]+"px";
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
                    try {
                        vModel.slide.functions.validateConfigs(configs, "toTop"); 
                    } catch (error) {
                        console.error(error)
                    }
                    
                    var element = (selector instanceof Element)?selector:ele.single; 
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
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
                    try {
                        vModel.slide.functions.validateConfigs(configs, "toBottom"); 
                    } catch (error) {
                        console.error(error)
                    }
                    
                    var element = (selector instanceof Element)?selector:ele.single;
                    var classes = configs.use == "dimension"? "dim" : "pos";
                    configs.speed = configs.speed == undefined? vModel.slide.data.effectConfigs.speed : configs.speed;
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
                                    element.style["height"] = height;
                                    newSize = height;
                                }
                            }else{
                                element.style["height"] = height;
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
                            if (option.frontClass != null) validateString(option.perspective, " frontClass property must be a string");
                        }
                        if (option.backClass == null){
                            throw new Error(temp+" backClass property must be specified");
                        }else{
                            if (option.backClass != null) validateString(option.perspective, " backClass property must be a string");
                        }
                        if (option.axis == null){
                            throw new Error(temp+" axis property must be specified");
                        }else{
                            if (option.axis != null) validateString(option.perspective, " axis property must be a string");
                            option.axis = option.axis.toLowerCase();
                            if (option.axis != "x" && option.axis != "y" && option.axis != "z"){
                                throw new Error(temp+" axis property value must be one of these: 'x' or 'y'");
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
        validateString(event, "'$$.attachEventHandler()' argument 1 must be a string specifying the event type");
        if (typeof DomClass == "string") {//class name and class to exclude
            // string value = "include, exclude" | "include"
            idType = "single";
        } else if (Array.isArray(DomClass)) {// DOM list of elements classes
            validateArrayMembers(DomClass, "string", "'$$.attachEventHandler()' argument 2 must be an array of string(s)");
            idType = "multiple";
        } else {
            throw new Error("'$$.attachEventHandler()' argument 2 must be a string or array of string, specifying the class name of the element(s) o");
        }
        validateFunction(fn, "'$$.attachEventHandler()' argument 3 must be a function to be called on the trigger");
        var eventComponents = event.split(":");

        addEventListener(eventComponents[0], function(e) {
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
                    if (e.target.classList.contains(DomClass[x])) {
                        fn(e, DomClass[x]);
                        break;
                    }
                }
            }
        }, false);
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
            return vUxHelpers.vModel.scroll.data.state;
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
    getTimeSegments: function(targetTime, compare=true){
        //TargetTime in seconds
        let currentTime = null;
        if(compare){
            if(targetTime < currentTime){
                console.warn("The specified time stamp  in $$.getTimeSegments(x.) is behind current time, nothing to return");
                return null;
            }
            currentTime = parseInt(Date.now()/1000);
        } 

        let remainingTime   = compare ? (targetTime - currentTime) : targetTime;
        let seconds         = remainingTime;
        let minutes         = Math.floor(remainingTime/60);
        let hours           = Math.floor(remainingTime/3600);
        let days            = Math.floor(remainingTime/86400);
        let months          = Math.floor(remainingTime/2592100);
        let years           = Math.floor(remainingTime/31104000);

        //Get remainders
        let remSeconds      = seconds % 60;
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
    }     
}
window.ScreenBreakPoint = function(breakPoints) {
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
window.browserResizeProperty = function(){
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
},  
Object.defineProperties(browserResizeProperty, {
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
    this[key] = JSON.stringify(iterable);
}
Storage.prototype.getIterable = function (key){
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
window.$$ = $$;
