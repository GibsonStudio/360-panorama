


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


  this.load = function (panoSceneID, args) {

    var args = args || {};
    var clickedHotspot = args.clickedHotspot || {};

    var panoScene = this.getSceneById(panoSceneID);
    panoScene.load({ clickedHotspot:clickedHotspot });

  }


  this.getSceneById = function (sceneID) {

    for (var i = 0; i < panoScenes.length; i++) {
      var p = panoScenes[i];
      if (p.id == sceneID) { return panoScenes[i]; }
    }

    return {};

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
      panoMaterial.map = myThis.tx;
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
      panoMaterial.map = this.tx;
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
    if (clickedHotspot.lat) { pano.lat = clickedHotspot.lat; }
    if (clickedHotspot.lon) { pano.lon = clickedHotspot.lon; }

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
  this.id = args.id || 'hotspot-' + Math.random();
  this.link = args.link || this.id;

  this.img = args.img || 'hotspot-red.png';
  this.imgW = args.imgW || 50;
  this.imgH = args.imgH || 50;
  this.imgCursor = args.imgCursor || 'pointer';
  this.title = args.title || '';

  this.lat = args.lat || 0;
  this.lon = args.lon || 0;

  this.position = args.position || [0,0,430];



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
    el.onclick = function () { myThis.clicked(); };
    document.getElementById("my-overlays").appendChild(el);

  }


  this.clicked = function () {
    pano.load(this.link, { clickedHotspot:this });
  }



}
