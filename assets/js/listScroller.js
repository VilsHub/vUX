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


/************************ListScroller****************************/
function ListScroller(container, listParent) {
    //listParent 	=> the ul element
    //container		=> Element housing the ul element
    validateElement(container, "An HTML element needed as list parent container");
    validateElement(listParent, "List parent is not a valid HTML element");
    var maxAdd = 0, paddingRight = 0, ready = 0, listening = 0,running = 0;
    var buttons = [], scrollSize = 175,effects = [1, "linear"],inactiveButtonsClassName = [], paddingLeft = 0,wrapperStyle = "width:100%",spaceError = 0,restyleOnActive = false;
    //buttons[0] = left button, buttons[1] = Right button
    //inactiveButtonsClassName[0] = left button inactive ClassName, inactiveButtonsClassName[1] = right button inactive ClassName, 
    //if inactiveButtonsClassName.length = 1 , then button 1 and 2 have the same inactive ClassName
    function toggleClass(type, id) {
        if (type == "r") { //remove
            if (inactiveButtonsClassName.length == 2) {
                buttons[id].classList.remove(inactiveButtonsClassName[id]);
            } else {
                buttons[id].classList.remove(inactiveButtonsClassName[0]);
            }
        } else if (type == "a") { //add
            if (inactiveButtonsClassName.length == 2) {
                buttons[id].classList.add(inactiveButtonsClassName[id]);
            } else {
                buttons[id].classList.add(inactiveButtonsClassName[0]);
            }
        }
    }
    //event function
    function transitionEndHandler(e) {
        if (e.target.classList.contains("vlistCon")) {
            if (listening == 1) {
                if (listParent.classList.contains("to_left")) {
                    toggleClass("r", 0);
                    var diff = behindRightValue();
                    if (diff <= 0) {
                        toggleClass("a", 1);
                    }
                    running = 0;
                } else if (listParent.classList.contains("to_right")) {
                    toggleClass("r", 1);
                    var leftValue = null;
                    behindLeftValue() < 0 ? leftValue = -1 * behindLeftValue() : leftValue = behindLeftValue();
                    if (leftValue <= 0) {
                        toggleClass("a", 0);
                    }
                    running = 0;
                }
            }
        }
    }

    function clickHandler(e) {
        //button left
        if (e.target.classList.contains("vListBt-Left") && e.target == buttons[0]) {
            if (listening == 1) {
                if (running == 0) {
                    scrollToRight(e);
                }
            }
        }

        //button Right
        if (e.target.classList.contains("vListBt-Right") && e.target == buttons[1]) {
            if (listening == 1) {
                if (running == 0) {
                    scrollToleft(e);
                }
            }
        }
    }

    function assignHandlers() {
        //List Container
        $$.attachEventHandler("transitionend", "vlistCon", transitionEndHandler);

        //Buttons
        $$.attachEventHandler("click", "vListBt", clickHandler);

        window.addEventListener("resize", function() {
            if (listening == 1) {
                scrollStatus();
            }
        }, false);
    }

    function behindRightValue() {
        var leftValue = null;
        leftValue = behindLeftValue() < 0 ? -1 * behindLeftValue() : behindLeftValue();
        var containerSize = container.getBoundingClientRect()["width"] + spaceError;
        var behindRight = listParent.scrollWidth - (leftValue + (containerSize - (paddingLeft + paddingRight)));
        return Math.ceil(behindRight);
    }

    function behindLeftValue() {
        return listParent.offsetLeft - paddingLeft;
    }

    function addVitalStyles() {
        listParent.style["transition"] = "left " + effects[0] + "s " + effects[1] + ", top " + effects[0] + "s " + effects[1];
        container.setAttribute("style", wrapperStyle);
        stylePlane();
        scrollStatus();
    }

    function scrollToleft(e) {
        if (e.button == 0) {
            var behindRight = behindRightValue();
            if (behindRight > 0) {
                maxAdd = scrollSize;
                var currentPosition = parseInt($$.sm(listParent).cssStyle("left"), "px");
                listParent.classList.add("to_left");
                listParent.classList.contains("to_right") ? listParent.classList.remove("to_right") : null;
                if (behindRight >= maxAdd) {
                    var newPostion = currentPosition - (maxAdd);
                    listParent.style["left"] = newPostion + "px";
                } else {
                    var newPostion = currentPosition - (behindRight);
                    listParent.style["left"] = newPostion + "px";
                }
                running = 1;
            }
        }
    }

    function scrollToRight(e) {
        if (e.button == 0) {
            var behindLeft = behindLeftValue();
            behindLeft = behindLeft == 1?0:behindLeft;
            var currentPosition = parseInt($$.sm(listParent).cssStyle("left"), "px");
            maxAdd = scrollSize;
            
            if (behindLeft <= 0) {
                var ABS_diff = -1 * behindLeft;
                maxAdd = scrollSize;
                var currentPosition = parseInt($$.sm(listParent).cssStyle("left"), "px");

                listParent.classList.add("to_right");
                listParent.classList.contains("to_left") ? listParent.classList.remove("to_left") : null;

                if (ABS_diff >= maxAdd) {
                    var newPostion = currentPosition + (maxAdd);
                    listParent.style["left"] = newPostion + "px";
                } else {
                    var newPostion = currentPosition + (ABS_diff);
                    listParent.style["left"] = newPostion + "px";
                }
                running = 1;
            }
        }
    }

    function scrollStatus() {
        if (listening == 1) { //started
            var behindRight = behindRightValue();
            behindRight > 0 ? toggleClass("r", 1) : toggleClass("a", 1);
        }
    }

    function stylePlane() {
        var listItems = listParent.children;
        var children = listItems.length;
        //style list parent container
        container.classList.add("vlistParentXContainer");

        //Style list parent
        listParent.classList.add("vlistParentX");
        listParent.style["width"] = (children * scrollSize) + "px";
        listParent.style["left"] = paddingLeft + "px";

        //Style list
        for (var list of listItems) {
            list.classList.add("vlist");
        }
    }

    this.config = {};
    this.initialize = function() {
        if (ready == 0) { //Not initialized
            var listItems = listParent.children;
            var children = listItems.length;
            if (inactiveButtonsClassName.length == 0) {
                throw new Error("Setup error: Buttons class not specified");
            }

            if (buttons.length == 0) {
                throw new Error("Setup error: Xbuttons not specified");
            }

            toggleClass("a", 0);
            toggleClass("a", 1);

            if (children < 0) {
                throw new Error("Setup error: No list item found, check the listType specified in the contructor");
            }
            
            listParent.classList.add("vlistCon");
            addVitalStyles();
            assignHandlers();
            ready = 1; //initialized
        }
    };
    this.onScroller = function() {
        if (ready == 1) {
            listening = 1;
            scrollStatus();
        }
    }
    this.offScroller = function() {
        if (ready == 1) {
            listening = 0;
            toggleClass("a", 0);
            toggleClass("a", 1);
        }
    };
    Object.defineProperties(this.config, {
        buttons: {
            set: function(value) {
                var temp = "ListScroller.config.buttons property value must be an array ";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + "of 2 Elements");
                validateArrayMembers(value, "HTMLElement", temp + "of HTMLElements");
                //Add ids
                value[0].classList.add("vListBt", "vListBt-Left");
                value[1].classList.add("vListBt", "vListBt-Right");

                //Add styles
                value[0].style["cursor"] = "pointer";
                value[1].style["cursor"] = "pointer";
                buttons = value;
            }
        },
        scrollSize: {
            set: function(value) {
                validateNumber(value, "Numeric value needed for scrollSize property");
                scrollSize = value;
            }
        },
        paddingRight: {
            set: function(value) {
                if (validateNumber(value, "Numeric value needed for 'paddingRight' property")) {
                    if (value < 0) {
                        paddingRight = 0;
                    } else {
                        paddingRight = value;
                    }
                }
            }
        },
        paddingLeft: {
            set: function(value) {
                validateNumber(value, "Numeric value needed for 'paddingLeft' property");
                if (value < 0) {
                    paddingLeft = 0;
                } else {
                    paddingLeft = value;
                }
            }
        },
        inactiveButtonsClassName: {
            set: function(value) {
                var temp = "inactiveButtonsClassName property value must be an array ";
                validateArray(value, temp);
                validateArrayMembers(value, "string", temp + "of strings");
                if (value.length == 0) {
                    throw new Error("'inactiveButtonsClassName' property value cannot be an empty array");
                } else {
                    if (value.length > 2) {
                        throw new Error("'config.inactiveButtonsClassName' property value must be an array of either 1 or 2 members");
                    } else {
                        inactiveButtonsClassName = value;
                    }
                }
            }
        },
        effects: {
            set: function(value) {
                var temp = "'config.effects' property value must be an array";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + " of 2 Elements");
                validateNumber(value[0], temp + ", having its 1st element to be an numeric type, which represents the speed");
                validateString(value[1], temp + ", having its 2nd element to be a string type, which represents the effect (A CSS valid effect value e.g 'linear')");
                effects = value;
            }
        },
        wrapperStyle: {
            set: function(value) {
                validateString(value, "wrapperStyle property expects a string as value");
                wrapperStyle = value;
            }
        },
        spaceError: {
            set: function(value) {
                if (!validateInteger(value)) throw new Error("config.spaceError property expects an integer");
                spaceError = value < 0 ? 0 : value;
            }
        }
    });
    Object.defineProperties(this, {
        config: { writable: false },
        initialize: { writable: false },
        onScroller: { writable: false },
        offScroller: { writable: false }
    });
}
/****************************************************************/