



var popup;

// config vars
//var dummy = (typeof dummy === 'undefined') ? {} : dummy;
var debugMode = (typeof debugMode === 'undefined') ? false : debugMode;
var resizeCanvas = true;
var WIDTH = 800; // these display sizes are used if resizeCanvas = false;
var HEIGHT = 600; // size for Storyline, 980 x 524
var preloadImages = false;

var mouse = {};
mouse.x = 0;
mouse.y = 0;

var container, camera, scene, renderer, mesh;
var pano = new Pano(); // global ref must me called pano











function loadXML ()
{

  $.ajax({
    url:"scenes.xml",
    type:"GET",
    dataTYpe:"xml"
  }).done(function (data) { parseXML(data); });

}




function parseXML (data)
{

  console.log("XML loaded, parsing....");

  $(data).find("scene").each(function () {

    var id = $(this).attr("id");
    var img = $(this).attr("image");
    var lon = parseFloat($(this).attr("lon"));
    var lat = parseFloat($(this).attr("lat"));

    var panoScene = new PanoScene({ id:id, texture:img, lon:lon, lat:lat });

    $(this).find("hotspot").each(function () {

      var args = {};
      args.id = $(this).attr("id");
      args.link = $(this).attr("link");
      args.title = $(this).attr("title");
      args.lon = parseFloat($(this).attr("lon"));
      args.lat = parseFloat($(this).attr("lat"));
      args.sceneLon = parseFloat($(this).attr("sceneLon"));
      args.sceneLat = parseFloat($(this).attr("sceneLat"));

      panoScene.addHotspot(args);

    });

    pano.scenes.push(panoScene);

  });

  init();

}


/*
function parseXMLOLD (data)
{

  console.log("XML loaded....");

  $(data).find("scene").each(function () {

    var id = $(this).attr("id");
    var img = $(this).attr("image");
    var lon = parseFloat($(this).attr("lon"));
    var lat = parseFloat($(this).attr("lat"));

    var panoScene = new PanoScene({ id:id, texture:img, lon:lon, lat:lat });

    $(this).find("hotspot").each(function () {

      var id = $(this).attr("id");
      var link = $(this).attr("link");
      var title = $(this).attr("title");
      var lon = parseFloat($(this).attr("lon"));
      var lat = parseFloat($(this).attr("lat"));
      var sceneLon = parseFloat($(this).attr("sceneLon"));
      var sceneLat = parseFloat($(this).attr("sceneLat"));

      var hs = new PanoHotspot({ id:id, lon:lon, lat:lat, sceneLon:sceneLon, sceneLat:sceneLat });
      if (link) { hs.link = link; }
      if (title) { hs.title = title; }
      panoScene.hotspots.push(hs);

    });

    pano.scenes.push(panoScene);

  });

  init();

}
*/




function animate ()
{

  window.requestAnimationFrame(animate);

  checkControls();
  positionCamera();

  renderer.render(scene, camera);

  positionOverlays();
  //if (debugMode) { dummy.animate(); }

}



function positionCamera ()
{
  camera.rotation.set(0, toRads(pano.lon), 0);
  camera.rotateX(-toRads(pano.lat));
}


function toRads (ang) { return (ang / 180) * Math.PI; }


function init ()
{

  if (resizeCanvas) {
    resizeMe();
  } else {
    $('#my-container').width(WIDTH);
    $('#my-container').height(HEIGHT);
  }

  if (debugMode) { iniDebug(); }

  container = document.getElementById('my-canvas-container');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( pano.fovIni, WIDTH / HEIGHT, 1, 1100);
  camera.target = new THREE.Vector3(0, 0, 0);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  renderer.domElement.id = 'my-canvas';

  container.appendChild(renderer.domElement);

  // add environment sphere and apply texture
  var geometry = new THREE.SphereBufferGeometry(pano.length, 60, 40);
  geometry.scale(-1, 1, 1);

  var texture = new THREE.Texture();
  pano.material = new THREE.MeshBasicMaterial({ map:texture });
  pano.mesh = new THREE.Mesh( geometry, pano.material );
  pano.mesh.rotation.y = THREE.Math.degToRad(90); // so it starts in the center

  scene.add(pano.mesh);

  //if (debugMode) { dummy.add(); }

  // window resize event
  if (resizeCanvas) { window.addEventListener('resize', function (e) { resizeMe(); }); }

  var canvasEl = document.getElementById("my-canvas-container"); // ("my-container");

  // mouse event handlers
  canvasEl.addEventListener('mousedown', function (e) { panoClicked(e); });
  document.addEventListener('mousemove', function (e) { eventMove(e); });
  document.addEventListener('mouseup', function (e) { eventStop(e); });
  document.addEventListener('wheel', function (e) { eventWheel(e); });

  // touch event handlers
  canvasEl.addEventListener('touchstart', panoClicked);
  canvasEl.addEventListener('touchmove', eventMove);
  canvasEl.addEventListener('touchend', eventStop);

  pano.scenes[0].load();

  animate();

}




function checkControls ()
{

  if (pano.activeControl) { pano.active = false; }

  if (pano.activeControl == 'move-left') { pano.lon += 1; }
  else if (pano.activeControl == 'move-right') { pano.lon -= 1; }
  else if (pano.activeControl == 'move-up') { pano.lat -= 1; }
  else if (pano.activeControl == 'move-down') { pano.lat += 1; }
  else if (pano.activeControl == 'zoom-in') {
    var fov = camera.fov - 1;
    camera.fov = THREE.Math.clamp(fov, pano.fovMin, pano.fovMax);
    camera.updateProjectionMatrix();
  }
  else if (pano.activeControl == 'zoom-out') {
    var fov = camera.fov + 1;
    camera.fov = THREE.Math.clamp(fov, pano.fovMin, pano.fovMax);
    camera.updateProjectionMatrix();
  }

  if (pano.autoRotate) { pano.lon -= 0.4; }

  if (pano.lat > pano.latMax) { pano.lat = pano.latMax; }
  if (pano.lat < -pano.latMax) { pano.lat = -pano.latMax; }
  if (pano.lon < 0) { pano.lon += 360; }
  if (pano.lon > 360) { pano.lon -= 360; }

}




function ToggleHelp ()
{
  $("#help").toggle();
}



function toggleFullscreen ()
{

  if (!document.fullscreenElement && !document.mozFullScreenElement
    && !document.webkitFullscreenElement && !document.msFullscreenElement ) {

    enterFullscreen();

  } else {

    exitFullscreen();

  }

}



function enterFullscreen ()
{

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.mozRequestFullScreen) {
    document.documentElement.mozRequestFullScreen(); // Firefox
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen(); // Chrome and Safari
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen(); // IE
  }

}



function exitFullscreen ()
{

  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }

}






function positionOverlays ()
{

  if (!pano.loadedScene) { return false; }

  for (var i = 0; i < pano.loadedScene.hotspots.length; i++) {

    var hs = pano.loadedScene.hotspots[i];
    hs.animate();

  }

}




function resizeMe ()
{
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  $('#my-container').width(WIDTH);
  $('#my-container').height(HEIGHT);
  $('#my-canvas').width(WIDTH);
  $('#my-canvas').height(HEIGHT);

  // move controls
  var cL = $("#controls-container").width();
  var cL = (WIDTH / 2) - (cL / 2);
  $("#controls-container").css({ 'left': cL + 'px' });

}






function panoClicked (e)
{

  e.preventDefault();

  // need to re-capture mouse for touch eventStop
  try {
    mouse.x = e.clientX || e.touches[0].clientX;
    mouse.y = e.clientY || e.touches[0].clientY;
  } catch (err) {
  }

  pano.active = true;

  if (e.touches) {
    pano.speedMultiplier = pano.touchSpeed;
  } else {
    pano.speedMultiplier = pano.mouseSpeed;
  }

  pano.clickedX = mouse.x;
  pano.clickedY = mouse.y;

  pano.clickedLon = pano.lon;
  pano.clickedLat = pano.lat;

}



function eventMove (e)
{

  //e.preventDefault(); // this was stopping the selecting of text in a popup

  try {
    mouse.x = e.clientX || e.touches[0].clientX;
    mouse.y = e.clientY || e.touches[0].clientY;
  } catch (err) {}

  if (!pano.loadedScene) { return false; }

  if (pano.active) { pano.updatePosition(); }

  for (var i = 0; i < pano.loadedScene.hotspots.length; i++) {
    if (pano.loadedScene.hotspots[i].beingDragged) {
      pano.loadedScene.hotspots[i].eventMove();
    }
  }

  //if (dummy.beingDragged) { dummy.eventMove(); }

}



function eventStop (e)
{

  //e.preventDefault(); // is this needed?
  pano.activeControl = false;
  var clickTolerance = 2;
  pano.active = false;

  for (var i = 0; i < pano.loadedScene.hotspots.length; i++) {
    pano.loadedScene.hotspots[i].beingDragged = false;
  }

  if ((Math.abs(pano.clickedX - mouse.x) <= clickTolerance) && (Math.abs(pano.clickedY - mouse.y) <= clickTolerance)) {
    eventClick(e);
  }

}



function eventWheel (e)
{
  var fov = camera.fov + (event.deltaY * 0.05);
  camera.fov = THREE.Math.clamp(fov, pano.fovMin, pano.fovMax);
  camera.updateProjectionMatrix();
}




function eventClick (e)
{
}







// functions to get and set variable in Articulate Storyline
function getStorylineVar (varName)
{
  try {
    var p = parent.GetPlayer();
    return p.GetVar(varName);
  } catch (err) {}
}


function setStorylineVar (varName, val)
{
  try {
    var p = parent.GetPlayer();
    p.SetVar(varName, val);
  } catch (err) {}
}









//
