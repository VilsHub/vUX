# Changelog
## v4.0.0.beta
## Fixed
- Fixed modal multiple display bug
- Fixed draw() call on backward compatibility (> ver 2.0)
- Fixed datepicker auto place issue

## Added
- Added slideSwitch sub module to custom form module
- Added blur overlayType to modalDisplayer module
- Added optionStateStyle to selectCustom input
- Added wrapAttribute property to both custom select and datepicker
- Added utility namespace ($$), with some modules moved to it
- Added return datatype option to Ajax.Create() static method
- Resizer module
- Slide utility

## Removed
- Removed colorOverlayStyle in modalDisplayerObj
- Removed config.smallView property, to be set using attributes for individual elements, leading to the addition of config/smallViewAttribute property for setting the attribute to be used
- loadProgressIndicator Removed, as IO.dowload() send download status, to be used by user for their needs
- imageManipulator module removed, now handled by $$.sm.filter()
- Removed validator.config.progressIndicatorStyle

## Changed
- modalDisplayerObj overlayType property changed to overlayBackgroundType
- Size of custom element changed to using specified attribute value
- modalDisplayer workflow changed
- formValidator wrapperDataAtrribute property changed to wrapperClassAtrribute
- formValidator format.fullName() changed to format.wordSeperator(), and accepts arguments 2 and 3, 2 for specifying the seperator and 3 for specifying the number of times to repeat the seperator
- formValidator format.toCurrency() changed to format.currencyField()
- ToBaseGridMultiple changed to vRhythm (vertical Rhythm)
- GridBorderRectangle() constructor changed to CShapes() => Canvas Shapes
- CircularProgress() changed to arc()
- ResourceIO module changed to IO

## Optimised
- Optimized $$.cssStyle() static method functionality


## v3.0.0
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
- TouchHandler module
- getParent Module
- Added spaceError property to listScroller

### Removed
- set() method from toolTip module, only on() and off() methods used

### Optimised
- ToolTip  module


### Changed
- DatePicker module now in customFormComponent namespace
- All constructor functions renamed to standard convention

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
