# vUX Overview
vUX is JS library for building UI components and optimizing UX. Its light and easy to use.

## Requirements

vUX is strictly built on JavaScript and has no dependencies, other than a JavaScript enabled browser.

## Installation

To use vUX you import it using ES6 native import, with 2 additional data attributes. Here are the steps below:

1. Specify the module script to make use vUx as module, by setting the script element type attribute to module. Example

    `<script type= "module" src="js/main.js"></script>`

2. Add a data attribute of **id** to the target script element with value "*vUx*" (Case insensitive). This is very vital as the modules depend on it. That is,:

    `<script type= "module" src="js/main.js" data-id="vUX"></script>`

3. And finally add another data attribute of **library-root** to the target script element, with value set to the the root of library root. The path could be relative or absolute. This also vital as it helps vUx to load in all dependency assets automatically. Example

    `<script type= "module" src="js/main.js" data-id="vUX" data-library-root="http://library.vilshub.com/lib/vUX/4.0.0/"></script>`


4. Then start making use of the vUx module first by first importing using ES6 native import in the target script file, using the file name pattern **vUX-modulefile.js**. Example is shown below:
  
    **main.js**

    `import {FormComponents} from "http://library.vilshub.com/lib/vUX/4.0.0/vUX-formValidator.js"`

    `import {ListScroller} from "http://library.vilshub.com/lib/vUX/4.0.0/vUX-listScroller.js"`


**Note**

 - To see all the available modules filename to be imported for use, execute the command **vUxModules** on the console 

## Features


The beta version (**v4.0.0-beta** ) has the following features added:



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

## Demo

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
