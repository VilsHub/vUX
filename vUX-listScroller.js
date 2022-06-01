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

/************************ListScroller****************************/
export function ListScroller(container, listParent) {
    /*
    listParent 	=> the ul element
    container	=> Element housing the ul element
    buttons[0]  => left button, 
    buttons[1]  => Right button
    inactiveButtonClassName[0] = left button inactive ClassName
    inactiveButtonClassName[1] = right button inactive ClassName, 
    if inactiveButtonClassName.length = 1 , then button 1 and 2 have the same inactive ClassName
    */
    validateElement(container, "An HTML element needed as list parent container");
    validateElement(listParent, "List parent is not a valid HTML element");
    var paddingRight = 0, paddingLeft = 0, ready = 0, listening = 0, hasButtons = true;
    var buttons = [], scrollSize = 175,scrollSpeed = 290,inactiveButtonClassName = "",wrapperStyle = "width:100%";

    var animationOptions = {
        duration:200,
        timingFunction:"linear"
    }
    
    function toggleClass(type, id) {
        if (type == "r") { //remove
            buttons[id].classList.remove(inactiveButtonClassName);
            buttons[id].style["cursor"] = "pointer";
        } else if (type == "a") { //add
            buttons[id].classList.add(inactiveButtonClassName);
            buttons[id].style["cursor"] = "not-allowed";
        }
    }

    function clickHandler(e) {
        //button left
        if (e.target.classList.contains("vListBt-Left") && e.target == buttons[0]) {
            if (listening == 1 && hasButtons) {
                scrollToRight(e);
            }
        }

        //button Right
        if (e.target.classList.contains("vListBt-Right") && e.target == buttons[1]) {
            if (listening == 1 && hasButtons) {
                scrollToleft(e);
            }
        }
    }

    function assignHandlers() {
        //Buttons
        $$.attachEventHandler("click", "vListBt", clickHandler);

        window.addEventListener("resize", function() {
            if (listening == 1 && hasButtons) {
                scrollStatus(container);
            }
        }, false);

        container.addEventListener("scroll", updateLastValue)
    }

    function updateLastValue(e){
        if(hasButtons){
            var target = e.target;
            var id = target.dataset.animateItem;
            vModel.animate.data.startValue[id] = target.scrollLeft;
            scrollStatus(target);
        }
    }

    async function addVitalStyles() {
        var path = await processAssetPath();
        vModel.core.functions.linkStyleSheet(path+"css/listScroller.css", "listScroller");
        container.setAttribute("style", wrapperStyle);
        stylePlane();
    }

    function scrollToleft(e) {
        if (e.button == 0) {
            var currentScrollSize = container.scrollLeft;
            animationOptions.startValue = currentScrollSize; 
            $$.sm(container).animate(scroll, scrollSize, animationOptions)
        }
    }

    function scroll(ele, drawValue){
        ele.scrollTo(drawValue, 0);
    }

    function initialScroll(){
        // to fixed wrong cursor icon
        animationOptions.startValue = 0;
        $$.sm(container).animate(scroll, 1, animationOptions);
        $$.sm(container).animate(scroll, 0, animationOptions);
        container.scrollTo(0,0);
    }

    function scrollToRight(e) {
        if (e.button == 0) {
            var currentScrollSize = container.scrollLeft;
            animationOptions.startValue = currentScrollSize;
            if (currentScrollSize > 0) {
                $$.sm(container).animate(scroll, (-1*scrollSize), animationOptions);
            }
        }
    }

    function scrollStatus(viewPort) {
        var id = viewPort.dataset.animateItem;
        var maxScrolled = (listParent.scrollWidth - container.clientWidth) + paddingLeft;

        if(container.scrollLeft == 0){// disabled left button
            toggleClass("a", 0);
        }else if (container.scrollLeft > 0){
            toggleClass("r", 0);
        }
        
        if(vModel.animate.data.startValue[id] >= maxScrolled){// disabled right button
            toggleClass("a", 1);
        }else if(vModel.animate.data.startValue[id] < maxScrolled){// enable right button
            toggleClass("r", 1);
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
            
            if(hasButtons){
                if (inactiveButtonClassName == "") {
                    throw new Error("Setup error: Buttons class for inactive state not specified. Specify using the 'config.inactiveButtonClassName' property");
                }
    
                if (buttons.length == 0) {
                    throw new Error("Setup error: scroll buttons not specified. Specify using the 'config.buttons' property");
                }
                assignHandlers();
            }
            
            if (children < 0) {
                throw new Error("Setup error: No list item found, check the listType specified in the contructor");
            }
            
            listParent.classList.add("vlistCon", "noWrap");
            $$.sm(container).scroll.x(true)
            addVitalStyles();
            ready = 1; //initialized
        }
    };
    this.onScroller = function() {
        if (ready == 1) {
            listening = 1;
            if(container.scrollLeft == 0) initialScroll(container);
            scrollStatus(container);
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
                value[0].style["cursor"] = "not-allowed";
                value[1].style["cursor"] = "not-allowed";
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
        inactiveButtonClassName: {
            set: function(value) {
                validateString(value, "config.inactiveButtonClassName property expects a string as value");
                inactiveButtonClassName = value;
            }
        },
        scrollSpeed: {
            set: function(value) {
                validateNumber(value, "'config.scrollSpeed' property value must be an array");
                value = value < 0 ? 1:value;
                scrollSpeed = value;
            }
        },
        wrapperStyle: {
            set: function(value) {
                validateString(value, "config.wrapperStyle property expects a string as value");
                wrapperStyle = value;
            }
        },
        hasButtons: {
            set: function(value){
                validateBoolean(value, "config.hasButtons property expects a boolean as value");
                hasButtons = value;
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