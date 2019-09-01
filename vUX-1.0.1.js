/*
 * vUX JavaScript framework v1.0.1
 * https://framework.vilshub.com/
 *
 *
 * Released under the MIT license
 * https://framework.vilshub.com/license
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
		if(totalMember != -1){ //-1 = no specific length
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
		}else if (totalMember == -1){
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
	prePos = css.getStyle(element, "position");
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
var css = {
	getStyles : function (element, property){
					if(window.getComputedStyle){
						var styleHandler = getComputedStyle(element, null);
					}else{
						var styleHandler = element.currentStyle;
					}
					var propertyValue = styleHandler[property];
					return propertyValue;
				}
}
/****************************************************************/
/*****************************Cross XHR creator******************/
var ajax = {
	create : function () {
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
}
/****************************************************************/

/*********************imageManipulator***************************/
function imageManipulator(canvasObj, image){
	var self = this, initRGB = [], maxGray = [], maxGrayControl = [], maximumLoop = 0, highestDifference =0, currentLoop = 0, initGray = [], maxRGB = [], maxRGBControl = [], speed = 0, diff=0, imageData, width=300, height=300;

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

	/****************************properties************************/
	this.dimension = {
	};
	Object.defineProperty(this.dimension, "width", {
		set: function(value){
			if(validateNumber(value)){
				width = value;
			}
		}
	});
	Object.defineProperty(this.dimension, "height", {
		set: function(value){
			if(validateNumber(value)){
				height = value;
			}
		}
	});
	Object.defineProperty(this, "dimension", {
		writable:false
	});
	/**************************************************************/

	/****************************RGB to Gray************************/
	this.initializeRgbToGray = function (Speed){
		validateNumber(Speed);
		var  img = new Image(); //Image object created
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
		var  img = new Image(); //Image object created
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
}
/****************************************************************/

/***********************gridBorderRectangle**********************/
function gridBorderRectangle(){
	var self = this, seg = 0, tf = 0, FRlinecolor = "black", FRlinewidth = 5, FRsegment = [10,2], FROrigin = [0,0], ARlinecolor = "black", ARlinewidth = 5, ARsegment = [10,2], AROrigin = [0,0], ARclockWise	= true,
		ARduration = 3000, AReasing = "linear", ARactive="", ARstop=0;

	/*******************fixed dashed rectangle starts********************/
	this.fixedRectangle = {};
	Object.defineProperties(this.fixedRectangle, {
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
									FRlinewidth  = value;
								}
							}
			},
			segment :{
							set: function(value){
								if(validateArray(value, 2, "number")){
										FRsegment = value;
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
			draw : {
				value: function(canvasElement){
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
				},
				writable:false
			}
	});
	/*******************************************************************/

	/*******************animated dashed rectangle starts********************/
	this.animatedRectangle = {};
	Object.defineProperties(this.animatedRectangle, {
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
									ARlinewidth  = value;
								}
							}
			},
			segment :{
							set: function(value){
								if(validateArray(value, 2, "number")){
										ARsegment = value;
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
			active :{
							set: function(value){
								if(validateString(value)){
										ARactive = value;
								}
							}
			},
			stop :{
							set: function(value){
								if(validateNumber(value)){
										ARactive = value;
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
										ARduration = value;
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
			draw : {
						value: function(canvasElement){
							validateElement (canvasElement, "A valid HTML element needed as argument for 'draw()' method");
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
								}

						})
					}
		}

});
	Object.defineProperty(this, "animatedRectangle", {writable:false});
	Object.defineProperty(this, "fixedRectangle", {writable:false});
	/*******************************************************************/
}
/****************************************************************/

/************************loadProgress****************************/
function loadProgressIndicator(canvasElement, canvasObj){
	var self = this, start =12,	progressLabel = "on", progressBackground	= "#ccc", strokeWidth	= 10, strokeColor	="yellow", radius	= 50, percentageFontColor	= "white",
percentageFont = "normal normal 2.1vw Verdana", LabelFontColor = "white", LabelFont	= "normal normal .9vw Verdana";
	this.circularProgress = {

	};
	Object.defineProperties(this.circularProgress, {
		start:{
			set: function(value){
				if(validateNumber(value)){
					start = value;
				}
			}
		},
		progressLabel:{
			set: function(value){
				if(validateString(value)){
					progressLabel = value;
				}
			}
		},
		progressBackground:{
			set: function(value){
				if(validateString(value)){
					progressBackground = value;
				}
			}
		},
		strokeWidth:{
			set: function(value){
				if(validateNumber(value)){
					strokeWidth = value;
				}
			}
		},
		strokeColor:{
			set: function(value){
				if(validateString(value)){
					strokeColor = value;
				}
			}
		},
		radius:{
			set: function(value){
				if(validateNumber(value)){
					radius = value;
				}
			}
		},
		percentageFontColor:{
			set: function(value){
				if(validateString(value)){
					percentageFontColor = value;
				}
			}
		},
		percentageFont:{
			set: function(value){
				if(validateString(value)){
					percentageFont = value;
				}
			}
		},
		labelFontColor:{
			set: function(value){
				if(validateString(value)){
					LabelFontColor = value;
				}
			}
		},
		labelFont:{
			set: function(value){
				if(validateNumber(value)){
					LabelFont = value;
				}
			}
		},
		show:{
			value : function(progress, label){
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
				if(progressLabel == "on"){
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
				if(progressLabel == "on"){ //label
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
	});
	Object.defineProperties(this, {
		circularProgress:{
			writable:false
		}
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


	this.options = {
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
	Object.defineProperties(this.options, {
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
						options.delay = value
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
	var transformValue = css.getStyles(targetElement, "transform");
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
	Object.defineProperties(this, {
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

/************************CSS Style getter************************/
function css(){};
css.getStyle = function (element, property){
					if(window.getComputedStyle){
						var styleHandler = getComputedStyle(element, null);
					}else{
						var styleHandler = element.currentStyle;
					}
					var propertyValue = styleHandler[property];
					return propertyValue;
}
/****************************************************************/

/**********************Child index getter*********************/
function child(){
}
child.getIndex = function(child){
	var index = 0, n=0;
	while(child){
		child = child.previousElementSilbling;
		n++;
	}
	index = n++;
	return index;
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
	var listPlane = "x", Xbuttons = [], Ybuttons = [], scrollSize = 175, effects = [1, "linear"], inactiveButtonClassName = "";
	//Xbuttons[0] = left buttons, Xbuttons[1] = Right buttons
	//scrollToLeftStatus : 1 => not started, 2 => started but not finished, 3 => finished;

	function assignHandlers(){
		//List Container
		listParent.addEventListener("transitionend", function(e){
			if (listPlane == "X" || listPlane == "x"){
				if (tabsBehindLeft > 0){
					Xbuttons[0].classList.remove(inactiveButtonClassName);
					running=0;
				}else if(tabsBehindLeft == 0 && remAdded > 0){
					Xbuttons[0].classList.remove(inactiveButtonClassName);
					running=0;
				}else if(tabsBehindLeft == 0 && remAdded == 0){
					Xbuttons[0].classList.add(inactiveButtonClassName);
					running=0;
				}


				if(tabsBehindRight == 0 && remToAdd == 0){
					Xbuttons[1].classList.add(inactiveButtonClassName);
					running=0;
				}else if(tabsBehindRight > 0){
					Xbuttons[1].classList.remove(inactiveButtonClassName);
					running=0;
				}else if(tabsBehindRight == 0 && remToAdd > 0){
					Xbuttons[1].classList.remove(inactiveButtonClassName);
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
				listParent.style["display"] = "table";
				listParent.style["width"] = "auto";
				listParent.style["white-space"] = "nowrap";
				listParent.style["transition"] = "left "+ effects[0]+"s "+effects[1]+", right "+effects[0]+"s " +effects[1];
				var listItems = listParent.querySelectorAll(listType);
				if (listItems.length > 0){
					for (var list of listItems) {
						list.style["display"] = "inline-block";
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
				var currentPosition = parseInt(css.getStyle(listParent, "left"), "px");
				if(tabsBehindRight != 0){
					maxAdd = scrollSize;
					var newPostion = currentPosition - maxAdd;
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
			var currentPosition = parseInt(css.getStyle(listParent, "left"), "px");
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
					Xbuttons[1].classList.remove(inactiveButtonClassName);
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
				Xbuttons[1].classList.add(inactiveButtonClassName);
			}else if (diff < 0 && tabsBehindRight >= 0 && remToAdd > 0) { //Expansion within  view area
				Xbuttons[1].classList.remove(inactiveButtonClassName);
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
				Xbuttons[1].classList.remove(inactiveButtonClassName);
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
				Xbuttons[1].classList.add(inactiveButtonClassName);
			}
		}
	};
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
			if(inactiveButtonClassName == ""){
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
		}else {
			throw new Error("Initialization incomplete, complete initialization 1st before executing 'runScroller()' method");
		}
	};
	Object.defineProperties(this, {
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
		// listening: {
		// 	set:function(value){
		// 		if(validateNumber(value, "Numeric value needed for listening property")){
		// 			if (matchNumbers(value, [1,0], "listening property value can either be 1 or 0")){
		// 				listening = value;
		// 			}
		// 		}
		// 	}
		// },
		inactiveButtonClassName:{
			set:function(value){
				if(validateString(value, "String value needed for inactiveButtonClassName property")){
					inactiveButtonClassName = value;
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
function customFormComponent(vWrapper){
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
		prevHovered.classList.remove("hovered");
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
		if (activieHovered != null){
			if(scrollIni == 0){
				var index = child.getIndex(activieHovered);
				startIndex = index;
				scrollIni = 1;
			}
			startIndex++;
			if(startIndex > totalOptions){
				startIndex = 1;
			}
			listOptionCon.querySelector(".option:nth-child("+startIndex+")").classList.add("hovered");

			activieHovered.classList.remove("hovered");
			if(startIndex > totalOptions){
				startIndex = 0;
			}
		}else{
			startIndex = 1;
			scrollIni =1;
			listOptionCon.querySelector(".option").classList.add("hovered");
		}
	}
	function scrollUp(listOptionCon){
		var activieHovered = listOptionCon.querySelector(".hovered");
		if (activieHovered != null){
			if(scrollIni == 0){
				var index = child.getIndex(activieHovered);
				startIndex = index;
				scrollIni = 1;
			}
			startIndex--;
			if(startIndex == 0){
				startIndex = totalOptions;
			}
			activieHovered.classList.remove("hovered");
			listOptionCon.querySelector(".option:nth-child("+startIndex+")").classList.add("hovered");
		}else{
			startIndex = totalOptions;
			scrollIni =1;
			listOptionCon.querySelector(".option:last-of-type").classList.add("hovered");
		}
	}
	function createStyleSheet(){
		var css = "."+vWrapper + " {width:"+selectDim[0]+"; height:"+selectDim[1]+";}";
		css += "."+vWrapper + " .sfield {position:absolute; width:100%; height:100%; z-index:1; line-height:"+selectDim[1]+"; padding-left:5px; cursor:pointer; box-sizing: border-box; background-color:#ccc;}";
		css += "."+vWrapper + " .optionsCon {position:absolute; width:100%; height:0px; z-index:2; top:100%; transition:height 0.2s linear; overflow-y:hidden; display:none}";
		css += "."+vWrapper + " .optionsCon .option {position:static; width:100%; height:"+selectDim[1]+"; padding-left:5px; box-sizing:border-box; line-height:"+selectDim[1]+"; cursor:pointer; border-bottom:solid 1px #ccc;}";
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
					if (multipleSelection == false){
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
			if(e.target.classList.contains("option")){
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


				  if (handled) {
				    // Suppress "double action" if event handled
				    e.preventDefault();
						if (type == 1){
							if(e.key == "ArrowDown" | "Down"){
								scrollDown(listOptionCon);
							}else if (e.key == "ArrowUp" | "Up") {
								scrollUp(listOptionCon);
							}else if (e.key == "Enter") {
								selectOptions(listOptionCon);
							}
						}else if(type == 2){

						}else if(type == 3){

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
var RadioAfterSelectionFn=function(){}, radioDim =[], radioWrapperStyle="", radioButtonStyle="", selectedRadioStyle = "", deselectedRadioStyle ="", radioLabelStyle ="", groupAxis= "x", display="",
mouseEffect = [];
	/************************************************************************************/
	//radioDim[a,b] a=> width of select cElement , b=> height of select cElemt
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

function radioStyleSheet(){

		(groupAxis == "x" | "X")?display="inline-block":display="block";

		var css = "."+vWrapper + " {width:auto; height:auto;display:"+display+"}";
		css +=  "."+vWrapper + " .vRadioButtonCon {cursor:pointer;  box-sizing:border-box; width:"+radioDim[0]+"; border-radius:100%; height:"+radioDim[1]+"; border:solid 1px black; float:left; transition:all 0.2s linear; position:relative; overflow:hidden;}";
		css +=  "."+vWrapper + " .vRadioButtonCon .select {background-color:black; position:absolute; top:0; left:0; width:100%; height:100%; border-radius:200%; z-index:1}";
		css +=  "."+vWrapper + " .vRadioButtonCon .deselect {background-color:white; position:absolute; top:0; left:0; width:100%; height:100%; border-radius:200%; z-index:2}";
		css +=  "."+vWrapper + " .label {width:auto; height:"+radioDim[1]+"; line-height:"+radioDim[1]+"; float:left; cursor:pointer;}";
		css +=  "."+vWrapper + " .vRadioButtonCon:hover{"+mouseEffect[0]+";}";
		css +=  "."+vWrapper + " .vRadioButtonCon .deselect:active{"+mouseEffect[1]+";}";

		var styleElement = document.createElement("style");
		styleElement.setAttribute("type", "text/css");
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
		  styleElement.appendChild(document.createTextNode(css));
		}
		document.getElementsByTagName('head')[0].appendChild(styleElement);
}
function selectRadioButton(e, RadioElement){
	var radioParent = RadioElement.parentNode;
	//Find previuos selected
	var previousSelected = radioParent.querySelector("."+vWrapper+" .vRadioButtonCon[data-selectState='1']");



	if (previousSelected != null){
		var prevSelectBg = previousSelected.querySelector(".select");
		var prevDeselectBg = previousSelected.querySelector(".deselect");
		var mainpreviousSelected = radioParent.querySelector("."+vWrapper+" .vRadioButtonCon[data-selectState='1']").parentNode.nextElementSibling;
	}
	if (e.target.classList.contains("label") == false){
		var currentSelectBg = e.target.parentNode.querySelector(".select");
		var currentDeselectBg = e.target.parentNode.querySelector(".deselect");
	}else{
		var currentSelectBg = e.target.previousElementSibling.querySelector(".select");
		var currentDeselectBg = e.target.previousElementSibling.querySelector(".deselect");
	}


	if(previousSelected != null){
		//switch Bgs of previous
		prevSelectBg.style["z-index"] = "1";
		prevDeselectBg.style["z-index"] = "2";

		//unset previous
		//custom
		previousSelected.setAttribute("data-selectState","0");

		//main
		previousSelected.parentNode.nextElementSibling.checked = false;




		//set current
		if (e.target.classList.contains("label") == false){
			//custom
			e.target.parentNode.setAttribute("data-selectState","1");

			//main
			e.target.parentNode.parentNode.nextElementSibling.checked = true;
		}else{
			//custom
			e.target.previousElementSibling.setAttribute("data-selectState","1");

			//main
			e.target.parentNode.nextElementSibling.checked = true;
		}

		//switch Bgs of current
		currentSelectBg.style["z-index"] = "2";
		currentDeselectBg.style["z-index"] = "1";

	}else{
		//switch Bgs of current
		currentSelectBg.style["z-index"] = "2";
		currentDeselectBg.style["z-index"] = "1";

		//set current
		if (e.target.classList.contains("label") == false){
			//custom
			e.target.parentNode.setAttribute("data-selectState","1");

			//main
			e.target.parentNode.parentNode.nextElementSibling.checked = true;
		}else{
			//custom
			e.target.previousElementSibling.setAttribute("data-selectState","1");

			//main
			e.target.parentNode.nextElementSibling.checked = true;
		}
	}
}
function reCreateRadio (RadioElement){
	var radioWrapper = document.createElement("DIV");
	var radioButtonCon = document.createElement("DIV");
	var radioButtonConSelect = document.createElement("DIV");
	var radioButtonConDeselect = document.createElement("DIV");
	var radioLabel = document.createElement("DIV");
	var mainRadioLabel = RadioElement.nextElementSibling;
	//radioButton Wrapper
	radioWrapper.setAttribute("class", vWrapper);

	//Radio button
	radioButtonCon.setAttribute("tabindex", "0");
	radioButtonCon.setAttribute("class", "vRadioButtonCon");
	radioButtonCon.setAttribute("data-selectState", "0");
	radioButtonCon.setAttribute("id", RadioElement.getAttribute("id"));
	radioButtonCon.setAttribute("value", RadioElement.getAttribute("value"));
	radioButtonCon.setAttribute("name", RadioElement.getAttribute("name"));


	//Radio button select
	radioButtonConSelect.setAttribute("class", "select");

	//Radio button deselect
	radioButtonConDeselect.setAttribute("class", "deselect");

	//Radio Label
	radioLabel.setAttribute("class", "label");
	radioLabel.setAttribute("data-for", mainRadioLabel.getAttribute("for"));
  // main label content
	var content = mainRadioLabel.innerHTML;
	radioLabel.appendChild(document.createTextNode(content));


	if(radioWrapperStyle != ""){
		radioWrapper.style = radioWrapperStyle;
	}

	if(radioButtonStyle != ""){
		radioButtonCon.style = radioButtonStyle;
	}

	if(selectedRadioStyle != ""){
		radioButtonConSelect.style = selectedRadioStyle;
	}

	if(deselectedRadioStyle != ""){
		radioButtonConDeselect.style = deselectedRadioStyle;
	}

	if(radioLabelStyle != ""){
		radioLabel.style = radioLabelStyle;
	}

	radioButtonCon.appendChild(radioButtonConDeselect);
	radioButtonCon.appendChild(radioButtonConSelect);
	radioWrapper.appendChild(radioButtonCon);
	radioWrapper.appendChild(radioLabel);


	//Add wrapper before target select;
	var radioParent = RadioElement.parentNode;
	radioParent.insertBefore(radioWrapper, RadioElement);


	//Hide main radio element
	RadioElement.style["display"] = "none";

	//Hide main radio label
	RadioElement.parentNode.querySelector("label[for='"+RadioElement.getAttribute("id")+"']").style["display"] = "none";

	// //Apply Styles
	radioStyleSheet();
}
function assignRadioEventHanler(RadioElement){
		var radioParent = RadioElement.parentNode;
		radioParent.addEventListener("click", function(e){
			if(e.target.nodeName == "DIV" && e.target.parentNode.getAttribute("id") == RadioElement.getAttribute("id")){
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
			throw new Error("Setup imcomplete: radio component dimension needed, specify using the 'radioButtonDimension' property");
		}
		reCreateRadio(RadioElement);
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
	afterSelectionFn : {//Function to call after selection
		set:function(value){
			if(validateFunction(value, "Function needed as value for the 'afterSelectionFn' property")){
				RadioAfterSelectionFn = value;
			}
		}
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
	selectedRadioStyle:{
		set:function(value){
			if(validateString(value, "A string of valid CSS style(s) needed for the 'selectedRadioStyle' property")){
				selectedRadioStyle = value;
			}
		}
	},
	deselectedRadioStyle:{
		set:function(value){
			if(validateString(value, "A string of valid CSS style(s) value needed for the 'deselectedRadioStyle' property")){
				deselectedRadioStyle = value;
			}
		}
	},
	groupAxis:{
		set:function(value){
			if(validateString(value, "A string value needed for the 'groupAxis' property")){
				if(value = "x" | "X" | "y" | "Y"){
					groupAxis = value;
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
			if(validateArray(value, 2, "string", "mouseEffectStyle")){
				mouseEffect = value;
			}
		}
	},
})
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/


/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*Custom checkBox builder^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
var checkBoxAfterSelectionFn=function(){}, checkBoxDim =[], checkBoxWrapperStyle="", checkBoxStyle="", checkedCheckBoxIcon = "", uncheckedCheckBoxIcon ="", checkBoxLabelStyle ="", groupAxis= "x", display="",
mouseEffect = [], styled=false, group=true, toggledElement=null;
	/************************************************************************************/
	//checkBoxDim[a,b] a=> width of checkBox cElement , b=> height of checkBox cElement
	//mouseEffect[a,b] a=> mouse hover , b=> mouse clicked
	/************************************************************************************/

function toggleCheckBox(e, checkBoxElement){

	if (e.target.classList.contains("label") == true){
		var checkBox = e.target.previousElementSibling;
	}else{
		var checkBox = e.target;
	}

	//toggle current
	if(checkBox.classList.contains("checked")){
		//toggle custom
		checkBox.classList.remove("checked");
		checkBox.classList.add("unchecked");

		//set checkstate
		//custom
		if (e.target.classList.contains("label") == false){
			e.target.setAttribute("data-checkState","0");
		}else{
			//custom
			e.target.previousElementSibling.setAttribute("data-checkState","0");
		}

		//main
		checkBoxElement.checked = false;
	}else{

			checkBox.classList.remove("unchecked");
			checkBox.classList.add("checked");

			//set checkstate
			//custom
			if (e.target.classList.contains("label") == false){
				e.target.setAttribute("data-checkState","1");
			}else{
				//custom
				e.target.previousElementSibling.setAttribute("data-checkState","1");
			}

			//main
			checkBoxElement.checked = true;
		}

	//Set toggled element
	toggledElement = checkBoxElement;
	checkBoxAfterSelectionFn();
};
function checkBoxEventHandler(checkBoxElement){
	document.body.addEventListener("click", function(e){
		if(e.target.nodeName == "DIV" && e.target.getAttribute("id") == checkBoxElement.getAttribute("id")){
			toggleCheckBox(e, checkBoxElement);
		}else if (e.target.nodeName == "DIV" && e.target.classList.contains("label") && e.target.getAttribute("data-for") == checkBoxElement.getAttribute("id")){
			toggleCheckBox(e, checkBoxElement);
		}
	}, false);
}
function checkBoxStyleSheet(){

		(groupAxis == "x" | "X")?display="inline-block":display="block";

		var css = "."+vWrapper + " {width:auto; height:auto;display:"+display+"}";
		css +=  "."+vWrapper + " .vCheckBoxCon {cursor:pointer;  box-sizing:border-box; width:"+checkBoxDim[0]+"; height:"+checkBoxDim[1]+"; float:left; transition:all 0.2s linear; position:relative; overflow:hidden;}";
		css +=  "."+vWrapper + " .vCheckBoxCon::before {overflow:hidden; box-sizing:border-box; position:absolute; left:0; top:0; width:100%; height:100%; text-align:center; line-height:"+checkBoxDim[1]+"; transition: color 0.1s linear;}";
		css +=  "."+vWrapper + " .vCheckBoxCon:hover{"+mouseEffect[0]+";}";
		css +=  "."+vWrapper + " .vCheckBoxCon:active{"+mouseEffect[1]+";}";

		css +=  "."+vWrapper + " .label {position:static; width:auto; height:"+checkBoxDim[1]+"; line-height:"+checkBoxDim[1]+"; float:left; cursor:pointer;}";



		if(uncheckedCheckBoxIcon != ""){
			css += "."+vWrapper + " .unchecked::before {"+uncheckedCheckBoxIcon+"}";
		}
		if(checkedCheckBoxIcon != ""){
			css += "."+vWrapper + " .checked::before {"+checkedCheckBoxIcon+"}";
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
function reCreateCheckBox (checkBoxElement){
	var checkBoxWrapper = document.createElement("DIV");
	var checkBoxCon = document.createElement("DIV");
	var checkBoxLabel = document.createElement("DIV");
	var maincheckBoxLabel = checkBoxElement.nextElementSibling;

	//checkBox Wrapper
	checkBoxWrapper.setAttribute("class", vWrapper);

	//checkBox
	checkBoxCon.setAttribute("tabindex", "0");

	if(checkBoxElement.getAttribute("checked") != null){
		checkBoxCon.setAttribute("data-checkedState", "1");
		checkBoxCon.setAttribute("class", "vCheckBoxCon checked");
	}else{
		checkBoxCon.setAttribute("data-checkedState", "0");
		checkBoxCon.setAttribute("class", "vCheckBoxCon unchecked");
	}
	checkBoxCon.setAttribute("id", checkBoxElement.getAttribute("id"));
	checkBoxCon.setAttribute("value", checkBoxElement.getAttribute("value"));
	checkBoxCon.setAttribute("name", checkBoxElement.getAttribute("name"));

	//checkBox Label
	checkBoxLabel.setAttribute("class", "label");
	checkBoxLabel.setAttribute("data-for", maincheckBoxLabel.getAttribute("for"));

  // main label content
	var content = maincheckBoxLabel.innerHTML;
	checkBoxLabel.appendChild(document.createTextNode(content));

	//Wrapper style
	if(checkBoxWrapperStyle != ""){
		checkBoxWrapper.style = checkBoxWrapperStyle;
	}

	if(checkBoxLabelStyle != ""){
		checkBoxLabel.style = checkBoxLabelStyle;
	}


	checkBoxWrapper.appendChild(checkBoxCon);
	checkBoxWrapper.appendChild(checkBoxLabel);


	//Add wrapper before target select;
	var checkBoxParent = checkBoxElement.parentNode;
	checkBoxParent.insertBefore(checkBoxWrapper, checkBoxElement);


	//Hide main radio element
	checkBoxElement.style["display"] = "none";

	//Hide main radio label
	checkBoxElement.parentNode.querySelector("label[for='"+checkBoxElement.getAttribute("id")+"']").style["display"] = "none";
}
this.checkBox = {
	build: function(checkBoxElement){
		validateElement(checkBoxElement, "An input element needed as 1st argument for the 'build' method, non provided");
		if(checkBoxElement.nodeName != "INPUT" && checkBoxElement.getAttribute("type") != "checkbox"){
			throw new Error("A checkbox input element needed as 1st argument, please specify a valid checkbox input element");
		}
		if (checkBoxDim.length == 0){
			throw new Error("Setup imcomplete: checkbox component dimension needed, specify using the 'checkBox.checkBoxDimension' property");
		}
		if(group == false){
			//Create elements
			reCreateCheckBox(checkBoxElement);
			//Apply Styles
			checkBoxStyleSheet();
			checkBoxEventHandler(checkBoxElement)
			styled = true;
			// assignRadioEventHanler(checkBoxElement);
		}else if (group == true) {
			//Create elements
			reCreateCheckBox(checkBoxElement);
			checkBoxEventHandler(checkBoxElement);
			if (styled == false){
				//Apply Styles
				checkBoxStyleSheet();
				styled = true;
			}
		}
	}
}
Object.defineProperty(this, "checkBox", {
	writable:false
});
Object.defineProperties(this.checkBox, {
	build:{
		writable:false
	},
	afterSelectionFn : {//Function to call after selection
		set:function(value){
			if(validateFunction(value, "Function needed as value for the 'afterSelectionFn' property")){
				checkBoxAfterSelectionFn = value;
			}
		}
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
	wrapperStyle:{
		set:function(value){
			if(validateString(value, "A string of valid CSS styles needed for the 'wrapperStyle' property")){
				checkBoxWrapperStyle = value;
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
	groupAxis:{
		set:function(value){
			if(validateString(value, "A string value needed for the 'groupAxis' property")){
				if(value = "x" | "X" | "y" | "Y"){
					groupAxis = value;
				}else {
					throw new Error("String value can either be 'x' or 'y' (Case insensitive)");
				}
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
	mouseEffectStyle:{
		set:function(value){
			if(validateArray(value, 2, "string", "mouseEffectStyle")){
				mouseEffect = value;
			}
		}
	},
	thisElement:{
		get:function(){
			return toggledElement;
		}
	},
	group:{
		set:function(){
				if(validateBoolean(value, "A boolean needed as value for the 'checkBox.group' property")){
					group = value;
				}
		}
	},

})
/*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}
/****************************************************************/

/************************Form validator**************************/
function formValidator(form){
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
				checkExistence.style["min-height"] = css.getStyle(checkExistence, "height");
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
	function addEventhandler(form){
		form.addEventListener("transitionend", function(e){
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
			}
		}
	}
	/**********/


	/*Initialize*/
	this.initialize = function(){
		setStyleSheet();
		addEventhandler(form);
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
		toCurrency:{writable:false}
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
	var self=this, effectName="none", bodyOldPosition = "", mainFormCon = "", closeButton=null, mainFormConInner="", overlayType="", colorOverlayStyle="", maxupScrollUpStop =0, totalHeight=0, initialized =false, openProcessor=function(){}, closeProcessor=function(){}, modalOn=false, sY=0, sX=0, endSy=0, scrollable=false, ModalHeight=0, ModalWidth=0, modalHeigthBelow=0, modalHeigthAbove=0, paddingTop=50, reachedBottom=0;
	var effects ={
		none:function(modal){
			var newModal = document.createElement("DIV");
			newModal.setAttribute("id", "newModal");
			modalOn = true;
			var modayBody = document.querySelector(".vModal");
			var modalCon = modayBody.querySelector(".modalSpace");
			ModalHeight = getDimensionOfHidden(modal)["height"];
			ModalWidth = getDimensionOfHidden(modal)["width"];

			//Create and set newmodal style
			var newModalCSS = "width:"+ModalWidth+"px; height:"+ModalHeight+"px;";
			newModal.setAttribute("style", newModalCSS);

			positionVertically(modalCon, ModalHeight);
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
			openProcessor();
		},
		split:function(modal){
			var newModal = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");
			var leftEle = document.createElement("DIV");
			var rightEle = document.createElement("DIV");
			ModalHeight = getDimensionOfHidden(modal)["height"];
			ModalWidth = getDimensionOfHidden(modal)["width"];
			//left style
			var lcss = "position:absolute;left:-200%; top:0; transition:left .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:"+ModalHeight+"px; overflow:hidden;";
			var rcss = "position:absolute;right:-200%; top:0; transition:right .4s cubic-bezier(0,.87,.12,1) 0s; width:50%; height:"+ModalHeight+"px; overflow:hidden;";

			//EffectsCons attributes
			effectsCon.setAttribute("style", "position:relative; width:"+ModalWidth+"px; height:"+ModalHeight+"px;");
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

			positionVertically(modalCon, ModalHeight);

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

			ModalHeight = getDimensionOfHidden(modal)["height"];
			ModalWidth = getDimensionOfHidden(modal)["width"];
			var mainFormBg = css.getStyle(modal, "background-color");

			//Create Style for flipper
			var flipperCSS = "transition:transform .6s linear 0s; width:100%; height:100%; transform-style:preserve-3d; backface-visibilty: hidden; transform:rotateX(0deg); ";

			//flipperBGElement styles
			flipperBGElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:2; background-color:"+mainFormBg+";");
			flipperBGElement.setAttribute("id", "fBG");
			//flipperFormElement styles and other attributes
			flipperFormElement.setAttribute("style", "position:absolute; height:100%; width:100%; backface-visibility: hidden; z-index:1; transform:rotateX(-180deg);");
			flipperFormElement.setAttribute("id", "flpform");
			//Set attribute for effectsCon
			effectsCon.setAttribute("style", "position:relative; width:"+ModalWidth+"px; height:"+ModalHeight+"px; perspective: 4000px;");
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

			positionVertically(modalCon, ModalHeight);

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
			openProcessor();
		},
		box: function(modal){
			var newModal = document.createElement("DIV");
			var effectsCon = document.createElement("DIV");
			var box = document.createElement("DIV");

			ModalHeight = getDimensionOfHidden(modal)["height"];
			ModalWidth = getDimensionOfHidden(modal)["width"];

			//Set attribute for effectsCon
			effectsCon.setAttribute("style", "position:relative; width:"+ModalWidth+"px; height:"+ModalHeight+"px;");
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

			positionVertically(modalCon, ModalHeight);

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
			openProcessor();
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
		modalHeigthBelow = ((paddingTop*2)+ModalHeight)-window.innerHeight;
		if (diff < 100){
			scrollable =true;
			var heightBelow = verticalScroll.query(parseInt(css.getStyle(document.querySelector("html"), "height"), "px"))["remainingHeightBelow"];
			if (heightBelow >= modalHeigthBelow){
				modal.style["top"] = "50px";
				modal.style["transform"] = "translateY(0%) translateX(-50%)";
				reachedBottom =0;
			}else{
				modalHeigthAbove = ((paddingTop*2)+ModalHeight)-window.innerHeight;
				maxupScrollUpStop = scrollY - modalHeigthAbove;
				var newTop = modalHeigthBelow-paddingTop;
				modal.style["top"] = "-"+newTop+"px";
				modal.style["transform"] = "translateY(0%) translateX(-50%)";
				reachedBottom = 1;
			}
		}
		if (modalOn == true){
			bodyOldPosition = css.getStyle(document.body, "position");
			document.body.style["position"] = "fixed";
			document.body.style["top"] = "-"+sY+"px";
		}
	}
	function releaseModal(e){
			var modalBody = document.querySelector(".vModal");
			var modalCon = document.querySelector(".vModal .modalSpace");
			var OldModal = document.querySelector("#vOld");

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
							var currentTop = parseInt(css.getStyle(modal, "top"),"px");
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
			var tin=0, tout=0;
			if(modalOn == true){
				if(e.target.parentNode.classList.contains("trans_in") && e.target.parentNode.classList.contains("split")){
					if(e.target.id == "eleft" || e.target.id == "eright" ){
						tin++;
					}
					if(tin == 1){
						e.target.innerHTML = "";
						e.target.parentNode.style["display"] = "none";

						//display main modal
						var newM = document.querySelector(".vModal #newModal");
						newM.style["width"] = ModalWidth+"px";
						newM.style["height"] = ModalHeight+"px";
						// insert main form to new formCon and display
						newM.innerHTML = mainFormCon;
						newM.style["display"] = "block";
						newM.childNodes[0].style["display"] = "block";
						openProcessor();
					}
				}else if (e.target.parentNode.classList.contains("trans_out") && e.target.parentNode.classList.contains("split")) {
					if(e.target.id == "eleft" || e.target.id == "eright" ){
						tout++;
					}
					if(tout == 1){
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
					newM.style["width"] = ModalWidth+"px";
					newM.style["height"] = ModalHeight+"px";
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
					newM.style["height"] = ModalHeight+"px";
					newM.style["width"] = ModalWidth+"px";
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
		oldModal.innerHTML = mainFormConInner;
	}
	function createStyles(){
		var css = " .vModal{position:absolute; top:0; width:100%; height:100vh; z-index:999; display:none}";
		css += ".show {display:block}";
		css += " .vModal .modalSpace {width:auto; height:auto; top:50%; left:50%; transform:translateX(-50%) translateY(-50%); position:absolute;}";
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
			closeEffect[effectName](OldModal, currentModal);
		}
	}
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
		initialize:{writable:false}
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
