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
 * **************Core**************
 */
// Import vUX core
import "./src/vUX-core-4.0.0-beta.js";

/**************************TypeWriter****************************/
export function AutoWriter() {
    var callBackDelay = 0, typingSpeed = [10, 20], cursorBlinkDelay = 300,
    cursorStyle = {style:"solid", width:"1px", color:"green"}, showCursor = false,
    timers = {write:null, blink:null, erase:null, directive:null},
    boxes = null, texts = null, boxIndex = 0, conE = null, currentText = "", cursorIndex = 0;

    // |    => line break
    // *n*  => backspace n times
    // ~n~  => delay typing for n miliseconds

    function speed(){
        return $$.randomInteger(typingSpeed[0], typingSpeed[1]);
    }
    function clearMemory(){
        clearTimeout(timers.write);
        clearInterval(timers.blink);
        clearInterval(timers.erase);
        clearInterval(timers.directive);
        timers.write = timers.blink = timers.erase = timers.directive = null;
    }
    function runCallBack(fn){
        // 'fn' is optional throughout the public API, and a null timer handler is not a no-op:
        // browsers coerce it to the string "null" and evaluate it (blocked under CSP), Node throws.
        if (fn != null) setTimeout(fn, callBackDelay);
    }
    // Reads a '*n*' or '~n~' directive opened at 'startPoint'. Bounded by the string length so a
    // malformed directive raises a descriptive error instead of scanning past the end for ever.
    function readDirective(text, startPoint, delimiter, msg){
        var int = "", point = startPoint + 1;
        while (point < text.length && text[point] != delimiter){
            int += text[point];
            point++;
        }
        if (point >= text.length){
            throw new Error(msg + " : unterminated '" + delimiter + "' directive at index " + startPoint + ", it must be closed as '" + delimiter + "n" + delimiter + "'");
        }
        if (!/^[0-9]+$/.test(int)){
            throw new Error(msg + " : the '" + delimiter + "' directive at index " + startPoint + " must enclose digits only, as in '" + delimiter + "250" + delimiter + "'");
        }
        return {
                value:parseInt(int, 10),
                length:int.length
        };
    }
    // Directives are verified up front so writeText() throws to its caller, in keeping with the
    // rest of the library, rather than failing asynchronously inside a timer.
    function validateDirectives(text, msg){
        var point = 0;
        while (point < text.length){
            var char = text[point];
            if (char == "*" || char == "~"){
                point += readDirective(text, point, char, msg).length + 2;
            }else{
                point++;
            }
        }
    }
    function cursorNode(){
        return conE == null? null: conE.nextElementSibling;
    }
    function pauseWriting(){
        var blinker = cursorNode();
        if (!showCursor || blinker == null) return;
        clearInterval(timers.blink);
        timers.blink = setInterval(function(){
            blinker.classList.toggle("hide");
        }, cursorBlinkDelay);
    }
    function resumeWriting(){
        var blinker = cursorNode();
        clearInterval(timers.blink);
        timers.blink = null;
        if (blinker != null) blinker.classList.remove("hide");
    }
    function doneWriting(){
        var blinker = cursorNode();
        clearInterval(timers.blink);
        timers.blink = null;
        if (blinker != null) blinker.classList.add("hide");
    }
    // Appends one visible unit. Nodes are appended rather than concatenated onto innerHTML so that
    // a line break stays a single erasable node and the surrounding markup is never re-parsed.
    function writeUnit(char){
        if (char == "|"){
            conE.appendChild($$.ce("br"));
            return;
        }
        var last = conE.lastChild;
        if (last != null && last.nodeType == 3){ //text node
            last.data += char;
        }else{
            conE.appendChild(document.createTextNode(char));
        }
    }
    // Removes the last visible unit: one character of text, or one childless element such as <br>.
    // Operating on nodes keeps tags intact, unlike popping characters off innerHTML.
    function eraseUnit(root){
        var node = root.lastChild;
        while (node != null){
            if (node.nodeType == 1 && node.lastChild != null){ //descend into a populated element
                node = node.lastChild;
                continue;
            }
            if (node.nodeType == 3 && node.data.length > 0){
                node.data = node.data.slice(0, -1);
                if (node.data.length == 0) node.parentNode.removeChild(node);
                return true;
            }
            if (node.nodeType == 1){ //childless element, e.g. <br>
                node.parentNode.removeChild(node);
                return true;
            }
            node.parentNode.removeChild(node); //empty text node, carries no unit
            node = root.lastChild;
        }
        return false;
    }
    function erase(n, root, slot, fn){
        var erased = 0;
        clearInterval(timers[slot]);
        timers[slot] = null;
        if (n <= 0){
            if (fn != null) fn();
            return;
        }
        timers[slot] = setInterval(function (){
            eraseUnit(root);
            erased++;
            if (erased >= n){ //deletion completed
                clearInterval(timers[slot]);
                timers[slot] = null;
                if (fn != null) fn();
            }
        }, speed());
    }
    function addSpan(con){
        var spanE = con.querySelector(".vAutoWriter");
        if(spanE == null){
            spanE = $$.ce("span", {class:"vAutoWriter"});
            con.appendChild(spanE);
        }
        while (spanE.lastChild != null) spanE.removeChild(spanE.lastChild); //each run starts clean
        var blinker = spanE.nextElementSibling;
        if(showCursor){
            if (blinker == null){
                blinker = $$.ce("span", {class:"vAutoWriterBlinker"});
                con.appendChild(blinker);
            }
            blinker.setAttribute("style", "border-left:"+cursorStyle.style+" "+cursorStyle.width+" "+ cursorStyle.color);
            blinker.classList.remove("hide");
        }else if (blinker != null){
            blinker.parentNode.removeChild(blinker);
        }
    }
    function isElementCollection(value){
        if (value == null || typeof value.length != "number" || value.length == 0) return false;
        if (validateElement(value, "bool")) return false;
        for (var x = 0; x < value.length; x++){
            if (!validateElement(value[x], "bool")) return false;
        }
        return true;
    }
    function writeType(con, text){
        if(validateElement(con, "bool")){
            validateString(text, "writeTextObj.writeText(.x.) method argument 2 must be a String, if argument 1 is HTML Element");
            return "single";
        }else if(isElementCollection(con)){
            var temp = "writeTextObj.writeText(.x.) method argument 2 must be an array of Strings, if argument 1 is HTML Object";
            validateArray(text, temp);
            validateArrayMembers(text, "string", temp);
            validateArrayLength(text, con.length, temp + " holding one String per element (" + con.length + ")");
            return "multiple";
        }else{
            throw new TypeError("writeTextObj.writeText(x..) method argument 1 must be either HTMLObject or HTML Element");
        }
    }
    async function setStyleSheet() {
        //link module css sheet
        try {
            var path = await processAssetPath();

            if (!(path instanceof Error)){
                vModel.core.functions.linkStyleSheet(path+"css/autoWriter.css", "autoWriter");
            }else{
                throw new Error(path)
            }
           
        } catch (error) {
            console.error(error)
        }
    }
    function startBox(){
        addSpan(boxes[boxIndex]);
        conE = boxes[boxIndex].querySelector(".vAutoWriter");
        currentText = texts[boxIndex];
        cursorIndex = 0;
    }
    function endBox(fn){
        doneWriting();
        boxIndex++;
        if (boxIndex < boxes.length){ //group: move on to the next element
            startBox();
            step(fn);
        }else{
            reset();
            runCallBack(fn);
        }
    }
    function reset(){
        clearMemory();
        boxes = null;
        texts = null;
        boxIndex = 0;
        conE = null;
        currentText = "";
        cursorIndex = 0;
    }
    // Types one unit per tick. Every branch returns through step() so the end of the string is
    // re-tested before the next read, and a directive can never run off the end of the text.
    function step(fn){
        timers.write = setTimeout(function() {
            if (cursorIndex >= currentText.length){
                endBox(fn);
                return;
            }

            var char = currentText[cursorIndex];

            if(char == "*"){ //erase
                var deleteDetails = readDirective(currentText, cursorIndex, "*", "writeTextObj.writeText(.x.)");
                cursorIndex += deleteDetails.length + 2;
                //resume only once the erasing has finished, otherwise the two race over the same node
                erase(deleteDetails.value, conE, "directive", function (){
                    step(fn);
                });
            }else if(char == "~"){ //Delay
                var delayDetails = readDirective(currentText, cursorIndex, "~", "writeTextObj.writeText(.x.)");
                cursorIndex += delayDetails.length + 2;

                pauseWriting();

                timers.write = setTimeout(function (){
                    resumeWriting();
                    step(fn);
                }, delayDetails.value);
            }else{ //write, '|' included
                writeUnit(char);
                cursorIndex++;
                step(fn);
            }
        }, speed());
    }
    this.writeText = function(textBox, text, fn=null) {

        var type = writeType(textBox, text);
        if (fn != null) validateFunction(fn, "writeTextObj.writeText(..x) method argument 3 must be a function");

        boxes = type == "single"? [textBox]: Array.prototype.slice.call(textBox);
        texts = type == "single"? [text]: text.slice();
        texts.forEach(function (entry){
            validateDirectives(entry, "writeTextObj.writeText(.x.) method argument 2");
        });

        clearMemory();
        boxIndex = 0;
        setStyleSheet();
        startBox();
        step(fn);
    }
    this.deleteText = function(n, textBox, fn=null) {

        var temp = "writeTextObj.deleteText(x..) method argument 1 must be an integer";
        validateNumber(n, temp);
        if (!validateInteger(n)) throw new TypeError(temp); //validateInteger() reports, it does not throw
        if (n < 0) throw new Error(temp + " that is not negative");
        validateElement(textBox, "writeTextObj.deleteText(.x.) method argument 2 must be a valid HTML element");
        if (fn != null) validateFunction(fn, "writeTextObj.deleteText(..x) method argument 3 must be a function");

        //writeText() types into a '.vAutoWriter' span inside the target, so erase from that span
        //when it is there: the caller names the same element for both methods, and the trailing
        //node of the target itself is the blinker, not text.
        var written = textBox.querySelector(".vAutoWriter");

        erase(n, written == null? textBox: written, "erase", function (){
            runCallBack(fn);
        });

    }
    this.stop = function() {
        reset();
    }
    this.config = {}
    Object.defineProperties(this.config, {
        callBackDelay: {
            set: function(value) {
                validateNumber(value, "writeTextObj.config.callBackDelay property value must be a number");
                value = value < 0? 0: value;
                callBackDelay = value
            }
        },
        typingSpeed: {
            set: function(value) {
                var temp = "writeText.config.speed property value must be an array ";
                validateArray(value, temp);
                validateArrayLength(value, 2, temp + "of 2 Elements");
                validateArrayMembers(value, "number", temp + "of numeric elements");
                if (value[0] > 0 && value[1] > 0) {
                    typingSpeed = value;
                } else {
                    throw new Error("Array members for 'speed' property value must all be positive integers");
                }
            }
        },
        cursorStyle:{
            set: function(value) {
                var temp = "writeText.config.cursorStyle property value must be an object ";
                validateObjectLiteral(value, temp);
                validateObjectMembers(value, {style:1,width:1,color:1});
                //merged over the current value so a partial object does not blank the other members
                var merged = {style:cursorStyle.style, width:cursorStyle.width, color:cursorStyle.color};
                Object.keys(value).forEach(function (key){
                    validateString(value[key], temp + "whose '" + key + "' member is a string");
                    merged[key] = value[key];
                });
                cursorStyle = merged;
            }
        },
        showCursor:{
            set: function(value) {
                validateBoolean(value, "writeText.config.showCursor property value must be a boolean ");
                showCursor = value;
            }
        },
        cursorBlinkDelay:{
            set: function(value) {
                validateNumber(value, "writeTextObj.config.cursorBlinkSpeed property value must be a number");
                value = value < 0? 0: value;
                cursorBlinkDelay = value
            }
        }
    })
    Object.defineProperties(this, {
        writeText: { writable: false },
        config: { writable: false },
        deleteText: { writable: false },
        stop: { writable: false }
    })
}
/****************************************************************/
