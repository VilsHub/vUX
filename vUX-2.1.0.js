/*
 * vUX JavaScript library v2.1.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2020-01-2T22:30Z
 */

"use strict";
var assetURL="";
var styles = {};
window.addEventListener("load", function(){
	//set asset path
	var allScripts = document.getElementsByTagName("script");
	var temp = null;
	for(var x=0; x<	Object.values(allScripts).length; x++){
		if (allScripts[x].getAttribute("src").search("vUX") != -1){
			temp = allScripts[x].getAttribute("src");
			break;
		}
	}
	var splited = temp.split("/");
	splited.splice(1,1, "//");
	splited.splice(splited.length-1,1);
	for (var x=0; x<splited.length; x++){
		x<3?assetURL += splited[x]:assetURL += "/"+splited[x];
	}
	assetURL += "/assets/";

	//Load needed styles
	loadStyleSheet("css", "selectFormComponent.css");
	loadStyleSheet("css", "radioFormComponent.css");
	loadStyleSheet("css", "checkBoxFormComponent.css");
	loadStyleSheet("css", "formValidator.css");
	loadStyleSheet("css", "modalDisplayer.css");
	loadStyleSheet("css", "datePicker.css");
	loadStyleSheet("css", "toolTip.css");
	loadStyleSheet("css", "carousel.css");
	loadStyleSheet("css", "contentLoader.css");
	loadStyleSheet("css", "listScroller.css");
	loadStyleSheet("css", "touchHandler.css");
}, false);

/*************************Helper functions***********************/
function cssGroupStyler(elementObj, StyleObject){
	for(var x=0;x<elementObj.length;x++){
		for(var property in StyleObject){
			var cleanCSSProperty = camelToCSSstandard(property);
			elementObj[x].style[cleanCSSProperty] = StyleObject[property];
		}
	}
}
function camelToCSSstandard(cameledName){
	return cameledName.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
}
function percentageToAngle(percentage, start){
	var angle = (percentage/100)*(2*Math.PI);
	if(start == 12){
		return angle - (0.5*Math.PI);
	}else if(start == 3){
		return angle;
	}else{
		return angle;
	}
};
function getRandomInt(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
function validateNumber(number, msg=null){
	if (typeof number != "number"){
		if (msg != null){
			throw new TypeError(msg);
		}else{
			throw new TypeError("Please provide a real number");
		}
	}else{
		return true;
	}
};
function validateString(string, msg = null){
	if (typeof string != "string"){
		if (msg == null){
			throw new TypeError("Please provide a string");
		}else{
			throw new TypeError(msg);
		}
	}else{
		return true;
	}
};
function matchString(string, stringsArr, msg = null){
	if (stringsArr.indexOf(string) != -1){
		return true;
	}else {
		if(msg == null){
			throw new TypeError("Invalid string value specified");
		}else{
			throw new TypeError(msg);
		}
	}
}
function matchNumbers(number, NumbersArr, msg = null){
	if (NumbersArr.indexOf(number) != -1){
		return true;
	}else {
		if(msg == null){
			throw new TypeError("Invalid number value specified");
		}else{
			throw new TypeError(msg);
		}
	}
}
function validateArray(array, msg=null){
	if (!Array.isArray(array)){
		if (msg != null){
			throw new TypeError(msg);
		}else{
			throw new TypeError("Please provide an array");
		}
	}
};
function validateArrayLength(array, totalMember, msg=null){
	if(array.length != totalMember){
		if(msg != null){
			throw new Error(msg);
		}else{
			throw new Error("Incomplete member error: "+ totalMember +" member(s) needed");
		}
	}
}
function validateArrayMembers(array, type, msg=null){
	switch (type) {
   case "string":
	 	for(var x=0; x<array.length; x++){
			if(typeof array[x] != "string"){
				if(msg != null){
					throw new Error(msg);
				}
			}
		}
   	break;
   case "number":
 	 	for(var x=0; x<array.length; x++){
 			if(typeof array[x] != "number"){
 				if(msg != null){
 					throw new Error(msg);
 				}
 			}
 		}
    break;
	case "HTMLObject":
		for(var x=0; x<array.length; x++){
 			if(Object.getPrototypeOf(array[x]).constructor.name != "NodeList"){
 				if(msg != null){
 					throw new Error(msg);
 				}
 			}
 		}
		break;
	case "dimension":
		for(var x=0; x<array.length; x++){
 			if(validateDimension(array[x], "bool") == false){
 				if(msg != null){
					throw new Error(msg);
 				}
 			}
 		}
		break;
	case "HTMLElement":
		for(var x=0; x<array.length; x++){
 			if(validateElement(array[x], "bool") == false){
 				if(msg != null){
 					throw new Error(msg);
 				}
 			}
 		}
	}
}
function validateBoolean(boolean, msg=null){
	if (typeof boolean != "boolean"){
		if(msg != null){
			throw new TypeError(msg);
		}else{
			throw new TypeError("A boolean needed");
		}
	}else{
		return true;
	}
};
function validateObjectMember(object, propery, msg=null){
	if(object.hasOwnProperty(propery)){
		return true;
	}else{
		var ObjArr = Object.keys(object);
		var AllProperties =  ObjArr.toString();
		var rplc = AllProperties.replace(/,/g, ", ");
		if(msg!=null){
			throw new TypeError(msg+", it should be any of the follwings : " + rplc);
		}else{
			throw new TypeError("Invlaid property specified, it should be any of the follwings : " + rplc);
		}
	}
}
function validateElement (element,  msg = null){//A single element
	if (element instanceof Element){
		return true;
	}else{
		if(msg != null){
			if(msg == "bool"){
				return false;
			}else {
				throw new TypeError(msg);
			}
		}else{
			throw new TypeError("Invalid data type : HTML Element must be provide");
		}
	}
}
function validateFunction (fn, msg = null){
	if (typeof fn == "function"){
		return true;
	}else{
		if (msg == null){
			throw new TypeError("Invalid assigned data : Please provide a function");
		}else{
			throw new TypeError(msg);
		}

	}
}
function validateHTMLObject(HTMLCollection){ //Group of elements
	if(Object.getPrototypeOf(HTMLCollection).constructor.name == "NodeList"){
		return true;
	}else{
			throw new TypeError("Invalid HTML Collection : HTML collection must be provide");
	}
}
function validateObjectLiteral(object, msg=null){
	if (object.__proto__.isPrototypeOf(new Object()) == true){
		return true;
	}else {
		if(msg != null){
			throw new TypeError(msg);
		}else {
			throw new TypeError("Type error : literal object needed");
		}
	}
}
function validateObject(object, msg=null){
	if (typeof object == "object"){
		return true;
	}else {
		if(msg != null){
			throw new TypeError(msg);
		}
	}
}
function validateObjectMembers(object, ObjectBase){
		var ObjArr = Object.keys(object);
		for (var x = 0; x < ObjArr.length; x++){
			if(ObjectBase.hasOwnProperty(ObjArr[x])){

			}else {
					var ObjBArr = Object.keys(ObjectBase);
					var AllProperties =  ObjBArr.toString();
					var rplc = AllProperties.replace(/,/g, ", ");
					throw new TypeError("Invlaid property specified, it should be any of the follwing : " + rplc);
			}
		}
		return true;
}
function validateStringDigit(stringDigit){
	if(/0-9/.test(stringDigit)){
		return true;
	}else {
		return false;
	};
}
function validateDimension(dimension, msg=null){
	var matched = 0;
	var units = [/[0-9\.]+px/,/[0-9\.]+%/, /[0-9\.]+pt/, /[0-9\.]+px/,/[0-9\.]+vh/, /[0-9\.]+vw/, /[0-9\.]+rem/, /[0-9\.]+em/];
	for(var x =0; x<units.length; x++){
		if(units[x].test(dimension)){
			matched =1;
			break;
		}
	}
	if(matched == 1){
		return true;
	}else{
		if(msg == null){
			throw new Error("Unrecognized dimension specified");
		}else{
			if(msg == "bool"){
				return false;
			}else {
				throw new Error(msg);
			}
		}
	}

}
function extractDimensionValue(dimension, unit){
	var pattern = new RegExp(unit, "g") ;
	var extract = dimension.replace(pattern, "");
	return extract;
}
function getDimensionOfHidden(element){
	var height=0, prePos="", width=0;
	prePos = DOMelement.cssStyle(element, "position");
	element.style["position"] = "absolute";
	element.style["opacity"] = "0";
	element.style["display"] = "block";
	height = element.scrollHeight;
	width = element.scrollWidth;
	element.style["position"] = prePos;
	element.style["opacity"] = "1";
	element.style["display"] = "none";
	return {
		height:height,
		width:width
	};
};
function keyboardEventHanler(e){
	var handled = false, type=0;
	if (e.key !== undefined) {
		// Handle the event with KeyboardEvent.key and set handled true.
		var targetKeyPressed = e.key;
		handled = true;
		type=1;

	} else if (e.keyIdentifier !== undefined) {
		// Handle the event with KeyboardEvent.keyIdentifier and set handled true.
		var targetKeyPressed = e.keyIdentifier;
		handled = true;
		type=2;
	} else if (e.keyCode !== undefined) {
		// Handle the event with KeyboardEvent.keyCode and set handled true.
		var targetKeyPressed = e.keyCode;
		handled = true;
		type=3;
	}
	return {
		type:type,
		handled:handled,
	}
}
function sanitizeInteger(value){
	var stripped = value.replace(/[^0-9]+/g, "");
	return stripped;
}
function minMaxInt(value, min, max){
	if(value < max && value > min){
		return value;
	}else if(value >= max){
		return max;
	}else if(value <= min){
		return min;
	}
}
function getDayName(year, month, day){
	var date = year+"-"+month+"-"+day;
	var tempDate = new Date(date);
	var dayShortName = tempDate.toString().split(" ", 2)[0];
	var dayFullName = "";
	switch (dayShortName) {
   case "Sun":
     dayFullName = "Sunday";
   break;
   case "Mon":
     dayFullName = "Monday";
   break;
	 case "Tue":
     dayFullName = "Tuesday";
   break;
	 case "Wed":
     dayFullName = "Wednesday";
   break;
	 case "Thu":
     dayFullName = "Thursday";
   break;
	 case "Fri":
     dayFullName = "Friday";
   break;
	 case "Sat":
     dayFullName = "Saturday";
   break;
     // default expression
 	}

	return dayFullName;
}
function loadStyleSheet(type, name){
	var defaultURL = "http://library.vilshub.com/lib/vUX/assets/";
	var set = assetURL+type;
	var useSet = 1;
	function setStyleName(name, value){
		switch (name) {
			case "selectFormComponent.css":
				styles["selectFormComponent"] = value;
				break;
			case "radioFormComponent.css":
				styles["radioFormComponent"] = value;
				break;
			case "checkBoxFormComponent.css":
				styles["checkBoxFormComponent"] = value;
		}
	}
	function get(){
		var xhr = ajax.create();
		useSet==1?xhr.open("POST", set+"/"+name, true):xhr.open("POST", defaultURL+type+"/"+name, true);
		xhr.addEventListener("readystatechange", function(){
			if(xhr.readyState == 4 && xhr.status == 200 && useSet == 1){
				setStyleName(name, xhr.responseText);
			}else if (xhr.readyState == 4 && xhr.status != 200 && useSet == 1){
				useSet = 0;
				xhr.abort();
				get();
			}else if (xhr.readyState == 4 && xhr.status == 200 && useSet == 0) {
				setStyleName(name, xhr.responseText);
			}
		},false);
		xhr.send();
	}
	function setStyle(){
		var linkEle = document.createElement("link");
		linkEle.setAttribute("rel", "stylesheet");
		linkEle.setAttribute("type", "text/css");
		linkEle.setAttribute("href", set+"/"+name);
		document.head.appendChild(linkEle);
	}
	if(name.search("Form") != -1){
		get();
	}else {
		setStyle();
	}
}
function timeFraction(startTime, duration){
	//startTime and Duration in milliseconds
	var timeFragment = (Date.now() - startTime) / duration;
	if (timeFragment > 1) {
		timeFragment = 1;
	}
	return timeFragment;
}
function attachStyleSheet(dataID, css){
	var styleElement = document.createElement("style");
	styleElement.setAttribute("type", "text/css");
	styleElement.setAttribute("data-id", dataID);
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		styleElement.appendChild(document.createTextNode(css));
	}
	document.getElementsByTagName('head')[0].appendChild(styleElement);
}
/****************************************************************/

/*****************************Timing*****************************/
var timing = {
	//Linear easing
	linear				: function(timeFrac){
		//startTime and Duration in milliseconds
		var progress = timeFrac;
		return progress;
	},
	//Bow shooting easing
	bowShootingEaseIn	: function(timeFrac){
		//startTime and Duration in milliseconds
		var x = 1.5 //alterable
		var progress = Math.pow(timeFrac, 2) * ((x + 1) * timeFrac - x);
		return progress;
	},
	bowShootingEaseOut	: function(timeFrac){
		//startTime and Duration in milliseconds
		var x = 1.5 //alterable
		var progress = 1- (Math.pow(1-timeFrac, 2) * ((x + 1) * (1-timeFrac) - x));
		return progress;
	},
	//Bounce
	bounceEaseIn		: function(timeFrac){
		for (var a = 0, b = 1; 1; a += b, b /= 2) {
			if (timeFrac >= (7 - 4 * a) / 11) {
			  return -Math.pow((11 - 6 * a - 11 * timeFrac) / 4, 2) + Math.pow(b, 2);
			}
		}
	},
	bounceEaseOut 		: function(timeFrac){
		for (var a = 0, b = 1; 1; a += b, b /= 2) {
			if (1-timeFrac >= (7 - 4 * a) / 11) {
			  return 1- (-Math.pow((11 - 6 * a - 11 * (1-timeFrac)) / 4, 2) + Math.pow(b, 2));
			}
		}
	},
	//swing
	swingEaseIn 		: function (timeFrac){
		return 1 - Math.sin(Math.acos(timeFrac));
	},
	swingEaseOut 		: function (timeFrac){
		return 1 - (1 - Math.sin(Math.acos(1-timeFrac)));
	}
}
/****************************************************************/

/*****************************Cross XHR creator******************/
function ajax(){
}
ajax.create = function () {
	if (window.XMLHttpRequest) {
		// code for modern browsers
		var xmlhttp = new XMLHttpRequest();
		return xmlhttp;
	 } else {
		// code for old IE browsers
		var xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		return xmlhttp;
	}
}
/****************************************************************/

/*********************imageManipulator***************************/
function imageManipulator(canvasElement, image){
	var self = this, initRGB = [], maxGray = [], maxGrayControl = [], maximumLoop = 0, highestDifference =0, currentLoop = 0, initGray = [], maxRGB = [], maxRGBControl = [], speed = 0, diff=0, imageData, width=300, height=300;
	if (validateElement(canvasElement, "imageManipulator() constructor argument 1 must be a valid HTML element")){
		if(canvasElement.nodeName != "CANVAS"){
			throw new Error("imageManipulator() constructor argument 1 must be a valid HTML Canvas element");
		}
	}
	validateString(image, "imageManipulator() constructor argument 2 must be string of image URL");
	var canvasObj = canvasElement.getContext('2d'); //initialization
	function extractImageData(type){
		if (type == "rtg"){ //rgb to gray
			for (var x=0;x<imageData.data.length; x+=4) {
				var btwn =  (0.2*imageData.data[x] + 0.72*imageData.data[x+1] + 0.07*imageData.data[x+2]);

				initRGB[x] = imageData.data[x];
				initRGB[x+1] = imageData.data[x+1];
				initRGB[x+2] = imageData.data[x+2];


				maxGray[x] = btwn;	//Can't exceed this value for red
				maxGray[x+1] = btwn; //Can't exceed this value for blue
				maxGray[x+2] = btwn; //Can't exceed this value for green


				if(initRGB[x] > maxGray[x]){
					maxGrayControl[x] = 1;
					diff = initRGB[x] - maxGray[x];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}else{
					maxGrayControl[x] = 0;
					diff = maxGray[x] - initRGB[x];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}
				if(initRGB[x+1] > maxGray[x+1]){
					maxGrayControl[x+1] = 1;
					diff = initRGB[x+1] - maxGray[x+1];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}else{
					maxGrayControl[x+1] = 0;
					diff = maxGray[x+1] - initRGB[x+1];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}
				if(initRGB[x+2] > maxGray[x+2]){
					maxGrayControl[x+2] =1;
					diff = initRGB[x+2] - maxGray[x+2];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}else{
					maxGrayControl[x+2] = 0;
					diff = maxGray[x+2] - initRGB[x+2];
					if(diff>highestDifference){
						highestDifference = Math.round(diff);
					}
				}
			}
			maximumLoop = Math.ceil(highestDifference/speed);
		}else if(type == "gtr"){// gray to rgb
			//set max rgb
			for (var x=0;x<imageData.data.length; x+=4) {
				maxRGB[x] = imageData.data[x];
				maxRGB[x+1] = imageData.data[x+1];
				maxRGB[x+2] = imageData.data[x+2];
			}

			//convert to gray
			for (var x=0;x<imageData.data.length; x+=4) {
				btwn =  (0.2*imageData.data[x] + 0.72*imageData.data[x+1] + 0.07*imageData.data[x+2]);
				imageData.data[x] = btwn;
				imageData.data[x+1] = btwn;
				imageData.data[x+2] = btwn;

				//set initial gray values
				initGray[x] = imageData.data[x];
				initGray[x+1] = imageData.data[x+1];
				initGray[x+2] = imageData.data[x+2];

				if(initGray[x] > maxRGB[x]){
					maxRGBControl[x] = 1;
					diff = initGray[x] - maxRGB[x];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}else{
					maxRGBControl[x] = 0;
					diff = maxRGB[x] - initGray[x];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}
				if(initGray[x+1] > maxRGB[x+1]){
					maxRGBControl[x+1] = 1;
					diff = initGray[x+1] - maxRGB[x+1];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}else{
					maxRGBControl[x+1] = 0;
					diff = maxRGB[x+1] - initGray[x+1];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}
				if(initGray[x+2] > maxRGB[x+2]){
					maxRGBControl[x+2] =1;
					diff = initGray[x+2] - maxRGB[x+2];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}else{
					maxRGBControl[x+2] = 0;
					diff = maxRGB[x+2] - initGray[x+2];
					if(diff>highestDifference){
						highestDifference = diff;
					}
				}
			}
			maximumLoop = Math.ceil(highestDifference/speed);

			//Write image data
			canvasObj.putImageData(imageData, 0, 0);
		}
	}

	/****************************RGB to Gray************************/
	this.initializeRgbToGray = function (Speed){
		validateNumber(Speed);
		var  img = new Image(); //Image object created
		width = canvasElement.scrollWidth;
		height = canvasElement.scrollHeight;
		img.src = image;
		img.onload = function(){
			canvasObj.drawImage(img, 0, 0);
			imageData = canvasObj.getImageData(0, 0, width, height);
			speed = Speed;
			extractImageData("rtg");
		}

	};
	this.rgbToGray = function(){
		for (var x=0;x<imageData.data.length; x+=4){

			//Red component
			if(maxGrayControl[x] == 1){
				if(initRGB[x] > maxGray[x]){
					((initRGB[x] - speed) < maxGray[x])? initRGB[x] = maxGray[x]: initRGB[x] = initRGB[x] - speed ;
				}else if(initRGB[x] <= maxGray[x]){
					initRGB[x] = maxGray[x];
				}
			}else if(maxGrayControl[x] == 0){
				if(initRGB[x] < maxGray[x]){
					((initRGB[x] + speed) > maxGray[x])? initRGB[x] = maxGray[x]: initRGB[x] = initRGB[x] + speed ;
				}else if(initRGB[x] >= maxGray[x]){
					initRGB[x] = maxGray[x];
				}
			}

			//Green component
			if(maxGrayControl[x+1] == 1){
				if(initRGB[x+1] > maxGray[x+1]){
					((initRGB[x+1] - speed) < maxGray[x+1])? initRGB[x+1] = maxGray[x+1]: initRGB[x+1] = initRGB[x+1] - speed ;
				}else if(initRGB[x+1] <= maxGray[x+1]){
					initRGB[x+1] = maxGray[x+1];
				}
			}else if(maxGrayControl[x+1] == 0){
				if(initRGB[x+1] < maxGray[x+1]){
					((initRGB[x+1] + speed) > maxGray[x+1])? initRGB[x+1] = maxGray[x+1]: initRGB[x+1] = initRGB[x+1] + speed ;
				}else if(initRGB[x+1] >= maxGray[x+1]){
					initRGB[x+1] = maxGray[x+1];
				}
			}

			//Blue component
			if(maxGrayControl[x+2] == 1){
				if(initRGB[x+2] > maxGray[x+2]){
					((initRGB[x+2] - speed) < maxGray[x+2])? initRGB[x+2] = maxGray[x+2]: initRGB[x+2] = initRGB[x+2] - speed ;
				}else if(initRGB[x+2] <= maxGray[x+2]){
					initRGB[x+2] = maxGray[x+2];
				}
			}else if(maxGrayControl[x+2] == 0){
				if(initRGB[x+2] < maxGray[x+2]){
					((initRGB[x+2] + speed) > maxGray[x+2])? initRGB[x+2] = maxGray[x+2]: initRGB[x+2] = initRGB[x+2] + speed ;
				}else if(initRGB[x+2] >= maxGray[x+2]){
					initRGB[x+2] = maxGray[x+2];
				}
			}

			//Set image data
			imageData.data[x] = initRGB[x];
			imageData.data[x+1] = initRGB[x+1];
			imageData.data[x+2] = initRGB[x+2];


		}
		//Write image data
		canvasObj.putImageData(imageData, 0, 0);
		currentLoop ++;
		var fade = requestAnimationFrame(function(){
			self.rgbToGray();
		});

		if(currentLoop == maximumLoop){
			cancelAnimationFrame(fade);
		}
	}
	/**************************************************************/

	/**************************Gray to RGB*************************/
	this.initializeGrayToRgb = function (Speed){
		validateNumber(Speed);
		var img = new Image(); //Image object created
		width = canvasElement.scrollWidth;
		height = canvasElement.scrollHeight;
		img.src = image;
		img.onload = function(){
			canvasObj.drawImage(img, 0, 0);
			imageData = canvasObj.getImageData(0, 0, width, height);
			speed = Speed;
			extractImageData("gtr");
		}
	};
	this.grayToRgb = function(){
		for (var x=0;x<imageData.data.length; x+=4){

			//Red component
			if(maxRGBControl[x] == 1){
				if(initGray[x] > maxRGB[x]){
					//initGray[x] -= speed;
					((initGray[x] - speed) < maxRGB[x])? initGray[x] = maxRGB[x]: initGray[x] = maxRGB[x] - speed ;
				}else if(initGray[x] <= maxRGB[x]){
					initGray[x] = maxRGB[x];
				}
			}else if(maxRGBControl[x] == 0){
				if(initGray[x] < maxRGB[x]){
					//initGray[x] += speed;
					((initGray[x] + speed) > maxRGB[x])? initGray[x] = maxRGB[x]: initGray[x] = initGray[x] + speed ;
				}else if(initGray[x] >= maxRGB[x]){
					initGray[x] = maxRGB[x];
				}
			}

			//Green component
			if(maxRGBControl[x+1] == 1){
				if(initGray[x+1] > maxRGB[x+1]){
					//initGray[x+1] -= speed;
					((initGray[x+1] - speed) < maxRGB[x+1])? initGray[x+1] = maxRGB[x+1]: initGray[x+1] = maxRGB[x+1] - speed ;
				}else if(initGray[x+1] <= maxRGB[x+1]){
					initGray[x+1] = maxRGB[x+1];
				}
			}else if(maxRGBControl[x+1] == 0){
				if(initGray[x+1] < maxRGB[x+1]){
					//initGray[x+1] += speed;
					((initGray[x+1] + speed) > maxRGB[x+1])? initGray[x+1] = maxRGB[x+1]: initGray[x+1] = initGray[x+1] + speed ;
				}else if(initGray[x+1] >= maxRGB[x+1]){
					initGray[x+1] = maxRGB[x+1];
				}
			}

			//Blue component
			if(maxRGBControl[x+2] == 1){
				if(initGray[x+2] > maxRGB[x+2]){
					//initGray[x+2] -= speed;
					((initGray[x+2] - speed) < maxRGB[x+2])? initGray[x+2] = maxRGB[x+2]: initGray[x+2] = maxRGB[x+2] - speed ;
				}else if(initGray[x+2] <= maxRGB[x+2]){
					initGray[x+2] = maxRGB[x+2];
				}
			}else if(maxRGBControl[x+2] == 0){
				if(initGray[x+2] < maxRGB[x+2]){
					//initGray[x+2] += speed;
					((initGray[x+2] + speed) > maxRGB[x+2])? initGray[x+2] = maxRGB[x+2]: initGray[x+2] = initGray[x+2] + speed ;
				}else if(initGray[x+2] >= maxRGB[x+2]){
					initGray[x+2] = maxRGB[x+2];
				}
			}

			//Set image data
			imageData.data[x] = initGray[x];
			imageData.data[x+1] = initGray[x+1];
			imageData.data[x+2] = initGray[x+2];

		}

		//Write image data
		canvasObj.putImageData(imageData, 0, 0);
		currentLoop ++;
		var fade = requestAnimationFrame(function(){
			self.grayToRgb();
		});

		//Check for completion
		if(currentLoop == maximumLoop){
			cancelAnimationFrame(fade);
		}
	}
	/***************************************************************/

	Object.defineProperties(this, {
		initializeRgbToGray:{writable:false},
		initializeGrayToRgb:{writable:false},
		rgbToGray:{writable:false},
		grayToRgb:{writable:false},
	})
}
/****************************************************************/

/***********************gridBorderRectangle**********************/
function gridBorderRectangle(){
	var self = this, seg = 0, tf = 0, FRlinecolor = "black", FRlinewidth = 5, FRsegment = [10,2], FROrigin = [0,0], ARlinecolor = "black", ARlinewidth = 5, ARsegment = [10,2], AROrigin = [0,0], ARclockWise	= true,
		ARduration = 3000, AReasing = "linear", ARactive="", ARstop=0, animationCount=1, cycle=0,fn=null;

	/*******************fixed dashed rectangle starts********************/
	this.fixedRectangle = {
		config:{
		},
		draw : function(canvasElement){
				validateElement (canvasElement, "A valid HTML element needed as argument for 'draw()' method");
				canvasElement.width = canvasElement.scrollWidth;
				canvasElement.height = canvasElement.scrollHeight;
				var canObj = canvasElement.getContext("2d");

				//Segment
				canObj.setLineDash(FRsegment);

				//lineColor
				canObj.strokeStyle = FRlinecolor;

				//lineWidth
				canObj.lineWidth = FRlinewidth;

				//origin
				var xOrigin = FROrigin[0];
				var yOrigin = FROrigin[1]
				canObj.clearRect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
				canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
				canObj.stroke();
			}
	};
	Object.defineProperties(this.fixedRectangle.config, {
			lineColor :{
				set: function(value){
					if(validateString(value)){
						FRlinecolor = value;
					}
				}
			},
			lineWidth :{
				set: function(value){
					if(validateNumber(value)){
						if(value > 0){
							FRlinewidth  = value;
						}else{
							FRlinewidth = 1;
						}
					}
				}
			},
			segment :{
				set: function(value){
					var temp = "fixedRectangle.config.segment property value must be an array ";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+"of 2 Elements");
					validateArrayMembers(value, "number", temp+"of numeric elements");
					if(value[0]>0 && value[1]>0){
						FRsegment = value;
					}else{
						throw new Error("Array members for 'segment' property value must all be positive integers");
					}
				}
			},
			origin :{
				set: function(value){
					var temp = "fixedRectangle.config.origin property value must be an array";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+"of 2 Elements");
					validateArrayMembers(value, "number", temp+"of numeric elements");
					FROrigin = value;
				}
			},
	});
	Object.defineProperties(this.fixedRectangle, {
		config:{writable:false},
		draw:{writable:false}
	})
	/*******************************************************************/

	/*******************animated dashed rectangle starts********************/
	this.animatedRectangle = {
		config:{},
		draw : function(canvasElement){
					validateElement (canvasElement, "A valid HTML element needed as argument for 'draw()' method");
					if(canvasElement.getAttribute("id") == null){
						throw new Error("Canvas element must have an ID set");
					}
					//Set ID
					ARactive = canvasElement.id;
					ARstop = 0;

					//Reset canvas size
					canvasElement.width = canvasElement.scrollWidth;
					canvasElement.height = canvasElement.scrollHeight;
					var canObj = canvasElement.getContext("2d");

					//Segment
					canObj.setLineDash(ARsegment);

					//lineColor
					canObj.strokeStyle = ARlinecolor;

					//lineWidth
					canObj.lineWidth = ARlinewidth;

					//origin
					var xOrigin = AROrigin[0];
					var yOrigin = AROrigin[1];

					//easing
					var easing = AReasing;

					//duration
					var duration = ARduration;

					//direction
					var direction = ARclockWise; //clockwise

					var animationStart = Date.now();
					requestAnimationFrame(function animate(){
						var tf = timeFraction (animationStart, duration);
						var progress = timing[easing](tf);

						if(direction == true){ //clockwise
							canObj.lineDashOffset = -1*(progress*100);
						}else{//anti clockwise
							canObj.lineDashOffset = progress*100;
						}
						canObj.clearRect(xOrigin,yOrigin, canvasElement.width, canvasElement.height);
						canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
						canObj.stroke();
						if(ARstop == 0 && ARactive == canvasElement.id && progress < 1 ){
							requestAnimationFrame(animate);
						}else if(progress == 1){
							fn!=null?fn():null;
							if(animationCount != "infinite"){
								cycle++;
								if(cycle < animationCount){
									self.animatedRectangle.draw(canvasElement);
								}else{
									cycle=0
								}
							}else{
								self.animatedRectangle.draw(canvasElement);
							}
						}
					})
				},
		stop :function(){
			ARstop = 1;
		}
	};
	Object.defineProperties(this.animatedRectangle.config, {
			lineColor :{
				set: function(value){
					validateString(value, "'config.lineColor' property value must be a string");
					ARlinecolor = value;
				}
			},
			lineWidth :{
				set: function(value){
					validateNumber(value);
					if(value > 0){
						ARlinewidth  = value;
					}else{
						ARlinewidth = 1;
					}
				}
			},
			iterationCount:{
				set:function(value){
					if(typeof value == "number" || typeof value == "string"){
						if(typeof value == "number"){
							var val = new formValidator();
							if(val.validate.integer(value)){
								if(value < 0){
									animationCount = 1;
								}else{
									animationCount = value;
									console.log(animationCount)
								}
							}else{
								throw new Error("'iterationCount' property numeric value must be an integer")
							}
						}else if (typeof value == "string") {
							if(value.toLowerCase() == "infinite"){
								animationCount = value.toLowerCase();
							}else{
								throw new Error("'iterationCount' property string value can only be 'infinite'");
							}
						}
					}else {
						throw new Error("'iterationCount' property value must be a numeric or a string of value 'infinite'")
					}
				}
			},
			segment :{
				set: function(value){
					var temp = "animatedRectangle.config.segment property value must be an array ";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+"of 2 Elements");
					validateArrayMembers(value, "number", temp+"of numeric elements");
					if(value[0]>0 && value[1]>0){
						ARsegment = value;
					}else{
						throw new Error("Array members for 'segment' property value must all be positive integers");
					}
				}
			},
			origin :{
				set: function(value){
					var temp = "animatedRectangle.config.origin property value must be an array";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+"of 2 Elements");
					validateArrayMembers(value, "number", temp+"of numeric elements");
					AROrigin = value;
				}
			},
			easing :{
				set: function(value){
					if(validateString(value)){
						if (validateObjectMember(timing, value)){
							AReasing = value;
						}
					}
				}
			},
			duration :{
				set: function(value){
					if(validateNumber(value)){
						if(value>0){
							ARduration = value;
						}else{
							ARduration = 0;
						}
					}
				}
			},
			clockWise :{
				set: function(value){
					if(validateBoolean(value)){
							ARclockWise = value;
					}
				}
			},
			fn:{
				set:function(value){
					if(validateFunction(value, "'config.fn' property value must be a function")){
						fn=value;
					}
				}
			}
});
	Object.defineProperties(this.animatedRectangle, {
		config:{writable:false},
		draw:{writable:false},
		stop:{writable:false}
	})
	/*******************************************************************/

	Object.defineProperty(this, "animatedRectangle", {writable:false});
	Object.defineProperty(this, "fixedRectangle", {writable:false});
}
/****************************************************************/

/************************loadProgress****************************/
function progressIndicator(canvasElement){
	var self = this, start =12,	progressLabel = true, progressBackground	= "#ccc", strokeWidth	= 10, strokeColor	="yellow", radius	= 50, percentageFontColor	= "white",
percentageFont = "normal normal 2.1vw Verdana", LabelFontColor = "white", LabelFont	= "normal normal .9vw Verdana";

//start => can either be 12 0r 3, anything else will default to zero
	if (validateElement(canvasElement, "progressIndicator() constructor argument 1 must be a valid HTML element")){
		if(canvasElement.nodeName != "CANVAS"){
			throw new Error("imageManipulator() constructor argument 1 must be a valid HTML Canvas element");
		}
	}
	var canvasObj = canvasElement.getContext('2d'); //initialization
	this.circularProgress = {
		config:{

		},
		show: function(progress, label){
				var test = new formValidator();
				if (test.validate.integer(progress) == false){
					throw new Error("circularProgress.show() method argument 1 must be an integer");
				}else{
					if(progress < 0 || progress >100){
						throw new Error("circularProgress.show() method argument 1 must be between 0 - 100");
					}
				}
				validateString(label, "circularProgress.show() method argument 2 must be a string");

				var startPoint = 0;
				var fprog = parseInt(progress);
				if(start == 12){
					startPoint = -0.5*Math.PI;
				}else if(start == 3){
					startPoint = 0*Math.PI;
				}else{
					startPoint = 0*Math.PI;
				}

				var x = (50/100) * canvasElement.scrollWidth;
				var y = (50/100) * canvasElement.scrollHeight;
				if(progressLabel == true){
					var fontY = (46/100) * canvasElement.scrollHeight;
					var labelY = (55/100) * canvasElement.scrollHeight;
				}else{
					var fontY = y;
				}

				//Draw
				canvasObj.clearRect(0,0, canvasElement.width, canvasElement.height);

				//Progress Background
				canvasObj.beginPath();
				canvasObj.lineWidth = strokeWidth;
				canvasObj.strokeStyle  = progressBackground;
				canvasObj.arc(x,y,radius,0,2*Math.PI, false);
				canvasObj.stroke();


				//Progress Text
				canvasObj.textAlign = "center";
				canvasObj.textBaseline = "middle";
				canvasObj.font = percentageFont;
				canvasObj.fillStyle = percentageFontColor;
				canvasObj.fillText(fprog+"%", x, fontY);
				if(progressLabel == true){ //label
					canvasObj.font = LabelFont;
					canvasObj.fillStyle = LabelFontColor;
					canvasObj.fillText(label, x, labelY);
				}

				//Progress point
				canvasObj.beginPath();
				canvasObj.lineWidth = strokeWidth;
				canvasObj.strokeStyle  =strokeColor;
				canvasObj.arc(x,y,radius,startPoint,percentageToAngle(progress, start), false);
				canvasObj.stroke();
			}
	};
	Object.defineProperties(this, {
		circularProgress:{writable:false}
	});
	Object.defineProperties(this.circularProgress, {
		config:{writable:false},
		show:{writable:false}
	});
	Object.defineProperties(this.circularProgress.config, {
		start:{
			set: function(value){
				if(validateNumber(value, "'start' property value must be numeric")){
					start = value;
				}
			}
		},
		progressLabel:{
			set: function(value){
				if(validateBoolean(value, "'progressLabel' property value must be boolean")){
					progressLabel = value;
				}
			}
		},
		progressBackground:{
			set: function(value){
				if(validateString(value, "'progressBackground' property value must be string of valid CSS color")){
					progressBackground = value;
				}
			}
		},
		strokeWidth:{
			set: function(value){
				if(validateNumber(value, "'strokeWidth' property value must be numeric")){
					var test = new formValidator();
					if(test.validate.integer(value)){
						strokeWidth = value;
					}else {
						throw new Error ("'strokeWidth' property value must be integer");
					}
				}
			}
		},
		strokeColor:{
			set: function(value){
				if(validateString(value, "'strokeColor' property value must be string of valid CSS color")){
					strokeColor = value;
				}
			}
		},
		radius:{
			set: function(value){
				if(validateNumber(value, "'radius' property value must be numeric")){
					var test = new formValidator();
					if(test.validate.integer(value)){
						radius = value;
					}else {
						throw new Error ("'radius' property value must be integer");
					}
				}
			}
		},
		percentageFontColor:{
			set: function(value){
				if(validateString(value, "'percentageFontColor' property value must be string of valid CSS color")){
					percentageFontColor = value;
				}
			}
		},
		percentageFont:{
			set: function(value){
				if(validateString(value, "'percentageFont' property value must be string of valid CSS font property value")){
					percentageFont = value;
				}
			}
		},
		labelFontColor:{
			set: function(value){
				if(validateString(value, "'labelFontColor' property value must be string of valid CSS color")){
					LabelFontColor = value;
				}
			}
		},
		labelFont:{
				set: function(value){
					if(validateString(value, "'labelFont' property value must be string of valid CSS font property value")){
						LabelFont = value;
					}
				}
			}
	})
}
/****************************************************************/

/************************ResourceIO**************************/
function resourceIO(){
	//private members starts
	var self 	= this, imageXhr = [],	imageUrls = [],	ImageLoadOk = 0, FontXhr = [], FontUrls = [],	FontLoadOk	= 0,	pageXhr	= [],	pageUrls 	= [],	pageLoadOk	= 0,resourceType = "text", total=0;
	var options	= {
			ICompleteCallBackfn		: null,
			ICompleteCallBackDelay	: 0,
			OCompleteCallBackfn		: null,
			OCompleteCallBackDelay	: 0,
			Oprogressfn : null,
			writeResource:true,
			imageElements:null,
			textElements:null
	}
	function initializeResource(resource){
		if(resourceType == "image"){
			for(var x=0; x<resource.length; x++){
				imageXhr[x] = new XMLHttpRequest();
				imageXhr[x].responseType = 'blob';
				imageUrls[x] = resource[x];
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else if(resourceType == "font"){
			for(var x=0; x<resource.length; x++){
				FontXhr[x] = new XMLHttpRequest();
				FontXhr[x].responseType = 'text';
				FontUrls[x] = resource[x];
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else if(resourceType == "text"){
			for(var x=0; x<resource.length; x++){
				pageXhr[x] = new XMLHttpRequest();
				pageXhr[x].responseType = 'text';
				pageUrls[x] = resource[x];
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}
	}
	function assignEventHandlers(){
		if(resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == imageXhr.length-1){
					get();
				}
			})
		}else if (resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == FontXhr.length-1){
					get();
				}
			})
		}else if (resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == pageXhr.length-1){
					get();
				}
			})
		}
	};
	function get(){
		if(resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].open("GET", imageUrls[arrayIndex], true);
				if (arrayIndex == imageXhr.length-1){
					 fireGet();
				}
			})
		}else if(resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].open("GET", FontUrls[arrayIndex], true);
				if (arrayIndex == FontXhr.length-1){
					 fireGet();
				}
			})
		}else if(resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].open("GET", pageUrls[arrayIndex], true);
				if (arrayIndex == pageXhr.length-1){
					 fireGet();
				}
			})
		}
	}
	function callBack(){
		if(options.OCompleteCallBackfn != null){
			setTimeout(function(){
				options.OCompleteCallBackfn();
			}, options.OCompleteCallBackDelay);
		}
	}
	function progCalc(index){
		if(resourceType == "image"){
			if(imageXhr[index].status == 200){
				if(options.writeResource == true){
					var reader  = new FileReader();
					reader.onloadend = function () {
						ImageLoadOk += 1;
						options.imageElements[index].style["background-image"] = "url("+reader.result+")";
						total = (ImageLoadOk/imageXhr.length)*100;
						options.Oprogressfn != null?options.Oprogressfn():null;
						if(total == 100){
							callBack();
						}
					};
					reader.readAsDataURL(imageXhr[index].response);
				}
			}
		}else if(resourceType == "font"){
			if(FontXhr[index].status == 200){
				FontLoadOk += 1;
				total = (FontLoadOk/FontXhr.length)*100;
				options.Oprogressfn != null?options.Oprogressfn():null;
				if(total == 100){
					callBack();
				}
			}
		}else if(resourceType == "text"){
			if(pageXhr[index].status == 200){
				pageLoadOk += 1;
				total = (pageLoadOk/pageXhr.length)*100;
				options.Oprogressfn != null?options.Oprogressfn():null;
				options.textElements[index].innerHTML = pageXhr[index].responseText;
				if(total == 100){
					callBack();
				}
			}
		}
	}
	function fireGet(){
		if(resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].send();
			})
		}else if(resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].send();
			})
		}else if(resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].send();
			})
		}

	}
	//private members end

	this.uploader = {
		config : {
		}
	}
	this.downloader = {
		config : {
		}
	}
	this.download = function(resource){
		validateArray(resource, "download() method argument 1 must be an array");
		validateArrayMembers(resource, "type", "download() method argument 1 must be an array of strings specifying the resource URL");
		initializeResource(resource);
	}
	this.upload = function(resource){}

	Object.defineProperties(this, {
		uploader:{
			writable:false
		},
		downloader:{
			writable:false
		},
		upload:{
			writable:false
		},
		download:{
			writable:false
		}
	});
	Object.defineProperties(this.downloader, {
		config:{
			writable:false
		},
		progress:{
			get:function(){
				return parseInt(total);
			}
		}
	});
	Object.defineProperties(this.uploader, {
		config:{
			writable:false
		},
		status:{
			get:function(){
				return parseInt(total);
			}
		}
	});
	Object.defineProperties(this.downloader.config, {
			callBackFn:{
				set:function(value){
					if (validateFunction(value)){
						options.OCompleteCallBackfn = value
					}
				}
			},
			callBackDelay:{
				set:function(value){
					if(validateNumber(value)){
						if(value > 0){
							options.OCompleteCallBackDelay = value;
						}else {
							options.OCompleteCallBackDelay = 0;
						}
					}
				}
			},
			resourceType: {
				set: function(value){
					if (validateString(value)){
						if(matchString(value.toLowerCase(), ["image", "text", "font"])){
								if(value.toLowerCase() == "image"){
									if(options.writeResource == true && options.imageElements == null){
										throw new Error("No images element set, set using the 'downloader.imageElements' properties");
									}else{
										resourceType = value.toLowerCase();
									}
								}else if (value.toLowerCase() == "text") {
									if(options.writeResource == true && options.textElements == null){
										throw new Error("No text elements set, set using the 'downloader.textElements' properties");
									}else{
										resourceType = value.toLowerCase();
									}
								}else{
									resourceType = value.toLowerCase();
								}
						}
					}
				}
			},
			writeResource:{
				set:function(value){
					validateBoolean(value, "'writeResource' property value must be a boolean");
					options.writeResource = value;
				}
			},
			imageElements:{
				set:function(value){
					validateHTMLObject(value, "'imageElements' property must be an HTMLObject");
					options.imageElements = value;
				}
			},
			textElements:{
				set:function(value){
					validateHTMLObject(value, "'textElements' property must be an HTMLObject");
					options.textElements = value;
				}
			},
			progressCallBackFn :{
				set:function(value){
					validateFunction(value, "'progressCallBack' property value must be a function");
					options.Oprogressfn = value;
				}
			}
	});
}
/****************************************************************/

/**********************ToBaseGridMultiple************************/
function  ToBaseGridMultiple(){
}
ToBaseGridMultiple.setHeight = function(targetElement, height){
	validateNumber(height);
	validateElement(targetElement);
	var newHeight = window.innerHeight;
	var root = document.querySelector("html");
	if(newHeight%height != 0){
		while (newHeight%height != 0){
			newHeight++;
		}
		targetElement.style["height"] = newHeight+"px";
		var TotalHeight = root.scrollHeight;
		root.style["height"] = TotalHeight+"px";
	}
}
ToBaseGridMultiple.centerVertically = function (targetElement, height){
	validateNumber(height);
	validateElement(targetElement);
	var transformValue = DOMelement.cssStyle(targetElement, "transform");
	var split = transformValue.split(", ");
	var targetIndex = split[split.length-1];
	var filteredValue = targetIndex.replace(")", "");
	filteredValue = Math.round(-1*filteredValue);
	if(filteredValue%height != 0){
		while (filteredValue%height != 0){
			filteredValue--;
		}
		targetElement.style["transform"] = "matrix(1, 0, 0, 1, 0, -"+filteredValue+")";
	}
}
/****************************************************************/

/**************************TypeWriter****************************/
function typeWriter(){
	var PlainTextCounter = 0,	ParagraphTextCounter = 0,	ActiveParagraph = 0, self = this, n, callBackDelay=0, speed= [10,20];
	this.writePlainText = function(con, text, fn){
		validateElement(con);
		validateString(text);
		validateFunction(fn);
		n = getRandomInt(speed[0], speed[1]);
		if(PlainTextCounter < text.length-1){
			var g = setInterval(function(){
				con.innerHTML += text[PlainTextCounter];
				clearInterval(g);
				self.writePlainText(con, text, fn);
				PlainTextCounter++;
			},n);
		}else{
			PlainTextCounter = 0;
			setTimeout(function(){fn()}, callBackDelay);
		}
	}
	this.writeParagraphText = function (paragraphs, texts, fn){
		validateHTMLObject(paragraphs);
		validateArray(texts, "writeParagraphText.write() argument 2 must be an array");
		validateArrayMembers(texts, "writeParagraphText.write() argument 2 array elements must all be string");
		validateFunction(fn);
		n = getRandomInt(speed[0], speed[1]);
		if(ActiveParagraph < paragraphs.length){
			var b = (texts[ActiveParagraph].length)+1;
			if(ParagraphTextCounter <= texts[ActiveParagraph].length){
				var g = setInterval(function(){
					if (ParagraphTextCounter+1 == b){
						ParagraphTextCounter = 0;
						ActiveParagraph++;
					}
					clearInterval(g);
					if(ActiveParagraph >= paragraphs.length){
						ParagraphTextCounter = 0;
						ActiveParagraph =0;
						setTimeout(function(){fn()}, callBackDelay);
					}else{
						var k = texts[ActiveParagraph][ParagraphTextCounter];
						paragraphs[ActiveParagraph].innerHTML +=  texts[ActiveParagraph][ParagraphTextCounter];
						ParagraphTextCounter++;
						self.writeParagraphText(paragraphs, texts, fn);
					}
				}, n);

			}

		}
	}
	this.config={}
	Object.defineProperties(this.config, {
		callBackDelay:{
			set:function(value){
				if(validateNumber(value)){
					callBackDelay = value
				}
			}
		},
		speed:{
			set:function(value){
				var temp = "writeParagraphText.config.speed property value must be an array ";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+"of 2 Elements");
				validateArrayMembers(value, "number", temp+"of numeric elements");
				if(value[0]>0 && value[1]>0){
					speed = value;
				}else{
					throw new Error("Array members for 'speed' property value must all be positive integers");
				}
			}
		}
	})
	Object.defineProperties(this, {
		writePlainText:{writable:false},
		writeParagraphText:{writable:false},
		config:{writable:false}
	})
}
/****************************************************************/

/************************ScreenBreakPoint************************/
function ScreenBreakPoint(breakPoints){
	validateObjectLiteral (breakPoints);

	var screenMode = "";
  var baseBeakPoints = {
		largeStart:1000, //large start point
		mediumStart: 600 //medium start point
	}
	validateObjectMembers(breakPoints, baseBeakPoints);

	if(validateNumber(breakPoints["largeStart"])){
		baseBeakPoints.largeStart = breakPoints["largeStart"];
	}
	if(validateNumber(breakPoints["mediumStart"])){
		baseBeakPoints.mediumStart = breakPoints["mediumStart"];
	}
	Object.defineProperties(this, {
		screen : {
			get:function(){
				if(innerWidth > baseBeakPoints["largeStart"]){
					return {mode:"large", actualSize:innerWidth};
				}else if (innerWidth >= baseBeakPoints["mediumStart"] && innerWidth < baseBeakPoints["largeStart"]) {
					return {mode:"medium", actualSize:innerWidth};
				}else {
					return {mode:"small", actualSize:innerWidth};
				}
			}
		}
	})
}
/****************************************************************/

/**********************Element properties getter*********************/
function DOMelement(){
}
DOMelement.index = function(child){
	var index = 0, n=0;
	while(child){
		child = child.previousElementSibling;
		n++;
	}
	index = n++;
	return index;
}
DOMelement.cssStyle = function (element, property){
	if(window.getComputedStyle){
		var styleHandler = getComputedStyle(element, null);
	}else{
		var styleHandler = element.currentStyle;
	}
	var propertyValue = styleHandler[property];
	if(propertyValue.length == 0){//No computed value, try from style attribute
		propertyValue = element.style[property];
	}
	return propertyValue;
},
DOMelement.centerY = function (element){
	validateElement(element, "DOMelement.centerY() static method argument 1 must be a valid HTML element");
	var positionType = DOMelement.cssStyle(element, "position");
	var elementParent = element.parentNode;
	var support = DOMelement.cssStyle(element, "transform");

	if(positionType != "static"){//Positioned element
		if(support != undefined){//Transform supported
			//Centralize
			element.style["top"] = "50%";
			element.style["transform"] = "translateY(-50%)";
		}else{//Transform not supported
			function centerY(){
				var parentHeight = elementParent.scrollHeight;
				var elementHeight = element.scrollHeight;
				var top = (parentHeight - elementHeight)/2;
				element.style["top"] = top+"px";
			}
			centerY();
			window.addEventListener("resize", function(){
				centerY();
			}, false)
		}
	}else{ // static element
		function centerY(){
			var parentHeight = elementParent.scrollHeight;
			var elementHeight = element.scrollHeight;
			var marginTop = (parentHeight - elementHeight)/2;
			elementParent.style["padding-top"] = "1px";
			element.style["margin-top"] = marginTop+"px";
		}
		centerY();
		window.addEventListener("resize", function(){
			centerY();
		}, false);
	}
}
DOMelement.centerX = function (element){
	validateElement(element, "DOMelement.centerX() static method argument 1 must be a valid HTML element");
	var positionType = DOMelement.cssStyle(element, "position");
	var elementParent = element.parentNode;
	var support = DOMelement.cssStyle(element, "transform");

	if(positionType != "static"){//Positioned element
		if(support != undefined){//Transform supported
			//Centralize
			element.style["left"] = "50%";
			element.style["transform"] = "translateX(-50%)";
		}else{//Transform not supported
			var parentWidth = elementParent.scrollWidth;
			var elementWidth = element.scrollWidth;
			var left = (parentWidth - elementWidth)/2;
			element.style["left"] = left+"px";
		}
	}else{ // static element
		element.style["margin-left"] ="auto";
		element.style["margin-right"] ="auto";
	}
}
DOMelement.center = function (element){
	validateElement(element, "DOMelement.centerY() static method argument 1 must be a valid HTML element");
	var positionType = DOMelement.cssStyle(element, "position");
	var elementParent = element.parentNode;
	var support = DOMelement.cssStyle(element, "transform");
	if(positionType != "static"){//Positioned element
		if(support != undefined){//Transform supported
			//Centralize
			element.style["top"] = "50%";
			element.style["left"] = "50%";
			element.style["transform"] = "translateY(-50%) translateX(-50%)";
		}else{
			function center(){
				var parentHeight = elementParent.scrollHeight;
				var elementHeight = element.scrollHeight;
				var top = (parentHeight - elementHeight)/2;
				var parentWidth = elementParent.scrollWidth;
				var elementWidth = element.scrollWidth;
				var left = (parentWidth - elementWidth)/2;
				element.style["left"] = left+"px";
				element.style["top"] = top+"px";
			}
			center();
			window.addEventListener("resize", function(){
				center();
			}, false);
		}
	}else{ // static element
		element.style["margin-left"] ="auto";
		element.style["margin-right"] ="auto";
		function centerY(){
			var parentHeight = elementParent.scrollHeight;
			var elementHeight = element.scrollHeight;
			var marginTop = (parentHeight - elementHeight)/2;
			elementParent.style["padding-top"] = "1px";
			element.style["margin-top"] = marginTop+"px";
		}
		centerY();
		window.addEventListener("resize", function(){
			centerY();
		}, false);
	}
}
DOMelement.animate = function (draw, value, duration, timingFn="linear" ){
	//draw =>  the function that handles the actual drawing, it must accept an argument, which would be used for the animation
	//draw(x) means, draw the value 'x' for duration using the the timing function
	//duration is in miliseconds
	validateFunction(draw, "'DOMelement.animate()' method argument 1 must be a function");
	validateNumber(value, "'DOMelement.animate()' method argument 2 must be numeric");
	if(value < 0){
		throw new Error ("'DOMelement.animate()' method argument 2 must be greater than 0");
	}
	validateNumber(duration, "'DOMelement.animate()' method argument 3 must be numeric");
	if(duration < 0){
		throw new Error ("'DOMelement.animate()' method argument 3 must be greater than 0");
	}
	validateObjectMember(timing, timingFn, "'DOMelement.animate()' method argument 4 value invalid ");
		

	var start = performance.now();
	requestAnimationFrame(function animate(time) {
		// timeFraction goes from 0 to 1
		var timeFrac = (time - start) / duration;
		if (timeFrac > 1) timeFrac = 1;

		// calculate the current animation state
		var progress = timing[timingFn](timeFrac);
		draw(progress*value); // draw it
		if (timeFrac < 1) {
			requestAnimationFrame(animate);
		}
	})
}
DOMelement.attachEventHandler = function (event, DomClass, fn){
	validateString(event, "'DOMelement.attachEventHandler()' argument 1 must be a string specifying the event type");
	validateString(DomClass, "'DOMelement.attachEventHandler()' argument 2 must be a string specifying the class name of the element(s)");
	validateFunction(fn, "'DOMelement.attachEventHandler()' argument 3 must be a function to be called on the trigger");

	document.body.addEventListener(event, function(e){
		if(e.target.classList.contains(DomClass)){
			fn(e);
		}
	}, false);
};
DOMelement.hasParent = function(element, parentId){
	var temp 	= "DOMelement.hasParent(.x) static method argument 2 must be a string", status=null;
	//parentId => class name , if not exist, then id name
	validateElement(element, "DOMelement.hasParent(x.) static method argument 1 must be a valid HTML element");
	validateString(parentId, temp);
	
	if(document.querySelector("."+parentId) != null){//Has class
		while(element){
			element = element.parentNode;
			if(element != null){
				if(element.classList.contains(parentId)){
					status = true;
					break;
				}
			}
		}
	}else if(document.querySelector("#"+parentId) != null){//Has id
		while(element){
			element = element.parentNode;
			if(element != null){
				if(element.id == parentId){
					status = true;
					break;
				}
			}
		}
	}
	return status;
}
/****************************************************************/

/********************Verticalal scroll handler*******************/
function verticalScroll(){
	var iniSY = 0, state = {direction:"", change:0};
	window.addEventListener("scroll", function(){
		if(scrollY > iniSY){//scrolled down
			state["change"] = scrollY - iniSY;
			state["direction"] = "down";
			iniSY = scrollY;
		}else {
			state["change"] = iniSY - scrollY;
			state["direction"] = "up";
			iniSY = scrollY;
		}
	},false);
	Object.defineProperty(this, "query", {
		get:function(){
			return state;
		}
	});
}
verticalScroll.query = function(totalHeight=null){
	var TotalHeightBelow = totalHeight - window.innerHeight;
	var remainingHeightBelow = totalHeight - (scrollY+window.innerHeight);
	var state = "";
	if(scrollY == TotalHeightBelow || scrollY == TotalHeightBelow-1){
		state = "end";
	}else{
		state = "ON";
	}
	return {
		TotalHeightBelow:TotalHeightBelow,
		status:state,
		remainingHeightBelow:remainingHeightBelow
	}
}
/****************************************************************/

/************************ListScroller****************************/
function listScroller(container, listParent){
	//listParent 	=> the ul element
	//container		=> Element housing the ul element
	validateElement(container, "An HTML element needed as list parent container");
	validateElement(listParent, "List parent is not a valid HTML element");
	var maxAdd = 0, ini = 0, paddingRight = 0,	ready = 0, listening=0, running=0;
	var listPlane = "x", menuWidth = 170, Xbuttons = [], Ybuttons = [], scrollSize = 175, effects = [1, "linear"], inactiveButtonsClassName = [], paddingLeft=0, paddingY=[], menuHeight=23,paddingY=[0,0], wrapperStyle="width:100%";
	//Xbuttons[0] = left buttons, Xbuttons[1] = Right buttons
	function toggleClass(type, id){
		if(listPlane == "x"){
			if (type == "r"){//remove
				if (inactiveButtonsClassName.length == 2){
					Xbuttons[id].classList.remove(inactiveButtonsClassName[id]);
				}else{
					Xbuttons[id].classList.remove(inactiveButtonsClassName[0]);
				}
			}else if (type == "a") {//add
				if (inactiveButtonsClassName.length == 2){
					Xbuttons[id].classList.add(inactiveButtonsClassName[id]);
				}else{
					Xbuttons[id].classList.add(inactiveButtonsClassName[0]);
				}
			}
		}else{
			if (inactiveButtonsClassName.length == 2){
				Ybuttons[id].classList.add(inactiveButtonsClassName[id]);
			}else{
				Ybuttons[id].classList.add(inactiveButtonsClassName[0]);
			}
		}
	}
	//event function
	function transitionEndHandler(e){
		if(e.target.classList.contains("vlistCon")){
			if (listPlane == "X" || listPlane == "x"){
				if(listParent.classList.contains("to_left")){
					toggleClass("r", 0);
					var diff = behindRightValue();
					if(diff == 0){
						toggleClass("a", 1);
					}
					running=0;
				}else if (listParent.classList.contains("to_right")) {
					toggleClass("r", 1);
					var leftValue = null;
					behindLeftValue()<0?leftValue = -1*behindLeftValue():leftValue = behindLeftValue();
					if(leftValue == 0){
						toggleClass("a", 0);
					}
					running=0;
				}
			}else if (listPlane == "Y" || listPlane == "y") {
	
			}
		}	
	}
	function clickHandler(e){
		//button left
		if(e.target.classList.contains("vListBt-Left")){
			if (listening == 1){
				if (running == 0){
					scrollToRight(e);
				}
			}
		}

		//button Right
		if(e.target.classList.contains("vListBt-Right")){
			if (listening == 1){
				if(running == 0){
					scrollToleft(e);
				}
			}
		}
		//button top
		if(e.target.classList.contains("vListBt-Top")){
			if (listening == 1){
				if(running == 0){
					scrollToTop(e);
				}
			}
		}
		//button Right
		if(e.target.classList.contains("vListBt-Bottom")){
			if (listening == 1){
				if(running == 0){
					// scrollTolBottom(e);
				}
			}
		}
	}
	function assignHandlers(){
		//List Container
		DOMelement.attachEventHandler ("transitionend", "vlistCon", transitionEndHandler);

		//Buttons
		DOMelement.attachEventHandler ("click", "vListBt", clickHandler);

		window.addEventListener("resize", function (){
			if(listening == 1){
				scrollStatus();
			}
		}, false);
	}
	function behindRightValue(){
		var leftValue = null;
		behindLeftValue()<0?leftValue = -1*behindLeftValue():leftValue = behindLeftValue();
		var containerSize = container.clientWidth;
		var behindRight = listParent.scrollWidth - (leftValue + (containerSize-(paddingLeft+paddingRight)));
		return behindRight;
	}
	function behindLeftValue(){
		var scrolledLeft = listParent.offsetLeft;
		var diff = scrolledLeft - paddingLeft;
		return diff;
	}
	function addVitalStyles(){
		listParent.style["transition"] = "left "+ effects[0]+"s "+effects[1]+", top "+effects[0]+"s " +effects[1];
		container.setAttribute("style", wrapperStyle);
		if(listPlane.toLowerCase() == "x"){
			styleXplane();
		}else if(listPlane.toLowerCase() == "y"){
			styleYplane();
		}
		scrollStatus();
	}
	function scrollToleft(e){
		if (e.button == 0){
			var behindRight = behindRightValue();
			if (behindRight > 0){
				maxAdd = scrollSize;
				var currentPosition = parseInt(DOMelement.cssStyle(listParent, "left"), "px");
				listParent.classList.add("to_left");
				listParent.classList.contains("to_right")?listParent.classList.remove("to_right"):null;
				if(behindRight >= maxAdd){
					var newPostion = currentPosition - (maxAdd);
					listParent.style["left"] = newPostion+"px";
				}else {
					var newPostion = currentPosition - (behindRight);
					listParent.style["left"] = newPostion+"px";
				}
				running=1;
			}
		}
	}
	function scrollToRight(e){
		if (e.button == 0){
			var behindLeft = behindLeftValue();
			var currentPosition = parseInt(DOMelement.cssStyle(listParent, "left"), "px");
			maxAdd = scrollSize;

			if(behindLeft < 0){
				var ABS_diff = -1*behindLeft;
				maxAdd = scrollSize;
				var currentPosition = parseInt(DOMelement.cssStyle(listParent, "left"), "px");

				listParent.classList.add("to_right");
				listParent.classList.contains("to_left")?listParent.classList.remove("to_left"):null;

				if(ABS_diff >= maxAdd){
					var newPostion = currentPosition + (maxAdd);
					listParent.style["left"] = newPostion+"px";
				}else {
					var newPostion = currentPosition + (ABS_diff);
					listParent.style["left"] = newPostion+"px";
				}
				running =1;
			}
		}
	}
	function scrollStatus(){
		if (listPlane == "x"){
			if(listening == 1){ //started
				var behindRight = behindRightValue();
				behindRight>0?toggleClass("r", 1):toggleClass("a", 1);
			}
		}else if (listPlane == "y"){
			toggleClass("a", 1);
		}
	}
	function styleXplane(){
		var listItems = listParent.children;
		var children = listItems.length;
		//style list parent container
		container.classList.add("vlistParentXContainer");

		//Style list parent
		listParent.classList.add("vlistParentX");
		listParent.style["width"] = (children*scrollSize)+"px";
		listParent.style["left"] = paddingLeft+"px";

		//Style list
		for (var list of listItems) {
			list.classList.add("vlist");
			list.style["width"] = menuWidth+"px";
		}
	}
	function styleYplane(){
		var listItems = listParent.children;
		var children = listItems.length;
		//style list parent container
		container.classList.add("vlistParentYContainer");

		//Style list parent
		listParent.classList.add("vlistParentY");
		listParent.style["height"] = (children*scrollSize)+"px";
		listParent.style["top"] = paddingY[0]+"px";
		listParent.style["left"] = "0px";
		listParent.style["width"] = "100%";

		//Style list
		for (var list of listItems) {
			list.classList.add("vlist");
			list.style["height"] = menuHeight+"px";
			list.style["width"] = "100%";
		}
	}
	this.config = {};
	this.initialize = function(){
		if(ready == 0){//Not initialized
			var listItems = listParent.children;
			var children = listItems.length;
			if(inactiveButtonsClassName.length == 0){
				throw new Error("Setup error: Buttons class not specified");
			}
			if(listPlane.toLowerCase() == "x"){
				if(Xbuttons.length == 0 ){
					throw new Error("Setup error: Xbuttons not specified");
				}
				listParent.classList.remove("vlistParentY");
				Xbuttons[0].classList.add(inactiveButtonsClassName[0]);
				Xbuttons[1].classList.add(inactiveButtonsClassName[0]);
			}else if(listPlane.toLowerCase() == "y"){
				if(Ybuttons.length == 0 ){
					throw new Error("Setup error: Ybuttons not specified");
				}
				Ybuttons[0].classList.add(inactiveButtonsClassName[0]);
				Ybuttons[1].classList.add(inactiveButtonsClassName[0]);
			}

			if (children < 0){
				throw new Error("Setup error: No list item found, check the listType specified in the contructor");
			}
			listParent.classList.add("vlistCon");
			addVitalStyles();
			assignHandlers();
			ready = 1;//initialized
		}else{
			addVitalStyles();
		}
	};
	this.onScroller = function (){
		if(ready == 1){
			listening = 1;
			scrollStatus();
		}
	}
	this.offScroller = function (){
		if(ready == 1){
			listening = 0;
			toggleClass("a", 0);
			toggleClass("a", 1);
		}
	};
	Object.defineProperties(this.config, {
		listPlane:{
			set: function(value){
				
				validateString(value, "String needed as listPlane property value");
				var value = value.toLowerCase();
				matchString(value, ["x", "y", "xy"], "listPlane value can either be 'x' 'y' or 'xy', case insensitive");
				listPlane = value;
				function emsg(axis){
					return "setting config.listPlane property to "+axis+" requires the "+axis+" axis buttons to be set first. Use the  Obj.config."+axis+"buttons property to set buttons";
				}
				if(value == "x"){
					if(Xbuttons.length == 0){
						throw new Error(emsg("X"));
					}
					listParent.classList.remove("vlistParentY");
					Xbuttons[0].classList.add("vListBt-Left");
					Xbuttons[1].classList.add("vListBt-Right");
					
					try {
						Ybuttons[0].classList.remove("vListBt-Top");
						Ybuttons[1].classList.remove("vListBt-Bottom");
					} catch (error) {
						
					}
					
				}else{
					if(Ybuttons.length == 0){
						throw new Error(emsg("Y"));
					}
					listParent.classList.remove("vlistParentX");
					Ybuttons[0].classList.add("vListBt-Top");
					Ybuttons[1].classList.add("vListBt-Bottom");
					try {
						Xbuttons[0].classList.remove("vListBt-Left");
						Xbuttons[1].classList.remove("vListBt-Right");
					} catch (error) {
						
					}
				}
			}
		},
		Xbuttons: {
			set:function(value){
				var temp = "listScroller.config.Xbuttons property value must be an array ";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+"of 2 Elements");
				validateArrayMembers(value, "HTMLElement", temp+"of HTMLElements");
				//Add ids
				value[0].classList.add("vListBt", "vListBt-Left");
				value[1].classList.add("vListBt", "vListBt-Right");

				//Add styles
				value[0].style["cursor"] = "pointer";
				value[1].style["cursor"] = "pointer";
				Xbuttons = value;
			}
		},
		Ybuttons: {
			set:function(value){
				var temp = "listScroller.config.Ybuttons property value must be an array ";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+"of 2 Elements");
				validateArrayMembers(value, "HTMLElement", temp+"of HTMLElements");
				Ybuttons = value;
			}
		},
		scrollSize: {
			set:function(value){
				validateNumber(value, "Numeric value needed for scrollSize property");
				scrollSize = value;
			}
		},
		paddingRight: {
			set:function(value){
				if(validateNumber(value, "Numeric value needed for 'paddingRight' property")){
					if(value < 0){
						paddingRight = 0;
					}else{
						paddingRight = value;
					}
				}
			}
		},
		paddingLeft:{
			set:function(value){
				validateNumber(value, "Numeric value needed for 'paddingLeft' property");
				if(value < 0){
					paddingLeft = 0;
				}else{
					paddingLeft = value;
				}
			}
		},
		paddingY:{
			set:function(value){
				var temp = "paddingY property expects an array";
				validateArray(value, temp);
				if(value.length > 2){
					throw new Error(temp+" of 1 or 2 members");
				}
				validateArrayMembers(value, "number", temp+" of numeric members");
				paddingY = value;
			}
		},
		inactiveButtonsClassName:{
			set:function(value){
				var temp = "inactiveButtonsClassName property value must be an array ";
				validateArray(value, temp);
				validateArrayMembers(value, "string", temp+"of strings");
				if (value.length == 0 ){
					throw new Error ("'inactiveButtonsClassName' property value cannot be an empty array");
				}else{
					if(value.length > 2){
						throw new Error ("'config.inactiveButtonsClassName' property value must be an array of either 1 or 2 members");
					}else{
						inactiveButtonsClassName = value;
					}
				}
			}
		},
		effects:{
			set:function(value){
				var temp = "'config.effects' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateNumber(value[0], temp+", having its 1st element to be an numeric type, which represents the speed");
				validateString(value[1], temp+", having its 2nd element to be a string type, which represents the effect (A CSS valid effect value e.g 'linear')");
				effects = value;
			}
		},
		menuWidth:{
			set:function(value){
				validateNumber(value, "Numeric value needed for menuWidth property");
				menuWidth = value;
			}
		},
		menuHeight:{
			set:function(value){
				validateNumber(value, "Numeric value needed for menuHeight property");
				menuHeight = value;
			}
		},
		wrapperStyle:{
			set:function(value){
				validateString(value, "wrapperStyle property expects a string as value");
				wrapperStyle = value;
			}
		}
	});
	Object.defineProperties(this, {
		config:{writable:false},
		initialize:{writable:false},
		onScroller:{writable:false},
		offScroller:{writable:false}
	});
}
/****************************************************************/

/*****************browserResizePropertyHandler*******************/
function browserResizeProperty(){
	var currentSize = window.innerWidth, alter = 0, mode="null";
	window.addEventListener("resize", function(){
		if (window.innerWidth > currentSize){
			var diff = window.innerWidth - currentSize;
			alter = diff;
			currentSize = window.innerWidth;
			mode = "expanded";
		}else{
			var diff = currentSize - window.innerWidth;
			alter = diff;
			currentSize = window.innerWidth;
			mode = "shrinked";
		}
	}, false);
	Object.defineProperties(this, {
		mode:{
			get:function(){
				return mode;
			}
		},
		change:{
			get: function(){
				return alter;
			}
		}
	})
}
/****************************************************************/

/********************Custom form component***********************/
function customFormComponent(vWrapper=null){
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom select builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	var selOpen=0, self=this, selectDim=[], arrowIconClose="", arrowIconOpen="", selectedContent="", multipleSelection=false, defaultSet=false, startIndex = 0, scrollIni =0,
	afterSelectionFn= function(){}, wrapperCustomStyle="", totalOptions = 0 ,selectFieldCustomStyle="", optionCustomStyle="", optionsContainerCustomStyle="", arrowConCustomStyle="";

	/************************************************************************************/
	//bgColors[a,b] a=> listBacgroundColor, b=> slectBackground
	//fontColors[a,b] a=> listFontColor, b=> slectfontColor
	//selectDim[a,b] a=> width of select cElement , b=> height of select cElemt
	//vWrapper => A custom name to give to the wrapper of the custom element
	/************************************************************************************/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom select builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	function selectOptions(listOptionCon){
		var listParent = listOptionCon.parentNode.parentNode;
		if(listParent.querySelector("."+vWrapper + " .optionsCon .selected") != null){
			var currentSelected = listParent.querySelector("."+vWrapper + " .optionsCon .selected");
			currentSelected.classList.remove("selected");
		};
		var sfield = listParent.querySelector("."+vWrapper + " .sfield");
		
		var currentHovered = listParent.querySelector("."+vWrapper + " .optionsCon .hovered");
		var mainSelect = listParent.querySelector("."+vWrapper).nextElementSibling;

		//Select the clicked item
		currentHovered.classList.add("selected");

		//Assign selected value to main select element
		mainSelect.value = currentHovered.getAttribute("value");

		//Add selected to select field
		sfield.innerHTML = currentHovered.innerHTML;

		//Hide listCon
		listOptionCon.style["height"] = "0px";
		selOpen = 0;
		afterSelectionFn();
	};
	function hideList(listOptionCon){
			var prevHovered = listOptionCon.querySelector(".hovered");
			if (prevHovered != null){
				//Remove to current
				prevHovered.classList.remove("hovered");
			}

			//hide listOptionCon
			listOptionCon.style["height"] = "0px";
			selOpen = 0;
	};
	function hover(e, listOptionCon){
		//Add to current
		var prevHovered = listOptionCon.querySelector(".hovered");
		if (prevHovered == null){
			//Add to current
			e.target.classList.add("hovered");
		}else{
			//Add to current
			prevHovered.classList.remove("hovered");

			//Add to current
			e.target.classList.add("hovered");
		}
	}
	function unhovered(e, listOptionCon){
		var prevHovered = listOptionCon.querySelector(".hovered");
		prevHovered != null?prevHovered.classList.remove("hovered"):null;
	}
	function toggleOptionList(listOptionCon){
		if (selOpen == 0){ //list closed
			var listOptionsTotal = listOptionCon.childElementCount;
			//show listOptionCon
			listOptionCon.style["display"] = "block";
			listOptionCon.scrollHeight;
			var heightValue = extractDimensionValue(selectDim[1], "px");
			listOptionCon.style["height"] = listOptionsTotal*heightValue+"px";
			selOpen = 1;
		}else if (selOpen == 1) {//list opened
			var prevHovered = listOptionCon.querySelector(".hovered");
			if (prevHovered != null){
				//Remove to current
				prevHovered.classList.remove("hovered");
			}

			//hide listOptionCon
			listOptionCon.style["height"] = "0px";
			selOpen = 0;
		}
	}
	function scrollDown(listOptionCon){
		var activieHovered = listOptionCon.querySelector(".hovered");
		if (activieHovered == null){
			var firstSelectable = listOptionCon.querySelector("div[data-disabled='false']");
			if(firstSelectable != null){
				firstSelectable.classList.add("hovered");
			}
		}else {
			var index = DOMelement.index(activieHovered);
			var totalOptions = listOptionCon.childElementCount;
			if(index != totalOptions){
				var allOptions = listOptionCon.querySelectorAll(".option");
				for(var x=1; x<=totalOptions; x++){
					if(x>index){
						if(allOptions[x-1].getAttribute("data-disabled") == "false"){
							activieHovered.classList.remove("hovered");
							allOptions[x-1].classList.add("hovered");
							break;
						}
					}
				}
			}else{
				var allOptions = listOptionCon.querySelectorAll(".option");
				for(var x=0; x<=totalOptions; x++){
					if(allOptions[x].getAttribute("data-disabled") == "false"){
						activieHovered.classList.remove("hovered");
						allOptions[x].classList.add("hovered");
						break;
					}
				}
			}
		}
	}
	function scrollUp(listOptionCon){
		var activieHovered = listOptionCon.querySelector(".hovered");
		if (activieHovered == null){
			var allSelectable = listOptionCon.querySelectorAll("div[data-disabled='false']");
			if(allSelectable.length >0){
				allSelectable[allSelectable.length-1].classList.add("hovered");
			}
		}else{
			var index = DOMelement.index(activieHovered);
			var totalOptions = listOptionCon.childElementCount;
			if(index != 1){//scroll up
				var allOptions = listOptionCon.querySelectorAll(".option");
				for(var x=index-2; x>=0; x--){
					if(allOptions[x].getAttribute("data-disabled") == "false"){
						activieHovered.classList.remove("hovered");
						allOptions[x].classList.add("hovered");
						break;
					}
				}
			}else{
				activieHovered.classList.remove("hovered");
				var allSelectable = listOptionCon.querySelectorAll("div[data-disabled='false']");
				if(allSelectable.length >0){
					allSelectable[allSelectable.length-1].classList.add("hovered");
				}
			}
		}
	}
	function createStyleSheet(){
		if (document.querySelector("style[data-id='v"+vWrapper+"']") == null){
			//set wrapper class name
			var css = styles["selectFormComponent"].replace(/shell/g, vWrapper);
			css += "."+vWrapper + " {width:"+selectDim[0]+"; height:"+selectDim[1]+"; z-index: 60;}";
			css += "."+vWrapper + " .sfield {line-height:"+selectDim[1]+";}";
			css += "."+vWrapper + " .optionsCon .option {height:"+selectDim[1]+";line-height:"+selectDim[1]+";}";
			css += "."+vWrapper + " .arrowCon {width:"+selectDim[1]+";}";
			css += "."+vWrapper + " .arrowCon::before {line-height:"+selectDim[1]+";}";
			if(arrowIconClose != ""){
				css += "."+vWrapper + " .arrowCon::before {"+arrowIconClose+"}"
			}
			if(arrowIconOpen != ""){
				css += "."+vWrapper + " .opened::before {"+arrowIconOpen+"}"
			}
			attachStyleSheet("v"+vWrapper, css)
		}
	}
	function reCreateSelect (SelectElement){
		//Set listType
		if(SelectElement.getAttribute("multiple") != null){
			//multipleSelection = true;
			throw new Error("No support yet for multiple selection");
		}else{
			//multipleSelection = false;
		}
		//Wrapper Element
		var wrapper = document.createElement("DIV");
		wrapper.setAttribute("class", vWrapper);
		wrapper.setAttribute("tabindex", "0");
		if(wrapperCustomStyle != ""){
			wrapper.style = wrapperCustomStyle;
		}

		//Select field
		var selectField = document.createElement("DIV");
		selectField.setAttribute("class", "sfield");
		if(selectFieldCustomStyle != ""){
			selectField.style = selectFieldCustomStyle;
		}

		//ArrowCon
		var arrowCon = document.createElement("DIV");
		arrowCon.setAttribute("class", "arrowCon");
		if(arrowConCustomStyle != ""){
			arrowCon.style = arrowConCustomStyle;
		}

		//selectOptions container
		var optionsContainer = document.createElement("DIV");
		optionsContainer.setAttribute("class", "optionsCon");
		if(optionsContainerCustomStyle != ""){
			optionsContainer.style = optionsContainerCustomStyle;
		}

		//TotalOptions
		totalOptions = SelectElement.options.length;

		//Add options to custom
		for(var x=0;x<totalOptions; x++){
			var options = document.createElement("DIV");
			options.setAttribute("class", "option");
			options.setAttribute("value", SelectElement.options[x].getAttribute("value"));
			SelectElement.options[x].getAttribute("disabled") != null?options.setAttribute("data-disabled", "true"):options.setAttribute("data-disabled", "false");

			if(optionCustomStyle != ""){
				options.style = optionCustomStyle;
			}


			//First select option
			if (multipleSelection == false && defaultSet == false){
					if (SelectElement.options[x].getAttribute ("selected") != null){//selected
						options.classList.add("selected");
						selectField.appendChild(document.createTextNode(SelectElement.options[x].innerHTML));
						defaultSet = true;
					}else if (SelectElement.options[x].getAttribute ("selected") == null && x == SelectElement.options.length-1) {
						selectField.appendChild(document.createTextNode(SelectElement.options[0].innerHTML));
						defaultSet = false;
					}
			}
			options.appendChild(document.createTextNode(SelectElement.options[x].innerHTML));
			optionsContainer.appendChild(options);
		}

		// //Apply Styles
		createStyleSheet();

		//Add selectField to wrapper
		wrapper.append(selectField);

		//Add arrowCon
		wrapper.append(arrowCon);

		//Add selectOptionsContainer to Wrapper
		wrapper.append(optionsContainer);

		//Add wrapper before target select;
		var selectParent = SelectElement.parentNode;
		selectParent.insertBefore(wrapper, SelectElement);

		//Hide main select element
		SelectElement.style["display"] = "none";

		//Add default if no default specified
		if (defaultSet == false){
			var firstListOption = document.querySelector("."+vWrapper + " .optionsCon .option");
			firstListOption.classList.add("selected");
		}
	}
	function assignEventHandler(SelectElement){
		var listParent = SelectElement.parentNode;
		var listOptionCon = listParent.querySelector("."+vWrapper + " .optionsCon");
		var arrowCon = listParent.querySelector("."+vWrapper + " .arrowCon");
		listParent.addEventListener("mousedown", function(e){
			if (e.button == 0){
				if (e.target.classList.contains("sfield") || e.target.classList.contains("arrowCon")){
					toggleOptionList(listOptionCon);
				}else if (e.target.classList.contains("option")) {
					if (multipleSelection == false && e.target.getAttribute("data-disabled") == "false"){
						selectOptions(listOptionCon);
					}
				}
			}
		}, false);
		listParent.addEventListener("click", function(e){
			if (e.target.classList.contains("sfield") == false && e.target.classList.contains("arrowCon") == false && e.target.classList.contains("option") == false){
				if (selOpen == 1) {//list opened
					hideList(listOptionCon);
				}
			}
		},false);
		listOptionCon.addEventListener("transitionend", function(e){
			if (selOpen == 1){
				arrowCon.classList.add("opened");
			}else if (selOpen == 0) {
				arrowCon.classList.remove("opened");
				listOptionCon.style["display"] = "none";
			}
		}, false);
		listOptionCon.addEventListener("mouseover", function(e){
			if(e.target.classList.contains("option") && e.target.getAttribute("data-disabled") == "false"){
				hover(e, listOptionCon);
			}
		}, false);
		listOptionCon.addEventListener("mouseleave", function(e){
			unhovered(e, listOptionCon);
		}, false);
		listParent.addEventListener("focusin", function (e){
			if(e.target.classList.contains(vWrapper)){
				if (selOpen == 0){
					toggleOptionList(listOptionCon);
				}
			}
		}, false);
		listParent.addEventListener("focusout", function (e){
			if(e.target.classList.contains(vWrapper)){
				if (selOpen == 1){
					toggleOptionList(listOptionCon);
				}
			}
		}, false);
		listParent.addEventListener("keydown", function (e){
			if(e.target.classList.contains(vWrapper)){
				if (selOpen == 1){
					var khdlr = keyboardEventHanler(e);
				  if (khdlr["handled"] == true) {
				    // Suppress "double action" if event handled
				    e.preventDefault();
						if (khdlr["type"]  == 1){
							if(e.key == "ArrowDown" | "Down"){
								scrollDown(listOptionCon);
							}else if (e.key == "ArrowUp" | "Up") {
								scrollUp(listOptionCon);
							}else if (e.key == "Enter") {
								selectOptions(listOptionCon);
							}
						}else if(khdlr["type"] == 2){

						}else if(khdlr["type"] == 3){

						}
				  }
				}
			}
		}, false);
	}
	this.select = {
		build: function(SelectElement){
			validateElement(SelectElement, "A select element needed as argument for the 'build' method, non provided");
			if(SelectElement.nodeName != "SELECT"){
				throw new Error("A select element needed, please specify a valid select element");
			}
			if (selectDim.length == 0){
				throw new Error("Setup imcomplete: list dimension needed, specify using the 'selectDimension' property");
			}
			var selectParent = SelectElement.parentNode;
			DOMelement.cssStyle(selectParent, "position") == "static"?selectParent.style["position"] = "relative":null;
			reCreateSelect(SelectElement);
			assignEventHandler(SelectElement);
		},
		config:{}
	};
	Object.defineProperty(this, "select", {
		writable:false
	})
	Object.defineProperties(this.select, {
		build:{writable:false},
		config:{writable:false}
	})
	Object.defineProperties(this.select.config, {
		afterSelectionFn : {//Function to call after selection
			set:function(value){
				if(validateFunction(value, "Function needed as value for the 'afterSelectionFn' property")){
					afterSelectionFn = value;
				}
			}
		},
		selectSize:{
			set:function(value){
				var temp = "'config.selectSize' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "dimension", temp+"of strings CSS dimensions");
				selectDim = value;
			}
		},
		wrapperStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")){
					wrapperCustomStyle = value;
				}
			}
		},
		selectFieldStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'selectFieldStyle' property")){
					selectFieldCustomStyle = value;
				}
			}
		},
		arrowConStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'arrowConStyle' property")){
					arrowConCustomStyle = value;
				}
			}
		},
		optionswrapperStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'optionswrapperStyle' property")){
					optionsContainerCustomStyle = value;
				}
			}
		},
		optionStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'optionStyle' property")){
					optionCustomStyle = value;
				}
			}
		},
		arrowIconClose:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'arrowIconClose' property")){
					arrowIconClose = value;
				}
			}
		},
		arrowIconOpen:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'arrowIconOpen' property")){
					arrowIconOpen = value;
				}
			}
		},
	})
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom radio builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	var RadioAfterSelectionFn=function(){}, radioDim =[], radioWrapperStyle="", radioButtonStyle="", selectedStyle = "", deselectedStyle ="", radioLabelStyle ="", groupAxis= "x", width="", mbottom="",
	mouseEffect = [];
	/************************************************************************************/
	//radioDim[a,b] a=> width of select cElement , b=> height of select cElemt
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

	function radioStyleSheet(){
		if (document.querySelector("style[data-id='v"+vWrapper+"']") == null){
			(groupAxis == "x" | "X")?width="auto":width="100%";
			(groupAxis == "x" | "X")?mbottom="auto":mbottom="5px";

		 	var css = styles["radioFormComponent"].replace(/shell/g, vWrapper);
			css += "."+vWrapper + " {width:"+width+"; margin-bottom:"+mbottom+"}";
			css +=  "."+vWrapper + " .vRadioButton {width:"+radioDim[0]+";height:"+radioDim[1]+";}";
			css +=  "."+vWrapper + " .label {height:"+radioDim[1]+"; line-height:"+radioDim[1]+";}";
			css +=  "."+vWrapper + " .deselected:hover::before{"+mouseEffect[0]+";}";
			css +=  "."+vWrapper + " .deselected:active::before{"+mouseEffect[1]+";}";

			var styleElement = document.createElement("style");

			if(selectedStyle != ""){
				css +=  "."+vWrapper + " .selected::before {"+selectedStyle+"}";
			}
			if(deselectedStyle != ""){
				css +=  "."+vWrapper + " .deselected::before{"+deselectedStyle+"}";
			}
			attachStyleSheet("v"+vWrapper, css)
		}
	}
	function selectRadioButton(e, RadioElement){
		var radioParent = RadioElement.parentNode;
		//Find previous selected
		var previousSelected = radioParent.querySelector("."+vWrapper+" .vRadioButton[data-selected='1']");


		if(previousSelected != null){//has a selection
			var mainpreviousSelected = radioParent.querySelector("."+vWrapper+" .vRadioButton[data-selected='1']").parentNode.nextElementSibling;
			var customPreviousSelected = e.target.parentNode.querySelector(".selected");

			//unset previous
			//custom
			previousSelected.setAttribute("data-selected","0");
			// previousSelected.classList.add("deselected");
			previousSelected.classList.remove("selected");
			previousSelected.classList.add("deselected");

			//main
			previousSelected.parentNode.nextElementSibling.checked = false;

			//set current
			if (e.target.classList.contains("label") == false){
				//custom
				e.target.setAttribute("data-selected","1");
				e.target.classList.add("selected");
				e.target.classList.remove("deselected");
			}else{
				//custom
				e.target.previousElementSibling.setAttribute("data-selected","1");
				e.target.previousElementSibling.classList.add("selected");
				e.target.previousElementSibling.classList.remove("deselected");
			}
			//main
			e.target.parentNode.nextElementSibling.checked = true;
		}else{//has no selection

			//set current
			if (e.target.classList.contains("label") == false){
				//custom
				e.target.setAttribute("data-selected","1");
				e.target.classList.add("selected");
				e.target.classList.remove("deselected");

			}else{
				//custom
				e.target.previousElementSibling.setAttribute("data-selected","1");
				e.target.previousElementSibling.classList.add("selected");
				e.target.previousElementSibling.classList.remove("deselected");
			}
			//main
			e.target.parentNode.nextElementSibling.checked = true;
		}
	}
	function reCreateRadio (RadioElement){
		var radioWrapper = document.createElement("DIV");
		var radioButton = document.createElement("DIV");
		var radioLabel = document.createElement("DIV");
		var mainRadioLabel = RadioElement.nextElementSibling;
		//radioButton Wrapper
		radioWrapper.setAttribute("class", vWrapper);

		//Radio button
		radioButton.setAttribute("tabindex", "0");
		if(RadioElement.checked == true){
			radioButton.setAttribute("class", "vRadioButton selected");
			radioButton.setAttribute("data-selected", "1");
		}else{
			radioButton.setAttribute("class", "vRadioButton deselected");
			radioButton.setAttribute("data-selected", "0");
		}
		radioButton.setAttribute("id", RadioElement.getAttribute("id"));
		radioButton.setAttribute("value", RadioElement.getAttribute("value"));
		radioButton.setAttribute("name", RadioElement.getAttribute("name"));


		//Radio Label
		radioLabel.setAttribute("class", "label");
		radioLabel.setAttribute("data-for", mainRadioLabel.getAttribute("for"));
	  // main label content
		var content = mainRadioLabel.innerHTML;
		radioLabel.appendChild(document.createTextNode(content));


		if(radioWrapperStyle != ""){
			radioWrapper.setAttribute("style", radioWrapperStyle);
		}

		if(radioButtonStyle != ""){
			radioButton.setAttribute("style", radioButtonStyle);
		}

		if(radioLabelStyle != ""){
			radioLabel.setAttribute("style", radioLabelStyle);
		}

		radioWrapper.appendChild(radioButton);
		radioWrapper.appendChild(radioLabel);

		//Add wrapper before target select;
		var radioParent = RadioElement.parentNode;
		radioParent.insertBefore(radioWrapper, RadioElement);


		//Hide main radio element
		RadioElement.style["display"] = "none";

		//Hide main radio label
		RadioElement.parentNode.querySelector("label[for='"+RadioElement.getAttribute("id")+"']").style["display"] = "none";
	}
	function assignRadioEventHanler(RadioElement){
			var radioParent = RadioElement.parentNode;
			radioParent.addEventListener("click", function(e){
				if(e.target.nodeName == "DIV" && e.target.getAttribute("id") == RadioElement.getAttribute("id")){
					selectRadioButton(e, RadioElement);
				}else if (e.target.nodeName == "DIV" && e.target.classList.contains("label") && e.target.getAttribute("data-for") == RadioElement.getAttribute("id")){
					selectRadioButton(e, RadioElement);
				}
			}, false);
	}
	this.radio = {
		build: function(RadioElement){
			validateElement(RadioElement, "An input element needed as argument for the 'build' method, non provided");
			if(RadioElement.nodeName != "INPUT" && RadioElement.getAttribute("type") != "radio"){
				throw new Error("A radio input element needed, please specify a valid radio input element");
			}
			if (radioDim.length == 0){
				throw new Error("Setup imcomplete: radio component dimension needed, specify using the 'radioButtonSize' property");
			}
			var existingSheet = document.querySelector("#v"+vWrapper);
			existingSheet == null?radioStyleSheet():null;
			reCreateRadio(RadioElement);
			assignRadioEventHanler(RadioElement);
		},
		config:{}
	}
	Object.defineProperty(this, "radio", {
		writable:false
	});
	Object.defineProperties(this.radio, {
		build:{writable:false},
		config:{writable:false}
	})
	Object.defineProperties(this.radio.config, {
		afterSelectionFn : {//Function to call after selection
			set:function(value){
				if(validateFunction(value, "Function needed as value for the 'afterSelectionFn' property")){
					RadioAfterSelectionFn = value;
				}
			}
		},
		radioButtonSize:{
			set:function(value){
				var temp = "'config.radioButtonSize' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "dimension", temp+"of strings CSS dimensions");
				radioDim = value;
			}
		},
		wrapperStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")){
					radioWrapperStyle = value;
				}
			}
		},
		radioButtonStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'radioButtonStyle' property")){
					radioButtonStyle = value;
				}
			}
		},
		selectedStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedStyle' property")){
					selectedStyle = value;
				}
			}
		},
		deselectedStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedStyle' property")){
					deselectedStyle = value;
				}
			}
		},
		groupAxis:{
			set:function(value){
				if(validateString(value, "A string value needed for the 'groupAxis' property")){
					if(value.toLowerCase() == "x" || "y"){
						var existingSheet = document.querySelector("#v"+vWrapper);
						if(existingSheet == null){
							groupAxis = value;
						}else{
							var allRadiosButtons = document.querySelectorAll("."+vWrapper);
							if(value.toLowerCase() == "x"){
								var cssObj = {
									width:"auto",
									marginBottom:"auto"
								}
								cssGroupStyler(allRadiosButtons, cssObj);
							}else{
								var cssObj = {
									width:"100%",
									marginBottom:"5px"
								}
								cssGroupStyler(allRadiosButtons, cssObj);
							}
						}
					}else {
						throw new Error("String value can either be 'x' or 'y' (Case insensitive)");
					}
				}
			}
		},
		labelStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'labelStyle' property")){
					radioLabelStyle = value;
				}
			}
		},
		mouseEffectStyle:{
			set:function(value){
				var temp = "'config.mouseEffectStyle' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "string", temp+" of strings");
				mouseEffect = value;
			}
		},
	})
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom checkBox builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	var CheckBoxAfterSelectionFn=null, checkBoxDim =[], checkBoxWrapperStyle="", checkBoxStyle="", checkedStyle = "", uncheckedStyle ="", checkBoxLabelStyle ="", groupAxis= "x", width="", mbottom="",
	mouseEffect = [], thisCheckBox=null;
	/************************************************************************************/
	//checkBoxDim[a,b] a=> width of checkbox cElement , b=> height of checkbox cElemt
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

	function checkBoxStyleSheet(){
		if (document.querySelector("style[data-id='v"+vWrapper+"']") == null){
			(groupAxis == "x" | "X")?width="auto":width="100%";
			(groupAxis == "x" | "X")?mbottom="auto":mbottom="5px";

			var css = styles["checkBoxFormComponent"].replace(/shell/g, vWrapper);
			css += "."+vWrapper + " {width:"+width+"; margin-bottom:"+mbottom+"}";
			css +=  "."+vWrapper + " .vcheckBox {width:"+checkBoxDim[0]+"; height:"+checkBoxDim[1]+";}";
			css +=  "."+vWrapper + " .vcheckBox::before {line-height:"+checkBoxDim[1]+";}";
			css +=  "."+vWrapper + " .label {height:"+checkBoxDim[1]+"; line-height:"+checkBoxDim[1]+";}";
			css +=  "."+vWrapper + " .vcheckBox[data-checked='0']:hover{"+mouseEffect[0]+";}";
			css +=  "."+vWrapper + " .vcheckBox[data-checked='0']:active{"+mouseEffect[1]+";}";

			var styleElement = document.createElement("style");

			if(checkedStyle != ""){
				css +=  "."+vWrapper + " .checked::before {"+checkedStyle+"}";
			}
			if(uncheckedStyle != ""){
				css +=  "."+vWrapper + " .unchecked::before{"+uncheckedStyle+"}";
			}
			attachStyleSheet("v"+vWrapper, css)
		}
	}
	function checkCheckBox(e){
		var maincheckedButton = e.target.parentNode.nextElementSibling;
		thisCheckBox = maincheckedButton;
		if(e.target.classList.contains("label") == false){//custom checkBox
			if(e.target.getAttribute("data-checked") == "0"){//unchecked
				e.target.setAttribute("data-checked","1");
				e.target.classList.add("checked");
				e.target.classList.remove("unchecked");
				maincheckedButton.checked = true;
			}else{//checked
				e.target.setAttribute("data-checked","0");
				e.target.classList.remove("checked");
				e.target.classList.add("unchecked");
				maincheckedButton.checked = false;
			}
		}else {//custom checkbox label
			var customCheckBox = e.target.previousElementSibling;
			if(customCheckBox.getAttribute("data-checked") == "0"){//unchecked
				customCheckBox.setAttribute("data-checked","1");
				customCheckBox.classList.add("checked");
				customCheckBox.classList.remove("unchecked");
				maincheckedButton.checked = true;
			}else{//checked
				customCheckBox.setAttribute("data-checked","0");
				customCheckBox.classList.remove("checked");
				customCheckBox.classList.add("unchecked");
				maincheckedButton.checked = false;
			}
		}
		CheckBoxAfterSelectionFn == null?null:CheckBoxAfterSelectionFn();
	}
	function reCreateCheckBox (CheckBoxElement){
		var checkBoxWrapper = document.createElement("DIV");
		var checkBox = document.createElement("DIV");
		var checkBoxLabel = document.createElement("DIV");
		var mainCheckBoxLabel = CheckBoxElement.nextElementSibling;
		//checkBox Wrapper
		checkBoxWrapper.setAttribute("class", vWrapper);

		//Radio button
		checkBox.setAttribute("tabindex", "0");
		if(CheckBoxElement.checked == true){
			checkBox.setAttribute("class", "vcheckBox checked");
			checkBox.setAttribute("data-checked", "1");
		}else{
			checkBox.setAttribute("class", "vcheckBox unchecked");
			checkBox.setAttribute("data-checked", "0");
		}
		checkBox.setAttribute("id", CheckBoxElement.getAttribute("id"));
		checkBox.setAttribute("value", CheckBoxElement.getAttribute("value"));
		checkBox.setAttribute("name", CheckBoxElement.getAttribute("name"));


		//Radio Label
		checkBoxLabel.setAttribute("class", "label");
		checkBoxLabel.setAttribute("data-for", mainCheckBoxLabel.getAttribute("for"));
	  // main label content
		var content = mainCheckBoxLabel.innerHTML;
		checkBoxLabel.appendChild(document.createTextNode(content));


		if(checkBoxWrapperStyle != ""){
			checkBoxWrapper.setAttribute("style", checkBoxWrapperStyle);
		}

		if(checkBoxStyle != ""){
			checkBox.setAttribute("style", checkBoxStyle);
		}

		if(checkBoxLabelStyle != ""){
			checkBoxLabel.setAttribute("style", checkBoxLabelStyle);
		}

		checkBoxWrapper.appendChild(checkBox);
		checkBoxWrapper.appendChild(checkBoxLabel);

		//Add wrapper before target select;
		var checkBoxParent = CheckBoxElement.parentNode;
		checkBoxParent.insertBefore(checkBoxWrapper, CheckBoxElement);


		//Hide main radio element
		CheckBoxElement.style["display"] = "none";

		//Hide main radio label
		CheckBoxElement.parentNode.querySelector("label[for='"+CheckBoxElement.getAttribute("id")+"']").style["display"] = "none";
	}
	function assignCheckBoxEventHanler(CheckBoxElement){
			var checkBoxParent = CheckBoxElement.parentNode;
			checkBoxParent.addEventListener("click", function(e){
				if(e.target.nodeName == "DIV" && e.target.getAttribute("id") == CheckBoxElement.getAttribute("id")){
					checkCheckBox(e);
				}else if (e.target.nodeName == "DIV" && e.target.classList.contains("label") && e.target.getAttribute("data-for") == CheckBoxElement.getAttribute("id")){
					checkCheckBox(e);
				}
			}, false);
	}
	this.checkBox = {
		build: function(CheckBoxElement){
			validateElement(CheckBoxElement, "An input element needed as argument for the 'build' method, non provided");
			if(CheckBoxElement.nodeName != "INPUT" && CheckBoxElement.getAttribute("type") != "checkbox"){
				throw new Error("A checkBox input element needed, please specify a valid checkBox input element");
			}
			if (checkBoxDim.length == 0){
				throw new Error("Setup imcomplete: checkBox component dimension needed, specify using the 'checkBoxDimension' property");
			}
			var existingSheet = document.querySelector("#v"+vWrapper);
			existingSheet == null?checkBoxStyleSheet():null;
			reCreateCheckBox(CheckBoxElement);
			assignCheckBoxEventHanler(CheckBoxElement);
		},
		config:{},
		target:{}
	}
	Object.defineProperty(this, "checkBox", {
		writable:false
	});
	Object.defineProperties(this.checkBox, {
		build:{writable:false},
		config:{writable:false},
		thisCheckBox:{writable:false},
		target:{
			get:function(){
				return thisCheckBox;
			}
		}
	})
	Object.defineProperties(this.checkBox.config, {
		afterSelectionFn : {//Function to call after selection
			set:function(value){
				validateFunction(value, "Function needed as value for the 'afterSelectionFn' property");
				CheckBoxAfterSelectionFn = value;
			}
		},
		checkBoxSize:{
			set:function(value){
				var temp = "'config.checkBoxSize' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "dimension", temp+" of strings CSS dimensions");
				checkBoxDim = value;
			}
		},
		wrapperStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property");
				checkBoxWrapperStyle = value;
			}
		},
		checkBoxStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS styles needed for the 'checkBoxStyle' property");
				checkBoxStyle = value;
			}
		},
		checkedStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'checkedStyle' property");
				checkedStyle = value;
			}
		},
		uncheckedStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) value needed for the 'uncheckedStyle' property");
				uncheckedStyle = value;
			}
		},
		groupAxis:{
			set:function(value){
				validateString(value, "A string value needed for the 'groupAxis' property");
				if(value.toLowerCase() == "x" || "y"){
					var existingSheet = document.querySelector("#v"+vWrapper);
					if(existingSheet == null){
						groupAxis = value;
					}else{
						var allCheckBoxes = document.querySelectorAll("."+vWrapper);
						if(value.toLowerCase() == "x"){
							var cssObj = {
								width:"auto",
								marginBottom:"auto"
							}
							cssGroupStyler(allCheckBoxes, cssObj);
						}else{
							var cssObj = {
								width:"100%",
								marginBottom:"5px"
							}
							cssGroupStyler(allCheckBoxes, cssObj);
						}
					}
				}else {
					throw new Error("String value can either be 'x' or 'y' (Case insensitive)");
				}

			}
		},
		labelStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'labelStyle' property");
				checkBoxLabelStyle = value;
			}
		},
		mouseEffectStyle:{
			set:function(value){
				var temp = "'config.mouseEffectStyle' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "string", temp+" of strings");
				mouseEffect = value;
			}
		}
	})
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}
/****************************************************************/

/************************Form validator**************************/
function formValidator(form=null){
	form != null?validateElement(form, "'config.form' property must be an element"):null;
	var bottomConStyle ="", initialized=false, leftConStyle="", rightConStyle="", placeholderClass="", inputWrapperClass="", self=this;
	var errorLog = {}, logStatus=null, n=0, selectedProgressType="rotate", customAnimate=null, progressIndicatorStyle=null, formSubmitted=false, smallView=866, screenMode= "large";
	var progressType = {
				rotate:["@keyframes vRotate{from{transform:rotate(0deg) translateY(-50%) translateX(-50%);} to{transform:rotate(360deg) translateY(-50%) translateX(-50%);}}", "vRotate"]
			};
	var modal=null;
	var controller=null;

	//Create Element
	function createMessageCon(messageConElement, messageType, location, message, inputVisualFields=null, customStyles=null){
		//customStyles[a,b] : a=> bottom message box style, b=> left or right message box style

		if(location == "left" || location == "right"){
			if(innerWidth < smallView){
				location = "bottom";
			}
		}
		//Validations
		if (inputVisualFields != null){
			var temp = "'write()' method argument 5 must be an array";
			validateArray(inputVisualFields, temp);
			if (inputVisualFields.length == 1){
				validateElement(inputVisualFields[0], "'write()' method argument 5 array element 1 must be a valid HTML element");
			}else if(inputVisualFields.length == 2){
				//1st element
				if(inputVisualFields[0] != null){
					validateElement(inputVisualFields[0], "write()' method argument 5 array element 1 must be a valid HTML element");
				}
				//2nd element placeholder element
				if (inputVisualFields[1] != null){
					validateElement(inputVisualFields[1], "'write()' method argument 5 array element 2 must be a valid HTML element");
				}
			}else if(inputVisualFields.length == 3){
				//1st element
				if(inputVisualFields[0] != null){
					validateElement(inputVisualFields[0], "write()' method argument 5 array element 1 must be a valid HTML element");
				}

				//2nd element placeholder element
				if (inputVisualFields[1] != null){
					validateElement(inputVisualFields[1], "write()' method argument 5 array element 2 must be a valid HTML element");
				}

				//3rd element
				validateString(inputVisualFields[2], "write()' method argument 5 array element 3 must be a string of valid CSS left or right property style");
			}
		}

		if (customStyles != null){
			validateArray(customStyles, "'write()' method argument 6 must be an array");
			if(customStyles.length > 2){
				throw new Error("'write()' method argument 6 array element cannot be more than 2 elements");
			}
			customStyles[0] != null?validateString(customStyles[0], "'write()' method argument 6 array element 1 must be a string which specify the CSS style for bottom message display"):null;
			customStyles[1] != null?validateString(customStyles[1], "'write()' method argument 6 array element 2 must be a string which specify the CSS style for left or right message display"):null;
		}

		//__________________________//
		//create log status
		if(messageConElement.getAttribute("data-logStatus") == null){
			messageConElement.setAttribute("data-logStatus", "1");
			messageConElement.setAttribute("data-fieldId", "f"+(n+1));
			n++;
		}
		var checkExistence = messageConElement.querySelector(".vMsgBox");
		function createMsgBox(){
			hideProgress();
			screenMode == "large"?messageConElement.setAttribute("data-vp", "large"):messageConElement.setAttribute("data-vp", "small");
			//Fix left and right
			var messageBoxWrapper = document.createElement("DIV");
			function styleLeft(){

				if(leftConStyle != ""){
					if(inputVisualFields != null && inputVisualFields.length == 3){
						messageBoxWrapper.setAttribute("style", leftConStyle+"; "+inputVisualFields[2]);
					}else {

						messageBoxWrapper.setAttribute("style", leftConStyle);
					}
				}else{
					if(inputVisualFields != null && inputVisualFields.length == 3){
						messageBoxWrapper.setAttribute("style", inputVisualFields[2]);
					}
				}
			}
			function styleRight(){
				if(rightConStyle != ""){
					if( inputVisualFields != null && inputVisualFields.length == 3){
						messageBoxWrapper.setAttribute("style", rightConStyle+"; "+inputVisualFields[2]);
					}else {
						messageBoxWrapper.setAttribute("style", rightConStyle);
					}
				}else{
					if( inputVisualFields != null && inputVisualFields.length == 3){
						messageBoxWrapper.setAttribute("style", inputVisualFields[2]);
					}
				}
			}
			function styleBottom(){
				if(bottomConStyle != ""){
					messageBoxWrapper.setAttribute("style", bottomConStyle);
				}
			}

			if(location == "left"){
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft error le");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft warning lw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft success ls");
				}
				//styleLeft
				styleLeft();
			}else if (location == "right") {
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight error re");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight warning rw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight success rs");
				}
				//styleRight
				styleRight();
			}else if (location == "bottom") {
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom error be");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom warning bw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom success bs");
				}
				//StyleBottom
				styleBottom();
			}

			messageBoxWrapper.appendChild(document.createTextNode(message));
			messageConElement.appendChild(messageBoxWrapper);
			messageConElement.style["color"] = "transparent";

			//Log error
			errorLog[messageConElement.getAttribute("data-fieldId")] = 1;

			if (location == "left"){
				var m = messageConElement.querySelector(".vLeft");
				sendBehind(m, location, 15, customStyles);
			}else if (location == "right") {
			 	var m = messageConElement.querySelector(".vRight");
				sendBehind(m, location, 15, customStyles);
			}else if (location == "bottom") {
				var	m = messageConElement.querySelector(".vBottom");
				drop(m);
			}
		}
		function updateMsgBox(){
			if(location == "left" || location == "right" ){
				checkExistence.style["white-space"] = "nowrap";
				checkExistence.style["line-height"] = "250%";
				checkExistence.style["width"] = "auto";
				checkExistence.style["text-align"] = "left";
				checkExistence.style["height"] = "auto";
				checkExistence.style["min-height"] = DOMelement.cssStyle(checkExistence, "height");
				if (customStyles != null){
					var m = null;
					location == "left"?m = messageConElement.querySelector(".vLeft"):m = messageConElement.querySelector(".vRight");;
					if(customStyles[1] != null || customStyles[1] != undefined ){
						var currentStyle = m.getAttribute("style");
						m.setAttribute("style", currentStyle+ customStyles[1]);
					}
				}
			}
			checkExistence.innerHTML = message;
			//Log error
			errorLog[messageConElement.getAttribute("data-fieldId")] = 1;
		}
		if (checkExistence == null){
			createMsgBox();
		}else{
			if(screenMode != messageConElement.getAttribute("data-vp")){
				var currentMsg = messageConElement.querySelector(".vMsgBox");
				messageConElement.removeChild(currentMsg);
				createMsgBox();
			}else{
				updateMsgBox();
			}
		}
		if(messageType == "error"){
			if (inputVisualFields == null){
				if (inputWrapperClass != ""){
					var inputWrapper = messageConElement.querySelector("."+inputWrapperClass);
					if(inputWrapper != null){
						inputWrapper.classList.add("ierror");
					}
				}
				if (placeholderClass != ""){
					var placeholder = messageConElement.querySelector("."+placeholderClass);
					if(placeholder != null){
						placeholder.classList.add("lerror");
					}
				}
			}else{
				if(inputVisualFields[0] != null){
					inputVisualFields[0].classList.add("ierror");
				}
				if(inputVisualFields[1] != null){
					var placeholder = inputVisualFields[1];
					placeholder.classList.add("lerror");
				}
			}
		}
	}

	function clearMessage(messageConElement, inputVisualFields){
			var location = "", fieldId=null;
			var Vbox = messageConElement.querySelector(".vMsgBox");
			if(Vbox != null){
				if(Vbox.classList.contains("vRight")){
					location = "right";
				}else if (Vbox.classList.contains("vLeft")) {
					location = "left";
				}else if (Vbox.classList.contains("vBottom")) {
					location = "bottom";
				}
				if (inputVisualFields != null){
					var temp = "'clear()' method argument 2 must be an array";
					validateArray(inputVisualFields, temp);
					validateArrayLength(inputVisualFields, 2, temp+" of 2 Elements");
					validateElement(inputVisualFields[0], "'clear()' method argument 2 array element 1 must be a valid HTML element");
					if (inputVisualFields[1] != null){
						validateElement(inputVisualFields[1], "'clear()' method argument 2 array element 2 must be a valid HTML element");
					}
				};

				var checkExistence = messageConElement.querySelector(".vMsgBox");
				if (checkExistence != null){

					if(location  == "left" || location  == "right"){
						if (checkExistence.classList.contains("vRight") || checkExistence.classList.contains("vLeft")){
							checkExistence.style["width"] = checkExistence.scrollWidth+"px";
							checkExistence.scrollWidth;
							checkExistence.classList.add("clear");
							checkExistence.style["color"] = "transparent";
							checkExistence.style["width"] = "0";

							//Clear error log
							fieldId =  messageConElement.getAttribute("data-fieldId");
							delete errorLog[fieldId];
						}else{
							throw new Error("No left or right message found to clear, recheck 'clear()' method argument 2");
						}
					}else if (location  == "bottom") {
						if (checkExistence.classList.contains("vBottom")){
							checkExistence.classList.add("clear");
							checkExistence.style["color"] = "transparent";
							checkExistence.style["height"] = "0";

							//Clear error log
							fieldId =  messageConElement.getAttribute("data-fieldId");
							delete errorLog[fieldId];
						}else{
							throw new Error("No bottom message found to clear, recheck 'clear()' method argument 2");
						}
					}

					if (inputVisualFields == null){
						if (inputWrapperClass != ""){
							var inputWrapper = messageConElement.querySelector("."+inputWrapperClass);
							if(inputWrapper != null){
								inputWrapper.classList.remove("ierror");
							}
						}
						if (placeholderClass != ""){
							var placeholder = messageConElement.querySelector("."+placeholderClass);
							if(placeholder != null){
								placeholder.classList.remove("lerror");
							}
						}
					}else{
						inputVisualFields[0].classList.remove("ierror");
						if(inputVisualFields[1] != null){
							inputVisualFields[1].classList.remove("lerror");
						}
					}
				}
			}
	}

	//Attach event handler
	function addEventhandler(){
		document.body.addEventListener("transitionend", function(e){
			if(e.target.classList.contains("vMsgBox") && e.target.classList.contains("error") && e.target.classList.contains("clear") == false){
				e.target.style["color"] = "red";
			}else if(e.target.classList.contains("vMsgBox") && e.target.classList.contains("warning") && e.target.classList.contains("clear") == false){
				e.target.style["color"] = "#e97514";
			}else if(e.target.classList.contains("vMsgBox") && e.target.classList.contains("success") && e.target.classList.contains("clear") == false){
				e.target.style["color"] = "#2b9030";
			}else	if (e.target.classList.contains("vMsgBox")  && e.target.classList.contains("clear")){
				var parent = e.target.parentNode;
				parent != null?e.target.parentNode.removeChild(e.target):null;
			}
		});
		window.addEventListener("resize", function(){
			innerWidth < smallView?screenMode = "small":screenMode="large";
		},false);
		form.addEventListener("click", function(e){
			if(e.target.getAttribute("data-rs") == "suc" && e.target.getAttribute("id") == "fbBtn"){
				hideProgress();
				modal!=null?modal.close():null;
			}else if(e.target.getAttribute("data-rs") != "suc" && e.target.getAttribute("id") == "fbBtn"){
				hideProgress();
			}
		}, false);
	}

	function showProgress(){
		var loader = form.querySelector(".vFormOverlay");
		loader.classList.add("vFormOverlayShow");
	}
	function hideProgress(){
		var loader = form.querySelector(".vFormOverlay");
		loader.classList.remove("vFormOverlayShow");
	}

	function InIError(methodName){
		throw new Error("To use the '"+methodName+"()' method, initialization must be done. Initialize using the 'initialize()' method");
	}
	//create style styleSheet
	function setStyleSheet(){
		if (document.querySelector("style[data-id='formValidatorStyles']") == null){
			var css = "";
			if (selectedProgressType != "custom"){
				css += progressType[selectedProgressType][0];
				css += " .vFormLoader {animation-name:"+progressType[selectedProgressType][1]+";}";
				progressIndicatorStyle != null? css += " .vFormLoader::before {"+progressIndicatorStyle+"}":null;
			}else {
				css +=  customAnimate[0]; //@keframe
				css +=  ".vFormLoader {"+customAnimate[1]+"}"; //loader style
				css += " .vFormLoader ::before{"+customAnimate[2]+"}"; // icon style
			}
			attachStyleSheet("formValidatorStyles", css)
		}
	}

	//For right and left display
	function sendBehind(element, direction, offset, customStyles){
		var width = element.scrollWidth;
		if(direction == "left"){
			element.style["right"] = "calc(100% + "+offset+"px)";
		}else if (direction == "right") {
			element.style["left"] = "calc(100% + "+offset+"px)";
		}

		element.style["width"] = "0px";
		element.scrollWidth;
		if(customStyles != null){
			if(customStyles[1] != null || customStyles[1] != undefined ){
				var currentStyle = element.getAttribute("style");
				element.setAttribute("style", currentStyle+ customStyles[1]);
			}
		}
		element.style["width"] = width+"px";

	}

	//For bottom display
	function drop(element){
			var height = element.scrollHeight;
			element.style["height"] = "0px";
			element.scrollHeight;
			element.style["height"] = height+"px";
	}

	function createLoader(){
		var overLay = document.createElement("DIV");
		var loader = document.createElement("DIV");
		overLay.setAttribute("class", "vFormOverlay");
		loader.setAttribute("class", "vFormLoader");
		DOMelement.center(loader);
		overLay.appendChild(loader);
		form.appendChild(overLay);
	}

	function createFeedBack(messageType, msgTxt){
		var ui = null;
		if(messageType=="error"){
			ui = ["terr", "merr"] ;
		}else if (messageType=="warning") {
			ui = ["twrn", "mwrn"] ;
		}else if (messageType=="success") {
			ui = ["tsuc", "msuc"] ;
		}

		var con = document.createElement("DIV");
		var ttl = document.createElement("DIV");
		var msg = document.createElement("DIV");
		var btCon = document.createElement("DIV");
		var btn = document.createElement("BUTTON");

		DOMelement.center(con);
		con.setAttribute("class", "FbMsgBox");
		ttl.setAttribute("class", "ttl "+ui[0]);
		msg.setAttribute("class", "msgCon "+ui[1]);
		btCon.setAttribute("class", "buttonCon");
		btn.setAttribute("id", "fbBtn");

		ttl.appendChild(document.createTextNode("Submission Feedback"));
		msg.appendChild(document.createTextNode(msgTxt));
		if(ui[0]=="terr"){
			btn.setAttribute("data-rs", "err");
			btn.appendChild(document.createTextNode("Try again"));
		}else {
			btn.setAttribute("data-rs", "suc");
			btn.appendChild(document.createTextNode("OK"));
		}
		btCon.appendChild(btn);
		con.appendChild(ttl);
		con.appendChild(msg);
		con.appendChild(btCon);

		return con;
	}

	function showFeedBack(url, msg, type){
		if(url!=null){
			var xhr = ajax.create();
			xhr.open("POST", url, true);
			xhr.addEventListener("readystatechange", function(){
				if(xhr.readyState == 2){//sent
				}else if (xhr.readyState == 4) {//sent and received
					if(xhr.status == 200){
						form.innerHTML = xhr.responseText;
					}else {
						//Show default could not receive response but sumitted successfully
						var overlay = form.querySelector(".vFormOverlay");
						var loader = form.querySelector(".vFormLoader");
						overlay.removeChild(loader);
						overlay.appendChild(createFeedBack("warning", "Form submitted but may not be successfully"));
					}
				}
			}, false);
			xhr.send(data);
		}else {
			//show default
			var overlay = form.querySelector(".vFormOverlay");
			var loader = form.querySelector(".vFormLoader");
			loader != null?overlay.removeChild(loader):null;
			msg == null?overlay.appendChild(createFeedBack("success", "Form submitted successfully")):overlay.appendChild(createFeedBack(type, msg));
		}

	}

	/*Message*/
	this.message = {
		write: function(messageConElement, messageType, location, message, inputVisualFields=null, customStyles=null){
			//messageConElement =>  must be the container housing the input element and the placeholder element, which defines the width for them
			//(optinal) inputVisualFields [a,b,c] : a => inputWrapper, b => placeholder, c => custom top position for left|right location (e.g: [null, null, 'top:5px;']).
																							//'c' can also be messageConElement
			//(optinal) customStyles: A valid CSS styles for bottom or right or left messageBox

			if (initialized == true){
				validateElement(messageConElement, "'write' method needs a valid HTML element as argument 1");
				if(validateString(messageType, "'write' method needs a string as argument 2")){
					if(!(messageType == "success" || messageType == "error" || messageType == "warning")){
						throw new Error ("'write' method argument 2 must be string value of either: 'success', 'warning', or 'error'");
					}
				};
				if(validateString(location, "'write' method needs a string as argument 3")){
					if(!(location == "bottom" || location == "left" || location == "right")){
						throw new Error ("'write' method argument 3 must be string value of either: 'bottom', 'left', or 'right'");
					}
				};
				validateString(message, "'write' method needs a string (The message) as argument 4");

				if(inputVisualFields == null && inputWrapperClass==""){
						throw new Error("'write method'argument 5 and 'inputWrapperClass' property cannot be simultaneously emtpy, specify either 1");
				}
				if(inputVisualFields == null && placeholderClass==""){
						throw new Error("'write method'argument 5 and 'placeholderClass' property cannot be simultaneously emtpy, specify either 1");
				}
				createMessageCon(messageConElement, messageType, location, message, inputVisualFields, customStyles);
			}else{
				InIError("write");
			}
		},
		clear: function(messageConElement, inputVisualFields=null){
			//messageConElement =>  must be the container housing the input element and the placeholder element, which defines the width for them
			//inputVisualFields [a,b] : a => inputWrapper, b => placeholder, only needed if it was specified in the write method to be cleared
			if (initialized == true){
				validateElement(messageConElement, "'write' method needs a valid HTML element as argument 1");
				if(inputVisualFields == null && inputWrapperClass==""){
						throw new Error("'write method'argument 5 and 'inputWrapperClass' property cannot be simultaneously emtpy, specify either 1");
				}
				if(inputVisualFields == null && placeholderClass==""){
						throw new Error("'write method'argument 5 and 'placeholderClass' property cannot be simultaneously emtpy, specify either 1");
				}

				clearMessage(messageConElement,inputVisualFields);
			}else {
				InIError("clear");
			}
		}
	}
	/**********/

	/*Initialize*/
	this.initialize = function(){
		if (initialized == false){
			innerWidth < smallView?screenMode = "small":screenMode="large";
			if(form == null){
				throw new Error("Cannot initialize without settinig a form to perform validation on, pass target form to formValidator() contructor, to set target form")
			}
			setStyleSheet();
			createLoader();
			addEventhandler();
			initialized =true;
		}
	}
	/**********/

	/*Config*/
	this.config = {

	}
	/**********/

	/*formatter*/
	this.format = {
		toCurrency : function (inputS, seperator){
			validateNumber(inputS, "Numeric (Amount) value needed as argument 1, for 'toCurrency' method");
			if	(validateString(seperator, "A string of lenght 1 (seperator) needed as argument 2, for 'toCurrency' method'")){
				if(seperator.lenght > 2){
					throw new Error("String lenght exceeded, string length must be <= 2, for 'toCurrency' method' 2nd argument");
				}
			};
			var s = new String(inputS),	StringLen = s.length,	num = 0, start=0,	formatted = "",	points = [],	pointsRev = [],	rc =0;
			if (StringLen > 3){
				while((StringLen - 3) > 0){
					StringLen = StringLen - 3;
					points[num] = StringLen;
					num++;
				}
				var res = s.split("");
				for(var c=points.length-1;c>=0;c--){
					pointsRev[rc] = points[c];
					rc++;
				}
				for (var x = 0; x < res.length; x++){
					if(x == pointsRev[start]){
						formatted = formatted+seperator+res[x];
						start++;
					}else{
						formatted = formatted+res[x];
					}
				}
				return formatted;
			}else{
				return s;
			}
		},
		roundToDec: function (value, decimals) {
			validateNumber(value, "'roundToDec' method argument 1 must be numeric value");
			validateNumber(decimals, "'roundToDec' method argument 2 must be numeric value");
		  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
		},
		integerField:function(inputElement){
			validateElement(inputElement, "'integerField()' argument must be a valid HTML Element");
			if (inputElement.getAttribute("type" != "text")){
				throw new Error("'integerField()' argument must be an INPUT element of type 'text'");
			}
			inputElement.addEventListener("keyup", function(){
				var inputValue = sanitizeInteger(inputElement.value);
				inputElement.value = inputValue;
			}, false);
		},
		fullNameField:function(inputElement){
			validateElement(inputElement, "'fullNameField()' argument must be a valid HTML Element");
			if (inputElement.getAttribute("type" != "text")){
				throw new Error("'fullNameField()' argument must be an INPUT element of type 'text'");
			}
			inputElement.addEventListener("focusout", function(){
				var cleansed = "";
				var splitted = inputElement.value.split(" ");
				if(splitted.length > 1){
					for(var x=0; x<splitted.length;x++){
						if(splitted[x] != ""){
							if(x==0){
								cleansed += splitted[x];
							}else {
								cleansed += " "+splitted[x];
							}
						}
					}

					//Update input value with cleansed name
					inputElement.value = cleansed;
				}
			}, false);
		}
	}
  /**********/

	/*validator*/
	this.validate = {
		alpha: function(input){
			validateString(input, "'alpha()' method, argument 1 must be a string");
			var target = /[^A-Za-z\ ]+/.test(input); //checks for other characters except A-Za-z and space
			if(target==true){
				return false;
			}else {
				return true;
			}
		},
		alphaNumeric : function(input){
			validateString(input, "'emailAddress()' method, argument 1 must be a string");
			var target= /[^A-Za-z0-9]+/.test(input); //checks for other characters except A-Za-z0-9
			if(target==true){
				return false;
			}else {
				return true;
			}
		},
		emailAddress : function(email){
			validateString(email, "'emailAddress()' method, argument 1 must be a string");
			var email_filter = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,}$/.test(email);//matches email address pattern
			return email_filter;
		},
		customData:function(text, PatternArray){
			// PatternArray => Array of unwanted characters
			var status=null;
			validateString(text, "'custom()' method, argument 1 must be a string");
			var temp = "'custom()' method argument 2 must be an array";
			validateArray(PatternArray, temp);
			validateArrayMembers(PatternArray, "string", temp+" of strings");
			for(var x=0; x<PatternArray.length; x++){
				var rg = new RegExp(PatternArray[x]);
				if(rg.test(text)){//found
					status = false;
					break;
				}else {//not found
					if(x == PatternArray.length-1){
						status = true;
					}
				}
			}
			return status;
		},
		integer:function(n){
			return Number(n) === n && n % 1 === 0;
		},
		float:function(n){
			return Number(n) === n && n % 1 !== 0;
		},
		fullName:function(value){
			//Return values
				// 2=> incomplete names
				// 3=> All names must be alphabets
				// 4=> Name cannot be less than 2 characters

			var returnType=null, cleanedName=[], n=0;
			var split = value.split(" ");
			//clean name
			var tn = split.length;
			if(tn >= 2){
				//clean name
				for(var x = 0; x<tn; x++){
					if(split[x] != " "){
						cleanedName[cleanedName.length] = split[x];
					}
					if(x == tn-1){
						n = cleanedName.length;
					}
				}
				for(var x=0; x<tn;x++){
					//Check length
					if(split[x].length <= 1){
						returnType = 4; //Name cannot be less than 2 characters
						break;
					}

					//Check for non alpha
					if(self.validate.alpha(split[x]) == false){
						returnType = 3; //All names must be alphabets
						break;
					}

					if(x == tn-1){
						returnType = true; //All names are more than 2 characters
					}

				}
			}else {
				returnType = 2; //incomplete names
			}
			return returnType;
		},
		selectField:function(groupCollection){
			validateHTMLObject(groupCollection, "'validate.selectField()' method argument 1 must be an HTML collection");
			var status=false;

			//check for any selected
			for(var x=0;x<groupCollection.length;x++){
				if(groupCollection[x].checked){
					status==false?status = true:null;
					break;
				}
			}
			return status;
		},
		phoneNumber:function(input){
			validateString(input, "'phoneNumber()' method, argument 1 must be a string");
			var input_filter = /^(\+|[0-9])[0-9]+$/.test(input);//matches phone number pattern
			return input_filter;
		}
	}
	/**********/

	/*Form validation status*/
	this.formOk = function(){
		if(Object.keys(errorLog).length > 0){
			return false;
		}else {
			return true;
		}
	}

	/*Submit back*/
	this.submit = function(data, url, headers=null){
		if(initialized == false){
			throw new Error("'submit()' method must be called after initialization");
		}else {
			validateString(url, "'feedBack()' method argument 2 must be a string specifying the URL");
			showProgress();
			var xhr = ajax.create();
			xhr.open("POST", url, true);
			xhr.addEventListener("readystatechange", function(){
				if(xhr.readyState == 2){//sent
					formSubmitted = true;
				}else if (xhr.readyState == 4) {//sent and received
					if(xhr.status == 200){
						if(controller != null){
							controller(xhr.responseText);
						}else {
							// self.showFeedBack();
						}
					}
				}
			}, false);
			xhr.send(data);
		}
	}

	/*value getter*/
	this.getSelected = function(groupCollection){
		validateHTMLObject(groupCollection, "'validate.getSelected()' method argument 1 must be an HTML collection");
		var data=[];
		//check for any selected
		for(var x=0;x<Object.keys(groupCollection).length;x++){
			if(groupCollection[x].checked){
				data[data.length] = groupCollection[x].value;
			}
		}
		return data;
	}

	this.showFeedBack = function(feedBackUrl=null, msg=null, type=null){
		if(type.toLowerCase() != "warning" && type.toLowerCase() != "success" && type.toLowerCase() != "error"){
			console.log(type);
			throw new Error("'showFeedBack()' method argument 3 must either be: null, 'error', 'warning' or 'success'");
		}
		showFeedBack(feedBackUrl, msg, type);
	}

	Object.defineProperties(this.validate, {
		alpha:{writable:false},
		alphaNumeric:{writable:false},
		emailAddress:{writable:false},
		integer:{writable:false},
		float:{writable:false},
		fullName:{ writable:false},
		selectField:{writable:false},
		customData:{writable:false},
		phoneNumber:{writable:false}
	});
	Object.defineProperties(this.format, {
		toCurrency:{writable:false},
		roundToDec:{writable:false},
		integerField:{writable:false},
		fullNameField:{writable:false}
	});
	Object.defineProperties(this.config, {
		bottomConStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'bottomConStyle' property")
				bottomConStyle = value;
			}
		},
		leftConStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'leftConStyle' property")
				leftConStyle = value;
			}
		},
		rightConStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'rightConStyle' property")
				rightConStyle = value;
			}
		},
		placeholderClass:{
			set:function(value){
				validateString(value, "A string needed for the 'placeholderClass' property")
				var elmentTest = document.querySelector("."+value);
				if(elmentTest != null){
					placeholderClass = value;
				}else{
					throw new Error("A string representing input placeholder class name needed as value for 'placeholderClass' property");
				}
			}
		}, // Used if input placeholder is not specified in write method
		inputWrapperClass:{
			set:function(value){
				validateString(value, "A string needed for the 'inputWrapperClass' property")
				var elmentTest = document.querySelector("."+value);
				if(elmentTest != null){
					inputWrapperClass = value;
				}else{
						throw new Error("A string representing input inputWrapperClass class name needed as value for 'inputWrapperClass' property");
					}
			}
		}, ///Used if input wrapper is not specified in write method
		modal:{
			set:function(value){
				validateObject(value, "'config.modal' property must be an object");
				modal=value;
			}
		},
		feedBackController:{
			set:function (value){
				validateFunction(value, "'config.feedBackController' property value must be a function");
				controller = value;
			}
		},
		progressIndicatorStyle:{
			set:function(value){
				validateString(value, "config.progressIndicatorStyle property  must be a string of valid CSS style");
				progressIndicatorStyle = value;
			}
		},
		smallView:{
			set:function(value){
				validateNumber(value, "'config.smallView' property must be an integer");
				if(value <0 ){
					throw new Error ("'config.smallView' property must be greater than zero");
				}
				smallView = value;
			}
		}
	});
	Object.defineProperties(this.message, {
		write:{writable:false}
	});
	Object.defineProperties(this, {
		config:{write:{writable:false}},
		format:{write:{writable:false}},
		validate:{write:{writable:false}},
		message:{write:{writable:false}},
		initialize:{write:{writable:false}},
		getSelected:{write:{writable:false}},
		submit:{write:{writable:false}},
		formOk:{write:{writable:false}},
		showFeedBack:{write:{writable:false}},
		hideProgres:{
			value:function(){
				hideProgress();
			}
		}
	});
}
/****************************************************************/

/****************************Modal*******************************/
function modalDisplayer(){
	var self=this,cssWidth="",currentForm=null,id=null, effectName="none", bodyOldPosition = "", mainFormCon = "", closeButton=null, mainFormConInner="", overlayType="", colorOverlayStyle="", totalHeight=0, initialized =false, openProcessor=function(){}, closeProcessor=function(){}, modalOn=false, sY=0, sX=0, endSy=0, scrollable=false, computedModalHeight=0, computedModalWidth=0, modalHeigthBelow=0, modalHeigthAbove=0, paddingTop=50;
	var modalWidths = ["500px", "500px", "86%"], brkpoints={largeStart:1000, mediumStart:520};

	//modalWidths => [a, b, c] => a = large; b = medium; c = small
	//screenBreakPoints => [a,b] => a = largeStart ; b = mediumStart

	var effects ={
		none:function(modal){
			var newModal = document.createElement("DIV");
			newModal.setAttribute("id", "newModal");
			modalOn = true;
			var modayBody = document.querySelector(".vModal");
			var modalCon = modayBody.querySelector(".modalSpace");

			//Create and set newmodal style
			var newModalCSS = "width:"+cssWidth+"; height:"+computedModalHeight+"px;";
			newModal.setAttribute("style", newModalCSS);

			positionVertically(modalCon, computedModalHeight);
			modalCon.appendChild(newModal);

			//Call new modal
			var newM = modalCon.querySelector("#newModal");

			newM.innerHTML = modal.outerHTML;

			//Store up main form content
			mainFormConInner = modal.innerHTML;

			var RecallOld = newM.querySelector("#"+modal.id);
			RecallOld.style["display"] = "block";

			//Tag old for resseting purpose
			modal.setAttribute("class", "vOld");
			modal.setAttribute("id", "vOld");
			modal.innerHTML = "";

			modayBody.classList.add("show");
		},
		split:function(modal){
			var newModal = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");
			var leftEle = document.createElement("DIV");
			var rightEle = document.createElement("DIV");
			//left style
			var lcss = "position:absolute;left:-200%; top:0; transition:left .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:"+computedModalHeight+"px; overflow:hidden;";
			var rcss = "position:absolute;right:-200%; top:0; transition:right .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:"+computedModalHeight+"px; overflow:hidden;";

			//EffectsCons attributes
			effectsCon.setAttribute("style", "position:relative; width:"+computedModalWidth+"px; height:"+computedModalHeight+"px;");
			effectsCon.setAttribute("id", "effectsCon");
			effectsCon.setAttribute("class", "trans_in split");

			//left and right style attribute
			leftEle.setAttribute("id", "eleft");
			leftEle.setAttribute("style", lcss);
			leftEle.setAttribute("class", "effectE");
			rightEle.setAttribute("style", rcss);
			rightEle.setAttribute("id", "eright");
			rightEle.setAttribute("class", "effectE");

			newModal.setAttribute("id", "newModal");

			modalOn = true;
			var modayBody = document.querySelector(".vModal");
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
			modal.setAttribute("class", "vOld");
			modal.setAttribute("id", "vOld");
			modal.innerHTML = "";

			modayBody.classList.add("show");
			leftE.scrollWidth;
			rightE.scrollWidth;
			leftE.style["left"] = "0%";
			rightE.style["right"] = "0%";
		},
		flip: function(modal){
			var newModal = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");
			var flipper = document.createElement("DIV");
			var flipperBGElement = document.createElement("DIV");
			var flipperFormElement = document.createElement("DIV");

			var mainFormBg = DOMelement.cssStyle(modal, "background-color");

			//Create Style for flipper
			var flipperCSS = "transition:transform .6s linear 0s; width:100%; height:100%; transform-style:preserve-3d; backface-visibilty: hidden; transform:rotateX(0deg); ";

			//flipperBGElement styles
			flipperBGElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:2; background-color:"+mainFormBg+";");
			flipperBGElement.setAttribute("id", "fBG");
			//flipperFormElement styles and other attributes
			flipperFormElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:1; transform:rotateX(-180deg);");
			flipperFormElement.setAttribute("id", "flpform");
			//Set attribute for effectsCon
			effectsCon.setAttribute("style", "position:relative; width:"+computedModalWidth+"px; height:"+computedModalHeight+"px; perspective: 4000px;");
			effectsCon.setAttribute("id", "effectsCon");
			effectsCon.setAttribute("class", "trans_in flip");

			//Set attributes for flipper
			flipper.setAttribute("id", "flipper");
			flipper.setAttribute("style", flipperCSS);


			//Set attribute for newModal
			newModal.setAttribute("id", "newModal");

			modalOn = true;
			var modayBody = document.querySelector(".vModal");
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
			modal.setAttribute("class", "vOld");
			modal.setAttribute("id", "vOld");
			modal.innerHTML = "";

			modayBody.classList.add("show");

			flipperEffectBox.scrollHeight;
			flipperEffectBox.style["transform"] = "rotateX(180deg)";
		},
		box: function(modal){
			var newModal = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");
			var box = document.createElement("DIV");

			//Set attribute for effectsCon
			effectsCon.setAttribute("style", "position:relative; width:"+computedModalWidth+"px; height:"+computedModalHeight+"px;");
			effectsCon.setAttribute("id", "effectsCon");
			effectsCon.setAttribute("class", "trans_in box");

			//Create Style and attributes for Box
			var boxCSS = "position:absolute; transition:all .3s linear 0s; width:0%; height:0%; top:50%; left:50%; transform:translateX(-50%) translateY(-50%); overflow:hidden";
			box.setAttribute("style", boxCSS);
			box.setAttribute("id", "Boxform");

			//Set attribute for newModal
			newModal.setAttribute("id", "newModal");

			modalOn = true;
			var modayBody = document.querySelector(".vModal");
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
			modal.setAttribute("class", "vOld");
			modal.setAttribute("id", "vOld");
			modal.innerHTML = "";

			modayBody.classList.add("show");
			BoxFormE.scrollHeight;
			BoxFormE.style["width"] = "100%";
			BoxFormE.style["height"] = "100%";
		}
	};
	var closeEffect ={
		none:function(oldModal, currentModal){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");
			var recallCurrent = document.querySelector(".vModal .modalSpace #newModal");
			resetOldModalProperties(oldModal, currentModal);
			modalCon.removeAttribute("style");

			modalCon.removeChild(recallCurrent);
			modalBody.classList.remove("show");
			modalOn=false;
			scrollable=false;
			document.body.style["position"] = bodyOldPosition;
			document.body.style["top"] = "0";
			scrollTo(0, sY);
			closeProcessor();
		},
		split:function(oldModal, currentModal){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");
			var recallCurrent = document.querySelector(".vModal .modalSpace #newModal");
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
		flip:function(oldModal, currentModal){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");
			var recallCurrent = document.querySelector(".vModal .modalSpace #newModal");
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
		box:function(oldModal, currentModal){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");
			var recallCurrent = document.querySelector(".vModal .modalSpace #newModal");
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
	function positionVertically(modal, height){
		var browserHeight = window.innerHeight;
		var diff = browserHeight - height;
		sX= window.scrollX;
		sY = window.scrollY;
		modalHeigthBelow = ((paddingTop*2)+computedModalHeight)-window.innerHeight;
		if (diff < 100){
			scrollable =true;
			var heightBelow = verticalScroll.query(parseInt(DOMelement.cssStyle(document.querySelector("html"), "height"), "px"))["remainingHeightBelow"];
			if (heightBelow >= modalHeigthBelow){
				modal.style["top"] = "50px";
				modal.style["padding-bottom"] = "50px";
				modal.style["transform"] = "translateY(0%) translateX(-50%)";
			}else{
				modalHeigthAbove = ((paddingTop*2)+computedModalHeight)-window.innerHeight;
				if(modalHeigthAbove > 0){
					modal.style["top"] = "50"+"px";
					modal.style["padding-bottom"] = "50px";
					modal.style["transform"] = "translateY(0%) translateX(-50%)";
				}else{
					DOMelement.center(modal);
				}
			}
		}
		if (modalOn == true){
			bodyOldPosition = DOMelement.cssStyle(document.body, "position");
			document.body.style["position"] = "fixed";
			document.body.style["top"] = "-"+sY+"px";
		}
	}
	function releaseModal(e){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");

			modalCon.removeAttribute("style");
			e.target.parentNode.classList.remove("trans_out");
			modalCon.removeChild(modalCon.querySelector("#effectsCon"));
			modalBody.classList.remove("show");

			modalOn=false;
			scrollable=false;
			document.body.style["position"] = bodyOldPosition;
			document.body.style["top"] = "0";
			mainFormCon = "";
			mainFormConInner="";
			bodyOldPosition="";
			scrollTo(0, sY);
			closeProcessor();
	}
	function addEventhandler(){
		var scrollHandler = new  verticalScroll();
		var sbpoint = new ScreenBreakPoint(brkpoints);
		var mainModal = document.querySelector(".modalSpace");
		var modalWindow = document.querySelector(".vModal");
		document.body.addEventListener("keydown", function(e){
			if(modalOn == true){
				if (keyboardEventHanler(e)["handled"] == true){
					if(e.key == "Escape"){
						self.close();
					}
				}
			}
		},false);
		document.body.addEventListener("transitionend", function(e){
			if(modalOn == true){
				if(e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("split")){
					e.target.innerHTML = "";
					e.target.parentNode.style["display"] = "none";

					if(e.target.id == "eright"){
						//display main modalformCon
						var newM = document.querySelector(".vModal #newModal");
						var modalSpace = document.querySelector(".vModal .modalSpace");

						newM.style["width"] = "100%";
						newM.style["height"] = computedModalHeight+"px";
						modalSpace.style["width"] = cssWidth;
						// insert main form to new formCon and display
						newM.innerHTML = mainFormCon;
						newM.style["display"] = "block";
						newM.childNodes[0].style["display"] = "block";
						newM.childNodes[0].style["width"] = "100%";
						openProcessor();
					}
				}else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("split")) {
					if(e.target.id == "eleft"){
						releaseModal(e);
					}
				}else if (e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("flip")) {
					//Remove effect modal
					e.target.querySelector("#flpform").innerHTML = "";
					e.target.parentNode.style["display"] = "none";

					//Call new modal
					var newM = document.querySelector(".vModal #newModal");

					//insert main form to new formCon and display
					newM.innerHTML = mainFormCon;
					newM.style["display"] = "block";
					newM.style["width"] = computedModalWidth+"px";
					newM.style["height"] = computedModalHeight+"px";
					newM.childNodes[0].style["display"] = "block";
					openProcessor();
				}else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("flip")) {
					 releaseModal(e);
				}else if (e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("box")){
					// //Remove effect modal
					e.target.innerHTML = "";
					e.target.parentNode.style["display"] = "none";

					// //display main modal
					var newM = document.querySelector(".vModal #newModal");

					// // insert main form to new formCon and display
					newM.innerHTML = mainFormCon;
					newM.style["display"] = "block";
					newM.style["height"] = computedModalHeight+"px";
					newM.style["width"] = computedModalWidth+"px";
					newM.childNodes[0].style["display"] = "block";
					openProcessor();
				}else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("box")) {
					 releaseModal(e);
				}
			}
		},false);
		window.addEventListener("resize", function(){
			if(modalOn == true){
				var mainModal = document.querySelector(".modalSpace");
				if (sbpoint.screen.mode == "large"){
					mainModal.style["width"] = modalWidths[0];
				}else if (sbpoint.screen.mode == "medium") {
					mainModal.style["width"] = modalWidths[1];
				}else if (sbpoint.screen.mode == "small") {
					mainModal.style["width"] = modalWidths[2];
				}
			}
		});
		mainModal.addEventListener("resize", function(){
			console.log(777);
		}, false);
		if (closeButton != null){
			document.body.addEventListener("click", function(e){
				if (e.target.id == closeButton.id){
					self.close();
				}
			})
		}
		modalWindow.addEventListener("click", function(e){
			if(e.target.classList.contains("vModal")){
				self.close();
			}
		}, false);
	}
	function resetOldModalProperties(oldModal, currentModal){
		oldModal.setAttribute("id", currentModal.id);
		oldModal.setAttribute("class", currentModal.getAttribute("class"));
		oldModal.style["display"] = "none";
		oldModal.style["width"] = cssWidth;
		oldModal.innerHTML = mainFormConInner;
	}
	function createElements(){
		if (document.querySelector("style[data-id='vModalStyles']") == null){
			//Create
			var overlay = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");

			//Set attributes
			overlay.setAttribute("class", "vModal");
			overlay.setAttribute("data-id", "vModalStyles");
			if (colorOverlayStyle != ""){
				overlay.setAttribute("style", colorOverlayStyle );
			}

			effectsCon.setAttribute("class", "modalSpace");

			//Append modal
			//modalSpace to overlay
			overlay.appendChild(effectsCon);

			//Modal to document
			document.body.appendChild(overlay);
		}
	};
	this.config = {};
	this.show = function(modal){
		validateElement(modal,"'show()' method accepts a valid HTML element");
		if(initialized==true){
			sY = scrollY;
			currentForm = modal;
			modal.id!=null?id=modal.id:null;
			computedModalHeight = getDimensionOfHidden(modal)["height"];
			computedModalWidth = getDimensionOfHidden(modal)["width"];
			cssWidth = DOMelement.cssStyle(modal, "width");
			if(effectName == "split"){
				modal.style["width"] = computedModalWidth+"px";
			}else{
				modal.style["width"] = "100%";
			}
			//effect call
			effects[effectName](modal);
		}else{
			throw new Error("Please initialize using the 'initialize()', before calling the 'show', method");
		}
	};
	this.close = function(){
		if (modalOn == true){
			var modalParent = document.querySelector(".vModal");
			var OldModal = document.querySelector("#vOld");
			var currentModal = modalParent.querySelector("#newModal").childNodes[0];
			currentForm=null;
			id=null;
			closeEffect[effectName](OldModal, currentModal);
		}
	};
	this.initialize = function(){
		if(initialized == false){
			totalHeight = document.querySelector("html").scrollHeight;
			createElements();
			addEventhandler();
			initialized = true;
		}
	}
	Object.defineProperties(this, {
		config:{writable:false},
		show:{writable:false},
		close:{writable:false},
		initialize:{writable:false},
		thisForm:{
			get:function(){
				if(modalOn == true){
					return {
						element:currentForm,
						id:id
					};
				}else{
					return null;
				}
			}
		}
	});
	Object.defineProperties(this.config, {
		effect:{
			set:function(value){
				validateObjectMember(effects, value, "Invalid effect type specified for the 'effect' property")
				effectName = value;
			}
		},
		overlayType:{
			set:function(value){
				if(matchString(value, ["color", "image", "blur"], "Invalid overlay type specified for the 'overlayType' property, it should be one of the followings: 'color', 'blur', 'image'")){
					overlayType = value;
				}
			}
		},
		colorOverlayStyle:{
			set:function(value){
				validateString(value, "A string of valid CSS style(s) needed for the 'colorOverlayStyle' property");
				if (overlayType == "color"){
					colorOverlayStyle = value
				}else{
					throw new Error("Overlay type must be set to 'color' before setting the 'colorOverlayStyle' property");
				}
			}
		},
		openProcessor:{
			set:function(value){
				validateFunction(value, "A function need as 'openProcessor' property value");
				openProcessor = value;
			}
		},
		closeProcessor:{
			set:function(value){
				validateFunction(value, "A function need as 'closeProcessor' property value");
				closeProcessor = value;
			}
		},
		closeButton:{
			set:function(value){
				validateElement(value, "A valid HTML Element needed as 'closeButton' property, invalid HTML element specified")
				if(value.getAttribute("id") != null){
					closeButton = value;
				}else{
					throw new Error("The specified close button element must have an id attribute set, please set and try again");
				}
			}
		},
		modalWidths:{ // Needed only for active browser resiszing
			set:function(value){
				var temp = "'config.modalWidths' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 3, temp+" of 3 Elements");
				validateArrayMembers(value, "string", temp+" of strings");

				function msg(n){
					return "'modalWidths' property array value member "+n+" must be a valid dimension";
				}
				if(validateDimension(value[0], msg(1)) && validateDimension(value[1], msg(2)) && validateDimension(value[2]), msg(3)){
					modalWidths = value;
				}
			}
		},
		screenBreakPoints:{ // Needed only for active browser resiszing
			set:function(value){
				var temp = "'config.screenBreakPoints' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 2, temp+" of 2 Elements");
				validateArrayMembers(value, "number", temp+" of number");
				function msg(n){
					return "'screenBreakPoints' property array value member "+n+" must be an integer";
				}
				var test = new formValidator();
				if(test.validate.integer(value[0], msg(1)) && test.validate.integer(value[1], msg(2))){
					brkpoints["largeStart"] = value[0];
					brkpoints["mediumStart"] = value[1];
				}
			}
		}
	});
}
/****************************************************************/

/***************************Date picker**************************/
function datePicker(){
	var today = new Date();
	var currentYear = today.getFullYear();
	currentYear <2019?currentYear=2019:currentYear= parseInt(currentYear);
	var startYear=0,self=this, tooTipHandler= null,presentYear=0, selectedSeries=0, meridian = "am", show=0,textInputElement=null, includeTime = false, endYear=0, dateType="past", wrapperHeight = 0, n=0 , pastDateRange=[1900, currentYear-1], furtureStopDate=[], initialized = 0, dateInputIcon="", singleDateField=true, styled=false, numberOfRangeBoxes=0,
	yearValue="",daysToolTip=false,pastStopDate=[currentYear, today.getMonth(), today.getDate()-1], monthValue="",dayValue="",timeValue=["","",""],displayTimeValue=["","",""],forward=true,numberOfyearsConBoxes=0,months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], shiftPoint=320, labelProperties=[], daysToolTipProperties=[];
	var status = {
		set:false,
		completed:false
	};
	function createStyles(){
		if (document.querySelector("style[data-id='datePickerStyles']") == null){
			var css = "";
			if(includeTime == true){
				css += ".vDateBoxTool .vDateBox .vDateBoxDisplayCon .vTimeCon{display:none;width:100%; height:100%; position:absolute;}";
			}
			if(dateInputIcon != ""){
				css += ".vDateIcon::before {"+dateInputIcon+"}";
			}
			attachStyleSheet("datePickerStyles", css);
		}
	}
	function AddEventHandlers(){
		var inputIcon = textInputElement.parentNode.querySelector(".vDateIcon");
		inputIcon.addEventListener("click", function(){
			if(show==0){
				self.showDateBox();
			}else {
				self.closeDateBox();
			}
		}, false);
		textInputElement.addEventListener("focusin", function(e){
			e.preventDefault();
			if(show==0){
				self.showDateBox();
			}
		},false);

		//clicks
		textInputElement.parentNode.addEventListener("click", function(e){
			if(e.target.classList.contains("range")){//hide rangeBox and show yearsCon
				var yearSeries = parseInt(e.target.getAttribute("data-range"));
				selectedSeries = yearSeries;
				var rangeCon = e.target.parentNode.parentNode;
				var yearsCon = textInputElement.parentNode.querySelector(".vYearsCon");
				generateYears(yearSeries, yearsCon);
				rangeCon.classList.add("vDateRangeConTrans");
				rangeCon.style["height"] = "0%";
				rangeCon.style["left"] = "0px";
				rangeCon.style["opacity"] = "0";
				rangeCon.classList.contains("displayActive")?rangeCon.classList.remove("displayActive"):null;

				yearsCon.classList.add("displayActive");
				yearsCon.classList.add("rangeToYear");
				yearsCon.style["display"] = "flex";
				yearsCon.scrollHeight;
				yearsCon.style["height"] = "100%";
				yearsCon.style["width"] = "100%";
				yearsCon.style["opacity"] = "1";
				forward = true;
				toggleBackButton();
			}else	if(e.target.classList.contains("year")){//hide yearsCon and show MonthsCon
				var year = parseInt(e.target.innerHTML);
				var monthsCon = textInputElement.parentNode.querySelector(".vMonthsCon");

				if(dateType == "past"){
					var stop = 0;
					var yearsCon = e.target.parentNode;
					yearsCon.style["height"] = "0%";
					yearsCon.style["width"] = "0%";
					yearsCon.style["opacity"] = "0";
					yearsCon.classList.remove("displayActive");
					monthsCon.classList.add("yearToMonth");
					monthsCon.innerHTML = "";

					if(year == pastStopDate[0]){
						stop = pastStopDate[1];
					}else {
						stop = 11;
					}
					for (var x=0; x<=stop; x++){
						var month = document.createElement("DIV");
						month.setAttribute("class", "month");
						addVitalStyle(month);
						x<9?month.setAttribute("data-value", "0"+(x+1).toString()):month.setAttribute("data-value", x+1);
						month.append(document.createTextNode(months[x]))
						monthsCon.appendChild(month);
					}
				}else{
					var yearsCon = e.target.parentNode.parentNode;
					var stop =0;
					yearsCon.style["height"] = "0%";
					yearsCon.style["left"] = "0%";
					yearsCon.style["opacity"] = "0";
					yearsCon.classList.remove("displayActive");
					monthsCon.classList.add("futureYearToMonth");
					monthsCon.innerHTML = "";
					for (var x=0; x<=11; x++){
						if(year == currentYear){
							if(year != furtureStopDate[0]){
								if(x>=today.getMonth()){
									generateMonths(x,monthsCon);
								}
							}else{
								if(x<furtureStopDate[1] && x>=today.getMonth()){
									generateMonths(x,monthsCon);
								}
							}
						}else if(year == furtureStopDate[0] ){
							if(x<furtureStopDate[1]){
								generateMonths(x, monthsCon);
							}
						}else {
							generateMonths(x, monthsCon);
						}
					}
				}

				monthsCon.classList.add("displayActive");
				monthsCon.style["display"] = "flex";
				monthsCon.scrollHeight;
				monthsCon.style["height"] = "100%";
				monthsCon.style["width"] = "100%";
				monthsCon.style["opacity"] = "1";
				yearValue= year;
				writeToInput();
				forward=true;
				dateType=="future"?toggleBackButton():null;
				status["set"] = true;
			}else if(e.target.classList.contains("month")){//hide monthCon and show days
				var month = parseInt(e.target.getAttribute("data-value"));
				var monthsCon = e.target.parentNode;
				var daysCon = textInputElement.parentNode.querySelector(".vDaysCon");
				var stop = 0;
				daysCon.innerHTML = "";
				monthValue = month;
				if (month=="4" || month=="6" || month=="9" || month=="11"){
					stop = 29;
				}else if(month=="2"){
					var leapYear = parseInt(yearValue)%4;
					if(leapYear == 0){
						stop =28;
					}else{
						stop =27;
					}
				}else{
					stop = 30;
				}

				//Generate days
				if(dateType == "past"){
					for (var x=0; x<=stop; x++){
						if(yearValue == pastStopDate[0] && monthValue != pastStopDate[1]){
							if(x<pastStopDate[2]){
								generateDays(x, daysCon);
							}
						}else{
							generateDays(x, daysCon);
						}
					}
				}else{
					var diff = furtureStopDate[0] - currentYear;
					for (var x=0; x<=stop; x++){
						if(yearValue == currentYear ){
							if(diff > 0){
								if (parseInt(monthValue) == today.getMonth()+1){
									if(x>=today.getDate()-1){
										generateDays(x, daysCon);
									}
								}else{
									generateDays(x, daysCon);
								}
							}else{
								if(parseInt(monthValue) == furtureStopDate[1]){
									if(x<furtureStopDate[2]){
										generateDays(x, daysCon);
									}
								}else if(parseInt(monthValue) == today.getMonth()+1){
									if(x>=today.getDate()-1){
										generateDays(x, daysCon);
									}
								}else{
									generateDays(x, daysCon);
								}
							}
						}else if(yearValue == furtureStopDate[0] ){
							if (parseInt(monthValue) == furtureStopDate[1]){
								if(x<furtureStopDate[2]){
									generateDays(x, daysCon);
								}
							}else{
								generateDays(x, daysCon);
							}
						}else {
							generateDays(x, daysCon);
						}
					}
				}

				monthsCon.style["height"] = "0%";
				monthsCon.style["width"] = "0%";
				monthsCon.style["opacity"] = "0";
				monthsCon.classList.remove("displayActive");

				daysCon.classList.add("displayActive");
				daysCon.classList.add("monthToDay");
				daysCon.style["display"] = "flex";
				daysCon.scrollHeight;
				daysCon.style["height"] = "100%";
				daysCon.style["width"] = "100%";
				daysCon.style["opacity"] = "1";

				writeToInput();

				//generateDays(month);
			}else	if(e.target.classList.contains("day")){//hide dayCon and show time if specified
				var day = e.target.getAttribute("data-value");
				if(includeTime == true){
					var daysCon = e.target.parentNode;
					var timeCon = textInputElement.parentNode.querySelector(".vTimeCon");
					daysCon.style["height"] = "0%";
					daysCon.style["width"] = "0%";
					daysCon.style["opacity"] = "0";
					daysCon.classList.remove("displayActive");

					timeCon.classList.add("displayActive");
					timeCon.classList.add("dayToTime");
					timeCon.style["display"] = "flex";
					timeCon.scrollHeight;
					timeCon.style["height"] = "100%";
					timeCon.style["width"] = "100%";
					timeCon.style["opacity"] = "1";
					dayValue = "-"+day;
					writeToInput();
				}else{
					var daysCon = e.target.parentNode;
					var header = textInputElement.parentNode.querySelector(".vDateBoxHeader").innerHTML = "Exiting...";
					daysCon.style["height"] = "0%";
					daysCon.style["width"] = "0%";
					daysCon.style["opacity"] = "0";
					daysCon.classList.remove("monthToDay");
					dayValue = "-"+day;
					writeToInput();
					status["completed"] = true;
					//Close Date picker Box
					self.closeDateBox();
				}
			}else	if(e.target.classList.contains("vbActive")){//Back button clicked
					var currentDisplay = textInputElement.parentNode.querySelector(".displayActive");
					var prev = textInputElement.parentNode.querySelector(".displayActive").previousElementSibling;
					currentDisplay.classList.remove("displayActive");
					currentDisplay.classList.add("temp");
					currentDisplay.style["height"] = "0%";
					currentDisplay.style["width"] = "0%";
					currentDisplay.style["opacity"] = "0";
					if (dateType == "past"){
						if(currentDisplay.classList.contains("vMonthsCon")){
							generateYears(selectedSeries, textInputElement.parentNode.querySelector(".vYearsCon"));
						}
					}

					prev.classList.add("rewind");
					prev.style["display"] = "flex";
					prev.scrollHeight;
					if (prev.classList.contains("vDateRangeCon") == false && prev.classList.contains("vFutureYearsCon") == false){
						prev.style["height"] = "100%";
						prev.style["width"] = "100%";
						prev.style["opacity"] = "1";
					}else if(prev.classList.contains("vDateRangeCon") == true){
						prev.classList.add("vDateRangeConTrans");
						prev.style["height"] = "100%";
						prev.style["opacity"] = "1";
						toggleListScroller();
					}else if(prev.classList.contains("vFutureYearsCon") == true){
						prev.style["height"] = "100%";
						prev.style["opacity"] = "1";
						toggleListScroller();
					}
			}else	if(e.target.classList.contains("meridianSwitchCon")){//meridian switch button clicked
				if(e.target.classList.contains("am")){
					e.target.classList.remove("am");
					e.target.classList.add("pm");
					meridian="pm";
				}else {
					e.target.classList.add("am");
					e.target.classList.remove("pm");
					meridian="am";
				}
			}else	if(e.target.classList.contains("vClose")){//close button clicked
				if(show==1){
					if(includeTime == true){
						if(displayTimeValue[2] != ""){
							status["completed"] = true;
						}
					}else {
						dayValue != ""?status["completed"] = true:null;
					}
					self.closeDateBox();
				}
			}else	if(e.target.classList.contains("tbuttonActive")){//Done button clicked
				status["completed"] = true;
				self.closeDateBox();
			}
		}, false);

		//Transition control
		textInputElement.parentNode.addEventListener("transitionend", function(e){
			if(e.target.classList.contains("displayActive")){
				var header = textInputElement.parentNode.querySelector(".vDateBoxHeader");
				header.innerHTML = e.target.getAttribute("data-title");
			}
			if(e.target.classList.contains("rangeToYear")){//Hide rangeCon
				var rangeCon = textInputElement.parentNode.querySelector(".vDateRangeCon");
				rangeCon.classList.remove("vDateRangeConTrans");
				rangeCon.style["display"] = "none";
				e.target.classList.remove("rangeToYear");
				toggleListScroller();
			}else if(e.target.classList.contains("futureYearToMonth")){//Hide future yearcon
				var fyearCon = textInputElement.parentNode.querySelector(".vFutureYearsCon");
				fyearCon.style["display"] = "none";
				e.target.classList.remove("futureYearToMonth");
				toggleListScroller();
			}else if (e.target.classList.contains("yearToMonth")) {//Hide yearsCon
				var yearsCon = textInputElement.parentNode.querySelector(".vYearsCon");
				yearsCon.style["display"] = "none";
				yearsCon.innerHTML="";
				e.target.classList.remove("yearToMonth");
			}else if (e.target.classList.contains("monthToDay")) {//Hide monthsCon
				var monthCon = textInputElement.parentNode.querySelector(".vMonthsCon");
				monthCon.style["display"] = "none";
				e.target.classList.remove("monthToDay");
			}else if (e.target.classList.contains("dayToTime")) {//Hide daysCon
				var daysCon = textInputElement.parentNode.querySelector(".vDaysCon");
				var timeCon = textInputElement.parentNode.querySelector(".vTimeCon");
				timeCon.querySelector(".hourCon input").focus();
				daysCon.style["display"] = "none";
				e.target.classList.remove("dayToTime");
			}else if (e.target.classList.contains("exiting")) {//Exiting dateBox
				if(dateType == "past"){
					var yearsRangeCon = textInputElement.parentNode.querySelector(".vDateRangeCon");
					yearsRangeCon.style["display"] = "flex";
					yearsRangeCon.style["height"] = "100%";
				}else{
					var yearsCon = textInputElement.parentNode.querySelector(".vFutureYearsCon");
					yearsCon.style["display"] = "flex";
					yearsCon.style["height"] = "100%";
				}
			}else if (e.target.classList.contains("rewind")) {//previous
				e.target.classList.remove("rewind");
				if(e.target.classList.contains("vDateRangeCon") || e.target.classList.contains("vFutureYearsCon") ){
					var BackButton = 	textInputElement.parentNode.querySelector(".vbActive");

					if(dateType == "past"){
						var rangeCon = textInputElement.parentNode.querySelector(".vDateRangeCon");
						rangeCon.classList.remove("vDateRangeConTrans");
					}else{
						var rangeCon = textInputElement.parentNode.querySelector(".vFutureYearsCon");
					}

					rangeCon.style["display"] = "flex";
					rangeCon.classList.add("displayActive");

					forward = false;
					toggleBackButton();
				}else{
					e.target.classList.add("displayActive");
				}
			}else if (e.target.classList.contains("temp")) {//previous
				e.target.classList.remove("temp");
				e.target.style["display"] = "none";
			}else if (e.target.classList.contains("meridianSwitchCon")) {//meridian switch
				var label = e.target.parentNode;
				if(e.target.classList.contains("pm")){
					label.classList.remove("AMon");
					label.classList.add("PMon");
				}else {
					label.classList.add("AMon");
					label.classList.remove("PMon");
				}
				reCompute24hours();
			}
		}, false);

		//Time input
		textInputElement.parentNode.addEventListener("focusout", function(e){
			if(e.target.classList.contains("hr")){
				e.target.value = minMaxInt(e.target.value, 1, 12);
				var value = e.target.value;
				var minValue = textInputElement.parentNode.querySelector(".min").value;
				if(value.length==1){
					var pint = parseInt(value);
					timeValue[0] = "0"+value.toString();
					e.target.value = "0"+value.toString();
					displayTimeValue[0] = convertTo24hours(parseInt(pint))<10?"0"+convertTo24hours(pint).toString():convertTo24hours(pint);
				}else if (value.length == 2) {
					var pint = parseInt(value);
					timeValue[0] = value.toString();
					displayTimeValue[0] = convertTo24hours(parseInt(pint))<10?"0"+convertTo24hours(pint).toString():convertTo24hours(pint);
				}
				writeToInput();
				if(value.length > 0 && minValue.length >0){
					activateOK();
				}else {
					deactivateOK();
				}
			}else if (e.target.classList.contains("min")) {
				e.target.value = minMaxInt(e.target.value, 0, 59);
				var value = e.target.value;
				var hrValue = textInputElement.parentNode.querySelector(".hr").value;
				if(value.length==1){
					timeValue[1] = "0"+value.toString();
					displayTimeValue[1] = ":0"+value.toString();
					e.target.value = timeValue[1];
					timeValue[2] = "00";
					displayTimeValue[2] = ":00";
				}else if (value.length == 2) {
					timeValue[1] = value.toString();
					displayTimeValue[1] = ":"+value.toString();
					timeValue[2] = "00";
					displayTimeValue[2] = ":00";
				}

				writeToInput();

				if(value.length > 0 && hrValue.length >0){
					activateOK();
				}else {
					deactivateOK();
				}
			}
		}, false);

		window.addEventListener("resize", function(e){
			if(show == 1){
				var dateBoxParent = textInputElement.parentNode.querySelector(".vDateBoxTool");
				var dateBoxArrow = textInputElement.parentNode.querySelector(".vDateBoxArrow");
				shift(dateBoxParent, dateBoxArrow);
			}
		})
	}
	function activateOK(){
		var button = textInputElement.parentNode.querySelector(".vTimeCon button");
		button.classList.remove("tbuttonInactive");
		button.classList.add("tbuttonActive");
	}
	function deactivateOK(){
		var button = textInputElement.parentNode.querySelector(".vTimeCon button");
		button.classList.add("tbuttonInactive");
		button.classList.remove("tbuttonActive");
	}
	function generateYears(SeriesStartYear, yearsCon){
		var yearSeries = SeriesStartYear;
		yearsCon.innerHTML = "";
		for(var x=0; x<10;x++){
			var year = document.createElement("DIV");
			year.setAttribute("class", "year");
			addVitalStyle(year);
			year.appendChild(document.createTextNode(yearSeries));
			yearsCon.appendChild(year);
			yearSeries++;
		}

	}
	function generateMonths(x, monthsCon){
		var month = document.createElement("DIV");
		month.setAttribute("class", "month");
		addVitalStyle(month);
		console.log("dsds");
		x<9?month.setAttribute("data-value", "0"+(x+1).toString()):month.setAttribute("data-value", x+1);
		month.append(document.createTextNode(months[x]))
		monthsCon.appendChild(month);
	}
	function createDatePickerBox(){
		var dateInputWrapper = textInputElement.parentNode;
		//_____________Create elements___________
		// Input icon
		var dateIconElement = document.createElement("DIV");
		dateIconElement.setAttribute("class", "vDateIcon");

		//DateBox tool parent
		var dateBoxToolElement = document.createElement("DIV");
		dateBoxToolElement.setAttribute("class", "vDateBoxTool");

		//Arrow
		var dateBoxArrowElement = document.createElement("DIV");
		dateBoxArrowElement.setAttribute("class", "vDateBoxArrow normalShift");

		//DateBox
		var dateBoxElement = document.createElement("DIV");
		dateBoxElement.setAttribute("class", "vDateBox");

		//DateBox Header
		var dateBoxHeaderElement = document.createElement("DIV");
		dateBoxHeaderElement.setAttribute("class", "vDateBoxHeader");

		//DateBox displayCon
		var dateBoxDisplayConElement = document.createElement("DIV");
		dateBoxDisplayConElement.setAttribute("class", "vDateBoxDisplayCon");

		if(labelProperties[1] != undefined){ //FontColor
			dateBoxDisplayConElement["style"]["color"] = labelProperties[1];
		}

		if (dateType == "past"){
			//Date range Box
			var dateRangeConElement = document.createElement("DIV");
			dateRangeConElement.setAttribute("class", "vDateRangeCon");
			dateRangeConElement.setAttribute("data-title", "Select year series");
			n = (endYear - startYear) /10;
			numberOfRangeBoxes = Math.ceil(n/11);
			for (var x=0; x<numberOfRangeBoxes; x++){
				var rangeBox = document.createElement("DIV");
				rangeBox.setAttribute("class", "rangeBox");
				dateRangeConElement.appendChild(rangeBox);
			}

			//Years Container
			var yearsConElement = document.createElement("DIV");
			yearsConElement.setAttribute("class", "vYearsCon");
			yearsConElement.setAttribute("data-title", "Select year");
		}else if(dateType == "future"){
			//Years Container
			var futureYearsConElement = document.createElement("DIV");
			futureYearsConElement.setAttribute("class", "vFutureYearsCon");
			futureYearsConElement.setAttribute("data-title", "Select year");

			presentYear = new Date().getFullYear();
			var diff = (furtureStopDate[0] - presentYear)
			diff>0?n = diff:n=1;
			numberOfyearsConBoxes = Math.ceil(n/11);
			for (var x=0; x<numberOfyearsConBoxes; x++){
				var yearsBox = document.createElement("DIV");
				yearsBox.setAttribute("class", "yearsBox");
				futureYearsConElement.appendChild(yearsBox);
			}
		}

		//Months Container
		var monthsConElement = document.createElement("DIV");
		monthsConElement.setAttribute("class", "vMonthsCon");
		monthsConElement.setAttribute("data-title", "Select month");

		//Days Container
		var daysConElement = document.createElement("DIV");
		daysConElement.setAttribute("class", "vDaysCon");
		daysConElement.setAttribute("data-title", "Select day");

		//Time Container
		if (includeTime == true){
			var timeConElement = document.createElement("DIV");
			var meridianCon = document.createElement("DIV");
			var meridian = document.createElement("DIV");
			var meridianSwitchCon = document.createElement("DIV");
			var timpePropertiesCon = document.createElement("DIV");
			var hourCon = document.createElement("DIV");
			var hourInput = document.createElement("INPUT");
			var minCon = document.createElement("DIV");
			var minInput = document.createElement("INPUT");
			var secInput = document.createElement("INPUT");
			var secCon = document.createElement("DIV");
			var OkButton = document.createElement("BUTTON");
			timeConElement.setAttribute("class", "vTimeCon");
			timeConElement.setAttribute("data-title", "Set time");
			meridianCon.setAttribute("class", "meridianCon");
			meridian.setAttribute("class", "meridian AMon");
			meridianSwitchCon.setAttribute("class", "meridianSwitchCon am");
			timpePropertiesCon.setAttribute("class", "timpePropertiesCon");
			hourCon.setAttribute("class", "hourCon");
			hourInput.setAttribute("type", "text");
			hourInput.setAttribute("class", "hr");
			hourInput.setAttribute("maxlength", "2");
			hourCon.appendChild(hourInput);
			minCon.setAttribute("class", "minCon");
			minInput.setAttribute("type", "text");
			minInput.setAttribute("maxlength", "2");
			minInput.setAttribute("class", "min");
			minCon.appendChild(minInput);
			secCon.setAttribute("class", "secCon");
			secInput.setAttribute("type", "text");
			secInput.setAttribute("maxlength", "2");
			secInput.setAttribute("readonly", "true");
			secInput.setAttribute("value", "00");
			secCon.appendChild(secInput);

			OkButton.appendChild(document.createTextNode("Done"));
			OkButton.setAttribute("class", "tbuttonInactive");
			//Append
			//meridian children
			meridianCon.appendChild(meridian);
			meridian.appendChild(meridianSwitchCon);

			//meridianCon to timeConElement
			timeConElement.appendChild(meridianCon);
			//timpePropertiesCon to timeConElement
			timpePropertiesCon.appendChild(hourCon);
			timpePropertiesCon.appendChild(minCon);
			timpePropertiesCon.appendChild(secCon);
			timeConElement.appendChild(timpePropertiesCon);
			//Button to timeConElement
			timeConElement.appendChild(OkButton);
		}

		//DateBox controlCon
		var dateBoxControlConElement = document.createElement("DIV");
		dateBoxControlConElement.setAttribute("class", "vDateBoxControlCon");

		// previous button
		var previousButtonElement = document.createElement("BUTTON");
		previousButtonElement.setAttribute("class", "linactive vPrev");
		previousButtonElement.setAttribute("id", "vPrev");
		// back button
		var backButtonElement = document.createElement("BUTTON");
		backButtonElement.setAttribute("class", "vBack vbInactive");
		backButtonElement.appendChild(document.createTextNode("Back"));
		// Close button
		var closeButtonElement = document.createElement("BUTTON");
		closeButtonElement.setAttribute("class", "vClose");
		closeButtonElement.appendChild(document.createTextNode("Close"));
		// next button
		var nextButtonElement = document.createElement("BUTTON");
		nextButtonElement.setAttribute("class", "rinactive vNext");
		nextButtonElement.setAttribute("id", "vNext");

		//____________Append______________
		//Append dateBox header to dateBox Element
		dateBoxElement.appendChild(dateBoxHeaderElement);

		//Append dateBox displayCon to dateBox Element
		dateBoxElement.appendChild(dateBoxDisplayConElement);

		if(dateType == "past"){
			//Append date rangeCon to displayCon Element
			dateBoxDisplayConElement.appendChild(dateRangeConElement);

			// Append years container to displayCon Element
			dateBoxDisplayConElement.appendChild(yearsConElement);
		}else if (dateType == "future"){
			// Append years container to displayCon Element
			dateBoxDisplayConElement.appendChild(futureYearsConElement);
		}

		// Append months container to displayCon Element
		dateBoxDisplayConElement.appendChild(monthsConElement);

		// Append Days container to displayCon Element
		dateBoxDisplayConElement.appendChild(daysConElement);

		// Append Time container to displayCon Element
		includeTime == true?dateBoxDisplayConElement.appendChild(timeConElement):null;

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

		//Append dateBoxArrow to date box tool parent
		dateBoxToolElement.appendChild(dateBoxArrowElement);

		//Append dateBox to box tool parent
		dateBoxToolElement.appendChild(dateBoxElement);

		//Append dateIcon to wrapper input
		dateInputWrapper.appendChild(dateIconElement);

		// Append datebox tool parent to wrapper input
		dateInputWrapper.appendChild(dateBoxToolElement);
	}
	function addVitalStyle(ele){
		if(labelProperties[0] != undefined){ //backgroundColor
			ele["style"]["background-color"] = labelProperties[0];
		}
		if(labelProperties[2] != undefined){ //border
			ele["style"]["border"] = labelProperties[2];
		}
	}
	function generateYearRange (){
		
		var displayCon = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon .vDateRangeCon");
		var rangeBox = displayCon.querySelectorAll(".rangeBox");
		var range = document.createElement("DIV");
		range.setAttribute("class", "range");
		range.setAttribute("data-range", startYear);
		addVitalStyle(range);
		range.appendChild(document.createTextNode(startYear.toString()+"'s..."));
		rangeBox[0].appendChild(range);
		var c =0;
		for (var x=0; x<numberOfRangeBoxes; x++){
			for (var y=0; y<11; y++){
				if(c != n){
					c++;
					startYear += 10;
					var range = document.createElement("DIV");
					range.setAttribute("class", "range");
					range.setAttribute("data-range", startYear);
					addVitalStyle(range);
					range.appendChild(document.createTextNode(startYear.toString()+"'s..."));
					rangeBox[x].appendChild(range);
					if (y== 10){
						break;
					}
				}else{
					break;
				}
			}
		}
	};
	function generateFurtureYears (){
		var displayCon = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon .vFutureYearsCon");
		var yearsBox = displayCon.querySelectorAll(".yearsBox");
		var year = document.createElement("DIV");
		year.setAttribute("class", "year");
		year.appendChild(document.createTextNode(presentYear.toString()));
		yearsBox[0].appendChild(year);
		var diff = (furtureStopDate[0] - presentYear);
		if(diff > 0){
			if (diff > 3){
				yearsBox[0].style["justify-content"] = "start";
				yearsBox[0].style["padding"] = "20px 0 20px 20px";
			}else {
				yearsBox[0].style["justify-content"] = "center";
				yearsBox[0].style["padding"] = "20px 0 20px 0px";
			}
			var c =0;
			for (var x=0; x<numberOfyearsConBoxes; x++){
				for (var y=0; y<11; y++){
					if(c != n){
						c++;
						presentYear += 1;
						var year = document.createElement("DIV");
						year.setAttribute("class", "year");
						year.appendChild(document.createTextNode(presentYear.toString()));
						yearsBox[x].appendChild(year);
						if (y== 10){
							break;
						}
					}else{
						break;
					}
				}
			}
		}else{
			yearsBox[0].style["justify-content"] = "center";
			yearsBox[0].style["padding"] = "20px 0 20px 0px";
		}
	};
	function createToolTip(){
		var b = document.querySelectorAll(".vDaysCon .day");
		b[b.length-1].addEventListener("mouseover", function(e){
			var dayName = getDayName(yearValue, monthValue, e.target.getAttribute("data-value"));
			tooTipHandler.set(e.target, dayName);
		},false);
	}
	function generateDays(x, daysCon){
		var day = document.createElement("DIV");
		day.setAttribute("class", "day");
		addVitalStyle(day);
		x<9?day.setAttribute("data-value", "0"+(x+1).toString()):day.setAttribute("data-value", x+1);
		day.append(document.createTextNode(x+1));
		daysCon.appendChild(day);
		daysToolTip==true?createToolTip():null;
	}
	function toggleListScroller(){
		
		if(dateType == "past"){
			var listCon = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon .vDateRangeCon");
			var list = textInputElement.parentNode.querySelectorAll(".vDateBox .vDateBoxDisplayCon .vDateRangeCon .rangeBox");
		}else{
			var listCon = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon .vFutureYearsCon");
			var list = textInputElement.parentNode.querySelectorAll(".vDateBox .vDateBoxDisplayCon .vFutureYearsCon .yearsBox");
		}

		var listConParent = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon");
		var LeftBt = textInputElement.parentNode.querySelector("#vPrev");
		var RightBt = textInputElement.parentNode.querySelector("#vNext");
		var listControllerObj = new  listScroller(listConParent, listCon);
		
		if (list.length > 1 && DOMelement.cssStyle(listCon, "display") != "none"){	
			listControllerObj.config.listPlane = "x";
			listControllerObj.config.Xbuttons = [LeftBt, RightBt];
			listControllerObj.config.inactiveButtonsClassName = ["linactive", "rinactive"];
			listControllerObj.config.effects = [0.4, "cubic-bezier(0,.99,0,1)"];
			listControllerObj.config.scrollSize = 302;
			listControllerObj.config.paddingRight = 0;
			listControllerObj.initialize();
			listControllerObj.onScroller();
		}else{
			listControllerObj.offScroller();
		}
	}
	function toggleBackButton(){
		var backButton = textInputElement.parentNode.querySelector(".vBack");
		if(forward == true){
			backButton.classList.remove("vbInactive");
			backButton.classList.add("vbActive");
		}else {
			backButton.classList.add("vbInactive");
			backButton.classList.remove("vbActive");
		}
	}
	function writeToInput(){
		var tempMonth = "";
		if (monthValue == ""){
			tempMonth = "";
		}else {
			tempMonth = "-"+monthValue;
		}
		if(includeTime ==true){
			textInputElement.value = yearValue+tempMonth+dayValue+" "+displayTimeValue[0]+displayTimeValue[1]+displayTimeValue[2];
		}else{
			textInputElement.value = yearValue+tempMonth+dayValue;
		}
	}
	function convertTo24hours(hour){
		if(meridian == "am"){
			if(hour == 12){
				return 0;
			}else {
				return hour;
			}
		}else {
			if(hour == 12){
				return 12;
			}else {
				var hr = 12+parseInt(hour);
				return hr;
			}
		}
	}
	function reCompute24hours(){
		var hrInputValue = parseInt(textInputElement.parentNode.querySelector(".hourCon input").value);
		if(hrInputValue.toString().length > 0){
			var newV = convertTo24hours(hrInputValue);
			if(newV > 9){
				timeValue[0] = newV.toString();
				displayTimeValue[0] = newV;
			}else {
				timeValue[0] = newV.toString();
				displayTimeValue[0] = "0"+newV;
			}
			writeToInput();
		}
	}
	function compareDate(value, type){
		if(type == "past"){

		}else if(type= "future"){
			var fdate = value[0]+"-"+(value[1])+"-"+value[2];
			var cdate = today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate();
			var furtureDate = new Date(fdate).getTime();
			var currentDate = new Date(cdate).getTime();
			var diff = furtureDate - currentDate;
			if(diff > 0){
				return "valid";
			}else{
				return "invalid";
			}
		}
	}
	function shift(dateBoxParent, dateBoxArrow){
			if(window.innerWidth > shiftPoint){
				dateBoxArrow.classList.add("normalShift");
				dateBoxArrow.classList.remove("shift");
				dateBoxParent.style["left"] = "0";
				dateBoxParent.style["margin-left"] = "0";
			}else {
				dateBoxArrow.classList.add("shift");
				dateBoxArrow.classList.remove("normalShift");
				dateBoxParent.style["left"] = "50%";
				dateBoxParent.style["margin-left"] = "-150px";
			}
	}
	this.config = {}
	this.initialize = function(textInputEle){
		if (validateElement(textInputEle, "'initialize()' method argument must be a valid HTML element")){
			if(textInputEle.nodeName != "INPUT" && textInputEle.getAttribute("type") != "text"){
				throw new Error("'initialize()' method argument must be an INPUT element of type 'text'");
			}
		}
		if(dateType == "future"){
			if(furtureStopDate.length == 0){
				throw new Error("Date type is set to future, and no stop date specified, specify using the 'config.furtureStopDate' property");
			}
		}

		//Initialization starts
		textInputEle.parentNode.style["z-index"] = "500";
		textInputEle.setAttribute("readonly", "true");
		textInputElement = textInputEle;
		textInputEle.value = "";
		if(dateType == "past"){
			startYear = parseInt(pastDateRange[0].toString()[0]+pastDateRange[0].toString()[1]+pastDateRange[0].toString()[2]+"0");
			endYear = parseInt(pastDateRange[1].toString()[0]+pastDateRange[1].toString()[1]+pastDateRange[1].toString()[2]+"0");
		}
		if (singleDateField == true){
			createStyles();
		}else {
			if (styled == false){
				createStyles();
				styled =true;
			}
		}
		createDatePickerBox();
		dateType=="past"?generateYearRange():generateFurtureYears();
		AddEventHandlers();
		if(includeTime == true){
			var fv = new formValidator();
			var hrinput = textInputEle.parentNode.querySelector(".hourCon input");
			var mininput = textInputEle.parentNode.querySelector(".minCon input");
			fv.format.integerField(hrinput);
			fv.format.integerField(mininput);
		}
		if(daysToolTip==true){
			tooTipHandler = new toolTip();
			if(daysToolTipProperties[0] != undefined){
				var color = daysToolTipProperties[1] == undefined?"white":daysToolTipProperties[1];
				tooTipHandler.config.tipBoxProperties = [daysToolTipProperties[0], color];
			}
			tooTipHandler.initialize();
		};
		initialized=1;
	}
	this.showDateBox = function(){
		if (initialized == 0){
			throw new Error("The 'showDateBox()' method must be called after initialization, initialize using the 'initialize()' method");
		}else{
			var dateBoxParent = textInputElement.parentNode.querySelector(".vDateBoxTool");
			var dateBoxTitileCon = textInputElement.parentNode.querySelector(".vDateBoxHeader");
			var dateBoxArrow = textInputElement.parentNode.querySelector(".vDateBoxArrow");
			dateBoxParent.style["display"] = "block";
			dateBoxParent.scrollHeight;
			shift(dateBoxParent, dateBoxArrow);
			dateBoxParent.style["height"] = dateBoxParent.scrollHeight+"px";

			if(dateType == "past"){
				var rangeCon = textInputElement.parentNode.querySelector(".vDateRangeCon");
				rangeCon.style["opacity"] = "1";
				dateBoxTitileCon.innerHTML = rangeCon.getAttribute("data-title");
			}else if (dateType == "future") {
				var futureYearsCon = textInputElement.parentNode.querySelector(".vFutureYearsCon");
				futureYearsCon.style["opacity"] = "1";
				dateBoxTitileCon.innerHTML = futureYearsCon.getAttribute("data-title");
			}
			toggleListScroller();
			show=1;
		}
	}
	this.closeDateBox = function(){
		if (show == 0){
			throw new Error("The 'closeDateBox()' method must be called only when the date picker box is opened");
		}else{
			var dateBoxParent = textInputElement.parentNode.querySelector(".vDateBoxTool");
			var activeDisplay = textInputElement.parentNode.querySelector(".displayActive");
			if (activeDisplay != null){
				activeDisplay.style["display"] = "none";
				activeDisplay.style["opacity"] = "0";
				activeDisplay.classList.remove("displayActive");
			}
			forward = false;
			toggleBackButton();
			dateBoxParent.classList.add("exiting");
			dateBoxParent.style["height"] = "0px";
			show=0;
		}
	}
	this.reset = function(){
		textInputElement.value = "";
	}
	Object.defineProperties(this, {
		showDateBox:{writable:false},
		initialize:{writable:false},
		config:{writable:false},
		closeDateBox:{writable:false},
		status:{
			get:function(){
				return status;
			}
		},
		reset:{
			writable:false
		}
	});
	Object.defineProperties(this.config, {
		inputIcon:{
			set:function(value){
				if(validateString(value, "'config.inputIcon' property must be string of valid CSS style(s)")){
					dateInputIcon = value
				}
			}
		},
		includeTime:{
			set:function(value){
				if(validateBoolean(value, "'config.includeTime' property value must be a boolen")){
					includeTime = value;
				}
			}
		},
		dateType:{
			set:function(value){
				if(validateString(value, "'config.dateType' property value must be a string")){
					if(value.toLowerCase() == "past" || value.toLowerCase() == "future"){
						dateType = value;
					}else{
						throw new Error ("'config.dateType' property value must either be 'past' or 'future'");
					}
				}
			}
		},
		furtureStopDate:{
			set:function(value){
				var temp = "'config.furtureStopDate' property value must be an array";
				validateArray(value, temp);
				validateArrayLength(value, 3, temp+" of 3 Elements");
				validateArrayMembers(value, "number", temp+" of number");
				var validator = new formValidator();
				if (validator.validate.integer(value[0]) && validator.validate.integer(value[1]) && validator.validate.integer(value[2])){
					if(value[1] > 0 && value[1] < 13){
						if(value[1]==4 || value[1]==6 || value[1]==9 || value[1]==9){
							if(value[2] > 0 && value[2] < 31){
								if(compareDate(value, "future") == "valid"){
									furtureStopDate = value;
								}else{
									throw new Error("Future date must be ahead of current time");
								}
							}else {
								throw new Error("Array member 3 value of 'config.furtureStopDate' property must be between the range '1 - 30' for the specified month");
							}
						}else if (value[1] == 2){
							var leapYear = parseInt(yearValue)%4;
							if(leapYear == 0){
								if(value[2] > 0 && value[2] < 30){
									if(compareDate(value, "future") == "valid"){
										furtureStopDate = value;
									}else{
										throw new Error("Future date must be ahead of current time");
									}
								}else {
									throw new Error("Array member 3 value of 'config.furtureStopDate' property must be between the range '1 - 29' for the specified month");
								}
							}else{
								if(value[2] > 0 && value[2] < 29){
									if(compareDate(value, "future") == "valid"){
										furtureStopDate = value;
									}else{
										throw new Error("Future date must be ahead of current time");
									}
								}else {
									throw new Error("Array member 3 value of 'config.furtureStopDate' property must be between the range '1 - 28' for the specified month");
								}
							}
						}else{
							if(value[2] > 0 && value[2] < 32){
								if(compareDate(value, "future") == "valid"){
									furtureStopDate = value;
								}else{
									throw new Error("Future date must be ahead of current time");
								}
							}else {
								throw new Error("Array member 3 value of 'config.furtureStopDate' property must be between the range '1 - 31' for the specified month");
							}
						}
					}else{
							throw new Error("Array member 2 value of 'config.furtureStopDate' property must be between the range '1 - 12'");
						}
				}else{
					throw new Error("Array members value of 'config.furtureStopDate' property must all be an integers");
				}
			}
		},
		pastStartYear:{
			set:function(value){
				if(validateNumber(value, "'config.pastStartYear' property value must be a numeric value")){
					if (value >= 1900 && value <= pastDateRange[1]){
						if (new formValidator().validate.float(value) == false){
							pastDateRange[0] = value;
						}else{
							throw new Error("'config.pastStartYear' property value must be an integer");
						}
					}else{
						throw new Error("'config.pastStartYear' property value must be between 1900 and the current date year");
					}
				}
			}
		},
		daysToolTip:{
			set:function(value){
				if(validateBoolean(value, "'config.daysToolTip' property value must be a boolean")){
					daysToolTip = value;
				}
			}
		},
		shiftPoint:{
			set:function(value){
				var test = new formValidator();
				if (test.validate.integer(value)){
					if(value > 300){
						shiftPoint = value;
					}else{
						throw new Error("'shiftPoint' property integer value must be greater than 300");
					}
				}else {
					throw new Error("'shiftPoint' property value must be an integer");
				}
			}
		},
		labelProperties:{
			set:function(value){
				//[a,b,c] => a= backgroundColr; b= fontColor ; c= borderStyle
				var temp = "config.labelProperties property array members";
				validateArray(value, "config.labelProperties property expects an array as value");
				if(value.length > 3){
					throw new Error(temp+" cannot be more than 3");
				}
				validateArrayMembers(value, "string", temp+ "must all be string");
				labelProperties = value;
			}
		},
		daysToolTipProperties:{
			set:function(value){
				//[a,b] => a = backgrondColor; b = fontColor
				var temp = "config.daysToolTipProperties property array members";
				validateArray(value, "config.daysToolTipProperties property expects an array as value");
				if(value.length > 2){
					throw new Error(temp+" cannot be more than 2");
				}
				validateArrayMembers(value, "string", temp+ "must all be string");
				daysToolTipProperties = value;
			}
		}
	});
}
/****************************************************************/

/***************************Tool tip*****************************/
function toolTip(){
	var sy=0,sx=0, ini=false, tipBoxProperties=[],tipId="", initialized=0;
	// var scrollHandler =
	function createStyles(){
		if (document.querySelector("style[data-id='toolTipStyles']") == null){
			var css = "";
			if(tipBoxProperties[0] != undefined){
				css += ".vToolTipTop::before{border-top:10px solid "+tipBoxProperties[0]+";}";
				css += ".vToolTip{background-color:"+tipBoxProperties[0]+"}";
			}
			if(tipBoxProperties[1] != undefined){
				css += ".vToolTip{color:"+tipBoxProperties[1]+"}";
			}
			attachStyleSheet("toolTipStyles", css);
		}
	}
	function createTipElement(){
		var tipElement = document.createElement("DIV");
		var existing = document.querySelectorAll(".vToolTip");
		existing.length>0?tipId = existing.length+1:tipId=1;
		tipElement.setAttribute("class", "vToolTip vToolTipTop");
		tipElement.setAttribute("data-toolTipId", tipId);
		document.body.appendChild(tipElement);
	}
	function addEvent(element, mainTip){
		var vTipCon = document.querySelector("div[data-toolTipId='"+element.getAttribute("data-TID")+"']");

		element.addEventListener("mouseover", function(){
			sy=scrollY;sx=scrollX;
		},false)
		element.addEventListener("mousemove", function(e){
			if(	element.getAttribute("data-vToolTipSwitch") == "ON"){
				vTipCon.style["display"] == "none"?vTipCon.style["display"] = "block":null;
				var y = (e.clientY+sy)-vTipCon.scrollHeight;
				var x = (e.clientX+sx) - 10;
				vTipCon.innerHTML = mainTip;
				vTipCon.style["top"] = y+"px";
				vTipCon.style["left"] =x+"px";
			}
		}, false);
		element.addEventListener("mouseout", function(e){
			if(e.target.getAttribute("data-TID") != null){
				vTipCon.style["display"] = "none";
				vTipCon.style["top"] = "0";
				vTipCon.style["left"] ="0";
			}
		},false);
	}
	this.initialize =  function(){
		if(initialized == 0){
			createTipElement();
			createStyles();
			initialized=1;
		}
	};
	this.config = {

	};
	this.set = function(element, tip=null){
		validateElement(element, "Argument 1 of the set() static method must be a valid HTML element");
		var mainTip ="";
		if (tip == null && element.getAttribute("title") == null){
			throw new Error("Argument 2 of the set() method and element title attribute cannot be null, Please specify the tip to use.");
		}else if(tip == null && element.getAttribute("title") != null){//use title attribute
			element.setAttribute("data-tempTitle", element.getAttribute("title"));
			mainTip = element.getAttribute("title");
			element.removeAttribute("title");
		}else if (tip != null) {//Use tip
			validateString(tip, "Argument 2 of the set() method, must be a string");
			if (element.getAttribute("title") != null){
				element.setAttribute("data-tempTitle", element.getAttribute("title"));
				element.removeAttribute("title");
				mainTip = tip;
			}else{
				mainTip = tip;
			}
		}
		element.setAttribute("data-TID", tipId);
		element.setAttribute("data-vToolTipSwitch", "ON");
		addEvent(element, mainTip);
	}
	this.on = function(element){
		validateElement(element, "Argument 1 of the on() static method must be a valid HTML element");
		if (element.getAttribute("data-TID") != null){
			if(element.getAttribute("data-vToolTipSwitch") == "OFF"){
				element.setAttribute("data-vToolTipSwitch", "ON");
				element.getAttribute("data-tempTitle") != null?element.removeAttribute("title"):null;
			}
		}else{
			throw new Error("No tool tip applied on target element");
		}
	}
	this.off = function(element){
		validateElement(element, "Argument 1 of the off() static method must be a valid HTML element");
		if (element.getAttribute("data-TID") != null){
			if(element.getAttribute("data-vToolTipSwitch") == "ON"){
				element.getAttribute("data-tempTitle") != null?element.setAttribute("title", element.getAttribute("data-tempTitle")):null;
				element.setAttribute("data-vToolTipSwitch", "OFF");
			}
		}else{
			throw new Error("No tool tip applied on target element");
		}
	}
	Object.defineProperties(this.config, {
		tipBoxProperties:{
			set:function(value){
				var temp = "config.tipBoxProperties property array members";
				validateArray(value, "config.arrowColor property expects an arry");
				if(value.length > 2){
					throw new Error(temp+" cannot be more than 2");
				}
				validateArrayMembers(value, "string", temp+ "must all be string");
				tipBoxProperties = value;
			}
		},
	})
	Object.defineProperties(this, {
		initialize:{writable:false},
		config:{writable:false},
		set:{writable:false},
		on:{writable:false},
		off:{writable:false}
	})
}
/****************************************************************/

/***************************Carousel*****************************/
function carousel(container, viewport){
	validateElement(container, "'carousel(x,.)' constructor argument 1 must be an HTML Element");
	validateElement(viewport, "'carousel(.,x)' constructor argument 2 must be an HTML Element");
	var self = this;
	var viewportId = viewport.getAttribute("id");
	var sliders = container.querySelectorAll("#"+viewportId+"> div");
	var current = 0, buttonId=0,forceSld = 0, pauseMode = 0, completed = 1, started = 0,delay = 4000, speed =1000, initialized=0, buttonStyle=null;
	var Interval=null, touchResponse=true;

	//Assign buttons event
	function assingnHandlers(){
		container.onclick = function(e){
			if(e.target.classList.contains("vButton") && e.target.nodeName == "DIV"){
				var id = e.target.getAttribute("data-ratio");
				forceSld = 1;
				viewport.style["transition-delay"] = "0ms";
				buttonId = id;
				forceSlide(id);
			}
		};
	}
	function forceSlide(ratio){
		var leftValue = parseInt(ratio)*100;
		viewport.style["left"] = -leftValue+"%";
		completed = 0;
	}
	function checkNext(current){
		var check = current.nextElementSibling;
		if(check!=null){
			return true;
		}else {
			return false
		}
	}
	function nextSlide(ele){
		if(pauseMode == 0 && completed== 1){
			var currentView =  viewport.querySelector("div[data-activeDisplay='1']");
			if(checkNext(currentView)){
				current = current+100;
				ele.style["left"] = -current+"%";
			}else{
				ele.style["left"] = "0";
				current = 0;
			}
			completed = 0;
		}
	}
	function createControls(){
		var controlArea = document.createElement("DIV");
		var buttonsCons = document.createElement("DIV");

		controlArea.setAttribute("class", "vControlArea");
		buttonsCons.setAttribute("class", "vControlButtonsCon");

		for(var x=0;x<sliders.length;x++){
			var buttonsShell = document.createElement("DIV");
			var button = document.createElement("DIV");
			var id = x+1;
			buttonsShell.setAttribute("class", "vControlButtonsShell");
			x == 0?button.setAttribute("class", "vButton active"):button.setAttribute("class", "vButton");
			button.setAttribute("id", "b"+id);
			button.setAttribute("data-ratio", x);
			buttonsShell.appendChild(button);
			buttonsCons.appendChild(buttonsShell);
		}

		controlArea.appendChild(buttonsCons);
		container.appendChild(controlArea) != null?assingnHandlers():null;
	}
	function createControlStyles(){
		if (document.querySelector("style[data-id='carouselStyles']") == null){
			var css = "";
			if(buttonStyle != null){
				css += ".vButton{"+buttonStyle[0]+"}"; //Normal button
				if(buttonStyle[1] != undefined || buttonStyle[1] != undefined){
					css += ".vButton.active{"+buttonStyle[1]+"}"; //active button
				}
			}
			attachStyleSheet("carouselStyles", css);
		}
	}
	function startSlide(){
		var m_delay = delay + speed;
		clearTimeout(Interval)
		Interval = setTimeout(function(){
			if(pauseMode == 0){
				nextSlide(viewport);
			}
		}, m_delay);		
	}
	function forceSetCurrent(activeButton, previousActive, node){
		//unset any current view
		previousActive.setAttribute("data-activeDisplay", "0");

		var x = viewport.querySelector("div[data-ratio='"+node+"']");
		x.setAttribute("data-activeDisplay", "1");

		//Set buttons
		activeButton.classList.remove("active");//remove previous
		var selectedButton = document.querySelector(".vControlButtonsShell div[data-ratio='"+node+"']");
		selectedButton.classList.add("active");//remove previous
	}
	function touchEndCallBack(node){
		var activeButton = document.querySelector(".vControlButtonsShell .active");
		var previousActive =  viewport.querySelector("div[data-activeDisplay='1']");
		forceSetCurrent(activeButton, previousActive, node);
	}
	this.initialize = function(){
		if(initialized == 0){
			viewport.style["transition-duration"] = speed+"ms";
			//Place sliders in order
			Object.values(sliders).forEach(function(itemContent, arrayIndex, targetArray){
				var leftValue = arrayIndex*100;
				itemContent.style["left"] = leftValue+"%";
				arrayIndex==0?itemContent.setAttribute("data-activeDisplay", "1"):itemContent.setAttribute("data-activeDisplay", "0");
				itemContent.setAttribute("data-ratio", arrayIndex);
			});

			//Assign event listeners
			container.onmouseenter = function (){
				pauseMode = 1;	
				completed = 1;			
			}
			container.onmouseleave = function (){
				pauseMode = 0;
				startSlide();
			}

			viewport.addEventListener("transitionend", function(e){
				var activeButton = document.querySelector(".vControlButtonsShell .active");
				var previousActive =  viewport.querySelector("div[data-activeDisplay='1']");
				var id = null;
				if(e.target.classList.contains("posUpdate")){
					return;
				}
				if(forceSld == 0){
					//Assign new active
					if(checkNext(previousActive)){
						//set next
						previousActive.nextElementSibling.setAttribute("data-activeDisplay", "1");
						id = 	previousActive.nextElementSibling.getAttribute("data-ratio");
					}else {// reached the last
						//set the 1st child
						sliders[0].setAttribute("data-activeDisplay", "1");
						id = 0;
					}

					// unset previous
					previousActive.setAttribute("data-activeDisplay", "0");

					//Set buttons
					activeButton.classList.remove("active");//remove previous
					var nextActiveButton = document.querySelector(".vControlButtonsShell div[data-ratio='"+id+"']");
					nextActiveButton.classList.add("active");//remove previous
					completed = 1;
					startSlide();
				}else if (forceSld == 1) {
					//unset any current view
					previousActive.setAttribute("data-activeDisplay", "0");
					forceSetCurrent(activeButton, previousActive, buttonId);
					completed = 1;
					forceSld=0;
				}
			}, false);
			
			//Enable touch if specified
			if(touchResponse){
				var touchHdr = new touchHandler(container);
				touchHdr.config.slideCallBack = touchEndCallBack;
				touchHdr.config.viewPortTransition = "all 1500ms cubic-bezier(0,.98,0,.98) 0s";
				touchHdr.initialize();
				touchHdr.enableTouch();
			}
			createControlStyles();
			createControls();
			initialized = 1;
		}
	}
	this.start = function (){
		if(started==0){
			startSlide();
			started=1;
		}
	};
	this.config = {

	}
	Object.defineProperties(this, {
		initialize:{
			writable:false
		},
		start:{
			writable:false
		},
		config:{
			writable:false
		}
	});
	Object.defineProperties(this.config, {
		delay:{
			set:function (value){
				validateNumber(value, "'config.delay' property value must be numeric");
				value<0?value=0:null;
				delay = value;
			}
		},
		speed:{
			set:function (value){
				validateNumber(value, "'config.speed' property value must be numeric");
				value<0?value=0:null;
				speed = value;
			}
		},
		buttonStyle:{
			set:function(value){
				//value = [a, b] => a = string styles for normal button state; b =>  string styles for active button state
				var temp = "'config.buttonStyle' property value must be an array";
				validateArray(value, temp);
				if(value.length>2){
					throw new Error(" of either 1 or 2 element(s)");
				}
				validateString(value[0], " of strings");
				value[1] != undefined?validateString(value[1], " of strings"):null;
				buttonStyle = value;
			}
		},
		touchResponse:{
			set:function(value){
				validateBoolean(value, "config.touchResponse property expects a boolean");
				touchResponse = value;
			}
		}
	})
}
/****************************************************************/

/***************************content loader*****************************/
function contentLoader(){
	var customStyle="", initialize=false, targetElement=null, cache=false, tempStoarage={}, activeProperties=null, autoLoad=false;
	var defaultURL="", callBackFn= null;
	this.loadFrom = function(url=null, element=null){
		validateString(url, "loadFrom(x) method argument 1, must be a string");
		if(initialize == false){
			throw new Error("Must initialize first before calling the loadFrom() method");
		}
		if(activeProperties != null){//2nd argument needed, for setting active link
			if(autoLoad == false){
				validateElement(element, "loadFrom(.x) method argument 2 must be an element");
			}
		}
		if(cache){//Attempt load from storage
			if(typeof(Storage) !== "undefined"){ //Supports web storage
				if(sessionStorage.pageLink != undefined){//atleast a page has been cached
					var existingLinks 	= JSON.parse(sessionStorage.getItem("pageLink"));
					var urlArr 			= Object.values(existingLinks);
					if(urlArr.indexOf(url) != -1){//link exist, so get content
						var index 		= urlArr.indexOf(url);
						var content 	= JSON.parse(sessionStorage.getItem("linkContent"))
						var arrContent	= Object.values(content);
						insertData(arrContent[index], element);
						callBackFn != null? callBackFn(element):null;
					}else{//link does not exist, get from server
						getContent(url, element);
					}
				}else{//pageContent has no data, load from server and create data
					getContent(url, element);
				}
			}else{//Does not support web storage, use object
				if(tempStoarage.pageLink != undefined){//atleast a page has been cached
					var existingLinks 	= JSON.parse(tempStoarage["pageLink"]);
					var urlArr 			= Object.values(existingLinks);
					if(urlArr.indexOf(url) != -1){//link exist, so get content
						var index 		= urlArr.indexOf(url);
						var content 	= JSON.parse(tempStoarage["linkContent"]);
						var arrContent	= Object.values(content);
						insertData(arrContent[index], element);
						callBackFn != null? callBackFn(element):null;
					}else{//link does not exist, get from server
						getContent(url, element);
					}
				}else{//pageContent has no data, load from server and create data
					getContent(url, element);
				}
			}
		}else{//Load from server
			getContent(url, element);
		}
	}
	this.initialize = function(){
		if(initialize == false){
			if(targetElement == null){
				throw new Error("Parent container not specified, please specify using the config.targetElement() method, and try initializing again");
			}
			if(autoLoad == true){//Attach event handler to links
				//link class must be supplied;
				//link data- attribute for url must be supplied
	
			}
			if(customStyle != ""){ //Custom style set
				addCustomStyle();
			}
			targetElement.classList.add("xcon");
			if(defaultURL != ""){
				getContent(defaultURL, null, true);
			}
			initialize = true;
		}
	}
	this.config = {}
	function getContent(url, e=null, initCall = false){
		var xhr = ajax.create();
		xhr.addEventListener("load", function(){
			//Set active link, if enabled
			if(initCall != true){
				activeProperties != null?setActiveLink(e):null;
			}
			
			//insert
			//targetElement.style["opacity"] = 0;
			//targetElement.classList.remove("xforce");
			targetElement.innerHTML = xhr.responseText;
			//targetElement.scollHeight;
			//targetElement.style["opacity"] = 1;
			
			if(cache){//insert and cache data
				//cache
				if(typeof(Storage) !== "undefined"){ //Supports web storage
					if(sessionStorage.pageLink == undefined){
						sessionStorage.pageLink 	= JSON.stringify({});
						sessionStorage.linkContent 	= JSON.stringify({});
					}
					var pageLink 		= JSON.parse(sessionStorage.pageLink);
					var linkContent		= JSON.parse(sessionStorage.linkContent);
					
					var length 			= Object.keys(pageLink).length;
					
					pageLink[length] 	= url;
					linkContent[length] = xhr.responseText;

					//rebuild
					sessionStorage.pageLink 	= JSON.stringify(pageLink);
					sessionStorage.linkContent 	= JSON.stringify(linkContent);
				}else{//Does not support web storage, use object
					if(tempStoarage.pageLink == undefined){
						tempStoarage.pageLink		= JSON.stringify({});
						tempStoarage.linkContent 	= JSON.stringify({});
					}
					var pageLink 		= JSON.parse(tempStoarage.pageLink);
					var linkContent		= JSON.parse(tempStoarage.linkContent);
					
					var length 			= Object.keys(pageLink).length;
					
					pageLink[length] 	= url;
					linkContent[length] = xhr.responseText;

					//rebuild
					tempStoarage.pageLink 	= JSON.stringify(pageLink);
					tempStoarage.linkContent 	= JSON.stringify(linkContent);
				}
			}

			//call callback function if enable
			callBackFn != null? callBackFn(e):null;
		});
		xhr.open("POST", url, true);
		//show loader here
		//targetElement.classList.add("xforce");
		insertLoader();
		xhr.send();
	}
	function insertData(data, e){
		//Set active link, if enabled
		activeProperties != null?setActiveLink(e):null;
		targetElement.innerHTML = data;
	}
	function setActiveLink(e){//
		var parent = document.querySelector("#"+activeProperties[0]);
		var prevActive = parent.querySelector("."+activeProperties[1]);
		prevActive != null?prevActive.classList.remove(activeProperties[1]):null;
		e.classList.toggle(activeProperties[1]);
	}
	function insertLoader(){
		var con = document.createElement("DIV");
		con.setAttribute("id", "loaderCon");
		var spinner = document.createElement("DIV");
		spinner.setAttribute("id", "xSpin");
		DOMelement.center(spinner);
		con.appendChild(spinner);
		targetElement.appendChild(con);
	}
	function addCustomStyle(){
		var css = "";
		if(customStyle[0] != ""){//overlay style
			css += "#loaderCon{"+customStyle[0]+"}";
		}
		if(customStyle[1] != ""){//loaderBox style
			css += "#loaderCon #xSpin{"+customStyle[1]+"}";
		}
		if(customStyle[2] != ""){//loaderIcon style
			css += "#loaderCon #xSpin::before{"+customStyle[2]+"}";
		}
		attachStyleSheet("contentLoader", css);
	}
	Object.defineProperties(this, {
		loadFrom:{writable:false},
		config:{writable:false},
		initialize:{writable:false}
	})
	Object.defineProperties(this.config, {
		targetElement:{
			set:function (value){
				validateElement(value, "config.targetElement property must be a valid HTML element");
				targetElement = value;
			}
		},
		cache:{
			set: function (value){
				validateBoolean(value, "config.cache property must be boolean");
				cache = value;
			}
		},
		activeProperties :{
			set:function(value){
				var temp ="config.activeProperties property value must be an array";
				validateArray(value, temp);
				if(value.length == 2){
					//[a, b] => a= link parent id, b= links class name  
					var temp2 = "with element 1 being a string, which sets the id name of link elements parent";
					validateString(value[0], temp+temp2);
					validateString(value[1], temp+temp2+ " and element 2 a string of class name of links");
					if(document.querySelector("#"+value[0]) == null){//check if parent exist
						throw new Error(temp+" element 1 ID name is not in use");
					}
					activeProperties = value;
				}else{
					throw new Error(temp + " of 2 elements");
				}
			}
		},
		autoLoad:{//This property if enable loads data into target parent onclick
			set: function (value){
				validateBoolean(value, "config.autoLoad property must be boolean");
				autoLoad = value;
			}
		},
		customStyle :{
			set:function(value){
				var temp1 = "config.customStyle property";
				var temp2 = temp1+" value must ";
				function temp3 (n){return " array value element "+n+" must be a string or null"}
				validateArray(value, temp2+" be an array");
				validateArrayLength(value, 3, temp2+"be an array of 3 members");
				if(value[0] != null){ //has overlay style
					validateString(value[0], temp1 + temp3(1));
				}
				if(value[1] != null){ //has loaderBox style
					validateString(value[1], temp1 + temp3(2));
				}
				if(value[2] != null){ //has loaderIcon style
					validateString(value[2], temp1 + temp3(2));
				}
				customStyle = value;
			}
		},
		defaultURL:{
			set:function(value){
				validateString("config.default property value must be a string");
				defaultURL = value;
			}
		},
		callBackFn:{
			set:function(value){
				validateFunction(value, "config.callBackFn proerty value must be a function");
				callBackFn = value;
			}
		}
	})
}
/**********************************************************************/

/***************************Touch handler*****************************/
function touchHandler(frame){
	var initialTouchPos={}, slideCallBack=null, mode="slider", hasMoved =false, lastTouchPos={}, lastPoint={x:0,y:0},usePoint=0, initialized=false, enabled=false, rafPending=false, currentPosition={x:0,y:0}, pan="x",pressed=false, viewPort=null;
	var pointerDownName = 'pointerdown', slopeValue=0, pointerUpName = 'pointerup', pointerMoveName = 'pointermove', pointerCancelName="pointercancel", viewPortTransition="";
	var moved = 0, node=0, enableTouch=false, maxStop=0, targetDirection=null, SLIDE_LEFT = 1, SLIDE_RIGHT = 2, SLIDE_TOP = 3, SLIDE_BOTTOM = 4, DEFAULT=5, lastPos=0;
	function addTouchEventHandler(){
		if (window.PointerEvent) {
			// Add Pointer Event Listener
			frame.addEventListener(pointerDownName, handleGestureStart, false);
			frame.addEventListener(pointerMoveName, handleGestureMove, false);
			frame.addEventListener(pointerUpName, handleGestureEnd, false);
			frame.addEventListener(pointerCancelName, handleGestureEnd, false);
		}else{
			// Add Touch Listener
			frame.addEventListener('touchstart', handleGestureStart, false);
			frame.addEventListener('touchmove', handleGestureMove, false);
			frame.addEventListener('touchend', handleGestureEnd, false);
			// frame.addEventListener('touchcancel', handleGestureCancel, false);

			// Add Mouse Listener
			frame.addEventListener('mousedown', handleGestureStart, false);
		}
		frame.addEventListener("transitionend", function(e){
			if(mode == "slider"){
				if(e.target.classList.contains("posUpdate")){
					e.target.classList.remove("posUpdate");
					viewPortTransition != ""? viewPort.style.transition = viewPortTransition:null;
					hasMoved = false;
					slideCallBack != null?slideCallBack(node):null;
				}
			}
		}, false);
		window.addEventListener("resize", function(){
			calculateSlope();
		}, false);
	}
	function checkSupport(){
		 /* // [START pointereventsupport] */   
		 if(window.navigator.msPointerEnabled) {
		   pointerDownName = 'MSPointerDown';
		   pointerUpName = 'MSPointerUp';
		   pointerMoveName = 'MSPointerMove';
		   pointerCancelName = 'MSPointerCancel';
		 }
   
		 // Simple way to check if some form of pointerevents is enabled or not
		 window.PointerEventsSupport = false;
		 if(window.PointerEvent || window.navigator.msPointerEnabled) {
		   window.PointerEventsSupport = true;
		 }
		 /* // [END pointereventsupport] */
	}
	function handleGestureStart(e){
		e.preventDefault();
		
		if(e.touches && e.touches.length > 1) {
		  return;
		}
		if(enableTouch){
			document.addEventListener(pointerUpName, handleGestureEnd, false);
			var prop = getCurrentPosition();
			usePoint = pan=="x"?prop["x"]:prop["y"];
			node = prop["n"];

			frame.classList.add("grab");
			initialTouchPos = getPoints(e);
			viewPort.style.transition = 'initial';
			pressed=true;
		}
	}
	function getCurrentPosition(){
		var frameWidth = frame.clientWidth;
		var offset = viewPort.offsetLeft;
		var nPoint = Math.floor(Math.abs(offset/frameWidth));
		nPoint = nPoint>maxStop?nPoint=maxStop:nPoint
		return{
			x:offset,
			y:0,
			n:nPoint
		}
	}
	function handleGestureMove(e){
		e.preventDefault();
		if(pressed){
			
			if(!initialTouchPos) {
				return;
			}

			lastTouchPos = getPoints(e);

			if(rafPending) {
				return;
			}
			
			rafPending = true;
			
			window.requestAnimationFrame(move);
		}
	}
	function getPoints(e){
		var point = {};
		if(e.targetTouches) {
			point.x = e.targetTouches[0].clientX;
			point.y = e.targetTouches[0].clientY;
		} else {
			// Either Mouse event or Pointer Event
			point.x = e.clientX;
			point.y = e.clientY;
		}

		return point;
	}
	function move(){
		if(!rafPending) {
			return;
		}
		if(pan == "x"){
			var diff = initialTouchPos.x - lastTouchPos.x;
		}else{
			var diff = initialTouchPos.y - lastTouchPos.y;
		}

		var newValue = (usePoint - diff);
		lastPoint = newValue;
		moved = diff;
		hasMoved=true;
		
		//use new value here
		viewport.style.left = newValue+"px";
		rafPending = false;
	}
	function handleGestureEnd(e){
		e.preventDefault();
		if(e.touches && e.touches.length > 0) {
		  	return;
		}
		rafPending = false;
		document.removeEventListener(pointerUpName, handleGestureEnd, false);
		if(hasMoved){
			mode =="slider"?updateSliderPosition():updateListPosition();
		}		
		hasMoved == false?viewPort.style.transition = viewPortTransition:null;
		frame.classList.remove("grab");
		initialTouchPos = null;
	}
	function calculateSlope(){
		var frameWidth = frame.clientWidth;
		slopeValue = frameWidth * (1/4);
	}
	function updateSliderPosition(){
		viewPort.style.transition = "all .2s cubic-bezier(0,.99,0,.99) 0s";
		viewport.classList.add("posUpdate");
		if(Math.abs(moved) > slopeValue) {
			//change position
			if(moved < 0){
				targetDirection = pan == "x"?SLIDE_RIGHT:SLIDE_BOTTOM;
			}else{
				targetDirection = pan == "x"?SLIDE_LEFT:SLIDE_TOP;
			}
		}else{
			//return to default position
			targetDirection = DEFAULT;
		}

		//log current position
		logPosition("slider");

		var property = pan == "x"?"left":"top";
		if(targetDirection == DEFAULT){
			viewport.style[property] = usePoint+"px";
		}else if (targetDirection == SLIDE_RIGHT){
			if(node == 0){//no further movement
				viewport.style[property] = "0px";
			}else{//slide right
				viewport.style[property] = -(node*100)+"%";
			}
		}else if (targetDirection == SLIDE_LEFT){
			if(node == maxStop){//no further movement
				viewport.style[property] = -(maxStop*100)+"%";
			}else{//slide left
				viewport.style[property] = -(node*100)+"%";;
			}
		}
		
	}
	function updateListPosition(){

	}
	function logPosition(mode){
		if(mode == "slider"){
			var pWidth = frame.clientWidth;
			switch (targetDirection) {
				case SLIDE_LEFT:
					node++;
					node=node>maxStop?node=maxStop:node;
					var pxValue = ((node*100)/100)*pWidth;
					usePoint = -1*pxValue;
					break;
				case SLIDE_RIGHT:
					node--;
					node=node<0?node=0:node;
					var pxValue = ((node*100)/100)*pWidth;
					usePoint = -1*pxValue;
					break;
				default:
					break;
			}
		}else{

		}
	}
	this.initialize = function(){
		validateElement(frame, "Contructor argument must be a valid HTML element");
		viewPort = frame.children[0];
		var totalChildren = viewPort.childElementCount;
		maxStop = totalChildren-1;
		checkSupport();
		calculateSlope();
		addTouchEventHandler();
		initialized = true;
	}
	this.enableTouch = function(){
		if(initialized == false){
			throw new Error ("Call Obj.initialize() method 1st before calling the obj.enableTouch() method");
		}
		enableTouch = true;
		frame.classList.add("vTouchHandler");
	}
	this.disableTouch = function(){
		if(enableTouch == true){
			enableTouch = false;
			frame.classList.remove("vTouchHandler");
		}
	}
	this.config = {}
	Object.defineProperties(this, {
		initialize:{writable:false},
		config:{writable:false},
		enable:{writable:false},
		disable:{writable:false}
	})
	Object.defineProperties(this.config, {
		pan:{
			set:function(value){
				var temp = "config.pan property expects a string";
				value = value.toLowerCase();
				validateString(value, temp);
				if(value != "x" && value != "y"){
					throw new Error(temp+" value of 'x' or 'y'");
				}
				pan = value;
			}
		},
		viewPortTransition:{
			set:function(value){
				validateString(value, "config.viewPortTransition property expects a string as value");
				viewPortTransition = value;
			}
		},
		mode:{
			set:function(value){
				var temp = "config.mode property expects a string value";
				validateString(value, temp);
				value = value.toLowerCase();
				if(value != "list" && value != "slider"){
					throw new Error(temp+" of 'list' or 'slider'");
				}
				mode = value;
			}
		},
		slideCallBack:{
			set:function(value){
				validateFunction(value, "config.slideCallBack property expects a function as value");
				slideCallBack = value;
			}
		}
	})
}
/**********************************************************************/