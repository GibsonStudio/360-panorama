

var panoScenes = [];


// external positions //


// left, by door, E1
var panoScene = new PanoScene({ id:'e1', texture:'e1.jpg', lon:207, lat:3.8 });
panoScene.hotspots.push(new PanoHotspot({ id:'i2', title:'Interior', position:[184,114.19,371.49] }));
panoScenes.push(panoScene);



// internal //


// inside, by front door, I2
var panoScene = new PanoScene({ id:'i2', texture:'i2.jpg', lon:132, lat:3.5 });
panoScene.hotspots.push(new PanoHotspot({ id:'e1', position:[300.65,-169.05,-256.78] }));
panoScenes.push(panoScene);





//
