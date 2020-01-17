

//TODO: are loading messages showing up, using jQuery? - yes, is this OK?

//TODO: git, can you have a remote on the L drive?





function Pano (args) {

  var args = args || {};
  this.active = args.active || false;
  this.clickedX = args.clickedX || 0;
  this.clickedY = args.clickedY || 0;
  this.lon = args.lon || 0;
  this.lat = args.lat || 0;
  this.length = args.length || 500;
  this.clickedLon = args.clickedLon || 0;
  this.clickedLat = args.clickedLat || 0;
  this.latMax = args.latMax || 85;

  this.autoRotate = false;
  this.mouseSpeed = 0.1; // 0.2
  this.touchSpeed = 0.1;
  this.speedMultiplier = args.speedMultiplier || this.mouseSpeed;
  this.fovMin = args.fovMin || 35;
  this.fovMax = args.fovMax || 90;
  this.fovIni = args.fovIni || 75;
  this.loadedScene = args.loadedScene || false;
  this.activeControl = false;
  this.scenes = [];
  this.mesh = false;
  this.material = false;
  this.clickedHotspot = false;


  this.load = function (panoSceneID, args) {

    var args = args || {};
    var clickedHotspot = args.clickedHotspot || {};

    var panoScene = this.getSceneById(panoSceneID);
    panoScene.load({ clickedHotspot:clickedHotspot });

  }


  this.getSceneById = function (sceneID) {

    for (var i = 0; i < this.scenes.length; i++) {
      var p = this.scenes[i];
      if (p.id == sceneID) { return this.scenes[i]; }
    }

    return {};

  }



  this.updatePosition = function () {

    var dx = mouse.x - this.clickedX;
    this.lon = this.clickedLon + (dx * this.speedMultiplier);

    var dy = this.clickedY - mouse.y;
    this.lat = pano.clickedLat + (dy * this.speedMultiplier);
    this.lat = Math.max(Math.min(this.lat, this.latMax), -this.latMax);

  }


  this.getPosition = function (thisLon, thisLat) {

    var p = {};
    var hL = Math.cos(THREE.Math.degToRad(thisLat)) * pano.length;
    p.x = -Math.sin(THREE.Math.degToRad(thisLon)) * hL;
    p.y = Math.sin(THREE.Math.degToRad(thisLat)) * pano.length;
    p.z = Math.cos(THREE.Math.degToRad(thisLon)) * hL;
    return p;

  }


  this.toScreenPosition = function (myPos, cam) {

    var pos = new THREE.Vector3(myPos[0], myPos[1], myPos[2]);
    var vec = pos.project(cam);

    var myX = (vec.x + 1) / 2 * WIDTH;
    var myY = -(vec.y - 1) / 2 * HEIGHT;

    if (vec.z > 1) {
      myX = -200;
      myY = -200;
    }

    return { x: myX, y: myY };

  }


  this.toggleAutorotate = function () {
    this.autoRotate = !this.autoRotate;
  }

}



function PanoScene (args) {

  var args = args || {};
  this.id = args.id || 'pano-scene';
  this.texture = args.texture || this.id + '.jpg';
  this.hotspots = args.hotspots || [];
  this.lat = args.lat || 0;
  this.lon = args.lon || 0;

  this.tx = false;
  this.loader = false;



  this.loadTexture = function (args) {

    var args = args || {};
    var clickedHotspot = args.clickedHotspot || {};
    var myThis = this;
    $("#loading-message").show();

    this.loader = new THREE.TextureLoader().load('img\\' + this.texture, function (texture) {
      myThis.tx = texture;
      pano.material.map = myThis.tx;
      myThis.ini({ clickedHotspot:clickedHotspot });
      $("#loading-message").hide();
    });

  }




  this.getHotspotById = function (id) {
    for (var i = 0; i < this.hotspots.length; i++) {
      if (this.hotspots[i].id == id) { return this.hotspots[i]; }
    }
    return false;
  }



  this.load = function (args) {

    var args = args || {};
    var clickedHotspot = args.clickedHotspot || {};
    $("#my-overlays").html("");

    // load scene texture?
    if (!this.tx) {
      this.loadTexture({ clickedHotspot:clickedHotspot });
    } else {
      pano.material.map = this.tx;
      this.ini({ clickedHotspot:clickedHotspot });
    }

  }



  this.ini = function (args) {

    var args = args || {};
    var clickedHotspot = args.clickedHotspot || {};

    // move to default position
    pano.lat = this.lat;
    pano.lon = this.lon;

    // override position with hotspot data?
    if (clickedHotspot.sceneLon) { pano.lon = clickedHotspot.sceneLon; }
    if (clickedHotspot.sceneLat) { pano.lat = clickedHotspot.sceneLat; }

    // reset zoom (camera fov)
    camera.fov = pano.fovIni;
    camera.updateProjectionMatrix();

    this.addHotspots();

    pano.loadedScene = this;

  }


  this.addHotspots = function () {

    for (var i = 0; i < this.hotspots.length; i++) {
      this.hotspots[i].addToOverlays();
    }

  }



  this.addHotspot = function (args, addToOverlays) {

    var args = args || {};
    var addToOverlays = addToOverlays || false;
    var hs = new PanoHotspot(args);

    this.hotspots.push(hs);

    if (addToOverlays) { hs.addToOverlays(); }

  }



}


function PanoHotspot (args) {

  var args = args || {};
  this.id = args.id || 'hotspot-' + Math.round(Math.random() * 100000);
  this.link = args.link || this.id;

  this.img = args.img || 'hotspot-red.png';
  this.imgW = args.imgW || 50;
  this.imgH = args.imgH || 50;
  this.imgCursor = args.imgCursor || 'pointer';
  this.title = args.title || '';

  this.lat = args.lat || 0;
  this.lon = args.lon || 0;
  this.sceneLon = args.sceneLon || 0;
  this.sceneLat = args.sceneLat || 0;

  this.beingDragged = false;
  this.distanceFromOrigin = args.distanceFromOrigin || 500;

  this.clickedX = args.clickedX || 0;
  this.clickedY = args.clickedY || 0;
  this.clickedLon = args.clickedLon || 0;
  this.clickedLat = args.clickedLat || 0;
  this.latMax = args.latMax || 85;
  this.speedMultiplier = 0.1;

  var p = pano.getPosition(this.lon, this.lat);
  this.position = [p.x, p.y, p.z];

  this.addToOverlays = function () {

    var el = document.createElement("div");
    el.id = "overlay-" + this.id;

    el.style.setProperty("width", this.imgW + "px");
    el.style.setProperty("height", this.imgH + "px");
    el.style.setProperty("background-image", "url(img-system/" + this.img + ")");
    el.style.setProperty("background-size", "100% 100%");
    el.style.setProperty("position", "absolute");
    el.style.setProperty("left", "100px");
    el.style.setProperty("top", "100px");
    if (this.imgCursor) { el.style.setProperty("cursor", this.imgCursor); }

    if (this.title) { el.title = this.title; }
    var myThis = this;

    if (debugMode) {
      el.onmouseup = function (event) { myThis.mouseUpMe(event); }
      el.onmousedown = function (event) { myThis.mouseDownMe(event); }
    } else {
      el.onmousedown = function (event) { myThis.clicked(event); }
    }

    document.getElementById("my-overlays").appendChild(el);

  }


  this.getXML = function () {

    var xml = '<hotspot id="' + this.id + '" ';
    xml += 'lon="' + (this.lon).toFixed(2) + '" ';
    xml += 'lat="' + (this.lat).toFixed(2) + '" ';
    if (this.title) { xml += 'title="'+ this.title + '" '; }
    if (this.link && this.link != this.id) { xml += 'link="'+ this.link + '" '; }
    if (this.sceneLat) { xml += 'sceneLat="'+ this.sceneLat + '" '; }
    if (this.sceneLon) { xml += 'sceneLon="'+ this.sceneLon + '" '; }
    xml += '></hotspot>';

    return xml;

  }



  this.delete = function () {

    // remove object
    for (var i = 0; pano.loadedScene.hotspots.length; i++) {
      if (pano.loadedScene.hotspots[i] == this) {
        pano.loadedScene.hotspots.splice(i, 1);
        break;
      }
    }

    // remove html element
    var hel = document.getElementById("overlay-" + this.id);
    document.getElementById("my-overlays").removeChild(hel);

  }



  this.clicked = function () {
    pano.load(this.link, { clickedHotspot:this });
  }



  this.mouseUpMe = function (e) {

    this.beingDragged = false;

    try {
      mouse.x = e.clientX || e.touches[0].clientX;
      mouse.y = e.clientY || e.touches[0].clientY;
    } catch (err) {
      console.log("Event ERROR");
    }

    if (mouse.x == this.clickedX && mouse.y == this.clickedY) {

      if (debugMode) {

        pano.clickedHotspot = this;
        var hp = new Popup({ id:"hotspot-options", title:"Hotspot Options:" });
        hp.addField({ label:"ID", id:"id", value:this.id });
        hp.addField({ label:"Link", id:"link", value:this.link });
        hp.addField({ label:"Title", id:"title", value:this.title });
        hp.addField({ label:"Scene Lon", id:"sceneLon", type:"number", value:this.sceneLon });
        hp.addField({ label:"Scene Lat", id:"sceneLat", type:"number", value:this.sceneLat });

        hp.addButton({ text:"Navigate To", callback:"panoHotspotClicked" });
        hp.addButton({ text:"Update", callback:"panoHotspotUpdate" });
        hp.addButton({ text:"Show XML", callback:"panoHotspotShowXML" });
        hp.addButton({ text:"Delete", callback:"panoHotspotDelete"});
        hp.addButton({type:"cancel" });
        hp.show();

      } else {
        pano.load(this.link, { clickedHotspot:this });
      }

    }

  }



  this.mouseDownMe = function (e) {

    if (!debugMode) { return false; }

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


  // called by requestAnimationFrame in lib.js
  this.animate = function () {

    // is it being dragged?
    if (this.beingDragged) {
      var p = pano.getPosition(this.lon, this.lat);
      this.position = [p.x, p.y, p.z];
    }

    this.positionMyElement();

  }



  // positions the html element on the screen
  this.positionMyElement = function () {

    var pos = pano.toScreenPosition(this.position, camera);
    var xPos = pos.x - (50 / 2);
    var yPos = pos.y - (50 / 2);
    $('#overlay-' + this.id).css({ 'left': xPos + 'px', 'top': yPos + 'px' });

  }


  // called by eventMove in lib.js
  this.eventMove = function () {

    var dx = mouse.x - this.clickedX;
    this.lon = this.clickedLon + (dx * this.speedMultiplier);

    var dy = this.clickedY - mouse.y;
    this.lat = this.clickedLat + (dy * this.speedMultiplier);
    this.lat = Math.max(Math.min(this.lat, this.latMax), -this.latMax);

  }


}












//
