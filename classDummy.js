
var dummy = new Dummy();
var enableDummy = (typeof enableDummy === 'undefined') ? false : enableDummy;


function Dummy (args) {

  var args = args || {};
  this.active = false;
  this.speedFactor = args.speedFactor || 0.5;
  this.distanceFromOrigin = args.distanceFromOrigin || 430;

  this.lat = args.lat || 0;
  this.lon = args.lon || 0;

  this.clickedX = args.clickedX || 0;
  this.clickedY = args.clickedY || 0;
  this.clickedLon = args.clickedLon || 0;
  this.clickedLat = args.clickedLat || 0;
  this.latMax = args.latMax || 85;
  this.speedMultiplier = 0.1;

  this.position = args.position || [0, 0, this.distanceFromOrigin];

  if (enableDummy) {
    window.addEventListener('keydown', function (e) { dummy.keyDown(e); });
  }


  this.add = function () {
    $("#dummy-container").html('<div id="dummy" onmousedown="dummy.mouseDownMe(event);"></div>');
  }



  this.mouseDownMe = function (e) {

    this.active = true;

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    dummy.clickedX = mouse.x;
    dummy.clickedY = mouse.y;

    dummy.clickedLon = dummy.lon;
    dummy.clickedLat = dummy.lat;

  }


  this.update = function () {

    // is it being dragged?
    if (this.active) {
      var p = this.getPosition();
      this.position = [p.x, p.y, p.z];
    }

    this.positionMe();

  }


  // turns lat and lon into X,Y,Z in 3D space
  this.getPosition = function () {

    var p = {};
    var hL = Math.cos(THREE.Math.degToRad(this.lat)) * this.distanceFromOrigin; //pano.length;
    p.x = -Math.sin(THREE.Math.degToRad(this.lon)) * hL;
    p.y = Math.sin(THREE.Math.degToRad(this.lat)) * this.distanceFromOrigin; //pano.length;
    p.z = Math.cos(THREE.Math.degToRad(this.lon)) * hL;
    return p;

  }


  // called by eventMove
  this.updatePosition = function () {

    var dx = mouse.x - dummy.clickedX;
    dummy.lon = dummy.clickedLon + (dx * dummy.speedMultiplier);

    var dy = dummy.clickedY - mouse.y;
    dummy.lat = dummy.clickedLat + (dy * dummy.speedMultiplier);
    dummy.lat = Math.max(Math.min(dummy.lat, dummy.latMax), -dummy.latMax);

  }


  // positions the html element on the screen
  this.positionMe = function () {

    var pos = pano.toScreenPosition(this.position, camera);
    var xPos = pos.x - (50 / 2);
    var yPos = pos.y - (50 / 2);
    $('#dummy').css({ 'left': xPos + 'px', 'top': yPos + 'px' });

  }



  this.keyDown = function (e) {
    if (e.code == 'KeyR') { this.reset(); }
    if (e.code == 'KeyI') { this.outputInfo(); }
  }


  this.reset = function () {

    this.lon = 180 - pano.lon;
    this.lat = -pano.lat;
    var p = this.getPosition();
    this.position = [p.x, p.y, p.z];

  }


  this.outputInfo = function () {

     var p = this.position;

     // round numbers
     for (var i = 0; i < 3; i++) {
       p[i] = p[i].toFixed(2) * 1;
     }

     var info = 'panoScene.hotspots.push(new PanoHotspot({ id:\'ID\', ';
     info += 'position:[' + p[0] + ',' + p[1] +',' + p[2] + ']';
     info += ' }));';

     console.log(info);

  }




}
