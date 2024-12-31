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

/***************************Tool tip*****************************/
export function ToolTip() {
    var tipBoxStyles = {arrowColor:"",fontColor:""},initialized = 0,toolTipClassName="";

    function createStyles() {
        if ($$.ss("style[data-id='toolTipStyles-"+toolTipClassName+"']") == null) {
            var css = "";
            if (tipBoxStyles.arrowColor != "") {
                css += ".vToolTipTop[data-tooltipid='"+toolTipClassName+"']::before{border-top:10px solid " + tipBoxStyles.backgroundColor + ";}";
                css += ".vToolTip[data-tooltipid='"+toolTipClassName+"']{background-color:" + tipBoxStyles.backgroundColor + "}";
            }
            if (tipBoxStyles.fontColor != "") {
                css += ".vToolTip[data-tooltipid='"+toolTipClassName+"']{color:" + tipBoxStyles.fontColor + "}";
            }
            attachStyleSheet("toolTipStyles-"+toolTipClassName, css);
        }
    }
    function createTipElement() {
        var tipElement = $$.ce("DIV");
        var existing = $$.ss("div[data-toolTipId='"+toolTipClassName+"']");

        if(existing == null){
            tipElement.setAttribute("class", "vToolTip vToolTipTop");
            tipElement.setAttribute("data-tTipEvent", "off");
            tipElement.setAttribute("data-toolTipId", toolTipClassName);
            document.body.appendChild(tipElement);
            addEvent();
        }
    }
    function mouseOutControl() {
        var tipBox = $$.ss("div[data-toolTipId='" + toolTipClassName + "']");
        tipBox.style["display"] = "none";
    }
    function setCustomTitle(){
        var members = $$.sa("."+toolTipClassName);
        members.forEach(function(element){
            var mainTip = element.getAttribute("title");
            if (mainTip != null) {
                element.classList.add("vtip");
                element.setAttribute("data-tempTitle", mainTip);
                element.setAttribute("data-vToolTipSwitch", "ON");
                element.removeAttribute("title");
            }
        });
    }
    function setPos(e){
        var tipBox = $$.ss("div[data-toolTipId='" + toolTipClassName + "']");
        var mainTip = e.target.getAttribute("data-tempTitle");

        if (mainTip != null) {
            mainTip.length < 1 ? tipBox.style["display"] = "none" : tipBox.style["display"] = "block";//display only if has content
            tipBox.innerHTML = mainTip;
        }
        var y = (e.clientY + scrollY) - tipBox.scrollHeight;
        var x = (e.clientX + scrollX) - 10;
        
        tipBox.style["top"] = y + "px";
        tipBox.style["left"] = x + "px";      
    }
    function addEvent() {
        $$.attachEventHandler("mouseover", "vtip", function(e) {
            if (e.target.classList.contains(toolTipClassName)){
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    setPos(e);
                }
            }
            
        });
        $$.attachEventHandler("mousemove", "vtip", function(e) {
            if (e.target.classList.contains(toolTipClassName)){
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    setPos(e);
                }
            }
        })  
        $$.attachEventHandler("mouseout", "vtip", function(e) {
            if (e.target.classList.contains(toolTipClassName)){
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    mouseOutControl();
                }
            }
            
        })
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
            if (toolTipClassName == "") {
                throw new Error("Setup imcomplete: toolTip class name must be supllied, specify using the 'config.className' property");
            }
            createTipElement();
            addVitalStyles();
            createStyles();
            setCustomTitle();
            initialized = 1;
        }
    };
    this.refresh = function(){
        setCustomTitle();
    }
    this.config = {};
    this.on = function(element) {
        validateElement(element, "Argument 1 of the obj.on() method must be a valid HTML element");
        if (element.getAttribute("title") == null) {
            throw new Error("The specified element title attribute cannot be null, Please specify the tip to use.");
        }
        element.setAttribute("data-TID", tipId);
        element.classList.add("vtip");
        element.setAttribute("data-vToolTipSwitch", "ON");
    }
    this.off = function(element) {
        validateElement(element, "Argument 1 of the off() static method must be a valid HTML element");
        if (element.getAttribute("data-TID") != null) {
            if (element.getAttribute("data-vToolTipSwitch") == "ON") {
                element.getAttribute("data-tempTitle") != null ? element.setAttribute("title", element.getAttribute("data-tempTitle")) : null;
                element.setAttribute("data-vToolTipSwitch", "OFF");
            }
        }else {
            throw new Error("No tool tip applied on target element");
        }
    }
    Object.defineProperties(this.config, {
        tipBoxStyles: {
            set: function(value) {
                var validKeys = Object.keys(tipBoxStyles);
                var sourceKeys = Object.keys(value);
                validateObject(value, "config.tipBoxStyles property expects an object");
                if (sourceKeys.length > 2) {
                    throw new Error(temp + " cannot be more than 2 properties");
                }

                for (let x = 0; x < sourceKeys; x++) {
                    if(validKeys.indexOf(sourceKeys[x]) == -1){
                        throw new Error ("config.tipBoxStyles property can only accept these any of the keys: "+keys.join(", ") +". The key: '"+sourceKeys[x]+"' is not one of them");
                    }else{
                        validateString(value[sourceKeys[x]], "config.tipBoxStyles object key: "+sourceKeys[x]+" expects a string as value");
                    }
                }

                tipBoxStyles = value;
            }
        },
        className:{
            set: function(value) {
                validateString(value, "datePicker.config.className property expect a string as value");
                toolTipClassName = value;
            }
        }
    })
    Object.defineProperties(this, {
        initialize: {writable: false},
        config: {writable: false},
        on: {writable: false},
        off: {writable: false}
    })
}
/****************************************************************/