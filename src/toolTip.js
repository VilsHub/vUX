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

/***************************Tool tip*****************************/
function ToolTip() {
    var sy = 0,sx = 0,ini = false,tipBoxProperties = [],tipId = "",initialized = 0;

    function createStyles() {
        if ($$.ss("style[data-id='toolTipStyles']") == null) {
            var css = "";
            if (tipBoxProperties[0] != undefined) {
                css += ".vToolTipTop::before{border-top:10px solid " + tipBoxProperties[0] + ";}";
                css += ".vToolTip{background-color:" + tipBoxProperties[0] + "}";
            }
            if (tipBoxProperties[1] != undefined) {
                css += ".vToolTip{color:" + tipBoxProperties[1] + "}";
            }
            attachStyleSheet("toolTipStyles", css);
        }
    }

    function createTipElement() {
        var tipElement = $$.ce("DIV");
        var existing = $$.sa(".vToolTip");
        existing.length > 0 ? tipId = existing.length + 1 : tipId = 1;
        tipElement.setAttribute("class", "vToolTip vToolTipTop");
        tipElement.setAttribute("data-tTipEvent", "off");
        tipElement.setAttribute("data-toolTipId", tipId);
        document.body.appendChild(tipElement);
        addEvent(tipId);
    }

    function mouseOutControl(ele) {
        var tipID = ele.getAttribute("data-tid");
        var tipBox = $$.ss("div[data-toolTipId='" + tipID + "']");
        if (ele.getAttribute("data-TID") != null) {
            tipBox.style["display"] = "none";
            tipBox.style["top"] = "0";
            tipBox.style["left"] = "0";
        }
        var mainTip = ele.getAttribute("data-tempTitle");
        if (mainTip != null) {
            ele.setAttribute("title", mainTip);
            ele.removeAttribute("data-tempTitle");
        }
    }

    function addEvent(id) {
        var vTipCon = $$.ss("div[data-toolTipId='" + id + "']");
        if (vTipCon.getAttribute("data-tTipEvent") == "off") {
            $$.attachEventHandler("mouseover", "vtip", function(e) {
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    sy = scrollY;
                    sx = scrollX;
                    var mainTip = e.target.getAttribute("title");
                    if (mainTip != null) {
                        e.target.setAttribute("data-tempTitle", mainTip);
                        e.target.removeAttribute("title");
                    }
                }
            });
            $$.attachEventHandler("mousemove", "vtip", function(e) {
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    var tipID = e.target.getAttribute("data-tid");
                    var tipBox = $$.ss("div[data-toolTipId='" + tipID + "']");
                    tipBox.style["display"] == "none" ? tipBox.style["display"] = "block" : null;
                    var y = (e.clientY + sy) - tipBox.scrollHeight;
                    var x = (e.clientX + sx) - 10;
                    var mainTip = e.target.getAttribute("data-tempTitle");
                    if (mainTip != null) {
                        mainTip.length < 1 ? tipBox.style["display"] = "none" : null;
                        tipBox.innerHTML = mainTip;
                    }

                    tipBox.style["top"] = y + "px";
                    tipBox.style["left"] = x + "px";
                }
            })
            $$.attachEventHandler("mouseout", "vtip", function(e) {
                if (e.target.getAttribute("data-vToolTipSwitch") == "ON") {
                    mouseOutControl(e.target);
                }
            })
            vTipCon.setAttribute("data-tTipEvent", "on");
        }
    }
    this.initialize = function() {
        if (initialized == 0) {
            createTipElement();
            createStyles();
            initialized = 1;
        }
    };
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
        } else {
            throw new Error("No tool tip applied on target element");
        }
    }
    this.clearTip = function() {
        var anyTip = $$.ss(".vtip:not([title])");
        anyTip != null ? mouseOutControl(anyTip) : null;
    }
    Object.defineProperties(this.config, {
        tipBoxProperties: {
            set: function(value) {
                var temp = "config.tipBoxProperties property array members";
                validateArray(value, "config.arrowColor property expects an arry");
                if (value.length > 2) {
                    throw new Error(temp + " cannot be more than 2");
                }
                validateArrayMembers(value, "string", temp + "must all be string");
                tipBoxProperties = value;
            }
        },
    })
    Object.defineProperties(this, {
        initialize: { writable: false },
        config: { writable: false },
        set: { writable: false },
        on: { writable: false },
        off: { writable: false },
        clearTip: { writable: false }
    })
}
/****************************************************************/