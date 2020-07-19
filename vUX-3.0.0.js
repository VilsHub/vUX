/*
 * vUX JavaScript library v3.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2020-07-19T22:30Z
 */

"use strict";
var assetURL="";
var temp = null;
var mainScript = document.querySelector("script[src *='vUX']");
temp = mainScript.getAttribute("src");

var splited = temp.split("/");
splited.splice(1,1, "//");
splited.splice(splited.length-1,1);
for (var x=0; x<splited.length; x++){
	x<3?assetURL += splited[x]:assetURL += "/"+splited[x];
}

//set asset path
assetURL += "/assets/";

window.addEventListener("load", function(){
	//Load needed styles
	loadStyleSheet("css", "selectFormComponent.css");
	loadStyleSheet("css", "radioFormComponent.css");
	loadStyleSheet("css", "checkboxFormComponent.css");
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
	var set = assetURL+type;
	var linkEle = document.createElement("link");
	linkEle.setAttribute("rel", "stylesheet");
	linkEle.setAttribute("type", "text/css");
	linkEle.setAttribute("href", set+"/"+name);
	document.head.appendChild(linkEle);
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
function validateAlpha(input){
	var target = /[^A-Za-z\ ]+/.test(input); //checks for other characters except A-Za-z and space
	if(target==true){
		return false;
	}else {
		return true;
	}
}
function alphaNumeric(input){
	var target= /[^A-Za-z0-9]+/.test(input); //checks for other characters except A-Za-z0-9
	if(target==true){
		return false;
	}else {
		return true;
	}
}
function validateEmailAddress(input){
	var email_filter = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{1,}$/.test(input);//matches email address pattern
	return email_filter;
}
function validateInteger(n){
	return Number(n) === n && n % 1 === 0;
}
function validateFloat(n){
	return Number(n) === n && n % 1 !== 0;
}
function validateFullName(value){
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
			if(!validateAlpha(split[x])){
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
}
function validateSelectField(groupCollection){
	var status=false;
	//check for any selected
	for(var x=0;x<groupCollection.length;x++){
		if(groupCollection[x].checked){
			status==false?status = true:null;
			break;
		}
	}
	return status;
}
function validatePhoneNumber(){
	var input_filter = /^(\+|[0-9])[0-9]+$/.test(input);//matches phone number pattern
	return input_filter;
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
function Ajax(){
}
Ajax.create = function () {
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
function ImageManipulator(canvasElement, image){
	var self = this, initRGB = [], maxGray = [], maxGrayControl = [], maximumLoop = 0, highestDifference =0, currentLoop = 0, initGray = [], maxRGB = [], maxRGBControl = [], speed = 0, diff=0, imageData, width=300, height=300;
	validateElement(canvasElement, "ImageManipulator() constructor argument 1 must be a valid HTML element");
	if(canvasElement.nodeName != "CANVAS") throw new Error("ImageManipulator() constructor argument 1 must be a valid HTML Canvas element");
	validateString(image, "ImageManipulator() constructor argument 2 must be string of image URL");
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

/***********************GridBorderRectangle**********************/
function GridBorderRectangle(){
	var self = this, seg = 0, tf = 0;

	/*******************fixed dashed rectangle starts********************/
	this.fixedRectangle = function (){
		var  FRlinecolor = "black", FRlinewidth = 5, FRsegment = [10,2], FROrigin = [0,0];
		var body = {
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
		}

		Object.defineProperties(body.config, {
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
		Object.defineProperties(body, {
			config:{writable:false},
			draw:{writable:false}
		})

		return body;
	};
	
	
	/*******************************************************************/

	/*******************animated dashed rectangle starts********************/
	this.animatedRectangle = function (){
		var ARlinecolor = "black", ARlinewidth = 5, ARsegment = [10,2], AROrigin = [0,0],ARclockWise	= true,
		ARduration = 3000, AReasing = "linear", ARactive="", ARstop=0, animationCount=1, cycle=0,fn=null;

		var body = {
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
		}
		Object.defineProperties(body.config, {
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
							if(!validateinteger(value)) throw new Error("'iterationCount' property numeric value must be an integer")
							if(value < 0){
								animationCount = 1;
							}else{
								animationCount = value;
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
		Object.defineProperties(body, {
			config:{writable:false},
			draw:{writable:false},
			stop:{writable:false}
		})

		return body;
	};

	/*******************************************************************/

	Object.defineProperty(this, "animatedRectangle", {writable:false});
	Object.defineProperty(this, "fixedRectangle", {writable:false});
}
/****************************************************************/

/************************loadProgress****************************/
function ProgressIndicator(canvasElement){
	var self = this;

//start => can either be 12 0r 3, anything else will default to zero
	validateElement(canvasElement, "ProgressIndicator() constructor argument 1 must be a valid HTML element");
	if(canvasElement.nodeName != "CANVAS"){
		throw new Error("ImageManipulator() constructor argument 1 must be a valid HTML Canvas element");
	}
	
	
	this.circularProgress = function (){
		var canvasObj = canvasElement.getContext('2d'); //initialization
		var start =12,	progressLabel = true, progressBackground	= "#ccc", strokeWidth	= 10, strokeColor	="yellow", radius	= 50, percentageFontColor	= "white",
		percentageFont = "normal normal 2.1vw Verdana", LabelFontColor = "white", LabelFont	= "normal normal .9vw Verdana";
		
		var body = {
			config:{},
			show: function(progress, label){
				if (!valiodateInteger(progress)) throw new Error("circularProgress.show() method argument 1 must be an integer");

				if(progress < 0 || progress >100) throw new Error("circularProgress.show() method argument 1 must be between 0 - 100");
				

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
		}

		Object.defineProperties(body, {
			config:{writable:false},
			show:{writable:false}
		});
		Object.defineProperties(body.config, {
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
					validateNumber(value, "'strokeWidth' property value must be numeric");
					if(!validateInteger(value)) throw new Error ("'strokeWidth' property value must be integer");		strokeWidth = value;
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
						if(!validateInteger(value)) throw new Error ("'radius' property value must be integer");
						radius = value;
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
					validateString(value, "'percentageFont' property value must be string of valid CSS font property value");
					percentageFont = value;
				}
			},
			labelFontColor:{
				set: function(value){
					validateString(value, "'labelFontColor' property value must be string of valid CSS color");
					LabelFontColor = value;
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
	};
	Object.defineProperties(this, {
		circularProgress:{writable:false}
	});
}
/****************************************************************/

/************************ResourceIO**************************/
function ResourceIO(){
	this.uploader = function(){
		var body = {
			upload :function(resource){},
			config : {
			}
		}
		
		Object.defineProperties(body, {
			config:{
				writable:false
			},
			status:{
				get:function(){
					return parseInt(total);
				}
			}
		});
	}
	this.downloader = function(){
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
		var body = {
			config : {
			},
			download :function(resource){
				validateArray(resource, "download() method argument 1 must be an array");
				validateArrayMembers(resource, "type", "download() method argument 1 must be an array of strings specifying the resource URL");
				initializeResource(resource);
			}
		}
		Object.defineProperties(body, {
			config:{writable:false},
			download:{writable:false},
			progress:{
				get:function(){
					return parseInt(total);
				}
			}
			
		});
		Object.defineProperties(body.config, {
			callBackFn:{
				set:function(value){
					validateFunction(value);
					options.OCompleteCallBackfn = value
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

		return body;
	}
	Object.defineProperties(this, {
		uploader:{
			writable:false
		},
		downloader:{
			writable:false
		}
	});
}
/****************************************************************/

/**********************ToBaseGridMultiple************************/
function ToBaseGridMultiple(){
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
function AutoWriter(){
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
	var idType = null;
	validateString(event, "'DOMelement.attachEventHandler()' argument 1 must be a string specifying the event type");
	if(typeof DomClass == "string"){
		idType = "single";
	}else if(Array.isArray(DomClass)){
		validateArrayMembers(DomClass, "string", "'DOMelement.attachEventHandler()' argument 2 must be an array of string(s)");
		idType = "multiple";
	}else{
		throw new Error ("'DOMelement.attachEventHandler()' argument 2 must be a string or array of string, specifying the class name of the element(s) o");
	}
	validateFunction(fn, "'DOMelement.attachEventHandler()' argument 3 must be a function to be called on the trigger");

	document.body.addEventListener(event, function(e){
		if(idType == "single"){
			if(e.target.classList != null){
				if(e.target.classList.contains(DomClass)){
					fn(e);
				}
			}
		}else{
			var total = DomClass.length;
			for(var x=0; x<total; x++){
				if(e.target.classList.contains(DomClass[x])){
					fn(e, DomClass[x]);
					break;
				}
			}
		}
	}, false);
};
DOMelement.hasParent = function(element, parentId, ntimes=null){
	var temp 	= "DOMelement.hasParent(.x) static method argument 2 must be a string", status=false, n=0;
	//parentId => class name , if not exist, then id name
	validateElement(element, "DOMelement.hasParent(x.) static method argument 1 must be a valid HTML element");
	validateString(parentId, temp);
	if(document.querySelector("."+parentId) != null){//Has class
		while(element){
			if(element.nodeName == "BODY") break;
			element = element.parentNode;			
			if(element != null){
				if(element.classList.contains(parentId)){
					status = true;
					break;
				}
			}
			if(ntimes !=null){
				if(n == ntimes-1)break;
				n++;
			}
		}
	}else if(document.querySelector("#"+parentId) != null){//Has id
		while(element){
			if(element.nodeName == "BODY") break;
			element = element.parentNode;
			if(element != null){
				if(element.id == parentId){
					status = true;
					break;
				}
			}
			if(ntimes !=null){
				if(n == ntimes-1)break;
				n++;
			}
		}
	}
	return status;
}
DOMelement.getParent = function(element, parentIDorLevel){
	var temp 	= "DOMelement.getParent(.x) static method argument 2 must be a string", type=null, foundElement=null;
	//parentIDorLevel => class name or DOM level
	validateElement(element, "DOMelement.getParent(x.) static method argument 1 must be a valid HTML element");
	if(typeof parentIDorLevel != "number" && typeof parentIDorLevel != "string"){
		throw new Error("DOMelement.getParent(.x) static method argument 2 must either be a string or number");
	}else{
		if(typeof parentIDorLevel == "number"){
			type = "number";
		}else{
			type = "string";
		}
	}
	if(type == "string"){
		while(element){
			element = element.parentNode;
			if(element != null){
				if(element.classList.contains(parentIDorLevel)){
					foundElement = element;
					break;
				}
			}
		}
	}else{
		parentIDorLevel = parentIDorLevel < 0?0:parentIDorLevel;
		for(var x = 0; x<parentIDorLevel;x++){
			element = element.parentNode;
			if(element == null){
				foundElement = element;
				break;
			}
			if(x == parentIDorLevel-1){
				foundElement = element;
			}
		}
	}
	return foundElement;
}
/****************************************************************/

/********************Verticalal scroll handler*******************/
function VerticalScroll(){
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
VerticalScroll.query = function(totalHeight=null){
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
function ListScroller(container, listParent){
	//listParent 	=> the ul element
	//container		=> Element housing the ul element
	validateElement(container, "An HTML element needed as list parent container");
	validateElement(listParent, "List parent is not a valid HTML element");
	var maxAdd = 0, paddingRight = 0,	ready = 0, listening=0, running=0;
	var listPlane = "x", menuWidth = 170, Xbuttons = [], Ybuttons = [], scrollSize = 175, effects = [1, "linear"], inactiveButtonsClassName = [], paddingLeft=0, paddingY=[], menuHeight=23,paddingY=[0,0], wrapperStyle="width:100%", spaceError=0, restyleOnActive=false;
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
			if(listening == 1){
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
	}
	function clickHandler(e){
		//button left
		if(e.target.classList.contains("vListBt-Left") && e.target == Xbuttons[0]){
			if (listening == 1){
				if (running == 0){
					scrollToRight(e);
				}
			}
		}

		//button Right
		if(e.target.classList.contains("vListBt-Right") && e.target == Xbuttons[1]){
			if (listening == 1){
				if(running == 0){
					scrollToleft(e);
				}
			}
		}
		//button top
		if(e.target.classList.contains("vListBt-Top") && e.target == Ybuttons[0]){
			if (listening == 1){
				if(running == 0){
					scrollToTop(e);
				}
			}
		}
		//button Right
		if(e.target.classList.contains("vListBt-Bottom") && e.target == Ybuttons[1]){
			if (listening == 1){
				if(running == 0){
					scrollTolBottom(e);
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
		var containerSize = container.getBoundingClientRect()["width"]+spaceError;
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
	function scrollToTop(e){}
	function scrollTolBottom(e){}
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
				toggleClass("a", 0);
				toggleClass("a", 1);
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
		}
	};
	this.onScroller = function (){
		if(ready == 1){
			listening = 1;
			scrollStatus();
			restyleOnActive?addVitalStyles():null
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
					} catch (error) {}
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
				var temp = "ListScroller.config.Xbuttons property value must be an array ";
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
				var temp = "ListScroller.config.Ybuttons property value must be an array ";
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
		},
		spaceError:{
			set:function(value){
				if(!validateInteger(value)) throw new Error ("config.spaceError property expects an integet");
				spaceError = value<0?0:value;
			}
		},
		restyleOnActive:{
			set:function(value){
				validateBoolean(value, "'config.restyleOnActive' property value must be a boolean");
				restyleOnActive = value;
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
function BrowserResizeProperty(){
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
function FormComponents(){	
	/*********Helpers***********/
	function withLabel(ele){
		var labelEle = ele.nextElementSibling == null?ele.previousElementSibling:ele.nextElementSibling;
		ele.parentNode.style["display"] = "flex";
		if(labelEle != null){
			if(labelEle.nodeName == "LABEL"){
				return {
					status:true,
					label:labelEle
				}
			}else{
				if(labelEle.nodeName != "DIV"){
					throw new Error ("All input elements to be made custom must be wrapped with a DIV element");
				}else{
					return {
						status:false,
						label:labelEle
					}
				}
			}
		}else{
			return null;
		}
	}
	function setSuperActive(ele){
		var anyActive = document.querySelector(".superActive");
		anyActive != null?anyActive.classList.remove("superActive"):null;
		ele.classList.add("superActive");
	}
	function unsetSuperActive(ele){
		ele.classList.remove("superActive");
	}
	/***************************/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom select builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	this.select = function(){
		var selectDim=[], selectIcon="", wrapperStyle="", toolTipHandler=null, enableToolTip = false, selectFieldStyle="", optionStyle="",  selectClassName="", searchIconStyle="", includeSearchField=true, optionsWrapperStyle="", familyID="vSelect", inputButtonStyle="";
		/************************************************************************************/
		//selectDim[a,b] a=> width of select cElement , b=> height of select cElemt
		/************************************************************************************/
		function autoPlace(optionsCon){
			var sField = optionsCon.previousElementSibling.querySelector(".sField");
			var sFieldBottomOffset = sField.getBoundingClientRect()["bottom"];
			var diff = innerHeight - sFieldBottomOffset;
			var optionsConHeight = getOptionsConHeight(optionsCon);
			
			//Display in approriate space
			if(sFieldBottomOffset >= diff){
				if(optionsConHeight <= diff){
					optionsCon.style["top"] = (parseInt(selectDim[1])+1)+"px";
					optionsCon.style["bottom"] = "auto";
				}else{
					optionsCon.style["bottom"] = (parseInt(selectDim[1])+1)+"px";
					optionsCon.style["top"] = "auto";
				}
			}else{
				optionsCon.style["top"] = (parseInt(selectDim[1])+1)+"px";
				optionsCon.style["bottom"] = "auto";
			}
		}
		function dumpOptions(container, sOptions, selectField, isMultiple, pid=null, n={v:0}){
			var totalOptions = sOptions.length;
			var parent = DOMelement.getParent(sOptions[0], "xSnative");
			for(var x=0; x<totalOptions; x++){
				
				if(sOptions[x].nodeName == "OPTION"){//An option
					var optionValue = sOptions[x].innerHTML;
					var optionEle = document.createElement("DIV");
					var index = sOptions[x].index;
					sOptions[x].getAttribute("disable") != null ?optionEle.setAttribute("data-disabled", "true"):optionEle.setAttribute("data-disabled", "false");
					optionEle.setAttribute("order", ++n.v);
					if(isMultiple == true){//multiple select
						if(sOptions[x].selected){
							var comma = selectField.innerHTML.length>0?", ":"";
							selectField.innerHTML += comma+sOptions[x].innerHTML;
							optionEle.classList.add("vSselected");
						}
					}else{//single select
						if(sOptions[x].index === parent.selectedIndex){//Check for selected
							selectField.innerHTML = sOptions[x].innerHTML;
							optionEle.classList.add("vSselected");
						}
					}				
					
					if(sOptions[x].parentNode.nodeName == "OPTGROUP"){
						optionEle.classList.add("innerOpt");
						optionEle.setAttribute("data-pid", pid);
					}
					optionEle.classList.add("sOption");
					optionEle.setAttribute("data-index", index);
					optionEle.setAttribute("tabindex", "0");
					optionEle.appendChild(document.createTextNode(optionValue));
					container.appendChild(optionEle);
				}else{
					var optionGroupLabel = sOptions[x].getAttribute("Label");
					var optionGroupEle = document.createElement("DIV");
					optionGroupEle.classList.add("sOptionGroup");
					optionGroupEle.setAttribute("data-gid", "g"+x);			
					optionGroupEle.setAttribute("order", ++n.v);			
					optionGroupEle.appendChild(document.createTextNode(optionGroupLabel));
					container.appendChild(optionGroupEle);
					var allOptions = sOptions[x].children;
					dumpOptions(container, allOptions, selectField, isMultiple, "g"+x, n);
				}
			}
			if(isMultiple){
				if(enableToolTip){
					configureToolTip(parent, selectField);
				}
			}
		}
		function selectOption(ele, nativeSelect){
			var labelCon = DOMelement.getParent(ele, 2).previousElementSibling.children[0];
			var optionIndex = ele.getAttribute("data-index");
			var isMultiple = nativeSelect.getAttribute("multiple");
			var optionsCon = DOMelement.getParent(ele, 2);
				
			if(isMultiple != null){
				var selectState = ele.classList.contains("vSselected");
				if(selectState){//deselect
					var currentLabel = labelCon.innerHTML.split(",");
					var trimLabels = currentLabel.map(function(val){
						return val.trim();
					})
					var index = trimLabels.indexOf(ele.innerHTML.trim());
					trimLabels.splice(index, 1);
					var newLabel = trimLabels.join(", ");
					labelCon.innerHTML = newLabel;
					ele.classList.remove("vSselected");
					nativeSelect.options[optionIndex].selected = false;
				}else{//select
					ele.classList.add("vSselected");
					var comma = labelCon.innerHTML.length>0?", ":"";
					labelCon.innerHTML += comma+ele.innerHTML;
					nativeSelect.options[optionIndex].selected = true;
				}
				configureToolTip(nativeSelect, labelCon);
			}else{
				//Set slected option in main select input
				nativeSelect.selectedIndex = optionIndex;
				
				//Update select label
				labelCon.innerHTML = ele.innerHTML;

				//unset existing selected
				var existingSelection = ele.parentNode.querySelector(".vSselected");
				if(existingSelection != null){
					existingSelection.classList.remove("vSselected");
				}
				ele.classList.add("vSselected");
				toggleOptionList(optionsCon, "close");
			}

			//Trigger change event on main select input
			nativeSelect.dispatchEvent(new Event("change"));
		};
		function configureToolTip(nativeSelect, labelCon){
			//Set select mode
			var multiple =false;
			nativeSelect.getAttribute("multiple") != null?multiple=true:null;
			var tip = labelCon.innerHTML;
			
			var r = tip.replace(/, /g,  "</br>");
			if(enableToolTip && multiple){
				labelCon.setAttribute("title", r);
				toolTipHandler.on(labelCon);
			}else if(multiple && !enableToolTip){
				toolTipHandler.off(labelCon);
			}
		}
		function hover(ele){
			var any = ele.parentNode.querySelector(".hovered");
			any != null ? any.classList.remove("hovered"):null;
			//Add to current
			ele.classList.add("hovered");
		}
		function unhover(ele){
			ele.classList.remove("hovered");
		}
		function toggleOptionList(optionsCon, action, fast=null){
			var sField = optionsCon.previousElementSibling.querySelector(".sField");
			var selectButton = sField.nextElementSibling;
			var wrapper = sField.parentNode.parentNode;
			var readyState = (optionsCon.classList.contains("opening") || optionsCon.classList.contains("closing"))?"no":"yes";
			if(readyState == "yes"){
				autoPlace(optionsCon);
				if (action == "open"){ //open list
					closeAnyOpen(sField);
					//show listOptionCon
					optionsCon.style["display"] = "block";
					var height = optionsCon.scrollHeight;
					optionsCon.style["height"] = height+"px";
					optionsCon.classList.add("opening");
					sField.setAttribute("data-state", "opened");
					selectButton.classList.add("iconOpen");
					selectButton.classList.remove("iconClose");
					setSuperActive(wrapper);
				}else if (action == "close") {//close list
					var prevHovered = optionsCon.querySelector(".hovered");
					var inputEle = optionsCon.querySelector(".sSearchInput");
					var allHidden = optionsCon.querySelectorAll(".sHide");
					if (prevHovered != null){
						//Remove to current
						prevHovered.classList.remove("hovered");
					}
					if(fast != null){
						optionsCon.style["display"] = "none";
						optionsCon.style["height"] = "0px";
						sField.setAttribute("data-state", "closed");
						unsetSuperActive(wrapper);
					}else{
						//hide optionsCon
						optionsCon.style["height"] = optionsCon.scrollHeight+"px";
						optionsCon.scrollHeight;
						optionsCon.style["height"] = "0px";
						optionsCon.classList.add("closing");
						sField.setAttribute("data-state", "closed");
						sField.classList.remove("sActive");
					}
					//clear search history
					includeSearchField?inputEle.value = "":null;
					if(allHidden.length > 0){
						var total = allHidden.length;
						for(var x=0; x<total; x++){
							allHidden[x].classList.remove("sHide");
						}
					}
					selectButton.classList.remove("iconOpen");
					selectButton.classList.add("iconClose");
					
				}
			}
		}
		function scrollOptions(ele, dir){
			var openState = ele.querySelector(".sField").getAttribute("data-state");
			var optionsCon = ele.querySelector(".sOptionCon");
			var nextOption;
			function getNext(whl=false){
				if(dir  == "down"){
					nextOption = whl ==false ?activeHovered.nextElementSibling:nextOption.nextElementSibling;
					if(nextOption == null){// set to the last
						var allOptions = ele.querySelectorAll(".sOption[data-disabled='false']");
						nextOption = allOptions[0];
					}
				}else{
					nextOption = whl ==false ? activeHovered.previousElementSibling:nextOption.previousElementSibling;
					if(nextOption == null){// set to the last
						var allOptions = ele.querySelectorAll(".sOption[data-disabled='false']");
						var total = allOptions.length;
						nextOption = allOptions[total-1];
					}
				}

			}
			if(openState == "opened"){
				var activeHovered = ele.querySelector(".hovered");
				var optionsCon = ele.querySelector(".sOptionCon");
				var order;
				var pixMove; 
				var scrolled = optionsCon.scrollTop;
				var targetScroll;
				if(activeHovered == null){
					var  startHovered = ele.querySelector(".sOption[data-disabled='false']");
					startHovered.dispatchEvent(new MouseEvent('mouseover', { 'bubbles': true }));
					order = startHovered.getAttribute("order");
					pixMove = startHovered.scrollHeight;
				}else{
					getNext();
					while(nextOption.classList.contains("sOptionGroup") || nextOption.getAttribute("data-disabled") == "true"){
						getNext(true);
					}
					activeHovered.dispatchEvent(new MouseEvent('mouseout', { 'bubbles': true }));
					nextOption.dispatchEvent(new MouseEvent('mouseover', { 'bubbles': true }));
					order = nextOption.getAttribute("order");
					pixMove = nextOption.scrollHeight;
				}
				targetScroll = (order-1)*pixMove;
				optionsCon.scrollTo(0,targetScroll);
			}
		}
		function getOptionsConHeight(optionsCon){
			var children = optionsCon.querySelectorAll(".sOption:not(.sHide)");
			var height = children.length>0? parseInt(DOMelement.cssStyle(children[0], "height"))*children.length:0;		
			return height = includeSearchField? height + (parseInt(selectDim[0])+5):height+5;
		}
		function closeAnyOpen(ele){
			var anyOpen = document.querySelectorAll(".sField[data-state='opened']");
			var total = anyOpen.length;
			if(total > 0){
				for(var x=0;x<total;x++){
					var optionsCon = anyOpen[x].parentNode.nextElementSibling;
					if(anyOpen[x] != ele){
						toggleOptionList(optionsCon, "close", "fast");
					}
				}
			}
		}
		function selectStyleSheet(){
			if (document.querySelector("style[data-id='v"+selectClassName+"']") == null){
				//set wrapper class name
				var css = "";
				css += ".v"+selectClassName + " {width:"+selectDim[0]+"; height:"+selectDim[1]+"; z-index: 60;}";
				css += ".v"+selectClassName + " .sField {line-height:"+selectDim[1]+";}";
				css += ".v"+selectClassName + " .sIcon::before {line-height:"+selectDim[1]+";}";
				css += ".v"+selectClassName + " .sSearchBox::before {line-height:"+selectDim[1]+";height:"+selectDim[1]+"}";
				if(selectIcon != ""){
					css += ".v"+selectClassName + " .sIcon::before {"+selectIcon+"}";
				}
				if(searchIconStyle != ""){
					css += ".v"+selectClassName + " .sSearchBox::before{"+searchIconStyle+"}";
				}
				if(optionStyle != ""){
					css += ".v"+selectClassName + " .sOptionCon .sOption{"+optionStyle+"}";
				}
				if(optionsWrapperStyle != ""){
					css += ".v"+selectClassName + " .sOptionCon{"+optionsWrapperStyle+"}";
				}
				if(inputButtonStyle != ""){
					css += ".v"+selectClassName + " .sIcon{"+inputButtonStyle+"}";
				}
				attachStyleSheet("v"+selectClassName, css);
			}
		}
		function reCreateSelect (){
			var allSelects = document.querySelectorAll("."+selectClassName);
			for(var x=0; x<allSelects.length; x++){
				runSelectBuild(allSelects[x]);
			}	
		}
		function runSelectBuild(nativeSelect){
			var selectParent = nativeSelect.parentNode;
			var multiple =false;
			var selectParentPosition = DOMelement.cssStyle(selectParent, "position");
			
					
			//hideNative
			nativeSelect.classList.add("xSnative", "vItem"); //vItem added for validation module support
			nativeSelect.setAttribute("tabindex", "-1");

			//Style parent
			selectParentPosition == "static"?selectParent.style.position = "relative":null;
			
			//Set select mode
			nativeSelect.getAttribute("multiple") != null?multiple=true:null;
			if(enableToolTip && multiple){
				toolTipHandler = new ToolTip();
				toolTipHandler.initialize();
			};
			//Wrapper Element
			var wrapper = document.createElement("DIV");
			wrapper.classList.add("vSelect", "v"+selectClassName);
			wrapper.setAttribute("tabindex", "0");
			if(wrapperStyle != ""){
				wrapper.style = wrapperStyle;
			}

			//Select field
			var selectFieldCon = document.createElement("DIV");
			var selectField = document.createElement("DIV");
			var selectIcon = document.createElement("DIV");
			if(selectFieldStyle != ""){
				selectField.style = selectFieldStyle;
			}
			selectFieldCon.classList.add("sFieldCon");
			selectFieldCon.style["height"] = selectDim[1];
			selectField.classList.add("sField");
			selectField.setAttribute("data-state", "closed");
			selectIcon.classList.add("sIcon", "iconClose");
			selectFieldCon.appendChild(selectField);
			selectFieldCon.appendChild(selectIcon);

			//append into wrapper
			wrapper.appendChild(selectFieldCon);

			//Options Field
			var optionsFieldCon = document.createElement("DIV");
			var optionsField = document.createElement("DIV");
			optionsFieldCon.classList.add("optionsCon");
			optionsField.classList.add("sOptionCon");

			// Search field
			if(includeSearchField == true){
				var selectSearchBox = document.createElement("DIV");
				var selectSearchInput = document.createElement("INPUT");
				selectSearchBox.classList.add("sSearchBox");
				selectSearchInput.classList.add("sSearchInput");
				selectSearchInput.setAttribute("tabindex", "0");
				selectSearchBox.appendChild(selectSearchInput);
				optionsFieldCon.appendChild(selectSearchBox);
			}

			//Get native select children
			var navtieSelectChildren = nativeSelect.children;
			var totalNavtieSelectChildren = navtieSelectChildren.length;
			if(totalNavtieSelectChildren > 0){
				dumpOptions(optionsField, navtieSelectChildren, selectField, multiple);
			}
			
			optionsFieldCon.appendChild(optionsField);

			//append to wrapper
			wrapper.appendChild(optionsFieldCon);

			//insert wrapper before native select
			selectParent.insertBefore(wrapper, nativeSelect);
		}
		function selectInputState(ele, id){
			var status;
			if(id == "icon"){
				status = ele.previousElementSibling.getAttribute("data-state")
			}else if(id == "sfield"){
				status = ele.getAttribute("data-state")
			}
			return status;
		}
		function assignSelectEventHandler(){
			DOMelement.attachEventHandler("transitionend", "optionsCon", function(e){
				if(e.target.classList.contains("closing")){//close
					var wrapper = e.target.parentNode;
					e.target.style["display"] = "none";
					e.target.classList.remove("closing");
					unsetSuperActive(wrapper);
				}else if(e.target.classList.contains("opening")){
					e.target.classList.remove("opening");
				}
			})
			DOMelement.attachEventHandler("click", ["sIcon", "sOption", "sField"], function(e, id){
				if(id == "sIcon"){
					var openState = selectInputState(e.target, "icon");
					var optionsCon = DOMelement.getParent(e.target, 2).querySelector(".optionsCon");			
					if(openState == "opened"){ //close
						toggleOptionList(optionsCon, "close");
					}else{//open
						toggleOptionList(optionsCon, "open");
					}
				}else if(id == "sOption"){
					if(e.detail == 1){
						if(e.target.getAttribute("data-disabled") == "false"){
							var mainSelect = DOMelement.getParent(e.target, 3).nextElementSibling;
							selectOption(e.target, mainSelect);
						}
					}
				}else if(id == "sField"){
					var openState = selectInputState(e.target, "sfield");
					var optionsCon = e.target.parentNode.nextElementSibling;
					if(openState == "opened"){ //close
						toggleOptionList(optionsCon, "close");
					}else{//open
						toggleOptionList(optionsCon, "open");
					}
				}
			});
			DOMelement.attachEventHandler("mouseover", "sOption", function(e){
				if(e.target.getAttribute("data-disabled") == "false"){
					hover(e.target);
				}
			});
			DOMelement.attachEventHandler("mouseout", "sOption", function(e){
				unhover(e.target);
			});
			DOMelement.attachEventHandler("dblclick", "sOption", function(e){
				if(e.detail == 2){
					var selectButton = DOMelement.getParent(e.target, 2).previousElementSibling.children[1];
					var optionsCon = DOMelement.getParent(e.target, 2);
					toggleOptionList(optionsCon, "close");
					selectButton.classList.add("iconClose");
					selectButton.classList.remove("iconOpen");
				}
			})
			DOMelement.attachEventHandler("input", "sSearchInput", function(e){
				var searchQuery = e.target.value.toLowerCase();
				var optionsCon = e.target.parentNode.nextElementSibling;
				var allOptions = optionsCon.querySelectorAll("div");
				var optionsConParent = optionsCon.parentNode;
				
				var total = allOptions.length;

				function checkQuery(option){
					var OptionLabel = option.innerHTML.trim().toLowerCase();
					var regex = new RegExp(searchQuery);
					if(regex.test(OptionLabel)){
						option.classList.remove("sHide");
					}else{
						option.classList.add("sHide");
					}
				}
				for(var x=0;x<total;x++){
					if(allOptions[x].classList.contains("sOption")){
						checkQuery(allOptions[x]);
					}else if(allOptions[x].classList.contains("sOptionGroup")){
						var id = allOptions[x].getAttribute("data-gid");
						var groupChildren = allOptions[x].parentNode.querySelectorAll("[data-pid='"+id+"']");
						var totalGroupChildren = groupChildren.length;	
						for(var y=0; y<totalGroupChildren; y++){
							checkQuery(groupChildren[y]);
						}

						// Hide option group when all children a hidden
						var allHiddenChildren = allOptions[x].parentNode.querySelectorAll(".sHide[data-pid='"+id+"']");
						var parsedHiddenLength = allHiddenChildren != null? allHiddenChildren.length:0;
						if(groupChildren.length == parsedHiddenLength){
							allOptions[x].classList.add("sHide");
						}else{
							allOptions[x].classList.remove("sHide");
						}
					}				
				}
				optionsConParent.style["height"] = "auto";
				autoPlace(optionsConParent);
			})
			DOMelement.attachEventHandler("keydown", "v"+selectClassName, function(e){
				var khdlr = keyboardEventHanler(e);
				var optionsCon = e.target.querySelector(".optionsCon");
				var sField = e.target.querySelector(".sField");
				if (khdlr["handled"] == true) {
					if (khdlr["type"]  == 1){
						// Suppress "double action" if event handled
						closeAnyOpen(sField);
						toggleOptionList(optionsCon, "open");
						if(e.key == "ArrowDown" | "Down"){
							e.preventDefault();
							scrollOptions(e.target, "down");
						}else if (e.key == "ArrowUp" | "Up") {
							e.preventDefault();
							scrollOptions(e.target, "up");
						}else if (e.key == "Enter") {
							var ele = e.target.querySelector(".hovered");
							var nativeSelect = e.target.nextElementSibling;
							selectOption(ele, nativeSelect);
						}
					}else if(khdlr["type"] == 2){

					}else if(khdlr["type"] == 3){

					}
				}
			})
			DOMelement.attachEventHandler("focusin", "sOption", function(e){
				hover(e.target);
			})
			addEventListener("scroll", function(){
				var anyOpen = document.querySelector(".sField[data-state='opened']");
				if(anyOpen != null){
					var optionsCon = anyOpen.parentNode.nextElementSibling;
					autoPlace(optionsCon);
				}
			},false)
			document.addEventListener("click", function (e){
				if(!DOMelement.hasParent(e.target, familyID, 4)){
					var anyOpen = document.querySelector(".sField[data-state='opened']");
					if(anyOpen != null){
						var optionsCon = anyOpen.parentNode.nextSibling;
						toggleOptionList(optionsCon, "close", "fast");
					}
				}
			}, false)
		}

		var body = {
			autoBuild: function(){
				if (selectDim.length == 0){
					throw new Error("Setup imcomplete: select input dimension needed, specify using the 'config.selectSize' property");
				}
				if(selectClassName == ""){
					throw new Error("Setup imcomplete: slect input class name must be supllied, specify using the 'config.className' property");
				}
				var existingSheet = document.querySelector("#v"+selectClassName);
				existingSheet == null?selectStyleSheet():null;
				reCreateSelect();
				assignSelectEventHandler();
			},
			refreshSelect:function(nativeSelect){ //Refreshes a particular select element to update custom content
				validateElement(nativeSelect, "selectSelect.refresh() method expects a valid HTML as argument 1");
				nativeSelect.classList.contains(selectClassName)?runSelectBuild(nativeSelect):null;
			},
			refresh:function(parent){
				validateElement(parent, "select.refresh() method expects a valid HTML as argument 1");
				var allNewSelect = parent.querySelectorAll("select:not(.xSnative)");
				var totalNewSelects = allNewSelect.length;
				if(totalNewSelects > 0){
					for (var x=0; x<totalNewSelects; x++){
						allNewSelect[x].classList.contains(selectClassName)?runRadioBuild(allNewSelect[x]):null;
					}
				}
			},
			config:{}
		}
		Object.defineProperties(body, {
			autoBuild:{writable:false},
			refresh:{writable:false},
			refreshSelect:{writable:false},
			config:{writable:false}
		})
		Object.defineProperties(body.config, {
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
					validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property");
					wrapperStyle = value;
				}
			},
			selectFieldStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'selectFieldStyle' property");
					selectFieldStyle = value;
				}
			},
			optionsWrapperStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'optionsWrapperStyle' property");
					optionsWrapperStyle = value;
				}
			},
			optionStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'optionStyle' property");
					optionStyle = value;
				}
			},
			optionGroupStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'config.optionGroupStyle' property");
					optionGroupStyle = value;
				}
			},
			inputIconStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'config.inputIconStyle' property");
					selectIcon = value;
				}
			},
			inputButtonStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'config.inputButtonStyle' property");
					inputButtonStyle = value;
				}
			},
			className:{
				set:function(value){
					validateString(value, "config.className property expect a string as value");
					selectClassName = value;
				}
			},
			selectFieldToolTip:{
				set:function(value){
					validateBoolean(value, "config.selectFieldToolTip property expect a boolean as value");
					enableToolTip = value;
				}
			},
			searchIconStyle:{
				set:function(value){
					validateString(value, "A string of valid CSS styles needed for the 'config.searchIconStyle' property");
					searchIconStyle = value;
				}
			},
			includeSearchField:{
				set:function(value){
					validateBoolean(value, "config.includeSearchField property expect a boolean as value");
					includeSearchField=value;
				}
			}
		})
		return body;
	};
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom radio builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	this.radio = function(){
		var radioDim =[], radioWrapperStyle="", selectedStyle = "", deselectedStyle ="", radioClassName="",
		mouseEffect = [];
		/************************************************************************************/
		//radioDim[a,b] a=> width of select cElement , b=> height of select cElemt
		//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
		/************************************************************************************/
	
		function radioStyleSheet(){
			if (document.querySelector("style[data-id='v"+radioClassName+"']") == null){
				 var css = "";
				css +=  ".v"+radioClassName + " {width:"+radioDim[0]+"; height:"+radioDim[1]+"}";
				css +=  ".v"+radioClassName + " .deselected:hover::before{"+mouseEffect[0]+";}";
				css +=  ".v"+radioClassName + " .deselected:active::before{"+mouseEffect[1]+";}";
				css +=  ".v"+radioClassName + " .selected::before{font-size:"+radioDim[0]+";}";
				css +=  ".v"+radioClassName + " .deselected::before{font-size:"+radioDim[0]+";}";
	
				if(selectedStyle != ""){
					css +=  ".v"+radioClassName + " .selected::before {"+selectedStyle+"}";
				}
				if(deselectedStyle != ""){
					css +=  ".v"+radioClassName + " .deselected::before{"+deselectedStyle+"}";
				}
				attachStyleSheet("v"+radioClassName, css);
			}
		}
		function reCreateRadio (){
			var allRadios = document.querySelectorAll("."+radioClassName);
			for(var x=0; x<allRadios.length; x++){
				runRadioBuild(allRadios[x]);
			}		
		}
		function runRadioBuild(nativeRadioButton){
			var hasLabel = withLabel(nativeRadioButton);
			var parent   = nativeRadioButton.parentNode;
			var radioParentPosition = DOMelement.cssStyle(parent, "position");
			
			//hideNative
			nativeRadioButton.classList.add("xRnative", "vItem"); //vItem added for validation module support
			nativeRadioButton.setAttribute("tabindex", "-1");
			radioParentPosition == "static"?parent.style.position = "relative":null;
	
			if(hasLabel["status"]){
				hasLabel["label"].style["min-height"] = radioDim[1];
				hasLabel["label"].classList.add("vRadioButtonLabel");
			}
	
			var radioWrapper = document.createElement("DIV");
			radioWrapper.classList.add("vRadioButtonWrapper", "v"+radioClassName);
			
			var customRadioButtonSelected = document.createElement("DIV");
			var customRadioButtonDeselected = document.createElement("DIV");
	
			
			var selectIndex = 0;
			var deselectIndex = 0;
			if(nativeRadioButton.checked){
				selectIndex = 1;
				radioWrapper.setAttribute("data-selected", 1);
				customRadioButtonSelected.setAttribute("tabindex", "0");
				customRadioButtonSelected.setAttribute("class", "vRadioButton selected");
				customRadioButtonDeselected.setAttribute("tabindex", "-1");
			}else{
				deselectIndex = 1;
				customRadioButtonDeselected.setAttribute("class", "vRadioButton deselected");
				radioWrapper.setAttribute("data-selected", 0);
				customRadioButtonDeselected.setAttribute("tabindex", "0");
				customRadioButtonSelected.setAttribute("tabindex", "-1");
			}
			
			customRadioButtonDeselected.classList.add("vRadioButton", "ds");
			customRadioButtonSelected.classList.add("vRadioButton", "sel");
			customRadioButtonSelected.setAttribute("style", "z-index:"+selectIndex);
			customRadioButtonDeselected.setAttribute("style", "z-index:"+deselectIndex);
			
	
			if(radioWrapperStyle != ""){
				radioWrapper.setAttribute("style", radioWrapperStyle);
			}
	
			radioWrapper.appendChild(customRadioButtonSelected);
			radioWrapper.appendChild(customRadioButtonDeselected);
	
			//Add wrapper before target select;
			var radioParent = nativeRadioButton.parentNode;
			radioParent.insertBefore(radioWrapper, nativeRadioButton);
		}
		function assignRadioEventHanler(){
				DOMelement.attachEventHandler("click", "vRadioButton", function(e){
					e.stopImmediatePropagation();
					var mainRadio = e.target.parentNode.nextElementSibling;
					if(e.target.classList.contains("ds")){ //Select non selected
						//deselect any selected
						var totalradios = DOMelement.getParent(e.target, 3).querySelectorAll("."+radioClassName);
						if(totalradios.length > 1){
							var nxt = null;
							var activeSelected = DOMelement.getParent(e.target, 3).querySelector(".selected");
							if (activeSelected != null){
								var nxt = activeSelected.parentNode.querySelector(".ds");
								hideClicked(activeSelected, nxt, "any");
							}						
						}	
						var nxt = e.target.parentNode.querySelector(".sel");
						hideClicked(e.target, nxt, "checked");
					}
					mainRadio.click();
				})
				DOMelement.attachEventHandler("click", "vRadioButtonLabel", function(e){
					e.stopImmediatePropagation();
					var targetRadio = e.target.parentNode.querySelector("[tabindex='0']");
					targetRadio != null ? targetRadio.click():null;
				})
		}
		function hideClicked(ele, nxt, type){
			if(type == "any"){
				//Show deslelect radio
				if(nxt != null){
					nxt.classList.add("deselected");
					nxt.classList.remove("selected");
				}
				
				//hide selected radio
				ele.classList.remove("selected");
			}else{
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
				autoBuild: function(){
					if (radioDim.length == 0){
						throw new Error("Setup imcomplete: radio component dimension needed, specify using the 'radioButtonSize' property");
					}
					if(radioClassName == ""){
						throw new Error("Setup imcomplete: radio buttons class name must be supllied, specify using the 'config.className' property");
					}
					var existingSheet = document.querySelector("#v"+radioClassName);
					existingSheet == null?radioStyleSheet():null;
					reCreateRadio();
					assignRadioEventHanler();
				},
				refresh:function(parent){
					validateElement(parent, "radio.refresh() method expects a valid HTML as argument 1");
					var allNewRadios = parent.querySelectorAll("input[type='radio']:not(.xRnative)");
					var totalNewRadios = allNewRadios.length;
					if(totalNewRadios > 0){
						for (var x=0; x<totalNewRadios; x++){
							allNewRadios[x].classList.contains(radioClassName)?runRadioBuild(allNewRadios[x]):null;
						}
					}
				},
				config:{}
		}
		
		Object.defineProperties(body, {
			autoBuild:{writable:false},
			config:{writable:false},
			refresh:{writable:false}
		})
		Object.defineProperties(body.config, {
			radioButtonSize:{
				set:function(value){
					var temp = "'config.radioButtonSize' property value must be an array";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+" of 2 Elements");
					validateArrayMembers(value, "dimension", temp+" of strings CSS dimensions");
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
			selectedRadioStyle:{
				set:function(value){
					if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedStyle' property")){
						selectedStyle = value;
					}
				}
			},
			deselectedRadioStyle:{
				set:function(value){
					if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedStyle' property")){
						deselectedStyle = value;
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
			className:{
				set:function(value){
					if(validateString(value, "config.className property expect a string as value")){
						radioClassName = value;
					}
				}
			}
		})
		return body;
	}	
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom checkBox builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	this.checkbox = function(){
		var checkboxDim =[], checkboxWrapperStyle="", checkedStyle = "", uncheckedStyle ="", checkboxClassName="",
		mouseEffect = [];
		/************************************************************************************/
		//checkboxDim[a,b] a=> width of checkbox cElement , b=> height of checkbox cElemt
		//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
		/************************************************************************************/

		function checkboxStyleSheet(){
			if (document.querySelector("style[data-id='v"+checkboxClassName+"']") == null){
				var css = "";
				css +=  ".v"+checkboxClassName + " {width:"+checkboxDim[0]+"; height:"+checkboxDim[1]+"}";
				mouseEffect[0] != undefined ?css +=  ".v"+checkboxClassName + " .unchecked:hover::before{"+mouseEffect[0]+";}":null;
				mouseEffect[1] != undefined ?css +=  ".v"+checkboxClassName + " .unchecked:active::before{"+mouseEffect[1]+";}":null;
				css +=  ".v"+checkboxClassName + " .checked::before{font-size:"+checkboxDim[0]+";}";
				css +=  ".v"+checkboxClassName + " .unchecked::before{font-size:"+checkboxDim[0]+";}";

				if(checkedStyle != ""){
					css +=  ".v"+checkboxClassName + " .checked::before {"+checkedStyle+"}";
				}
				if(uncheckedStyle != ""){
					css +=  ".v"+checkboxClassName + " .unchecked::before{"+uncheckedStyle+"}";
				}
				attachStyleSheet("v"+checkboxClassName, css);
			}
		}
		function reCreateCheckbox (){
			var allCheckboxes = document.querySelectorAll("."+checkboxClassName);
			for(var x=0; x<allCheckboxes.length; x++){
				runCheckboxBuild(allCheckboxes[x]);
			}		
		}
		function runCheckboxBuild(nativeCheckbox){
			var hasLabel = withLabel(nativeCheckbox);
			var parent   = nativeCheckbox.parentNode;
			var checkboxParentPosition = DOMelement.cssStyle(parent, "position");
			
			//hideNative
			nativeCheckbox.classList.add("xCnative", "vItem"); //vItem added for validation module support
			nativeCheckbox.setAttribute("tabindex", "-1");
			checkboxParentPosition == "static"?parent.style.position = "relative":null;
			if(hasLabel != null){
				if(hasLabel["status"]){
					hasLabel["label"].style["min-height"] = checkboxDim[1];
					hasLabel["label"].classList.add("vCheckboxLabel");
				}
			}

			var checkboxWrapper = document.createElement("DIV");
			checkboxWrapper.classList.add("vCheckboxWrapper", "v"+checkboxClassName);
			
			var customCheckboxChecked = document.createElement("DIV");
			var customCheckboxUnchecked = document.createElement("DIV");

			
			var checkedIndex = 0;
			var uncheckedIndex = 0;
			if(nativeCheckbox.checked){
				checkedIndex = 1;
				checkboxWrapper.setAttribute("data-checked", 1);
				customCheckboxChecked.setAttribute("tabindex", "0");
				customCheckboxChecked.setAttribute("class", "vCheckbox checked");
				customCheckboxUnchecked.setAttribute("tabindex", "-1");
			}else{
				uncheckedIndex = 1;
				customCheckboxUnchecked.setAttribute("class", "vCheckbox unchecked");
				checkboxWrapper.setAttribute("data-checked", 0);
				customCheckboxUnchecked.setAttribute("tabindex", "0");
				customCheckboxChecked.setAttribute("tabindex", "-1");
			}
			
			customCheckboxUnchecked.classList.add("vCheckbox", "unchk");
			customCheckboxChecked.classList.add("vCheckbox", "chk");
			customCheckboxChecked.setAttribute("style", "z-index:"+checkedIndex);
			customCheckboxUnchecked.setAttribute("style", "z-index:"+uncheckedIndex);
			

			if(checkboxWrapperStyle != ""){
				checkboxWrapper.setAttribute("style", checkboxWrapperStyle);
			}

			checkboxWrapper.appendChild(customCheckboxChecked);
			checkboxWrapper.appendChild(customCheckboxUnchecked);

			//Add wrapper before target select;
			var checkboxParent = nativeCheckbox.parentNode;
			checkboxParent.insertBefore(checkboxWrapper, nativeCheckbox);
		}
		function assignCheckboxEventHanler(){
				DOMelement.attachEventHandler("click", "vCheckbox", function(e){
					e.stopImmediatePropagation();
					var mainCheckbox = e.target.parentNode.nextElementSibling;
					if(e.target.classList.contains("unchk")){ //check action, apply check
						var nxt = e.target.parentNode.querySelector(".chk");
						toggleCheckbox(e.target, nxt, "check");
					}else{
						var nxt = e.target.parentNode.querySelector(".unchk");
						toggleCheckbox(e.target, nxt, "unchecked"); //uncheck action, apply uncheck
					}

					mainCheckbox.click();
				})
				DOMelement.attachEventHandler("click", "vCheckboxLabel", function(e){
					e.stopImmediatePropagation();
					var targetCheckbox = e.target.parentNode.querySelector("[tabindex='0']");
					targetCheckbox != null ? targetCheckbox.click():null;
				})
		}
		function toggleCheckbox(ele, nxt, type){
			if(type == "check"){
				//Show checked checkbox
				nxt.classList.add("checked");
				nxt.classList.remove("unchecked");
				
				//hide unchecked checkbox
				ele.classList.remove("unchecked");
			}else{
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
			autoBuild: function(){
				if (checkboxDim.length == 0){
					throw new Error("Setup imcomplete: checkbox component dimension needed, specify using the 'checkboxSize' property");
				}
				if(checkboxClassName == ""){
					throw new Error("Setup imcomplete: checkbox buttons class name must be supllied, specify using the 'config.className' property");
				}
				var existingSheet = document.querySelector("#v"+checkboxClassName);
				existingSheet == null?checkboxStyleSheet():null;
				reCreateCheckbox();
				assignCheckboxEventHanler();				
			},
			refresh:function(parent){
				validateElement(parent, "checkbox.refresh() method expects a valid HTML as argument 1");
				var allNewCheckboxes = parent.querySelectorAll("input[type='checkbox']:not(.xCnative)");
				var totalNewCheckboxes = allNewCheckboxes.length;
				if(totalNewCheckboxes > 0){
					for (var x=0; x<totalNewCheckboxes; x++){
						allNewCheckboxes[x].classList.contains(checkboxClassName)?runCheckboxBuild(allNewCheckboxes[x]):null;
					}
				}
			},
			config:{}
		}
		
		Object.defineProperties(body, {
			autoBuild:{writable:false},
			config:{writable:false},
			refresh:{writable:false}
		})
		Object.defineProperties(body.config, {
			checkboxSize:{
				set:function(value){
					var temp = "'config.radioButtonSize' property value must be an array";
					validateArray(value, temp);
					validateArrayLength(value, 2, temp+" of 2 Elements");
					validateArrayMembers(value, "dimension", temp+" of strings CSS dimensions");
					checkboxDim = value;
				}
			},
			wrapperStyle:{
				set:function(value){
					if(validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")){
						checkboxWrapperStyle = value;
					}
				}
			},
			checkedCheckboxStyle:{
				set:function(value){
					if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedStyle' property")){
						checkedStyle = value;
					}
				}
			},
			uncheckedCheckboxStyle:{
				set:function(value){
					if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedStyle' property")){
						uncheckedStyle = value;
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
			className:{
				set:function(value){
					validateString(value, "config.className property expect a string as value")
					checkboxClassName = value;
				}
			}
		})
		return body;
	}
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Date Picker^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/	
	this.datePicker = function(){
		Date.prototype.isValid =function(){
			return this.getTime() == this.getTime();
		}
		var falseState="cX.1zwAP", trueState="mp.3Cy._Xa";
		var tooTipHandler= null, dateInputIconStyle=[], daysToolTip=false ,months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], shiftPoint=320, labelProperties=[], daysToolTipProperties=[], datePickerClassName="", datePickerDim=["100%", "35px"], dateFieldStyle="", selectionStyle="", validationAttribute="", familyID="vDatePicker", listControllerObj= null,inputButtonStyle="";

		function autoPlace(dateBox){
			var dField = dateBox.previousElementSibling.children[0];
			var wrapper = DOMelement.getParent(dField, 2);
			var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
			var dFieldBottomOffset = dField.getBoundingClientRect()["bottom"];
			var diff = innerHeight - dFieldBottomOffset;
			var dateBoxHeight = dateComponents["timeParts"] == null?264:499;

			
			//Display in approriate space
			if(dFieldBottomOffset >= diff){
				if(dateBoxHeight <= diff){//to bottom
					dateBox.style["top"] = (parseInt(datePickerDim[1])+1)+"px";
					dateBox.style["bottom"] = "auto";
					hideArrow(wrapper, "bottom");
				}else{//to top
					dateBox.style["bottom"] = (parseInt(datePickerDim[1])+1)+"px";
					dateBox.style["top"] = "auto";
					hideArrow(wrapper, "top");

				}
			}else{//to bottom
				dateBox.style["top"] = (parseInt(datePickerDim[1])+1)+"px";
				dateBox.style["bottom"] = "auto";
				hideArrow(wrapper, "bottom");
			}
		}
		function hideArrow(wrapper, target){
			var topArrow = wrapper.querySelector(".vtop");
			var bottomArrow = wrapper.querySelector(".vbottom");
			if(target == "top"){
				topArrow.style["display"] = "none";
				bottomArrow.style["display"] = "block";
			}else{
				topArrow.style["display"] = "block";
				bottomArrow.style["display"] = "none";
			}
		}
		function createStyles(){
			if (document.querySelector("style[data-id='"+datePickerClassName+"']") == null){
				var css = "";
				css += ".vDateIcon::before {line-height:"+datePickerDim[1]+"}";
				if(dateInputIconStyle[0] != undefined){
					css += ".vDateIcon::before {"+dateInputIconStyle[0]+"}";
				}
				if(dateInputIconStyle[1] != undefined){
					css += ".vDateIcon:hover::before {"+dateInputIconStyle[1]+"}";
				}
				if(dateInputIconStyle[2] != undefined){
					css += ".vDateIcon:active::before {"+dateInputIconStyle[2]+"}";
				}
				if(selectionStyle != ""){
					css += ".vDatePicker .vSelected{"+selectionStyle+"}";
				}
				if(inputButtonStyle != ""){
					css += ".vDateIcon{"+inputButtonStyle+"}";
				}
				attachStyleSheet(datePickerClassName, css);
			}
		}
		function AddEventHandlers(){
			DOMelement.attachEventHandler("click", ["vDateIcon", "range", "year", "month", "day", "vbActive", "vClose", "dField", "meridianSwitchCon", "tbuttonActive"], function(e, id){
				if(id == "vDateIcon" || id == "dField"){
					var wrapper = DOMelement.getParent(e.target, 2);
					var pickerState = wrapper.querySelector(".dField").getAttribute("data-state");
					pickerState == "closed"?showDateBox(wrapper):closeDateBox(wrapper);
				}else if(id == "range"){//hide rangeBox and show yearsCon
					var wrapper = DOMelement.getParent(e.target, 6);
					var yearSeries = parseInt(e.target.getAttribute("data-range"));
					var rangeCon = DOMelement.getParent(e.target, 2);
					var yearsCon = wrapper.querySelector(".vYearsCon");
					var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
					generateYears(yearSeries, yearsCon);
					rangeCon.style["height"] = "0%";
					rangeCon.style["opacity"] = "0";
					rangeCon.style["z-index"] = "0";
					rangeCon.classList.contains("displayActive")?rangeCon.classList.remove("displayActive"):null;

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
					dateComponents["timeParts"] != null ?toggleDoneButton(wrapper):null;
					listControllerObj.offScroller();
				}else if(id == "year"){//hide yearsCon and show MonthsCon
					var wrapper = DOMelement.getParent(e.target, 5);
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
					year == maxYear?stopMonth = maxMonth-1:stopMonth = 11;
					year == minYear?startMonth = minMonth:startMonth = 0;
					for (var x=0; x<=stopMonth; x++){
						if (x < startMonth-1) continue;
						var month = document.createElement("DIV");
						month.classList.add( "month");
						addVitalStyle(month);
						var selectedMonth = getSelectedValue(nativeDateInput, "month");
						if(selectedMonth-1 == x){
							month.classList.add("vSelected");
						}
						x<9?month.setAttribute("data-value", "0"+(x+1).toString()):month.setAttribute("data-value", x+1);
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
					dateComponents["timeParts"] != null ?toggleDoneButton(wrapper):null;
					updateActive(wrapper, e.target, "year");
					toggleBackButton(wrapper);
				}else if(id == "month"){//hide monthCon and show days
					var wrapper = DOMelement.getParent(e.target, 5);
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

					if (month=="4" || month=="6" || month=="9" || month=="11"){
						stopDay = 29;
					}else if(month=="2"){
						var leapYear = parseInt(dateComponents[0])%4;
						if(leapYear == 0){
							stopDay =28;
						}else{
							stopDay =27;
						}
					}else{
						stopDay = 30;
					}

					(selectedYear == maxYear && month == maxMonth)?stopDay = maxDay-1:stopDay = stopDay;
					(selectedYear == minYear && month == minMonth)?startDay = minDay-1:startDay = 0;
					
					//Generate days
					for (var x=0; x<=stopDay; x++){
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
					dateComponents["timeParts"] != null ?toggleDoneButton(wrapper):null;
					daysToolTip==true?createToolTip(wrapper):null;
				}else if(id == "day"){//hide dayCon and show time if specified
					var wrapper = DOMelement.getParent(e.target, 5);
					var nativeDateInput = wrapper.nextElementSibling;
					var includeTime = pickerType(nativeDateInput);
					var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
					var day = e.target.getAttribute("data-value");
					var daysCon = e.target.parentNode;
					dateComponents["dateParts"][2] = fixDigitLength(day);
					writeToInput(wrapper, dateComponents);	
					if(!includeTime){//Close Date picker Box
						wrapper.querySelector(".vDateBoxHeader").innerHTML = "Exiting...";
						closeDateBox(wrapper)
					}else{
						var hrinput = wrapper.querySelector(".hr");
						hrinput.value.length<1?hrinput.focus():null;
						updateActive(wrapper, e.target, "day");
					}
					updateActive(wrapper, e.target, "day");
					dateComponents["timeParts"] != null ?toggleDoneButton(wrapper):null;
				}else if(id == "vbActive"){//Back button clicked
					var wrapper = DOMelement.getParent(e.target, 4);
					var currentDisplay = wrapper.querySelector(".displayActive");
					var prev = wrapper.querySelector(".displayActive").previousElementSibling;
					currentDisplay.classList.remove("displayActive");
					currentDisplay.classList.add("temp");
					currentDisplay.style["height"] = "0%";
					currentDisplay.style["width"] = "0%";
					currentDisplay.style["opacity"] = "0";
					currentDisplay.style["z-index"] = "0";
					currentDisplay.scrollHeight;
					if(prev != null){
						prev.classList.add("rewind");
						prev.style["display"] = "flex";
						prev.scrollHeight;
						prev.style["height"] = "100%";
						prev.style["opacity"] = "1";
						prev.style["z-index"] = "1";
						if (!(prev.classList.contains("vDateRangeCon"))){
							prev.style["width"] = "100%";
						}else if(prev.classList.contains("vDateRangeCon")){
							listControllerObj.onScroller();
						}
					}
				}else if(id == "vClose"){//close button clicked
					var wrapper = DOMelement.getParent(e.target, 4); 
					closeDateBox(wrapper);
				}else if(id == "meridianSwitchCon"){//meridian switch button clicked
					var wrapper = DOMelement.getParent(e.target, 5);
					var hrValue = wrapper.querySelector(".hr").value;
					if(hrValue>0){
						toggleMeridianSwitch(e.target);
						reCompute24hours(wrapper);
					}
				}else if(id == "tbuttonActive"){
					var wrapper = DOMelement.getParent(e.target, 4);
					closeDateBox(wrapper);
				}		
			})
			//_______Transition control
			DOMelement.attachEventHandler("transitionend", ["displayActive", "vDateBoxTool", "rangeToYear", "yearToMonth", "monthToDay", "dayToTime", "rewind", "temp", "meridianSwitchCon", "vDateRangeCon"], function(e, id){
				if(id == "displayActive"){
					var wrapper = DOMelement.getParent(e.target, 4)
					wrapper.querySelector(".vDateBoxHeader").innerHTML = e.target.getAttribute("data-title");
				}
				if(id == "rangeToYear"){//Hide rangeCon
					var wrapper = DOMelement.getParent(e.target, 4);
					var rangeCon = wrapper.querySelector(".vDateRangeCon");
					e.target.classList.remove("rangeToYear");
				}
				if (id == "yearToMonth") {//Hide yearsCon
					e.target.classList.remove("yearToMonth");
				}
				if (id == "monthToDay") {//Hide monthsCon
					e.target.classList.remove("monthToDay");
				}
				if (id == "rewind") {//previous
					var wrapper = DOMelement.getParent(e.target, 4);
					if(e.target.classList.contains("vDateRangeCon")){
						var rangeCon = wrapper.querySelector(".vDateRangeCon");
						rangeCon.style["display"] = "flex";
						rangeCon.classList.add("displayActive");
					}else{
						e.target.classList.add("displayActive");
					}
					toggleBackButton(wrapper);
					e.target.classList.remove("rewind");
				}
				if (id == "temp") {//previous
					e.target.classList.remove("temp");
				}
				if (id == "meridianSwitchCon") {//meridian switch
					var label = e.target.parentNode;
					var wrapper = DOMelement.getParent(e.target, 5);
					if(e.target.classList.contains("pm")){
						label.classList.remove("AMon");
						label.classList.add("PMon");
					}else {
						label.classList.add("AMon");
						label.classList.remove("PMon");
					}
				}
				if(id == "vDateBoxTool"){
					var wrapper = e.target.parentNode
					var dField = wrapper.querySelector(".dField");

					if(e.target.classList.contains("opening")){
						e.target.classList.remove("opening");
						dField.setAttribute("data-state", "opened");
					}else if(e.target.classList.contains("exiting")){
						var yearsRangeCon = wrapper.querySelector(".vDateRangeCon");
						if(yearsRangeCon != null){
							yearsRangeCon.style["display"] = "flex";
							yearsRangeCon.style["height"] = "100%";
						}else{
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
			DOMelement.attachEventHandler("input", ["hr", "min"], function(e, id){
				var wrapper = DOMelement.getParent(e.target, 6);
				if(id == "hr"){
					var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
					var meridian = wrapper.querySelector(".meridianSwitchCon").classList.contains("am")?"am":"pm";
					if(e.target.value.length > 0){
						e.target.value = minMaxInt(e.target.value, 1, 12);
						var value = e.target.value;
						var pint = parseInt(value);
						dateComponents["timeParts"][0] = fixDigitLength(convertTo12hours(pint, meridian));
					}else{
						dateComponents["timeParts"][0] = "HH";
					}
					writeToInput(wrapper, dateComponents);
				}else if(id == "min"){
					var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
					if(e.target.value.length > 0){
						e.target.value = minMaxInt(e.target.value, 0, 59);
						var value = parseInt(e.target.value);
						dateComponents["timeParts"][1] = fixDigitLength(value);
					}else{
						dateComponents["timeParts"][1] = "MM";
					}
					writeToInput(wrapper, dateComponents);
				}
				toggleDoneButton(wrapper);
			})
			DOMelement.attachEventHandler("focusout", ["hr", "min"], function(e, id){
				e.target.value = fixDigitLength(e.target.value);
			})
			window.addEventListener("resize", function(e){
				var anyOpenDate = document.querySelector(".dField[data-state='opened']");
				if(anyOpenDate != null){
					var wrapper = DOMelement.getParent(anyOpenDate, 2);
					var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
					var dateBoxArrow = wrapper.querySelectorAll(".vDateBoxArrow");
					shift(dateBoxParent, dateBoxArrow);
				}
			})
			addEventListener("scroll", function(){
				var anyOpen = document.querySelector(".dField[data-state='opened']");
				if(anyOpen != null){
					var dateBox = anyOpen.parentNode.nextElementSibling;
					autoPlace(dateBox);
				}
			},false)
			document.addEventListener("click", function (e){
				if(!DOMelement.hasParent(e.target, familyID, 8)){
					var anyOpen = document.querySelector(".dField[data-state='opened']");
					if(anyOpen != null){
						closeDateBox(DOMelement.getParent(anyOpen, 2));
					}
				}
			}, false)
			DOMelement.attachEventHandler("mouseover", "meridianSwitchCon", function(e){
				var wrapper = DOMelement.getParent(e.target, 5);
				var hrValue = wrapper.querySelector(".hr").value;
				hrValue>0?e.target.style["cursor"] = "pointer":e.target.style["cursor"] = "not-allowed";
				
			})
		}
		function toggleMeridianSwitch(ele){
			var wrapper = DOMelement.getParent(ele, 5);
			if(ele.classList.contains("am")){
				ele.classList.remove("am");
				ele.classList.add("pm");
			}else {
				ele.classList.add("am");
				ele.classList.remove("pm");
			}
		}
		function checkSave(wrapper){
			var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
			var dField = wrapper.querySelector(".dField");
			var nativeDateInput = wrapper.nextElementSibling;
			if(isCompleted(dateComponents)){
				dField.setAttribute("data-completed", trueState);
				nativeDateInput.setAttribute(validationAttribute, "true");
			}else{
				nativeDateInput.setAttribute(validationAttribute, "false");
				dField.setAttribute("data-completed", falseState);
			}
		}
		function fixDigitLength(digit){
			return digit.toString().length == 1?"0"+digit:digit;
		}
		function activateOK(wrapper){
			var button = wrapper.querySelector(".buttonCon button");
			button.classList.remove("tbuttonInactive");
			button.classList.add("tbuttonActive");
		}
		function deactivateOK(wrapper){
			var button = wrapper.querySelector(".buttonCon button");
			button.classList.add("tbuttonInactive");
			button.classList.remove("tbuttonActive");
		}
		function toggleDoneButton(wrapper){
			var dateComponents = dateComponentsVariables(wrapper)["dateComponents"];
			isCompleted(dateComponents)?activateOK(wrapper):deactivateOK(wrapper);
		}
		function generateYears(SeriesStartYear, yearsCon){
			yearsCon.innerHTML = "";
			var nativeDateInput = DOMelement.getParent(yearsCon, 4).nextElementSibling;
			var n=0;
			var sYear = getDateRangeComponents(nativeDateInput)["min"].split("-")[0];
			var maxYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
			var nxtSeriesStart = parseInt(SeriesStartYear)+10;
			for(var x=0; x<22;x++){
				var nxtYear = SeriesStartYear++;
				if (nxtYear >= nxtSeriesStart) break;
				if (nxtYear > maxYear) break;
				if(nxtYear >= sYear){
					n++;
					var year = document.createElement("DIV");
					year.classList.add("year");
					var selectedYear = getSelectedValue(nativeDateInput, "year");
					selectedYear == nxtYear?year.classList.add("vSelected"):null
					addVitalStyle(year);
					year.appendChild(document.createTextNode(nxtYear));
					yearsCon.appendChild(year);
					if (n == 11) break;
				}
			}
		}
		function reCreateDatePicker (){
			var allDatePickers = document.querySelectorAll("."+datePickerClassName);
			for(var x=0; x<allDatePickers.length; x++){
				if(pickerType(allDatePickers[x]) == null) throw new Error("Custom Datepicker supports only Input Element of type 'date' or 'datetime-local'");
				decodeDateRange(allDatePickers[x]);
				runDatePickerBuild(allDatePickers[x]);
			}		
		}
		function pickerType(nativeDateInput){
			var includeTime = null;
			if(nativeDateInput.getAttribute("type") == "date"){
				includeTime = false;
			}else if(nativeDateInput.getAttribute("type") == "datetime-local"){
				includeTime = true;
			}
			return includeTime;
		}
		function runDatePickerBuild(nativeDateInput){
			nativeDateInput.classList.add("xDnative");
			
			var dateInputParent = nativeDateInput.parentNode;
			var existingWrapper = nativeDateInput.previousElementSibling;
			var includeTime =  pickerType(nativeDateInput);
			var mask, dateRange= true, maskLabel;
			existingWrapper != null?dateInputParent.removeChild(existingWrapper):null;
			if(nativeDateInput.value.length > 0){//Has default
				mask = nativeDateInput.value;
			}else{//No default set
				mask = includeTime?"YYYY-MM-DDTHH:MM":"YYYY-MM-DD";
			}		
			maskLabel = includeTime?mask.replace("T", " "):mask;
			//_____________Create elements___________
			//Wrapper
			var wrapper = document.createElement("DIV");
			wrapper.classList.add("vDatePicker");
			wrapper.style["height"] = datePickerDim[1];
			
			//Date field
			var dateFieldCon = document.createElement("DIV"); //the datefield and icon container
			var dateField = document.createElement("DIV"); //custom date field
			var dateIcon = document.createElement("DIV");// Input icon

			dateFieldStyle != ""?dateField.style = dateFieldStyle:null;

			dateFieldCon.classList.add("dFieldCon");
			dateField.classList.add("dField");
			dateField.setAttribute("data-value", mask);
			dateField.appendChild(document.createTextNode(maskLabel));
			dateField.style["line-height"] = datePickerDim[1];
			dateField.setAttribute("data-state", "closed");
			dateIcon.classList.add("vDateIcon", "iconClose");
			dateFieldCon.appendChild(dateField);
			dateFieldCon.appendChild(dateIcon);

			//append into wrapper
			wrapper.appendChild(dateFieldCon);


			//DateBox tool parent
			var dateBoxToolElement = document.createElement("DIV");
			dateBoxToolElement.classList.add( "vDateBoxTool");

			//Arrow
			//top
			var dateBoxArrowTopElement = document.createElement("DIV");
			dateBoxArrowTopElement.classList.add("vDateBoxArrow", "vtop", "normalShift");
			//bottom
			var dateBoxArrowBottomElement = document.createElement("DIV");
			dateBoxArrowBottomElement.classList.add("vDateBoxArrow", "vbottom", "normalShift");

			//DateBox
			var dateBoxElement = document.createElement("DIV");
			dateBoxElement.classList.add( "vDateBox");

			//DateBox Header
			var dateBoxHeaderElement = document.createElement("DIV");
			dateBoxHeaderElement.classList.add( "vDateBoxHeader");

			//DateBox displayCon
			var dateBoxDisplayConElement = document.createElement("DIV");
			dateBoxDisplayConElement.classList.add( "vDateBoxDisplayCon");

			if(labelProperties[1] != undefined){ //FontColor
				dateBoxDisplayConElement["style"]["color"] = labelProperties[1];
			}

			
			//Date range Box or Year Box
			var yearDiff = getDateRangeComponents(nativeDateInput)["max"].split("-")[0] - getDateRangeComponents(nativeDateInput)["min"].split("-")[0];
			
			if(yearDiff > 11){
				var n = ( getDateRangeComponents(nativeDateInput)["seriesEndYear"] -  getDateRangeComponents(nativeDateInput)["seriesStartYear"]) /10;
				var numberOfRangeBoxes = Math.ceil(n/11)<=0?1:Math.ceil(n/11);
				var dateRangeConElement = document.createElement("DIV");
				dateRangeConElement.classList.add( "vDateRangeCon", "vDateRangeConTrans");
				dateRangeConElement.setAttribute("data-title", "Select year series");

				for (var x=0; x<numberOfRangeBoxes; x++){
					var rangeBox = document.createElement("DIV");
					rangeBox.classList.add( "rangeBox");
					dateRangeConElement.appendChild(rangeBox);
				}
			}else{
				dateRange = false;
			}
			
			//Years Container
			var yearsConElement = document.createElement("DIV");
			yearsConElement.classList.add("vYearsCon", "vDateRangeConTrans");
			yearsConElement.setAttribute("data-title", "Select year");
			

			//Months Container
			var monthsConElement = document.createElement("DIV");
			monthsConElement.classList.add("vMonthsCon", "vDateRangeConTrans");
			monthsConElement.setAttribute("data-title", "Select month");

			//Days Container
			var daysConElement = document.createElement("DIV");
			daysConElement.classList.add("vDaysCon", "vDateRangeConTrans");
			daysConElement.setAttribute("data-title", "Select day");

			//Time Container
			if (includeTime){
				var timeConElement = document.createElement("DIV");
				var label = document.createElement("DIV");
				var meridian = document.createElement("DIV");
				var meridianSwitchCon = document.createElement("DIV");
				var timpePropertiesCon = document.createElement("DIV");
				var hourCon = document.createElement("DIV");
				var hourInput = document.createElement("INPUT");
				var minCon = document.createElement("DIV");
				var minInput = document.createElement("INPUT");
				var OkButtonCon = document.createElement("DIV");
				var OkButton = document.createElement("BUTTON");
				timeConElement.classList.add( "vTimeCon");
				label.classList.add("timeLabel");
				label.appendChild(document.createTextNode("Set Time"));
				meridian.setAttribute("class", "meridian AMon");
				meridianSwitchCon.setAttribute("class", "meridianSwitchCon am");
				timpePropertiesCon.classList.add( "timpePropertiesCon");
				hourCon.classList.add( "hourCon");
				hourInput.setAttribute("type", "text");
				hourInput.classList.add( "hr");
				hourInput.setAttribute("maxlength", "2");
				hourCon.appendChild(hourInput);
				minCon.classList.add( "minCon");
				minInput.setAttribute("type", "text");
				minInput.setAttribute("maxlength", "2");
				minInput.classList.add( "min");
				minCon.appendChild(minInput);

				OkButtonCon.classList.add("buttonCon");
				OkButton.appendChild(document.createTextNode("Done"));
				OkButton.classList.add( "tbuttonInactive");
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
			var dateBoxControlConElement = document.createElement("DIV");
			dateBoxControlConElement.classList.add("vDateBoxControlCon");

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
			closeButtonElement.classList.add( "vClose");
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

			//Append date rangeCon to displayCon Element
			dateRange?dateBoxDisplayConElement.appendChild(dateRangeConElement):null;

			// Append years container to displayCon Element
			dateBoxDisplayConElement.appendChild(yearsConElement);

			// Append months container to displayCon Element
			dateBoxDisplayConElement.appendChild(monthsConElement);

			// Append Days container to displayCon Element
			dateBoxDisplayConElement.appendChild(daysConElement);

			// Append Time container to displayCon Element
			if(includeTime){
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
			dateBoxToolElement.appendChild(dateBoxArrowTopElement);

			//Append dateBox to box tool parent
			dateBoxToolElement.appendChild(dateBoxElement);

			//Append dateBoxArrowBottom to date box tool parent
			dateBoxToolElement.appendChild(dateBoxArrowBottomElement);

			// Append datebox tool parent to wrapper input
			wrapper.appendChild(dateBoxToolElement);

			//insert wrapper before native date
			dateInputParent.insertBefore(wrapper, nativeDateInput);

			dateRange?generateYearRange(nativeDateInput):generateYearsPage (nativeDateInput);
			if(includeTime){
				if(nativeDateInput.value != ""){
					setInputDefaultValues(nativeDateInput);
				}
				formatTimeField(wrapper);
			}		
		}
		function formatTimeField(wrapper){
			var fv = new FormValidator();
			var hrinput = wrapper.querySelector(".hourCon input");
			var mininput = wrapper.querySelector(".minCon input");
			fv.format.integerField(hrinput);
			fv.format.integerField(mininput);
		}
		function addVitalStyle(ele){
			if(labelProperties[0] != undefined){ //backgroundColor
				ele["style"]["background-color"] = labelProperties[0];
			}
			if(labelProperties[1] != undefined){ //fontColr
				ele["style"]["color"] = labelProperties[1];
			}
			if(labelProperties[2] != undefined){ //borderColor
				ele["style"]["border"] = labelProperties[2];
			}
		}
		function generateYearRange (nativeDateInput){
			var displayCon = nativeDateInput.parentNode.querySelector(".vDateRangeCon");
			var rangeBox = displayCon.querySelectorAll(".rangeBox");
			var range = document.createElement("DIV");
			var startYear = parseInt(getDateRangeComponents(nativeDateInput)["seriesStartYear"]);
			var numberOfRangeBoxes = nativeDateInput.previousElementSibling.querySelectorAll(".rangeBox").length;
			range.classList.add( "range");
			range.setAttribute("data-range", startYear);
			addVitalStyle(range);
			range.appendChild(document.createTextNode(startYear.toString()+"'s..."));
			rangeBox[0].appendChild(range);
			var stopSeries = parseInt(getDateRangeComponents(nativeDateInput)["seriesEndYear"]);
			var nativeYear = parseInt(getSelectedValue(nativeDateInput, "year"));
			var diff;
			for (var x=0; x<numberOfRangeBoxes; x++){
				for (var y=0; y<11; y++){
					startYear += 10;
					if(startYear > stopSeries) break;
					diff = nativeYear - startYear;
					var range = document.createElement("DIV");
					(diff >=0 && diff <10)?range.classList.add("vSelected"):null;
					range.classList.add("range");
					range.setAttribute("data-range", startYear);
					addVitalStyle(range);
					range.appendChild(document.createTextNode(startYear.toString()+"'s..."));
					rangeBox[x].appendChild(range);
				}
			}
		};
		function generateYearsPage (nativeDateInput){
			var displayCon = nativeDateInput.parentNode.querySelector(".vDateBox .vYearsCon");
			var year = document.createElement("DIV");
			var minYear = getDateRangeComponents(nativeDateInput)["min"].split("-")[0];
			var maxYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
			var selectedYear = getDateRangeComponents(nativeDateInput)["max"].split("-")[0];
			year.classList.add( "year");
			addVitalStyle(year);
			year.appendChild(document.createTextNode(minYear.toString()));
			displayCon.innerHTML = "";
			displayCon.appendChild(year);	
			var sYear = minYear;
			var n =0;
			for (var y=0; y<21; y++){
				if(sYear == maxYear) break;
				sYear++;
				n++
				var year = document.createElement("DIV");
				year.classList.add( "year");
				addVitalStyle(year);
				var selectedYear = getSelectedValue(nativeDateInput, "year");
				selectedYear == sYear?year.classList.add("vSelected"):null
				year.appendChild(document.createTextNode(sYear.toString()));
				displayCon.appendChild(year);	
				if (n == 11) break;				
			}
		};
		function createToolTip(wrapper){
				var allDays = wrapper.querySelectorAll(".day")
				var dField = wrapper.querySelector(".dField");
				var dateComponents = getDateComponent(dField, false);
				var totalDays = allDays.length;
				var year = dateComponents["dateParts"][0];
				var month = dateComponents["dateParts"][1];
				for(var x=0; x<totalDays; x++){
					var dayName = getDayName(year, month, allDays[x].getAttribute("data-value"));
					allDays[x].setAttribute("title", dayName);
					tooTipHandler.on(allDays[x]);
				}
		}
		function generateDays(x, daysCon){
			var day = document.createElement("DIV");
			var wrapper = DOMelement.getParent(daysCon, 5);
			var nativeDateInput = DOMelement.getParent(daysCon, 4).nextElementSibling;
			day.classList.add( "day");
			addVitalStyle(day);
			var selectedDay = getSelectedValue(nativeDateInput, "day");
			if(selectedDay-1 == x){
				day.classList.add("vSelected");
			}
			x<9?day.setAttribute("data-value", "0"+(x+1).toString()):day.setAttribute("data-value", x+1);
			day.append(document.createTextNode(x+1));
			daysCon.appendChild(day);
		}
		function toggleListScroller(wrapper){
			var listCon = wrapper.querySelector(".vDateBox  .vDateRangeCon");
			var list = wrapper.querySelectorAll(".vDateBox  .rangeBox");
			var listConParent = wrapper.querySelector(".vDateBox .vDateBoxDisplayCon");
			var LeftBt = wrapper.querySelector("#vPrev");
			var RightBt = wrapper.querySelector("#vNext");
			if(listControllerObj == null){
				listControllerObj = new ListScroller(listConParent, listCon);
				listControllerObj.config.Xbuttons = [LeftBt, RightBt];
				listControllerObj.config.listPlane = "x";
				listControllerObj.config.inactiveButtonsClassName = ["linactive", "rinactive"];
				listControllerObj.config.effects = [0.4, "cubic-bezier(0,.99,0,1)"];
				listControllerObj.config.scrollSize = 300;
				listControllerObj.config.spaceError = 2;
				listControllerObj.config.paddingRight = 0;
				listControllerObj.initialize();
			}
			if (list.length > 1 && DOMelement.cssStyle(listCon, "display") != "none"){	
				listControllerObj.onScroller();
			}else{
				// listControllerObj.offScroller();
			}
		}
		function toggleBackButton(wrapper){
			var backButton = wrapper.querySelector(".vBack");
			var anyPrev = wrapper.querySelector(".displayActive").previousElementSibling;
			if(anyPrev != null){
				backButton.classList.remove("vbInactive");
				backButton.classList.add("vbActive");
			}else {
				backButton.classList.add("vbInactive");
				backButton.classList.remove("vbActive");
			}
		}
		function getDateComponent(dField, withTime){
			var dataValue = dField.getAttribute("data-value");
			var dateParts, timeParts;
			if(!withTime){
				dateParts = dataValue.split("-");
				timeParts = null;
			}else{
				dateParts = dataValue.split("T")[0].split("-");
				timeParts = dataValue.split("T")[1].split(":");
			}

			return {
				dateParts:dateParts,
				timeParts:timeParts
			}
		}
		function getDateRangeComponents(nativeDateInput){
			return{
				max:nativeDateInput.getAttribute("data-max"),
				min:nativeDateInput.getAttribute("data-min"),			
				seriesStartYear:nativeDateInput.getAttribute("data-rangeStart"),
				seriesEndYear:nativeDateInput.getAttribute("data-rangeEnd")
			}
		}
		function writeToInput(wrapper, dateComponent){
			var dField = wrapper.querySelector(".dField");
			var nativeDateInput = wrapper.nextElementSibling;
			var includeTime = pickerType(nativeDateInput)
			var ISOF;
			if(includeTime){
				dField.innerHTML = dateComponent["dateParts"].join("-")+" "+dateComponent["timeParts"].join(":");
				ISOF = dateComponent["dateParts"].join("-")+"T"+dateComponent["timeParts"].join(":");
			}else{
				dField.innerHTML = dateComponent["dateParts"].join("-");
			}
			ISOF = includeTime?ISOF:dField.innerHTML;
			nativeDateInput.setAttribute("value", ISOF);
			dField.setAttribute("data-value", ISOF);
			checkSave(wrapper);
		}
		function convertTo12hours(hour, meridian){
			if(meridian == "am"){
				if(hour == 12){
					return 0;
				}else {
					return hour;
				}
			}else {
				if(hour == 12){
					return 12;
				}else if(hour > 12){
					return hour-12;
				}else if(hour < 12){
					return hour+12;
				}
			}
		}
		function reCompute24hours(wrapper){
			var hrInputValue = parseInt(wrapper.querySelector(".hourCon input").value);
			var meridian = wrapper.querySelector(".meridianSwitchCon").classList.contains("am")?"am":"pm";
			if(hrInputValue.toString().length > 0){
				var dField = wrapper.querySelector(".dField");
				var includeTime = pickerType(wrapper.nextElementSibling);
				var dateComponents = getDateComponent(dField, includeTime);
				dateComponents["timeParts"][0] = fixDigitLength(convertTo12hours(hrInputValue, meridian));
				writeToInput(wrapper, dateComponents);
			}
		}
		function compareDate(minDate, maxDate){
			var furtureDate = new Date(maxDate);
			var pastDate = new Date(minDate);
			var diff = furtureDate - pastDate;
			if(diff >= 0){
				return true;
			}else{
				return false;
			}
		}
		function shift(dateBoxParent, dateBoxArrows){
				if(window.innerWidth > shiftPoint){
					for(var x=0; x<dateBoxArrows.length; x++){
						dateBoxArrows[x].classList.add("normalShift");
						dateBoxArrows[x].classList.remove("shift");
					}
					dateBoxParent.style["left"] = "0";
					dateBoxParent.style["margin-left"] = "0";
				}else {
					for(var x=0; x<dateBoxArrows.length; x++){
						dateBoxArrows[x].classList.add("shift");
						dateBoxArrows[x].classList.remove("normalShift");
					}
					dateBoxParent.style["left"] = "50%";
					dateBoxParent.style["margin-left"] = "-150px";
				}
		}
		function validFormat(dateString, type){
			var status;
			if(type == "datetime"){
				status = /^([0-9]{4}|(YYYY|yyyy))\-([0-9]{2}|(MM|mm))\-([0-9]{2}|(DD|dd))T([0-9]{2}|(HH|hh)):([0-9]{2}|(MM|mm))$/.test(dateString);
			}else if(type == "date"){
				status = /^([0-9]{4}|(YYYY|yyyy))\-([0-9]{2}|(MM|mm))\-([0-9]{2}|(DD|dd))$/.test(dateString);
			}
			return status;
		}
		function decodeDateRange(nativeDateInput){
			function tmp(id, type){
				var tstrng = type != "date"?"Thh:mm":"";
				return "The '"+id+"' attribute of the date input must be of the format yyyy-mm-dd"+tstrng;
			}
			function checkDate(date, id){
				var tDate = new Date(date);
				if(id != "default"){
					if(!tDate.isValid()){
						throw new Error("The supplied "+id+" date is invalid");
					}
				}else{
					if(!tDate.isValid()){
						nativeDateInput.value = "";
					}
				}
			}
			var minDate = nativeDateInput.getAttribute("min");
			var maxDate = nativeDateInput.getAttribute("max");
			var initialValue =  nativeDateInput.value;
			var includeTime = pickerType(nativeDateInput);
			var rangeStart, rangeEnd;
			nativeDateInput.setAttribute(validationAttribute, "false");
			if (minDate != null){
				if(!validFormat(minDate, "date")){
					throw new Error(tmp("min"));
				}
				checkDate(minDate, "min");
				var minYear = parseInt(minDate.split("-")[0]);
				rangeStart = minYear <1900?1900:minYear;
			}else{
				minDate = "1900-01-01";
				rangeStart = 1900; //Default min year => 1900 
			}
			if (maxDate != null){
				if(!validFormat(maxDate, "date")){
					throw new Error(tmp("max"));
				}
				checkDate(maxDate, "max");
				var maxYear = parseInt(maxDate.split("-")[0]);
				rangeEnd = 	maxYear >2050?2050:maxYear;
			}else{
				maxDate = "2050-12-31";
				rangeEnd = 2050; //Default max year 1900
			}
			if(initialValue != ""){
				var type = includeTime?"datetime":"date";
				if(!validFormat(initialValue, type)){
					throw new Error(tmp("value"));
				}
				checkDate(initialValue, "default");
				if(!compareDate(initialValue, maxDate)){
					throw new Error ("The default date cannot be greater than maximum date");
				}
				if(!compareDate(minDate,initialValue)){
					throw new Error ("The default date cannot be less than minmum date");
				}
				nativeDateInput.setAttribute(validationAttribute, "true");
			}

			//Validate dates
			if(!compareDate(minDate, maxDate)){
				throw new Error ("Maximum date cannot be less than minmum value");
			}

			var startYear = parseInt(rangeStart.toString()[0]+rangeStart.toString()[1]+rangeStart.toString()[2]+"0");
			var endYear = parseInt(rangeEnd.toString()[0]+rangeEnd.toString()[1]+rangeEnd.toString()[2]+"0");
			nativeDateInput.setAttribute("data-max", maxDate);
			nativeDateInput.setAttribute("data-min", minDate);			
			nativeDateInput.setAttribute("data-rangeStart", startYear);
			nativeDateInput.setAttribute("data-rangeEnd", endYear);

		}
		function dateComponentsVariables(wrapper){
			var dField = wrapper.querySelector(".dField");
			var includeTime = pickerType(wrapper.nextElementSibling);
			var dateComponents = getDateComponent(dField, includeTime);

			return{
				dField,
				includeTime,
				dateComponents
			}
		}
		function isCompleted(dateComponents){
			var status = true;
			var keys = ["YY", "MM", "DD", "HH", "MM"];
			var dateObjKeys = Object.values(dateComponents["dateParts"]);
			
			for(var x=0; x<3; x++){
				if(keys.indexOf(dateObjKeys[x]) != -1){//Found
					status = false;
					break
				}
			}
			if(dateComponents["timeParts"] != null && status == true){//both date and time
				var timeObjKeys = Object.values(dateComponents["timeParts"]);
				for(var x=0; x<2; x++){
					if(keys.indexOf(timeObjKeys[x]) != -1){
						status = false;
						break
					}
				}
			}
			return status;
		}
		function showDateBox (wrapper){
			var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
			var dateBoxTitileCon = wrapper.querySelector(".vDateBoxHeader");
			var dateBoxArrow = wrapper.querySelector(".vDateBoxArrow");
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
			dateBoxParent.style["height"] = dateBoxParent.scrollHeight+"px";
			if(rangeCon != null){
				rangeCon.style["opacity"] = "1";
				dateBoxTitileCon.innerHTML = rangeCon.getAttribute("data-title");
				rangeCon.style["z-index"] = "1";
				toggleListScroller(wrapper);
			}else{
				yearCon.style["opacity"] = "1";
				dateBoxTitileCon.innerHTML = yearCon.getAttribute("data-title");
				yearCon.style["z-index"] = "1";
				yearCon.style["width"] = "100%";
				yearCon.style["height"] = "100%";
				yearCon.style["display"] = "flex";
				yearCon.style["justify-content"] = "center";
			}
			dateComponents["timeParts"] != null ?toggleDoneButton(wrapper):null;
			setSuperActive(wrapper);
		}
		function closeDateBox (wrapper){
			var dateBoxParent = wrapper.querySelector(".vDateBoxTool");
			var activeDisplay = wrapper.querySelector(".displayActive");
			var backButton = wrapper.querySelector(".vBack");
			if (activeDisplay != null){
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
		function getSelectedValue(nativeDateInput, type){
			var value; 
			if(type == "year"){
				value = nativeDateInput.value.split("-")[0];
			}else if (type == "month"){
				value = nativeDateInput.value.split("-")[1];
			}else if (type == "day"){
				value = nativeDateInput.getAttribute("value").split("-")[2].split(" ")[0];
			}
			return value;
		};
		function setInputDefaultValues(nativeDateInput){
			var wrapper = nativeDateInput.previousElementSibling;
			var hrInput = wrapper.querySelector(".hr");
			var minInput = wrapper.querySelector(".min");
			var timeParts = dateComponentsVariables(wrapper)["dateComponents"]["timeParts"];
			var meridianSwitch = wrapper.querySelector(".meridianSwitchCon");
			minInput.value = fixDigitLength(parseInt(timeParts[1]));
			hrInput.value  = fixDigitLength(parseInt(timeParts[0]));
			if (parseInt(timeParts[0]) >= 12){//pm
				parseInt(timeParts[0]) == 12?hrInput.value = 12:hrInput.value  = fixDigitLength(parseInt(timeParts[0]) - 12);
				meridianSwitch.parentNode.classList.add("PMon");
				meridianSwitch.parentNode.classList.remove("AMon");
				toggleMeridianSwitch(meridianSwitch);
			}
		}
		function resetMComponentsValue(wrapper, dateComponents, series){
			if(series == "ymd"){
				dateComponents["dateParts"][0] = "YYYY";
				dateComponents["dateParts"][1] = "MM";
				dateComponents["dateParts"][2] = "DD";
				var allChildSelected = wrapper.querySelectorAll(".vSelected:not(.range)");
				var total = allChildSelected.length;
				if(allChildSelected >0){
					for(var x=0; x<total; x++){
						allChildSelected.classList.remove("vSelected");
					}
				}
			}else if(series == "md"){
				dateComponents["dateParts"][1] = "MM";
				dateComponents["dateParts"][2] = "DD";
				var sMonth = wrapper.querySelector(".month.vSelected");
				var sDay = wrapper.querySelector(".day.vSelected");
				sMonth != null?sMonth.classList.remove("vSelected"):null;
				sDay != null?sDay.classList.remove("vSelected"):null;
			}else if(series == "d"){
				dateComponents["dateParts"][2] = "DD";
				var sDay = wrapper.querySelector(".day.vSelected");
				sDay != null?sDay.classList.remove("vSelected"):null;
			}
		}
		function updateActive(wrapper, selected, type){
			if(type == "range"){
				var current = wrapper.querySelector(".range.vSelected");
			}else if(type == "year"){
				var current = wrapper.querySelector(".year.vSelected");
			}else if(type == "month"){
				var current = wrapper.querySelector(".month.vSelected");
			}else if(type == "day"){
				var current = wrapper.querySelector(".day.vSelected");
			}
			current != null?current.classList.remove("vSelected"):null;
			selected.classList.add("vSelected");
		}
		function hideAnyDatePicker(dField){
			var any = document.querySelectorAll(".dField[data-state='opened']");
			var total = any.length;
			if(total > 0){
				for(var x=0; x<total; x++){
					if(any[x] != dField){
						var wrapper = DOMelement.getParent(any[x], 2);
						var dField = wrapper.querySelector(".dField");
						wrapper.classList.remove("activeWidget");
						closeDateBox(wrapper);
					}	
				}
			}
		} 
		var body = {
				autoBuild: function (){
					if(datePickerClassName == ""){
						throw new Error("Setup imcomplete: datePicker class name must be supllied, specify using the 'config.className' property");
					}
					if(validationAttribute == ""){
						throw new Error("Setup imcomplete: No validation attribute, specify using the 'config.validationAttribute' property");
					}
					
					reCreateDatePicker();
					createStyles();
					AddEventHandlers();
					if(daysToolTip==true){
						tooTipHandler = new ToolTip();
						if(daysToolTipProperties[0] != undefined){
							var color = daysToolTipProperties[1] == undefined?"white":daysToolTipProperties[1];
							tooTipHandler.config.tipBoxProperties = [daysToolTipProperties[0], color];
						}
						tooTipHandler.initialize();
					};
				},
				config:{},
				refresh: function(parent){
					validateElement(parent, "datePicker.refresh() method expects a valid HTML as argument 1");
					var allNewdatePickers = parent.querySelectorAll("."+datePickerClassName+":not(.xDnative)");
					var totalNewdatePickers = allNewdatePickers.length;
					if(totalNewdatePickers > 0){
						for (var x=0; x<totalNewdatePickers; x++){
							allNewdatePickers[x].classList.contains(datePickerClassName)?runDatePickerBuild(allNewdatePickers[x]):null;
						}
					}
				}
		}
		Object.defineProperties(body, {
			config:{writable:false},
			refresh:{
				writable:false
			},
			autoBuild:{
				writable:false
			}
		});
		Object.defineProperties(body.config, {
			inputIconStyle:{
				set:function(value){
					//[a,b,c] => a= icon normal State; b = icon hover State, b = icon active State
					var temp = "config.inputIconStyle property array members";
					validateArray(value, "config.inputIconStyle property expects an array as value");
					if(value.length > 3){
						throw new Error(temp+" cannot be more than 3");
					}
					validateArrayMembers(value, "string", temp+ "must all be string");
					dateInputIconStyle = value;
				}
			},
			daysToolTip:{
				set:function(value){
					validateBoolean(value, "'config.daysToolTip' property value must be a boolean");
					daysToolTip = value;
				}
			},
			shiftPoint:{
				set:function(value){
					if (validateInteger(value)){
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
			},
			className:{
				set:function(value){
					validateString(value, "datePicker.config.className property expect a string as value");
					datePickerClassName = value;
				}
			},
			selectionStyle:{
				set:function(value){
					validateString(value, "'config.selectionStyle' property must be string of valid CSS style(s)");
					selectionStyle = value;
				}
			},
			inputButtonStyle:{
				set:function(value){
					validateString(value, "'config.inputButtonStyle' property must be string of valid CSS style(s)");
					inputButtonStyle = value;
				}
			},
			validationAttribute:{
				set:function(value){
				    validateString(value, "'config.validationAttribute' property must be string");
					validationAttribute = value;
				}	
			},
			dateFieldStyle:{
				set:function(value){
					validateString(value, "'config.dateFieldStyle' property must be string of valid CSS style(s)");
					dateFieldStyle = value;
				}
			}
		});
		return body;
	}
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

	Object.defineProperties(this, {
		checkbox:{writable:false},
		radio:{writable:false},
		select:{writable:false},
		datePicker:{writable:false}
	})
}
/****************************************************************/

/************************Form validator**************************/
function FormValidator(form=null){
	if(form != null){
		validateElement(form, "'config.form' property must be an element");
		var positionType = DOMelement.cssStyle(form, "position");
		positionType == "static"?form.style["position"] = "ralative":null;
	}
	var bottomConStyle ="", initialized=false, leftConStyle="", rightConStyle="", self=this;
	var errorLog = {}, logStatus=null, n=0, selectedProgressType="rotate", customAnimate=null, progressIndicatorStyle=null, formSubmitted=false, smallView=866, screenMode= "large", wrapperDataAtrribute=null;
	var progressType = {
				rotate:["@keyframes vRotate{from{transform:rotate(0deg) translateY(-50%) translateX(-50%);} to{transform:rotate(360deg) translateY(-50%) translateX(-50%);}}", "vRotate"]
			};
	var modal=null, queue=[];
	var controller=null;
	var supportedRules = {
		required:1,
		minLength:1,
		maxLength:1,
		pattern:1,
		string:1,
		integer:1,
		float:1,
		ext:1,
		minSize:1,
		maxSize:1,
		callBack:1,
		email:1,
		file:1
	}
	function validatCustomRules(customStyles, objName){
		if (customStyles != null){
			validateArray(customStyles, "'"+objName+"' method argument 5 must be an array");
			if(customStyles.length > 2){
				throw new Error("'"+objName+"' method argument 6 array element cannot be more than 2 elements");
			}
			customStyles[0] != null?validateString(customStyles[0], "'"+objName+"' method argument 5 array element 1 must be a string which specify the CSS style for bottom message display"):null;
			customStyles[1] != null?validateString(customStyles[1], "'"+objName+"' method argument 5 array element 2 must be a string which specify the CSS style for left or right message display"):null;
		}
	}
	//Create Element
	function createMessageCon(inputWrapper, messageType, location, message, customStyles=null, paintWrapper = false){
		//customStyles[a,b] : a=> bottom message box style, b=> left or right message box style
		if(location == "left" || location == "right"){
			if(innerWidth < smallView){
				location = "bottom";
			}
		}
		//Validations
		validatCustomRules(customStyles, "write()");

		//__________________________//
		//create log status
		if(inputWrapper == null){

		}
		if(inputWrapper.getAttribute("data-logStatus") == null){
			inputWrapper.setAttribute("data-logStatus", "1");
			inputWrapper.setAttribute("data-fieldId", "f"+(n+1));
			n++;
		}
		var checkExistence = inputWrapper.querySelector(".vMsgBox");
		function createMsgBox(){
			screenMode == "large"?inputWrapper.setAttribute("data-vp", "large"):inputWrapper.setAttribute("data-vp", "small");
			//Fix left and right
			var messageBoxWrapper = document.createElement("DIV");

			function styleLeft(){
				if(leftConStyle != ""){
					messageBoxWrapper.setAttribute("style", leftConStyle);
				}
			}
			function styleRight(){
				if(rightConStyle != ""){
					messageBoxWrapper.setAttribute("style", rightConStyle);
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

			if(messageType == "error"){
				if(paintWrapper){
					inputWrapper.classList.add("wError");
				}
			}
			messageBoxWrapper.appendChild(document.createTextNode(message));
			inputWrapper.appendChild(messageBoxWrapper);
			
			//Log error
			errorLog[inputWrapper.getAttribute("data-fieldId")] = 1;

			if (location == "left"){
				var m = inputWrapper.querySelector(".vLeft");
				sendBehind(m, location, 15, customStyles);
			}else if (location == "right") {
			 	var m = inputWrapper.querySelector(".vRight");
				sendBehind(m, location, 15, customStyles);
			}else if (location == "bottom") {
				var	m = inputWrapper.querySelector(".vBottom");
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
					location == "left"?m = inputWrapper.querySelector(".vLeft"):m = inputWrapper.querySelector(".vRight");;
					if(customStyles[1] != null || customStyles[1] != undefined ){
						var currentStyle = m.getAttribute("style");
						m.setAttribute("style", currentStyle+ customStyles[1]);
					}
				}
			}
			checkExistence.innerHTML = message;
			//Log error
			errorLog[inputWrapper.getAttribute("data-fieldId")] = 1;
		}
		if (checkExistence == null){
			createMsgBox();
		}else{
			if(screenMode != inputWrapper.getAttribute("data-vp")){
				var currentMsg = inputWrapper.querySelector(".vMsgBox");
				inputWrapper.removeChild(currentMsg);
				createMsgBox();
			}else{
				updateMsgBox();
			}
		}
		if(messageType == "error"){
			inputWrapper.classList.add("lerror");
		}
	}

	function clearMessage(inputWrapper){	
		var location = "", fieldId=null;
		var Vbox = inputWrapper.querySelector(".vMsgBox");
		if(Vbox != null){
			if(Vbox.classList.contains("vRight")){
				location = "right";
			}else if (Vbox.classList.contains("vLeft")) {
				location = "left";
			}else if (Vbox.classList.contains("vBottom")) {
				location = "bottom";
			}
			var checkExistence = inputWrapper.querySelector(".vMsgBox");
			if (checkExistence != null){
				if(location  == "left" || location  == "right"){
					if (checkExistence.classList.contains("vRight") || checkExistence.classList.contains("vLeft")){
						checkExistence.style["width"] = checkExistence.scrollWidth+"px";
						checkExistence.scrollWidth;
						checkExistence.classList.add("clear");
						checkExistence.style["color"] = "transparent";
						checkExistence.style["width"] = "0";

						//Clear error log
						fieldId =  inputWrapper.getAttribute("data-fieldId");
						delete errorLog[fieldId];
					}else{
						throw new Error("No left or right message found to clear, recheck 'clear()' method argument 2");
					}
				}else if (location  == "bottom") {
					if (checkExistence.classList.contains("vBottom")){
						checkExistence.classList.add("clear");
						checkExistence.scrollHeight;
						checkExistence.style["color"] = "transparent";
						checkExistence.style["height"] = "0";

						//Clear error log
						fieldId =  inputWrapper.getAttribute("data-fieldId");
						delete errorLog[fieldId];
					}
				}
			}
			inputWrapper.classList.remove("lerror", "rerror", "berror", "wError");
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
			if(e.target.classList.contains("vItem")){
				self.message.clear(e.target);
			}
		}, false);
	}

	function showProgress(){
		var loader = form.querySelector(".vFormOverlay");
		loader.classList.remove("vFormOverlayHide");
		loader.classList.add("vFormOverlayShow");
	}
	function hideProgress(){
		var loader = form.querySelector(".vFormOverlay");
		loader.classList.remove("vFormOverlayShow");
		loader.classList.add("vFormOverlayHide");
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
		
		if(direction == "left"){
			element.style["right"] = "calc(100% + "+offset+"px)";
		}else if (direction == "right") {
			element.style["left"] = "calc(100% + "+offset+"px)";
		}
		
		var width = element.scrollWidth;
		element.style["width"] = "0px";
		element.scrollWidth;
		if(customStyles != null){
			if(customStyles[1] != null || customStyles[1] != undefined ){
				var currentStyle = element.getAttribute("style");
				element.setAttribute("style", currentStyle + customStyles[1]);
			}
		}
		
		// element.scrollWidth;
		element.style["width"] = width+"px";
	}

	//For bottom display
	function drop(element){
			var height = element.scrollHeight;
			height =height<35?35:height;
			element.style["height"] = "0px";
			element.scrollHeight;
			element.style["height"] = height+"px";
	}

	function createLoader(){
		var overLay = document.createElement("DIV");
		var loader = document.createElement("DIV");
		overLay.classList.add( "vFormOverlay");
		loader.classList.add( "vFormLoader");
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
		con.classList.add( "FbMsgBox");
		ttl.setAttribute("class", "ttl "+ui[0]);
		msg.setAttribute("class", "msgCon "+ui[1]);
		btCon.classList.add( "buttonCon");
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
		var oldVbox = document.querySelector(".FbMsgBox");
		if(oldVbox != null){
			oldVbox.parentNode.removeChild(oldVbox);
		}

		if(url!=null){
			var xhr = Ajax.create();
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
		write: function(inputField, messageType, location, message, customStyles=null){
			//(optional) customStyles: A valid CSS styles for bottom or right or left messageBox
			if (initialized == true){
				var inputType={val:null};
				
				validateInputElement(inputField, inputType, "Obj.message()");
				var xField = inputField;
				hideProgress();
				inputField = inputType.val=="single"?inputField:inputField[0];
				var inputWrapper = getInputWrapper(inputField);
				inputWrapper.style.position = "relative";

				var paintWrapper = false;
				if(inputField.getAttribute("type") != "radio" && inputField.getAttribute("type") != "checkbox"){
					paintWrapper = true;
				}

				if(inputType.val == "single"){
					if(!xField.classList.contains("vItem")){
						xField.classList.add("vItem");
					}
				}else{
					if(!xField[0].classList.contains("vItem")){
						for(var x=0;x<xField.length;x++){
							xField[x].classList.add("vItem");
						}
					}
				}
				if(validateString(messageType, "'Obj.write()' method needs a string as argument 2")){
					if(!(messageType == "success" || messageType == "error" || messageType == "warning")){
						throw new Error ("'Obj.write()' method argument 2 must be string value of either: 'success', 'warning', or 'error'");
					}
				};
				if(validateString(location, "'Obj.write()' method needs a string as argument 3")){
					if(!(location == "bottom" || location == "left" || location == "right")){
						throw new Error ("'Obj.write()' method argument 3 must be string value of either: 'bottom', 'left', or 'right'");
					}
				};
				validateString(message, "'Obj.write()' method needs a string (The message) as argument 4");
				createMessageCon(inputWrapper, messageType, location, message, customStyles, paintWrapper);
			}else{
				InIError("write");
			}
		},
		clear: function(inputField){
			//messageConElement =>  must be the container housing the input element and the placeholder element, which defines the width for them
			if (initialized == true){
				validateElement(inputField, "'write' method needs a valid HTML element as argument 1");
				var inputWrapper =  getInputWrapper(inputField);
				clearMessage(inputWrapper);
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
				throw new Error("Cannot initialize without settinig a form to perform validation on, pass target form to FormValidator() contructor, to set target form")
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
			inputElement.addEventListener("input", function(){
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
	this.validate = function(inputField, rules, messages, location, customStyles=null){
		if (initialized == true){
			var inputType={
				val:null
			};
			validateInputElement(inputField, inputType, "Obj.validate()");
			validateArray(rules, "'Obj.validate()' method argument 2 expects an array");
			validateArray(messages, "'Obj.validate()' method argument 3 expects an array");
			validateString(location, "'Obj.validate()' method argument 4 expects a string");
			//Validations
			validatCustomRules(customStyles, "validate()");
			var rulesInUse = {}
			var tempIds = {}
			//build available contraints
			for(var x=0; x<rules.length; x++){
				//check for sub value

				if(typeof rules[x] == "string"){
					var check = rules[x].split(":");
					if(check.length == 2){//has sub
						checkRule(check, rulesInUse, "sub", tempIds);
					}else{//no sub
						checkRule(rules[x], rulesInUse, null, tempIds);
					}
				}else if(rules[x].__proto__.isPrototypeOf(new Object()) == true){
					checkRule(rules[x], rulesInUse, null, tempIds, true);
				}
				
			}

			var xField = inputField; //Needed to check HTML Collection
			inputField = inputType.val=="single"?inputField:inputField[0];
			var inputWrapper = getInputWrapper(inputField);

			if(rulesInUse["required"] != undefined){
				var keyVal = rulesInUse["required"] == 1?"":":"+rulesInUse["required"];
				if(!checkRequired(xField, inputType.val, rulesInUse)){
					var matchMessage = getMessageDetails(messages[getMessageIndex("required"+keyVal, tempIds)]);
					var messageType = matchMessage[0];
					var messageBody = matchMessage[1];
					self.message.write(inputField, messageType, location, messageBody, customStyles);	
					return;
				}else{
					clearLastError(rules, keyVal, inputField, inputWrapper)
				}
			}
			if(rulesInUse["minLength"] != undefined){			
				var keyVal = rulesInUse["minLength"]
				if(!minimumLength(inputField, keyVal)){
					var matchMessage = getMessageDetails(messages[getMessageIndex("minLength"+":"+keyVal, tempIds)]);
					var messageType = matchMessage[0];
					var messageBody = matchMessage[1];
					self.message.write(inputField, messageType, location, messageBody);
					return;
				}else{
					clearLastError(rules, keyVal, inputField, inputWrapper, customStyles)
				}
			}
			if(rulesInUse["maxLength"] != undefined){			
				var keyVal = rulesInUse["maxLength"];
				if(!maximumLength(inputField, keyVal)){
					var matchMessage = getMessageDetails(messages[getMessageIndex("maxLength"+":"+keyVal, tempIds)]);
					var messageType = matchMessage[0];
					var messageBody = matchMessage[1];
					self.message.write(inputField, messageType, location, messageBody, customStyles);
					return;
				}else{
					clearLastError(rules, keyVal, inputField, inputWrapper)
				}
			}
			if(rulesInUse["email"] != undefined){
				var keyVal = rulesInUse["email"] == 1?"":":"+rulesInUse["email"];
				if(!isEmailAddress(inputField, inputType.val)){
					var matchMessage = getMessageDetails(messages[getMessageIndex("email"+keyVal, tempIds)]);
					var messageType = matchMessage[0];
					var messageBody = matchMessage[1];
					self.message.write(inputField, messageType, location, messageBody, customStyles);	
					return;
				}else{
					clearLastError(rules, keyVal, inputField, inputWrapper)
				}
			}
			if(rulesInUse["callBack"] != undefined){
				var response = rulesInUse["callBack"](self);
				if(typeof response == "number"){
					if(response != -1){//
						var index = rules.findIndex(x => Object.keys(x)[0] ==="callBack");
						if(messages[index][response] != undefined){
							var message = messages[index][response];
							var matchMessage = getMessageDetails(message);
							var messageType = matchMessage[0];
							var messageBody = matchMessage[1];
							self.message.write(inputField, messageType, location, messageBody, customStyles);	
							return;
						}
					}
				}else if(typeof response == "boolean"){
					if(response == true){
						clearLastError(rules, "callBack", inputField, inputWrapper)
					}
				}
			}
		}else{
			InIError("validate");
		}
	}
	/**********/
	function checkRule(rule, saveRule, sub, tmpIds, obj=false){
		if(sub == null && obj == false){
			if(supportedRules[rule] != undefined){
				saveRule[rule] = 1;
				tmpIds[rule] = tmpIds[rule];
			}else{
				throw new Error("This rule " + rule+ " is not supported");
			}
		}else if(sub != null&&  obj == false){
			if(supportedRules[rule[0]] != undefined){
				var fullKey = rule.join(":");
				saveRule[rule[0]] = rule[1];
				tmpIds[fullKey] = tmpIds[fullKey];
			}else{
				throw new Error("This rule " +fullKey+ " is not supported");
			}
		}else if(obj){
			var check = Object.keys(rule)[0];
			if(supportedRules[check] != undefined){
				saveRule[check] = rule[check];
			}else{
				throw new Error("This rule " +check+ " is not supported");
			}
		}
	}
	function getMessageIndex(ruleName, tempIds){
		return Object.keys(tempIds).indexOf(ruleName);
	}
	function getMessageDetails(msg){
		var ids = {
			e:"error",
			w:"warning",
			s:"success"
		}
		
		var msplit = msg.split(":");
		if(msplit.length == 2){
			var key = msplit[0].toLowerCase();
			if( key == undefined){//Not Found
				return ["error", msplit];
			}else{//found
				return [ids[key], msplit[1]];
			}
		}else{
			return ["error", msplit[0]];
		}
	}
	function checkRequired(inputField, inputType, rulesInUse){
		if(inputType == "single"){
			if(isTextField(inputField)){//text field
				if(!textField(inputField)){
					return false;
				}else{
					return true;
				}
			}else if(isCheckField(inputField)){//check field
				if(!checkField(inputField)){
					return false;
				}else{
					return true;
				}
			}		
		}else{
			var status=false;
			for(var x=0;x<inputField.length;x++){
				if(inputField[x].getAttribute("type") == "radio" || inputField[x].getAttribute("type") == "checkbox"){
					if(inputField[x].checked){
						status= true;
						break;
					}
				}
				
			}
			return status;
		}
		function textField(x){
			if(x.value.length < 1){
				return false;
			}else{
				return true;
			}
		}
		function checkField(x){
			if(x.checked){
				return true;
			}else{
				return false;
			}
		}
	}
	function minimumLength(inputField, min){
		if(inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA"){//text field
			if(inputField.value.length < min){
				return false;
			}else{
				return true;
			}
			
		}
	}
	function maximumLength(inputField, max){
		if(inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA"){//text field
			if(inputField.value.length > max){
				return false;
			}else{
				return true;
			}
			
		}
	}
	function isTextField(inputField){
		if(inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA"){//text field
			return true;
		}else{
			return false;
		}
	}
	function isCheckField(inputField){
		if(inputField.getAttribute("type") == "radio" || inputField.getAttribute("type") == "checkbox" ){//check field
			return true;
		}else{
			return false;
		}
	}
	function isEmailAddress(inputField, inputType){
		if(inputType == "single"){
			if(inputField.getAttribute("type") == "text" || inputField.nodeName == "TEXTAREA"){
				if(!validateEmailAddress(inputField.value)){
					return false;
				}
				return true;
			}
		}
	}
	function clearLastError(rules, key, inputField, preferedWrapper){
		if(rules[rules.length-1] == key || Object.keys(rules[rules.length-1])[0] == key){
			self.message.clear(inputField, preferedWrapper);
		}
	}
	function validateInputElement(inputField, flag, objName){					
		if (inputField instanceof Element){
			flag.val = "single";
		}else{
			try {
				if(Object.getPrototypeOf(inputField).constructor.name == "NodeList"){
					flag.val = "group";	
				}
			}catch (error) {
				throw new Error("'"+objName+"' method argument 1 expects a valid HTML element or HTMLCollection");
			}
		}
	}

	function getInputWrapper(inputField){
		var inputWrapper = null;
		if(wrapperDataAtrribute != null){//has prefered data atrribute set
			try {
				if(inputField.getAttribute(wrapperDataAtrribute) != null){//configured and set
					var attribValue = inputField.getAttribute(wrapperDataAtrribute);
					inputWrapper = DOMelement.getParent(inputField, attribValue);
				}else{
					inputWrapper = inputField.parentNode;
				}
			}catch(error){
				inputWrapper = inputField.parentNode;
			}
		}else{ //use default
			inputWrapper = inputField.parentNode;	
		}
		return inputWrapper;
	}
	
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
			var xhr = Ajax.create();
			xhr.open("POST", url, true);
			xhr.addEventListener("readystatechange", function(){
				if(xhr.readyState == 2){//sent
					formSubmitted = true;
				}else if (xhr.readyState == 4) {//sent and received
					if(xhr.status == 200){
						if(controller != null){
							var delayCall = setTimeout(function(){
								controller(self, xhr.responseText);
								clearTimeout(delayCall);
							}, 1000);
						}else {
							self.showFeedBack();
						}
					}
				}
			}, false);
			xhr.send(data);
		}
	}

	this.showFeedBack = function(feedBackUrl=null, msg=null, type=null){
		if(type != null){
			if(type.toLowerCase() != "warning" && type.toLowerCase() != "success" && type.toLowerCase() != "error"){
				throw new Error("'showFeedBack()' method argument 3 must either be: null, 'error', 'warning' or 'success'");
			}
		}
	
		showFeedBack(feedBackUrl, msg, type);
	}
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
		},
		wrapperDataAtrribute:{
			set:function(value){
				validateString(value, "config.wrapperDataAtrribute property value expects a string");
				wrapperDataAtrribute = value;
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
function ModalDisplayer(){
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
			modal.classList.add( "vOld");
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
			leftEle.classList.add( "effectE");
			rightEle.setAttribute("style", rcss);
			rightEle.setAttribute("id", "eright");
			rightEle.classList.add( "effectE");

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
			modal.classList.add( "vOld");
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
			modal.classList.add( "vOld");
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
			modal.classList.add( "vOld");
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
			var heightBelow = VerticalScroll.query(parseInt(DOMelement.cssStyle(document.querySelector("html"), "height"), "px"))["remainingHeightBelow"];
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
		var scrollHandler = new  VerticalScroll();
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
		oldModal.classList.add( currentModal.getAttribute("class"));
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
			overlay.classList.add( "vModal");
			overlay.setAttribute("data-id", "vModalStyles");
			if (colorOverlayStyle != ""){
				overlay.setAttribute("style", colorOverlayStyle );
			}

			effectsCon.classList.add( "modalSpace");

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
				if(!validateInteger(value[0])) throw new Error(msg(1));
				if(!validateInteger(value[1])) throw new Error(msg(2));
				brkpoints["largeStart"] = value[0];
				brkpoints["mediumStart"] = value[1];
			}
		}
	});
}
/****************************************************************/

/***************************Tool tip*****************************/
function ToolTip(){
	var sy=0,sx=0, ini=false, tipBoxProperties=[],tipId="", initialized=0;
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
		tipElement.setAttribute("data-tTipEvent", "off");
		tipElement.setAttribute("data-toolTipId", tipId);
		document.body.appendChild(tipElement);
		addEvent(tipId);
	}
	function addEvent(id){
		var vTipCon = document.querySelector("div[data-toolTipId='"+id+"']");
		if(vTipCon.getAttribute("data-tTipEvent") == "off"){
			DOMelement.attachEventHandler("mouseover", "vtip",  function(e){
				if(e.target.getAttribute("data-vToolTipSwitch") == "ON"){
					sy=scrollY;sx=scrollX;
					var mainTip = e.target.getAttribute("title");
					if(mainTip != null){
						e.target.setAttribute("data-tempTitle", mainTip);
						e.target.removeAttribute("title");
					}				
					
				}
			});
			DOMelement.attachEventHandler("mousemove", "vtip",  function(e){
				if(e.target.getAttribute("data-vToolTipSwitch") == "ON"){
					var tipID = e.target.getAttribute("data-tid");
					var tipBox = document.querySelector("div[data-toolTipId='"+tipID+"']");
					tipBox.style["display"] == "none"?tipBox.style["display"] = "block":null;
					var y = (e.clientY+sy)-tipBox.scrollHeight;
					var x = (e.clientX+sx) - 10;
					var mainTip = e.target.getAttribute("data-tempTitle");
					if(mainTip != null){
						mainTip.length < 1?tipBox.style["display"] = "none":null;
						tipBox.innerHTML = mainTip;
					}
					
					tipBox.style["top"] = y+"px";
					tipBox.style["left"] =x+"px";
				}
			})
			DOMelement.attachEventHandler("mouseout", "vtip",  function(e){
				if(e.target.getAttribute("data-vToolTipSwitch") == "ON"){
					var tipID = e.target.getAttribute("data-tid");
					var tipBox = document.querySelector("div[data-toolTipId='"+tipID+"']");
					if(e.target.getAttribute("data-TID") != null){
						tipBox.style["display"] = "none";
						tipBox.style["top"] = "0";
						tipBox.style["left"] ="0";
					}
					var mainTip = e.target.getAttribute("data-tempTitle");
					if(mainTip != null){
						e.target.setAttribute("title", mainTip);
						e.target.removeAttribute("data-tempTitle");
					}
					
				}
			})
			vTipCon.setAttribute("data-tTipEvent", "on");
		}
	}
	this.initialize =  function(){
		if(initialized == 0){
			createTipElement();
			createStyles();
			initialized=1;
		}
	};
	this.config = {};
	this.on = function(element){
		validateElement(element, "Argument 1 of the obj.on() method must be a valid HTML element");
		if (element.getAttribute("title") == null){
			throw new Error("The specified element title attribute cannot be null, Please specify the tip to use.");
		}		
		element.setAttribute("data-TID", tipId);
		element.classList.add("vtip");
		element.setAttribute("data-vToolTipSwitch", "ON");		
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
function Carousel(container, viewport){
	validateElement(container, "'Carousel(x,.)' constructor argument 1 must be an HTML Element");
	validateElement(viewport, "'Carousel(.,x)' constructor argument 2 must be an HTML Element");
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

		controlArea.classList.add( "vControlArea");
		buttonsCons.classList.add( "vControlButtonsCon");

		for(var x=0;x<sliders.length;x++){
			var buttonsShell = document.createElement("DIV");
			var button = document.createElement("DIV");
			var id = x+1;
			buttonsShell.classList.add( "vControlButtonsShell");
			x == 0?button.setAttribute("class", "vButton active"):button.classList.add( "vButton");
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
				var touchHdr = new TouchHandler(container);
				touchHdr.config.slideCallBack = touchEndCallBack;
				touchHdr.config.viewPortTransition = "all "+speed+"ms cubic-bezier(0,.98,0,.98)";
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
function ContentLoader(){
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
		var xhr = Ajax.create();
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
function TouchHandler(frame){
	var initialTouchPos={}, slideCallBack=null, mode="slider", hasMoved =false, lastTouchPos={}, lastPoint={x:0,y:0},usePoint=0, initialized=false, rafPending=false, pan="x",pressed=false, viewPort=null;
	var pointerDownName = 'pointerdown', slopeValue=0, pointerUpName = 'pointerup', pointerMoveName = 'pointermove', pointerCancelName="pointercancel", viewPortTransition="";
	var moved = 0, node=0, enableTouch=false, maxStop=0, targetDirection=null, SLIDE_LEFT = 1, SLIDE_RIGHT = 2, SLIDE_TOP = 3, SLIDE_BOTTOM = 4, DEFAULT=5;
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