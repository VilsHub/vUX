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

/***************************TimeLine List*****************************/
var timeLineCount = 0; //numbers each instance so its per-list classes and stylesheet never collide with another's

export function TimeLineList(){
    var className ="", destroyed = false, built = false;
    var instanceId = ++timeLineCount;
    var listCount = 0;         //only ever grows, so a list activated by refresh() never reuses an earlier list's class
    var activatedLists = [];   //every <ul> this instance marked, so destroy() can unmark them again
    var styleEle = null;       //this instance's generated stylesheet, held so refresh() can extend it and destroy() remove it
    var dataAttributes = {
        timeLineBorderStyleAttrib:"",
        listStyleAttrib:"",
        listIconStyleAttrib:"",
        timeLineLabelAttrib:"",
        smallViewAttrib:""
    }
    this.autoBuild = function(){
        if (destroyed) throw new Error("This TimeLineList has been destroyed, create a new instance instead of rebuilding");
        if(className == "")throw new Error("Setup incomplete: TimeLineList class name must be supplied, specify using the 'config.className' property");
        if(!built){
            addVitalStyles();
            //Bound as a named listener rather than an anonymous one so that destroy() can detach it.
            addEventListener("resize", wrapList, false);
            built = true;
        }
        //Lists already activated (by this or another instance) are skipped, so calling autoBuild()
        //again only picks up lists added since, the same as refresh().
        buildLists($$.sa(listSelector()));
    }

    this.destroy = function(){
        //Removes the window resize listener and the generated stylesheet, then strips the marker
        //classes from every list this instance activated, so a rebuilt page starts from clean markup.
        if (destroyed) return;

        removeEventListener("resize", wrapList, false);

        if (styleEle != null) styleEle.remove();
        styleEle = null;

        for (var x = 0; x < activatedLists.length; x++){
            var entry = activatedLists[x];
            entry.ul.classList.remove("vtimeLine", entry.uniqueClass, "activated", "wrap");
        }
        activatedLists = [];

        destroyed = true;
    }

    this.config = {}

    this.refresh = function(parent = null){
        if (destroyed) throw new Error("This TimeLineList has been destroyed, create a new instance instead of refreshing");
        if (!built) throw new Error("TimeLineListObj.refresh() called before autoBuild(); call autoBuild() first");
        var allUls;
        if(parent != null){
            validateElement(parent, "TimeLineListObj.refresh() method expects a valid DOM element as argument 1");
            allUls = parent.querySelectorAll(listSelector());
        }else{
            allUls = $$.sa(listSelector());
        }
        buildLists(allUls);
    }

    function listSelector(){
        return "." + CSS.escape(className) + ":not(.activated)";
    }

    async function addVitalStyles() {
        try {
            var path = await processAssetPath();
            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/timeLineList.css", "timeLineList");
            }else{
                throw new Error(path)
            }
        } catch (error) {
            console.error(error)
        }
    }

    function wrapList(){
        //Only this instance's lists, and only when a small-view attribute is configured: building a
        //'[attribute]' selector from an empty name threw a SyntaxError on every build and resize.
        if (dataAttributes.smallViewAttrib == "") return;
        for (var x = 0; x < activatedLists.length; x++){
            var ul = activatedLists[x].ul;
            var wrapViewPort = parseFloat(ul.getAttribute(dataAttributes.smallViewAttrib));
            if(!isNaN(wrapViewPort) && innerWidth <= wrapViewPort){
                ul.classList.add("wrap");
            }else{
                ul.classList.remove("wrap");
            }
        }
    }

    function buildLists(lists){
        var css = "";
        for (var x = 0; x < lists.length; x++){
            css += listStyles(lists[x], activateList(lists[x]));
        }
        if (css != ""){
            if (styleEle == null){
                attachStyleSheet("v" + className + "-" + instanceId, css);
                styleEle = document.head.lastElementChild;
            }else{
                styleEle.appendChild(document.createTextNode(css));
            }
        }
        wrapList();
    }

    function listStyles(ul, uniqueClass){
        //Two classes: enough to outrank timeLineList.css's defaults (one class), which is linked
        //after this sheet and would otherwise win the ties, yet below its wrap rules (three
        //classes), so the stacked layout still repositions a list that styles its own labels.
        var scope = ".vtimeLine." + uniqueClass;
        var rules = [
            ["timeLineBorderStyleAttrib", ""],
            ["listStyleAttrib", " li"],
            ["listIconStyleAttrib", " li::before"],
            ["timeLineLabelAttrib", " li::after"]
        ];
        var css = "";
        rules.forEach(function(rule){
            var attrib = dataAttributes[rule[0]];
            if (attrib == "") return;               //not configured
            var value = ul.getAttribute(attrib);
            if (value == null || value.trim() == "") return;   //this list does not carry it
            css += scope + rule[1] + "{" + value + "}";
        });
        return css;
    }

    function activateList(ul){
        var uniqueClass = "vtl" + instanceId + "-" + (listCount++);
        ul.classList.add("vtimeLine", uniqueClass, "activated");
        activatedLists.push({ul:ul, uniqueClass:uniqueClass});
        return uniqueClass;
    }

    Object.defineProperties(this.config, {
        className: {
            set: function(value) {
                validateString(value, "'config.className' property value must be a string");
                if (!/^[^\s.]+$/.test(value)) throw new Error("'config.className' property value must be a single class name, without spaces or a leading '.'");
                className = value;
            }
        },
        dataAttributes: {
            set: function(value) {
                var validOptions = ["timeLineBorderStyle", "listStyle", "listIconStyle", "smallView", "timeLineLabel"];
                validateObjectLiteral(value, "'config.dataAttributes' property value must be an object");
                var entries = Object.entries(value);
                if(entries.length > validOptions.length) throw new Error("'config.dataAttributes' object value contains more than " + validOptions.length + " entries");
                entries.forEach(function(entry){
                    if(validOptions.indexOf(entry[0]) == -1) throw new Error("The data attribute specifier '" + entry[0] + "' is not supported, the supported specifiers are: "+ validOptions.join(", "));
                    validateString(entry[1], "'config.dataAttributes." + entry[0] + "' value must be a string, the name of the attribute to read");
                });
                //Applied only once every entry has passed, so a bad entry leaves the earlier settings intact.
                entries.forEach(function(entry){
                    dataAttributes[entry[0]+"Attrib"] = entry[1];
                });
            }
        }
    })
    Object.defineProperties(this, {
        autoBuild: { writable: false },
        config: { writable: false },
        refresh: { writable: false },
        destroy: { writable: false }
    })
}

/**********************************************************************/
