


var dummy = new Dummy();
var debugMode = (typeof debugMode === 'undefined') ? false : debugMode;
var dummyPopup = new Popup({ title:"Hotspot Data" });
dummyPopup.addField({ label:"ID", id:"id" });
dummyPopup.addField({ label:"Link", id:"link" });
dummyPopup.addField({ label:"Title", id:"title" });
dummyPopup.addField({ label:"XML:", type:"textarea", id:"dummyInfo" });
dummyPopup.addButton({ text:"Add", callback:"addHotspot" });
dummyPopup.addButton({ type:"cancel", text:"Close" });


function addHotspot (args)
{

  var id = "";
  var link = "";
  var title = "";

  for (var i = 0; i < args.length; i++) {
    if (args[i].id == "id") { id = args[i].value; }
    if (args[i].id == "link") { link = args[i].value; }
    if (args[i].id == "title") { title = args[i].value; }
  }

  pano.loadedScene.addHotspot({ id:id, link:link, title:title, lon:dummy.lon, lat:dummy.lat }, true);

}




function Dummy (args) {

  var args = args || {};
  this.beingDragged = false;
  this.distanceFromOrigin = args.distanceFromOrigin || 500;

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

    var myThis = this;

    var d = document.createElement("div");
    d.id = "dummy";
    d.onmouseup = function (event) { myThis.mouseUpMe(event); }
    d.onmousedown = function (event) { myThis.mouseDownMe(event); }
    document.getElementById("dummy-container").appendChild(d);

  }



  this.mouseDownMe = function (e) {

    e.preventDefault();

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    this.clickedX = mouse.x;
    this.clickedY = mouse.y;

    this.clickedLon = this.lon;
    this.clickedLat = this.lat;

    this.beingDragged = true;

  }


  this.mouseUpMe = function (e) {

    this.beingDragged = false;

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    if (mouse.x == this.clickedX && mouse.y == this.clickedY) { this.outputHotspotInfo(); }

  }


  // called by requestAnimationFrame in lib.js
  this.animate = function () {

    // is it being dragged?
    if (this.beingDragged) {
      var p = pano.getPosition(this.lon, this.lat);
      this.position = [p.x, p.y, p.z];
    }

    this.positionMyElement();

  }


  // called by eventMove in lib.js
  this.eventMove = function () {

    var dx = mouse.x - this.clickedX;
    this.lon = this.clickedLon + (dx * this.speedMultiplier);

    var dy = this.clickedY - mouse.y;
    this.lat = this.clickedLat + (dy * this.speedMultiplier);
    this.lat = Math.max(Math.min(this.lat, this.latMax), -this.latMax);

  }


  // positions the html element on the screen
  this.positionMyElement = function () {

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
    var p = pano.getPosition(this.lon, this.lat);
    this.position = [p.x, p.y, p.z];

  }


  this.outputHotspotInfo = function () {

     var info = '<hotspot id="" ';
     info += 'lon="' + (this.lon).toFixed(2) + '" ';
     info += 'lat="' + (this.lat).toFixed(2) + '" ';
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

    for (var i = 0; i < pano.scenes.length; i++) {

      var s = pano.scenes[i];
      var sceneTag = '<scene id="' + s.id + '" image="' + s.texture + '" lon="' + s.lon + '" lat="' + s.lat + '">';
      xml += "\t" + sceneTag + "\n";

      for (var j = 0; j < pano.scenes[i].hotspots.length; j++) {

         var h = pano.scenes[i].hotspots[j];
         xml += "\t\t";
         xml += '<hotspot id="' + h.id + '" ';
         xml += 'lon="' + (h.lon).toFixed(2) + '" ';
         xml += 'lat="' + (h.lat).toFixed(2) + '" ';
         if (h.title) { xml += 'title="'+ h.title + '" '; }
         if (h.link && h.link != h.id) { xml += 'link="'+ h.link + '" '; }
         if (h.sceneLat) { xml += 'sceneLat="'+ h.sceneLat + '" '; }
         if (h.sceneLon) { xml += 'sceneLon="'+ h.sceneLon + '" '; }
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
