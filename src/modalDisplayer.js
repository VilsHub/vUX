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

/************************ModalDisplayer***************************/
function ModalDisplayer() {
    var self = this,cssWidth = "",currentForm = null,id = null,totalHeight, effectName = "none",bodyOldPosition = "",mainFormCon = "",closeButton = null,mainFormConInner = "",overlayBackgroundType = "color",overlayBackground = ["hsla(0, 0%, 100%, 0.48)", ""],initialized = false,openProcessor = function() {},closeProcessor = function() {},modalOn = false,sY = 0,sX = 0,endSy = 0,scrollable = false,computedModalHeight = 0,computedModalWidth = 0,modalHeigthBelow = 0,modalHeigthAbove = 0,paddingTop = 50;
    var modalWidths = ["500px", "500px", "86%"], brkpoints = { largeStart: 1000, mediumStart: 520 },pageContainer = null,className = "",formIdAttribute = "",closeButtonClass = "",modalWidthsAttribute = "";

    //modalWidths => [a, b, c] => a = large; b = medium; c = small
    //screenBreakPoints => [a,b] => a = largeStart ; b = mediumStart

    var effects = {
        none: function(modal) {
            var newModal = $$.ce("DIV");
            newModal.setAttribute("id", "newModal");
            modalOn = true;
            var modayBody = $$.ss(".vModal");
            var modalCon = modayBody.querySelector(".modalSpace");

            //Create and set newmodal style
            var newModalCSS = "width:" + cssWidth + "; height:" + computedModalHeight + "px;";
            newModal.setAttribute("style", newModalCSS);

            positionVertically(modalCon, computedModalHeight);
            modalCon.appendChild(newModal);

            //Call new modal
            var newM = modalCon.querySelector("#newModal");

            newM.innerHTML = modal.outerHTML;

            //Store up main form content
            mainFormConInner = modal.innerHTML;

            var RecallOld = newM.querySelector("#" + modal.id);
            RecallOld.style["display"] = "block";

            //Tag old for resseting purpose
            modal.classList.add("vOld");
            modal.setAttribute("id", "vOld");
            modal.innerHTML = "";

            modayBody.classList.add("show");
        },
        split: function(modal) {
            var newModal = $$.ce("DIV");
            var effectsCon = $$.ce("DIV");
            var leftEle = $$.ce("DIV");
            var rightEle = $$.ce("DIV");
            //left style
            var lcss = "position:absolute;left:-200%; top:0; transition:left .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:" + computedModalHeight + "px; overflow:hidden;";
            var rcss = "position:absolute;right:-200%; top:0; transition:right .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:" + computedModalHeight + "px; overflow:hidden;";

            //EffectsCons attributes
            effectsCon.setAttribute("style", "position:relative; width:" + computedModalWidth + "px; height:" + computedModalHeight + "px;");
            effectsCon.setAttribute("id", "effectsCon");
            effectsCon.setAttribute("class", "trans_in split");

            //left and right style attribute
            leftEle.setAttribute("id", "eleft");
            leftEle.setAttribute("style", lcss);
            leftEle.classList.add("effectE");
            rightEle.setAttribute("style", rcss);
            rightEle.setAttribute("id", "eright");
            rightEle.classList.add("effectE");

            newModal.setAttribute("id", "newModal");

            modalOn = true;
            var modayBody = $$.ss(".vModal");
            var modalCon = modayBody.querySelector(".modalSpace");

            positionVertically(modalCon, computedModalHeight);

            //Append left and right to effectsCon
            effectsCon.appendChild(leftEle);
            effectsCon.appendChild(rightEle);

            //Append effectsCon to modalSpace
            modalCon.appendChild(newModal);
            modalCon.appendChild(effectsCon);

            //Call left and right effect box
            var leftE = modalCon.querySelector("#eleft");
            var rightE = modalCon.querySelector("#eright");

            //insert main form to both left and right effect box and make visible
            leftE.innerHTML = modal.outerHTML;
            leftE.childNodes[0].style["display"] = "block";
            leftE.childNodes[0].style["left"] = "0px";
            rightE.innerHTML = modal.outerHTML;
            rightE.childNodes[0].style["display"] = "block";
            rightE.childNodes[0].style["right"] = "0px";

            //Store up main form content
            mainFormCon = modal.outerHTML;
            mainFormConInner = modal.innerHTML;

            //Tag old for resseting purpose
            modal.classList.add("vOld");
            modal.setAttribute("id", "vOld");
            modal.innerHTML = "";

            modayBody.classList.add("show");
            leftE.scrollWidth;
            rightE.scrollWidth;
            leftE.style["left"] = "0%";
            rightE.style["right"] = "0%";
        },
        flip: function(modal) {
            var newModal = $$.ce("DIV");
            var effectsCon = $$.ce("DIV");
            var flipper = $$.ce("DIV");
            var flipperBGElement = $$.ce("DIV");
            var flipperFormElement = $$.ce("DIV");

            var mainFormBg = $$.sm(modal).cssStyle("background-color");

            //Create Style for flipper
            var flipperCSS = "transition:transform .6s linear 0s; width:100%; height:100%; transform-style:preserve-3d; backface-visibilty: hidden; transform:rotateX(0deg); ";

            //flipperBGElement styles
            flipperBGElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:2; background-color:" + mainFormBg + ";");
            flipperBGElement.setAttribute("id", "fBG");
            //flipperFormElement styles and other attributes
            flipperFormElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:1; transform:rotateX(-180deg);");
            flipperFormElement.setAttribute("id", "flpform");
            //Set attribute for effectsCon
            effectsCon.setAttribute("style", "position:relative; width:" + computedModalWidth + "px; height:" + computedModalHeight + "px; perspective: 4000px;");
            effectsCon.setAttribute("id", "effectsCon");
            effectsCon.setAttribute("class", "trans_in flip");

            //Set attributes for flipper
            flipper.setAttribute("id", "flipper");
            flipper.setAttribute("style", flipperCSS);


            //Set attribute for newModal
            newModal.setAttribute("id", "newModal");

            modalOn = true;
            var modayBody = $$.ss(".vModal");
            var modalCon = modayBody.querySelector(".modalSpace");

            positionVertically(modalCon, computedModalHeight);

            //Append flipperBGElement and flipperFormElement to effectsCon
            flipper.appendChild(flipperFormElement);
            flipper.appendChild(flipperBGElement);

            //Append flipper to effectsCon
            effectsCon.appendChild(flipper);

            //Append effectsCon and new modal to modalSpace
            modalCon.appendChild(newModal);
            modalCon.appendChild(effectsCon);

            //Call flipperFormElement box
            var flipperFormE = modalCon.querySelector("#flipper #flpform");
            var flipperEffectBox = modalCon.querySelector("#flipper");

            //insert main form to flipper and make visible
            flipperFormE.innerHTML = modal.outerHTML;
            flipperFormE.childNodes[0].style["display"] = "block";

            //Store up main form content
            mainFormCon = modal.outerHTML;
            mainFormConInner = modal.innerHTML;

            //Tag old for resseting purpose
            modal.classList.add("vOld");
            modal.setAttribute("id", "vOld");
            modal.innerHTML = "";

            modayBody.classList.add("show");

            flipperEffectBox.scrollHeight;
            flipperEffectBox.style["transform"] = "rotateX(180deg)";
        },
        box: function(modal) {
            var newModal = $$.ce("DIV");
            var effectsCon = $$.ce("DIV");
            var box = $$.ce("DIV");

            //Set attribute for effectsCon
            effectsCon.setAttribute("style", "position:relative; width:" + computedModalWidth + "px; height:" + computedModalHeight + "px;");
            effectsCon.setAttribute("id", "effectsCon");
            effectsCon.setAttribute("class", "trans_in box");

            //Create Style and attributes for Box
            var boxCSS = "position:absolute; transition:all .3s linear 0s; width:0%; height:0%; top:50%; left:50%; transform:translateX(-50%) translateY(-50%); overflow:hidden";
            box.setAttribute("style", boxCSS);
            box.setAttribute("id", "Boxform");

            //Set attribute for newModal
            newModal.setAttribute("id", "newModal");

            modalOn = true;
            var modayBody = $$.ss(".vModal");
            var modalCon = modayBody.querySelector(".modalSpace");

            positionVertically(modalCon, computedModalHeight);

            //Append Nox to effectsCon
            effectsCon.appendChild(box);

            //Append effectsCon and new modal to modalSpace
            modalCon.appendChild(newModal);
            modalCon.appendChild(effectsCon);

            //Call Box Element
            var BoxFormE = modalCon.querySelector("#Boxform");

            //insert main form to Box and make visible
            BoxFormE.innerHTML = modal.outerHTML;
            BoxFormE.childNodes[0].style["display"] = "block";

            //Store up main form content
            mainFormCon = modal.outerHTML;
            mainFormConInner = modal.innerHTML;

            //Tag old for resseting purpose
            modal.classList.add("vOld");
            modal.setAttribute("id", "vOld");
            modal.innerHTML = "";

            modayBody.classList.add("show");
            BoxFormE.scrollHeight;
            BoxFormE.style["width"] = "100%";
            BoxFormE.style["height"] = "100%";
        }
    };
    var closeEffect = {
        none: function(oldModal, currentModal) {
            var modalBody = $$.ss(".vModal");
            var modalCon = $$.ss(".vModal .modalSpace");
            var recallCurrent = $$.ss(".vModal .modalSpace #newModal");
            resetOldModalProperties(oldModal, currentModal);
            modalCon.removeAttribute("style");

            modalCon.removeChild(recallCurrent);
            modalBody.classList.remove("show");
            modalOn = false;
            scrollable = false;
            document.body.style["position"] = bodyOldPosition;
            document.body.style["top"] = "0";
            scrollTo(0, sY);
            closeProcessor();
        },
        split: function(oldModal, currentModal) {
            var modalBody = $$.ss(".vModal");
            var modalCon = $$.ss(".vModal .modalSpace");
            var recallCurrent = $$.ss(".vModal .modalSpace #newModal");
            var effectsCon = modalCon.querySelector("#effectsCon");
            var leftE = effectsCon.querySelector("#eleft");
            var rightE = effectsCon.querySelector("#eright");

            effectsCon.classList.remove("trans_in");
            effectsCon.classList.add("trans_out");
            effectsCon.style["display"] = "block";
            recallCurrent.style["display"] = "none";

            leftE.innerHTML = mainFormCon;
            leftE.childNodes[0].style["display"] = "block";
            leftE.childNodes[0].style["left"] = "0px";
            leftE.style["transition"] = "left .4s cubic-bezier(.86,.01,.99,.48)";
            leftE.scrollWidth;
            leftE.style["left"] = "-200%";

            rightE.innerHTML = mainFormCon;
            rightE.childNodes[0].style["display"] = "block";
            rightE.childNodes[0].style["right"] = "0px";
            rightE.style["transition"] = "right .4s cubic-bezier(.86,.01,.99,.48)";
            rightE.scrollWidth;
            rightE.style["right"] = "-200%";

            resetOldModalProperties(oldModal, currentModal);
            modalCon.removeChild(recallCurrent);
        },
        flip: function(oldModal, currentModal) {
            var modalBody = $$.ss(".vModal");
            var modalCon = $$.ss(".vModal .modalSpace");
            var recallCurrent = $$.ss(".vModal .modalSpace #newModal");
            var effectsCon = modalCon.querySelector("#effectsCon");
            var flipper = effectsCon.querySelector("#flipper");
            var flipperFormE = effectsCon.querySelector("#flpform");
            var flipperBg = effectsCon.querySelector("#fBG");

            flipper.style["transform"] = "rotateX(0deg)";


            //Reinsert main form content in box and display
            flipperFormE.innerHTML = mainFormCon;
            flipperFormE.childNodes[0].style["display"] = "block";

            //Modify Styles to fit in display
            flipperFormE.style["transform"] = "rotateX(0deg)";
            flipperFormE.style["z-index"] = "3";
            flipperBg.style["transform"] = "rotateX(180deg)";

            effectsCon.classList.remove("trans_in");
            effectsCon.classList.add("trans_out");
            effectsCon.style["display"] = "block";

            flipper.scrollWidth;
            flipper.style["transform"] = "rotateX(-180deg)";
            resetOldModalProperties(oldModal, currentModal);
            modalCon.removeChild(recallCurrent);
        },
        box: function(oldModal, currentModal) {
            var modalBody = $$.ss(".vModal");
            var modalCon = $$.ss(".vModal .modalSpace");
            var recallCurrent = $$.ss(".vModal .modalSpace #newModal");
            var effectsCon = modalCon.querySelector("#effectsCon");

            var box = effectsCon.querySelector("#Boxform");

            effectsCon.classList.remove("trans_in");
            effectsCon.classList.add("trans_out");
            effectsCon.style["display"] = "block";

            //Reinsert main form content in box and display
            box.innerHTML = mainFormCon;
            box.childNodes[0].style["display"] = "block";

            box.scrollWidth;
            box.style["width"] = "0%";
            box.style["height"] = "0%";
            resetOldModalProperties(oldModal, currentModal);
            modalCon.removeChild(recallCurrent);
        }
    }

    function positionVertically(modal, height) {
        var browserHeight = window.innerHeight;
        var diff = browserHeight - height;
        sX = window.scrollX;
        sY = window.scrollY;
        modalHeigthBelow = ((paddingTop * 2) + computedModalHeight) - window.innerHeight;
        if (diff < 100) {
            scrollable = true;
            var heightBelow = VerticalScroll.query(parseInt($$.sm("html").cssStyle("height"), "px"))["remainingHeightBelow"];
            if (heightBelow >= modalHeigthBelow) {
                modal.style["top"] = "50px";
                modal.style["padding-bottom"] = "50px";
                modal.style["transform"] = "translateY(0%) translateX(-50%)";
            } else {
                modalHeigthAbove = ((paddingTop * 2) + computedModalHeight) - window.innerHeight;
                if (modalHeigthAbove > 0) {
                    modal.style["top"] = "50" + "px";
                    modal.style["padding-bottom"] = "50px";
                    modal.style["transform"] = "translateY(0%) translateX(-50%)";
                } else {
                    $$.sm(modal).center();
                }
            }
        }
        if (modalOn == true) {
            bodyOldPosition = $$.sm("body").cssStyle("position");
            document.body.style["position"] = "fixed";
            document.body.style["top"] = "-" + sY + "px";
        }
    }

    function releaseModal(e) {
        var modalBody = $$.ss(".vModal");
        var modalCon = $$.ss(".vModal .modalSpace");

        modalCon.removeAttribute("style");
        e.target.parentNode.classList.remove("trans_out");
        modalCon.removeChild(modalCon.querySelector("#effectsCon"));
        modalBody.classList.remove("show");

        modalOn = false;
        scrollable = false;
        document.body.style["position"] = bodyOldPosition;
        document.body.style["top"] = "0";
        mainFormCon = "";
        mainFormConInner = "";
        bodyOldPosition = "";
        $$.ss("html").style["scroll-behavior"] = "unset";
        scrollTo(0, sY);
        closeProcessor();
        if (overlayBackgroundType == "blur" && pageContainer != null) pageContainer.classList.remove("vxKit");
        $$.ss("html").style["scroll-behavior"] = "smooth";
    }

    function addEventhandler() {
        
        var mainModal = $$.ss(".modalSpace");
        document.body.addEventListener("keydown", function(e) {
            if (modalOn == true) {
                if (keyboardEventHanler(e)["handled"] == true) {
                    if (e.key == "Escape") {
                        self.close();
                    }
                }
            }
        }, false);
        document.body.addEventListener("transitionend", function(e) {
            if (modalOn == true) {
                if (e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("split")) {
                    e.target.innerHTML = "";
                    e.target.parentNode.style["display"] = "none";

                    if (e.target.id == "eright") {
                        //display main modalformCon
                        var newM = $$.ss(".vModal #newModal");

                        newM.style["width"] = "100%";
                        newM.style["height"] = computedModalHeight + "px";
                        // insert main form to new formCon and display
                        newM.innerHTML = mainFormCon;
                        newM.style["display"] = "block";
                        newM.childNodes[0].style["display"] = "block";
                        newM.childNodes[0].style["width"] = "100%";
                        openProcessor();
                        fixModalWidth(mainModal);
                    }
                } else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("split")) {
                    if (e.target.id == "eleft") {
                        releaseModal(e);
                    }
                } else if (e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("flip")) {
                    //Remove effect modal
                    e.target.querySelector("#flpform").innerHTML = "";
                    e.target.parentNode.style["display"] = "none";

                    //Call new modal
                    var newM = $$.ss(".vModal #newModal");

                    //insert main form to new formCon and display
                    newM.innerHTML = mainFormCon;
                    newM.style["display"] = "block";
                    newM.style["width"] = computedModalWidth + "px";
                    newM.style["height"] = computedModalHeight + "px";
                    newM.childNodes[0].style["display"] = "block";
                    openProcessor();
                    fixModalWidth(mainModal);
                } else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("flip")) {
                    releaseModal(e);
                } else if (e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("box")) {
                    // //Remove effect modal
                    e.target.innerHTML = "";
                    e.target.parentNode.style["display"] = "none";

                    // //display main modal
                    var newM = $$.ss(".vModal #newModal");

                    // // insert main form to new formCon and display
                    newM.innerHTML = mainFormCon;
                    newM.style["display"] = "block";
                    newM.style["height"] = computedModalHeight + "px";
                    newM.style["width"] = computedModalWidth + "px";
                    newM.childNodes[0].style["display"] = "block";
                    openProcessor();
                    fixModalWidth(mainModal);
                } else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("box")) {
                    releaseModal(e);
                }
            }
        }, false);
        window.addEventListener("resize", function() {
            if (modalOn == true) {
                fixModalWidth(mainModal);
            }
        });
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("vModal")) {
                self.close();
            }
            if (closeButtonClass != "") {
                if (e.target.classList.contains(closeButtonClass)) {
                    self.close();
                }
            }
            if (e.target.classList.contains(className)) {
                var formId = e.target.getAttribute(formIdAttribute);
                var form = document.getElementById(formId);
                if (form != null) {
                    modalWidths = e.target.getAttribute(modalWidthsAttribute).split(",");
                    show(form);
                }
            }
        }, false);
    }
    function fixModalWidth(mainModal){
        var sbpoint = new ScreenBreakPoint(brkpoints);
        if (sbpoint.screen.mode == "large") {
            mainModal.style["width"] = modalWidths[0];
        } else if (sbpoint.screen.mode == "medium") {
            mainModal.style["width"] = modalWidths[1];
        } else if (sbpoint.screen.mode == "small") {
            mainModal.style["width"] = modalWidths[2];
        }
    }
    function resetOldModalProperties(oldModal, currentModal) {
        oldModal.setAttribute("id", currentModal.id);
        oldModal.setAttribute("class", (currentModal.getAttribute("class")));
        oldModal.style["display"] = "none";
        oldModal.style["width"] = cssWidth;
        oldModal.innerHTML = mainFormConInner;
    }

    function createElements() {
        if ($$.ss("style[data-id='vModalStyles']") == null) {
            //Create
            var overlay = $$.ce("DIV");
            var effectsCon = $$.ce("DIV");

            //Set attributes
            overlay.classList.add("vModal", "xScroll");
            overlay.setAttribute("data-id", "vModalStyles");

            if (overlayBackgroundType == "color") {
                if (overlayBackground[0] != "") overlay["style"]["background-color"] = overlayBackground[0];
            }

            effectsCon.classList.add("modalSpace");

            //Append modal
            //modalSpace to overlay
            overlay.appendChild(effectsCon);

            //Modal to document
            document.body.appendChild(overlay);
        }
    };
    this.config = {};

    function show(modal) {
        if (initialized) {
            sY = scrollY;
            currentForm = modal;
            modal.id != null ? id = modal.id : null;
            computedModalHeight = getDimensionOfHidden(modal)["height"];
            computedModalWidth = getDimensionOfHidden(modal)["width"];
            cssWidth = $$.sm(modal).cssStyle("width");
            
            if (effectName == "split") {
                modal.style["width"] = computedModalWidth + "px";
            } else {
                modal.style["width"] = "100%";
            }
            //effect call
            effects[effectName](modal);
            if (overlayBackgroundType == "blur" && pageContainer != null) {
                pageContainer.classList.add("vxKit");
            }
        } else {
            throw new Error("Please initialize using the 'initialize()' method, before triggering modal");
        }
    };
    this.close = function() {
        if (modalOn == true) {
            var modalParent = $$.ss(".vModal");
            var OldModal = $$.ss("#vOld");
            var currentModal = modalParent.querySelector("#newModal").childNodes[0];
            currentForm = null;
            id = null;
            closeEffect[effectName](OldModal, currentModal);
        }
    };
    this.initialize = function() {
        if (initialized == false) {
            totalHeight = $$.ss("html").scrollHeight;
            if (className == "") throw new Error("Set up incomplete: No class name specified for modal, specify using 'config.className'");
            if (formIdAttribute == "") throw new Error("Set up incomplete: No formId attribute specified for modal, specify using 'config.formIdAttribute'");
            createElements();
            addEventhandler();
            initialized = true;
        }
    }
    Object.defineProperties(this, {
        config: { writable: false },
        show: { writable: false },
        close: { writable: false },
        initialize: { writable: false },
        thisForm: {
            get: function() {
                if (modalOn == true) {
                    return {
                        element: currentForm,
                        id: id
                    };
                } else {
                    return null;
                }
            }
        }
    });
    Object.defineProperties(this.config, {
        effect: {
            set: function(value) {
                validateObjectMember(effects, value, "Invalid effect type specified for the 'effect' property")
                effectName = value;
            }
        },
        overlayBackgroundType: {
            set: function(value) {
                if (matchString(value, ["color", "blur"], "Invalid overlay type specified for the 'overlayBackgroundType' property, it should be one of the followings: 'color' or 'blur'")) {
                    overlayBackgroundType = value;
                }
            }
        },
        overlayBackground: {
            set: function(value) {
                var temp = "'config.overlayBackground' property value must be an array";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + " of 2 Elements");
                validateArrayMembers(value, "string", temp + " of strings");

                function msg(n) {
                    return "'overlayBackground' property array value member " + n + " must be a string";
                }
                if (!validateString(value[0])) throw new Error(msg(1));
                if (!validateString(value[1])) throw new Error(msg(2));
                overlayBackground[0] = value[0];
                overlayBackground[1] = value[1];
            }
        },
        openProcessor: {
            set: function(value) {
                validateFunction(value, "A function need as 'openProcessor' property value");
                openProcessor = value;
            }
        },
        closeProcessor: {
            set: function(value) {
                validateFunction(value, "A function need as 'closeProcessor' property value");
                closeProcessor = value;
            }
        },
        modalWidthsAttribute: {
            set: function(value) {
                validateString(value, "'modalWidthsAttribute' property expects a string as value");
                modalWidthsAttribute = value;
            }
        },
        screenBreakPoints: { // Needed only for active browser resiszing
            set: function(value) {
                var temp = "'config.screenBreakPoints' property value must be an array";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + " of 2 Elements");
                validateArrayMembers(value, "number", temp + " of numbers");

                function msg(n) {
                    return "'screenBreakPoints' property array value member " + n + " must be an integer";
                }
                if (!validateInteger(value[0])) throw new Error(msg(1));
                if (!validateInteger(value[1])) throw new Error(msg(2));
                brkpoints["largeStart"] = value[0];
                brkpoints["mediumStart"] = value[1];
            }
        },
        pageContainer: {
            set: function(value) {
                validateElement(value, "'pageContainer' property expects a valid HTML element");
                pageContainer = value;
            }
        },
        className: {
            set: function(value) {
                validateString(value, "'className' property expects a string as value");
                className = value;
            }
        },
        formIdAttribute: {
            set: function(value) {
                validateString(value, "'formIdAttribute' property expects a string as value");
                formIdAttribute = value;
            }
        },
        closeButtonClass: {
            set: function(value) {
                validateString(value, "'closeButtonClass' property expects a string as value");
                closeButtonClass = value;
            }
        }
    });
}
/****************************************************************/