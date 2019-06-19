/*!
 * vUX JavaScript framework v0.1.0
 * https://framework.vilshub.com/
 *
 *
 * Released under the MIT license
 * https://framework.vilshub.com/license
 *
 * Date: 2019-06-20T22:30Z
 */
///////////////////////////////////________________Timing_starts_____________///////////////////////////
timing = {
	//time difference
	timeFraction		: function(startTime, duration){
		//startTime and Duration in milliseconds
		timeFragment = (Date.now() - startTime) / duration;
		if (timeFragment > 1) {
			timeFragment = 1;
		}
		return timeFragment;
	},
	//Linear easing
	linear				: function(timeFrac){
		//startTime and Duration in milliseconds
		progress = timeFrac;
		return progress;
	},
	//Bow shooting easing
	bowShootingEaseIn	: function(timeFrac){
		//startTime and Duration in milliseconds
		x = 1.5 //alterable
		progress = Math.pow(timeFrac, 2) * ((x + 1) * timeFrac - x);
		return progress;
	},
	bowShootingEaseOut	: function(timeFrac){
		//startTime and Duration in milliseconds
		x = 1.5 //alterable
		progress = 1- (Math.pow(1-timeFrac, 2) * ((x + 1) * (1-timeFrac) - x));
		return progress;
	},
	//Bounce
	bounceEaseIn		: function(timeFrac){
		for (let a = 0, b = 1; 1; a += b, b /= 2) {
			if (timeFrac >= (7 - 4 * a) / 11) {
			  return -Math.pow((11 - 6 * a - 11 * timeFrac) / 4, 2) + Math.pow(b, 2);
			}
		}
	},
	bounceEaseOut 		: function(timeFrac){
		for (let a = 0, b = 1; 1; a += b, b /= 2) {
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
///////////////////////////////////________________Timing_ends_____________///////////////////////////

///////////////////////////////////________________CSS styler_____________///////////////////////////
css = {
	getStyles : function (element, property){
					if(window.getComputedStyle){
						styleHandler = getComputedStyle(element, null);
					}else{
						styleHandler = element.currentStyle;
					}
					propertyValue = styleHandler[property];
					return propertyValue;
				}
}
/*___________________________________________________________________________________________________________*/

///////////////////////////////////________________Cross XHR creator_____________///////////////////////////
ajax = {
	create : function () {
				if (window.XMLHttpRequest) {
					// code for modern browsers
					return xmlhttp = new XMLHttpRequest();
				 } else {
					// code for old IE browsers
					return xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				}
			}
}
/*___________________________________________________________________________________________________________*/

///////////////////////////////////________________Canvas_Image_starts_____________///////////////////////////
function cImage(canvasObj, imageData){
	self = this;
	initRGB = [];
	maxGray = [];
	maxGrayControl = [];
	maximumLoop = 0;
	highestDifference =0;
	currentLoop = 0;
	initGray = [];
	maxRGB = [];
	maxRGBControl = [];
	speed = 0;

	//********************* RGB to Gray template start*********************//
	self.initializeRgbToGray = function (Speed){
		speed = Speed;
		for (x=0;x<imageData.data.length; x+=4) {
			btwn =  (0.2*imageData.data[x] + 0.72*imageData.data[x+1] + 0.07*imageData.data[x+2]);

			initRGB[x] = imageData.data[x];
			initRGB[x+1] = imageData.data[x+1];
			initRGB[x+2] = imageData.data[x+2];


			maxGray[x] = btwn;
			maxGray[x+1] = btwn;
			maxGray[x+2] = btwn;


			if(initRGB[x] > maxGray[x]){
				maxGrayControl[x] = 1;
				diff = initRGB[x] - maxGray[x];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}else{
				maxGrayControl[x] = 0;
				diff = maxGray[x] - initRGB[x];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}
			if(initRGB[x+1] > maxGray[x+1]){
				maxGrayControl[x+1] = 1;
				diff = initRGB[x+1] - maxGray[x+1];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}else{
				maxGrayControl[x+1] = 0;
				diff = maxGray[x+1] - initRGB[x+1];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}
			if(initRGB[x+2] > maxGray[x+2]){
				maxGrayControl[x+2] =1;
				diff = initRGB[x+2] - maxGray[x+2];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}else{
				maxGrayControl[x+2] = 0;
				diff = maxGray[x+2] - initRGB[x+2];
				if(diff>highestDifference){
					highestDifference = diff;
				}
			}
		}
		maximumLoop = Math.ceil(highestDifference/speed);
	}
	self.rgbToGray = function(){
		for (x=0;x<imageData.data.length; x+=4){

			//Red component
			if(maxGrayControl[x] == 1){
				if(initRGB[x] > maxGray[x]){
					initRGB[x] -= speed;
				}else if(initRGB[x] <= maxGray[x]){
					initRGB[x] = maxGray[x];
				}
			}else if(maxGrayControl[x] == 0){
				if(initRGB[x] < maxGray[x]){
					initRGB[x] += speed;
				}else if(initRGB[x] >= maxGray[x]){
					initRGB[x] = maxGray[x];
				}
			}

			//Green component
			if(maxGrayControl[x+1] == 1){
				if(initRGB[x+1] > maxGray[x+1]){
					initRGB[x+1] -= speed;
				}else if(initRGB[x+1] <= maxGray[x+1]){
					initRGB[x+1] = maxGray[x+1];
				}
			}else if(maxGrayControl[x+1] == 0){
				if(initRGB[x+1] < maxGray[x+1]){
					initRGB[x+1] += speed;
				}else if(initRGB[x+1] >= maxGray[x+1]){
					initRGB[x+1] = maxGray[x+1];
				}
			}

			//Blue component
			if(maxGrayControl[x+2] == 1){
				if(initRGB[x+2] > maxGray[x+2]){
					initRGB[x+2] -= speed;
				}else if(initRGB[x+2] <= maxGray[x+2]){
					initRGB[x+2] = maxGray[x+2];
				}
			}else if(maxGrayControl[x+2] == 0){
				if(initRGB[x+2] < maxGray[x+2]){
					initRGB[x+2] += speed;
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
		fade = requestAnimationFrame(function(){
			self.rgbToGray();
		});

		//Check for completion
		if(currentLoop == maximumLoop){
			cancelAnimationFrame(fade);
		}
	}
	//********************* RGB to Gray template end*********************//

	//********************* Gray to RGB template start*********************//
	self.initializeGrayToRgb = function (Speed){
		speed = Speed;
		//set max rgb
		for (x=0;x<imageData.data.length; x+=4) {
			maxRGB[x] = imageData.data[x];
			maxRGB[x+1] = imageData.data[x+1];
			maxRGB[x+2] = imageData.data[x+2];
		}
		//convert to gray
		for (x=0;x<imageData.data.length; x+=4) {
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
	self.grayToRGB = function(){
		for (x=0;x<imageData.data.length; x+=4){

			//Red component
			if(maxRGBControl[x] == 1){
				if(initGray[x] > maxRGB[x]){
					initGray[x] -= speed;
				}else if(initGray[x] <= maxRGB[x]){
					initGray[x] = maxRGB[x];
				}
			}else if(maxRGBControl[x] == 0){
				if(initGray[x] < maxRGB[x]){
					initGray[x] += speed;
				}else if(initGray[x] >= maxRGB[x]){
					initGray[x] = maxRGB[x];
				}
			}

			//Green component
			if(maxRGBControl[x+1] == 1){
				if(initGray[x+1] > maxRGB[x+1]){
					initGray[x+1] -= speed;
				}else if(initGray[x+1] <= maxRGB[x+1]){
					initGray[x+1] = maxRGB[x+1];
				}
			}else if(maxRGBControl[x+1] == 0){
				if(initGray[x+1] < maxRGB[x+1]){
					initGray[x+1] += speed;
				}else if(initGray[x+1] >= maxRGB[x+1]){
					initGray[x+1] = maxRGB[x+1];
				}
			}

			//Blue component
			if(maxRGBControl[x+2] == 1){
				if(initGray[x+2] > maxRGB[x+2]){
					initGray[x+2] -= speed;
				}else if(initGray[x+2] <= maxRGB[x+2]){
					initGray[x+2] = maxRGB[x+2];
				}
			}else if(maxRGBControl[x+2] == 0){
				if(initGray[x+2] < maxRGB[x+2]){
					initGray[x+2] += speed;
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
		fade = requestAnimationFrame(function(){
			self.grayToRGB();
		});

		//Check for completion
		if(currentLoop == maximumLoop){
			cancelAnimationFrame(fade);
		}
	}
	//********************* Gray to RGB template end*********************//
}
///////////////////////////////////________________Canvas_Image_ends______________////////////////////////////

/*___________________________________________________________________________________________________________*/

///////////////////////////////////________________dashed_rectangle_starts________////////////////////////////
function dashedRectangle(){
	dRectSelf = this;
	seg = 0;
	tf = 0;
	////////////___________________fixed dashed rectangle starts_____________/////////////////////
	this.fixedRectangle = {
		properties  :	{
			lineColor	:"black",
			lineWidth	:5,
			segment		:[10,2],
			origin		:[0,0]
		},
		draw : function(canObj, canvasElement){
			canvasElement.width = canvasElement.scrollWidth;
			canvasElement.height = canvasElement.scrollHeight;

			//Segment
			canObj.setLineDash(dRectSelf.fixedRectangle.properties.segment);


			//lineColor
			canObj.strokeStyle = dRectSelf.fixedRectangle.properties.lineColor;


			//lineWidth
			canObj.lineWidth = dRectSelf.fixedRectangle.properties.lineWidth;

			//origin
			xOrigin = dRectSelf.fixedRectangle.properties.origin[0];
			yOrigin = dRectSelf.fixedRectangle.properties.origin[1]
			canObj.clearRect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
			canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
			canObj.stroke();
		}

	}
	////////////___________________fixed dashed rectangle ends_____________/////////////////////


	this.animatedRectangle = {
		properties : {
			lineColor	:"black",
			lineWidth	:5,
			segment		:[10,2],
			origin		:[0,0],
			clockWise	:true,
			duration 	:3000,
			easing		:"linear"//default
		},
		stop	: 0,
		active 	: "",
		draw	: function(canObj, canvasElement){
			//Reset canvas size
			canvasElement.width = canvasElement.scrollWidth;
			canvasElement.height = canvasElement.scrollHeight;

			//Segment
			canObj.setLineDash(dRectSelf.animatedRectangle.properties.segment);

			//lineColor
			canObj.strokeStyle = dRectSelf.animatedRectangle.properties.lineColor;

			//lineWidth
			canObj.lineWidth = dRectSelf.animatedRectangle.properties.lineWidth;

			//origin
			xOrigin = dRectSelf.animatedRectangle.properties.origin[0];
			yOrigin = dRectSelf.animatedRectangle.properties.origin[1];


			//easing
			easing = dRectSelf.animatedRectangle.properties.easing;


			//duration
			duration = dRectSelf.animatedRectangle.properties.duration;


			//direction
			direction = dRectSelf.animatedRectangle.properties.clockWise; //clockwise

			animationStart = Date.now();

			requestAnimationFrame(function animate(){

				tf = timing.timeFraction (animationStart, duration);
				progress = timing[easing](tf);

				if(direction == true){ //clockwise
					canObj.lineDashOffset = -1*(progress*100);
				}else{//anti clockwise
					canObj.lineDashOffset = progress*100;
				}
				canObj.clearRect(xOrigin,yOrigin, canvasElement.width, canvasElement.height);
				canObj.rect(xOrigin, yOrigin, canvasElement.width, canvasElement.height);
				canObj.stroke();


				if(dRectSelf.animatedRectangle.stop == 0 && dRectSelf.animatedRectangle.active == canvasElement.id && progress < 1 ){
					requestAnimationFrame(animate);
				}

			});
		}
	}

}
///////////////////////////////////________________dashed_rectangle_ends_________/////////////////////////////

///////////////////////////////////________________loadProgress_starts________///////////////////////////////
function loadProgress(canvasElement, canvasObj){
	ldself = this;
	function round(value, decimals) {
	  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
	}
	this.circularProgress = {
		properties : {
			start 				: 12,
			progressLabel 		: "on",
			progressBackground	: "#ccc",
			strokeWidth			: 10,
			strokeColor			: "yellow",
			radius				: 50,
			percentageFontColor	: "white",
			percentageFont		: "normal normal 2.1vw Verdana",
			LabelFontColor		: "white",
			LabelFont			: "normal normal .9vw Verdana"
		},
		show		: function(progress, label){
			startPoint = 0;
			fprog = round(progress, 2);
			if(ldself.circularProgress.properties.start == 12){
				startPoint = -0.5*Math.PI;
			}else if(ldself.circularProgress.properties.start == 3){
				startPoint = 0*Math.PI;
			}else{
				startPoint = 0*Math.PI;
			}
			function percentageToAngle(percentage){
				angle = (percentage/100)*(2*Math.PI);
				if(ldself.circularProgress.properties.start == 12){
					return angle - (0.5*Math.PI);
				}else if(ldself.circularProgress.properties.start == 3){
					return angle;
				}else{
					return angle;
				}
			}
			x = (50/100) * canvasElement.scrollWidth;
			y = (50/100) * canvasElement.scrollHeight;
			if(ldself.circularProgress.properties.progressLabel == "on"){
				fontY = (46/100) * canvasElement.scrollHeight;
				labelY = (55/100) * canvasElement.scrollHeight;
			}else{
				fontY = y;
			}


			//Draw
			canvasObj.clearRect(0,0, canvasElement.width, canvasElement.height);

			//Progress Background
			canvasObj.beginPath();
			canvasObj.lineWidth = ldself.circularProgress.properties.strokeWidth;
			canvasObj.strokeStyle  = ldself.circularProgress.properties.progressBackground;
			canvasObj.arc(x,y,ldself.circularProgress.properties.radius,0,2*Math.PI, false);
			canvasObj.stroke();


			//Progress Text
			canvasObj.textAlign = "center";
			canvasObj.textBaseline = "middle";
			canvasObj.font = ldself.circularProgress.properties.percentageFont;
			canvasObj.fillStyle = ldself.circularProgress.properties.percentageFontColor;
			canvasObj.fillText(fprog+"%", x, fontY);
			if(ldself.circularProgress.properties.progressLabel == "on"){ //label
				canvasObj.font = ldself.circularProgress.properties.LabelFont;
				canvasObj.fillStyle = ldself.circularProgress.properties.properties;
				canvasObj.fillText(label, x, labelY);
			}

			//Progress point
			canvasObj.beginPath();
			canvasObj.lineWidth = ldself.circularProgress.properties.strokeWidth;
			canvasObj.strokeStyle  = ldself.circularProgress.properties.strokeColor;
			canvasObj.arc(x,y,ldself.circularProgress.properties.radius,startPoint,percentageToAngle(progress), false);
			canvasObj.stroke();
			}

	}
}

///////////////////////////////////________________loadProgress_ends________/////////////////////////////////


///////////////////////////////////________________ResourceLoader_start_____________//////////////////////////
function ResourceLoader (canvasElement, canvasObj, progressObj){
	//private members starts
	Rlself 		= this;
	imageXhr 	= [];
	imageUrls 	= [];
	ImageLoadOk = 0;
	FontXhr 	= [];
	FontUrls 	= [];
	FontLoadOk	= 0;
	pageXhr 	= [];
	pageUrls 	= [];
	pageLoadOk	= 0;
	currentPrg = 0;
	currentLbl = "";

	function initializeResource(resource){
		if(Rlself.resourceType == "image"){
			for(x=0; x<resource.length; x++){
				imageXhr[x] = new XMLHttpRequest();
				imageXhr[x].responseType = 'blob';
				imageUrls[x] = resource[x].getAttribute("data-vbg");
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}

		}else if(Rlself.resourceType == "font"){
			for(x=0; x<resource.length; x++){
				FontXhr[x] = new XMLHttpRequest();
				FontXhr[x].responseType = 'text';
				FontUrls[x] = resource[x].getAttribute("data-vfont");
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else if(Rlself.resourceType == "text"){
			for(x=0; x<resource.length; x++){
				pageXhr[x] = new XMLHttpRequest();
				pageXhr[x].responseType = 'text';
				pageUrls[x] = resource[x].getAttribute("data-vContent");
				if (x == resource.length-1){
					assignEventHandlers();
				}
			}
		}else{
			progressObj.circularProgress.show(0, "Load error");
			console.error("Resource type not specified");

		}

	}
	function assignEventHandlers(){
		if(Rlself.resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == resource.length-1){
					get();
				}
			})
		}else if (Rlself.resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].onload = function(){progCalc(arrayIndex)};
				if (arrayIndex == resource.length-1){
					get();
				}
			})
		}else if (Rlself.resourceType == "text"){
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
		if(Rlself.resourceType == "image"){
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].open("GET", imageUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}else if(Rlself.resourceType == "font"){
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].open("GET", FontUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}else if(Rlself.resourceType == "text"){
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].open("GET", pageUrls[arrayIndex], true);
				if (arrayIndex == resource.length-1){
					 fireGet();
				}
			})
		}
	}
	function progCalc(index){
		if(Rlself.resourceType == "image"){
			if(imageXhr[index].status == 200){
				var reader  = new FileReader();
				reader.onloadend = function () {
					ImageLoadOk += 1;
					total = (ImageLoadOk/imageXhr.length)*100;
					resource[index].style["background-image"] = "url("+reader.result+")";
					currentPrg = total;
					currentLbl = "Loading images"
					progressObj.circularProgress.show(currentPrg, currentLbl);
					if(total == 100){
						if (Rlself.image.options.callBack == true){
							setTimeout(function(){
								Rlself.image.options.fn();
							},Rlself.image.options.delay);
						}
					}
				};
				reader.readAsDataURL(imageXhr[index].response);
			}else{
				progressObj.circularProgress.show(0, "Error occured");
			}
		}else if(Rlself.resourceType == "font"){
			if(FontXhr[index].status == 200){
				FontLoadOk += 1;
				total = (FontLoadOk/FontXhr.length)*100;
				currentPrg = total;
				currentLbl = "Loading fonts"
				progressObj.circularProgress.show(currentPrg, currentLbl);
				if(total == 100){
					if (Rlself.font.options.callBack == true){
						setTimeout(function(){
							Rlself.font.options.fn();
						},Rlself.font.options.delay);
					}
				}
			}else{
				progressObj.circularProgress.show(0, "Error "+Xreq.status);
			}
		}else if(Rlself.resourceType == "text"){
			if(pageXhr[index].status == 200){
				pageLoadOk += 1;
				total = (pageLoadOk/pageXhr.length)*100;
				resource[index].innerHTML = pageXhr[index].responseText;
				currentPrg = total;
				currentLbl = "Loading content"
				progressObj.circularProgress.show(currentPrg, currentLbl);
				if(total == 100){
					if (Rlself.page.options.callBack == true){
						setTimeout(function(){
							Rlself.page.options.fn();
						},Rlself.page.options.delay);
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
		if(Rlself.resourceType == "image"){
			currentLbl = "Loading images";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			imageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				imageXhr[arrayIndex].send();
			})
		}else if(Rlself.resourceType == "font"){
			currentLbl = "Loading fonts";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			FontXhr.forEach(function(itemContent, arrayIndex, targetArray){
				FontXhr[arrayIndex].send();
			})
		}else if(Rlself.resourceType == "text"){
			currentLbl = "Loading content";
			currentPrg = 0;
			progressObj.circularProgress.show(currentPrg, currentLbl);
			pageXhr.forEach(function(itemContent, arrayIndex, targetArray){
				pageXhr[arrayIndex].send();
			})
		}

	}
	//private members end
	this.getCurrentProgress	=	function(){
		return currentPrg;
	}
	this.getCurrentLabel	=	function(){
		return currentLbl;
	}
	this.resourceType = "text";
	//content loader starts
	this.page = {
		options	: {
			callBack: false,
			fn		: function(){},
			delay	: 0

		},
		get		: function(resource){
			initializeResource(resource);
		}
	}
	//content loader ends

	//________________________________________________________________________________________________________

	///image loader starts
	this.image = {
		options : {
			callBack	: false,
			fn			: function(){},
			delay		: 0
		},
		get				: function(resource){
			initializeResource(resource);
		}

	}
	///image loader ends

	//________________________________________________________________________________________________________

	////font loader starts
	this.font = {
		options : {
			callBack	: false,
			fn			: function(){},
			delay		: 0
		},
		get				: function(resource){
			initializeResource(resource);
		}

	}
	////font loader ends
}
///////////////////////////////////________________ResourceLoader_end_____________///////////////////////////

///////////////////////////////////________________ToBaseGridMultiple_start____//////////////////////////
function  ToBaseGridMultiple(targetElement){
	var self = this;
	var newHeight = window.innerHeight;
	var root = document.querySelector("html");
	this.BaseGridHeight = 27;
	this.setHeight = function(){
		if(newHeight%self.BaseGridHeight != 0){
			while (newHeight%self.BaseGridHeight != 0){
				newHeight++;
			}
			targetElement.style["height"] = newHeight+"px";
			var TotalHeight = root.scrollHeight;
			root.style["height"] = TotalHeight+"px";
		}
	}
	this.centerVertically = function(){
		var transformValue = css.getStyles(targetElement, "transform");
		var split = transformValue.split(", ");
		var targetIndex = split[split.length-1];
		var filteredValue = targetIndex.replace(")", "");
		filteredValue = Math.round(-1*filteredValue);
		if(filteredValue%self.BaseGridHeight != 0){
			while (filteredValue%self.BaseGridHeight != 0){
				filteredValue--;
			}
			targetElement.style["transform"] = "matrix(1, 0, 0, 1, 0, -"+filteredValue+")";
		}
	}
}
ToBaseGridMultiple.setHeight = function(targetElement, height){
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
///////////////////////////////////________________SetToBaseGridMultiple_end____//////////////////////////

///////////////////////////////////________________Writer_start___________________//////////////////////////
function Writer(){
	PlainTextCounter = 0;
	ParagraphTextCounter = 0;
	ActiveParagraph = 0;
	this.callBackDelay = 0;
	self = this;
	this.speed = [10,200];
	getRandomInt = function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	this.writePlainText = function(con, text, fn){
		n = getRandomInt(self.speed[0], self.speed[1]);
		if(PlainTextCounter < text.length-1){
			g = setInterval(function(){
				con.innerHTML += text[PlainTextCounter];
				clearInterval(g);
				self.writePlainText(con, text, fn);
				PlainTextCounter++;
			},n);
		}else{
			PlainTextCounter = 0;
			setTimeout(function(){fn()}, self.callBackDelay);
		}
	}
	this.writeParagraphText = function (paragraphs, texts, fn){
		n = getRandomInt(self.speed[0], self.speed[1]);
		if(ActiveParagraph < paragraphs.length){
			b = (texts[ActiveParagraph].length)+1;
			if(ParagraphTextCounter <= texts[ActiveParagraph].length){
				g = setInterval(function(){
					if (ParagraphTextCounter+1 == b){
						ParagraphTextCounter = 0;
						ActiveParagraph++;
					}
					clearInterval(g);
					if(ActiveParagraph >= paragraphs.length){
						ParagraphTextCounter = 0;
						ActiveParagraph =0;
						setTimeout(function(){fn()}, self.callBackDelay);
					}else{
						k = texts[ActiveParagraph][ParagraphTextCounter];
						paragraphs[ActiveParagraph].innerHTML +=  texts[ActiveParagraph][ParagraphTextCounter];
						ParagraphTextCounter++;
						self.writeParagraphText(paragraphs, texts, fn);
					}
				},n);

			}

		}
	}
}
///////////////////////////////////________________Writer_end___________________//////////////////////////
