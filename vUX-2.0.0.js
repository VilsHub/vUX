/*
 * vUX JavaScript framework v2.0.0
 * https://library.vilshub.com/lib/vUX/
 *
 *
 * Released under the MIT license
 * https://library.vilshub.com/lib/vUX/license
 *
 * Date: 2019-06-20T22:30Z
 */

"use strict";

/*************************Helper functions***********************/
function roundToDec(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
};
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
function validateArray(array, totalMember, type, id=null){
	//id => property name
	if (Array.isArray(array)){
		if(totalMember != -1){ //fixed length
			if(array.length == totalMember){
					for (var x = 0; x < totalMember; x++){
						if(type == "string"){
							if (id != null){
								var msg = "Invalid datatype as member for "+ id+ " property  value, string array member needed";
							}else{
								var msg = null;
							}
							if (validateString(array[x], msg)){
								if (x == totalMember-1){
									return true;
								}
							}
						}else if(type == "number"){
							if (id != null){
								var msg = "Invalid datatype as member for "+ id+ " property value, numeric array member needed";
							}else{
								var msg = null;
							}
							if (validateNumber(array[x], msg)){
								if (x == totalMember-1){
									return true;
								}
							}
						}else if(type == "HTMLObject"){
							if (id != null){
								var msg = "Invalid datatype as member for "+ id+ " property value, HTMLElement array member needed";
							}else{
								var msg = null;
							}
							if (validateElement(array[x], msg)){
								if (x == totalMember-1){
									return true;
								}
							}
						}else if(type == "mixed"){
							return true;
						}
					}
			}else{
				if(id != null){
					throw new Error("Incomplete member error: "+ totalMember +" member(s) needed for "+ id +" property");
				}else{
					throw new Error("Incomplete member error: "+ totalMember +" member(s) needed");
				}
			}
		}else if (totalMember == -1){//-1 = no specific length
			var len = array.length;
			for (var x = 0; x < len; x++){
				if(type == "string"){
					if (id != null){
						var msg = "Invalid datatype as member for "+ id+ " property value, string array member needed";
					}else{
						var msg = null;
					}
					if (validateString(array[x], msg)){
						if (x == len-1){
							return true;
						}
					}
				}else if(type == "number"){
					if (id != null){
						var msg = "Invalid datatype as member for "+ id+ " property value, numeric array member needed";
					}else{
						var msg = null;
					}
					if (validateNumber(array[x], msg)){
						if (x == len-1){
							return true;
						}
					}
				}else if(type == "HTMLObject"){
					if (id != null){
						var msg = "Invalid datatype as member for "+ id+ " property value, HTMLElement array member needed";
					}else{
						var msg = null;
					}
					if (validateElement(array[x], msg)){
						if (x == len-1){
							return true;
						}
					}
				}else if(type == "mixed"){
					return true;
				}
			}
		}
	}else{
		if (id != null){
			throw new TypeError("Invalid datatype assigned for "+ id+ " property, value must be an array");
		}else{
			throw new TypeError("Please provide an array");
		}
	}
};
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
function validateElement (element,  msg = null){ //A single element
	if (element instanceof Element){
		return true;
	}else{
		if(msg != null){
			throw new TypeError(msg);
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
function validateObjectLiteral(object){
	if (object.__proto__.isPrototypeOf(new Object()) == true){
		return true;
	}else {
		throw new TypeError("Type error : literal object needed");
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
				throw new Error(msg);
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
/****************************************************************/

/*****************************Timing*****************************/
var timing = {
	//time difference
	timeFraction		: function(startTime, duration){
		//startTime and Duration in milliseconds
		var timeFragment = (Date.now() - startTime) / duration;
		if (timeFragment > 1) {
			timeFragment = 1;
		}
		return timeFragment;
	},
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
/***************************CSS Style getter***************************/
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
					if(validateArray(value, 2, "number")){
						if(value[0]>0 && value[1]>0){
							FRsegment = value;
						}else{
							throw new Error("Array members for 'segment' property value must all be positive integers");
						}
					}
				}
			},
			origin :{
				set: function(value){
					if(validateArray(value, 2, "number")){
							FROrigin = value;
					}
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
						var tf = timing.timeFraction (animationStart, duration);
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
					if(validateString(value)){
						ARlinecolor = value;
					}
				}
			},
			lineWidth :{
				set: function(value){
					if(validateNumber(value)){
						if(value > 0){
							ARlinewidth  = value;
						}else{
							ARlinewidth = 1;
						}
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
					if(validateArray(value, 2, "number")){
						if(value[0]>0 && value[1]>0){
							ARsegment = value;
						}else{
							throw new Error("Array members for 'segment' property value must all be positive integers");
						}
					}
				}
			},
			origin :{
				set: function(value){
					if(validateArray(value, 2, "number")){
							AROrigin = value;
					}
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
function loadProgressIndicator(canvasElement){
	var self = this, start =12,	progressLabel = true, progressBackground	= "#ccc", strokeWidth	= 10, strokeColor	="yellow", radius	= 50, percentageFontColor	= "white",
percentageFont = "normal normal 2.1vw Verdana", LabelFontColor = "white", LabelFont	= "normal normal .9vw Verdana";

	if (validateElement(canvasElement, "loadProgressIndicator() constructor argument 1 must be a valid HTML element")){
		if(canvasElement.nodeName != "CANVAS"){
			throw new Error("imageManipulator() constructor argument 1 must be a valid HTML Canvas element");
		}
	}
	var canvasObj = canvasElement.getContext('2d'); //initialization
	this.circularProgress = {
		config:{
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
				},
				get:function(){
					console.log(555);
				}
			},
			labelFont:{
				set: function(value){
					if(validateString(value, "'labelFont' property value must be string of valid CSS font property value")){
						LabelFont = value;
					}
				}
			}
		},
		show: function(progress, label){
				var test = new formValidator();
				if (test.validate.integer(progress) == false){
					throw new Error("circularProgress.show() method argument 1 must be an integer");
				}
				validateString(label, "circularProgress.show() method argument 2 must be a string");

				var startPoint = 0;
				var fprog = roundToDec(progress, 2);
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
}
/****************************************************************/

/************************ResourceLoader**************************/
function resourceLoader (canvasElement, canvasObj, progressObj){
	//private members starts
	var self 	= this, imageXhr = [],	imageUrls = [],	ImageLoadOk = 0,	FontXhr 	= [],	FontUrls 	= [],	FontLoadOk	= 0,	pageXhr	= [],	pageUrls 	= [],	pageLoadOk	= 0,currentPrg = 0,	currentLbl = "", resourceType = "text";
	var options	= {
			callBack: false,
			fn		: function(){},
			delay	: 0
	}
	function initializeResource(resource){
		if(resourceType == "image"){
			for(var x=0; x<resource.length; x++){
				imageXhr[x] = new XMLHttpRequest();
				imageXhr[x].responseType = 'blob';
				imageUrls[x] = resource[x].getAttribute("data-vbg");
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else if(resourceType == "font"){
			for(var x=0; x<resource.length; x++){
				FontXhr[x] = new XMLHttpRequest();
				FontXhr[x].responseType = 'text';
				FontUrls[x] = resource[x].getAttribute("data-vfont");
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else if(resourceType == "text"){
			for(var x=0; x<resource.length; x++){
				pageXhr[x] = new XMLHttpRequest();
				pageXhr[x].responseType = 'text';
				pageUrls[x] = resource[x].getAttribute("data-vContent");
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
				if (arrayIndex == resource.length-1){
					get();
				}
			})
		}else if (resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == resource.length-1){
					get();
				}
			})
		}else if (resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				//Xreq.onload = function(){

				if (arrayIndex == resource.length-1){
					get();
				}
			})
		}

	};
	function get(){
		if(resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].open("GET", imageUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}else if(resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].open("GET", FontUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}else if(resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].open("GET", pageUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}
	}
	function progCalc(index){
		if(resourceType == "image"){
			if(imageXhr[index].status == 200){
				var reader  = new FileReader();
				reader.onloadend = function () {
					ImageLoadOk += 1;
					var total = (ImageLoadOk/imageXhr.length)*100;
					resource[index].style["background-image"] = "url("+reader.result+")";
					currentPrg = total;
					currentLbl = "Loading images";
					progressObj.circularProgress.show(currentPrg, currentLbl);
					if(total == 100){
						if (options.callBack == true){
							setTimeout(function(){
								options.fn();
							}, options.delay);
						}
					}
				};
				reader.readAsDataURL(imageXhr[index].response);
			}else{
				progressObj.circularProgress.show(0, "Error occured");
			}
		}else if(resourceType == "font"){
			if(FontXhr[index].status == 200){
				FontLoadOk += 1;
				var total = (FontLoadOk/FontXhr.length)*100;
				currentPrg = total;
				currentLbl = "Loading fonts"
				progressObj.circularProgress.show(currentPrg, currentLbl);
				if(total == 100){
					if (options.callBack == true){
						setTimeout(function(){
							options.fn();
						}, options.delay);
					}
				}
			}else{
				progressObj.circularProgress.show(0, "Error "+FontXhr[index].status);
			}
		}else if(resourceType == "text"){
			if(pageXhr[index].status == 200){
				pageLoadOk += 1;
				var total = (pageLoadOk/pageXhr.length)*100;
				resource[index].innerHTML = pageXhr[index].responseText;
				currentPrg = total;
				currentLbl = "Loading content"
				progressObj.circularProgress.show(currentPrg, currentLbl);
				if(total == 100){

					if (options.callBack == true){
						setTimeout(function(){
							options.fn();
						}, options.delay);
					}
				}
			}else{
				currentPrg = 0;
				currentLbl = "Error "+pageXhr[index].status;
				progressObj.circularProgress.show(currentPrg, currentLbl);
			}
		}
	}
	function fireGet(){
		if(resourceType == "image"){
			currentLbl = "Loading images";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].send();
			})
		}else if(resourceType == "font"){
			currentLbl = "Loading fonts";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].send();
			})
		}else if(resourceType == "text"){

			currentLbl = "Loading content";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){

				pageXhr[arrayIndex].send();
			})
		}

	}
	//private members end


	this.config = {
	}
	Object.defineProperties(this, {
		currentProgress:{
			get:function(){
				return currentPrg;
			}
		},
		currentLabel	:	{
			get: function(){
				return currentLbl;
			}
		},
		resourceType: {
			set: function(value){
				if (validateString(value)){
					resourceType = value;
				}

			}
		},
		options:{
			writable:false
		},
		get:{
			value: function(resource){
				initializeResource(resource);
			}
		}

	});
	Object.defineProperties(this.config, {
			callBack:{
				set:function(value){
					if(validateBoolean(value)){
						options.callBack = value
					}
				}
			},
			fn:{
				set:function(value){
					if (validateFunction(value)){
						options.fn = value
					}
				}
			},
			delay:{
				set:function(value){
					if(validateNumber(value)){
						if(value > 0){
							options.delay = value
						}else {
							options.delay = 0
						}
					}
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
		validateArray(texts, -1, "string");
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
				if(validateArray(value, 2, "number")){
					speed = value
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
		large:1000, //large start point
		medium: 600 //medium start point
	}
	validateObjectMembers(breakPoints, baseBeakPoints);

	if(validateNumber(breakPoints["large"])){
		baseBeakPoints.large = breakPoints["large"];
	}
	if(validateNumber(breakPoints["medium"])){
		baseBeakPoints.large = breakPoints["medium"];
	}
	Object.defineProperties(this, {
		screen : {
			get:function(){
				if(innerWidth > baseBeakPoints["large"]){
					return {Mode:"large", actualSize:innerWidth};
				}else if (innerWidth >= baseBeakPoints["medium"] && innerWidth < baseBeakPoints["large"]) {
					return {Mode:"medium", actualSize:innerWidth};
				}else {
					return {Mode:"small", actualSize:innerWidth};
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
function listScroller(container, listParent, listType){
	validateElement(container, "An HTML element needed as list parent container");
	validateElement(listParent, "List parent is not a valid HTML element");
	validateString(listType, "listType must be a string identifying list element type. e.g. 'li', 'div'");
	var windowResizeHandler = new browserResizeProperty();
	var maxAdd = 0, remToAdd = 0, ini = 0, tabsBehindRight = 0,	tabsBehindLeft = 0,	extraSpace = 70,	remainingFrac =0, ready = 0, listening=0, diff=0, remAdded = 0, running=0;
	var listPlane = "x", Xbuttons = [], Ybuttons = [], scrollSize = 175, effects = [1, "linear"], inactiveButtonsClassName = [];
	//Xbuttons[0] = left buttons, Xbuttons[1] = Right buttons
	//scrollToLeftStatus : 1 => not started, 2 => started but not finished, 3 => finished;
	function toggleClass(type, id){
		if(listPlane == "X" || listPlane == "x"){
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

		}
	}
	function assignHandlers(){
		//List Container
		listParent.addEventListener("transitionend", function(e){
			if (listPlane == "X" || listPlane == "x"){
				if (tabsBehindLeft > 0){
					toggleClass("r", 0);
					running=0;
				}else if(tabsBehindLeft == 0 && remAdded > 0){
					toggleClass("r", 0);
					running=0;
				}else if(tabsBehindLeft == 0 && remAdded == 0){
					toggleClass("a", 0);
					running=0;
				}

				if(tabsBehindRight == 0 && remToAdd == 0){
					toggleClass("a", 1);
					running=0;
				}else if(tabsBehindRight > 0){
					toggleClass("r", 1);
					running=0;
				}else if(tabsBehindRight == 0 && remToAdd > 0){
					toggleClass("r", 1);
					running=0;
				}
			}else if (listPlane == "Y" || listPlane == "y") {

			}
		});

		//button left
		Xbuttons[0].addEventListener("click", function(e){
			if (listening == 1){
				if (running == 0){
					running =1;
					scrollToRight(e);
				}
			}
		}, false);

		//button Right
		Xbuttons[1].addEventListener("click", function(e){
			if (listening == 1){
				if(running == 0){
					running=1;
					scrollToleft(e);
				}
			}
		}, false);

		//Browser
		window.addEventListener("resize", function(){
			if (listening == 1){
				scrollFixer();
			}
		},false);

	}
	function computeValues(){
			var containerSize = container.clientWidth;
			var listParentSize = listParent.scrollWidth+extraSpace;

			diff = (containerSize - listParentSize);

	 		var AbsoluteDiff = diff *-1;
	 		tabsBehindRight = parseInt(AbsoluteDiff/scrollSize);
	 		remainingFrac =  AbsoluteDiff%scrollSize;
	 		remToAdd = remainingFrac;
	 		(AbsoluteDiff>scrollSize) ? maxAdd = scrollSize : maxAdd = AbsoluteDiff;

	}
	function addVitalStyles(){
		if(listPlane == "x" || "X" ){
			if (listening == 1){
				listParent.style["display"] = "flex";
				listParent.style["width"] = listParent.scrollWidth+"px";;
				listParent.style["white-space"] = "nowrap";
				listParent.style["transition"] = "left "+ effects[0]+"s "+effects[1]+", right "+effects[0]+"s " +effects[1];
				var listItems = listParent.querySelectorAll(listType);
				if (listItems.length > 0){
					for (var list of listItems) {
						list.style["flex-shrink"] = "0";
					}
					computeValues();
					scrollStatus();
				}else{
					throw new Error("Setup error: No list item found, check the listType specified in the contructor");
				}
			}
		}
	}
	function scrollToleft(e){
		if (e.button == 0){
			if (diff < 0){
				var currentPosition = parseInt(DOMelement.cssStyle(listParent, "left"), "px");
				if(tabsBehindRight != 0){
					maxAdd = scrollSize;
					var newPostion = currentPosition - maxAdd;
					listParent.scrollWidth;
					listParent.style["left"] = newPostion+"px";
					tabsBehindRight--;
					tabsBehindLeft++;
				}else if (tabsBehindRight == 0 && remToAdd > 0) {
					newPostion = currentPosition - remainingFrac;
					remToAdd = 0;
					remAdded = remainingFrac;
					listParent.style["left"] = newPostion+"px";
				}
			}
		}
	}
	function scrollToRight(e){
		if (e.button == 0){
			var currentPosition = parseInt(DOMelement.cssStyle(listParent, "left"), "px");
			if(tabsBehindLeft != 0){
				maxAdd = scrollSize;
				var newPostion = currentPosition + maxAdd;
				listParent.style["left"] = newPostion+"px";
				tabsBehindRight++;
				tabsBehindLeft--;
			}else if (tabsBehindLeft == 0 && remAdded > 0) {
				var newPostion = currentPosition + remainingFrac;
				remAdded = 0;
				remToAdd = remainingFrac;
				listParent.style["left"] = newPostion+"px";
			}
		}
	}
	function scrollStatus(){
		if (listPlane == "x" ||  "X" ){
			if(listening == 1){ //started
				var containerSize = container.clientWidth;
				var listParentSize = listParent.scrollWidth+extraSpace;
				if (containerSize < listParentSize){
					toggleClass("r", 1);
				}
			}
		}else if (listPlane == "y" ||  "Y" ){

		}
	}
	function scrollFixer(){
		if(windowResizeHandler.mode == "expanded"){
			var containerSize = container.clientWidth;
			var listParentSize = listParent.scrollWidth+extraSpace;

			diff = (containerSize - listParentSize);

			if (diff < 0 && tabsBehindRight == 0 && remToAdd == 0){ //Expansion outside view area
				toggleClass("a", 1);
			}else if (diff < 0 && tabsBehindRight >= 0 && remToAdd > 0) { //Expansion within  view area
				toggleClass("r", 1);
				var AbsoluteDiff = windowResizeHandler.change;
		 		tabsBehindRight = tabsBehindRight - parseInt(AbsoluteDiff/scrollSize);
				remainingFrac = AbsoluteDiff%scrollSize;
		 		remToAdd = remToAdd - remainingFrac;
				if (remToAdd > 0){
					(AbsoluteDiff>scrollSize) ? maxAdd = scrollSize : maxAdd = AbsoluteDiff;
				}else if(remToAdd <= 0){
					remToAdd = 0;
				}
			}
		}else if (windowResizeHandler.mode == "shrinked") {
			if (diff < 0){
				toggleClass("r", 1);
				var AbsoluteDiff = windowResizeHandler.change;
		 		tabsBehindRight =  tabsBehindRight + parseInt(AbsoluteDiff/scrollSize);
				remainingFrac = AbsoluteDiff%scrollSize;
				if ((remToAdd + remainingFrac) >= scrollSize){
					tabsBehindRight =  tabsBehindRight + parseInt(AbsoluteDiff/scrollSize);
					remainingFrac = remainingFrac + (remToAdd + remainingFrac)%scrollSize;
					remToAdd = remToAdd + remainingFrac;
				}else{
					remToAdd = remToAdd + remainingFrac;
				}

				if(tabsBehindRight >= 0){
					maxAdd = scrollSize;
				}else if (tabsBehindRight == 0 && remToAdd > 0) {
					maxAdd = AbsoluteDiff;
				}
			}else{
				toggleClass("a", 1);
			}
		}
	};
	this.config = {};
	this.initialize = function(){
			if(listPlane == "x" || "X"){
				if(Xbuttons.length == 0 ){
					throw new Error("Setup error: Xbuttons not specified");
				}
			}else if(listPlane == "y" || "Y"){
				if(Ybuttons.length == 0 ){
					throw new Error("Setup error: Ybuttons not specified");
				}
			}
			if(inactiveButtonsClassName.length == 0){
				throw new Error("Setup error: Buttons class not specified");
			}
			addVitalStyles();
			assignHandlers();
			ready=1;
	};
	this.runScroller = function (){
		if(ready == 1){
			listening = 1;

			addVitalStyles();
			scrollStatus();
		}else {
			throw new Error("Initialization incomplete, complete initialization 1st before executing 'runScroller()' method");
		}
	}
	this.offScroller = function (){
		if(ready == 1){
			listening = 0;
			toggleClass("a", 0);
			toggleClass("a", 1);
		}else {
			throw new Error("Initialization incomplete, complete initialization 1st before executing 'runScroller()' method");
		}
	};
	Object.defineProperties(this.config, {
		listPlane:{
			set: function(value){
				if (validateString(value, "String needed as listPlane value")){
					if(matchString(value, ["x", "y", "X", "Y"], "listPlane value can either be 'x' or 'y', case insensitive")){
						listPlane = value;
					}
				}
			}
		},
		Xbuttons: {
			set:function(value){
				if(validateArray(value, 2, "HTMLObject", "Xbuttons")){
					Xbuttons = value;
				}
			}
		},
		Ybuttons: {
			set:function(value){
				if(validateArray(value, 2, "HTMLObject", "Ybuttons")){
					Ybuttons = value;
				}
			}
		},
		scrollSize: {
			set:function(value){
				if(validateNumber(value, "Numeric value needed for scrollSize property")){
					scrollSize = value;
				}
			}
		},
		extraSpace: {
			set:function(value){
				if(validateNumber(value, "Numeric value needed for extraSpace property")){
					extraSpace = value;
				}
			}
		},
		inactiveButtonsClassName:{
			set:function(value){
				if(validateArray(value, -1, "string", "inactiveButtonsClassName")){
					if (value.length == 0 ){
						throw new Error ("'config.inactiveButtonsClassName' property value cannot be an empty array");
					}else{
						if(value.length > 2){
							throw new Error ("'config.inactiveButtonsClassName' property value must be an array of either 1 or 2 members");
						}else{
							inactiveButtonsClassName = value;
						}
					}
				}
			}
		},
		effects:{
			set:function(value){
				if(validateArray(value, 2, "mixed", "effects")){
					if(validateNumber(value[0], "Effects array 1st element must be an numeric type, which represents the speed")){
						if(validateString(value[1], "Effects array 2nd element must be a string type, which represents the effect (A CSS valid effect value e.g 'linear')")){
							effects = value;
						}
					}
				}
			}
		}
	});
	Object.defineProperties(this, {
		config:{writable:false},
		initialize:{writable:false},
		runScroller:{writable:false},
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
		var currentSelected = document.querySelector("."+vWrapper + " .optionsCon .selected");
		var sfield = document.querySelector("."+vWrapper + " .sfield");
		currentSelected.classList.remove("selected");
		var currentHovered = document.querySelector("."+vWrapper + " .optionsCon .hovered");
		var mainSelect = document.querySelector("."+vWrapper).nextElementSibling;

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
			var index = element.index(activieHovered);
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
			var index = element.index(activieHovered);
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
		var css = "."+vWrapper + " {width:"+selectDim[0]+"; height:"+selectDim[1]+";}";
		css += "."+vWrapper + " .sfield {position:absolute; width:100%; height:100%; z-index:1; line-height:"+selectDim[1]+"; padding-left:5px; cursor:pointer; box-sizing: border-box; background-color:#ccc;}";
		css += "."+vWrapper + " .optionsCon {position:absolute; width:100%; height:0px; z-index:2; top:100%; transition:height 0.2s linear; overflow-y:hidden; display:none}";
		css += "."+vWrapper + " .optionsCon .option {position:static; width:100%; height:"+selectDim[1]+"; padding-left:5px; box-sizing:border-box; line-height:"+selectDim[1]+";border-bottom:solid 1px #ccc;}";
		css += "."+vWrapper + " .optionsCon .option[data-disabled='false'] { cursor:pointer; }";
		css += "."+vWrapper + " .optionsCon .option[data-disabled='true'] { cursor:not-allowed; background-color:#2f2a2a; color:#595454!important;}";
		css += "."+vWrapper + " .optionsCon .option:last-of-type {border-bottom:none!important;}";
		css += "."+vWrapper + " .optionsCon .hovered {background-color:rgba(255, 255, 255, 0.3)}";
		css += "."+vWrapper + " .optionsCon .selected {background-color:rgba(255, 255, 255, 0.5)}";
		css += "."+vWrapper + " .arrowCon {width:"+selectDim[1]+"; height:100%; background-color:rgb(255, 255, 255); content:''; border-left:solid 1px black; position:absolute; right:0; top:0; box-sizing:border-box; z-index:5; cursor:pointer;}";
		css += "."+vWrapper + " .arrowCon::before {position:absolute; left:0; top:0; width:100%; height:100%; text-align:center; line-height:"+selectDim[1]+"; transition: color 0.1s linear;}";
		css += "."+vWrapper + " .arrowCon:hover::before {color:rgba(255, 255, 255, 0.3)!important;}";
		css += "."+vWrapper + " .arrowCon:active::before {color:rgba(255, 255, 255, 0.6)!important;}";

		if(arrowIconClose != ""){
			css += "."+vWrapper + " .arrowCon::before {"+arrowIconClose+"}"
		}
		if(arrowIconOpen != ""){
			css += "."+vWrapper + " .opened::before {"+arrowIconOpen+"}"
		}

		var styleElement = document.createElement("style");
		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
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
		var listOptionCon = document.querySelector("."+vWrapper + " .optionsCon");
		var arrowCon = document.querySelector("."+vWrapper + " .arrowCon");
		listParent.addEventListener("mousedown", function(e){
			if (e.button == 0){
				if (e.target.classList.contains("sfield") | e.target.classList.contains("arrowCon")){
					toggleOptionList(listOptionCon);
				}else if (e.target.classList.contains("option")) {
					if (multipleSelection == false && e.target.getAttribute("data-disabled") == "false"){
						selectOptions(listOptionCon);
					}
				}
			}
		}, false);
		document.body.addEventListener("click", function(e){
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
			reCreateSelect(SelectElement);
			assignEventHandler(SelectElement);
		}
	};
	Object.defineProperty(this, "select", {
		writable:false
	})
	Object.defineProperties(this.select, {
		build:{
			writable:false
		},
		afterSelectionFn : {//Function to call after selection
			set:function(value){
				if(validateFunction(value, "Function needed as value for the 'afterSelectionFn' property")){
					afterSelectionFn = value;
				}
			}
		},
		selectDimension:{
			set:function(value){
				if(validateArray(value, 2, "string", "selectDimension")){
					if(validateDimension(value[0], "Invalid dimension specified for 'width' in 'selectDimension' property")){
						if(validateDimension(value[1], "Invalid dimension specified for 'height' in 'selectDimension' property")){
							selectDim = value;
						}
					}
				}
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
		optionsContainerStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS styles needed for the 'optionsContainerStyle' property")){
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
	var radioDim =[], radioButtonStyle="", selectedIcon = "", deselectedIcon ="", radioLabelStyle ="",
	mouseEffect = [], parentCSSName= "", styled=false;
	/************************************************************************************/
	//radioDim[a,b] a=> width of select cElement , b=> height of select cElemt
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

	function radioStyleSheet(){
			var left = parseInt(extractDimensionValue(radioDim[0], "px"))+2;
			var css = parentCSSName + " label {position:relative; cursor:pointer;}";
			css +=  parentCSSName + " label::before {cursor:pointer; box-sizing:border-box; width:"+radioDim[0]+"; border-radius:100%; height:"+radioDim[1]+"; transition:all 0.2s linear; position:absolute; left:-"+left+"px; content:''}";
			css +=  parentCSSName + " .selected::before {border:solid 1px white; background-color:purple}";
			css +=  parentCSSName + " .deselected::before {border:solid 1px purple; background-color:white}";
			css +=  parentCSSName + " .deselected::before:hover{"+mouseEffect[0]+";}";
			css +=  parentCSSName + " .deselected:active::before{"+mouseEffect[1]+";}";

			if(deselectedIcon != ""){
				css += parentCSSName + "  .deselected::before {"+deselectedIcon+"}";
			}
			if(selectedIcon != ""){
				css += parentCSSName + " .selected::before {"+selectedIcon+"}";
			}

			if(radioLabelStyle != ""){
				css += parentCSSName + "label {"+radioLabelStyle+"}";
			}

			var styleElement = document.createElement("style");
			styleElement.setAttribute("type", "text/css");
			if (styleElement.styleSheet) {
				styleElement.styleSheet.cssText = css;
			} else {
			  styleElement.appendChild(document.createTextNode(css));
			}
			document.getElementsByTagName('head')[0].appendChild(styleElement);
	}
	function toggleRadioButton(e, RadioElement){
		var radioInputsParent = document.querySelector(parentCSSName);

		//Find previous selected
		var previousSelected = radioInputsParent.querySelector(".selected");

		if (previousSelected != null){
			if(e.target.previousElementSibling.checked != true){
				previousSelected.classList.remove("selected");
				previousSelected.classList.add("deselected");
				//
				e.target.classList.remove("deselected");
				e.target.classList.add("selected");
			}
		}else{
			e.target.classList.remove("deselected");
			e.target.classList.add("selected");
		}
	}
	function assignRadioEventHanler(RadioElement){
			var radioLabel = RadioElement.nextElementSibling;
			radioLabel.addEventListener("click", function(e){
				toggleRadioButton(e, RadioElement);
			}, false);
	}
	this.radio = {
		build: function(RadioElement){
			validateElement(RadioElement, "An input element needed as argument for the 'build' method, non provided");
			if (parentCSSName == ""){
				throw new Error ("Setup error: No radio buttons parent specified, please specify using the 'radio.parentCSSName' property and try again");
			}
			if(RadioElement.nodeName != "INPUT" && RadioElement.getAttribute("type") != "radio"){
				throw new Error("A radio input element needed, please specify a valid radio input element");
			}
			if (radioDim.length == 0){
				throw new Error("Setup imcomplete: radio component dimension needed, specify using the 'radioButtonDimension' property");
			}
			if (styled == false){
				//Apply Styles
				radioStyleSheet();

				styled = true;
			}
			RadioElement.style["opacity"] = "0";
			if(RadioElement.checked == true){
				RadioElement.nextElementSibling.classList.add("selected");
			}else{
				RadioElement.nextElementSibling.classList.add("deselected");
			}
			assignRadioEventHanler(RadioElement);
		}
	}
	Object.defineProperty(this, "radio", {
		writable:false
	});
	Object.defineProperties(this.radio, {
	build:{
		writable:false
	},
	radioButtonDimension:{
		set:function(value){
			if(validateArray(value, 2, "string", "radioButtonDimension")){
				if(validateDimension(value[0], "Invalid dimension specified for 'width' in 'radioContainerDimension' property")){
					if(validateDimension(value[1], "Invalid dimension specified for 'height' in 'radioContainerDimension' property")){
						radioDim = value;
					}
				}
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
	selectedIcon:{
		set:function(value){
			if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedIcon' property")){
				selectedIcon = value;
			}
		}
	},
	deselectedIcon:{
		set:function(value){
			if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedIcon' property")){
				deselectedIcon = value;
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
	parentCSSName:{
		set:function(value){
			if (validateString(value, "A string needed as value for 'parentCSSName' property")){
				var testE = document.querySelector(value);
				if (testE == null){
					throw new Error("'parentCSSName' property value must be a string of valid CSS class or ID name")
				}else{
					parentCSSName = value;
				}
			}
		}
	},
	mouseEffectStyle:{
		set:function(value){
			if(validateArray(value, 2, "string", "mouseEffectStyle")){
				mouseEffect = value;
			}
		}
	},
})
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom checkBox builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
	var checkBoxDim =[], checkBoxStyle="", checkedCheckBoxIcon = "", uncheckedCheckBoxIcon ="", checkBoxLabelStyle ="",
	mouseEffect = [], styled=false, parentCSSName= "";
	/************************************************************************************/
	//checkBoxDim[a,b] a=> width of checkBox cElement , b=> height of checkBox cElement
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

	function toggleCheckBox(e){
		if(e.target.nodeName == "LABEL"){
			if(e.target.previousElementSibling.checked != true){
				e.target.classList.remove("unchecked");
				e.target.classList.add("checked");
				e.target.previousElementSibling.checked = true;
			}else{
				e.target.classList.remove("checked");
				e.target.classList.add("unchecked");
				e.target.previousElementSibling.checked = false;
			}
		}else if (e.target.nodeName == "INPUT") {
			if(e.target.checked != true){
				e.target.nextElementSibling.classList.remove("unchecked");
				e.target.nextElementSibling.classList.add("checked");
				//e.target.previousElementSibling.checked = true;
			}else{
				e.target.nextElementSibling.remove("checked");
				e.target.nextElementSibling.add("unchecked");
				//e.target.previousElementSibling.checked = false;
			}
		}

	};
	function checkBoxEventHandler(checkBoxElement){
		var radioLabel = checkBoxElement.nextElementSibling;
		radioLabel.addEventListener("click", function(e){
			toggleCheckBox(e);
		}, false);
		checkBoxElement.addEventListener("click", function(e){
			toggleCheckBox(e);
		}, false);
	}
	function checkBoxStyleSheet(){
			var left = parseInt(extractDimensionValue(checkBoxDim[0], "px"))+2;
			var css = parentCSSName + " label {position:relative; cursor:pointer;}";
			css +=  parentCSSName + " label::before {overflow:hidden;cursor:pointer; box-sizing:border-box; width:"+checkBoxDim[0]+"; border-radius:4px; height:"+checkBoxDim[1]+"; transition:all 0.2s linear; position:absolute; left:-"+left+"px; content:''}";
			css +=  parentCSSName + " .checked::before {border:solid 1px white; background-color:purple; box-sizing:border-box; }";
			css +=  parentCSSName + " .unchecked::before {border:solid 1px purple; background-color:white;  box-sizing:border-box; }";
			css +=  parentCSSName + " .unchecked::before:hover{"+mouseEffect[0]+";}";
			css +=  parentCSSName + " .unchecked:active::before{"+mouseEffect[1]+";}";


			if(uncheckedCheckBoxIcon != ""){
				css += parentCSSName + " .unchecked::before {"+uncheckedCheckBoxIcon+"}";
			}
			if(checkedCheckBoxIcon != ""){
				css += parentCSSName + " .checked::before {"+checkedCheckBoxIcon+"}";
			}

			if(checkBoxLabelStyle != ""){
				css += parentCSSName + " label {"+checkBoxLabelStyle+"}";
			}

			var styleElement = document.createElement("style");
			styleElement.setAttribute("type", "text/css");
			if (styleElement.styleSheet) {
				styleElement.styleSheet.cssText = css;
			} else {
			  styleElement.appendChild(document.createTextNode(css));
			}
			document.getElementsByTagName('head')[0].appendChild(styleElement);
	}
	this.checkBox = {
		build: function(checkBoxElement){
			validateElement(checkBoxElement, "An input element needed as 1st argument for the 'build' method, non provided");
			if(checkBoxElement.nodeName != "INPUT" && checkBoxElement.getAttribute("type") != "checkbox"){
				throw new Error("A checkbox input element needed as 1st argument, please specify a valid checkbox input element");
			}
			if (parentCSSName == ""){
				throw new Error ("Setup error: No radio buttons parent specified, please specify using the 'radio.parentCSSName' property and try again");
			}
			if (checkBoxDim.length == 0){
				throw new Error("Setup imcomplete: checkbox component dimension needed, specify using the 'checkBox.checkBoxDimension' property");
			}
			if (styled == false){
				//Apply Styles
				checkBoxStyleSheet();
				styled = true;
			}
			checkBoxElement.style["opacity"] = "0";
			if(checkBoxElement.checked == true){
				checkBoxElement.nextElementSibling.classList.add("checked");
			}else{
				checkBoxElement.nextElementSibling.classList.add("unchecked");
			}
			checkBoxEventHandler(checkBoxElement);
		}
	}
	Object.defineProperty(this, "checkBox", {
		writable:false
	});
	Object.defineProperties(this.checkBox, {
		build:{
			writable:false
		},
		checkBoxDimension:{
			set:function(value){
				if(validateArray(value, 2, "string", "checkBox.checkBoxDimension")){
					if(validateDimension(value[0], "Invalid dimension specified for 'width' in 'checkBox.checkBoxDimension' property")){
						if(validateDimension(value[1], "Invalid dimension specified for 'height' in 'checkBox.checkBoxDimension' property")){
							checkBoxDim = value;
						}
					}
				}
			}
		},
		checkedIcon:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedCheckBoxStyle' property")){
					checkedCheckBoxIcon = value;
				}
			}
		},
		uncheckedIcon:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedCheckBoxStyle' property")){
					uncheckedCheckBoxIcon = value;
				}
			}
		},
		labelStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'labelStyle' property")){
					checkBoxLabelStyle = value;
				}
			}
		},
		parentCSSName:{
			set:function(value){
				if (validateString(value, "A string needed as value for 'parentCSSName' property")){
					var testE = document.querySelector(value);
					if (testE == null){
						throw new Error("'parentCSSName' property value must be a string of valid CSS class or ID name")
					}else{
						parentCSSName = value;
					}
				}
			}
		},
		mouseEffectStyle:{
			set:function(value){
				if(validateArray(value, 2, "string", "mouseEffectStyle")){
					mouseEffect = value;
				}
			}
		}
	})
	/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}
/****************************************************************/

/************************Form validator**************************/
function formValidator(){
	var bottomConStyle ="", initialized=false, leftConStyle="", rightConStyle="", placeholderClass="", inputWrapperClass="";

	//Create Element
	function createMessageCon(messageConElement, messageType, location, message, inputVisualFields, maxSize){
		//Validations
		if (inputVisualFields != null){
			validateArray(inputVisualFields, "-1" , "mixed", "'write' method argument 5 must be an array");

			if (inputVisualFields.length == 1){
				validateString(inputVisualFields[0], "'write' method argument 5 array 1st element must be a string, and cannot be null");
				var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
				validateElement(inputWrapper, "A string representing input wrapper id name is needed as array element 1 of the 'write' method argument 5 ");
			}else if(inputVisualFields.length == 2){
				//1st element
				validateString(inputVisualFields[0], "'write' method argument 5 array 1st element must be a string, and cannot be null");
				var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
				validateElement(inputWrapper, "A string representing input wrapper id name is needed as array element 1 of the 'write' method argument 5 ");

				//2nd element
				if (inputVisualFields[1] != null){
					validateString(inputVisualFields[1], "'write' method argument 5 array 2nd element must either be null or a string");
					var placeholder = messageConElement.querySelector("#"+inputVisualFields[1]);
					validateString(inputVisualFields[1], "A string representing placeholder id name is needed as array element 2 of the 'write' method argument 5 ");
				}
			}else if(inputVisualFields.length == 3){
				//1st element
				validateString(inputVisualFields[0], "'write' method argument 5 array 1st element must be a string, and cannot be null");
				var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
				validateElement(inputWrapper, "A string representing input wrapper id name is needed as array element 1 of the 'write' method argument 5 ");

				//2nd element
				if (inputVisualFields[1] != null){
					validateString(inputVisualFields[1], "'write' method argument 5 array 2nd element must either be null or a string");
					var placeholder = messageConElement.querySelector("#"+inputVisualFields[1]);
					validateString(inputVisualFields[1], "A string representing placeholder id name is needed as array element 2 of the 'write' method argument 5 ");
				}

				//3rd element
				validateString(inputVisualFields[2], "'write' method argument 5 array 3rd element must be a string");
			}
		}

		if (maxSize != null){
			validateDimension(maxSize, "A string of valid CSS dimension needed as argument 6 for 'write' method");
		}
		//_______________________________________________________________________________________________________________

		var checkExistence = messageConElement.querySelector(".vMsgBox");
		if (checkExistence == null){
			var messageBoxWrapper = document.createElement("DIV");

			if(location == "left"){
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft error le");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft warning lw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vLeft success ls");
				}

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
			}else if (location == "right") {
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight error re");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight warning rw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vRight success rs");
				}

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
			}else if (location == "bottom") {
				if (messageType == "error"){
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom error be");
				}else if (messageType == "warning") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom warning bw");
				}else if (messageType == "success") {
					messageBoxWrapper.setAttribute("class", "vMsgBox vBottom success bs");
				}

				if(bottomConStyle != ""){
					messageBoxWrapper.setAttribute("style", bottomConStyle);
				}
			}

			messageBoxWrapper.appendChild(document.createTextNode(message));
			messageConElement.appendChild(messageBoxWrapper);
			messageConElement.style["color"] = "transparent";

			if (location == "left"){
				var m = messageConElement.querySelector(".vLeft");
				sendBehind(m, location, 15, maxSize);
			}else if (location == "right") {
			 	var m = messageConElement.querySelector(".vRight");
				sendBehind(m, location, 15, maxSize);
			}else if (location == "bottom") {
				var	m = messageConElement.querySelector(".vBottom");
				drop(m);
			}
		}else{
			if(location == "left" || location == "right" ){
				if (maxSize != null){
					checkExistence.style["width"] = maxSize;
					checkExistence.style["line-height"] = "23px";
					checkExistence.style["white-space"] = "normal";
				}else{
					checkExistence.style["width"] = "auto";
					checkExistence.style["white-space"] = "nowrap";
					checkExistence.style["line-height"] = "250%";
				}

				checkExistence.style["text-align"] = "left";
				checkExistence.style["height"] = "auto";
				checkExistence.style["min-height"] = DOMelement.cssStyle(checkExistence, "height");
				checkExistence.innerHTML = message;
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
				var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
				inputWrapper.classList.add("ierror");
				if(inputVisualFields[1] != null){
					var placeholder = messageConElement.querySelector("#"+inputVisualFields[1]);
					placeholder.classList.add("lerror");
				}
			}
		}
	}

	function clearMessage(messageConElement, location, inputVisualFields){
			if (inputVisualFields != null){
				validateArray(inputVisualFields, "2" , "mixed", "'write' method argument 5");

				validateString(inputVisualFields[0], "'write' method argument 5 array 1st element must be a string, and cannot be null");
				var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
				validateElement(inputWrapper, "A string representing input wrapper id name is needed as array element 1 of the 'write' method argument 5 ");

				if (inputVisualFields[1] != null){
					validateString(inputVisualFields[1], "'write' method argument 5 array 2nd element must either be null or a string");
					var placeholder = messageConElement.querySelector("#"+inputVisualFields[1]);
					validateString(inputVisualFields[1], "A string representing placeholder id name is needed as array element 2 of the 'write' method argument 5 ");
				}
			};
			var checkExistence = messageConElement.querySelector(".vMsgBox");
			if (checkExistence != null){

				if(location  == "left" || location  == "right"){
					if (checkExistence.classList.contains("vRight") || checkExistence.classList.contains("vLeft")){
						checkExistence.classList.add("clear");
						checkExistence.style["color"] = "transparent";
						checkExistence.style["width"] = "0";
					}else{
						throw new Error("No left or right message found to clear, recheck 'clear()' method argument 2");
					}
				}else if (location  == "bottom") {
					if (checkExistence.classList.contains("vBottom")){
						checkExistence.classList.add("clear");
						checkExistence.style["color"] = "transparent";
						checkExistence.style["height"] = "0";
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
					var inputWrapper = messageConElement.querySelector("#"+inputVisualFields[0]);
					inputWrapper.classList.remove("ierror");
					if(inputVisualFields[1] != null){
						var placeholder = messageConElement.querySelector("#"+inputVisualFields[1]);
						placeholder.classList.remove("lerror");
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
			}else if (e.target.classList.contains("vMsgBox")  && e.target.classList.contains("clear")){
				e.target.parentNode.removeChild(e.target);
			}
		});
	}

	function InIError(methodName){
		throw new Error("To use the '"+methodName+"()' method, initialization must be done. Initialize using the 'initialize()' method");
	}
	//create style styleSheet
	function setStyleSheet(){
		var css = " .vMsgBox {box-sizing:border-box; padding:0 10px 0 10px; text-align:center; white-space: nowrap; font-size:13px; line-height:250%; color:transparent; border-radius:5px;}";
		css += " .vLeft, .vRight{width:auto; height:100%; position:absolute; top:0; transition:width 0.2s cubic-bezier(0,.81,.22,1);}";
		css += " .vBottom{width:100%; height:auto; position:relative; transition:height 0.2s cubic-bezier(0,.81,.22,1);margin-bottom:10px; margin-top:18px;}";
		css += " .vBottom::before{width:0px; height:0px; top:-11px; border-left: 8px solid transparent; border-right: 8px solid transparent; left:10px; z-index:10; content:''; position:absolute;}";
		css += " .vLeft::before, .vRight::before{border-top: 8px solid transparent; border-bottom: 8px solid transparent;position:absolute; content:''; top:6px;  z-index:10;}";
		css += " .vLeft::before{right:-11px;}";
		css += " .vRight::before{left:-11px;}";
		css += " .ierror{border:solid 1px #d82323!important; background-color: #bc949499!important;}";
		css += " .iwarning{border:solid 1px #d82323!important; background-color: #bc949499!important;}";
		css += " .isuccess{border:solid 1px #d82323!important; background-color: #2b9030!important;}";
		css += " .lerror{color: #d82323!important;}";

		css += " .error {background-color:#e3b4b4; border:solid 1px #d82323;}";
		css += " .warning {background-color:#e3e1b4; border:solid 1px #e97514;}";
		css += " .success {background-color:#c2e3b4; border:solid 1px #2b9030;}";

		css += " .lw::before{ border-left:11px solid #e97514;}";
		css += " .le::before{ border-left:11px solid #d82323;}";
		css += " .ls::before{ border-left:11px solid #2b9030;}";

		css += " .rw::before{ border-right:11px solid #e97514;}";
		css += " .re::before{ border-right:11px solid #d82323;}";
		css += " .rs::before{ border-right:11px solid #2b9030;}";

		css += " .bw::before{ border-bottom:11px solid #e97514;}";
		css += " .be::before{ border-bottom:11px solid #d82323;}";
		css += " .bs::before{ border-bottom:11px solid #2b9030;}";

		var styleElement = document.createElement("style");
		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
	}

	//For right and left display
	function sendBehind(element, direction, offset, maxSize){
		var width = element.scrollWidth;
		if(direction == "left"){
			element.style["right"] = "calc(100% + "+offset+"px)";
		}else if (direction == "right") {
			element.style["left"] = "calc(100% + "+offset+"px)";
		}

		element.style["width"] = "0px";
		element.scrollWidth;
		if(maxSize != null){
			element.style["width"] = maxSize;
		}else{
			element.style["width"] = width+"px";
		}
	}

	//For bottom display
	function drop(element){
			var height = element.scrollHeight;
			element.style["height"] = "0px";
			element.scrollHeight;
			element.style["height"] = height+"px";
	}

	/*Message*/
	this.message = {

		write: function(messageConElement, messageType, location, message, inputVisualFields=null, maxSize=null){
			//messageConElement =>  must be the container housing the input element and the placeholder element, which defines the width for them
			//(optinal) inputVisualFields [a,b, c] : a => inputWrapper, b => placeholder, c => custom top position for left|right location
			//(optinal) maxSize: A valid dimension for messageBox, its height when location = bottom and width when location = left | right

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
				createMessageCon(messageConElement, messageType, location, message, inputVisualFields, maxSize);
			}else{
				InIError("write");
			}
		},
		clear: function(messageConElement, location, inputVisualFields=null){
			//messageConElement =>  must be the container housing the input element and the placeholder element, which defines the width for them
			//inputVisualFields [a,b] : a => inputWrapper, b => placeholder
			if (initialized == true){
				validateElement(messageConElement, "'write' method needs a valid HTML element as argument 1");
				if(validateString(location, "'write' method needs a string as argument 3")){
					if(!(location == "bottom" || location == "left" || location == "right")){
						throw new Error ("'write' method argument 3 must be string value of either: 'bottom', 'left', or 'right'");
					}
				};
				if(inputVisualFields == null && inputWrapperClass==""){
						throw new Error("'write method'argument 5 and 'inputWrapperClass' property cannot be simultaneously emtpy, specify either 1");
				}
				if(inputVisualFields == null && placeholderClass==""){
						throw new Error("'write method'argument 5 and 'placeholderClass' property cannot be simultaneously emtpy, specify either 1");
				}

				clearMessage(messageConElement, location, inputVisualFields);
			}else {
				InIError("clear");
			}
		}
	}
	/**********/

	/*Initialize*/
	this.initialize = function(){
		setStyleSheet();
		addEventhandler();
		initialized =true;
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
			inputElement.addEventListener("keyup", function(){
				var inputValue = sanitizeInteger(inputElement.value);
				inputElement.value = inputValue;
			}, false);
		}
	}
  /**********/

	/*validator*/
	this.validate = {
		alpha: function(input){
			var target = /^[A-Za-z]+$/.test(input); //checks for other characters except A-Za-z
			return target;
		},
		alphaNumeric : function(input){
			var target= /^[A-Za-z0-9]+$/.test(input); //checks for other characters except A-Za-z0-9
			return target;
		},
		emailAddress : function(email){
			var email_filter = /^[a-zA-Z0-9\-\.\_]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,3}$/.test(email);//matches email address pattern
			return email_filter;
		},
		integer:function(n){
			return Number(n) === n && n % 1 === 0;
		},
		float:function(n){
			return Number(n) === n && n % 1 !== 0;
		}
	}
	/**********/
	Object.defineProperties(this.validate, {
		alpha:{
			writable:false
		},
		alphaNumeric:{
			writable:false
		},
		emailAddress:{
			writable:false
		}
	});
	Object.defineProperties(this.format, {
		toCurrency:{writable:false},
		roundToDec:{writable:false},
		integerField:{writable:false}
	});
	Object.defineProperties(this.config, {
		bottomConStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'bottomConStyle' property")){
					bottomConStyle = value;
				}
			}
		},
		leftConStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'leftConStyle' property")){
					leftConStyle = value;
				}
			}
		},
		rightConStyle:{
			set:function(value){
				if(validateString(value, "A string of valid CSS style(s) needed for the 'rightConStyle' property")){
					rightConStyle = value;
				}
			}
		},
		placeholderClass:{
			set:function(value){
				if(validateString(value, "A string needed for the 'placeholderClass' property")){
					var elmentTest = document.querySelector("."+value);
					if(elmentTest != null){
						placeholderClass = value;
					}else{
						throw new Error("A string representing input placeholder class name needed as value for 'placeholderClass' property");
					}
				}
			}
		}, // Used if input placeholder is not specified in write method
		inputWrapperClass:{
			set:function(value){
				if(validateString(value, "A string needed for the 'inputWrapperClass' property")){
					var elmentTest = document.querySelector("."+value);
					if(elmentTest != null){
						inputWrapperClass = value;
					}else{
						throw new Error("A string representing input inputWrapperClass class name needed as value for 'inputWrapperClass' property");
					}
				}
			}
		} ///Used if input wrapper is not specified in write method
	});
	Object.defineProperties(this.message, {
		write:{writable:false}
	});

	Object.defineProperty(this, "config", {writable:false});
	Object.defineProperty(this, "format", {writable:false});
	Object.defineProperty(this, "validate", {writable:false});
	Object.defineProperty(this, "message", {writable:false});
	Object.defineProperty(this, "initialize", {writable:false});
}
/****************************************************************/

/****************************Modal*******************************/
function modalDisplayer(){
	var self=this,cssWidth="",currentForm=null,id=null, effectName="none", bodyOldPosition = "", mainFormCon = "", closeButton=null, mainFormConInner="", overlayType="", colorOverlayStyle="", maxupScrollUpStop =0, totalHeight=0, initialized =false, openProcessor=function(){}, closeProcessor=function(){}, modalOn=false, sY=0, sX=0, endSy=0, scrollable=false, computedModalHeight=0, computedModalWidth=0, modalHeigthBelow=0, modalHeigthAbove=0, paddingTop=50, reachedBottom=0;
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
				modal.style["transform"] = "translateY(0%) translateX(-50%)";
				reachedBottom =0;
			}else{
				modalHeigthAbove = ((paddingTop*2)+computedModalHeight)-window.innerHeight;
				maxupScrollUpStop = scrollY - modalHeigthAbove;
				var newTop = modalHeigthBelow-paddingTop;
				modal.style["top"] = "-"+newTop+"px";
				modal.style["transform"] = "translateY(0%) translateX(-50%)";
				reachedBottom = 1;
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
		window.addEventListener("scroll", function(e){
			if(scrollable == true){
				//Scrolling
				if((sY + modalHeigthBelow) - scrollY > 0){
					var modal = document.querySelector(".vModal .modalSpace");
					if(scrollY >= sY && reachedBottom == 0){
						var diff = (sY+paddingTop)-scrollY;
						modal.style['top'] = diff+"px";
						endSy = scrollY;
					}else if(scrollY < sY && reachedBottom == 0){//scroll up stop
						modal.style['top'] = paddingTop+"px";
						scrollTo(0, sY);
					}else if (reachedBottom == 1){
						if(scrollY > maxupScrollUpStop){
							var currentTop = parseInt(DOMelement.cssStyle(modal, "top"),"px");
							if (scrollHandler.query["direction"] == "up"){
							  var newTop = currentTop + scrollHandler.query["change"];
								modal.style['top'] = newTop+"px";
							}else if (scrollHandler.query["direction"] == "down") {
								var newTop = currentTop - scrollHandler.query["change"];
								modal.style['top'] = newTop+"px";
							}
						}else if (scrollY < maxupScrollUpStop) {
							scrollTo(0, maxupScrollUpStop);
							modal.style['top'] = paddingTop+"px";
						}
					}
				}else {//scroll Down stop
					scrollTo(0, endSy);
				}
			}
		}, false)
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
		if (closeButton != null){
			document.body.addEventListener("click", function(e){
				if (e.target.id == closeButton.id){
					self.close();
				}
			})
		}
	}
	function resetOldModalProperties(oldModal, currentModal){
		oldModal.setAttribute("id", currentModal.id);
		oldModal.setAttribute("class", currentModal.getAttribute("class"));
		oldModal.style["display"] = "none";
		oldModal.style["width"] = cssWidth;
		oldModal.innerHTML = mainFormConInner;
	}
	function createStyles(){
		var css = " .vModal{position:absolute; top:0; width:100%; height:100vh; z-index:999; display:none}";
		css += ".show {display:block}";
		css += " .vModal .modalSpace {height:auto; top:50%; left:50%; transform:translateX(-50%) translateY(-50%); position:absolute;}";
		css += " .vModal .modalSpace #newModal{width:100%;}";
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
	}
	function createElements(){

		//Create
		var overlay = document.createElement("DIV");
		var effectsCon = document.createElement("DIV");


		//Set attributes
		overlay.setAttribute("class", "vModal");
		if (colorOverlayStyle != ""){
			overlay.setAttribute("style", colorOverlayStyle );
		}

		effectsCon.setAttribute("class", "modalSpace");


		//Append modal
		//modalSpace to overlay
		overlay.appendChild(effectsCon);

		//Modal to document
		document.body.appendChild(overlay);
	};
	this.config = {};
	this.show = function(modal){
		validateElement(modal,"'show()' method accepts a valid HTML element");
		if(initialized==true){
			sY = scrollY;
			document.querySelector(".vModal").style["top"] = sY+"px";
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
		totalHeight = document.querySelector("html").scrollHeight;
		createStyles();
		createElements();
		addEventhandler();
		initialized = true;
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
				if(validateObjectMember(effects, value, "Invalid effect type specified for the 'effect' property")){
					effectName = value;
				}
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
				if(validateString(value, "A string of valid CSS style(s) needed for the 'colorOverlayStyle' property")){
					if (overlayType == "color"){
						colorOverlayStyle = value
					}else{
						throw new Error("Overlay type must be set to 'color' before setting the 'colorOverlayStyle' property");
					}

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
				if(validateElement(value, "A valid HTML Element needed as 'closeButton' property, invalid HTML element specified")){
					if(value.getAttribute("id") != null){
						closeButton = value;
					}else{
						throw new Error("The specified close button element must have an id attribute set, please set and try again");
					}
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
	yearValue="",daysToolTip=false,pastStopDate=[currentYear, today.getMonth(), today.getDate()-1], monthValue="",dayValue="",timeValue=["","",""],displayTimeValue=["","",""],forward=true,numberOfyearsConBoxes=0,months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var status = {
		set:false,
		completed:false
	};
	function createStyles(){
		var css = ".vDateIcon {position:absolute; width:36px; top:0; right:0; height:100%; box-sizing:border-box;z-index:4;}";
		css += ".vDateIcon::before {transition:color .2s linear; cursor:pointer; text-align:center; line-height:200%;position:absolute; width:100%; right:0; height:100%; box-sizing:border-box; content:''; border:solid 1px #ccc; border-radius:0 4px 4px 0; background-image:linear-gradient(to bottom, #ccc 0%, #c6bfbf 100%);}";
		css += ".vDateIcon:hover::before {color:rgba(255, 255, 255, 0.25)}";
		css += ".vDateIcon:active::before {color:rgba(255, 255, 255, 0.75)}";
		css += ".vDateBoxTool {transition:height 0.2s linear; overflow:hidden;display:none;width:300px; height:0px; position:absolute; top:calc(100% + 2px); left:0;}";
		css += ".vDateBoxTool .vDateBox {box-sizing: border-box;overflow:hidden; border-radius:5px;width:100%; height:auto; position:absolute; top:10px; left:0; border:solid 1px #ccc;}";
		css += ".vDateBoxTool .vDateBoxArrow {width:300px; height:10px; position:absolute;top:0}";
		css += ".vDateBoxTool .vDateBoxArrow::before {width:0; height:0; position:absolute; content:''; left:10px; top:0px;border-left:solid 7px transparent; border-right:solid 7px transparent;border-bottom:solid 10px #ccc;}";
		css += ".vDateBoxTool .vDateBoxHeader {font-synthesis: unset;color:#c5c5c5; font-weight: bold;position:relative; box-shadow:0 2px 4px 0 #7e7979; width:100%; height:36px; background-image:linear-gradient(to top, black 0% , #4a4949 100%); text-align:center; line-height:36px;}";
		css += ".vDateBoxTool .vDateBoxDisplayCon {position: relative;width:100%; height:200px; background-color:white;}";
		css += ".vDateBoxTool .vDateRangeCon, .vDateBoxTool .vFutureYearsCon{opacity:1;overflow: hidden;top: 50%;transform: translateY(-50%);left:0;position: absolute;width:auto; height:100%;}";
		css += ".vDateBoxTool .vDateRangeConTrans,.vDateBoxTool .vFutureYearsCon{transition:all .15s linear!important;}";
		css += ".vDateBoxTool .rangeBox, .vDateBoxTool .yearsBox{flex-shrink:0; flex-basis:300px; justify-content: start; align-content: center; height:100%;box-sizing: border-box;padding:20px 0 20px 20px;display: flex; flex-wrap: wrap;width:300px}";
		css += ".vDateBoxTool .range, .vDateBoxTool .yearsBox>.year{transition:all .1s linear; cursor:pointer;margin-right:5px;background-color: #e9e9e9; font-size:13px;flex-basis:80px; color: #f817ed; border: 1px solid #d2d4d5; height:30px; text-align:center;line-height:30px; margin-bottom:5px}";
		css += ".vDateBoxTool .yearsBox>.year:hover, .vDateBoxTool .range:hover,.vDateBoxTool .vYearsCon>.year:hover,.vDateBoxTool .month:hover,.vDateBoxTool .day:hover{background-color: #cecece; color:black;}";
		css += ".vDateBoxTool .range:active,.vDateBoxTool .year:active,.vDateBoxTool .month:active,.vDateBoxTool .day:active{background-color: black; color:white;}";
		css += ".vDateBoxTool .vDateBoxControlCon {position:relative;width:100%; height:36px; background-color:#c0bfbf; box-shadow:0 -2px 4px 0 #7e7979;}";
		css += ".vDateBoxTool .vDateBoxControlCon button{border:none;cursor:pointer;top:0;transform:none;}";
		css += ".vDateBoxTool .vDateBoxControlCon button::before{position:absolute; content:''; top:8px;left:50%; transform:translateX(-50%);}";
		css += ".vDateBoxTool .vPrev{width:36px; height:36px; position:absolute; left:0;}";
		css += ".vDateBoxTool .vPrev::before{width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent;border-right:15px solid black;}";
		css += ".vDateBoxTool .vDateBoxControlCon .linactive::before{border-right:15px solid #ccc;}";
		css += ".vDateBoxTool .vDateBoxControlCon .linactive{cursor:not-allowed;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vBack{border:solid 1px #9e9e9e; background-image:linear-gradient(to bottom, #ccc 0%, white 100%);border-radius:15px;top:5px; width:70px; height:27px; background-color:#ccc; position:absolute; left:25%;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vClose{border:solid 1px #9e9e9e; background-image:linear-gradient(to bottom, #ccc 0%, white 100%);border-radius:15px;top:5px; width:70px; height:27px; background-color:#ccc; position:absolute; left:50%;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vbActive:active, .vDateBoxTool .vDateBoxControlCon .vClose:active{background-image:linear-gradient(to top, #ccc 0%, white 100%);}";
		css += ".vDateBoxTool .vDateBoxControlCon .vbActive:hover, .vDateBoxTool .vDateBoxControlCon .vClose:hover{color:#32a13f;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vbInactive{cursor:not-allowed;background-image:none;color:#b3a5a5;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vNext{width:36px; height:36px; position:absolute; right:0;left:auto;}";
		css += ".vDateBoxTool .vDateBoxControlCon .vNext::before{width:0; height:0; border-top:10px solid transparent; border-bottom:10px solid transparent; border-left:15px solid black;}";
		css += ".vDateBoxTool .vDateBoxControlCon .rinactive::before{border-left:15px solid #ccc;}";
		css += ".vDateBoxTool .vDateBoxControlCon .rinactive{cursor:not-allowed;}";
		css += ".vDateBoxTool .vYearsCon,.vDateBoxTool .vMonthsCon, .vDateBoxTool .vDaysCon,.vDateBoxTool .vTimeCon{opacity:0;flex-wrap:wrap;padding:30px 0 20px 2px;overflow:hidden;transition:all .15s linear;align-content: center;justify-content: space-around;box-sizing: border-box;display:none;position:absolute;width:0%; height:0%; left:50%;top:50%; transform:translateX(-50%) translateY(-50%);}";
		css += ".vDateBoxTool .vYearsCon .year,.vDateBoxTool .month, .vDateBoxTool .day{flex-shrink: 0;cursor:pointer;margin:0 2px 10px 0 ;background-color: #e9e9e9; font-size:13px;flex-basis:80px; color: #f817ed; border: 1px solid #d2d4d5; height:25px; text-align:center;line-height:25px;}";
		css += ".vDateBoxTool .vMonthsCon{justify-content:center;}";
		css += ".vDateBoxTool .month{flex-basis:80px; height:25px;line-height:25px;}";
		css += ".vDateBoxTool .vDaysCon{justify-content:start;padding:30px 0 20px 13px;}";
		css += ".vDateBoxTool .day{flex-basis:30px; height:25px;line-height:25px;}";
		css += ".vDateBox .vTimeCon{padding:0;}";
		css += ".vDateBox .meridianCon{width:100%; height:40px;top: 0;position: absolute;}";
		css += ".vDateBox .meridian{width:60px; height:30px;top: 5px;position: relative;margin:0 auto;}";
		css += ".vDateBox .meridian::before, .vDateBox .vDateBoxDisplayCon .vTimeCon .meridianCon .meridian::after{width:30px; height:30px;position: absolute; text-align:center;line-height:30px;top:0;font-weight: 400;}";
		css += ".vDateBox .meridian::before{left:-30px;content:'AM';}";
		css += ".vDateBox .AMon::before{color:purple}";
		css += ".vDateBox .meridian::after{right:-30px;content:'PM'}";
		css += ".vDateBox .PMon::after{color:purple}";
		css += ".vDateBox .meridianSwitchCon{box-shadow: inset 0 0px 4px 0px #ccc6c6;cursor:pointer;width:100%;height:20px;border: solid 1px #cfcece;border-radius: 20px;top: 5px;position: relative;box-sizing: border-box;}";
		css += ".vDateBox .meridianSwitchCon::before{transition:left .2s linear; width:24px;height:24px;border-radius:50%;background-color:purple;content:'';position:absolute;top:-3px;}";
		css += ".vDateBox .am::before{left:0}";
		css += ".vDateBox .pm::before{left:35px}";
		css += ".vDateBox .timpePropertiesCon{width:100%; height:100px;top: 40px;position: absolute;}";
		css += ".vDateBox .hourCon,.vDateBox .minCon,.vDateBox .secCon{box-sizing:border-box;border:solid 1px #ccc; top:36px;height:50px;width:50px;position:absolute;}";
		css += ".vDateBox .vDateBoxDisplayCon .vTimeCon .timpePropertiesCon .hourCon{left:50px;}";
		css += ".vDateBox .hourCon::before,.vDateBox .minCon::before,.vDateBox .secCon::before{text-align:center;line-height:20px;width:100%;height:20px;position:absolute;top:-22px;}";
		css += ".vDateBox .hourCon::before{content:'h'}";
		css += ".vDateBox .minCon::before{content:'m'}";
		css += ".vDateBox .secCon::before{content:'s'}";
		css += ".vDateBox .hourCon::after, .vDateBox .minCon::after{width:20px;height:100%; right:-24px; top:0; content:':';color:#398000;font-size:30px; text-align:center;line-height:40px;position:absolute;}";
		css += ".vDateBox .minCon{left:50%;transform:translateX(-50%);}";
		css += ".vDateBox .secCon{right:50px;}";
		css += ".vDateBox input[type='text']{border:none;width:100%;height:100%;padding-left:0px; text-align:center;line-height:50px;color:#398000;font-size:30px;}";
		css += ".vDateBox button{transition:all .1s linear; width:80px;position:absolute; top: 150px; left:50%; transform:translateX(-50%); height:40px;border: none;border-radius: 5px;}";
		css += ".vDateBox .tbuttonActive{cursor:pointer; background-color:#800080cc; color:white;}";
		css += ".vDateBox .tbuttonActive:hover{color:black; background-color:purple;}";
		css += ".vDateBox .tbuttonActive:active{color:white;}";
		css += ".vDateBox .tbuttonInactive{cursor:not-allowed;}";

		if(includeTime == true){
			css += ".vDateBoxTool .vDateBox .vDateBoxDisplayCon .vTimeCon{display:none;width:100%; height:100%; position:absolute;}";
		}

		if(dateInputIcon != ""){
			css += ".vDateIcon::before {"+dateInputIcon+"}";
		}

		var styleElement = document.createElement("style");

		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
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
			}else	if(e.target.classList.contains("month")){//hide monthCon and show days
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
					status["completed"] = true;
					writeToInput();
				}else{
					var daysCon = e.target.parentNode;
					var header = textInputElement.parentNode.querySelector(".vDateBoxHeader").innerHTML = "Exiting...";
					daysCon.style["height"] = "0%";
					daysCon.style["width"] = "0%";
					daysCon.style["opacity"] = "0";
					daysCon.classList.remove("monthToDay");
					dayValue = day;
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
			year.appendChild(document.createTextNode(yearSeries));
			yearsCon.appendChild(year);
			yearSeries++;
		}

	}
	function generateMonths(x, monthsCon){
		var month = document.createElement("DIV");
		month.setAttribute("class", "month");
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
		dateBoxArrowElement.setAttribute("class", "vDateBoxArrow");

		//DateBox
		var dateBoxElement = document.createElement("DIV");
		dateBoxElement.setAttribute("class", "vDateBox");

		//DateBox Header
		var dateBoxHeaderElement = document.createElement("DIV");
		dateBoxHeaderElement.setAttribute("class", "vDateBoxHeader");

		//DateBox displayCon
		var dateBoxDisplayConElement = document.createElement("DIV");
		dateBoxDisplayConElement.setAttribute("class", "vDateBoxDisplayCon");

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
	function generateYearRange (){
		var displayCon = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon .vDateRangeCon");
		var rangeBox = displayCon.querySelectorAll(".rangeBox");
		var range = document.createElement("DIV");
		range.setAttribute("class", "range");
		range.setAttribute("data-range", startYear);
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
		if (list.length > 1 && DOMelement.cssStyle(listCon, "display") != "none"){
			var listConParent = textInputElement.parentNode.querySelector(".vDateBox .vDateBoxDisplayCon");
			var LeftBt = textInputElement.parentNode.querySelector("#vPrev");
			var RightBt = textInputElement.parentNode.querySelector("#vNext");

			listControllerObj = new  listScroller(listConParent, listCon, "div");
			listControllerObj.config.listPlane = "x";
			listControllerObj.config.Xbuttons = [LeftBt, RightBt];
			listControllerObj.config.inactiveButtonsClassName = ["linactive", "rinactive"];
			listControllerObj.config.effects = [0.4, "cubic-bezier(0,.99,0,1)"];
			listControllerObj.config.scrollSize = 302;
			listControllerObj.config.extraSpace = 0;
			listControllerObj.initialize();
			listControllerObj.runScroller();
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
			var cdate = today.getFullYear()+"-"+today.getMonth()+"-"+today.getDate();
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
		if(initialized==0){
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
				tooTipHandler.initialize();
			};
			initialized=1;
		}
	}
	this.showDateBox = function(){
		if (initialized == 0){
			throw new Error("The 'showDateBox()' method must be called after initialization, initialize using the 'initialize()' method");
		}else{
			var dateBoxParent = textInputElement.parentNode.querySelector(".vDateBoxTool");
			var dateBoxTitileCon = textInputElement.parentNode.querySelector(".vDateBoxHeader");
			if(dateType == "past"){
				var rangeCon = textInputElement.parentNode.querySelector(".vDateRangeCon");
				dateBoxParent.style["display"] = "block";
				dateBoxParent.scrollHeight;
				dateBoxParent.style["height"] = dateBoxParent.scrollHeight+"px";
				rangeCon.style["opacity"] = "1";
				dateBoxTitileCon.innerHTML = rangeCon.getAttribute("data-title");
			}else if (dateType == "future") {
				var futureYearsCon = textInputElement.parentNode.querySelector(".vFutureYearsCon");
				dateBoxParent.style["display"] = "block";
				dateBoxParent.scrollHeight;
				dateBoxParent.style["height"] = dateBoxParent.scrollHeight+"px";
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
	Object.defineProperties(this, {
		showDateBox:{writable:false},
		initialize:{writable:false},
		config:{writable:false},
		closeDateBox:{writable:false},
		status:{
			get:function(){
				return status;
			}
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
				if(validateArray(value, "3", "number", 'furtureStopDate')){
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
		}
	});
}
/****************************************************************/

/***************************Tool tip*****************************/
function toolTip(){
	var sy=0,sx=0, ini=false, tipBoxStyle="", arrowColor="", tipId="", initialized=0;
	var scrollHandler =
	function createStyles(){
		var css = ".vToolTip {display:none;box-shadow:0 0 4px 0 black;font-size:13px;background-color:#c08bc0;color:white;position:absolute;width:auto;height:auto;z-index:10000;padding: 5px;box-sizing: border-box;border-radius:5px;}";
		css += ".vToolTip::before{position:absolute;content:'';}";
		css += ".vToolTipTop::before{position:absolute;content:'';top:CALC(100%);border-left:5px solid transparent; border-right:5px solid transparent; border-top:10px solid #c08bc0;}";
		if(tipBoxStyle != ""){
			css += ".vToolTip{"+tipBoxStyle+"}";
		}
		if(arrowColor != ""){
			css += ".vToolTipTop::before{border-top:10px solid "+arrowColor+";}";
		}

		var styleElement = document.createElement("style");

		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
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
				var x = ( e.clientX+sx) - 10;
				console.log(e.clientY + " : : total=> " +y);
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
			// window.addEventListener("scroll", function(){
			// 	var diff = scrollY -prev;
			// 	// console.log("diff :: "+ "hh"+diff);
			// 	sy=scrollY-diff;
			// 	// sy = scrollY;
			// 	sx=scrollX;
			// }, false);
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
		arrowColor:{
			set:function(value){

			}
		},
		tipBoxStyle:{
			set:function(value){

			}
		}
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
