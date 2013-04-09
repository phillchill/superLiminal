// TODO
// * fullscreen
// * reverse
// * hi res images
// * layout progressbar
var myFrameScroller;
var myScrollController;
var options;

document.addEventListener("DOMContentLoaded", function () {  
  start();
}, false);


function start () {
  // console.log("body before: ", $("body").children());

  options = {
    progress: true,
  }
  
  setupDOM();
  setupHandlers();
  var framesId = "#scrollframes";
  var progressId = "#progressDiv";
  // init FrameScroller object
  myFrameScroller = new FrameScroller(framesId, 10, progressId);
  // init ScrollController object
  myScrollController = new ScrollController(framesId, myFrameScroller);
  

  // debug
  $(window).bind('keypress', function(e) {

    console.log("keypressed");
    var code = (e.keyCode ? e.keyCode : e.which);
    if(code == 112) { // "p"
      myFrameScroller.setFPS(2);
    };
    if(code == 115) { // "s"
      myFrameScroller.setFPS(0);
    };

  });
  // console.log("body after: ", $("body").children());
}

function setupDOM () {
  var wrapperId = "#wrapper";
  
  $(wrapperId).empty();
  
  // Frames
  loadFrames(wrapperId);

  // Progress bar
	if( options.progress ) {
    console.log("found progress");
		loadProgress(wrapperId);
	}
	
}

function setupHandlers () {
  // window.resize handler
  $(window).resize(function() {
    console.log('$(window).width(): ', $(window).width());
    scaleFrames();
  });
}

function loadFrames (wrapperId) {
  // $("#scrollframes").remove();
  $(wrapperId).prepend('<div id="scrollframes"></div>');

  // CSS;
  $("#scrollframes").css("background", "transparent url(img/pilot_sequence/sprites/10x_128_72_ball.png) 0 0 no-repeat");
  $("#scrollframes").css("position", "fixed");
  
  $("#scrollframes").css("top", "0px");
  $("#scrollframes").css("left", "0px");

  $("#scrollframes").css("width", "100%");
  $("#scrollframes").css("height", "100%");
  $("#scrollframes").css("background-size", "1000%, 1000%");
  

  $("#scrollframes").css("z-index", "100");
  $("#scrollframes").css("cursor", "pointer");

}

function loadProgress (wrapperId) {
  console.log("now loading progress");
  $(wrapperId).append('<div class="progressDiv"><span></span></div>');
}

// reset size of frame div to fit window width
function scaleFrames() {
  // TODO; work like reload on resize

  var wrapperId = "#wrapper";
  var framesId = "#scrollframes";
  var progressId = "#progressDiv";

  $("#scrollframes").destroy();
  $(wrapperId).empty();
  
  // Frames
  loadFrames(wrapperId);

  // Progress bar
  if( options.progress ) {
    console.log("found progress");
    loadProgress(wrapperId);
  };  

  // init FrameScroller object
  myFrameScroller = new FrameScroller(framesId, 10, progressId);
  // init ScrollController object
  myScrollController = new ScrollController(framesId, myFrameScroller);


}


// define FrameScoller class
function FrameScroller (targetId, no_of_frames, progressId) {
  _self = this;
  this.targetId = targetId;
  // this.frameTarget = $(targetId);
  this.no_of_frames = no_of_frames;
  this.frameNumber = 0;
  this.progress = $(progressId);
  this.fps = 0;
  this.getOnFrameEvents = getOnFrameEvents;
  this.getEventFunction = getEventFunction;
  this.constructSprite = constructSprite;

  this.constructSprite();
  
  console.log("FrameScroller initiated");
  
  function constructSprite () {
    this.frameTarget = $(_self.targetId);
    this.frameTarget.sprite({
      fps: _self.fps,
      no_of_frames: _self.no_of_frames,
      on_frame: _self.getOnFrameEvents()
    });
  };

  function getOnFrameEvents () {
    var on_frame = {};
    for (var i = 0; i < this.no_of_frames; i++) {
      on_frame[i.toString()] = this.getEventFunction(i);
    };
    return on_frame;
  };
  
  function getEventFunction (i) {
    return function () {
      // console.log("***now at: ", i.toString());
      _self.updateFrameNumber(i);
      console.log("now at:", i);
    };
  };
  
  // define methods
  this.testFunction = function () {
    console.log("testFunction");
  };
  
  this.updateFrameNumber = function (frameNumber) {
    this.frameNumber = frameNumber;
    this.updateProgress(frameNumber);
  };
  
  this.updateProgress = function (currentFrameNumber) {
    if ( this.progress ) {
      // calc new width of progressbar
      var new_width = ( currentFrameNumber / ( _self.no_of_frames - 1) ) * window.innerWidth + 'px';      
      // update progressbar
      $(".progressDiv span").css( "width", new_width );
    };
  };
  
  this.gettargetId = function () {
    return this.targetId;
  };
  
  this.getFPS = function () {
    return this.fps;
  };
  
  this.setFPS = function (fps) {
    this.fps = fps;
    // TODO set sprite direction
    // contact Sebastian re sprites with two directions
    this.frameTarget.fps(Math.abs(this.fps));
    // console.log("fps set:", fps);
  };
  
};

// define ScrollController class
function ScrollController (controlId, targetFrameScroller) {
  // construct ScrollController
  var _self = this;
  this.controlId = controlId;
  this.targetFrameScroller = targetFrameScroller;
  this.delta = 0;
  this.deltaX = 0;
  this.deltaY = 0;
  // wheelToScroll parameters
  this.scrollMax = 30;
  // smoothing parameters
  this.scrollOutDelay = 500;
  this.decayFactor = 0.6;
  
  $(_self.controlId).mousewheel(function(event, delta, deltaX, deltaY) {
    _self.mousewheelHandler(event, delta, deltaX, deltaY);
  });

  // Get and set Delta (X and Y)
  this.getDelta = function () {
    return this.delta;
  };
  this.setDelta = function (delta) {
    this.delta = delta;
  };
  
  this.getDeltaX = function () {
    return this.deltaX;
  };
  this.setDeltaX = function (deltaX) {
    this.deltaX = deltaX;
  };
  
  this.getDeltaY = function () {
    return this.deltaY;
  };
  this.setDeltaY = function (deltaY) {
    this.deltaY = deltaY;
  };
  
  this.mousewheelHandler = function (event, delta, deltaX, deltaY) {
    this.setDelta(delta);
    this.setDeltaX(deltaX);
    this.setDeltaY(deltaY);
    // console.log(delta, deltaX, deltaY);
    var scrollSpeed = this.wheelToScroll(delta, deltaX, deltaY);
    this.setScrollOut();
    this.targetFrameScroller.setFPS(scrollSpeed);
  };
  
  this.setScrollOut = function () {
    this.lastWheelStamp = new Date().getTime();
    // console.log("this.lastWheelStamp in setScrollOut: ", this.lastWheelStamp);
    var scrollTimeoutID = window.setTimeout(_self.scrollOut, _self.scrollOutDelay);      
  };
  
  this.scrollOut = function () {
    var nowStamp = new Date().getTime();
    // console.log("this.lastWheelStamp: ", _self.lastWheelStamp);
    // console.log("nowStamp: ", nowStamp);
    // console.log("deltatime: ", nowStamp - _self.lastWheelStamp);
    if ((nowStamp - _self.lastWheelStamp) >= 0.95 * _self.scrollOutDelay) {
      
      if (_self.targetFrameScroller.getFPS() > 1) {
        // var decayFactor = 0.6;
        var decayed = _self.targetFrameScroller.getFPS() * _self.decayFactor;
        // console.log("*********DECAYING LOG!!!!");
        _self.targetFrameScroller.setFPS(decayed);
        window.setTimeout(_self.scrollOut, 100);
      }
      else {
        // console.log("*********KILLING LOG!!!!");
        _self.targetFrameScroller.setFPS(0);
      };
    };
  };
  
  // normalize mousewheel delta to frame scroll speed
  this.wheelToScroll = function (delta, deltaX, deltaY) {
    // pick greatest mousewheelDelta
    var controlDelta;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      controlDelta = deltaX;
    }
    else {
      // inverse deltaY so downward mousewheel is forward scroll
      controlDelta = -deltaY;
    };
    
    // transform mousewheel speed to scroll speed
    
    // using inverse hyperbolic sine function sinh^-1(x) == log(x+sqrt(x^2 + 1))
    // http://www.wolframalpha.com/input/?i=y+%3D+15+*+log%28x%2Bsqrt%28x%5E2+%2B+1%29%29+%28x+from+-500+to+500%29
    var scrollSpeed = ( this.scrollMax / 6 ) * Math.log(controlDelta+Math.sqrt(Math.pow(controlDelta,2) + 1));
    
    // using double logistic sigmoid function
    // http://www.wolframalpha.com/input/?i=plot+y%3D+100+*+sgn%28x%29*%281+-+e%5E%28-%280.02x%29%5E2%29%29+%28x+from+-300+to+300%29
    // var scrollSpeed = 100 * sign(controlDelta) * (1 - Math.exp( - Math.pow( 0.02 * controlDelta, 2)));
    // *not responsive enough on start of scroll
    // console.log('scrollspeed: ', scrollSpeed);
    return scrollSpeed;
  };
   
};
