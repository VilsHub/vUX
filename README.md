# vUX Overview
vUX is JS framework for building UI components and optimizing UX. Its light and easy to use.

## Requirements

vUX is strictly built on JavaScript and has no dependencies, other than a JavaScript enabled browser.

## Installation

To use vUX, include the script ** vUX-x.y.z.js ** where ** x y z** represents the version. Example is shown below:

    <script src="vUX/vUX-0.1.0.js"></script>

** Note **

You can rename the JS file if you wish to.

## Features
The first release ( ** v1.0.0 ** ), has the following features:
- Custom timing for non CSS animation
- Animated RGB to Gray scale converter and vice versa
- Base grid height fixer for responsive element height
- Animated Rectangular grid border drawer
- Real time resource(s) loader
- Typewriter

** Features to be included in v1.1.0 **

- Modal creator
- 5 Star rating creator
- Date picker

## Demo
** RGB to Gray Animator**

    //////// RGB To GRAY  ///////////
      //gets canvas element
    	var TargetCanvas = document.getElementById("canvas");
    	var DrawingHandler = TargetCanvas.getContext('2d'); //initialization

      var imgUrl = "http://www.example.com/img/gd.jpg";
    	var im = new imageManipulator(DrawingHandler, imgUrl);
    	im.dimension.height = 300;
    	im.dimension.width = 300;
    	im.initializeRgbToGray(3);

    	setTimeout(function(){
    		im.rgbToGray();
    	}, 2000);
    ////////////////////////////////////////////


** Gray to RGB Animator**

    //////// RGB To GRAY  ///////////
      //gets canvas element
      var TargetCanvas = document.getElementById("canvas");
      var DrawingHandler = TargetCanvas.getContext('2d'); //initialization

      var imgUrl = "http://www.example.com/img/gd.jpg";
      var im = new imageManipulator(DrawingHandler, imgUrl);
      im.dimension.height = 300;
      im.dimension.width = 300;
      im.initializeGrayToRgb(3);

      setTimeout(function(){
      	im.grayToRgb();
      }, 2000);
    ////////////////////////////////////////////

** Animated rectangular border drawer **

    //////// grid border rectangle  ///////////
      //gets canvas element
    	var TargetCanvas = document.getElementById("canvas");
    	var DrawingHandler = TargetCanvas.getContext('2d'); //initialization


    	var gbr = new gridBorderRectangle();
    	gbr.fixedRectangle.lineColor = "red";
    	gbr.fixedRectangle.segment = [5, 4];
    	gbr.fixedRectangle.draw(DrawingHandler, TargetCanvas);

    	setTimeout(function(){
    		gbr.animatedRectangle.stop = 0; //Must be set to 0
    		gbr.animatedRectangle.active = TargetCanvas.id; //Must be set
    		gbr.animatedRectangle.easing = "swingEaseIn";
    		gbr.animatedRectangle.duration = 800;
    		gbr.animatedRectangle.segment = [5, 4];
    		gbr.animatedRectangle.lineColor = "red";
    		gbr.animatedRectangle.draw(DrawingHandler, TargetCanvas);
    	}, 2000);
    ////////////////////////////


** More demo coming soon.....**

## Documentation ##

The documentation for this framework will be provided soon, you may ** Watch **, this repo for further updates.
