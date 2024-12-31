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

/***************************Carousel*****************************/
export function Carousel(container, viewport) {
    validateElement(container, "'Carousel(x,.)' constructor argument 1 must be an HTML Element");
    validateElement(viewport, "'Carousel(.,x)' constructor argument 2 must be an HTML Element");
    var self = this;
    var viewportId = viewport.getAttribute("id");
    var sliders = container.querySelectorAll("#" + viewportId + "> div");
    var current = 0, buttonId = 0, forceSld = 0, pauseMode = 0, completed = 1, started = 0, delay = 4000, speed = 1000, initialized = 0, buttonStyle = null;
    var touchResponse = true, slideEffect = "linear",s;

    //Assign buttons event
    function assingnHandlers() {
        container.onclick = function(e) {
            if (e.target.classList.contains("vButton") && e.target.nodeName == "DIV") {
                if(!e.target.classList.contains("active")){
                    var id = e.target.getAttribute("data-ratio");
                    forceSld = 1;
                    buttonId = id;
                    forceSlide(id);
                }
            }
        };
    }

    function forceSlide(ratio) {
        var leftValue = parseInt(ratio) * 100;
        var newPos = -leftValue + "%";
        viewport.style["left"] = newPos;
        completed = 0;
    }

    function checkNext(current) {
        var check = current.nextElementSibling;
        if (check != null) {
            return true;
        } else {
            return false
        }
    }

    function nextSlide(ele) {
        if (pauseMode == 0 && completed == 1) {
            var currentView = viewport.querySelector("div[data-activeDisplay='1']");
            if (checkNext(currentView)) {
                current = current + 100;
                ele.style["left"] = -current + "%";
            } else {
                ele.style["left"] = "0";
                current = 0;
            }
            completed = 0;
        }
    }

    function createControls() {
        var controlArea = $$.ce("DIV");
        var buttonsCons = $$.ce("DIV");

        controlArea.classList.add("vControlArea");
        buttonsCons.classList.add("vControlButtonsCon");

        for (var x = 0; x < sliders.length; x++) {
            var buttonsShell = $$.ce("DIV");
            var button = $$.ce("DIV");
            var id = x + 1;
            buttonsShell.classList.add("vControlButtonsShell");
            x == 0 ? button.setAttribute("class", "vButton active") : button.classList.add("vButton");
            button.setAttribute("id", "b" + id);
            button.setAttribute("data-ratio", x);
            buttonsShell.appendChild(button);
            buttonsCons.appendChild(buttonsShell);
        }

        controlArea.appendChild(buttonsCons);
        container.appendChild(controlArea) != null ? assingnHandlers() : null;
    }

    function createControlStyles() {
        if ($$.ss("style[data-id='carouselStyles']") == null) {
            var css = "";
            if (buttonStyle != null) {
                css += ".vButton{" + buttonStyle[0] + "}"; //Normal button
                if (buttonStyle[1] != undefined || buttonStyle[1] != undefined) {
                    css += ".vButton.active{" + buttonStyle[1] + "}"; //active button
                }
            }
            attachStyleSheet("carouselStyles", css);
        }
    }

    function startSlide() {
        var m_delay = delay + speed;
        clearInterval(s);
        s = setInterval(function(){
            if (pauseMode == 0 && completed == 1) {
                nextSlide(viewport);
            }
        }, m_delay)
    }

    function forceSetCurrent(activeButton, previousActive, node) {
        //unset any current view
        previousActive.setAttribute("data-activeDisplay", "0");

        var x = viewport.querySelector("div[data-ratio='" + node + "']");
        x.setAttribute("data-activeDisplay", "1");

        //Set buttons
        activeButton.classList.remove("active"); //remove previous
        var selectedButton = $$.ss(".vControlButtonsShell div[data-ratio='" + node + "']");
        selectedButton.classList.add("active"); //remove previous
    }

    function touchEndCallBack(node) {
        var activeButton = $$.ss(".vControlButtonsShell .active");
        var previousActive = viewport.querySelector("div[data-activeDisplay='1']");
        forceSetCurrent(activeButton, previousActive, node);
    }
    this.initialize = function() {
        if (initialized == 0) {
            viewport.classList.add("vSliderViewPort");
            viewport.style["transition-duration"] = speed + "ms";
            viewport.style["transition-timing-function"] = slideEffect;
           
            //Place sliders in order
            Object.values(sliders).forEach(function(itemContent, arrayIndex, targetArray) {
                var leftValue = arrayIndex * 100;
                itemContent.style["left"] = leftValue + "%";
                arrayIndex == 0 ? itemContent.setAttribute("data-activeDisplay", "1") : itemContent.setAttribute("data-activeDisplay", "0");
                itemContent.setAttribute("data-ratio", arrayIndex);
            });

            //Assign event listeners
            container.onmouseenter = function() {
                pauseMode = 1;
                completed = 1;
            }
            container.onmouseleave = function() {
                pauseMode = 0;
            }

            viewport.addEventListener("transitionend", function(e) {
                var activeButton = $$.ss(".vControlButtonsShell .active");
                var previousActive = viewport.querySelector("div[data-activeDisplay='1']");
                var id = null;
                if (e.target.classList.contains("posUpdate")) {
                    return;
                }
                if (forceSld == 0) {
                    if(e.target.classList.contains("vSliderViewPort")){
                        //Assign new active
                        if (checkNext(previousActive)) {
                            //set next
                            previousActive.nextElementSibling.setAttribute("data-activeDisplay", "1");
                            id = previousActive.nextElementSibling.getAttribute("data-ratio");
                        } else { // reached the last
                            //set the 1st child
                            sliders[0].setAttribute("data-activeDisplay", "1");
                            id = 0;
                        }

                        // unset previous
                        previousActive.setAttribute("data-activeDisplay", "0");

                        //Set buttons
                        activeButton.classList.remove("active"); //remove previous
                        var nextActiveButton = $$.ss(".vControlButtonsShell div[data-ratio='" + id + "']");
                        nextActiveButton.classList.add("active"); //make Next active
                        completed = 1;
                    }
                } else if (forceSld == 1) {
                    //unset any current view
                    previousActive.setAttribute("data-activeDisplay", "0");
                    forceSetCurrent(activeButton, previousActive, buttonId);
                    completed = 1;
                    forceSld = 0;
                }
            }, false);

            //Enable touch if specified
            if (touchResponse) {
                var touchHdr = new TouchHandler(container);
                touchHdr.config.slideCallBack = touchEndCallBack;
                touchHdr.config.viewPortTransition = "left " + speed + "ms "+slideEffect;
                touchHdr.initialize();
                touchHdr.enableTouch();
            }
            createControlStyles();
            createControls();
            initialized = 1;
        }
    }
    this.start = function() {
        if (started == 0) {
            startSlide();
            started = 1;
        }
    };
    this.config = {

    }
    Object.defineProperties(this, {
        initialize: {
            writable: false
        },
        start: {
            writable: false
        },
        config: {
            writable: false
        }
    });
    Object.defineProperties(this.config, {
        delay: {
            set: function(value) {
                validateNumber(value, "'config.delay' property value must be numeric");
                value < 0 ? value = 0 : null;
                delay = value;
            }
        },
        speed: {
            set: function(value) {
                validateNumber(value, "'config.speed' property value must be numeric");
                value < 0 ? value = 0 : null;
                speed = value;
            }
        },
        slideEffect:{
            set: function(value) {
                validateString(value, "'config.slideEffect' property value must be a string");
                slideEffect = value;
            }
        },
        buttonStyle: {
            set: function(value) {
                //value = [a, b] => a = string styles for normal button state; b =>  string styles for active button state
                var temp = "'config.buttonStyle' property value must be an array";
                validateArray(value, temp);
                if (value.length > 2) {
                    throw new Error(" of either 1 or 2 element(s)");
                }
                validateString(value[0], " of strings");
                value[1] != undefined ? validateString(value[1], " of strings") : null;
                buttonStyle = value;
            }
        },
        touchResponse: {
            set: function(value) {
                validateBoolean(value, "config.touchResponse property expects a boolean");
                touchResponse = value;
            }
        }
    })
}
/****************************************************************/