/**  This version has been modified to include drone takeoff & land
 * @author Russell Toris - rctoris@wpi.edu
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
    }
  };

  // handle the key
  var body = document.getElementsByTagName('body')[0];
  body.addEventListener('keydown', function(e) {
    handleKey(e.keyCode, true);
  }, false);
  body.addEventListener('keyup', function(e) {
    handleKey(e.keyCode, false);
  }, false);
};
KEYBOARDTELEOP.Teleop.prototype.__proto__ = EventEmitter2.prototype;
