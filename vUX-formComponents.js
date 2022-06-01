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

/********************Custom form component***********************/
export function FormComponents() {
    /*********Helpers***********/
    function withLabel(ele) {
        var labelEle = ele.nextElementSibling == null ? ele.previousElementSibling : ele.nextElementSibling;
        if (labelEle != null) {
            if (labelEle.nodeName == "LABEL") {
                return {
                    status: true,
                    label: labelEle
                }
            } else {
                if (labelEle.nodeName != "DIV") {
                    throw new Error("All input elements to be made custom must be wrapped with a DIV element");
                } else {
                    return {
                        status: false,
                        label: labelEle
                    }
                }
            }
        } else {
            return null;
        }
    }

    function setSuperActive(ele) {
        var anyActive = $$.ss(".superActive");
        anyActive != null ? anyActive.classList.remove("superActive") : null;
        ele.classList.add("superActive");
    }

    function unsetSuperActive(ele) {
        ele.classList.remove("superActive");
    }

    function wrap(type, attribute) {
        if (type == "select") {
            var allWrappable = $$.sa(".xSnative[" + attribute + "]");
            var totalWrappable = allWrappable.length;
            for (var x = 0; x < totalWrappable; x++) {
                var wrapViewPort = allWrappable[x].getAttribute(attribute);
                var wrapper = allWrappable[x].previousElementSibling;
                if (innerWidth <= wrapViewPort) {
                    wrapper.classList.add("xSnativeWrap");
                } else {
                    wrapper.classList.remove("xSnativeWrap");
                }
            }
        } else if (type == "datePicker") {
            var allWrappable = $$.sa(".xDnative[" + attribute + "]");
            var totalWrappable = allWrappable.length;
            for (var x = 0; x < totalWrappable; x++) {
                var wrapViewPort = allWrappable[x].getAttribute(attribute);
                var wrapper = allWrappable[x].previousElementSibling;
                if (innerWidth <= wrapViewPort) {
                    wrapper.classList.add("xDnativeWrap");
                } else {
                    wrapper.classList.remove("xDnativeWrap");
                }
            }
        }

    }
    async function addVitalStyles() {
        var path = await processAssetPath();
        vModel.core.functions.linkStyleSheet(path+"css/formComponents.css", "formComponents");
    }
    addVitalStyles();
    /***************************/

    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom select builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.select = function() {
        var selectDim = [], selectIcon = "",labelAttribute="", wrapperStyle = "",toolTipHandler = null,enableToolTip = false,selectFieldStyle = "", optionStyle = "", selectClassName = "",searchIconStyle = "",wrapAttribute = "",includeSearchField = true, optionsWrapperStyle = "",optionsConWrapperStyle="",familyID = "vSelect",inputButtonStyle = "",sizeAttribute = "",optionStateStyle = [];

        function autoPlace(optionsCon) {
            var sField = optionsCon.previousElementSibling.querySelector(".sField");
            var sFieldBottomOffset = sField.getBoundingClientRect()["bottom"];
            var diff = innerHeight - sFieldBottomOffset;
            var optionsConHeight = getOptionsConHeight(optionsCon);

            //Display in approriate space
            if (sFieldBottomOffset >= diff) {
                if (optionsConHeight <= diff) {
                    optionsCon.style["top"] = (parseInt(selectDim[1]) + 1) + "px";
                    optionsCon.style["bottom"] = "auto";
                } else {
                    optionsCon.style["bottom"] = (parseInt(selectDim[1]) + 1) + "px";
                    optionsCon.style["top"] = "auto";
                }
            } else {
                optionsCon.style["top"] = (parseInt(selectDim[1]) + 1) + "px";
                optionsCon.style["bottom"] = "auto";
            }
        }

        function dumpOptions(container, sOptions, selectField, isMultiple, pid = null, n = { v: 0 }) {
            var totalOptions = sOptions.length;
            var parent = $$.sm(sOptions[0]).getParent(".xSnative");
            for (var x = 0; x < totalOptions; x++) {
                if (sOptions[x].nodeName == "OPTION") { //An option
                    var optionValue = sOptions[x].innerHTML;
                    var optionEle = $$.ce("DIV");
                    var index = sOptions[x].index;
                    sOptions[x].getAttribute("disabled") != null ? optionEle.setAttribute("data-disabled", "true") : optionEle.setAttribute("data-disabled", "false");
                    optionEle.setAttribute("order", ++n.v);
                    if (isMultiple == true) { //multiple select
                        if (sOptions[x].selected) {
                            var comma = selectField.innerHTML.length > 0 ? ", " : "";
                            selectField.innerHTML += comma + sOptions[x].innerHTML;
                            optionEle.classList.add("vSselected");
                        }
                    }else { //single select
                        if (sOptions[x].index === parent.selectedIndex) { //Check for selected
                            if(labelAttribute != ""){
                                var value = "";
                                var labelTemplate = sOptions[x].getAttribute(labelAttribute);
                                value = labelTemplate != null?labelTemplate:sOptions[x].innerHTML
                                selectField.innerHTML = value;
                            }else{
                                selectField.innerHTML = sOptions[x].innerHTML;
                            }
                            optionEle.classList.add("vSselected");
                        }
                    }

                    if (sOptions[x].parentNode.nodeName == "OPTGROUP") {
                        optionEle.classList.add("innerOpt");
                        optionEle.setAttribute("data-pid", pid);
                    }
                    optionEle.classList.add("sOption");
                    optionEle.setAttribute("data-index", index);
                    optionEle.setAttribute("tabindex", "0");
                    optionEle.appendChild(document.createTextNode(optionValue));
                    container.appendChild(optionEle);
                } else {
                    var optionGroupLabel = sOptions[x].getAttribute("Label");
                    var optionGroupEle = $$.ce("DIV");
                    optionGroupEle.classList.add("sOptionGroup");
                    optionGroupEle.setAttribute("data-gid", "g" + x);
                    optionGroupEle.setAttribute("order", ++n.v);
                    optionGroupEle.appendChild(document.createTextNode(optionGroupLabel));
                    container.appendChild(optionGroupEle);
                    var allOptions = sOptions[x].children;
                    dumpOptions(container, allOptions, selectField, isMultiple, "g" + x, n);
                }
            }
        }

        function selectOption(ele, nativeSelect) {
            var labelCon = $$.sm(ele).getParent(2).previousElementSibling.children[0];
            var optionIndex = ele.getAttribute("data-index");
            var isMultiple = nativeSelect.getAttribute("multiple");
            var optionsCon = $$.sm(ele).getParent(2);

            if (isMultiple != null) {
                var selectState = ele.classList.contains("vSselected");
                if (selectState) { //deselect
                    var currentLabel = labelCon.innerHTML.split(",");
                    var trimLabels = currentLabel.map(function(val) {
                        return val.trim();
                    })
                    var index = trimLabels.indexOf(ele.innerHTML.trim());
                    trimLabels.splice(index, 1);
                    var newLabel = trimLabels.join(", ");
                    labelCon.innerHTML = newLabel;
                    ele.classList.remove("vSselected");
                    nativeSelect.options[optionIndex].selected = false;
                } else { //select
                    ele.classList.add("vSselected");
                    var comma = labelCon.innerHTML.length > 0 ? ", " : "";
                    labelCon.innerHTML += comma + ele.innerHTML;
                    nativeSelect.options[optionIndex].selected = true;
                }
                configureToolTip(nativeSelect, labelCon);
            } else {
                //Set slected option in main select input
                nativeSelect.selectedIndex = optionIndex;

                //Update select label
                if(labelAttribute != ""){
                    var option = nativeSelect.options[optionIndex];
                    var labelTemplate = option.getAttribute(labelAttribute);
                    var value = labelTemplate != null?labelTemplate:option.innerHTML
                    labelCon.innerHTML = value;
                }else{
                    labelCon.innerHTML = ele.innerHTML;
                }
                
                //unset existing selected
                var existingSelection = ele.parentNode.querySelector(".vSselected");
                if (existingSelection != null) {
                    existingSelection.classList.remove("vSselected");
                }
                ele.classList.add("vSselected");
                toggleOptionList(optionsCon, "close");
            }

            //Trigger change event on main select input
            nativeSelect.dispatchEvent(new Event("change"));
        };

        function configureToolTip(nativeSelect, labelCon) {
            //Set select mode
            var multiple = false;
            nativeSelect.getAttribute("multiple") != null ? multiple = true : null;
            var tip = labelCon.innerHTML;
            var r = tip.replace(/, /g, "</br>");
            if (enableToolTip && multiple) {
                labelCon.setAttribute("title", r);
                toolTipHandler.refresh();
            }
        }

        function hover(ele) {
            var any = ele.parentNode.querySelector(".hovered");
            any != null ? any.classList.remove("hovered") : null;
            //Add to current
            ele.classList.add("hovered");
        }

        function unhover(ele) {
            ele.classList.remove("hovered");
        }

        function toggleOptionList(optionsCon, action, fast = null) {
            var sField = optionsCon.previousElementSibling.querySelector(".sField");
            var selectButton = sField.nextElementSibling;
            var wrapper = sField.parentNode.parentNode;
            var readyState = (optionsCon.classList.contains("opening") || optionsCon.classList.contains("closing")) ? "no" : "yes";
            if (readyState == "yes") {
                autoPlace(optionsCon);
                if (action == "open") { //open list
                    closeAnyOpen(sField);
                    //show listOptionCon
                    optionsCon.style["display"] = "block";
                    var height = optionsCon.scrollHeight;
                    optionsCon.style["height"] = height + "px";
                    optionsCon.classList.add("opening");
                    sField.setAttribute("data-state", "opened");
                    selectButton.classList.add("iconOpen");
                    selectButton.classList.remove("iconClose");
                    setSuperActive(wrapper);
                } else if (action == "close") { //close list
                    var prevHovered = optionsCon.querySelector(".hovered");
                    var inputEle = optionsCon.querySelector(".sSearchInput");
                    var allHidden = optionsCon.querySelectorAll(".sHide");
                    if (prevHovered != null) {
                        //Remove to current
                        prevHovered.classList.remove("hovered");
                    }
                    if (fast != null) {
                        optionsCon.style["display"] = "none";
                        optionsCon.style["height"] = "0px";
                        sField.setAttribute("data-state", "closed");
                        unsetSuperActive(wrapper);
                    } else {
                        //hide optionsCon
                        optionsCon.style["height"] = optionsCon.scrollHeight + "px";
                        optionsCon.scrollHeight;
                        optionsCon.style["height"] = "0px";
                        optionsCon.classList.add("closing");
                        sField.setAttribute("data-state", "closed");
                        sField.classList.remove("sActive");
                        //unsetting superactive is done in transitionend event
                    }
                    //clear search history
                    includeSearchField ? inputEle.value = "" : null;
                    if (allHidden.length > 0) {
                        var total = allHidden.length;
                        for (var x = 0; x < total; x++) {
                            allHidden[x].classList.remove("sHide");
                        }
                    }
                    selectButton.classList.remove("iconOpen");
                    selectButton.classList.add("iconClose");

                }
            }
        }

        function scrollOptions(ele, dir) {
            var openState = ele.querySelector(".sField").getAttribute("data-state");
            var optionsCon = ele.querySelector(".sOptionCon");
            var nextOption;

            function getNext(whl = false) {
                if (dir == "down") {
                    nextOption = whl == false ? activeHovered.nextElementSibling : nextOption.nextElementSibling;
                    if (nextOption == null) { // set to the last
                        var allOptions = ele.querySelectorAll(".sOption[data-disabled='false']");
                        nextOption = allOptions[0];
                    }
                } else {
                    nextOption = whl == false ? activeHovered.previousElementSibling : nextOption.previousElementSibling;
                    if (nextOption == null) { // set to the last
                        var allOptions = ele.querySelectorAll(".sOption[data-disabled='false']");
                        var total = allOptions.length;
                        nextOption = allOptions[total - 1];
                    }
                }

            }
            if (openState == "opened") {
                var activeHovered = ele.querySelector(".hovered");
                var optionsCon = ele.querySelector(".sOptionCon");
                var order;
                var pixMove;
                var scrolled = optionsCon.scrollTop;
                var targetScroll;
                if (activeHovered == null) {
                    var startHovered = ele.querySelector(".sOption[data-disabled='false']");
                    startHovered.dispatchEvent(new MouseEvent('mouseover', { 'bubbles': true }));
                    order = startHovered.getAttribute("order");
                    pixMove = startHovered.scrollHeight;
                } else {
                    getNext();
                    while (nextOption.classList.contains("sOptionGroup") || nextOption.getAttribute("data-disabled") == "true") {
                        getNext(true);
                    }
                    activeHovered.dispatchEvent(new MouseEvent('mouseout', { 'bubbles': true }));
                    nextOption.dispatchEvent(new MouseEvent('mouseover', { 'bubbles': true }));
                    order = nextOption.getAttribute("order");
                    pixMove = nextOption.scrollHeight;
                }
                targetScroll = (order - 1) * pixMove;
                optionsCon.scrollTo(0, targetScroll);
            }
        }

        function getOptionsConHeight(optionsCon) {
            var children = optionsCon.querySelectorAll(".sOption:not(.sHide)");
            var height = children.length > 0 ? parseInt($$.sm(children[0]).cssStyle("height")) * children.length : 0;
            return height = includeSearchField ? height + (parseInt(selectDim[0]) + 5) : height + 5;
        }

        function closeAnyOpen(ele) {
            var anyOpen = $$.sa(".sField[data-state='opened']");
            var total = anyOpen.length;
            if (total > 0) {
                for (var x = 0; x < total; x++) {
                    var optionsCon = anyOpen[x].parentNode.nextElementSibling;
                    if (anyOpen[x] != ele) {
                        toggleOptionList(optionsCon, "close", "fast");
                    }
                }
            }
        }

        function selectStyleSheet() {
            if ($$.ss("style[data-id='v" + selectClassName + "']") == null) {

                var css = "";
                css += ".v" + selectClassName + "{width:" + selectDim[0] + "; height:" + selectDim[1] + "; z-index: 60;"+"}";
                css += ".v" + selectClassName + " .sField {line-height:" + selectDim[1] + ";}";
                css += ".v" + selectClassName + " .sIcon::before {line-height:" + selectDim[1] + ";}";
                css += ".v" + selectClassName + " .sSearchBox::before {line-height:" + selectDim[1] + ";height:" + selectDim[1] + "}";
                
                if (wrapperStyle != "") css += ".v" + selectClassName + "{"+wrapperStyle+"}";
                
                if (selectFieldStyle != "") css += ".v" + selectClassName + " .sField {"+selectFieldStyle+"}";
                
                if (selectIcon != "") css += ".v" + selectClassName + " .sIcon::before {" + selectIcon + "}";

                if (searchIconStyle != "") css += ".v" + selectClassName + " .sSearchBox::before{" + searchIconStyle + "}";
                
                if (optionsConWrapperStyle != "") css += ".v" + selectClassName + " .optionsCon{" + optionsConWrapperStyle + "}";//the wrapper of select options parent
                    
                if (optionsWrapperStyle != "") css += ".v" + selectClassName + " .optionsCon .sOptionCon{" + optionsWrapperStyle + "}";//the wrapper of select options
                    
                if (optionStyle != "") css += ".v" + selectClassName + " .sOptionCon .sOption{" + optionStyle + "}"; //The option it self, in which optionsWrapper is the parent
                    
                if (inputButtonStyle != "") css += ".v" + selectClassName + " .sIcon{" + inputButtonStyle + "}";

                if (optionStateStyle[0] != undefined) css += ".v" + selectClassName + " .optionsCon .hovered {" + optionStateStyle[0] + "}";//hover state
                    
                if (optionStateStyle[1] != undefined) css += ".v" + selectClassName + " .optionsCon .vSselected {" + optionStateStyle[1] + "}";//selected state
                    
                attachStyleSheet("v" + selectClassName, css);
            }
        }

        function reCreateSelect() {
            var allSelects = $$.sa("." + selectClassName);
            for (var x = 0; x < allSelects.length; x++) {
                runSelectBuild(allSelects[x]);
            }
        }

        function runSelectBuild(nativeSelect) {
            var selectParent = nativeSelect.parentNode;
            var multiple = false;
            var selectParentPosition = $$.sm(selectParent).cssStyle("position");

            var dimension = nativeSelect.getAttribute(sizeAttribute);
            if (dimension == null) {
                throw new Error("One of the native select input to be made custom has no dimension specified with the " + sizeAttribute + " attribute");
            }
            var temp = "Select input " + sizeAttribute + " value contains invalid CSS size";
            var parseDimension = dimension.split(",");
            validateDimension(parseDimension[0], temp);
            validateDimension(parseDimension[1], temp);
            selectDim[0] = parseDimension[0];
            selectDim[1] = parseDimension[1];

            //hideNative
            nativeSelect.classList.add("xSnative", "vItem"); //vItem added for validation module support
            nativeSelect.setAttribute("tabindex", "-1");

            //Style parent
            selectParentPosition == "static" ? selectParent.style.position = "relative" : null;

            //Set select mode
            nativeSelect.getAttribute("multiple") != null ? multiple = true : null;
            
            //check existing custom element
            var current = selectParent.querySelector(".v"+selectClassName);
            if(current != null){
                selectParent.removeChild(current);
            }

            //Wrapper Element
            var wrapper = $$.ce("DIV");
            wrapper.classList.add("vSelect", "v" + selectClassName);
            wrapper.setAttribute("tabindex", "0");            

            //Select field
            var selectFieldCon = $$.ce("DIV");
            var selectField = $$.ce("DIV");
            var selectIcon = $$.ce("DIV");
            
            selectFieldCon.classList.add("sFieldCon");
            // selectFieldCon.style["height"] = selectDim[1];
            selectField.classList.add("sField");
            
            if(multiple){
                selectField.classList.add("selectInput-"+selectClassName);
            }
            
            selectField.setAttribute("data-state", "closed");
            selectIcon.classList.add("sIcon", "iconClose");
            selectFieldCon.appendChild(selectField);
            selectFieldCon.appendChild(selectIcon);

            //append into wrapper
            wrapper.appendChild(selectFieldCon);

            //Options Field
            var optionsFieldCon = $$.ce("DIV");
            var optionsField = $$.ce("DIV");
            optionsFieldCon.classList.add("optionsCon");

            optionsField.classList.add("sOptionCon");

            // Search field
            if (includeSearchField == true) {
                var selectSearchBox = $$.ce("DIV");
                var selectSearchInput = $$.ce("INPUT");
                selectSearchBox.classList.add("sSearchBox");
                selectSearchInput.classList.add("sSearchInput");
                selectSearchInput.setAttribute("tabindex", "0");
                selectSearchInput.setAttribute("placeholder", "Search...");
                selectSearchBox.appendChild(selectSearchInput);
                optionsFieldCon.appendChild(selectSearchBox);
            }

            //Get native select children
            var navtieSelectChildren = nativeSelect.children;
            var totalNavtieSelectChildren = navtieSelectChildren.length;
            if (totalNavtieSelectChildren > 0) {
                dumpOptions(optionsField, navtieSelectChildren, selectField, multiple);
            }

            optionsFieldCon.appendChild(optionsField);

            //append to wrapper
            wrapper.appendChild(optionsFieldCon);

            //insert wrapper before native select
            selectParent.insertBefore(wrapper, nativeSelect);


            //configure Tooltip
            if (multiple) {
                import("./vUX-toolTip.js")
                .then(function(module){
                    toolTipHandler = new module.ToolTip();
                    toolTipHandler.config.className = "selectInput-"+selectClassName;
                    toolTipHandler.initialize();
                    if (enableToolTip) {
                        configureToolTip(nativeSelect, selectField);
                    }
                })
            };
        }

        function selectInputState(ele, id) {
            var status;
            if (id == "icon") {
                status = ele.previousElementSibling.getAttribute("data-state")
            } else if (id == "sfield") {
                status = ele.getAttribute("data-state")
            }
            return status;
        }

        function assignSelectEventHandler() {
            $$.attachEventHandler("transitionend", "optionsCon", function(e) {
                if (e.target.classList.contains("closing")) { //close
                    var wrapper = e.target.parentNode;
                    e.target.style["display"] = "none";
                    e.target.classList.remove("closing");
                    unsetSuperActive(wrapper);
                } else if (e.target.classList.contains("opening")) {
                    e.target.classList.remove("opening");
                }
            })
            $$.attachEventHandler("click", ["sIcon", "sOption", "sField"], function(e, id) {
                if (id == "sIcon") {
                    var openState = selectInputState(e.target, "icon");
                    var optionsCon = $$.sm(e.target).getParent(2).querySelector(".optionsCon");
                    var nativeSelect = $$.sm(e.target).getParent(2).nextElementSibling; 

                    if (openState == "opened") { //close
                        toggleOptionList(optionsCon, "close");
                    } else { //open
                        nativeSelect.click(); //to fix validation focus error for select input
                        toggleOptionList(optionsCon, "open");
                    }
                } else if (id == "sOption") {
                    if (e.detail == 1) {
                        if (e.target.getAttribute("data-disabled") == "false") {
                            var mainSelect = $$.sm(e.target).getParent(3).nextElementSibling;
                            selectOption(e.target, mainSelect);
                        }
                    }
                } else if (id == "sField") {
                    var openState = selectInputState(e.target, "sfield");
                    var optionsCon = e.target.parentNode.nextElementSibling;
                    var nativeSelect = $$.sm(e.target).getParent(2).nextElementSibling; 
                    if (openState == "opened") { //close
                        toggleOptionList(optionsCon, "close");
                    } else { //open
                        nativeSelect.click(); //to fix validation focus error for select input
                        toggleOptionList(optionsCon, "open");
                    }
                }
            });
            $$.attachEventHandler("mouseover", "sOption", function(e) {
                if (e.target.getAttribute("data-disabled") == "false") {
                    hover(e.target);
                }
            });
            $$.attachEventHandler("mouseout", "sOption", function(e) {
                unhover(e.target);
            });
            $$.attachEventHandler("dblclick", "sOption", function(e) {
                if (e.detail == 2) {
                    var selectButton = $$.sm(e.target).getParent(2).previousElementSibling.children[1];
                    var optionsCon = $$.sm(e.target).getParent(2);
                    toggleOptionList(optionsCon, "close");
                    selectButton.classList.add("iconClose");
                    selectButton.classList.remove("iconOpen");
                }
            })
            $$.attachEventHandler("input", "sSearchInput", function(e) {
                var searchQuery = e.target.value.toLowerCase();
                var optionsCon = e.target.parentNode.nextElementSibling;
                var allOptions = optionsCon.querySelectorAll("div");
                var optionsConParent = optionsCon.parentNode;

                searchQuery = RegExp.parseChars(searchQuery);
                var total = allOptions.length;

                function checkQuery(option) {
                    var OptionLabel = option.innerHTML.trim().toLowerCase();
                    if (OptionLabel.search(searchQuery) != -1) {
                        option.classList.remove("sHide");
                    } else {
                        option.classList.add("sHide");
                    }
                }
                for (var x = 0; x < total; x++) {
                    if (allOptions[x].classList.contains("sOption")) {
                        checkQuery(allOptions[x]);
                    } else if (allOptions[x].classList.contains("sOptionGroup")) {
                        var id = allOptions[x].getAttribute("data-gid");
                        var groupChildren = allOptions[x].parentNode.querySelectorAll("[data-pid='" + id + "']");
                        var totalGroupChildren = groupChildren.length;
                        for (var y = 0; y < totalGroupChildren; y++) {
                            checkQuery(groupChildren[y]);
                        }

                        // Hide option group when all children a hidden
                        var allHiddenChildren = allOptions[x].parentNode.querySelectorAll(".sHide[data-pid='" + id + "']");
                        var parsedHiddenLength = allHiddenChildren != null ? allHiddenChildren.length : 0;
                        if (groupChildren.length == parsedHiddenLength) {
                            allOptions[x].classList.add("sHide");
                        } else {
                            allOptions[x].classList.remove("sHide");
                        }
                    }
                }
                optionsConParent.style["height"] = "auto";
                autoPlace(optionsConParent);
            })
            $$.attachEventHandler("keydown", "v" + selectClassName, function(e) {
                var khdlr = keyboardEventHanler(e);
                var optionsCon = e.target.querySelector(".optionsCon");
                var sField = e.target.querySelector(".sField");
                if (khdlr["handled"] == true) {
                    if (khdlr["type"] == 1) {
                        // Suppress "double action" if event handled
                        closeAnyOpen(sField);
                        toggleOptionList(optionsCon, "open");
                        if (e.key == "ArrowDown" | "Down") {
                            e.preventDefault();
                            scrollOptions(e.target, "down");
                        } else if (e.key == "ArrowUp" | "Up") {
                            e.preventDefault();
                            scrollOptions(e.target, "up");
                        } else if (e.key == "Enter") {
                            var ele = e.target.querySelector(".hovered");
                            var nativeSelect = e.target.nextElementSibling;
                            selectOption(ele, nativeSelect);
                        }
                    } else if (khdlr["type"] == 2) {

                    } else if (khdlr["type"] == 3) {

                    }
                }
            })
            $$.attachEventHandler("focusin", "sOption", function(e) {
                hover(e.target);
            })
            addEventListener("scroll", function() {
                var anyOpen = $$.ss(".sField[data-state='opened']");
                if (anyOpen != null) {
                    var optionsCon = anyOpen.parentNode.nextElementSibling;
                    autoPlace(optionsCon);
                }
            }, false)
            document.addEventListener("click", function(e) {
                if (!$$.sm(e.target).hasParent(familyID, 4)) {
                    var anyOpen = $$.ss(".sField[data-state='opened']");
                    if (anyOpen != null) {
                        var optionsCon = anyOpen.parentNode.nextSibling;
                        toggleOptionList(optionsCon, "close", "fast");
                    }
                }
            }, false)
            addEventListener("resize", function(e) {
                if (wrapAttribute != "") wrap("select", wrapAttribute);
            }, false)
        }

        var body = {
            autoBuild: function() {
                if (selectClassName == "") {
                    throw new Error("Setup imcomplete: slect input class name must be supllied, specify using the 'config.className' property");
                }
                if (sizeAttribute == "") {
                    throw new Error("Setup imcomplete: slect input size attribute to be used has not been specified, the attribute to be used must be specified using the 'config.sizeAttribute' property");
                }
                var existingSheet = $$.ss("#v" + selectClassName);

                reCreateSelect();
                existingSheet == null ? selectStyleSheet() : null;
                assignSelectEventHandler();
                if (wrapAttribute != "") wrap("select", wrapAttribute);
            },
            refreshSelect: function(nativeSelect) { //Refreshes a particular select element to update custom content
                validateElement(nativeSelect, "select.refreshSelect() method expects a valid DOM element as argument 1");
                nativeSelect.classList.contains(selectClassName) ? runSelectBuild(nativeSelect) : null;
            },
            refresh: function(parent=null) {
                if (parent != null ) validateElement(parent, "select.refresh() method expects a valid DOM element as argument 1");
                var allNewSelect = parent != null ? parent.querySelectorAll("select:not(.xSnative)"):$$.sa("."+selectClassName);
                var totalNewSelects = allNewSelect.length;
                if (totalNewSelects > 0) {
                    for (var x = 0; x < totalNewSelects; x++) {
                        allNewSelect[x].classList.contains(selectClassName) ? runSelectBuild(allNewSelect[x]) : null;
                    }
                }
            },
            config: {}
        }

        Object.defineProperties(body, {
            autoBuild: { writable: false },
            refresh: { writable: false },
            refreshSelect: { writable: false },
            config: { writable: false }
        })
        Object.defineProperties(body.config, {
            sizeAttribute: {
                set: function(value) {
                    validateString("'config.sizeAttribute' property value must be a string");
                    sizeAttribute = value;
                }
            },
            wrapAttribute: {
                set: function(value) {
                    validateString("'config.wrapAttribute' property value must be a string");
                    wrapAttribute = value;
                }
            },
            wrapperStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property");
                    wrapperStyle = value;
                }
            },
            selectFieldStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'selectFieldStyle' property");
                    selectFieldStyle = value;
                }
            },
            optionsWrapperStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'optionsWrapperStyle' property");
                    optionsWrapperStyle = value;
                }
            },
            optionsConWrapperStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'optionsConWrapperStyle' property");
                    optionsConWrapperStyle = value;
                }
            },
            optionStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'optionStyle' property");
                    optionStyle = value;
                }
            },
            optionGroupStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'config.optionGroupStyle' property");
                    optionGroupStyle = value;
                }
            },
            inputIconStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'config.inputIconStyle' property");
                    selectIcon = value;
                }
            },
            inputButtonStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'config.inputButtonStyle' property");
                    inputButtonStyle = value;
                }
            },
            className: {
                set: function(value) {
                    validateString(value, "config.className property expect a string as value");
                    selectClassName = value;
                }
            },
            selectFieldToolTip: {
                set: function(value) {
                    validateBoolean(value, "config.selectFieldToolTip property expect a boolean as value");
                    enableToolTip = value;
                }
            },
            searchIconStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'config.searchIconStyle' property");
                    searchIconStyle = value;
                }
            },
            includeSearchField: {
                set: function(value) {
                    validateBoolean(value, "config.includeSearchField property expect a boolean as value");
                    includeSearchField = value;
                }
            },
            optionStateStyle: {
                set: function(value) {
                    var temp = "config.optionStateStyle property expect an array";
                    validateArray(value, temp + " as value");
                    if (value.length > 2 || value.length < 1) {
                        throw new Error(temp + " of 1 or 2 members");
                    }
                    validateArrayMembers(value, "string", temp + " of string(s) holding valid CSS styles");
                    optionStateStyle = value;
                }
            },
            labelAttribute:{
                //The attribute that will hold the value of what will be displayed as label on the select filed
                //The attribute must be supplied on the native option element and not the select element
                set: function(value) {
                    validateString(value, "config.labelAttribute property expect a string as value");
                    labelAttribute = value;
                }
            }
        })
        return body;
    };
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom radio builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.radio = function() {
        var radioDim = [],radioWrapperStyle = "",selectedStyle = "",deselectedStyle = "",radioClassName = "", mouseEffect = [],axisClass = [];
        /************************************************************************************/
        /* radioDim[a,b] a=> width of select cElement , b=> height of select cElemt
        /* mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
        /* axisClass[a, b] = a=> x axis class name, b=> y axis class name
        /* The axisClasses should be applied on group input warapper
        /************************************************************************************/

        function radioStyleSheet() {
            if ($$.ss("style[data-id='v" + radioClassName + "']") == null) {
                var css = "";
                css += ".v" + radioClassName + " {width:" + radioDim[0] + "; height:" + radioDim[1] + "}";
                css += ".v" + radioClassName + " .deselected:hover::before{" + mouseEffect[0] + ";}";
                css += ".v" + radioClassName + " .deselected:active::before{" + mouseEffect[1] + ";}";
                css += ".v" + radioClassName + " .selected::before{font-size:" + radioDim[0] + ";}";
                css += ".v" + radioClassName + " .deselected::before{font-size:" + radioDim[0] + ";}";

                if (selectedStyle != "") {
                    css += ".v" + radioClassName + " .selected::before {" + selectedStyle + "}";
                }
                if (deselectedStyle != "") {
                    css += ".v" + radioClassName + " .deselected::before{" + deselectedStyle + "}";
                }
                attachStyleSheet("v" + radioClassName, css);
            }
        }

        function reCreateRadio() {
            var allRadios = $$.sa("." + radioClassName);
            for (var x = 0; x < allRadios.length; x++) {
                runRadioBuild(allRadios[x]);
            }
        }

        function runRadioBuild(nativeRadioButton) {
            var hasLabel = withLabel(nativeRadioButton);
            var parent = nativeRadioButton.parentNode;
            var radioParentPosition = $$.sm(parent).cssStyle("position");

            //hideNative
            nativeRadioButton.classList.add("xRnative", "vItem"); //vItem added for validation module support
            nativeRadioButton.setAttribute("tabindex", "-1");
            radioParentPosition == "static" ? parent.style.position = "relative" : null;

            if (hasLabel["status"]) {
                hasLabel["label"].style["min-height"] = radioDim[1];
                hasLabel["label"].classList.add("vRadioButtonLabel");
            }

            //check existing custom element
            var current = parent.querySelector(".v"+radioClassName);
            if(current != null){
                parent.removeChild(current);
            }

            var radioWrapper = $$.ce("DIV");
            radioWrapper.classList.add("vRadioButtonWrapper", "v" + radioClassName);

            var customRadioButtonSelected = $$.ce("DIV");
            var customRadioButtonDeselected = $$.ce("DIV");

            if(axisClass.length == 1){
                if(axisClass[0] != ""){
                    if ($$.sm(nativeRadioButton).hasParent(axisClass[0], 3)) { //is x axis
                        // parent.style["display"] = "";
                    }
                }
            }else if(axisClass.length == 2){
                if(axisClass[0] != "" && axisClass[1] != ""){
                    if ($$.sm(nativeRadioButton).hasParent(axisClass[0], 3)) { //is x axis
                        // parent.style["display"] = "";
                    } else if ($$.sm(nativeRadioButton).hasParent(axisClass[1], 3)) { //is y axis
                        parent.style["display"] = "flex";
                    }
                }else if((axisClass[0] != "" && axisClass[1] == "")){
                    if ($$.sm(nativeRadioButton).hasParent(axisClass[0], 3)) { //is x axis
                        // parent.style["display"] = "";
                    }
                }else if((axisClass[0] == "" && axisClass[1] != "")){
                    if ($$.sm(nativeRadioButton).hasParent(axisClass[1], 3)) { //is y axis
                        parent.style["display"] = "flex";
                    }
                }
            }


            var selectIndex = 0;
            var deselectIndex = 0;
            if (nativeRadioButton.checked) {
                selectIndex = 1;
                radioWrapper.setAttribute("data-selected", 1);
                customRadioButtonSelected.setAttribute("tabindex", "0");
                customRadioButtonSelected.setAttribute("class", "vRadioButton selected");
                customRadioButtonDeselected.setAttribute("tabindex", "-1");
            } else {
                deselectIndex = 1;
                customRadioButtonDeselected.setAttribute("class", "vRadioButton deselected");
                radioWrapper.setAttribute("data-selected", 0);
                customRadioButtonDeselected.setAttribute("tabindex", "0");
                customRadioButtonSelected.setAttribute("tabindex", "-1");
            }

            customRadioButtonDeselected.classList.add("vRadioButton", "ds");
            customRadioButtonSelected.classList.add("vRadioButton", "sel");
            customRadioButtonSelected.setAttribute("style", "z-index:" + selectIndex);
            customRadioButtonDeselected.setAttribute("style", "z-index:" + deselectIndex);


            if (radioWrapperStyle != "") {
                radioWrapper.setAttribute("style", radioWrapperStyle);
            }

            radioWrapper.appendChild(customRadioButtonSelected);
            radioWrapper.appendChild(customRadioButtonDeselected);

            //Add wrapper before target select;
            var radioParent = nativeRadioButton.parentNode;
            radioParent.insertBefore(radioWrapper, nativeRadioButton);
        }

        function assignRadioEventHanler() {
            $$.attachEventHandler("click", "vRadioButton", function(e) {
                e.stopImmediatePropagation();
                var mainRadio = e.target.parentNode.nextElementSibling;
                if (e.target.classList.contains("ds")) { //Select non selected
                    //deselect any selected
                    var totalradios = $$.sm(e.target).getParent(3).querySelectorAll("." + radioClassName);
                    if (totalradios.length > 1) {
                        var nxt = null;
                        var activeSelected = $$.sm(e.target).getParent(3).querySelector(".selected");
                        if (activeSelected != null) {
                            var nxt = activeSelected.parentNode.querySelector(".ds");
                            hideClicked(activeSelected, nxt, "any");
                        }
                    }
                    var nxt = e.target.parentNode.querySelector(".sel");
                    hideClicked(e.target, nxt, "checked");
                }
                mainRadio.click();
            })
            $$.attachEventHandler("click", "vRadioButtonLabel", function(e) {
                e.stopImmediatePropagation();
                var targetRadio = e.target.parentNode.querySelector("[tabindex='0']");
                targetRadio != null ? targetRadio.click() : null;
            })
        }

        function hideClicked(ele, nxt, type) {
            if (type == "any") {
                //Show deslelect radio
                if (nxt != null) {
                    nxt.classList.add("deselected");
                    nxt.classList.remove("selected");
                }

                //hide selected radio
                ele.classList.remove("selected");
            } else {
                //Show slelect radio
                nxt.classList.add("selected");
                nxt.classList.remove("deselected");

                //hide deselected radio
                ele.classList.remove("deselected");
            }

            //style next
            nxt.setAttribute("tabindex", "0");
            nxt.style["z-index"] = 1;
            nxt.style["width"] = "100%";
            nxt.style["height"] = "100%";

            //style current
            ele.setAttribute("tabindex", "-1");
            ele.style["z-index"] = 0;
            ele.style["width"] = "0%";
            ele.style["height"] = "0%";
        }
        var body = {
            autoBuild: function() {
                if (radioDim.length == 0) {
                    throw new Error("Setup imcomplete: radio component dimension needed, specify using the 'radioButtonSize' property");
                }
                if (radioClassName == "") {
                    throw new Error("Setup imcomplete: radio buttons class name must be supllied, specify using the 'config.className' property");
                }
                if (axisClass.length == 0) {
                    console.warn("radio input axis class(es) has not been specified on the input parent, group radio input may fail to display as expected, the class(es) is specified using the 'config.axisClass' property");
                }
                var existingSheet = $$.ss("#v" + radioClassName);
                existingSheet == null ? radioStyleSheet() : null;
                reCreateRadio();
                assignRadioEventHanler();
            },
            refresh: function(parent) {
                validateElement(parent, "radio.refresh() method expects a valid DOM element as argument 1");
                var allNewRadios = parent.querySelectorAll("input[type='radio']:not(.xRnative)");
                
                var totalNewRadios = allNewRadios.length;
                if (totalNewRadios > 0) {
                    for (var x = 0; x < totalNewRadios; x++) {
                        allNewRadios[x].classList.contains(radioClassName) ? runRadioBuild(allNewRadios[x]) : null;
                    }
                }
            },
            config: {}
        }

        Object.defineProperties(body, {
            autoBuild: { writable: false },
            config: { writable: false },
            refresh: { writable: false }
        })
        Object.defineProperties(body.config, {
            radioButtonSize: {
                set: function(value) {
                    var temp = "'config.radioButtonSize' property value must be an array";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + " of 2 Elements");
                    validateArrayMembers(value, "dimension", temp + " of strings CSS dimensions");
                    radioDim = value;
                }
            },
            wrapperStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")) {
                        radioWrapperStyle = value;
                    }
                }
            },
            selectedRadioStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS style(s) needed for the 'selectedStyle' property")) {
                        selectedStyle = value;
                    }
                }
            },
            deselectedRadioStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedStyle' property")) {
                        deselectedStyle = value;
                    }
                }
            },
            mouseEffectStyle: {
                set: function(value) {
                    var temp = "'config.mouseEffectStyle' property value must be an array";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + " of 2 Elements");
                    validateArrayMembers(value, "string", temp + " of strings");
                    mouseEffect = value;
                }
            },
            className: {
                set: function(value) {
                    if (validateString(value, "config.className property expect a string as value")) {
                        radioClassName = value;
                    }
                }
            },
            axisClass: {
                set: function(value) {
                    var temp = "'config.axisClass' property value must be an array";
                    validateArray(value, temp);
                    if (value.length > 2 || value.length < 1) {
                        throw new Error(temp + " of 1 or 2 members");
                    }
                    validateArrayMembers(value, "string", temp + " of strings values");
                    axisClass = value;
                }
            }
        })
        return body;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom checkBox builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.checkbox = function() {
        var checkboxDim = [],checkboxWrapperStyle = "",checkedStyle = "",uncheckedStyle = "",checkboxClassName = "",mouseEffect = [];
        /************************************************************************************/
        //checkboxDim[a,b] a=> width of checkbox cElement , b=> height of checkbox cElemt
        //mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
        /************************************************************************************/

        function checkboxStyleSheet() {
            if ($$.ss("style[data-id='v" + checkboxClassName + "']") == null) {
                var css = "";
                css += ".v" + checkboxClassName + " {width:" + checkboxDim[0] + "; height:" + checkboxDim[1] + "}";
                mouseEffect[0] != undefined ? css += ".v" + checkboxClassName + " .unchecked:hover::before{" + mouseEffect[0] + ";}" : null;
                mouseEffect[1] != undefined ? css += ".v" + checkboxClassName + " .unchecked:active::before{" + mouseEffect[1] + ";}" : null;
                css += ".v" + checkboxClassName + " .checked::before{font-size:" + checkboxDim[0] + ";}";
                css += ".v" + checkboxClassName + " .unchecked::before{font-size:" + checkboxDim[0] + ";}";

                if (checkedStyle != "") {
                    css += ".v" + checkboxClassName + " .checked::before {" + checkedStyle + "}";
                }
                if (uncheckedStyle != "") {
                    css += ".v" + checkboxClassName + " .unchecked::before{" + uncheckedStyle + "}";
                }
                attachStyleSheet("v" + checkboxClassName, css);
            }
        }

        function reCreateCheckbox() {
            var allCheckboxes = $$.sa("." + checkboxClassName);
            for (var x = 0; x < allCheckboxes.length; x++) {
                runCheckboxBuild(allCheckboxes[x]);
            }
        }

        function runCheckboxBuild(nativeCheckbox) {
            var hasLabel = withLabel(nativeCheckbox);
            var parent = nativeCheckbox.parentNode;
            var checkboxParentPosition = $$.sm(parent).cssStyle("position");

            //hideNative
            nativeCheckbox.classList.add("xCnative", "vItem"); //vItem added for validation module support
            nativeCheckbox.setAttribute("tabindex", "-1");
            checkboxParentPosition == "static" ? parent.style.position = "relative" : null;
            if (hasLabel != null) {
                if (hasLabel["status"]) {
                    hasLabel["label"].style["min-height"] = checkboxDim[1];
                    hasLabel["label"].classList.add("vCheckboxLabel");
                }
            }

            //check existing custom element
            var current = parent.querySelector(".v"+checkboxClassName);
            if(current != null){
                parent.removeChild(current);
            }

            var checkboxWrapper = $$.ce("DIV");
            checkboxWrapper.classList.add("vCheckboxWrapper", "v" + checkboxClassName);

            var customCheckboxChecked = $$.ce("DIV");
            var customCheckboxUnchecked = $$.ce("DIV");


            var checkedIndex = 0;
            var uncheckedIndex = 0;
            if (nativeCheckbox.checked) {
                checkedIndex = 1;
                checkboxWrapper.setAttribute("data-checked", 1);
                customCheckboxChecked.setAttribute("tabindex", "0");
                customCheckboxChecked.setAttribute("class", "vCheckbox checked");
                customCheckboxUnchecked.setAttribute("tabindex", "-1");
            } else {
                uncheckedIndex = 1;
                customCheckboxUnchecked.setAttribute("class", "vCheckbox unchecked");
                checkboxWrapper.setAttribute("data-checked", 0);
                customCheckboxUnchecked.setAttribute("tabindex", "0");
                customCheckboxChecked.setAttribute("tabindex", "-1");
            }

            customCheckboxUnchecked.classList.add("vCheckbox", "unchk");
            customCheckboxChecked.classList.add("vCheckbox", "chk");
            customCheckboxChecked.setAttribute("style", "z-index:" + checkedIndex);
            customCheckboxUnchecked.setAttribute("style", "z-index:" + uncheckedIndex);


            if (checkboxWrapperStyle != "") {
                checkboxWrapper.setAttribute("style", checkboxWrapperStyle);
            }

            checkboxWrapper.appendChild(customCheckboxChecked);
            checkboxWrapper.appendChild(customCheckboxUnchecked);

            //Add wrapper before target select;
            var checkboxParent = nativeCheckbox.parentNode;
            checkboxParent.insertBefore(checkboxWrapper, nativeCheckbox);
        }

        function assignCheckboxEventHanler() {
            $$.attachEventHandler("click", "vCheckbox", function(e) {
                e.stopImmediatePropagation();
                var mainCheckbox = e.target.parentNode.nextElementSibling;
                if (e.target.classList.contains("unchk")) { //check action, apply check
                    var nxt = e.target.parentNode.querySelector(".chk");
                    toggleCheckbox(e.target, nxt, "check");
                } else {
                    var nxt = e.target.parentNode.querySelector(".unchk");
                    toggleCheckbox(e.target, nxt, "unchecked"); //uncheck action, apply uncheck
                }

                mainCheckbox.click();
            })
            $$.attachEventHandler("click", "vCheckboxLabel", function(e) {
                e.stopImmediatePropagation();
                var targetCheckbox = e.target.parentNode.querySelector("[tabindex='0']");
                targetCheckbox != null ? targetCheckbox.click() : null;
            })
        }

        function toggleCheckbox(ele, nxt, type) {
            if (type == "check") {
                //Show checked checkbox
                nxt.classList.add("checked");
                nxt.classList.remove("unchecked");

                //hide unchecked checkbox
                ele.classList.remove("unchecked");
            } else {
                //Show unchecked checkbox
                nxt.classList.add("unchecked");
                nxt.classList.remove("checked");

                //hide checked checkbox
                ele.classList.remove("checked");
            }


            //style next
            nxt.setAttribute("tabindex", "0");
            nxt.style["z-index"] = 1;
            nxt.style["width"] = "100%";
            nxt.style["height"] = "100%";

            //style current
            ele.setAttribute("tabindex", "-1");
            ele.style["z-index"] = 0;
            ele.style["width"] = "0%";
            ele.style["height"] = "0%";
            ele.style["visibility"] = "";
        }

        var body = {
            autoBuild: function() {
                if (checkboxDim.length == 0) {
                    throw new Error("Setup imcomplete: checkbox component dimension needed, specify using the 'checkboxSize' property");
                }
                if (checkboxClassName == "") {
                    throw new Error("Setup imcomplete: checkbox buttons class name must be supllied, specify using the 'config.className' property");
                }
                var existingSheet = $$.ss("#v" + checkboxClassName);
                existingSheet == null ? checkboxStyleSheet() : null;
                reCreateCheckbox();
                assignCheckboxEventHanler();
            },
            refresh: function(parent) {
                validateElement(parent, "checkbox.refresh() method expects a valid DOM element as argument 1");
                var allNewCheckboxes = parent.querySelectorAll("input[type='checkbox']:not(.xCnative)");
                var totalNewCheckboxes = allNewCheckboxes.length;
                if (totalNewCheckboxes > 0) {
                    for (var x = 0; x < totalNewCheckboxes; x++) {
                        allNewCheckboxes[x].classList.contains(checkboxClassName) ? runCheckboxBuild(allNewCheckboxes[x]) : null;
                    }
                }
            },
            config: {}
        }

        Object.defineProperties(body, {
            autoBuild: { writable: false },
            config: { writable: false },
            refresh: { writable: false }
        })
        Object.defineProperties(body.config, {
            checkboxSize: {
                set: function(value) {
                    var temp = "'config.radioButtonSize' property value must be an array";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + " of 2 Elements");
                    validateArrayMembers(value, "dimension", temp + " of strings CSS dimensions");
                    checkboxDim = value;
                }
            },
            wrapperStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")) {
                        checkboxWrapperStyle = value;
                    }
                }
            },
            checkedCheckboxStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS style(s) needed for the 'selectedStyle' property")) {
                        checkedStyle = value;
                    }
                }
            },
            uncheckedCheckboxStyle: {
                set: function(value) {
                    if (validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedStyle' property")) {
                        uncheckedStyle = value;
                    }
                }
            },
            mouseEffectStyle: {
                set: function(value) {
                    var temp = "'config.mouseEffectStyle' property value must be an array";
                    validateArray(value, temp);
                    validateArrayLength(value, 2, temp + " of 2 Elements");
                    validateArrayMembers(value, "string", temp + " of strings");
                    mouseEffect = value;
                }
            },
            className: {
                set: function(value) {
                    validateString(value, "config.className property expect a string as value")
                    checkboxClassName = value;
                }
            }
        })
        return body;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Date Picker^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.datePicker = function() {
        var falseState = "cX.1zwAP",trueState = "mp.3Cy._Xa";
        var tooTipHandler = null,dateInputIconStyle = [],daysToolTip = false,months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],  mobileView = 320, labelProperties = [], daysToolTipProperties = {backgroundColor:"purple",fontColor:"white"}, datePickerClassName = "",datePickerDim = [], dateFieldStyle = "", selectionStyle = "", validationAttribute = "", familyID = "vDatePicker", listControllerObj = null, inputButtonStyle = ""; 
        var vBoxWidth = 300, initX = 10, wrapAttribute = "", paddingRight = 10, maxX = null, arrowXpos = 0, boxXpos = null, sizeAttribute = "";

        function autoPlace(dateBox) {
            var dField = dateBox.previousElementSibling.children[0];
            var wrapper = $$.sm(dField).getParent(2);
            var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
            var posDim = dField.getBoundingClientRect();
            var viewPortWidth = $$.ss("body").clientWidth;
            var dateBoxleftOffet = vBoxWidth + posDim["left"];
            var offsetDiff = viewPortWidth - dateBoxleftOffet;
            var dFieldBottomOffset = posDim["bottom"];


            var diff = innerHeight - dFieldBottomOffset;
            var dateBoxHeight = dateComponents["timeParts"] == null ? 264 : 499;
            maxX = posDim["width"] - (initX * 2);
            boxXpos = offsetDiff < 0 ? -1 * (offsetDiff - paddingRight) > maxX ? maxX : offsetDiff - paddingRight : 0;
            arrowXpos = initX - (boxXpos);


            // if(innerWidth <= ){

            // }
            //Display in approriate space
            if (dFieldBottomOffset >= diff) {
                if (dateBoxHeight <= diff) { //to bottom
                    dateBox.style["top"] = (parseInt(datePickerDim[1]) + 1) + "px";
                    dateBox.style["bottom"] = "auto";
                    hideArrow(wrapper, "bottom");
                } else { //to top
                    dateBox.style["bottom"] = (parseInt(datePickerDim[1]) + 1) + "px";
                    dateBox.style["top"] = "auto";
                    hideArrow(wrapper, "top");
                }
            } else { //to bottom
                dateBox.style["top"] = (parseInt(datePickerDim[1]) + 1) + "px";
                dateBox.style["bottom"] = "auto";
                hideArrow(wrapper, "bottom");
            }
            dateBox.style["left"] = boxXpos + "px";
        }

        function hideArrow(wrapper, target) {
            var topArrow = wrapper.querySelector(".vtop");
            var bottomArrow = wrapper.querySelector(".vbottom");
            if (target == "top") {
                topArrow.style["display"] = "none";
                bottomArrow.style["display"] = "block";
            } else {
                topArrow.style["display"] = "block";
                bottomArrow.style["display"] = "none";
            }
        }

        function createStyles() {
            if ($$.ss("style[data-id='" + datePickerClassName + "']") == null) {
                var css = "";
                css += ".vDateIcon::before {line-height:inherit}";
                if (dateInputIconStyle[0] != undefined) {
                    css += ".vDateIcon::before {" + dateInputIconStyle[0] + "}";
                }
                if (dateInputIconStyle[1] != undefined) {
                    css += ".vDateIcon:hover::before {" + dateInputIconStyle[1] + "}";
                }
                if (dateInputIconStyle[2] != undefined) {
                    css += ".vDateIcon:active::before {" + dateInputIconStyle[2] + "}";
                }
                if (selectionStyle != "") {
                    css += ".vDatePicker .vSelected{" + selectionStyle + "}";
                }
                if (inputButtonStyle != "") {
                    css += ".vDateIcon{" + inputButtonStyle + "}";
                }
                attachStyleSheet(datePickerClassName, css);
            }
        }

        function AddEventHandlers() {
            $$.attachEventHandler("click", ["vDateIcon", "range", "year", "month", "day", "vbActive", "vClose", "dField", "meridianSwitchCon", "tbuttonActive"], function(e, id) {
                if (id == "vDateIcon" || id == "dField") {
                    var wrapper = $$.sm(e.target).getParent(2);
                    var pickerState = wrapper.querySelector(".dField").getAttribute("data-state");
                    pickerState == "closed"? showDateBox(wrapper) : closeDateBox(wrapper);
                } else if (id == "range") { //hide rangeBox and show yearsCon
                    var wrapper = $$.sm(e.target).getParent(6);
                    var yearSeries = parseInt(e.target.getAttribute("data-range"));
                    var rangeCon = $$.sm(e.target).getParent(2);
                    var yearsCon = wrapper.querySelector(".vYearsCon");
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    generateYears(yearSeries, yearsCon);
                    rangeCon.style["height"] = "0%";
                    rangeCon.style["opacity"] = "0";
                    rangeCon.style["z-index"] = "0";
                    rangeCon.classList.contains("displayActive") ? rangeCon.classList.remove("displayActive") : null;

                    yearsCon.classList.add("displayActive");
                    yearsCon.classList.add("rangeToYear");
                    yearsCon.style["display"] = "flex";
                    yearsCon.scrollHeight;
                    yearsCon.style["height"] = "100%";
                    yearsCon.style["width"] = "100%";
                    yearsCon.style["opacity"] = "1";
                    yearsCon.style["z-index"] = "1";

                    resetMComponentsValue(wrapper, dateComponents, "ymd");
                    writeToInput(wrapper, dateComponents);
                    updateActive(wrapper, e.target, "range");
                    toggleBackButton(wrapper);
                    dateComponents["timeParts"] != null ? toggleDoneButton(wrapper) : null;
                    listControllerObj.offScroller();
                } else if (id == "year") { //hide yearsCon and show MonthsCon
                    var wrapper = $$.sm(e.target).getParent(5);
                    var nativeDateInput = wrapper.nextElementSibling;
                    var year = parseInt(e.target.innerHTML);
                    var maxDate = getDateRangeComponents(nativeDateInput)["max"];
                    var minDate = getDateRangeComponents(nativeDateInput)["min"];
                    var monthsCon = wrapper.querySelector(".vMonthsCon");
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    var stopMonth, startMonth;
                    var yearsCon = e.target.parentNode;
                    var maxMonth = parseInt(maxDate.split("-")[1]);
                    var minMonth = parseInt(minDate.split("-")[1]);
                    var maxYear = parseInt(maxDate.split("-")[0]);
                    var minYear = parseInt(minDate.split("-")[0]);

                    yearsCon.style["height"] = "0%";
                    yearsCon.style["width"] = "0%";
                    yearsCon.style["opacity"] = "0";
                    yearsCon.style["z-index"] = "0";
                    yearsCon.classList.remove("displayActive");
                    monthsCon.classList.add("yearToMonth");
                    monthsCon.innerHTML = "";
                    year == maxYear ? stopMonth = maxMonth - 1 : stopMonth = 11;
                    year == minYear ? startMonth = minMonth : startMonth = 0;
                    for (var x = 0; x <= stopMonth; x++) {
                        if (x < startMonth - 1) continue;
                        var month = $$.ce("DIV");
                        month.classList.add("month");
                        addVitalStyle(month);
                        var selectedMonth = getSelectedValue(nativeDateInput, "month");
                        if (selectedMonth - 1 == x) {
                            month.classList.add("vSelected");
                        }
                        x < 9 ? month.setAttribute("data-value", "0" + (x + 1).toString()) : month.setAttribute("data-value", x + 1);
                        month.append(document.createTextNode(months[x]))
                        monthsCon.appendChild(month);
                    }

                    monthsCon.classList.add("displayActive");
                    monthsCon.style["display"] = "flex";
                    monthsCon.scrollHeight;
                    monthsCon.style["height"] = "100%";
                    monthsCon.style["width"] = "100%";
                    monthsCon.style["opacity"] = "1";
                    monthsCon.style["z-index"] = "1";
                    dateComponents["dateParts"][0] = year;
                    resetMComponentsValue(wrapper, dateComponents, "md");
                    writeToInput(wrapper, dateComponents);
                    dateComponents["timeParts"] != null ? toggleDoneButton(wrapper) : null;
                    updateActive(wrapper, e.target, "year");
                    toggleBackButton(wrapper);
                } else if (id == "month") { //hide monthCon and show days
                    var wrapper = $$.sm(e.target).getParent(5);
                    var nativeDateInput = wrapper.nextElementSibling;
                    var month = parseInt(e.target.getAttribute("data-value"));
                    var monthsCon = e.target.parentNode;
                    var daysCon = wrapper.querySelector(".vDaysCon");
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    var maxDate = getDateRangeComponents(nativeDateInput)["max"];
                    var minDate = getDateRangeComponents(nativeDateInput)["min"];
                    var maxDay = parseInt(maxDate.split("-")[2]);
                    var minDay = parseInt(minDate.split("-")[2]);
                    var maxMonth = parseInt(maxDate.split("-")[1]);
                    var minMonth = parseInt(minDate.split("-")[1]);
                    var maxYear = parseInt(maxDate.split("-")[0]);
                    var minYear = parseInt(minDate.split("-")[0]);
                    var selectedYear = dateComponents["dateParts"][0];
                    var startDay, stopDay;
                    daysCon.innerHTML = "";
                    dateComponents["dateParts"][1] = fixDigitLength(month);

                    if (month == "4" || month == "6" || month == "9" || month == "11") {
                        stopDay = 29;
                    } else if (month == "2") {
                        var leapYear = parseInt(dateComponents[0]) % 4;
                        if (leapYear == 0) {
                            stopDay = 28;
                        } else {
                            stopDay = 27;
                        }
                    } else {
                        stopDay = 30;
                    }

                    (selectedYear == maxYear && month == maxMonth) ? stopDay = maxDay - 1: stopDay = stopDay;
                    (selectedYear == minYear && month == minMonth) ? startDay = minDay - 1: startDay = 0;

                    //Generate days
                    for (var x = 0; x <= stopDay; x++) {
                        if (x < startDay) continue;
                        generateDays(x, daysCon);
                    }

                    monthsCon.style["height"] = "0%";
                    monthsCon.style["width"] = "0%";
                    monthsCon.style["opacity"] = "0";
                    monthsCon.style["z-index"] = "0";
                    monthsCon.classList.remove("displayActive");

                    daysCon.classList.add("displayActive");
                    daysCon.classList.add("monthToDay");
                    daysCon.style["display"] = "flex";
                    daysCon.scrollHeight;
                    daysCon.style["height"] = "100%";
                    daysCon.style["width"] = "100%";
                    daysCon.style["opacity"] = "1";
                    daysCon.style["z-index"] = "1";
                    resetMComponentsValue(wrapper, dateComponents, "d");
                    updateActive(wrapper, e.target, "month");
                    writeToInput(wrapper, dateComponents);
                    dateComponents["timeParts"] != null ? toggleDoneButton(wrapper) : null;
                    daysToolTip? createToolTip(wrapper) : null;
                } else if (id == "day") { //hide dayCon and show time if specified
                    var wrapper = $$.sm(e.target).getParent(5);
                    var nativeDateInput = wrapper.nextElementSibling;
                    var includeTime = pickerType(nativeDateInput);
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    var day = e.target.getAttribute("data-value");
                    var daysCon = e.target.parentNode;
                    dateComponents["dateParts"][2] = fixDigitLength(day);
                    writeToInput(wrapper, dateComponents);
                    if (!includeTime) { //Close Date picker Box
                        wrapper.querySelector(".vDateBoxHeader").innerHTML = "Exiting...";
                        closeDateBox(wrapper)
                    } else {
                        var hrinput = wrapper.querySelector(".hr");
                        hrinput.value.length < 1 ? hrinput.focus() : null;
                        updateActive(wrapper, e.target, "day");
                    }
                    updateActive(wrapper, e.target, "day");
                    dateComponents["timeParts"] != null ? toggleDoneButton(wrapper) : null;
                } else if (id == "vbActive") { //Back button clicked
                    var wrapper = $$.sm(e.target).getParent(4);
                    var currentDisplay = wrapper.querySelector(".displayActive");
                    var prev = wrapper.querySelector(".displayActive").previousElementSibling;
                    currentDisplay.classList.remove("displayActive");
                    currentDisplay.classList.add("temp");
                    currentDisplay.style["height"] = "0%";
                    currentDisplay.style["width"] = "0%";
                    currentDisplay.style["opacity"] = "0";
                    currentDisplay.style["z-index"] = "0";
                    currentDisplay.scrollHeight;
                    if (prev != null) {
                        prev.classList.add("rewind");
                        prev.style["display"] = "flex";
                        prev.scrollHeight;
                        prev.style["height"] = "100%";
                        prev.style["opacity"] = "1";
                        prev.style["z-index"] = "1";
                        if (!(prev.classList.contains("vDateRangeCon"))) {
                            prev.style["width"] = "100%";
                        } else if (prev.classList.contains("vDateRangeCon")) {
                            listControllerObj.onScroller();
                        }
                    }
                } else if (id == "vClose") { //close button clicked
                    var wrapper = $$.sm(e.target).getParent(4);
                    closeDateBox(wrapper);
                } else if (id == "meridianSwitchCon") { //meridian switch button clicked
                    var wrapper = $$.sm(e.target).getParent(5);
                    var hrValue = wrapper.querySelector(".hr").value;
                    if (hrValue > 0) {
                        toggleMeridianSwitch(e.target);
                        reCompute24hours(wrapper);
                    }
                } else if (id == "tbuttonActive") {
                    var wrapper = $$.sm(e.target).getParent(4);
                    closeDateBox(wrapper);
                }
            })
            //_______Transition control
            $$.attachEventHandler("transitionend", ["displayActive", "vDateBoxTool", "rangeToYear", "yearToMonth", "monthToDay", "dayToTime", "rewind", "temp", "meridianSwitchCon", "vDateRangeCon"], function(e, id) {
                if (id == "displayActive") {
                    var wrapper = $$.sm(e.target).getParent(4);
                    wrapper.querySelector(".vDateBoxHeader").innerHTML = e.target.getAttribute("data-title");
                }
                if (id == "rangeToYear") { //Hide rangeCon
                    var wrapper = $$.sm(e.target).getParent(4);
                    var rangeCon = wrapper.querySelector(".vDateRangeCon");
                    e.target.classList.remove("rangeToYear");
                }
                if (id == "yearToMonth") { //Hide yearsCon
                    e.target.classList.remove("yearToMonth");
                }
                if (id == "monthToDay") { //Hide monthsCon
                    e.target.classList.remove("monthToDay");
                }
                if (id == "rewind") { //previous
                    var wrapper = $$.sm(e.target).getParent(4);
                    if (e.target.classList.contains("vDateRangeCon")) {
                        var rangeCon = wrapper.querySelector(".vDateRangeCon");
                        rangeCon.style["display"] = "flex";
                        rangeCon.classList.add("displayActive");
                    } else {
                        e.target.classList.add("displayActive");
                    }
                    toggleBackButton(wrapper);
                    e.target.classList.remove("rewind");
                }
                if (id == "temp") { //previous
                    e.target.classList.remove("temp");
                }
                if (id == "meridianSwitchCon") { //meridian switch
                    var label = e.target.parentNode;
                    var wrapper = $$.sm(e.target).getParent(5);
                    if (e.target.classList.contains("pm")) {
                        label.classList.remove("AMon");
                        label.classList.add("PMon");
                    } else {
                        label.classList.add("AMon");
                        label.classList.remove("PMon");
                    }
                }
                if (id == "vDateBoxTool") {
                    var wrapper = e.target.parentNode
                    var dField = wrapper.querySelector(".dField");

                    if (e.target.classList.contains("opening")) {
                        e.target.classList.remove("opening");
                        dField.setAttribute("data-state", "opened");
                    } else if (e.target.classList.contains("exiting")) {
                        var yearsRangeCon = wrapper.querySelector(".vDateRangeCon");
                        if (yearsRangeCon != null) {
                            yearsRangeCon.style["display"] = "flex";
                            yearsRangeCon.style["height"] = "100%";
                        } else {
                            var yearsCon = wrapper.querySelector(".vYearsCon");
                            yearsCon.style["display"] = "flex";
                            yearsCon.style["height"] = "100%";
                        }
                        wrapper.classList.remove("activeWidget");
                        e.target.classList.remove("exiting");
                        dField.setAttribute("data-state", "closed");
                        unsetSuperActive(wrapper);
                    }
                }
            })

            //_________Time input
            $$.attachEventHandler("input", ["hr", "min"], function(e, id) {
                var wrapper = $$.sm(e.target).getParent(6);
                if (id == "hr") {
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    var meridian = wrapper.querySelector(".meridianSwitchCon").classList.contains("am") ? "am" : "pm";
                    if (e.target.value.length > 0) {
                        e.target.value = minMaxInt(e.target.value, 1, 12);
                        var value = e.target.value;
                        var pint = parseInt(value);
                        dateComponents["timeParts"][0] = fixDigitLength(convertTo12hours(pint, meridian));
                    } else {
                        dateComponents["timeParts"][0] = "HH";
                    }
                    writeToInput(wrapper, dateComponents);
                } else if (id == "min") {
                    var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
                    if (e.target.value.length > 0) {
                        e.target.value = minMaxInt(e.target.value, 0, 59);
                        var value = parseInt(e.target.value);
                        dateComponents["timeParts"][1] = fixDigitLength(value);
                    } else {
                        dateComponents["timeParts"][1] = "MM";
                    }
                    writeToInput(wrapper, dateComponents);
                }
                toggleDoneButton(wrapper);
            })
            $$.attachEventHandler("focusout", ["hr", "min"], function(e, id) {
                e.target.value = fixDigitLength(e.target.value);
            })
            window.addEventListener("resize", function(e) {
                var anyOpenDate = $$.ss(".dField[data-state='opened']");
                if (anyOpenDate != null) {
                    var wrapper = $$.sm(anyOpenDate).getParent(2);
                    var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
                    var dateBoxArrow = wrapper.querySelectorAll(".vDateBoxArrow");
                    shift(dateBoxParent, dateBoxArrow);
                }
                if (wrapAttribute != "") wrap("datePicker", wrapAttribute);
            })
            addEventListener("scroll", function() {
                var anyOpen = $$.ss(".dField[data-state='opened']");
                if (anyOpen != null) {
                    var dateBox = anyOpen.parentNode.nextElementSibling;
                    autoPlace(dateBox);
                }
            }, false)
            $$.attachEventHandler("mouseover", "meridianSwitchCon", function(e) {
                var wrapper = $$.sm(e.target).getParent(5);
                var hrValue = wrapper.querySelector(".hr").value;
                hrValue > 0 ? e.target.style["cursor"] = "pointer" : e.target.style["cursor"] = "not-allowed";
            })
        }

        function toggleMeridianSwitch(ele) {
            if (ele.classList.contains("am")) {
                ele.classList.remove("am");
                ele.classList.add("pm");
            } else {
                ele.classList.add("am");
                ele.classList.remove("pm");
            }
        }

        function checkSave(wrapper) {
            var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
            var dField = wrapper.querySelector(".dField");
            var nativeDateInput = wrapper.nextElementSibling;
            if (isCompleted(dateComponents)) {
                dField.setAttribute("data-completed", trueState);
                nativeDateInput.setAttribute(validationAttribute, "true");
            } else {
                nativeDateInput.setAttribute(validationAttribute, "false");
                dField.setAttribute("data-completed", falseState);
            }
        }

        function fixDigitLength(digit) {
            return digit.toString().length == 1 ? "0" + digit : digit;
        }

        function activateOK(wrapper) {
            var button = wrapper.querySelector(".buttonCon button");
            button.classList.remove("tbuttonInactive");
            button.classList.add("tbuttonActive");
        }

        function deactivateOK(wrapper) {
            var button = wrapper.querySelector(".buttonCon button");
            button.classList.add("tbuttonInactive");
            button.classList.remove("tbuttonActive");
        }

        function toggleDoneButton(wrapper) {
            var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
            isCompleted(dateComponents) ? activateOK(wrapper) : deactivateOK(wrapper);
        }

        function generateYears(SeriesStartYear, yearsCon) {
            yearsCon.innerHTML = "";
            var nativeDateInput = $$.sm(yearsCon).getParent(4).nextElementSibling;
            var n = 0;
            var sYear = getDateRangeComponents(nativeDateInput)["min"].split("-")[0];
            var maxYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
            var nxtSeriesStart = parseInt(SeriesStartYear) + 10;
            for (var x = 0; x < 22; x++) {
                var nxtYear = SeriesStartYear++;
                if (nxtYear >= nxtSeriesStart) break;
                if (nxtYear > maxYear) break;
                if (nxtYear >= sYear) {
                    n++;
                    var year = $$.ce("DIV");
                    year.classList.add("year");
                    var selectedYear = getSelectedValue(nativeDateInput, "year");
                    selectedYear == nxtYear ? year.classList.add("vSelected") : null
                    addVitalStyle(year);
                    year.appendChild(document.createTextNode(nxtYear));
                    yearsCon.appendChild(year);
                    if (n == 11) break;
                }
            }
        }

        function reCreateDatePicker() {
            var allDatePickers = $$.sa("." + datePickerClassName);
            for (var x = 0; x < allDatePickers.length; x++) {
                if (pickerType(allDatePickers[x]) == null) throw new Error("Custom Datepicker supports only Input Element of type 'date' or 'datetime-local'");
                decodeDateRange(allDatePickers[x]);
                runDatePickerBuild(allDatePickers[x]);
            }
        }

        function pickerType(nativeDateInput) {
            var includeTime = null;
            if (nativeDateInput.getAttribute("type") == "date") {
                includeTime = false;
            } else if (nativeDateInput.getAttribute("type") == "datetime-local") {
                includeTime = true;
            }
            return includeTime;
        }

        function runDatePickerBuild(nativeDateInput) {
            nativeDateInput.classList.add("xDnative");

            var dateInputParent = nativeDateInput.parentNode;
            var existingWrapper = nativeDateInput.previousElementSibling;
            var includeTime = pickerType(nativeDateInput);
            var mask, dateRange = true,
                maskLabel;
            existingWrapper != null ? dateInputParent.removeChild(existingWrapper) : null;
            if (nativeDateInput.value.length > 0) { //Has default
                mask = nativeDateInput.value;
            } else { //No default set
                mask = includeTime ? "YYYY-MM-DDTHH:MM" : "YYYY-MM-DD";
            }
            maskLabel = includeTime ? mask.replace("T", " ") : mask;
            //_____________Create elements___________
            //Wrapper
            var mView = innerWidth <= mobileView?"vDatePickerSmallView":"";
            var wrapper = $$.ce("DIV", {class:"vDatePicker "+mView});
            var dimension = nativeDateInput.getAttribute(sizeAttribute);
            if (dimension == null) {
                throw new Error("One of the native date input to be made custom has no dimension specified with the " + sizeAttribute + " attribute");
            }
            var temp = "Date input " + sizeAttribute + " value contains invalid CSS size";
            var parseDimension = dimension.split(",");
            validateDimension(parseDimension[0], temp);
            validateDimension(parseDimension[1], temp);
            datePickerDim[0] = parseDimension[0];
            datePickerDim[1] = parseDimension[1];

            wrapper.style["height"] = datePickerDim[1];
            wrapper.style["width"] = datePickerDim[0];

            //Date field
            var dateFieldCon = $$.ce("DIV", {class:"dFieldCon"}); //the datefield and icon container
            var dateField = $$.ce("DIV", {"data-value":mask, class:"dField vItem", "data-state":"closed"}); //custom date field
            var dateIcon = $$.ce("DIV", {class:"vDateIcon iconClose vItem"}); // Input icon
            
            //vItem added for validation module support
            
            dateFieldStyle != "" ? dateField.style = dateFieldStyle : null;

            dateField.appendChild(document.createTextNode(maskLabel));
            dateField.style["line-height"] = datePickerDim[1];
            dateFieldCon.appendChild(dateField);
            dateFieldCon.appendChild(dateIcon);

            //append into wrapper          
            wrapper.appendChild(dateFieldCon);


            //DateBox tool parent
            var dateBoxToolElement = $$.ce("DIV", {class:"vDateBoxTool"});

            //Arrows
            //top
            var dateBoxArrowTopElementCon = $$.ce("DIV", {class:"vDateBoxArrow"});
            var dateBoxArrowTopElement = $$.ce("DIV", {class:"vtop normalShift"});
            dateBoxArrowTopElementCon.appendChild(dateBoxArrowTopElement);
            
            //bottom
            var dateBoxArrowBottomElementCon = $$.ce("DIV", {class:"vDateBoxArrow"});
            var dateBoxArrowBottomElement = $$.ce("DIV", {class:"vbottom normalShift"});
            dateBoxArrowBottomElementCon.appendChild(dateBoxArrowBottomElement);


            //DateBox
            var dateBoxElement = $$.ce("DIV", {class:"vDateBox"});

            //DateBox Header
            var dateBoxHeaderElement = $$.ce("DIV", {class:"vDateBoxHeader"});


            //DateBox displayCon
            var dateBoxDisplayConElement = $$.ce("DIV", {class:"vDateBoxDisplayCon"});

            if (labelProperties[1] != undefined) { //FontColor
                dateBoxDisplayConElement["style"]["color"] = labelProperties[1];
            }


            //Date range Box or Year Box
            var yearDiff = getDateRangeComponents(nativeDateInput)["max"].split("-")[0] - getDateRangeComponents(nativeDateInput)["min"].split("-")[0];

            if (yearDiff > 11) {
                var n = (getDateRangeComponents(nativeDateInput)["seriesEndYear"] - getDateRangeComponents(nativeDateInput)["seriesStartYear"]) / 10;
                var numberOfRangeBoxes = Math.ceil(n / 11) <= 0 ? 1 : Math.ceil(n / 11);
                var dateRangeConElement = $$.ce("DIV", {class:"vDateRangeCon vDateRangeConTrans", "data-title":"Select year series"});
              

                for (var x = 0; x < numberOfRangeBoxes; x++) {
                    var rangeBox = $$.ce("DIV", {class:"rangeBox"});
                    dateRangeConElement.appendChild(rangeBox);
                }
            } else {
                dateRange = false;
            }

            //Years Container
            var yearsConElement = $$.ce("DIV", {class:"vYearsCon vDateRangeConTrans", "data-title":"Select year"});

            //Months Container
            var monthsConElement = $$.ce("DIV", {class:"vMonthsCon vDateRangeConTrans", "data-title":"Select month"});

            //Days Container
            var daysConElement = $$.ce("DIV", {class:"vDaysCon vDateRangeConTrans", "data-title":"Select day"});

            //Time Container
            if (includeTime) {
                var timeConElement = $$.ce("DIV", {class:"vTimeCon"});
                var label = $$.ce("DIV", {class:"timeLabel"});
                var meridian = $$.ce("DIV", {class:"meridian AMon"});
                var meridianSwitchCon = $$.ce("DIV", {class:"meridianSwitchCon am"});
                var timpePropertiesCon = $$.ce("DIV", {class:"timpePropertiesCon"});
                var hourCon = $$.ce("DIV", {class:"hourCon"});
                var hourInput = $$.ce("INPUT", {type:"text", class:"hr", maxlength:2});
                var minCon = $$.ce("DIV", {class:"minCon"});
                var minInput = $$.ce("INPUT", {type:"text", maxlength:2, class:"min"});
                var OkButtonCon = $$.ce("DIV", {class:"buttonCon"});
                var OkButton = $$.ce("BUTTON", {type:"button", class:"tbuttonInactive"});
      

                label.appendChild(document.createTextNode("Set Time"));

                hourCon.appendChild(hourInput);
                minCon.appendChild(minInput);
  
                OkButton.appendChild(document.createTextNode("Done"));
                OkButtonCon.appendChild(OkButton);
                //Append

                meridian.appendChild(meridianSwitchCon);
                //label to timeConElement
                timeConElement.appendChild(label);

                //meridian to timeConElement
                timeConElement.appendChild(meridian);
                //timpePropertiesCon to timeConElement
                timpePropertiesCon.appendChild(hourCon);
                timpePropertiesCon.appendChild(minCon);
                timeConElement.appendChild(timpePropertiesCon);
                //Button to timeConElement

            }

            //DateBox controlCon
            var dateBoxControlConElement = $$.ce("DIV", {class:"vDateBoxControlCon"});

            // previous button
            var previousButtonElement = $$.ce("BUTTON", {class:"linactive vPrev", id:"vPrev", type:"button"});

            // back button
            var backButtonElement = $$.ce("BUTTON", {class:"vBack vbInactive", type:"button"});
           
            backButtonElement.appendChild(document.createTextNode("Back"));
           
            // Close button
            var closeButtonElement = $$.ce("BUTTON", {class:"vClose", type:"button"});
            closeButtonElement.appendChild(document.createTextNode("Close"));
            
            // next button
            var nextButtonElement = $$.ce("BUTTON", {class:"rinactive vNext", id:"vNext", type:"button"});

            //____________Append______________
            //Append dateBox header to dateBox Element
            dateBoxElement.appendChild(dateBoxHeaderElement);

            //Append dateBox displayCon to dateBox Element
            dateBoxElement.appendChild(dateBoxDisplayConElement);

            //Append date rangeCon to displayCon Element
            dateRange ? dateBoxDisplayConElement.appendChild(dateRangeConElement) : null;

            // Append years container to displayCon Element
            dateBoxDisplayConElement.appendChild(yearsConElement);

            // Append months container to displayCon Element
            dateBoxDisplayConElement.appendChild(monthsConElement);

            // Append Days container to displayCon Element
            dateBoxDisplayConElement.appendChild(daysConElement);

            // Append Time container to displayCon Element
            if (includeTime) {
                dateBoxElement.appendChild(timeConElement);
                dateBoxElement.appendChild(OkButtonCon);
            }

            //Append  prev element to controlCon Element
            dateBoxControlConElement.appendChild(previousButtonElement);
            //Append  back element to controlCon Element
            dateBoxControlConElement.appendChild(backButtonElement);
            //Append  close element to controlCon Element
            dateBoxControlConElement.appendChild(closeButtonElement);
            //Append  next element to controlCon Element
            dateBoxControlConElement.appendChild(nextButtonElement);

            //Append dateBox controlCon to dateBox Element
            dateBoxElement.appendChild(dateBoxControlConElement);

            //Append dateBoxArrowTop to date box tool parent
            dateBoxToolElement.appendChild(dateBoxArrowTopElementCon);

            //Append dateBox to box tool parent
            dateBoxToolElement.appendChild(dateBoxElement);

            //Append dateBoxArrowBottom to date box tool parent
            dateBoxToolElement.appendChild(dateBoxArrowBottomElementCon);

            // Append datebox tool parent to wrapper input
            wrapper.appendChild(dateBoxToolElement);

            //insert wrapper before native date
            dateInputParent.insertBefore(wrapper, nativeDateInput);

            dateRange ? generateYearRange(nativeDateInput) : generateYearsPage(nativeDateInput);
            if (includeTime) {
                if (nativeDateInput.value != "") {
                    setInputDefaultValues(nativeDateInput);
                }
                formatTimeField(wrapper);
            }
        }

        function formatTimeField(wrapper) {
            var hrinput = wrapper.querySelector(".hourCon input");
            var mininput = wrapper.querySelector(".minCon input");
            FormValidator.format.integerField(hrinput);
            FormValidator.format.integerField(mininput);
        }

        function addVitalStyle(ele) {
            if (labelProperties[0] != undefined) { //backgroundColor
                ele["style"]["background-color"] = labelProperties[0];
            }
            if (labelProperties[1] != undefined) { //fontColr
                ele["style"]["color"] = labelProperties[1];
            }
            if (labelProperties[2] != undefined) { //borderColor
                ele["style"]["border"] = labelProperties[2];
            }
        }

        function generateYearRange(nativeDateInput) {
            var displayCon = nativeDateInput.parentNode.querySelector(".vDateRangeCon");
            var rangeBox = displayCon.querySelectorAll(".rangeBox");
            var range = $$.ce("DIV");
            var startYear = parseInt(getDateRangeComponents(nativeDateInput)["seriesStartYear"]);
            var numberOfRangeBoxes = nativeDateInput.previousElementSibling.querySelectorAll(".rangeBox").length;
            range.classList.add("range");
            range.setAttribute("data-range", startYear);
            addVitalStyle(range);
            range.appendChild(document.createTextNode(startYear.toString() + "'s..."));
            rangeBox[0].appendChild(range);
            var stopSeries = parseInt(getDateRangeComponents(nativeDateInput)["seriesEndYear"]);
            var nativeYear = parseInt(getSelectedValue(nativeDateInput, "year"));
            var diff;
            for (var x = 0; x < numberOfRangeBoxes; x++) {
                for (var y = 0; y < 11; y++) {
                    startYear += 10;
                    if (startYear > stopSeries) break;
                    diff = nativeYear - startYear;
                    var range = $$.ce("DIV");
                    (diff >= 0 && diff < 10) ? range.classList.add("vSelected"): null;
                    range.classList.add("range");
                    range.setAttribute("data-range", startYear);
                    addVitalStyle(range);
                    range.appendChild(document.createTextNode(startYear.toString() + "'s..."));
                    rangeBox[x].appendChild(range);
                }
            }
        };

        function generateYearsPage(nativeDateInput) {
            var displayCon = nativeDateInput.parentNode.querySelector(".vDateBox .vYearsCon");
            var year = $$.ce("DIV");
            var minYear = getDateRangeComponents(nativeDateInput)["min"].split("-")[0];
            var maxYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
            var selectedYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
            year.classList.add("year");
            addVitalStyle(year);
            year.appendChild(document.createTextNode(minYear.toString()));
            displayCon.innerHTML = "";
            displayCon.appendChild(year);
            var sYear = minYear;
            var n = 0;
            for (var y = 0; y < 21; y++) {
                if (sYear == maxYear) break;
                sYear++;
                n++
                var year = $$.ce("DIV");
                year.classList.add("year");
                addVitalStyle(year);
                var selectedYear = getSelectedValue(nativeDateInput, "year");
                selectedYear == sYear ? year.classList.add("vSelected") : null
                year.appendChild(document.createTextNode(sYear.toString()));
                displayCon.appendChild(year);
                if (n == 11) break;
            }
        };

        function createToolTip(wrapper) {
            var allDays = wrapper.querySelectorAll(".day")
            var dField = wrapper.querySelector(".dField");
            var dateComponents = getDateComponent(dField, false);
            var totalDays = allDays.length;
            var year = dateComponents["dateParts"][0];
            var month = dateComponents["dateParts"][1];
            for (var x = 0; x < totalDays; x++) {
                var dayName = getDayName(year, month, allDays[x].getAttribute("data-value"));
                allDays[x].setAttribute("title", dayName);
                allDays[x].classList.add("datePickerToolTip-"+datePickerClassName);
            }
            tooTipHandler.refresh();
        }

        function generateDays(x, daysCon) {
            var day = $$.ce("DIV");
            var wrapper = $$.sm(daysCon).getParent(5);
            var nativeDateInput = $$.sm(daysCon).getParent(4).nextElementSibling;
            day.classList.add("day");
            addVitalStyle(day);
            var selectedDay = getSelectedValue(nativeDateInput, "day");
            if (selectedDay - 1 == x) {
                day.classList.add("vSelected");
            }
            x < 9 ? day.setAttribute("data-value", "0" + (x + 1).toString()) : day.setAttribute("data-value", x + 1);
            day.append(document.createTextNode(x + 1));
            daysCon.appendChild(day);
        }

        function toggleListScroller(wrapper) {
            var listCon = wrapper.querySelector(".vDateBox  .vDateRangeCon");
            var list = wrapper.querySelectorAll(".vDateBox  .rangeBox");
            var listConParent = wrapper.querySelector(".vDateBox .vDateBoxDisplayCon");
            var LeftBt = wrapper.querySelector("#vPrev");
            var RightBt = wrapper.querySelector("#vNext");
            if (listControllerObj == null) {
                listControllerObj = new ListScroller(listConParent, listCon);
       
                listControllerObj.config.buttons = [LeftBt, RightBt];
                listControllerObj.config.inactiveButtonsClassName = ["off"];
                listControllerObj.config.effects = [0.4, "cubic-bezier(0,.99,0,1)"];
                listControllerObj.config.inactiveButtonsClassName = ["linactive", "rinactive"];
                listControllerObj.config.scrollSize = 300
                listControllerObj.config.paddingRight = 0; 
                listControllerObj.config.spaceError = 2;
                listControllerObj.initialize();
                
            }
            if (list.length > 1 && $$.sm(listCon).cssStyle("display") != "none") {
                listControllerObj.onScroller();
            } else {
                // listControllerObj.offScroller();
            }
        }

        function toggleBackButton(wrapper) {
            var backButton = wrapper.querySelector(".vBack");
            var anyPrev = wrapper.querySelector(".displayActive").previousElementSibling;
            if (anyPrev != null) {
                backButton.classList.remove("vbInactive");
                backButton.classList.add("vbActive");
            } else {
                backButton.classList.add("vbInactive");
                backButton.classList.remove("vbActive");
            }
        }

        function getDateComponent(dField, withTime) {
            var dataValue = dField.getAttribute("data-value");
            var dateParts, timeParts;
            if (!withTime) {
                dateParts = dataValue.split("-");
                timeParts = null;
            } else {
                dateParts = dataValue.split("T")[0].split("-");
                timeParts = dataValue.split("T")[1].split(":");
            }

            return {
                dateParts: dateParts,
                timeParts: timeParts
            }
        }

        function getDateRangeComponents(nativeDateInput) {
            return {
                max: nativeDateInput.getAttribute("data-max"),
                min: nativeDateInput.getAttribute("data-min"),
                seriesStartYear: nativeDateInput.getAttribute("data-rangeStart"),
                seriesEndYear: nativeDateInput.getAttribute("data-rangeEnd")
            }
        }

        function writeToInput(wrapper, dateComponent) {
            var dField = wrapper.querySelector(".dField");
            var nativeDateInput = wrapper.nextElementSibling;
            var includeTime = pickerType(nativeDateInput)
            var ISOF;
            if (includeTime) {
                dField.innerHTML = dateComponent["dateParts"].join("-") + " " + dateComponent["timeParts"].join(":");
                ISOF = dateComponent["dateParts"].join("-") + "T" + dateComponent["timeParts"].join(":");
            } else {
                dField.innerHTML = dateComponent["dateParts"].join("-");
            }
            ISOF = includeTime ? ISOF : dField.innerHTML;
            nativeDateInput.setAttribute("value", ISOF);
            dField.setAttribute("data-value", ISOF);
            checkSave(wrapper);
        }

        function convertTo12hours(hour, meridian) {
            if (meridian == "am") {
                if (hour == 12) {
                    return 0;
                } else {
                    return hour;
                }
            } else {
                if (hour == 12) {
                    return 12;
                } else if (hour > 12) {
                    return hour - 12;
                } else if (hour < 12) {
                    return hour + 12;
                }
            }
        }

        function reCompute24hours(wrapper) {
            var hrInputValue = parseInt(wrapper.querySelector(".hourCon input").value);
            var meridian = wrapper.querySelector(".meridianSwitchCon").classList.contains("am") ? "am" : "pm";
            if (hrInputValue.toString().length > 0) {
                var dField = wrapper.querySelector(".dField");
                var includeTime = pickerType(wrapper.nextElementSibling);
                var dateComponents = getDateComponent(dField, includeTime);
                dateComponents["timeParts"][0] = fixDigitLength(convertTo12hours(hrInputValue, meridian));
                writeToInput(wrapper, dateComponents);
            }
        }

        function compareDate(minDate, maxDate) {
            var furtureDate = new Date(maxDate);
            var pastDate = new Date(minDate);
            var diff = furtureDate - pastDate;
            if (diff >= 0) {
                return true;
            } else {
                return false;
            }
        }

        function shift(dateBoxParent, dateBoxArrowsCon) {
            if (window.innerWidth > mobileView) {//large
                for (var x = 0; x < dateBoxArrowsCon.length; x++) {
                    var arrow = dateBoxArrowsCon[x].querySelector("div");
                    arrow.style["left"] = arrowXpos + "px";
                    arrow.classList.remove("shift");
                }
                dateBoxParent.style["left"] = boxXpos + "px";
                dateBoxParent.style["margin-left"] = "0";
            } else { //small
                for (var x = 0; x < dateBoxArrowsCon.length; x++) {
                    var arrow = dateBoxArrowsCon[x].querySelector("div");
                    arrow.classList.add("shift");
                }                
                dateBoxParent.style["left"] = "50%";
                dateBoxParent.style["margin-left"] = "-150px";
            }
        }

        function validFormat(dateString, type) {
            var status;
            if (type == "datetime") {
                status = /^([0-9]{4}|(YYYY|yyyy))\-([0-9]{2}|(MM|mm))\-([0-9]{2}|(DD|dd))T([0-9]{2}|(HH|hh)):([0-9]{2}|(MM|mm))$/.test(dateString);
            } else if (type == "date") {
                status = /^([0-9]{4}|(YYYY|yyyy))\-([0-9]{2}|(MM|mm))\-([0-9]{2}|(DD|dd))$/.test(dateString);
            }
            return status;
        }

        function decodeDateRange(nativeDateInput) {
            function tmp(id, type) {
                var tstrng = type != "date" ? "Thh:mm" : "";
                return "The '" + id + "' attribute of the date input must be of the format yyyy-mm-dd" + tstrng;
            }

            function checkDate(date, id) {
                var tDate = new Date(date);
                if (id != "default") {
                    if (!tDate.isValid()) {
                        throw new Error("The supplied " + id + " date is invalid");
                    }
                } else {
                    if (!tDate.isValid()) {
                        nativeDateInput.value = "";
                    }
                }
            }
            var minDate = nativeDateInput.getAttribute("min");
            var maxDate = nativeDateInput.getAttribute("max");
            var initialValue = nativeDateInput.value;
            var includeTime = pickerType(nativeDateInput);
            var rangeStart, rangeEnd;
            nativeDateInput.setAttribute(validationAttribute, "false");
            if (minDate != null) {
                if (!validFormat(minDate, "date")) {
                    throw new Error(tmp("min"));
                }
                checkDate(minDate, "min");
                var minYear = parseInt(minDate.split("-")[0]);
                rangeStart = minYear < 1900 ? 1900 : minYear;
            } else {
                minDate = "1900-01-01";
                rangeStart = 1900; //Default min year => 1900 
            }
            if (maxDate != null) {
                if (!validFormat(maxDate, "date")) {
                    throw new Error(tmp("max"));
                }
                checkDate(maxDate, "max");
                var maxYear = parseInt(maxDate.split("-")[0]);
                rangeEnd = maxYear > 2050 ? 2050 : maxYear;
            } else {
                maxDate = "2050-12-31";
                rangeEnd = 2050; //Default max year 1900
            }
            if (initialValue != "") {
                var type = includeTime ? "datetime" : "date";
                if (!validFormat(initialValue, type)) {
                    throw new Error(tmp("value"));
                }
                checkDate(initialValue, "default");
                if (!compareDate(initialValue, maxDate)) {
                    throw new Error("The default date cannot be greater than maximum date");
                }
                if (!compareDate(minDate, initialValue)) {
                    throw new Error("The default date cannot be less than minmum date");
                }
                nativeDateInput.setAttribute(validationAttribute, "true");
            }

            //Validate dates
            if (!compareDate(minDate, maxDate)) {
                throw new Error("Maximum date cannot be less than minmum value");
            }

            var startYear = parseInt(rangeStart.toString()[0] + rangeStart.toString()[1] + rangeStart.toString()[2] + "0");
            var endYear = parseInt(rangeEnd.toString()[0] + rangeEnd.toString()[1] + rangeEnd.toString()[2] + "0");
            nativeDateInput.setAttribute("data-max", maxDate);
            nativeDateInput.setAttribute("data-min", minDate);
            nativeDateInput.setAttribute("data-rangeStart", startYear);
            nativeDateInput.setAttribute("data-rangeEnd", endYear);

        }

        function dateComponentsVariables(wrapper) {
            var dField = wrapper.querySelector(".dField");
            var includeTime = pickerType(wrapper.nextElementSibling);
            var dateComponents = getDateComponent(dField, includeTime);

            return {
                dField,
                includeTime,
                dateComponents
            }
        }

        function isCompleted(dateComponents) {
            var status = true;
            var keys = ["YY", "MM", "DD", "HH", "MM"];
            var dateObjKeys = Object.values(dateComponents["dateParts"]);

            for (var x = 0; x < 3; x++) {
                if (keys.indexOf(dateObjKeys[x]) != -1) { //Found
                    status = false;
                    break
                }
            }
            if (dateComponents["timeParts"] != null && status == true) { //both date and time
                var timeObjKeys = Object.values(dateComponents["timeParts"]);
                for (var x = 0; x < 2; x++) {
                    if (keys.indexOf(timeObjKeys[x]) != -1) {
                        status = false;
                        break
                    }
                }
            }
            return status;
        }

        function showDateBox(wrapper) {
            var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
            var dateBoxTitileCon = wrapper.querySelector(".vDateBoxHeader");
            var dateBoxArrow = wrapper.querySelectorAll(".vDateBoxArrow");
            var rangeCon = wrapper.querySelector(".vDateRangeCon");
            var yearCon = wrapper.querySelector(".vYearsCon");
            var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
            wrapper.classList.add("activeWidget");
            var dField = wrapper.querySelector(".dField");
            hideAnyDatePicker(dField);
            autoPlace(dateBoxParent);
            dateBoxParent.style["display"] = "block";
            dateBoxParent.scrollHeight;
            dateBoxParent.classList.add("opening");
            shift(dateBoxParent, dateBoxArrow);
            dateBoxParent.style["height"] = dateBoxParent.scrollHeight + "px";
            if (rangeCon != null) {
                rangeCon.style["opacity"] = "1";
                dateBoxTitileCon.innerHTML = rangeCon.getAttribute("data-title");
                rangeCon.style["z-index"] = "1";
                toggleListScroller(wrapper);
            } else {
                yearCon.style["opacity"] = "1";
                dateBoxTitileCon.innerHTML = yearCon.getAttribute("data-title");
                yearCon.style["z-index"] = "1";
                yearCon.style["width"] = "100%";
                yearCon.style["height"] = "100%";
                yearCon.style["display"] = "flex";
                yearCon.style["justify-content"] = "center";
            }
            dateComponents["timeParts"] != null ? toggleDoneButton(wrapper) : null;
            setSuperActive(wrapper);
        }

        function closeDateBox(wrapper) {
            var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
            var activeDisplay = wrapper.querySelector(".displayActive");
            var backButton = wrapper.querySelector(".vBack");
            if (activeDisplay != null) {
                activeDisplay.style["display"] = "none";
                activeDisplay.style["opacity"] = "0";
                activeDisplay.classList.remove("displayActive");
            }
            dateBoxParent.classList.add("exiting");
            dateBoxParent.style["height"] = "0px";
            backButton.classList.add("vbInactive");
            backButton.classList.remove("vbActive");
            checkSave(wrapper);
        }

        function getSelectedValue(nativeDateInput, type) {
            var value;
            if (type == "year") {
                value = nativeDateInput.value.split("-")[0];
            } else if (type == "month") {
                value = nativeDateInput.value.split("-")[1];
            } else if (type == "day") {
                value = nativeDateInput.getAttribute("value").split("-")[2].split(" ")[0];
            }
            return value;
        };

        function setInputDefaultValues(nativeDateInput) {
            var wrapper = nativeDateInput.previousElementSibling;
            var hrInput = wrapper.querySelector(".hr");
            var minInput = wrapper.querySelector(".min");
            var timeParts = dateComponentsVariables(wrapper)["dateComponents"]["timeParts"];
            var meridianSwitch = wrapper.querySelector(".meridianSwitchCon");
            minInput.value = fixDigitLength(parseInt(timeParts[1]));
            hrInput.value = fixDigitLength(parseInt(timeParts[0]));
            if (parseInt(timeParts[0]) >= 12) { //pm
                parseInt(timeParts[0]) == 12 ? hrInput.value = 12 : hrInput.value = fixDigitLength(parseInt(timeParts[0]) - 12);
                meridianSwitch.parentNode.classList.add("PMon");
                meridianSwitch.parentNode.classList.remove("AMon");
                toggleMeridianSwitch(meridianSwitch);
            }
        }

        function resetMComponentsValue(wrapper, dateComponents, series) {
            if (series == "ymd") {
                dateComponents["dateParts"][0] = "YYYY";
                dateComponents["dateParts"][1] = "MM";
                dateComponents["dateParts"][2] = "DD";
                var allChildSelected = wrapper.querySelectorAll(".vSelected:not(.range)");
                var total = allChildSelected.length;
                if (total > 0) {
                    for (var x = 0; x < total; x++) {
                        allChildSelected[x].classList.remove("vSelected");
                    }
                }
            } else if (series == "md") {
                dateComponents["dateParts"][1] = "MM";
                dateComponents["dateParts"][2] = "DD";
                var sMonth = wrapper.querySelector(".month.vSelected");
                var sDay = wrapper.querySelector(".day.vSelected");
                sMonth != null ? sMonth.classList.remove("vSelected") : null;
                sDay != null ? sDay.classList.remove("vSelected") : null;
            } else if (series == "d") {
                dateComponents["dateParts"][2] = "DD";
                var sDay = wrapper.querySelector(".day.vSelected");
                sDay != null ? sDay.classList.remove("vSelected") : null;
            }
        }

        function updateActive(wrapper, selected, type) {
            if (type == "range") {
                var current = wrapper.querySelector(".range.vSelected");
            } else if (type == "year") {
                var current = wrapper.querySelector(".year.vSelected");
            } else if (type == "month") {
                var current = wrapper.querySelector(".month.vSelected");
            } else if (type == "day") {
                var current = wrapper.querySelector(".day.vSelected");
            }
            current != null ? current.classList.remove("vSelected") : null;
            selected.classList.add("vSelected");
        }

        function hideAnyDatePicker(dField) {
            var any = $$.sa(".dField[data-state='opened']");
            var total = any.length;
            if (total > 0) {
                for (var x = 0; x < total; x++) {
                    if (any[x] != dField) {
                        var wrapper = $$.sm(any[x]).getParent(2);
                        var dField = wrapper.querySelector(".dField");
                        wrapper.classList.remove("activeWidget");
                        closeDateBox(wrapper);
                    }
                }
            }
        }
        var body = {
            autoBuild: function() {
                if (datePickerClassName == "") {
                    throw new Error("Setup imcomplete: datePicker class name must be supllied, specify using the 'config.className' property");
                }
                if (validationAttribute == "") {
                    throw new Error("Setup imcomplete: No validation attribute, specify using the 'config.validationAttribute' property");
                }
                if (sizeAttribute == "") {
                    throw new Error("Setup imcomplete: date input size attribute to be used has not been specified, the attribute to be used must be specified using the 'config.sizeAttribute' property");
                }

                reCreateDatePicker();
                createStyles();
                AddEventHandlers();
                if (daysToolTip) {
                    import("./vUX-toolTip.js")
                    .then(function(module){
                        toolTipHandler = new module.ToolTip();
                        tooTipHandler.config.tipBoxStyles = daysToolTipProperties;
                        tooTipHandler.config.className = "datePickerToolTip-"+datePickerClassName;
                        tooTipHandler.initialize();
                    })
                };
                if (wrapAttribute != "") wrap("datePicker", wrapAttribute);
            },
            config: {},
            refresh: function(parent) {
                validateElement(parent, "datePicker.refresh() method expects a valid DOM element as argument 1");
                var allNewdatePickers = parent.querySelectorAll("." + datePickerClassName + ":not(.xDnative)");
                var totalNewdatePickers = allNewdatePickers.length;
                if (totalNewdatePickers > 0) {
                    for (var x = 0; x < totalNewdatePickers; x++) {
                        allNewdatePickers[x].classList.contains(datePickerClassName) ? runDatePickerBuild(allNewdatePickers[x]) : null;
                    }
                }
            }
        }
        Object.defineProperties(body, {
            config: { writable: false },
            refresh: {
                writable: false
            },
            autoBuild: {
                writable: false
            }
        });
        Object.defineProperties(body.config, {
            inputIconStyle: {
                set: function(value) {
                    //[a,b,c] => a= icon normal State; b = icon hover State, b = icon active State
                    var temp = "config.inputIconStyle property array members";
                    validateArray(value, "config.inputIconStyle property expects an array as value");
                    if (value.length > 3) {
                        throw new Error(temp + " cannot be more than 3");
                    }
                    validateArrayMembers(value, "string", temp + "must all be string");
                    dateInputIconStyle = value;
                }
            },
            daysToolTip: {
                set: function(value) {
                    validateBoolean(value, "'config.daysToolTip' property value must be a boolean");
                    daysToolTip = value;
                }
            },
            mobileView: {
                set: function(value) {
                    if (validateInteger(value)) {
                        if (value > 300) {
                            mobileView = value;
                        } else {
                            throw new Error("'mobileView' property integer value must be greater than 300");
                        }
                    } else {
                        throw new Error("'mobileView' property value must be an integer");
                    }
                }
            },
            labelProperties: {
                set: function(value) {
                    //[a,b,c] => a= backgroundColr; b= fontColor ; c= borderStyle
                    var temp = "config.labelProperties property array members";
                    validateArray(value, "config.labelProperties property expects an array as value");
                    if (value.length > 3) {
                        throw new Error(temp + " cannot be more than 3");
                    }
                    validateArrayMembers(value, "string", temp + "must all be string");
                    labelProperties = value;
                }
            },
            daysToolTipProperties: {
                set: function(value) {
                    var validKeys = Object.keys(daysToolTipProperties);
                    var sourceKeys = Object.keys(value);
                    validateObject(value, "datePicker.config.daysToolTipProperties property expects an object");
                    if (sourceKeys.length > 2) {
                        throw new Error(temp + " cannot be more than 2 properties");
                    }

                    for (let x = 0; x < sourceKeys; x++) {
                        if(validKeys.indexOf(sourceKeys[x]) == -1){
                            throw new Error ("datePicker.config.daysToolTipProperties property can only accept these any of the keys: "+keys.join(", ") +". The key: '"+sourceKeys[x]+"' is not one of them");
                        }else{
                            validateString(value[sourceKeys[x]], "datePicker.config.daysToolTipProperties object key: "+sourceKeys[x]+" expects a string as value");
                        }
                    }
                    daysToolTipProperties = value;
                }
            },
            className: {
                set: function(value) {
                    validateString(value, "datePicker.config.className property expect a string as value");
                    datePickerClassName = value;
                }
            },
            selectionStyle: {
                set: function(value) {
                    validateString(value, "'config.selectionStyle' property must be string of valid CSS style(s)");
                    selectionStyle = value;
                }
            },
            inputButtonStyle: {
                set: function(value) {
                    validateString(value, "'config.inputButtonStyle' property must be string of valid CSS style(s)");
                    inputButtonStyle = value;
                }
            },
            validationAttribute: {
                set: function(value) {
                    validateString(value, "'config.validationAttribute' property must be string");
                    validationAttribute = value;
                }
            },
            dateFieldStyle: {
                set: function(value) {
                    validateString(value, "'config.dateFieldStyle' property must be string of valid CSS style(s)");
                    dateFieldStyle = value;
                }
            },
            sizeAttribute: {
                set: function(value) {
                    validateString("'config.sizeAttribute' property value must be a string");
                    sizeAttribute = value;
                }
            },
            wrapAttribute: {
                set: function(value) {
                    validateString("'config.wrapAttribute' property value must be a string");
                    wrapAttribute = value;
                }
            },
        });
        return body;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*SlideSwitch^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.slideSwitch = function(){
        var slideSwitchWrapperStyles = ["", "", ""], slideSwitchClassName = "", handleStyles=["", "", ""], showLabel=true, labelStyles=["", ""], sizeAttribute="", labelAttribute="", slideDistance="";
        function sliderSwitchStyleSheet(){
            if ($$.ss("style[data-id='v" + slideSwitchClassName + "']") == null) {
                var css = "";
                var wrapper = $$.ss(".v"+slideSwitchClassName);
                var wrapperHeight = $$.sm(wrapper).cssStyle("height");
                
                var handleMainStyle = "width:"+wrapperHeight+"; height:"+wrapperHeight+";";
                var handleMainStyle2 = "";

                //Default
                css += ".v" + slideSwitchClassName + "::before{"+handleMainStyle+"}"; //normal style
                css += ".v" + slideSwitchClassName + ".sOn::before {left:CALC(100% - "+wrapperHeight+")}"; //Slide distance
               
                //user defined handle styles
                css += ".v" + slideSwitchClassName + "::before {"+handleStyles[0]+"}"; //normal style
                css += ".v" + slideSwitchClassName + ".sOn::before {"+handleStyles[1]+"}"; //On style
                css += ".v" + slideSwitchClassName + ".sOff::before {"+handleStyles[2]+"}"; //Off style

                //user defined wrapper styles
                css += ".v" + slideSwitchClassName + "{"+slideSwitchWrapperStyles[0]+"}"; //normal style
                css += ".v" + slideSwitchClassName + ".sOn{"+slideSwitchWrapperStyles[1]+"}"; //on style
                css += ".v" + slideSwitchClassName + ".sOff{"+slideSwitchWrapperStyles[2]+"}"; //off style


                attachStyleSheet("v" + slideSwitchClassName, css);

                var wrapperHeight = $$.sm(wrapper).cssStyle("height", ":before");
                var top = parseInt(wrapperHeight)/2;
                handleMainStyle2 = "top:50%; margin-top:-"+top+"px;";
                css += ".v" + slideSwitchClassName + "::before {"+handleMainStyle2+"}"; //normal style
                css += ".v" + slideSwitchClassName + ".sOn::before {left:CALC(100% - "+wrapperHeight+")}";
                if (slideDistance != ""){
                    if (slideDistance[0] != undefined) css += ".v" + slideSwitchClassName + ".sOff::before {left:"+slideDistance[0]+"!important;}"; //off
                    if (slideDistance[1] != undefined) css += ".v" + slideSwitchClassName + ".sOn::before {left:"+slideDistance[1]+"!important;}"; //on
                }  
                attachStyleSheet("vSecondary", css);
            }
        }
        function assignSlideSwitchEventHanler(){
            $$.attachEventHandler("click", ["vSlideSwitchWrapper", "vSliderBg-ON", "vSliderBg-OFF"], function(e, id){
                if(id == "vSlideSwitchWrapper"){
                    var nativeCheckBox = e.target.previousElementSibling;
                    if(e.target.classList.contains("sOn")){ //turn off
                        e.target.classList.remove("sOn");
                        e.target.classList.add("sOff");
                        e.target.setAttribute("data-checked", '0');
                        nativeCheckBox.checked = true;
                        nativeCheckBox.click();
                    }else{//turn on
                        e.target.classList.remove("sOff");
                        e.target.classList.add("sOn");
                        e.target.setAttribute("data-checked", '1');
                        nativeCheckBox.checked = false;
                        nativeCheckBox.click();
                    }
                }else if(id == "vSliderBg-ON" || id == "vSliderBg-OFF"){
                    var wrapper = $$.sm(e.target).getParent(3);
                    wrapper.click();
                }
            })
        }
        function convertCheckboxTosliderSwitch(){
            var allSelects = $$.sa("." + slideSwitchClassName);
            for (var x = 0; x < allSelects.length; x++) {
                runSlideSwitchBuild(allSelects[x]);
            }
        }
        function runSlideSwitchBuild(nativeCheckbox){
            if (nativeCheckbox.getAttribute("type") != "checkbox") throw new Error("Only checkboxes can be made a slide switch");
            var parent = nativeCheckbox.parentNode;
            var checkboxParentPosition = $$.sm(parent).cssStyle("position");
            var temp = "SliderSwitch input " + sizeAttribute + " value contains invalid CSS size";
            
            if(sizeAttribute == "") throw new Error("One of the native checkBox input to be made sliderSitch has no dimension specified with the " + sizeAttribute + " attribute");
            
            var dimension = nativeCheckbox.getAttribute(sizeAttribute);
            
            if(dimension == null) throw new Error("One of the native checkBox input to be made sliderSitch has no dimension specified with the " + sizeAttribute + " attribute");

            var parseDimension = dimension.split(",");
            validateDimension(parseDimension[0], temp);
            validateDimension(parseDimension[1], temp);
            var defaultStyle = "width: "+parseDimension[0]+"; height: "+parseDimension[1]+";";
            
            //hideNative
            nativeCheckbox.classList.add("xChkNative", "vItem"); //vItem added for validation module support
            nativeCheckbox.setAttribute("tabindex", "-1");
            checkboxParentPosition == "static" ? parent.style.position = "relative" : null;


            //check existing custom element
            var current = parent.querySelector(".v"+slideSwitchClassName);
            if(current != null){
                parent.removeChild(current);
            }

            //Wrapper
            var slideSwitchWrapper = $$.ce("DIV");
            slideSwitchWrapper.classList.add("vSlideSwitchWrapper", "v" + slideSwitchClassName);

            //Wrapper custom style
            slideSwitchWrapper.setAttribute("style", slideSwitchWrapperStyles[0]+defaultStyle);

            //Set check state
            if(nativeCheckbox.checked) {
                slideSwitchWrapper.setAttribute("data-checked", 1);
                slideSwitchWrapper.classList.add("sOn");
            }else {
                slideSwitchWrapper.setAttribute("data-checked", 0);
                slideSwitchWrapper.classList.add("sOff");
            }
            
            //viewport
            var slideSwitchWrapperViewPort = $$.ce("DIV");
            slideSwitchWrapperViewPort.classList.add("vSlideSwitchWrapperVp");

            //Slider Bg
            var sliderBg = $$.ce("DIV");
            sliderBg.classList.add("vSliderBg");

            //Slider Bg states
            var sliderBgON = $$.ce("DIV");
            var sliderBgOFF = $$.ce("DIV");
            sliderBgON.classList.add("vSliderBg-ON");
            sliderBgOFF.classList.add("vSliderBg-OFF");


            //Add labels if enable
            if(showLabel){
                var labels = nativeCheckbox.getAttribute(labelAttribute).split(",");
                labels[0] == undefined?"On":labels[0];
                labels[1] == undefined?"Off":labels[1];
                sliderBgON.appendChild(document.createTextNode(labels[0])); 
                sliderBgOFF.appendChild(document.createTextNode(labels[1])); 

            }
            sliderBgOFF.setAttribute("style", labelStyles[0]); //off labelbg style
            sliderBgON.setAttribute("style", labelStyles[1]); //on labelbg style
            // slideSwitchWrapper
            
            //Insert Slider BG states to Slider Bg
            sliderBg.appendChild(sliderBgON);
            sliderBg.appendChild(sliderBgOFF);

            //Insert slider Bg to viewPort
            slideSwitchWrapperViewPort.appendChild(sliderBg);

            //insert viewPort into wrapper
            slideSwitchWrapper.appendChild(slideSwitchWrapperViewPort);
           
            //Insert wrapper to parent
            parent.appendChild(slideSwitchWrapper);
        }
        var body = {
            autoBuild: function() {
                if (slideSwitchClassName == "") throw new Error("Setup imcomplete: sliderSwitch class name must be supllied, specify using the 'config.className' property");
                if (sizeAttribute == "") throw new Error("Setup imcomplete: sliderSwitch size attribute to be used has not been specified, the attribute to be used must be specified using the 'config.sizeAttribute' property");
                var existingSheet = $$.ss("#v" + slideSwitchClassName);
                convertCheckboxTosliderSwitch();
                existingSheet == null ? sliderSwitchStyleSheet() : null;
                assignSlideSwitchEventHanler();
            },
            refresh: function(parent) {
                validateElement(parent, "slideSwitch.refresh() method expects a valid DOM element as argument 1");
                var allCheckboxes = parent.querySelectorAll("input[type='checkbox']:not(.xChkNative)");
                var totalNewCheckBoxes = allCheckboxes.length;
                if (totalNewCheckBoxes > 0) {
                    for (var x = 0; x < totalNewCheckBoxes; x++) {
                        allCheckboxes[x].classList.contains(radioClassName) ? runRadioBuild(allCheckboxes[x]) : null;
                    }
                }
            },
            config: {}
        }
        Object.defineProperties(body, {
            config: { writable: false },
            refresh: {
                writable: false
            },
            autoBuild: {
                writable: false
            }
        });
        Object.defineProperties(body.config, {
            className: {
                set: function(value) {
                    validateString(value, "config.className property expect a string as value");
                    slideSwitchClassName = value;
                }
            },
            sizeAttribute: {
                set: function(value) {
                    validateString("'config.sizeAttribute' property value must be a string");
                    sizeAttribute = value;
                }
            },
            wrapperStyles: {
                set: function(value) {
                    validateArray(value, "An array of valid CSS styles needed for 'config.wrapperStyles' property");
                    function temp(n){return "'config.wrapperStyles' array element "+n+" must be a string of valid CSS"}
                    if(value[0] != undefined) validateString(value[0], temp(1)); //nomal style
                    if(value[1] != undefined) validateString(value[1], temp(2)); //off style
                    if(value[2] != undefined) validateString(value[2], temp(3)); //on style
                    slideSwitchWrapperStyles = value;
                }
            },
            handleStyles:{
                set: function(value) {
                    validateArray(value, "An array of valid CSS styles needed for 'config.handleStyles' property");
                    function temp(n){return "'config.handleStyles' array element "+n+" must be a string of valid CSS"}
                    if(value[0] != undefined) validateString(value[0], temp(1)); //nomal style
                    if(value[1] != undefined) validateString(value[1], temp(2)); //off style
                    if(value[2] != undefined) validateString(value[2], temp(3)); //on style
                    handleStyles = value;
                }
            },
            labelStyles:{
                set: function(value) {
                    validateArray(value, "An array of valid CSS styles needed for 'config.labelStyles' property");
                    function temp(n){return "'config.labelStyles' array element "+n+" must be a string of valid CSS"}
                    if(value[0] != undefined) validateString(value[0], temp(1)); //off stale label style
                    if(value[1] != undefined) validateString(value[1], temp(2)); //on state label style
                    labelStyles = value;
                }
            },
            showLabel :{
                set: function(value) {
                    if (validateBoolean(value, "A boolean is needed for the 'config.showLabel' property")) {
                        showLabel = value;
                    }
                }
            },
            labelAttribute:{
                set: function(value) {
                    validateString("'config.labelAtribute' property value must be a string");
                    labelAttribute = value;
                }
            },
            slideDistance:{
                set: function(value) {
                    validateString("'config.slideDistance' property value must be a string");
                    slideDistance = value;
                }
            }
        });
        return body;
    }
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom file builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    this.file = function() {
        var fileDim = [],label="", toolTipHandler=null, toolTipStyles={arrowColor:"",backgrondColor:""}, buttonLabel="",wrapperStyle = "",toolTipHandler = null,fileToolTip = false,fileLabelStyle = "", fileClassName = "",inputButtonStyle = "",sizeAttribute = "";

        function fileStyleSheet() {
            if ($$.ss("style[data-id='v" + fileClassName + "']") == null) {
      
                var css = "";
                css += ".v" + fileClassName + "{width:" + fileDim[0] + "; height:" + fileDim[1] + "; z-index: 60;"+"}";
                css += ".v" + fileClassName + " .fLabel {line-height:" + fileDim[1] + ";}";
                css += ".v" + fileClassName + " .fButton::before {line-height:" + fileDim[1] + ";}";
                css += ".v" + fileClassName + " .fButton {height:" + fileDim[1] + ";}";
                
                if (wrapperStyle != "") css += ".v" + fileClassName + "{"+wrapperStyle+"}";
                
                if (fileLabelStyle != "") css += ".v" + fileClassName + " .fLabel {"+fileLabelStyle+"}";
                    
                if (inputButtonStyle != "") css += ".v" + fileClassName + " .fButton{" + inputButtonStyle + "}";

                attachStyleSheet("v" + fileClassName, css);
            }
        }

        function reCreateFile() {
            var allFiles = $$.sa("." + fileClassName);
            for (var x = 0; x < allFiles.length; x++) {
                runFileBuild(allFiles[x]);
            }
        }

        function runFileBuild(nativeFile) {
            var fileParent = nativeFile.parentNode;
            var multiple = false;
            var fileParentPosition = $$.sm(fileParent).cssStyle("position");

            var dimension = nativeFile.getAttribute(sizeAttribute);
            if (dimension == null) {
                throw new Error("One of the native select input to be made custom has no dimension specified with the '" + sizeAttribute + "' attribute");
            }

            var temp = "File input " + sizeAttribute + " value contains invalid CSS size";
            var parseDimension = dimension.split(",");
            validateDimension(parseDimension[0], temp);
            validateDimension(parseDimension[1], temp);
            fileDim[0] = parseDimension[0];
            fileDim[1] = parseDimension[1];

            //hideNative
            nativeFile.classList.add("xFnative", "vItem"); //vItem added for validation module support
            nativeFile.setAttribute("tabindex", "-1");

            //Style parent
            fileParentPosition == "static" ? fileParent.style.position = "relative" : null;

            //Set select mode
            nativeFile.getAttribute("multiple") != null ? multiple = true : null;

            //check existing custom element
            var current = fileParent.querySelector(".v"+fileClassName);
            if(current != null){
                fileParent.removeChild(current);
            }

            //Wrapper Element
            var wrapper = $$.ce("DIV");
            wrapper.classList.add("vFile", "v" + fileClassName);
            wrapper.setAttribute("tabindex", "0");            

            //file field
            var fileFieldCon = $$.ce("DIV");
            var fileLabel = $$.ce("DIV");
            var fButton = $$.ce("BUTTON");
            
            fileFieldCon.classList.add("fFieldCon");
            fileLabel.classList.add("fLabel");
            fButton.classList.add("fButton");

            var labelText = label != ""? label:multiple?"Select files":"Select file";
            fileLabel.innerText = labelText;
            fButton.innerText   = buttonLabel != ""?buttonLabel:"Browse...";

            if(fileToolTip){
                fileLabel.classList.add("fileInputToolTip-"+fileClassName);
                fileLabel.setAttribute("title", labelText); 
            } 

            fButton.setAttribute("type", "button");
            fileFieldCon.appendChild(fileLabel);
            fileFieldCon.appendChild(fButton);

            //append into wrapper
            wrapper.appendChild(fileFieldCon);


            //insert wrapper before native select
            fileParent.insertBefore(wrapper, nativeFile);

            //configure tool tip
            if(fileToolTip){
                import("./vUX-toolTip.js")
                .then(function(module){
                    toolTipHandler = new module.ToolTip();
                    toolTipHandler.config.tipBoxStyles = toolTipStyles;
                    toolTipHandler.config.className = "fileInputToolTip-"+fileClassName;
                    toolTipHandler.initialize();
                })
                 
            }
        }

        function inputLabeler(native){
            var label = native.previousElementSibling.querySelector(".fLabel");
            label.innerText = native.files[0]["name"];
            label.title = native.files[0]["name"];
            toolTipHandler.refresh();
        }

        function assignFileEventHandler() {
            $$.attachEventHandler("click", ["fButton", "fLabel"], function(e, id) {
                var nativeFileInput = $$.sm(e.target).getParent(2).nextElementSibling;
                nativeFileInput.click();
            });
            $$.attachEventHandler("change", "xFnative", function(e) {
                inputLabeler(e.target);
            });
        }

        var body = {
            autoBuild: function() {
                if (fileClassName == "") {
                    throw new Error("Setup imcomplete: file input class name must be supllied, specify using the 'config.className' property");
                }
                if (sizeAttribute == "") {
                    throw new Error("Setup imcomplete: file input size attribute to be used has not been specified, the attribute to be used must be specified using the 'config.sizeAttribute' property");
                }
                var existingSheet = $$.ss("#v" + fileClassName);

                reCreateFile();
                existingSheet == null ? fileStyleSheet() : null;
                assignFileEventHandler();
            },
            refreshFile: function(nativeFile) { //Refreshes a particular select element to update custom content
                validateElement(nativeFile, "fileObj.refreshFile() method expects a valid DOM element as argument 1");
                nativeFile.classList.contains(fileClassName) ? runSelectBuild(nativeFile) : null;
            },
            refresh: function(parent) {
                validateElement(parent, "fileObj.refresh() method expects a valid DOM element as argument 1");
                var allNewFiles = parent.querySelectorAll("input[type='file']:not(.xFnative)");
                var totalNewFiles = allNewFiles.length;
                if (totalNewFiles > 0) {
                    for (var x = 0; x < totalNewFiles; x++) {
                        allNewFiles[x].classList.contains(fileClassName) ? runFileBuild(allNewFiles[x]) : null;
                    }
                }
            },
            config: {}
        }

        Object.defineProperties(body, {
            autoBuild: { writable: false },
            refresh: { writable: false },
            refreshFile: { writable: false },
            config: { writable: false }
        })
        Object.defineProperties(body.config, {
            sizeAttribute: {
                set: function(value) {
                    validateString("'config.sizeAttribute' property value must be a string");
                    sizeAttribute = value;
                }
            },
            wrapperStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property");
                    wrapperStyle = value;
                }
            },
            fileLabelStyle:{
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'fileLabelStyle' property");
                    fileLabelStyle = value;
                }
            },
            fileLabel: {
                set: function(value) {
                    validateString(value, "config.fileLabel property expects a string as value");
                    label = value;
                }
            },
            inputButtonStyle: {
                set: function(value) {
                    validateString(value, "A string of valid CSS styles needed for the 'config.inputButtonStyle' property");
                    inputButtonStyle = value;
                }
            },
            className: {
                set: function(value) {
                    validateString(value, "config.className property expect a string as value");
                    fileClassName = value;
                }
            },
            fileToolTip: {
                set: function(value) {
                    validateBoolean(value, "config.fileToolTip property expect a boolean as value");
                    fileToolTip = value;                  
                }
            },
            toolTipStyles:{
                set:function(value){
                    var validKeys = Object.keys(toolTipStyles);
                    var sourceKeys = Object.keys(value);
                    validateObject(value, "file.config.toolTipStyles property expects an object");
                    if (sourceKeys.length > 2) {
                        throw new Error(temp + " cannot be more than 2 properties");
                    }

                    for (let x = 0; x < sourceKeys; x++) {
                        if(validKeys.indexOf(sourceKeys[x]) == -1){
                            throw new Error ("file.config.toolTipStyles property can only accept these any of the keys: "+keys.join(", ") +". The key: '"+sourceKeys[x]+"' is not one of them");
                        }else{
                            validateString(value[sourceKeys[x]], "file.config.toolTipStyles object key: "+sourceKeys[x]+" expects a string as value");
                        }
                    }
                    toolTipStyles = value;
                }
            }
        })
        return body;
    };
    /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    Object.defineProperties(this, {
        checkbox: { writable: false },
        radio: { writable: false },
        select: { writable: false },
        datePicker: { writable: false }
    })
}
/****************************************************************/