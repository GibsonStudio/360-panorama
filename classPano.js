


//TODO: in debug mode, press A to add new hotspot add to array
//TODO: in debug mode, click hotspot to display dialog, CLOSE, DELETE, GOTO SCENE
//TODO: make hotspots draggable in debugMode
//TODO: rewrite code so hotspot.lat and hotspot.lon define position
//      same for dummy

//TODO: hotspot lon and lat need changing - used to be used to set start position of scene, rename to sceneLon, sceneLat?


// DONE
// make write XML from array function


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
  this.loadedScene = args.loadedScene || '';
  this.activeControl = false;
  this.scenes = [];
  this.mesh = false;
  this.material = false;
  this.dragObject = false; // ref to the currently dragged hotspot


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

  this.runFullscreen = function () {
    document.getElementById("my-container").requestFullscreen();
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
    console.log(clickedHotspot);

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

  //this.active = false;
  //this.clickedX = args.clickedX || 0;
  //this.clickedY = args.clickedY || 0;
  //this.clickedLon = args.clickedLon || 0;
  //this.clickedLat = args.clickedLat || 0;
  //this.latMax = args.latMax || 85;
  //this.speedMultiplier = 0.1;

  //this.distanceFromOrigin = args.distanceFromOrigin || 500;

  //this.position = args.position || [0,0, this.distanceFromOrigin];


  //TODO dummy vars need moving to hotspot
  /*
  this.updatePosition = function () {

    var dx = mouse.x - this.clickedX;
    this.lon = this.clickedLon + (dx * this.speedMultiplier);

    var dy = this.clickedY - mouse.y;
    this.lat = this.clickedLat + (dy * this.speedMultiplier);
    this.lat = Math.max(Math.min(this.lat, this.latMax), -this.latMax);

  }
  */


  this.addToOverlays = function () {

    var el = document.createElement("div");
    el.id = "overlay-" + this.id;
    var s = 'width:' + this.imgW + 'px; height:' + this.imgH + 'px;';
    s += 'background-image:url(img-system/' + this.img + ');';
    s += 'background-size: 100% 100%;';
    if (this.imgCursor) { s += 'cursor:' + this.imgCursor + ';'; }
    s += 'position:absolute;left:100px;top:300px;"';
    el.style = s;
    if (this.title) { el.title = this.title; }
    var myThis = this;
    //el.onclick = function () { myThis.clicked(); };
    //el.onmouseup = function () { myThis.mouseUp(); }
    el.onmousedown = function (event) { myThis.mouseDown(event); }
    document.getElementById("my-overlays").appendChild(el);

  }


  this.clicked = function () {
    //pano.load(this.link, { clickedHotspot:this });
    console.dir("WHAT");
    pano.dragObject = this;
  }


  this.mouseDown = function (e) {

    pano.load(this.link, { clickedHotspot:this });

    /*
    console.dir(this);
    pano.dragObject = this;
    this.active = true;

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
    */

  }


  this.mouseUp = function () {
    console.log("UP");
  }



}
