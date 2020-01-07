



// config vars
var dummy = (typeof dummy === 'undefined') ? {} : dummy;
var enableDummy = (typeof enableDummy === 'undefined') ? false : enableDummy;
var resizeCanvas = true;
var WIDTH = 800; // these display sizes are used if resizeCanvas = false;
var HEIGHT = 600; // size for Storyline, 980 x 524
var preloadImages = false;

var mouse = {};
mouse.x = 0;
mouse.y = 0;

var container, camera, scene, renderer, mesh;
var panoMesh, panoMaterial;
var pano = new Pano();



function animate ()
{

  window.requestAnimationFrame(animate);

  checkControls();
  positionCamera();

  renderer.render(scene, camera);

  positionOverlays();
  if (enableDummy) { dummy.update(); }

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
  panoMaterial = new THREE.MeshBasicMaterial({ map:texture });
  panoMesh = new THREE.Mesh( geometry, panoMaterial );
  panoMesh.rotation.y = THREE.Math.degToRad(90); // so it starts in the center

  scene.add(panoMesh);

  if (enableDummy) { dummy.add(); }

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

  panoScenes[0].load();

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




function positionOverlays ()
{

  if (!pano.loadedScene) { return false; }

  for (var i = 0; i < pano.loadedScene.hotspots.length; i++) {

    var hs = pano.loadedScene.hotspots[i];
    var pos = pano.toScreenPosition(hs.position, camera);
    var xPos = pos.x - (hs.imgW / 2);
    var yPos = pos.y - (hs.imgH / 2);
    $('#overlay-' + hs.id).css({ 'left': xPos + 'px', 'top': yPos + 'px' });

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

  e.preventDefault();

  try {
    mouse.x = e.clientX || e.touches[0].clientX;
    mouse.y = e.clientY || e.touches[0].clientY;
  } catch (err) {}

  if (pano.active) { pano.updatePosition(); }
  if (dummy.active) { dummy.updatePosition(); }

}



function eventStop (e)
{

  e.preventDefault();

  pano.activeControl = false;
  dummy.active = false;
  var clickTolerance = 2;
  pano.active = false;

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
