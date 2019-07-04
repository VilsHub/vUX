/*
 * vUX JavaScript framework v1.0.0
 * https://framework.vilshub.com/
 *
 *
 * Released under the MIT license
 * https://framework.vilshub.com/license
 *
 * Date: 2019-06-20T22:30Z
 */

"use strict";

/**************************Helper functions***********************/
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
function validateNumber(number){
	if (typeof number != "number"){
		throw new TypeError("Please provide a real number");
	}else{
		return true;
	}
};
function validateString(string){
	if (typeof string != "string"){
		throw new TypeError("Please provide a string");
	}else{
		return true;
	}
};
function validateArray(array, totalMember, type){
	if (Array.isArray(array)){
		if(totalMember != -1){
			if(array.length == totalMember){
					for (var x = 0; x < totalMember; x++){
						if(type == "string"){
							if (validateString(array[x])){
								if (x == totalMember-1){
									return true;
								}
							}else{
								throw new TypeError("Invlaid datatype as member");
							}
						}else if(type == "number"){
							if (validateNumber(array[x])){
								if (x == totalMember-1){
									return true;
								}
							}else{
								throw new TypeError("Invlaid datatype as member");
							}
						}
					}
			}else{
				throw new Error("Incomplete member error: "+ totaMember +" memebers needed");
			}
		}else if (totalMember == -1){
			var len = array.length;
			for (var x = 0; x < len; x++){
				if(type == "string"){
					if (validateString(array[x])){
						if (x == len-1){
							return true;
						}
					}else{
						throw new TypeError("Invlaid datatype as member");
					}
				}else if(type == "number"){
					if (validateNumber(array[x])){
						if (x == len-1){
							return true;
						}
					}else{
						throw new TypeError("Invlaid datatype as member");
					}
				}
			}
		}
	}else{
		throw new TypeError("Please provide an array");
	}
};
function validateBoolean(boolean){
	if (typeof boolean != "boolean"){
		throw new TypeError("Please provide a boolean to specify direction");
	}else{
		return true;
	}
};
function validateObjectMember(object, propery){
	var ObjArr = Object.keys(object);
	for (var x = 0; x < ObjArr.length; x++){
		if(ObjArr[x] == propery){
			return true;
		}else{
			if (x == ObjArr.length-1){
					var AllProperties =  ObjArr.toString();
					var rplc = AllProperties.replace(/,/g, ", ");
					throw new TypeError("Invlaid property specied, it should any of the follwing : " + rplc);
			}
		}
	}
}
function validateElement (element){
	if (element instanceof Element){
		return true;
	}else{
		throw new TypeError("Invalid HTML Element : HTML Element must be provide");
	}
}
function validateFunction (fn){
	if (typeof fn == "function"){
		return true;
	}else{
		throw new TypeError("Invalid assigned data : Please provide a function need ");
	}
}
function validateHTMLObject(HTMLCollection){
	if(Object.getPrototypeOf(HTMLCollection).constructor.name == "NodeList"){
		return true;
	}else{
			throw new TypeError("Invalid HTML Collection : HTML collection must be provide");
	}
}
/*****************************************************************/

/*******************************Timing*****************************/
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
/*****************************************************************/

/***************************CSS Styler**************************/
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
/***************************************************************/

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

/*********************imageManipulator****************************/
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

		},
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
				value: function(canObj, canvasElement){
					validateElement (canvasElement);
					canvasElement.width = canvasElement.scrollWidth;
					canvasElement.height = canvasElement.scrollHeight;

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
						value: function(canObj, canvasElement){
							validateElement (canvasElement);
							//Reset canvas size
							canvasElement.width = canvasElement.scrollWidth;
							canvasElement.height = canvasElement.scrollHeight;

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
}
Object.defineProperties(this, {
	circularProgress:{
		writable:false
	}
});
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
				progressObj.circularProgress.show(0, "Error "+Xreq.status);
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
				currentLbl = "Error "+Xreq.status
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

/****************************Writer******************************/
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
