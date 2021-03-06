



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
  el.style.setProperty("width", "60px");
  el.style.setProperty("padding", "8px");
  el.style.setProperty("background-color", "#005eb8");
  el.style.setProperty("color", "#ffffff");
  el.style.setProperty("font-size", "12px");
  el.style.setProperty("border-top-right-radius", "8px");
  el.style.setProperty("border-bottom-right-radius", "8px");
  el.style.setProperty("cursor", "pointer");
  el.innerHTML = "menu";
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
  el.style.setProperty("border-top-right-radius", "8px");
  el.style.setProperty("border-bottom-right-radius", "8px");
  el.hidden = false;

  var h = "";

  h += '<style>';
  h += '.debugButton { background-color:#d4d4d4; color:#666666; margin:4px 10px; padding:4px; border:none; cursor:pointer; font-size:11px; }';
  h += '.fieldTitle { font-size:12px; color:#666666;}';
  h += '</style>';

  h += '<div style="font-size:12px; font-weight:bold;">Scenes:</div>';
  h += '<div id="debugSceneLinks" style="height:140px; overflow-y:auto; background-color:#fcfcfc; margin-bottom:10px; border:1px solid #666666;"></div>';

  h += '<button class="debugButton" onclick="addScenePopup.show();">Add Scene</button>';
  h += '<button class="debugButton" onclick="editCurrentScene();">Edit Scene</button>';
  h += '<button class="debugButton" onclick="debugSetScenePosition();">Set Position</button>';
  h += '<button class="debugButton" onclick="debugDeleteCurrentScene();">Delete Current Scene</button>';
  h += '<button class="debugButton" onclick="addHotspotPopup.show();">Add Hotspot</button>';
  h += '<button class="debugButton" onclick="debugGenerateXML();">Generate XML</button>';
  h += '<button class="debugButton" onclick="debugShowPanoInfo();">Pano Info</button>';

  h += '<hr />';

  h += '<table>';
  h += '<tr> <td class="fieldTitle">Lon:</td> <td><input id="debugLon" type="number" value="0" /></td> </tr>';
  h += '<tr> <td class="fieldTitle">Lat:</td> <td><input id="debugLat" type="number" value="0" /></td> </tr>';
  h += '</table>';
  h += '<button class="debugButton" onclick="debugStorePanoInfo();">Store Info</button>';

  el.innerHTML = h;

  dc.appendChild(el);

  debugAddSceneLinks();

}



function debugToggle ()
{
  var el = document.getElementById("debug");
  el.hidden = !el.hidden;
}


function debugStorePanoInfo ()
{
  document.getElementById("debugLon").value = pano.lon.toFixed(2);
  document.getElementById("debugLat").value = pano.lat.toFixed(2);
}


function debugSetScenePosition ()
{
  pano.loadedScene.lon = parseFloat(pano.lon.toFixed(2));
  pano.loadedScene.lat = parseFloat(pano.lat.toFixed(2));
  new Message({ text:"Scene position updated OK" });
}



function debugShowPanoInfo ()
{

  var data = "ID: " + pano.loadedScene.id + "\n";
  data +='lon="' + pano.lon.toFixed(2) + '" ';
  data += 'lat="' + pano.lat.toFixed(2) + '"';

  var panoPopup = new Popup({ title:"Pano Info", width:"400px" });
  panoPopup.addField({ label:"info", id:"info", type:"textarea", value:data });
  panoPopup.addButton({ type:"cancel" });
  panoPopup.show();

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





function editCurrentScene ()
{

  var editScenePopup = new Popup({ title:"Edit Scene" });
  editScenePopup.addField({ label:"ID", id:"id", value:pano.loadedScene.id });
  editScenePopup.addField({ label:"Image", id:"texture", value:pano.loadedScene.texture });
  editScenePopup.addField({ label:"Lon", id:"lon", type:"number", value:pano.loadedScene.lon });
  editScenePopup.addField({ label:"Lat", id:"lat", type:"number", value:pano.loadedScene.lat });
  editScenePopup.addButton({ text:"Save", callback:"editScene" });
  editScenePopup.addButton({ type:"cancel", text:"Cancel" });
  editScenePopup.show();

}


function editScene (args)
{

  var args = args || {};
  var myID = pano.loadedScene.id;
  var myTexture = pano.loadedScene.texture;
  var myLon = pano.loadedScene.lon;
  var myLat = pano.loadedScene.lat;

  for (var i = 0; i < args.length; i++) {
    if (args[i].id == "id") { myID = args[i].value; }
    if (args[i].id == "texture") { myTexture = args[i].value; }
    if (args[i].id == "lon") { if (args[i].value) { myLon = parseFloat(args[i].value); } }
    if (args[i].id == "lat") { if (args[i].value) { myLat = parseFloat(args[i].value); } }
  }

  pano.loadedScene.id = myID;
  pano.loadedScene.texture = myTexture;
  pano.loadedScene.lon = myLon;
  pano.loadedScene.lat = myLat;

  // reload scene?
  debugAddSceneLinks();
  pano.loadedScene.loadTexture();

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





function debugGenerateXML ()
{

  var xml = '<?xml version="1.0" encoding="utf-8" ?>' + "\n\n";
  xml += '<scenes>' + "\n\n";

  for (var i = 0; i < pano.scenes.length; i++) {

    var s = pano.scenes[i];
    var sceneTag = '<scene id="' + s.id + '" image="' + s.texture + '" lon="' + s.lon + '" lat="' + s.lat + '">';
    xml += "\t" + sceneTag + "\n";

    for (var j = 0; j < pano.scenes[i].hotspots.length; j++) {

       xml += "\t\t";
       xml += pano.scenes[i].hotspots[j].getXML();
       xml += "\n";

    }

    xml += "\t</scene>\n\n";

  }

  xml += "</scenes>";

  var xmlPopup = new Popup({ title:"XML data for scenes.xml", width:"500px" });
  xmlPopup.addField({ label:"xml", id:"xml", type:"textarea", value:xml, height:"300px" });
  xmlPopup.addButton({ type:"cancel" });
  xmlPopup.show();

}




function panoHotspotClicked () {
  pano.clickedHotspot.clicked();
}




function panoHotspotUpdate (args) {

  var id = "";
  var link = "";
  var title = ";"
  var sceneLon = 0;
  var sceneLat = 0;

  for (var i = 0; i < args.length; i++) {
    if (args[i].id == "id") { id = args[i].value; }
    if (args[i].id == "link") { link = args[i].value; }
    if (args[i].id == "title") { title = args[i].value; }
    if (args[i].id == "sceneLon") { sceneLon = parseFloat(args[i].value); }
    if (args[i].id == "sceneLat") { sceneLat = parseFloat(args[i].value); }
  }

  var originalID = pano.clickedHotspot.id;
  pano.clickedHotspot.id = id;
  pano.clickedHotspot.link = link;
  pano.clickedHotspot.title = title;
  pano.clickedHotspot.sceneLon = sceneLon;
  pano.clickedHotspot.sceneLat = sceneLat;

  // update html element
  var el = document.getElementById("overlay-" + originalID);
  el.id = "overlay-" + id;
  el.title = title;

}



function panoHotspotDelete (args)
{
  pano.clickedHotspot.delete();
}



function panoHotspotShowXML ()
{

  var xml = pano.clickedHotspot.getXML();
  var xmlPopup = new Popup({ title:"XML data for hotspot", width:"500px" });
  xmlPopup.addField({ label:"xml", id:"xml", type:"textarea", value:xml, height:"300px" });
  xmlPopup.addButton({ type:"cancel" });
  xmlPopup.show();

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
