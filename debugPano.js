



var addHotspotPopup = new Popup({ title:"Add Hotspot" });
addHotspotPopup.addField({ label:"ID", id:"id" });
addHotspotPopup.addField({ label:"Link", id:"link" });
addHotspotPopup.addField({ label:"Title", id:"title" });
addHotspotPopup.addField({ label:"Lat", id:"lat", type:"number" });
addHotspotPopup.addField({ label:"Lon", id:"lon", type:"number" });
addHotspotPopup.addButton({ text:"Add", callback:"debugAddHotspot" });
addHotspotPopup.addButton({ type:"cancel", text:"Close" });


var addScenePopup = new Popup({ title:"Add Scene" });
addScenePopup.addField({ label:"ID", id:"id" });
addScenePopup.addField({ label:"Image", id:"image" });
addScenePopup.addField({ label:"Lat", id:"lat", type:"number" });
addScenePopup.addField({ label:"Lon", id:"lon", type:"number" });
addScenePopup.addButton({ text:"Add", callback:"debugAddScene" });
addScenePopup.addButton({ type:"cancel", text:"Close" });


function iniDebug () {

  var dc = document.getElementById("dummy-container");

  // button
  var el = document.createElement("div");

  el.style.setProperty("position", "absolute");
  el.style.setProperty("left", "0px");
  el.style.setProperty("top", "50px");
  el.style.setProperty("width", "40px");
  el.style.setProperty("height", "40px");
  el.style.setProperty("background-color", "#f9423a");
  el.style.setProperty("cursor", "pointer");
  el.onclick = function () { debugToggle(); }

  dc.appendChild(el);

  //   debug
  var el = document.createElement("div");
  el.id = "debug";

  el.style.setProperty("position", "absolute");
  el.style.setProperty("left", "0px");
  el.style.setProperty("top", "100px");
  el.style.setProperty("width", "240px");
  //el.style.setProperty("height", "400px");
  el.style.setProperty("background-color", "#fffff6");
  el.style.setProperty("padding", "10px");
  el.hidden = false;

  var h = "";

  h += '<style>';
  h += '.debugButton { background-color:#005eb8; color:#ffffff; margin:4px 10px; padding:4px; border:none; cursor:pointer; font-size:11px; }';
  h += '</style>';

  h += '<div style="font-size:12px; font-weight:bold;">Scenes:</div>';
  h += '<div id="debugSceneLinks" style="height:140px; overflow-y:auto; background-color:#fcfcfc; margin-bottom:10px; border:1px solid #666666;"></div>';

  h += '<button class="debugButton" onclick="addScenePopup.show();">Add Scene</button>';
  h += '<button class="debugButton" onclick="debugSetScenePosition();">Set Position</button>';
  h += '<button class="debugButton" onclick="debugDeleteCurrentScene();">Delete Current Scene</button>';
  h += '<button class="debugButton" onclick="addHotspotPopup.show();">Add Hotspot</button>';

  el.innerHTML = h;

  dc.appendChild(el);

  debugAddSceneLinks();

}



function debugToggle ()
{
  var el = document.getElementById("debug");
  el.hidden = !el.hidden;
}


function debugSetScenePosition ()
{
  pano.loadedScene.lon = pano.lon;
  pano.loadedScene.lat = pano.lat;
  console.log("OK");
}




function debugAddSceneLinks ()
{

  var cont = document.getElementById("debugSceneLinks");
  cont.innerHTML = "";

  for (var i = 0; i < pano.scenes.length; i++) {

    var el = document.createElement("div");
    el.style.setProperty("font-size", "12px");
    el.style.setProperty("padding", "4px");
    el.style.setProperty("cursor", "pointer");
    el.innerHTML = pano.scenes[i].id + ' (' + pano.scenes[i].texture + ')';

    el.sceneId = pano.scenes[i].id;
    el.onclick = function () { pano.load(this.sceneId); }

    cont.appendChild(el);

  }

}





function debugAddScene (args)
{

  var args = args || {};

  var myID = "scene-" + Math.round(Math.random() * 100000);
  var myImage = "";
  var myLon = 0;
  var myLat = 0;

  for (var i = 0; i < args.length; i++) {
    if (args[i].id == "id") { myID = args[i].value; }
    if (args[i].id == "image") { myImage = args[i].value; }
    if (args[i].id == "lon") { if (args[i].value) { myLon = parseFloat(args[i].value); } }
    if (args[i].id == "lat") { if (args[i].value) { myLat = parseFloat(args[i].value); } }
  }

  var panoScene = new PanoScene({ id:myID, texture:myImage, lon:myLon, lat:myLat });
  pano.scenes.push(panoScene);

  debugAddSceneLinks();

}



/*
function debugAddSceneOLD ()
{

  var myID = document.getElementById("scene-id").value || "scene-" + Math.round(Math.random() * 100000);
  var myTexture = document.getElementById("scene-texture").value || "i2.jpg";
  var myLon = 0;
  var myLat = 0;
  var panoScene = new PanoScene({ id:myID, texture:myTexture, lon:myLon, lat:myLat });
  pano.scenes.push(panoScene);

  debugAddSceneLinks();

}
*/




function debugDeleteCurrentScene ()
{

  var sceneCount = pano.scenes.length;
  if (sceneCount < 2) { return false; }

  var sIndex = pano.scenes.indexOf(pano.loadedScene);

  pano.scenes.splice(sIndex, 1);
  debugAddSceneLinks();
  pano.scenes[0].load();

}



function debugAddHotspot (args)
{

   var args = args || {};

   var myID = "hs-" + Math.round(Math.random() * 100000);
   var myLink = "";
   var myTitle = "";
   var myLon = 180 - pano.lon;
   var myLat = -pano.lat;

   for (var i = 0; i < args.length; i++) {
     if (args[i].id == "id") { myID = args[i].value; }
     if (args[i].id == "link") { myLink = args[i].value; }
     if (args[i].id == "title") { myTitle = args[i].value; }
     if (args[i].id == "lon") { if (args[i].value) { myLon = parseFloat(args[i].value); } }
     if (args[i].id == "lat") { if (args[i].value) { myLat = parseFloat(args[i].value); } }
   }

   pano.loadedScene.addHotspot({ id:myID, link:myLink, title:myTitle, lon:myLon, lat:myLat }, true);

}



/*
function debugAddHotspotOLD ()
{

  var myID = document.getElementById("hotspot-id").value || "hs-" + Math.round(Math.random() * 100000);
  var myLink = document.getElementById("hotspot-link").value || "";
  var myTitle = document.getElementById("hotspot-title").value || "";
  var myLon = 180 - pano.lon;
  var myLat = -pano.lat;

  pano.loadedScene.addHotspot({ id:myID, link:myLink, title:myTitle, lon:myLon, lat:myLat }, true);

}
*/















//
