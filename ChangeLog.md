# Changelog

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
- Added iterationCount option to 	animatedRectangle module
- Added callback option to animatedRectangle module
- Added horizontal and vertical element centralizer

### Changed
- Changed method call, from: 	Object.fixedRectangle.draw(CanvasObject, canvasElement) to Object.fixedRectangle.draw(canvasElement)
- Placed all configurable properties of module under the namespace 'config' and Changed all 'options' object to 'config' object
- Changed Obj.animatedRectangle.stop property to Obj.animatedRectangle.stop() method;
- Changed imageManipulator() constructor argument 1 from canvas Object to canvas element
- Changed loadProgressIndicator.circularProgress.config.progressLabel property from string to boolean property
- Changed method call, from: 	Object.loadProgressIndicator(canvasElement, canvasObj) to Object.loadProgressIndicator(canvasElement)

### Removed
- Remove imageManipulatorOBJ.dimension property. No more need to specify dimension
