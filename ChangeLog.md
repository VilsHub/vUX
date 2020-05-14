# Changelog

## v2.1.0
### Fixed
- validator module bugs
- date picker bug (setting future date)
- multiple style sheet creation for modules depending on style sheets
- Modal overflow smooth scroll
- date picker bug (wrong format of date in date only mode)
- Multiple select field with one custom builder instance bug
- carousel dependent id name (no more ID dependent)
- Tool tip arrow color and box style not updating

### Added
- Away clicked to exit modal, in modal displayer module
- Animator module, for non CSS and CSS animation 
- Event handler attacher module, with support for appended elements
- content Loader module
- hasParent module
- reset functionality to date picker module
- Auto positioning of potential custom select element parent
- Option to change font color and background color of datePicker label and day tool tip

## v2.0.0
### Optimised
- Protected all unprotected properties
- Optimized codes

### Added
- screen break points checker
- browser Resize Property handler
- DOM Element properties getter
- Custom form component builder
  - Select input
  - Radio input
  - checkBox input
- Form validator
- Modal display
- window vertical scroll Handler
- Date picker
- Tool tip creator
- IterationCount option to 	animatedRectangle module
- Callback option to animatedRectangle module
- Horizontal and vertical element centralizer
- Carousel

### Changed
- Changed method call, from: 	Object.fixedRectangle.draw(CanvasObject, canvasElement) to Object.fixedRectangle.draw(canvasElement)
- Placed all configurable properties of module under the namespace 'config' and Changed all 'options' object to 'config' object
- Changed Obj.animatedRectangle.stop property to Obj.animatedRectangle.stop() method;
- Changed imageManipulator() constructor argument 1 from canvas Object to canvas element
- Changed method call, from: 	Object.loadProgressIndicator(canvasElement, canvasObj) to Object.progressIndicator(canvasElement)
- Changed progressIndicator.circularProgress.config.progressLabel property from string to boolean property
- Changed resourceLoader() module to resourceIO

### Removed
- Remove imageManipulatorOBJ.dimension property. No more need to specify dimension
