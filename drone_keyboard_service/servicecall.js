/**  This version has been modified to include drone service calls, takeoff & land
 *   changes written by Alice Lux Fawzi
 */

var SERVICECALL = SERVICECALL || {
  REVISION : '1'
};

/**
 * @AUTHOR Alice Fawzi 
 */

/**
 * calls a service when keyboard button is pressed
 *
 * @constructor
 * @param options - possible keys include:
 *   * ros - the ROSLIB.Ros connection handle
 */

SERVICECALL.Teleop = function(options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var topic = options.topic || '/cmd_vel';
  
  var toggleCam = new ROSLIB.Service({
      ros : ros,
      name : '/ardrone/togglecam',
      serviceType : 'std_srvs/Empty'
  });

  var toggleCamRequest = new ROSLIB.ServiceRequest({});

  var animation = new ROSLIB.Service({
      ros : ros,
      name : '/ardrone/setflightanimation',
      serviceType : 'ardrone_autonomy/FlightAnim',
     // serviceDuration : 0
  });

  var animationRequest = new ROSLIB.ServiceRequest({
	type : 0,
	duration : 0
  });

  // sets up a key listener on the page used for keyboard teleoperation
  var handleKey = function(keyCode, keyDown) {

    // check which key was pressed
    switch (keyCode) {
      case 16:
	//shift =  toggle camera
        if (keyDown === true) {
		toggleCam.callService(toggleCamRequest, function(result){
			console.log('Call Service: ' + toggleCam.name);
		});
	}
	break;
      case 49:
	// 1 = no  
	animationRequest.type = 13;
	animation.callService(animationRequest, function(result){	
	   console.log('Call Service: ' + 'shake no: ' + animationRequest.type);
	});
	break;
      case 50:
	// 2 = forward flip (16)
	animationRequest.type = 16;
	animation.callService(animationRequest, function(result){
           console.log('Call Service: ' + 'fw flip: '+ animationRequest.type );
	});
	break;
      case 51:
	// 3 = stuter noise (8)
	animationRequest.type = 8;
	animation.callService(animationRequest, function(result){
	   console.log('Call Service: '+ 'stutter noise: '+ animationRequest.type );
	});
	break;
    }
  };
  // handle the key
  var body = document.getElementsByTagName('body')[0];
  body.addEventListener('keydown', function(e) {
    handleKey(e.keyCode, true);
   // console.log('service keydown: '+ e.keyCode);
  }, false);
  body.addEventListener('keyup', function(e) {
    handleKey(e.keyCode, false);
   // console.log('service keyup: '+ e.keyCode);
  }, false);
};

/*  this is an index of service calls
*1 = shake right
*2 = yes, down front
*3 = down back
*4 = big back dip
*5 = similar to 4
*6 = turn 90 and pause 4x (turnaround)
*7 = similar to 6
*8 = stutter noise
*9 = slight shake no
*10 = similar to 1 but both sides 4x
*11 = fw/back shake 4x
*12 = nothing?
*13 = saucer
*14 = L,R,F,R twitches
*15 = 14 x2 each
*16 = fw flip
*17 = back flip
*18 = left flip
*19 = right flip
*/

SERVICECALL.Teleop.prototype.__proto__ = EventEmitter2.prototype;

