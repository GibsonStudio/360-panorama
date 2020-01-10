
var dummy = new Dummy();
var debugMode = (typeof debugMode === 'undefined') ? false : debugMode;
var dummyPopup = new Popup({ title:"Hotspot Data" });
dummyPopup.addField({ label:"XML:", type:"textarea", id:"dummyInfo" });
dummyPopup.addButton({ text:"Add", callback:"addHotspot" });
dummyPopup.addButton({ type:"cancel", text:"Close" });


function addHotspot (args)
{
  console.dir(args);
}




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

  if (debugMode) {
    window.addEventListener('keydown', function (e) { dummy.keyDown(e); });
  }


  this.add = function () {
    $("#dummy-container").html('<div id="dummy" onmouseup="dummy.mouseUpMe(event);" onmousedown="dummy.mouseDownMe(event);"></div>');
  }



  this.mouseDownMe = function (e) {

    this.active = true;

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    /*
    dummy.clickedX = mouse.x;
    dummy.clickedY = mouse.y;

    dummy.clickedLon = dummy.lon;
    dummy.clickedLat = dummy.lat;
    */

    this.clickedX = mouse.x;
    this.clickedY = mouse.y;

    this.clickedLon = this.lon;
    this.clickedLat = this.lat;

  }


  this.mouseUpMe = function (e) {

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    if (mouse.x == this.clickedX && mouse.y == this.clickedY) { this.outputHotspotInfo(); }

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
    if (e.code == 'KeyH') { this.outputHotspotInfo(); }
    if (e.code == 'KeyP') { this.outputPanoInfo(); }
    if (e.code == "KeyX") { this.createXML(); }
  }


  this.reset = function () {

    this.lon = 180 - pano.lon;
    this.lat = -pano.lat;
    var p = this.getPosition();
    this.position = [p.x, p.y, p.z];

  }


  this.outputHotspotInfo = function () {

     var p = this.position;

     // round numbers
     for (var i = 0; i < 3; i++) {
       p[i] = p[i].toFixed(1) * 1;
     }

     var info = '<hotspot id="" ';
     info += 'x="' + p[0] + '" ';
     info += 'y="' + p[1] + '" ';
     info += 'z="' + p[2] + '" ';
     info += '></hotspot>';

     dummyPopup.setFieldValue("dummyInfo", info);
     dummyPopup.show();

  }


  this.outputPanoInfo = function () {

    console.log("id:" + pano.loadedScene.id);
    var info = 'lon="' + pano.lon + '" ';
    info += 'lat="' + pano.lat + '"';
    console.log(info);

  }


  this.createXML = function () {

    var xml = '<?xml version="1.0" encoding="utf-8" ?>' + "\n\n";
    xml += '<scenes>' + "\n\n";

    for (var i = 0; i < panoScenes.length; i++) {

      var s = panoScenes[i];
      var sceneTag = '<scene id="' + s.id + '" image="' + s.texture + '" lon="' + s.lon + '" lat="' + s.lat + '">';
      xml += "\t" + sceneTag + "\n";

      for (var j = 0; j < panoScenes[i].hotspots.length; j++) {

         var h = panoScenes[i].hotspots[j];
         xml += "\t\t";
         xml += '<hotspot id="' + h.id + '" ';
         xml += 'x="' + h.position[0] + '" ';
         xml += 'y="' + h.position[1] + '" ';
         xml += 'z="' + h.position[2] + '" ';
         if (h.title) { xml += 'title="'+ h.title + '" '; }
         if (h.link && h.link != h.id) { xml += 'link="'+ h.link + '" '; }
         if (h.lat) { xml += 'lat="'+ h.lat + '" '; }
         if (h.lon) { xml += 'lon="'+ h.lon + '" '; }
         xml += '></hotspot>';
         xml += "\n";

      }

      xml += "\t</scene>\n\n";

    }

    xml += "</scenes>";

    console.log(xml);

  }



  this.addHotspot = function (args) {

    console.log("ADD");

  }



}
