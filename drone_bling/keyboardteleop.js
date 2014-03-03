/**  This version has been modified to include drone service calls, takeoff & land
 *   changes written by Alice Lux Fawzi
 */

var KEYBOARDTELEOP = KEYBOARDTELEOP || {
  REVISION : '2'
};

/**
 * @author Russell Toris - rctoris@wpi.edu
 */

/**
 * Manages connection to the server and all interactions with ROS.
 *
 * Emits the following events:
 *   * 'change' - emitted with a change in speed occurs
 *
 * @constructor
 * @param options - possible keys include:
 *   * ros - the ROSLIB.Ros connection handle
 *   * topic (optional) - the Twist topic to publish to, like '/cmd_vel'
 *   * throttle (optional) - a constant throttle for the speed
 */
KEYBOARDTELEOP.Teleop = function(options) {
  var that = this;
  options = options || {};
  var ros = options.ros;
  var topic = options.topic || '/cmd_vel';
  // permanent throttle
  var throttle = options.throttle || 1.0;

  // used to externally throttle the speed (e.g., from a slider)
  this.scale = 1.0;

  // linear x and y movement and angular z movement
  var x = 0;
  var y = 0;
  var z = 0;
  var up = 0;

  var cmdVel = new ROSLIB.Topic({
    ros : ros,
    name : topic,
    messageType : 'geometry_msgs/Twist'
  });
  
  var takeoff = new ROSLIB.Topic({
      ros : ros,
      name : '/ardrone/takeoff',
      messageType : 'std_msgs/Empty'
    });

  var land = new ROSLIB.Topic({
      ros : ros,
      name : '/ardrone/land',
      messageType : 'std_msgs/Empty'
    });

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
    // used to check for changes in speed
    var oldX = x;
    var oldY = y;
    var oldZ = z;
    var oldUp = up;

    var speed = 0;
    // throttle the speed by the slider and throttle constant
    if (keyDown === true) {
      speed = throttle * that.scale;
    }
    // check which key was pressed
    switch (keyCode) {
      case 65:
        // a, turn left
        z = 1 * speed;
        break;
      case 87:
        // w, fwd
        x = 1 * speed;
        break;
      case 68:
        // d, turn right
        z = -1 * speed;
        break;
      case 83:
        // s, back
        x = -1 * speed;
        break;
      case 69:
        // e, strafe right
        y = -0.5 * speed;
        break;
      case 81:
        // q, strafe left
        y = 0.5 * speed;
        break;
      case 73:
        // i, up
        up = 1 * speed;
	z = 0;
        break;
      case 75:
        // k, down
        up = -1 * speed;
	z = 0;
        break;
      case 13:
        // enter, takeoff
        y = 0.0;
        x = 0.0;
        z = 0.0;
	up= 0.0;
        takeoff.publish();
        break;
      case 32:
        // spacebar, land
        y = 0.0;
        x = 0.0;
        z = 0.0;
	up= 0.0;
        land.publish();
        break;
      case 16:
	//shift =  toggle camera

        if (keyDown === true) {
   
		toggleCam.callService(toggleCamRequest, function(result){
			console.log('Result for service call on ' 
			+ toggleCam.name);
		});
	}
	break;
      case 49:
	// 1 = no  
	animationRequest.type = 13;
	animation.callService(animationRequest, function(result){
		console.log('Result for service call on ' 
		+ 'shake no: ' + animationRequest.type);
	});
	break;
      case 50:
	// 2 = forward flip (16)
	animationRequest.type = 16;
	animation.callService(animationRequest, function(result){
		console.log('Result for service call on ' 
		+ 'fw flip: '+ animationRequest.type );
	});
	break;
      case 51:
	// 3 = stuter noise (8)
	animationRequest.type = 8;
	animation.callService(animationRequest, function(result){
		console.log('Result for service call on ' 
		+ 'stutter noise: '+ animationRequest.type );
	});
	break;
    }

    // publish the command
    var twist = new ROSLIB.Message({
      angular : {
        x : 0,
        y : 0,
        z : z
      },
      linear : {
        x : x,
        y : y,
        z : up
      }
    });
    cmdVel.publish(twist);

    // check for changes
    if (oldX !== x || oldY !== y || oldZ !== z || oldUp != up) {
      that.emit('change', twist);
      console.log('throttle change:  '+ oldX + oldY + oldZ + oldUp);
    }
  };

  // handle the key
  var body = document.getElementsByTagName('body')[0];
  body.addEventListener('keydown', function(e) {
    handleKey(e.keyCode, true);
    console.log('keydown: '+ e.keyCode);
  }, false);
  body.addEventListener('keyup', function(e) {
    handleKey(e.keyCode, false);
    console.log('keyup: '+ e.keyCode);
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

KEYBOARDTELEOP.Teleop.prototype.__proto__ = EventEmitter2.prototype;

