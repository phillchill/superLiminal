var myFrameScroller;
var myScrollController;
var options;

document.addEventListener("DOMContentLoaded", function () {  
  options = {
    progress:   true,
    wrapperId: "wrapper",
    framesId: "scrollframes",
    controllerId: "scrollcontroller",
    progressClass: "progressDiv"
  }

  sequences = {
    1: {
      idx: 1,
      spriteFolder: "img/final_sprites/",
      spritePrefix: "seq_08_7x15_",
      spriteExtension: ".jpg",
      hdFolder: "img/hd/1280_720_final/seq_08/",
      hdPrefix: "seq_08_1280x720_",
      hdExtension: ".jpg",
      no_of_columns: 7,
      no_of_rows: 15,
      no_of_sprites: 5,
      frameWidth: 384,
      frameHeight: 216,
    },
    2: {
      idx: 2,
      spriteFolder: "img/final_sprites/",
      spritePrefix: "seq_07_7x15_",
      spriteExtension: ".jpg",
      hdFolder: "img/hd/1280_720_final/seq_07/",
      hdPrefix: "seq_07_1280x720_",
      hdExtension: ".jpg",
      no_of_columns: 7,
      no_of_rows: 15,
      no_of_sprites: 3,
      frameWidth: 384,
      frameHeight: 216,
    },
    // 3: {
    //   idx: 3,
    //   spriteFolder: "img/final_sprites/",
    //   spritePrefix: "seq_05_7x15_",
    //   spriteExtension: ".jpg",
    //   hdFolder: "img/hd/1280_720_final/seq_05/",
    //   hdPrefix: "seq_05_1280x720_",
    //   hdExtension: ".jpg",
    //   no_of_columns: 7,
    //   no_of_rows: 15,
    //   no_of_sprites: 7,
    //   frameWidth: 384,
    //   frameHeight: 216,
    // },
  };
  
  // setup
  // setupDOM(wrapperId, framesId, controllerId, progressClass);
  setupDOM(options);
  
  // init FrameScroller & Controller objects
  myFrameScroller = new FrameScroller(options, sequences);
  myScrollController = new ScrollController(options.controllerId, myFrameScroller);
  myKeyController = new KeyController (myFrameScroller);

  myFrameScroller.setFrameCSS();

  // preload images
  preloadSprites(sequences);
  
}, false);

function setupDOM (options) {  
  // Frames
  loadFrames(options.wrapperId, options.framesId);

  // ScrollController
  loadScrollController(options.wrapperId, options.controllerId);

  // Progress bar
	if( options.progress ) {
		loadProgress(options.wrapperId, options.progressClass);
	};

  $(window).resize(function() {
    scaleFrames(options);
  });
}

function loadFrames (wrapperId, framesId) {
  $("#"+wrapperId).prepend('<div id="'+framesId+'"></div>');  
}

function loadScrollController (wrapperId, controllerId) {
  console.log("loading ScrollController");
  $("#"+wrapperId).prepend('<div id="'+controllerId+'" class="overlay"></div>');  
}

function loadProgress (wrapperId, progressClass) {
  $("#"+wrapperId).append('<div class="'+progressClass+'"><span></span></div>');
}

// reset size of frame div to fit window width
function scaleFrames(options) {
  // destroy sprite animation
  $("#"+options.framesId).destroy();
  // reset current row
  myFrameScroller.resetSpriteFrame();
  
  // Frames
  myFrameScroller.setFrameCSS();
  // TODO consider constructing sprite anew necessary?
  myFrameScroller.constructSprite();

  // Progress bar
  if( options.progress ) {
    // loadProgress to reset progress bar to current state
    loadProgress(options.wrapperId, options.progressClass);
  };
}

function preloadSprites (sequences) {

  // form array of sprite image urls
  var imgurls = [];
  for (var seqNumber in sequences) {
    var seq = sequences[seqNumber];
    for (var i = 1; i <= seq.no_of_sprites; i++) {
      var imgSrcString = seq.spriteFolder + seq.spritePrefix + i + seq.spriteExtension;
      imgurls.push(imgSrcString);
    };
  };

  $.imageloader({
    urls: imgurls,
    onComplete: function(images){
      // when load is complete
      console.log("Sprites Loaded");
    },
    onUpdate: function(ratio, image){
      // ratio: the current ratio that has been loaded
      // image: the URL to the image that was just loaded
      console.log("now loaded: ", ratio*100, "%");
    },
    onError: function(err){
      // err: error message if images couldn't be loaded
      console.log("error in imgloader: ",   err);  
    }
  });
}

// define FrameScoller prototype
// function FrameScroller (targetId, no_of_frames, progressClass) {
function FrameScroller (options, sequences) {
  _self = this;
  this.targetId = options.framesId;
  this.frameTarget;

  this.progress = $("#"+options.progressClass);
  this.fps = 0;
  // current state (row) of sprite
  this.spriteRow = 1;
  this.displayWidth;
  this.displayHeight;

  this.bShowingHD = false;

  /// Methods
  // Setup
  this.getOnFrameEvents = getOnFrameEvents;
  this.getEventFunction = getEventFunction;
  this.constructSprite = constructSprite;
  // this.preloadSeqs = preloadSeqs;
  // this.preloadSeq = preloadSeq;
  this.setFrameCSS = setFrameCSS;
  this.resetSpriteFrame = resetSpriteFrame;

  // sprite animation
  this.getFrameNumber = getFrameNumber;
  this.setFrameNumber = setFrameNumber;
  this.isPlayingForward = isPlayingForward;
  this.loadSprite = loadSprite;

  this.sequences = sequences
  this.curSequence = this.sequences[1];
  this.curSprite = 1;

  // TODO delete global var for dynamic var (available from sequences)
  this.no_of_frames = this.curSequence.no_of_columns;
  
  // this.preloadSeqs();
  // addLoadEvent(preloadSeqs);
  this.constructSprite();
  // this.setFrameNumber(0);
  


  // http://www.techrepublic.com/article/preloading-and-the-javascript-image-object/5214317
  // preload all sequences by passing them to preloadSeq(seq)
  function preloadSeqs () {
    // var cssContentString = "";

    for (var seqNumber in _self.sequences) {
      var seq = _self.sequences[seqNumber];
      imageObj = new Image();
      imageSources = new Array();
      for (var i = 1; i <= seq.no_of_sprites; i++) {
        var imgSrcString = seq.spriteFolder + seq.spritePrefix + i + seq.spriteExtension;
        console.log("now loading: ", imgSrcString);
        // set images source list
        imageSources[i] = imgSrcString;
        // preload image
        imageObj.src = imageSources[i];
      };
    };
    console.log("preload finished");
  }

  function loadSequenceFrames (wrapperId, framesId) {
    $("#"+wrapperId).prepend('<div id="'+framesId+'"></div>');
    console.log("prepended: ", '<div id="'+framesId+'"></div>');
  };

  function constructSprite () {
    this.frameTarget = $("#"+_self.targetId);
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
    return function (obj) {
      // i's are inaccurate for framenumbers, better use _self.getFrameNumber()      
      if (_self.isPlayingForward()) {
        // playing forward
        if ( (_self.getFrameNumber()) % _self.curSequence.no_of_columns == 0 ) {
          // end of spriteRow: swich to next spriteRow
          if (_self.spriteRow < _self.curSequence.no_of_rows ) {
            // advance to next row within current Sprite
            var nextRow = _self.spriteRow + 1;
          }
          else {
            // advance to next Sprite from last row of current Sprite
            var nextRow = 1;
            // set & load next sprite
            _self.setNextSprite();
            _self.setFrameCSS();
          }
          obj.spStateHeight(nextRow, _self.displayHeight);
          _self.spriteRow = nextRow;
        }
      }
      else {
        // playing backward
        if ( (_self.getFrameNumber() + 1 ) % _self.curSequence.no_of_columns == 0 ) {
          // reached beginning of spriteRow: swich to previous spriteRow
          if (_self.spriteRow > 1 ) {
            // recede to previous row within Sprite
            var prevRow = _self.spriteRow - 1;
          }
          else {
            // recede to last row of previous Sprite
            var prevRow = _self.curSequence.no_of_rows;
            // set & load prev sprite
            _self.setPrevSprite();
            _self.setFrameCSS();
          }
          obj.spStateHeight(prevRow, _self.displayHeight);
          _self.spriteRow = prevRow;  
        }
      };
      _self.updateProgress();
    };
  };

  // get current frameNumber of sprite
  function getFrameNumber () {
    if ($._spritely.instances[_self.targetId]) {
      var frameNumber = $._spritely.instances[_self.targetId]['current_frame'];
      // correct for 1 frame advanced/behind depending on playback direction
      if (_self.isPlayingForward()) {
        var realFrameNumber = frameNumber + 1;
      }
      else {
        var realFrameNumber = frameNumber - 1;
      };
      // loop forward
      if (realFrameNumber > _self.no_of_frames - 1) {
        realFrameNumber = 0;
      }
      // loop backward
      else if (realFrameNumber < 0) {
        realFrameNumber = _self.no_of_frames - 1;
      };
      return realFrameNumber;
    };
  };

  // set current frameNumber of sprite
  function setFrameNumber (n) {
    if ($._spritely.instances[_self.targetId]) {
      $._spritely.instances[_self.targetId]['current_frame'] = n-1;
    };    
  };

  function isPlayingForward () {
    return ! $._spritely.instances[_self.targetId]['options'].rewind;
  };

  function setFrameCSS () {
    // load current Sprite image
    _self.loadSprite(_self.curSprite);

    // windowfit
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var frameWidth = _self.curSequence.frameWidth;
    var frameHeight = _self.curSequence.frameHeight;

    var frameRatio = frameWidth / frameHeight;
    var windowRatio = windowWidth / windowHeight;

    if (windowRatio > frameRatio) {
      // scale to fit width
      var bgSizeValueString = String(_self.curSequence.no_of_columns*100) + "% " + "auto"
      $("#"+_self.targetId).css("background-size", bgSizeValueString);

      // set display dimensions
      _self.displayHeight = _self.curSequence.frameHeight * $(window).width() / _self.curSequence.frameWidth;
      _self.displayWidth = $(window).width();
    }
    else{
      // scale to fit height
      var bgSizeValueString = "auto " + String(_self.curSequence.no_of_rows * 100) + "%" //, " + String(scalePercentage) + "%"
      $("#"+_self.targetId).css("background-size", bgSizeValueString);

      // set display dimensions
      _self.displayHeight = $(window).height();
      _self.displayWidth = _self.curSequence.frameWidth * $(window).height() / _self.curSequence.frameHeight;
    };

    // TODO set centered
  }

  // reset variables storing current Frame
  function resetSpriteFrame () {
    _self.spriteRow = 1;
  }

  function loadSprite (idx) {
    $("#"+_self.targetId).css("background", "transparent url("+_self.curSequence.spriteFolder+_self.curSequence.spritePrefix+String(idx)+_self.curSequence.spriteExtension+") 0 0 no-repeat");
    _self.curSprite = idx;
  }

  // update Animation Dimensions to reflect window fit resizing
  // for now only width matters
  this.updateAnimationDims = function () {
    if (_self.getAnimationWidth != _self.displayWidth) {
      _self.setAnimationWidth(_self.displayWidth);  
    };
  };
  
  // update progress bar to reflect progress within sequence
  this.updateProgress = function () {
    if ( _self.progress ) {
      // calc new width of progressbar
      if (_self.getFrameNumber() >= 0) {
        var seq_no_of_frames = _self.curSequence.no_of_sprites * _self.curSequence.no_of_columns * _self.curSequence.no_of_rows;
        var curFrameInSequence = _self.getCurFrameInSeq();

        // console.log("curFrame for progress:", curFrameInSequence);
        var new_width = ( curFrameInSequence / ( seq_no_of_frames - 1) ) * window.innerWidth + 'px';
        // set progressbar width
        $(".progressDiv span").css( "width", new_width );  
      };
    };
  };  

  // Start and then stop sprite to show updated view
  this.updateView = function () {
    var curFrame = _self.getFrameNumber();
    _self.frameTarget.spStart();
    setTimeout(function () {
      _self.frameTarget.spStop();
      // set back frame to prevent unwanted advance
      _self.setFrameNumber(curFrame);
    }, 10);
  }

  // return number of current frame within sequence
  this.getCurFrameInSeq = function () {
    var curSprite = _self.curSprite;
    var no_of_rows = _self.curSequence.no_of_rows;
    var no_of_columns = _self.curSequence.no_of_columns;
    var curSpriteRow = _self.spriteRow;
    var curFrame = _self.getFrameNumber();

    // console.log("curSprite: " , curSprite );
    // console.log("no_of_rows: ", no_of_rows);
    // console.log("no_of_columns: " , no_of_columns );
    // console.log("curSpriteRow: " , curSpriteRow );
    // console.log("curFrame: ", curFrame);

    return (curSprite - 1) * no_of_rows * no_of_columns
      + (curSpriteRow - 1) * no_of_columns
      + curFrame + 1;
  }
  
  this.gettargetId = function () {
    return this.targetId;
  };
  
  this.getFPS = function () {
    return this.fps;
  };
  
  this.setFPS = function (fps) {
    // update Animation Dims (not sure why ...['options'] is undefined in scaleFrames() )
    // hack for now: works when called from here
    _self.updateAnimationDims();
    if (fps < 0) {
      $._spritely.instances[_self.targetId]['options'].rewind = true;
    }
    else {
      $._spritely.instances[_self.targetId]['options'].rewind = false;
    }
    this.fps = fps;
    this.frameTarget.fps(Math.abs(this.fps));
  };

  this.setAnimationWidth = function (width) {
    $._spritely.instances[_self.targetId]['options']['width'] = width;
  };
  
  this.getAnimationWidth = function () {
    return $._spritely.instances[_self.targetId]['options']['width'];
  };
  

  // advance sprite by n frames (n can be negative)
  // triggered by keypress
  this.advance = function (n) {
    if ($._spritely.instances[_self.targetId]) {
      _self.setFPS(0);

      var curFrame = _self.getFrameNumber();
      var nextFrame = curFrame + n;

      var deltaColumn = n % _self.no_of_frames
      var nextColumn = _self.getFrameNumber() + deltaColumn;

      var deltaRow = Math.floor(nextFrame / _self.no_of_frames);
      var nextRow = _self.spriteRow + deltaRow;

      // loop column forward
      if (nextColumn > _self.curSequence.no_of_columns - 1) {
        nextColumn = nextColumn - _self.curSequence.no_of_columns;
      }
      // loop row forward
      // NB for now, Rows start at 1, while columns start at 0
      if (nextRow > _self.curSequence.no_of_rows) {
        // reached end of sprite
        // loop row to beginning of sprite
        nextRow = nextRow - _self.curSequence.no_of_rows;
        // set & load next sprite
        _self.setNextSprite();
        _self.setFrameCSS();
      }

      // loop column backward
      if (nextColumn < 0 ) {
        nextColumn = _self.curSequence.no_of_columns + nextColumn;
      };
      // loop row backward
      // NB for now Rows start at 1, while columns start at 0
      if (nextRow < 1 ) {
        // reached beginning of sprite: redece to previous sprite

        // loop row to end of sprite
        nextRow = _self.curSequence.no_of_rows + nextRow;
        // set & load prev sprite
        _self.setPrevSprite();
        _self.setFrameCSS();
      };

      // set sprite column
      _self.setFrameNumber(nextColumn);
      
      // set sprite row
      _self.frameTarget.spStateHeight(nextRow, _self.displayHeight);
      _self.spriteRow = nextRow;

      this.updateView();
    };
    _self.updateProgress();
  };

  this.setNextSprite = function () {
    // if end of non-last sprite: advance to next sprite within sequence
    if ( _self.curSprite < _self.curSequence.no_of_sprites ) {
      // advance to next Sprite in current Sequence
      _self.curSprite += 1;
    }
    else {
      // advance to next Sequence
      _self.setNextSequence();
    }
  };

  this.setPrevSprite = function () {
    if ( _self.curSprite > 1 ) {
      // recede to previous Sprite in current Sequence
      _self.curSprite -= 1;
    }
    else {
      // recede to last Sprite in previous Sequence
      _self.setPrevSequence();
    };
  };

  this.setNextSequence = function () {
    var nextSequenceIdx;
    if (_self.curSequence.idx < Object.keys(_self.sequences).length) {
      // advance to next Sequence in line
      nextSequenceIdx = _self.curSequence.idx + 1;
    }
    else {
      // loop to first Sequence
      nextSequenceIdx = 1
    };
    _self.curSequence = _self.sequences[nextSequenceIdx];
    _self.curSprite = 1;
  };

  this.setPrevSequence = function () {
    var prevSequenceIdx;
    if (_self.curSequence.idx > 1) {
      // recede to end of previous Sequence
      prevSequenceIdx = _self.curSequence.idx - 1;
    }
    else {
      // recede to end of last Sequence
      prevSequenceIdx = Object.keys(_self.sequences).length;
    };
    
    _self.curSequence = _self.sequences[prevSequenceIdx];
    _self.curSprite = _self.curSequence.no_of_sprites;
  };

  this.hideHDImage = function () {
    if(_self.bShowingHD){
      $(".hd").remove();  
      _self.bShowingHD = false;
    }
  }

  // display HD image overlay on top of current sprite frame
  this.showHDImage = function () {   
    if (!_self.bShowingHD) {
      console.log("show HD");
      // show HD Image version of current frame
      
      // get number of current frame in sequence
      var curFrameInSequence = _self.getCurFrameInSeq() - 1;
      // TODO fix issue getCurFrameInSeq() returning 1 row too less on final column
      // Hack for now: add no_of_columns if {0,7,14,...}
      if (curFrameInSequence % _self.curSequence.no_of_columns == 0) {
        curFrameInSequence += _self.curSequence.no_of_columns;
      };

      // add padding
      var paddedFrameNum = pad(curFrameInSequence, 3);

      // format src string
      var hdSrcString = _self.curSequence.hdFolder+_self.curSequence.hdPrefix+paddedFrameNum+_self.curSequence.hdExtension;

      $('<img src="'+ hdSrcString +'" id="hdbox" class="hd transparent">').load(function() {
        thisImg = this;
        $(thisImg).appendTo('#wrapper');
        // fade in hd image (doesnt transition without timeout)
        window.setTimeout(function () {
          $(thisImg).toggleClass("transparent");
        }, 50);
      });

      _self.bShowingHD = true;  
    };
  }
};

// define ScrollController prototype
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
  
  $("#"+_self.controlId).mousewheel(function(event, delta, deltaX, deltaY) {
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
    
    // hide HD image
    this.targetFrameScroller.hideHDImage();

    // set sprite fps
    this.targetFrameScroller.setFPS(scrollSpeed);

  };
  
  this.setScrollOut = function () {
    this.lastWheelStamp = new Date().getTime();
    // console.log("this.lastWheelStamp in setScrollOut: ", this.lastWheelStamp);
    var scrollTimeoutID = window.setTimeout(_self.scrollOut, _self.scrollOutDelay);      
  };
  
  this.scrollOut = function () {
    var nowStamp = new Date().getTime();

    if ((nowStamp - _self.lastWheelStamp) >= 0.95 * _self.scrollOutDelay) {
      
      if (_self.targetFrameScroller.getFPS() > 1) {
        // var decayFactor = 0.6;
        var decayed = _self.targetFrameScroller.getFPS() * _self.decayFactor;
        // console.log("*********DECAYING LOG!!!!");
        _self.targetFrameScroller.setFPS(decayed);
        window.setTimeout(_self.scrollOut, 100);
      }
      else {
        // stop sprite frame advancement
        _self.targetFrameScroller.setFPS(0);
        // show HD image
        _self.targetFrameScroller.showHDImage();
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


// define KeyController prototype
function KeyController (targetFrameScroller) {
  // construct ScrollController
  var _self = this;
  this.targetFrameScroller = targetFrameScroller;
  
  // $(window).bind('keypress', function(e) {
  //   _self.keydownHandler(e);
  // });

  $(window).keydown(function(e) {
    _self.keydownHandler(e);
  });

  this.keydownHandler = function (e) {
    
    var code = (e.keyCode ? e.keyCode : e.which);
    // console.log("KEY pressed in handler: ", code);
    if(code == 39 || code == 40) { // "RIGHT ARROW or DOWN ARROW"
      _self.targetFrameScroller.advance(1);
    };
    if(code == 37 || code == 48) { // "LEFT ARROW or UP ARROW"
      _self.targetFrameScroller.advance(-1);
    };

    if(code == 70) { // "f"
      // console.log(_self.targetFrameScroller.getFrameNumber());
      console.log("f pressed");
      console.log("curFrameInSequence: ", _self.targetFrameScroller.getCurFrameInSeq());     
      // $("img.hd").toggleClass("transparent");
      // _self.targetFrameScroller.hideHDImage();
    };


  };   
};