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
import "./src/vUX-core-4.0.0.beta.js";

/***************************TimeLine List*****************************/
export function TimeLineList(){
    var className ="";
    var dataAttributes = {
        timeLineBorderStyleAttrib:"",
        listStyleAttrib:"",
        listIconStyleAttrib:"",
        timeLineLabelAttrib:"",
        smallViewAttrib:""
    }
    this.autoBuild = function(){
        if(className == "")throw new Error("Setup imcomplete: TimeLineList class name must be supllied, specify using the 'config.className' property");
        var existingSheet = $$.ss("#v" + className);
        if(existingSheet == null){
            timeLineStyleSheet();
            assignTimeLineEventHanler();
        }
    }

    this.config = {}

    this.refresh = function(parent = null){
        var allUls = $$.sa("."+className+":not(.activated)");
        if(parent != null){
            validateElement(parent, "TimeLineListObj.refresh() method expects a valid DOM element as argument 1");
            allUls = parent.querySelectorAll("."+className+":not(.activated)");
        }
        
        var totalUls = allUls.length;
        if (totalUls > 0) {
            for (var x = 0; x < totalUls; x++) {
                activateList(allUls[x], x);
            }
        }
    }

    function assignTimeLineEventHanler(){
        addEventListener("resize", function(){
            wrapList();
        }, false)
    }

    function wrapList(){
        var allWrappable = $$.sa(".vtimeLine["+dataAttributes.smallViewAttrib+"]");
        var totalWrappable = allWrappable.length;
        for (var x=0; x<totalWrappable; x++){
            var wrapViewPort  = allWrappable[x].getAttribute(dataAttributes.smallViewAttrib);
            if(innerWidth <= wrapViewPort){
                allWrappable[x].classList.add("wrap");
            }else if(innerWidth > wrapViewPort){
                allWrappable[x].classList.remove("wrap");
            }
        }
    }

    function timeLineStyleSheet(){
        var listMember = $$.sa("."+className);
        if ($$.ss("style[data-id='v" + className + "']") == null) {
            var css = "";
            listMember.forEach(function(ul, index){
                var uniqueClass = activateList(ul, index);
                if(dataAttributes.timeLineBorderStyleAtrrib != "") css += "."+uniqueClass+"{"+ul.getAttribute(dataAttributes.timeLineBorderStyleAttrib)+"}";
                if(dataAttributes.listStyleAtrrib != "") css += "."+uniqueClass+" li{"+ul.getAttribute(dataAttributes.listStyleAttrib)+"}";
                if(dataAttributes.listIconStyleAtrrib != "") css += "."+uniqueClass+" li::before{"+ul.getAttribute(dataAttributes.listIconStyleAttrib)+"}";
                if(dataAttributes.timeLineLabelAtrrib != "") css += "."+uniqueClass+" li::after{"+ul.getAttribute(dataAttributes.timeLineLabelAttrib)+"}";
            });
            attachStyleSheet("v" + className, css);
        }else{
            listMember.forEach(function(ul, index){
                activateList(ul, index);
            })
        } 
        wrapList();
    }

    function activateList(ul, index){
        var uniqueClass = "vtl"+index;
        ul.classList.add("vtimeLine", uniqueClass, "activated"); 
        return uniqueClass;
    }

    Object.defineProperties(this.config, {
        className: {
            set: function(value) {
                validateString(value, "'config.className' property value must be a string");
                className = value;
            }
        },
        dataAttributes: {
            set: function(value) {
                var validOptions = ["timeLineBorderStyle", "listStyle", "listIconStyle", "smallView", "timeLineLabel"];
                validateObjectLiteral(value, "'config.dataAttributes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length < 6){
                    entries.forEach(function(entry){
                        if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute specifier is not supported, the suported specifiers are: "+ validOptions.join(", "));
                        dataAttributes[entry[0]+"Attrib"] = entry[1];
                    });
                }else{
                    throw new Error("'config.dataAttributes' object value contains more than 4 entries");
                }
            }
        }
    })
    Object.defineProperties(this, {
        autoBuild: { writable: false },
        config: { writable: false },
        refresh: { writable: false }
    })
}

/**********************************************************************/