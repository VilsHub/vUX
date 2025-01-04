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

window.vModel = {
    core:{
        functions:{
            linkStyleSheet: function (url, name=null){
                let existingSheet = name != null?document.querySelector("link[data-id='"+name+"']"):null;
                
                if(existingSheet == null){ 
                    let linkEle = document.createElement("link");
                    linkEle.setAttribute("rel", "stylesheet");
                    linkEle.setAttribute("type", "text/css");
                    if(name != null) linkEle.dataset.id = name;
                    linkEle.setAttribute("href", url);
                    setTimeout(function(){
                        document.head.appendChild(linkEle);

                    }, 300)
                }
            }
        },
        data:{
            minified:false,
            assetPathProcessed:false,
            assetPath:null,
            modules:[
                "spaEngine.js",
                "autoWriter.js",
                "carousel.js",
                "cShapes.js",
                "formComponents.js",
                "listScroller.js",
                "modalDisplayer.js",
                "resizer.js",
                "spaEngine.js",
                "timeLineList.js",
                "touchHandler.js"
            ]
        }
    },
    slide:{
        functions:{
            slideOn:function(e, objProp = null){
                if(objProp != null){
                    var properties = Object.entries(objProp);
                    properties.forEach(function(element) {
                        e.style[element[0]] = element[1];
                    });
                }
                e.scrollHeight;
            },
            slideOff:function(e, objProp = null){
                if(objProp != null){
                    var properties = Object.entries(objProp);
                    properties.forEach(function(element) {
                        e.style[element[0]] = element[1];
                    });
                }
            },
            validateConfigs:function(configs, direction){
                validateObjectLiteral(configs, "$$.sm(.).slide."+direction+"(.x) argument 1 must be an object literal");
                var sourceEntries = Object.entries(configs);
                var totalEntries  = sourceEntries.length;
                if(totalEntries > 5) throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object keys must be max 5");
                var validKeys   = Object.keys(vModel.slide.data.effectConfigs);

                sourceEntries.forEach(function(config){
                    if(config[0] != undefined){
                        if (validKeys.indexOf(config[0]) == -1) throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object keys must be one of the follwings: "+validKeys.join(", ")+". '"+ config[0]+"' is not one of them");
                        if (config[0] != "timingFunction" && config[0] != "positionProperty") config[0] = config[0].toLowerCase();
                        if (config[0] != "positions" && config[0] != "speed" && config[0] != "dimensions"  && config[0] != "positionProperty") config[1] = config[1].toLowerCase();
    
                        if(config[0] == "use"){
                            if(config[1] != "dimension" && config[1] != "position") throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object.use property must be a either 'position' or 'dimension'");
                        }else if(config[0] == "timingFunction"){
                            validateString(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object['timing-function'] property must be a string");
                        }else if(config[0] == "speed"){
                            validateNumber(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.speed property must be a number");
                            if(config[1] < 0) config[1] = 0;
                        }else if(config[0] == "positions"){
                            validateObjectLiteral(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.positions property must be an object literal");
                            var subEntries = Object.entries(config[1]);
                            var totalEntries = subEntries.length;
                            if(totalEntries > 2) throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object.positions object keys cannot be more than 2");
                            subEntries.forEach(function (position){
                                position[0] = position[0].toLowerCase();
                                if(position[0] != "x" && position[0] != "y") throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object.positions object keys can either be 'x' or 'y', "+position[0]+" is not one of them");
                                validateArray(position[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.positions."+position[0]+" property value must be an array");
                                if (position[1][0] != undefined) validateNumber(position[1][0], "$$.sm(.).slide(.x) argument 1 object.positions."+position[0]+" property array element 1 must be a number");
                                if (position[1][1] != undefined) validateNumber(position[1][1], "$$.sm(.).slide(.x) argument 1 object.positions."+position[0]+" property array element 2 must be a number");
                            });
                        }else if(config[0] == "dimensions"){
                            validateObjectLiteral(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions property must be an object literal");
                            var subEntries = Object.entries(config[1]);
                            var totalEntries = subEntries.length;
                            if(totalEntries > 2) throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions object keys cannot be more than 2");
                            subEntries.forEach(function (dimension){
                                dimension[0] = dimension[0].toLowerCase();
                                if(dimension[0] != "x" && dimension[0] != "y") throw new Error("$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions object keys can either be 'x' or 'y', "+dimension[0]+" is not one of them");
                                validateArray(dimension[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions."+dimension[0]+" property value must be an array");
                                if (dimension[1][0] != undefined)validateNumber(dimension[1][0], "$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions."+dimension[0]+" property array element 1 must be a number");
                                if (dimension[1][1] != undefined) validateNumber(dimension[1][1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.dimensions."+dimension[0]+" property array element 2 must be a number");
                            });
                        }else if(config[0] == "positionProperty"){
                            validateString(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object['positionProperty'] property must be a string");
                            if (config[1] != "right" && config[1] != "left") throw new Error(config[1], "$$.sm(.).slide."+direction+"(.x) argument 1 object.positionProperty property value must either be 'right' or 'left'");
                            //Continue here
                        }
                    }
                });

                if(configs.use != undefined){
                    if(configs.use.toLowerCase() == "position"){
                        if(configs.positions != undefined){
                            if(direction == "toLeft" && direction == "toRight"){
                                if(configs.positions.x == undefined){
                                    throw new Error("$$.sm(.).slide."+direction+"(x.) argument 1 object.positions.x property must be set");
                                }
                            }
                            if(direction == "toTop" && direction == "toBottom"){
                                if(configs.positions.y == undefined){
                                    throw new Error("$$.sm(.).slide."+direction+"(x.) argument 1 object.positions.y property must be set");
                                }
                            }
                        }else{
                            throw new Error("$$.sm(.).slide."+direction+"(x.) argument 1 object.positions property must be set");
                        }
                    }
                }
        
            },
            miliToSeconds:function(mili){
                var value;
                if(mili != undefined){
                    value = mili/1000;
                }else{
                    value = 300/1000;
                }
                return value;
            }
        },
        data:{
            effectConfigs: {
                timingFunction:"linear", 
                speed:300,
                use:"dimension",
                positions:{
                    x:[0,300],//[a,b] a=> initial position, b=> final position
                    y:[0,300] //[a,b] a=> initial position, b=> final position
                }, 
                dimensions:{
                    x:[0,200],//[a,b] a=> initial width, b=> final width
                    y:[0,200] //[a,b] a=> initial height, b=> final height
                },
                positionProperty:"left"
            }
        }
    },
    flip:{
        functions:{
            flipValue:function(axis, angle){
                var axisValue = "";
                if(axis == "x"){
                    axisValue = "1, 0, 0";
                }else if(axis == "y"){
                    axisValue = "0, 1, 0";
                }else if (axis == "z"){
                    axisValue = "0, 0, z";
                }

                return "rotate3d("+axisValue+", "+angle+")";
            },
            effectValue:function(speed, timingFunction){
                if (speed == null) speed = ".2s";
                if (timingFunction == null) timingFunction = "linear";
                return "transform "+speed+" "+timingFunction;
            }
        }
    },
    animate:{
       data:{
        startValue:{},
        items:0
       },
       functions:{
           elementTag: function(element){
                var id = element.dataset.animateItem;
                if(id == null){
                    id = "ele"+(vModel.animate.data.items++);
                    element.dataset.animateItem = id;
                }
                return id;
           }
       }
    },
    scroll:{
        data:{
            init:false,
            iniSY:scrollY,
            state:{direction: "", change: 0},
        },
        functions:{
            init: function(){
                if(!vModel.scroll.data.init){
                    window.addEventListener("scroll", function() {
                        let state = vModel.scroll.data.state;
                        if (scrollY > vModel.scroll.data.iniSY) { //scrolled down
                            state["change"] = scrollY - vModel.scroll.data.iniSY;
                            state["direction"] = "down";
                            vModel.scroll.data.iniSY = scrollY;
                        } else {
                            state["change"] = vModel.scroll.data.iniSY - scrollY;
                            state["direction"] = "up";
                            vModel.scroll.data.iniSY = scrollY;
                        }                    
                        vModel.scroll.data.state = state;
                    }, false);
                    vModel.scroll.data.init = true;
                }
            }
        }
    }

}


window.processAssetPath = async function () {
    if(!vModel.core.data.assetPathProcessed){
        let mainScript = document.querySelector("script[type ='module'][data-id]"); 
        let init =false;
        try {
            const result = await (function() {
                while (!init){
                    mainScript = document.querySelector("script[type ='module'][data-id]"); 
                    if(mainScript != null){
                        let id = mainScript.dataset.id;                   
                        if(id.toLowerCase() == "vux"){
                            let path = mainScript.dataset.libraryRoot;
                            if(path != undefined){
                                path = path.replace(/[\s\uFEFF\xA0\/]+$/g, ''); //remove "/" from path end if exist
                                vModel.core.data.assetPathProcessed = true;
                                vModel.core.data.assetPath = path+"/assets/";
                                init = true;
                                return path+"/assets/";
                            }else{
                                throw new Error("No 'data-library-root' atrribute set on the script element with the 'src' attribute value = "+mainScript.src);
                            }
                            
                        }
                    }
                }
            })() 
            
            if(init == true){
                return result;
            }
            
        } catch (error) {
            return error;
        }    
       
    }else{
        return vModel.core.data.assetPath;
    }   
}

processAssetPath().then(function(assetPath){
    vModel.core.functions.linkStyleSheet(assetPath+"css/core.css");
})


/*************************Helper functions***********************/
export function cssGroupStyler(elementObj, StyleObject) {
    if(elementObj instanceof Element){
        runGroupStyler(elementObj, StyleObject);
    }else{
        var totalEles = elementObj.length;
        for (var x = 0; x < totalEles; x++) {
            runGroupStyler(elementObj[x], StyleObject);
        }
    }
}

export function percentageToAngle(percentage, start){
	var angle = (percentage/100)*(2*Math.PI);
	if(start == 12){
		return angle - (0.5*Math.PI);
	}else if(start == 3){
		return angle;
	}else{
		return angle;
	}
};

export function runGroupStyler(element, StyleObject){
    for (var property in StyleObject) {
        element.style[property] = StyleObject[property];
    }
}

export function camelToCSSstandard(cameledName) {
    return cameledName.replace(/[A-Z]/g, function (m){"-" + m.toLowerCase()});
}

export function hyphenatedToCamel(hyphenatedName) {
    var segments    = hyphenatedName.split("-");
    var total       = segments.length;
    var cameled     = segments[0];
    
    if(total > 1){
        for (var index = 1; index < total; index++) {
            cameled += segments[index].toUpperCaseFirst();
        }
    }
    return cameled;
}

export function validateNumber(number, msg = null) {
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

export function validateString(string, msg = null) {
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

export function matchString(string, stringsArr, msg = null) {
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

export function matchNumbers(number, NumbersArr, msg = null) {
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

export function validateArray(array, msg = null) {
    if (!Array.isArray(array)) {
        if (msg != null) {
            throw new TypeError(msg);
        } else {
            throw new TypeError("Please provide an array");
        }
    }
};

export function validateArrayLength(array, totalMember, msg = null) {
    if (array.length != totalMember) {
        if (msg != null) {
            throw new Error(msg);
        } else {
            throw new Error("Incomplete member error: " + totalMember + " member(s) needed");
        }
    }
}

export function validateArrayMembers(array, type, msg = null) {
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

export function validateBoolean(boolean, msg = null) {
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

export function validateObjectMember(object, propery, msg = null) {
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

export function validateElement(element, msg = null) { //A single element
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

export function validateFunction(fn, msg = null) {
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

export function validateHTMLObject(HTMLCollection, msg=null) { //Group of elements
    msg = msg != null?msg:"Invalid HTML Collection : HTML collection must be provide";
    if (isHTMLObject(HTMLCollection)) {
        return true;
    } else {
        throw new TypeError(msg);
    }
}

export function validateObjectLiteral(object, msg = null) {
    msg = msg != null?msg:"Type error : literal object needed";
    
    if(object !== undefined){
        if (object.__proto__.isPrototypeOf(new Object()) == true) {
            return true;
        } else {
            throw new TypeError(msg);
        }
    }else{
        throw new TypeError(msg);
    }
}

export function validateObject(object, msg = null) {
    if (typeof object == "object") {
        return true;
    } else {
        if (msg != null) {
            throw new TypeError(msg);
        }
    }
}

export function validateObjectMembers(object, ObjectBase) {
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

export function validateStringDigit(stringDigit) {
    if (/0-9/.test(stringDigit)) {
        return true;
    } else {
        return false;
    };
}

export function validateDimension(dimension, msg = null) {
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

export function getDimensionOfHidden(element) {
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

export function keyboardEventHanler(e) {
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

export function sanitizeInteger(value) {
    return value.replace(/[^0-9]+/g, "");
}

export function minMaxInt(value, min, max) {
    if (value < max && value > min) {
        return value;
    } else if (value >= max) {
        return max;
    } else if (value <= min) {
        return min;
    }
}

export function getDayName(year, month, day) {
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

export function timeFraction(startTime, duration) {
    //startTime and Duration in milliseconds
    var timeFragment = (Date.now() - startTime) / duration;
    if (timeFragment > 1) {
        timeFragment = 1;
    }
    return timeFragment;
}

export function attachStyleSheet(dataID, css) {
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

export function validateAlpha(input) {
    var target = /[^A-Za-z\ ]+/.test(input); //checks for other characters except A-Za-z and space
    if (target == true) {
        return false;
    } else {
        return true;
    }
}

export function alphaNumeric(input) {
    var target = /[^A-Za-z0-9]+/.test(input); //checks for other characters except A-Za-z0-9
    if (target == true) {
        return false;
    } else {
        return true;
    }
}

export function validateEmailAddress(input) {
    var email_filter = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{1,}$/.test(input); //matches email address pattern
    return email_filter;
}

export function validateInteger(n) {
    return Number(n) === n && n % 1 === 0;
}

export function validateFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

export function validateFullName(value) {
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

export function validateSelectField(groupCollection) {
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

export function validatePhoneNumber() {
    var input_filter = /^(\+|[0-9])[0-9]+$/.test(input); //matches phone number pattern
    return input_filter;
}

export function getCssStyle(ele, property, pEle=null){
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

export function isPositioned(ele){
    var propertyValue = getCssStyle(ele, "position");
    return ["fixed", "relative", "absolute", "sticky"].indexOf(propertyValue) == -1?false:true;
}

export function isHTMLObject(NodeList){
    return Object.getPrototypeOf(NodeList).constructor.name == "NodeList";
}

export function checkBrowser(id = null){
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

export function checkAndExecute(e, eventComponents, fn){
    var status = true;
    var total = eventComponents.length;
    for (var x = 0; x < total; x++) {
        if (x == 0) continue;
        var entries = eventComponents[x].split("=");
        if (entries.length > 2 || entries.length == 1) throw new Error("$$.attachEventHandler(x..) argument 1 event contraint(s) supplied incorrectly");
        if(e[entries[0]].toString() != entries[1].toString()){
            status = false;
            break;
        }
        
    }
    if(status) fn(e);
}
/*****************************Timing*****************************/
export let  timing = {
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



