# vUX Overview
vUX is JS library for building UI components and optimizing UX. Its light and easy to use.

## Requirements

vUX is strictly built on JavaScript and has no dependencies, other than a JavaScript enabled browser.

## Installation

To use vUX, include the script **vUX-x.y.z.js** where **x y z** represents the version. Example is shown below:

    <script src="vUX/vUX-3.0.0.js"></script>
    or
    <script src="vUX/vUX-3.0.0.min.js"></script>


**Note**

The file name should not be changed, as its needed to auto load assets needed by the library

## Features
The 3rd release ( **v3.0.0** ), has the following features added:
- Animator module, for non CSS and CSS animation 
- Event handler attacher module, with support for appended elements
- content Loader module
- hasParent module
- TouchHandler module


The second release ( **v2.0.0** ), has the following features added:
- Modal displayer
- Form validator
- Date picker
- Tool tip
- Carousel
- And other sub modules features

The first release ( **v1.0.0** ), has the following features:
- Custom timing for non CSS animation
- Animated RGB to Gray scale converter and vice versa
- Base grid height fixer for responsive element height
- Animated Rectangular grid border drawer
- Real time resource(s) loader
- Typewriter

See more details... [See change Log](ChangeLog.md)

**Features to be included in v3.1.0**

- Accordion
- 5 Star rating creator
- 

## Demo
**RGB to Gray Animator**

    //////// RGB To GRAY  ///////////
      //gets canvas element
    	var TargetCanvas = document.getElementById("canvas");
      var imgUrl = "http://www.example.com/img/gd.jpg";
    	var im = new imageManipulator(DrawingHandler, imgUrl);
    	im.initializeRgbToGray(3);

    	setTimeout(function(){
    		im.rgbToGray();
    	}, 2000);
    ////////////////////////////////////////////

**OUTPUT**

![RGB to Gray Output](https://i.imgur.com/yFhhLAJ.gif)

**Gray to RGB Animator**

    //////// RGB To GRAY  ///////////
      //gets canvas element
      var TargetCanvas = document.getElementById("canvas");
      var imgUrl = "http://www.example.com/img/gd.jpg";
      var im = new ImageManipulator(DrawingHandler, imgUrl);
      im.initializeGrayToRgb(3);

      setTimeout(function(){
      	im.grayToRgb();
      }, 2000);
    ////////////////////////////////////////////

**OUTPUT**

![Gray to RGB Output](https://imgur.com/gxxGDN1.gif)

**Animated rectangular border drawer**

    //////// grid border rectangle  ///////////
      //gets canvas element
    	var TargetCanvas = document.getElementById("canvas");


    	var gridBorderRectangleObj = new GridBorderRectangle();
      var fgbr = gridBorderRectangleObj.fixedRectangle();
      var agbr = gridBorderRectangleObj.animatedRectangle();

    	fgbr.config.lineColor = "red";
    	fgbr.config.segment = [5, 4];
    	fgbr.draw(TargetCanvas);

      agbr.config.easing = "swingEaseIn";
      agbr.config.duration = 800;
      agbr.config.segment = [5, 4];
      agbr.config.lineColor = "red";

    	setTimeout(function(){
    		agbr.draw(TargetCanvas);
    	}, 2000);
    ////////////////////////////

**OUTPUT**

![animated grid border](https://imgur.com/WVwgVVi.gif)


**More demo coming soon.....**

## Documentation ##

The documentation for this library will be provided soon, you may **Watch**, this repo for further updates.
