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


/**************************TypeWriter****************************/
function AutoWriter() {
    var PlainTextCounter = 0, mainTextBox ,mainTexts, self = this, n, callBackDelay = 0, typingSpeed = [10, 20],
    ints = [], blinkCursor, dEraser=0, conE="", type = "single", cursorBlinkDelay = 300, init=false, familyN = 0, cursorStyle={style:"solid", width:"1px", color:"green"}, showCursor=false, family=0, currentText="";

    // |    => line break
    // *n*  => backspace n times
    // ~n~  => delay typing for n miliseconds

    function getDuration(startPoint, text){
        startPoint++;
        var int = "";
        while(text[startPoint] != "~"){
            int += text[startPoint];
            startPoint++;
        }
        return parseInt(int);
    }
    function pauseWriting(con){
        if(showCursor){
            blinkCursor = setInterval(function(){
                con.nextElementSibling.classList.toggle("hide");
            }, cursorBlinkDelay);
        }
    }
    function doneWriting(con){
        if(showCursor) con.nextElementSibling.classList.add("hide");
    }
    function resumeWriting(con){
        if(showCursor) clearInterval(blinkCursor);
        con.nextElementSibling.classList.remove("hide");
    }
    function getDeletedDetails(startPoint, text){
        startPoint++;
        var int = "";
        while(text[startPoint] != "*"){
            int += text[startPoint];
            startPoint++;
        }
        return {
                value:parseInt(int),
                length:parseInt(int.length)
        };
    }
    function write(con, text, char, fn){
        if (dEraser != 0) clearTimeout(dEraser);
        con.innerHTML += char;
        if (text.length > 0){
            self.writeText(con, text, fn);
            PlainTextCounter++;
        }
    }
    function erase(n, con){
        var p_Delted = "", delay ;
        for (var x = 0; x < n; x++) {
            delay = $$.randomInteger(typingSpeed[0], typingSpeed[1]);
            $$.delay(delay, function(){
                var deleted = Array.from(con.innerHTML);
                deleted.pop();
                p_Delted = deleted.join("");
                con.innerHTML = p_Delted;
            })
        }
        return delay * n;
    }
    function addSpan(con){
        var spanE = $$.ce("span", {class:"vAutoWriter"});
        var blinker = $$.ce("span", {class:"vAutoWriterBlinker", style:"border-left:"+cursorStyle.style+" "+cursorStyle.width+" "+ cursorStyle.color});
        con.appendChild(spanE);
        if(showCursor) con.appendChild(blinker);
    }
    function writeType(con, text){
        if(Object.getPrototypeOf(con).constructor.name == "NodeList"){
            validateArray(text, "writeTextObj.writeText(.x.) method argument 2 must be an array of Strings, if argument 1 is HTML Object");
            return "multiple";
        }else{
            validateElement(con, "writeTextObj.writeText(x..) method argument 1 must be either HTMLObject or HTML Element");
            validateString(text, "writeTextObj.writeText(.x.) method argument 2 must be a String, if argument 1 is HTML Element");
            return "single";
        }
    }
    function clearMemory(){
        var total = ints.length;
        for (var x=0; x<= total; x++){
            clearTimeout(x)
        }
    }
    this.writeText = function(textBox, text, fn=null) {
        if(!init){
            mainTextBox = textBox;
            mainTexts = text;
            type = writeType(textBox, text);
            family = textBox.length;
            init = true;
        }

        if (fn != null) validateFunction(fn, "writeTextObj.writeText(..x) method argument 3 must be a function");

        if(type == "single"){
            if(conE == ""){
                addSpan(textBox);
                conE = textBox.querySelector(".vAutoWriter");
                currentText = text;
            }
        }else{// group
            if(conE == ""){
                addSpan(textBox[familyN]);
                currentText = text[familyN];
                conE = textBox[familyN].querySelector(".vAutoWriter")
                familyN++;
            }
        }
        
        n = $$.randomInteger(typingSpeed[0], typingSpeed[1]);
        
        if (PlainTextCounter < currentText.length - 1) {
            ints[ints.length] = setTimeout(function() {
                var char = currentText[PlainTextCounter];
                if(char == "|"){//line break
                    write(conE, currentText, "<br/>", fn);
                }else if(char == "*"){ //erase
                    var deleteDetails = getDeletedDetails(PlainTextCounter, currentText)
                    var dSpeed = erase(deleteDetails.value, conE);
                    PlainTextCounter = (PlainTextCounter) + deleteDetails.value;
                    char = currentText[PlainTextCounter];
                    dEraser = setTimeout(function(){
                        write(conE, currentText, char, fn)
                    }, dSpeed);
                }else if(char == "~"){//Delay
                    pauseWriting(conE);
                    var delayDuration = getDuration(PlainTextCounter, currentText);
                    if(true){
                        $$.delay(delayDuration, function(){
                            resumeWriting(conE);
                            PlainTextCounter = (PlainTextCounter) + (delayDuration.toString().length + 2);
                            char = currentText[PlainTextCounter];
                            write(conE, currentText, char, fn);
                        })
                    }
                }else{//write
                    write(conE, currentText, char, fn);
                }
            }, n);
        }else {
            PlainTextCounter = -1;
            doneWriting(conE);
            if(type == "single"){
                clearMemory();
                setTimeout(fn, callBackDelay);
            }else{
                if(familyN < family){
                    conE = "";
                    self.writeText(mainTextBox, mainTexts, fn);
                }else{
                    conE = "";
                    init = false;
                    familyN = 0;
                    clearMemory();
                    setTimeout(fn, callBackDelay);
                }
            }
        }
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
                cursorStyle = value;
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
        config: { writable: false }
    })
}
/****************************************************************/