/*
$sidebar = $('.sidebar');
$full_page = $('.full-page');
$sidebar_responsive = $('body > .navbar-collapse');
window_width = $(window).width();
*/

const thirdlevelMap = {
  geographyofthefaith: 'en',
  geografiadellafede: 'it',
  geografiadelafe: 'es',
  geographiedelafoi: 'fr',
  geographiedesglaubens: 'de',
  geografiadafe: 'pt'
}

const hostname = location.hostname.split('.');
let thirdlevel;
let lang;
if( hostname[1] === 'bibleget' ) {
  thirdlevel = hostname[0];
  lang = thirdlevelMap[thirdlevel] ?? 'en';
}
else if ( hostname[1] === 'orp' ) {
  if( location.pathname.includes('geography') ) {
    lang = 'en';
  }
  else if( location.pathname.includes('geografia') && location.pathname.includes('fede') ) {
    lang = 'it';
  }
  else if( location.pathname.includes('geografia') && location.pathname.includes('de') && location.pathname.includes('fe') ) {
    lang = 'es';
  }
  else if( location.pathname.includes('geographie') ) {
    lang = 'fr';
  }
  else if( location.pathname.includes('geographie') && location.pathname.includes('glaubens') ) {
    lang = 'de';
  }
  else if( location.pathname.includes('geografia') && location.pathname.includes('da') && location.pathname.includes('fe') ) {
    lang = 'pt';
  }
}

console.log(location.hostname + location.pathname + ' : lang set to ' + lang);

const ENDPOINT = `https://${location.hostname}${location.pathname}geofaith_backend.php`;


/** DEFINE READY STATES AND READY CALLBACKS */

const GLOBE_STATE = {
  DOCUMENT_READY: false,
  MARKERS_LAYER_READY: false,
  OPENBUS_MARKERS_LAYER: false,
  MARKERS_CREATED: false,
  COUNTRY_POLYS_READY: false,
  COUNTRY_BORDERS_READY: false,
  OMNIA_VR_READY: false,
  MAPS_SOURCE_READY: false,
  TILES_LOADED: false,
  ALL_DRAWN: false,
  //BIBLICAL_SITES_ISRAEL_READY: false,
  BACKGROUND_MUSIC_READY: false
}

const isGlobeReady = () => {
  return Object.values(GLOBE_STATE).reduce((prev,curr) => {
    return (prev && curr);
  }, true);
};

const hideLoaderIfGlobeReady = () => {
  if(isGlobeReady()) {
    console.log('all conditions for globe ready are now met! hiding loader...');
    $('#loadingModalMessage').fadeOut({
      complete: () => {
        $('#loadingModalMessage').html('Multimedia experience is ready<br>Click anywhere to continue').fadeIn();

      }
    });
    $('.loader').fadeOut();
    openBusMarkersLayer.show = true;
  } else {
    let arr = Object.entries(GLOBE_STATE).reduce((prev,curr) => {
      if(curr[1] === false) {
        prev.push(curr[0]);
      }
      return prev;
    },[]);
    console.log('conditions that are not yet met for the globe to be ready: ' + arr.sort().join(', ') );
  }
}


/** CREATE OUR CESIUM GLOBE */

// first set Cesium static options
//N.B. ION_ACCESS_TOKEN and BING_ACCESS_TOKEN are loaded by index.php from a credentials file not included in git source!
Cesium.Ion.defaultAccessToken = ION_ACCESS_TOKEN;

// set the default view that the home button will fly to: Rome!
const extent = Cesium.Rectangle.fromDegrees(12.373249, 41.987067, 12.626621, 41.797435);
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;

const viewer = new Cesium.Viewer('map', {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  sceneModePicker: false,
  navigationHelpButton: true,
  homeButton: true,
  geocoder: true,
  fullscreenButton: true,
  scene3DOnly: true,
  shadows: true,
  creditContainer: document.getElementById("credits"),
  creditViewport: null,
  shouldAnimate: true
});


const bingImageryProvider = Cesium.BingMapsImageryProvider.fromUrl( 'https://dev.virtualearth.net', {
  key : BING_ACCESS_TOKEN,
  mapStyle : Cesium.BingMapsStyle.AERIAL
}).then((res) => {
  const imageryLayer = Cesium.ImageryLayer.fromProviderAsync(res);
  viewer.imageryLayers.add(imageryLayer);
  console.log("%cbing maps is ready!", 'color: yellow;background-color:blue;padding:2px');
  GLOBE_STATE.MAPS_SOURCE_READY = true;
  hideLoaderIfGlobeReady();
});

const terrainProvider = Cesium.createWorldTerrainAsync({
  requestVertexNormals: true,
  requestWaterMask: true
}).then((res) => {
  console.log('%cworld terrain provider is ready, with watermask!', 'color: yellow;background-color:blue;padding:2px');
  viewer.terrainProvider = res;
});

let isViewerReady = () => {
  GLOBE_STATE.ALL_DRAWN = viewer.dataSourceDisplay.ready;
  if( GLOBE_STATE.ALL_DRAWN ) {
    console.log('all viewer polygons are now completely drawn');
    clearInterval(viewerIntvl);
    hideLoaderIfGlobeReady();
  }
}

let viewerIntvl = setInterval(isViewerReady, 50);

//we remove the default double click action, because we will implement a flyTo for a country polygon on double click
//see :FLYTO_COUNTRY_CLICKED
viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

//set our initial camera view for our pilgrimage globe
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(12.4531362,41.9020481, 30000000)
});

let scene = viewer.scene;
scene.skyAtmosphere.show = false;
scene.fog.enabled = true;
scene.globe.showGroundAtmosphere = false;
scene.globe.enableLighting = true;
scene.globe.dynamicAtmosphereLighting = true;
scene.globe.dynamicAtmosphereLightingFromSun = true;
scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
scene.screenSpaceCameraController.minimumZoomDistance = 500;
scene.globe.depthTestAgainstTerrain=true;

/*
scene.moon = new Cesium.Moon({
  onlySunLighting: false
});
*/
//scene.primitives.add(Cesium.createOsmBuildings());

/*
const flightData = require '../dataSources/OpenBus/openbusflyover.json';
const timeStepInSeconds = 10;
const totalSeconds = timeStepInSeconds * (flightData.length - 1);
const start = Cesium.JulianDate.fromIso8601("2021-05-01T09:00:00Z");
const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
viewer.clock.startTime = start.clone();
viewer.clock.stopTime = stop.clone();
viewer.clock.currentTime = start.clone();
viewer.timeline.zoomTo(start, stop);
viewer.clock.multiplier = 5;
// Start playing the scene.
viewer.clock.shouldAnimate = true;
const positionProperty = new Cesium.SampledPositionProperty();

for (let i = 0; i < flightData.length; i++) {
  const dataPoint = flightData[i];

  // Declare the time for this individual sample and store it in a new JulianDate instance.
  const time = Cesium.JulianDate.addSeconds(start, i * timeStepInSeconds, new Cesium.JulianDate());
  const position = Cesium.Cartesian3.fromDegrees(dataPoint.longitude, dataPoint.latitude, dataPoint.height);
  // Store the position along with its timestamp.
  // Here we add the positions all upfront, but these can be added at run-time as samples are received from a server.
  positionProperty.addSample(time, position);

  viewer.entities.add({
    description: `Location: (${dataPoint.longitude}, ${dataPoint.latitude}, ${dataPoint.height})`,
    position: position,
    point: { pixelSize: 10, color: Cesium.Color.RED },
    clampToGround: true
  });
}

const airplaneEntity = viewer.entities.add({
  availability: new Cesium.TimeIntervalCollection([ new Cesium.TimeInterval({ start: start, stop: stop }) ]),
  position: positionProperty,
  point: { pixelSize: 30, color: Cesium.Color.GREEN },
  //path: new Cesium.PathGraphics({ width: 3 }),
  //model: "assets/models/CesiumMilkTruck/CesiumMilkTruck.glb",
  //clampToGround: true
});
// Make the camera track this moving entity.
viewer.trackedEntity = airplaneEntity;
*/

let lensFlare = scene.postProcessStages.add(
  Cesium.PostProcessStageLibrary.createLensFlareStage()
);
lensFlare.uniforms.intensity = 3.0;
lensFlare.uniforms.distortion = 10.0;
lensFlare.uniforms.ghostDispersal = 0.2;
lensFlare.uniforms.haloWidth = 0.2;
lensFlare.uniforms.dirtAmount = 0.1;

let frame = viewer.infoBox.frame;
frame.addEventListener('load', function () {
  let cssLink = frame.contentDocument.createElement('link');
  cssLink.href = 'assets/css/infoBox.css';
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  frame.contentDocument.head.appendChild(cssLink);
}, false);




let helper = new Cesium.EventHelper();
helper.add(scene.globe.tileLoadProgressEvent, ev => {
  console.log("tiles to load = " + ev);
  if(ev === 0){
    console.log("and all tiles are now loaded");
    GLOBE_STATE.TILES_LOADED = true;
    hideLoaderIfGlobeReady();
  }
});



/** DEFINE MAIN CATEGORIES FOR ENTITIES */

const CATEGORIES = {
  RELIC: [],
  APOSTLE: [],
  EVANGELIST: [],
  MARTYR: [],
  EUCHARISTIC_MIRACLE: [],
  CATHEDRAL: [],
  MARIAN_SHRINE: [],
  SHRINE: [],
  SAINT_UNIVERSAL: [],
  SAINT_LOCAL: [],
  FRESCO: [],
  MOSAIC: [],
  ICON: [],
  PAINTING: [],
  SCULPTURE: [],
  BIBLICAL_SITES_ISRAEL: []
};



/** DEFINE CUSTOM MARKERS AND LABELS AND COLLECTIONS */

const OpenBusMarkers = [
  {
    "name": "1 / 16 - Vaticano / Castel Sant'Angelo",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>1 / 16 - Vaticano / Castel Sant'Angelo</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.467435,
            41.90124999999999
        ]
    }
  },
  {
    "name": "2 - San Giovanni dei Fiorentini",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>2 - San Giovanni dei Fiorentini</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.465399000000003,
            41.899874000000004
        ]
    }
  },
  {
    "name": "3 - Sant'Agnese in Agone / Piazza Navona",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>3 - Sant'Agnese in Agone / Piazza Navona</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.472515999999995,
            41.896889999999985
        ]
    }
  },
  {
    "name": "4 - Area Sacra Torre Argentina",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>4 - Area Sacra Torre Argentina</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.476326000000002,
            41.89554099999999
        ]
    }
  },
  {
    "name": "5 / 14 - Santa Maria in Ara Coeli",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>5 / 14 - Santa Maria in Ara Coeli</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.482292999999997,
            41.895295000000004
        ]
    }
  },
  {
    "name": "6 - Santi Apostoli",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>6 - Santi Apostoli</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.483456,
            41.896812999999995
        ]
    }
  },
  {
    "name": "7 - Santa Maria degli Angeli",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>7 - Santa Maria degli Angeli</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.495621000000003,
            41.90326699999999
        ]
    }
  },
  {
    "name": "8 - Stazione Termini",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>8 - Stazione Termini</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.499573,
            41.90091799999999
        ]
    }
  },
  {
    "name": "9 - Santa Maria Maggiore",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>9 - Santa Maria Maggiore</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.498128000000005,
            41.89709100000001
        ]
    }
  },
  {
    "name": "10 - San Giovanni in Laterano",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>10 - San Giovanni in Laterano</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.503956999999998,
            41.886531999999995
        ]
    }
  },
  {
    "name": "11 - Colosseo / San Gregorio al Celio",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>11 - Colosseo / San Gregorio al Celio</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.490195000000005,
            41.888603
        ]
    }
  },
  {
    "name": "12 - Circo Massimo / Santa Saba all'Aventino",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>12 - Circo Massimo / Santa Saba all'Aventino</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.484844999999998,
            41.88559499999999
        ]
    }
  },
  {
    "name": "13 - Teatro Marcello / Santa Maria in Campitelli",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>13 - Teatro Marcello / Santa Maria in Campitelli</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.481594000000001,
            41.893271
        ]
    }
  },
  {
    "name": "15 - Largo Argentina / Sancta Maria ad Martyres",
    "description": "<div class=\"cesium-infoBox-description-lighter\" style=\"background-color:rgb(255,255,255);color:rgb(0,0,0);\"><h3>15 - Largo Argentina / Sancta Maria ad Martyres</h3></div>",
    "position": {
        "cartographicDegrees": [
            12.476819999999998,
            41.896103
        ]
    }
  }
];

const openBusMarker = {
  image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAACXBIWXMAAAAcAAAAHAAPAbmPAAAAvVBMVEUAAAAAAAAAAAAAAAAAAAAAAADOzs5ycnIFBQXr6+v///9aWlqSkpL////////////////////////v7+9+fn7////7+/v////////////////m5ub7+/vz8/P39/fOzs7///////+urq7KysqGhob////mUQD/+/vrdjX3wqbztpL3yrLvnm775tr/8+/zpn7mWg377+braiXrgkn73srmVgXvnnLzrormUQXmXhXzupr77+v78+vmWgnvjl4Q9G0WAAAAJXRSTlMAUQ0wGUmycjnakmp+JUk5xuZq2na689qK987O9+bzrjEJkn5JnsBJ6AAAAstJREFUeNrt/cWC4zAMhgGEg+VyYVB2uFyeef/HWicFQzOF217+Y+wvlmRJ1lH6T1SqO63OGONxp+XUS89S790acKp135/AylWy9RDEi/lutdrNF3FwIB+q5QdYhWDH0Eec/PBI0Mod7MMBmK1/0I1+1jMA5+MvrtQHvJmiQk03GPp/hKnShsRHf8pPoF1obrkH0RTd0TSCXkGMKj3Yb9FdbffQuzmz1IY9eqg9tAU/P/oQbR+D2wj6fGwdSKboCU0TcDgHAbPx9CfBcpZiAJzOlsGEW8LAulmFDV1bJCAoWdDVDVQpV4YZNfQXw43wLzV2BmXmwDVdSKFAKf3xmh75Dkean79QKHrkzxEuVdaFEDE/LBQ1CYXQPYM1YOI2AfC3gnyACd3hQ+3EleCAeBAJ4kF0gFP61CF4DQygnoMOxK+B8Tl7WrB4DVxAKwc7MH8NnEMnB8ewew3cwTgHMax4MAoERTy4AlwMFqkIvDH1EXgxdSQG5xE4h1EODsTrgGW4pMgyTEC8jkEOGmICRKssO84iLWy1FBPAyMEvMeXi/K9nZdasxZT7ysFvMclDxLga5zuFJP/OQY0rK1LIeOLH1/6Rxn72E1rIWVlpOai8sYW8K24dzI2F8KacCtJkW0dx72AOJK3DPHGSarOdYU724YhRZjVz02uw1TOoeGx7zMAUMUo5kLRH72ypJFk205AzkA0zymYA6uIGbOvCSZrJPgEBCSsLTjCmF02eAFO7gpJlPP/oGPRA4qXcePaZa8gKA0qq++zD6qoSJ705fOYpHzZ1npMU3Rs+Hh6Gnq4IoKTpzcfjSlMnEb0l3cb9AanhFnEZKRv3RjJDLuYyP2XT/msItE351r+rVFn2bCgYO21PllXpjhRLls03cdB9M2XZUqT70ggqu5/GYJSN1qOB8emSD5YmPZai6jInXVWkJ6VoqqXnslStmPoHjhdHI1NHJmUAAAAASUVORK5CYII=",
  color: Cesium.Color.WHITE,
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  width: 32,
  height: 32,
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  disableDepthTestDistance: Number.POSITIVE_INFINITY,
  scaleByDistance: new Cesium.NearFarScalar(500, 1, 1500000, 0.2)
};

let pinBuilder = new Cesium.PinBuilder();

const biblicalSitePin = {
  image: pinBuilder.fromText("!", Cesium.Color.DARKRED, 36).toDataURL(), // ✡ Star of David
  color: Cesium.Color.WHITE,
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  width: 36,
  height: 36,
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  disableDepthTestDistance: Number.POSITIVE_INFINITY
}

const pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 48).toDataURL();
const pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 48).toDataURL();
const pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 48).toDataURL();
const pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 48).toDataURL();
const pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 48).toDataURL();

let singleDigitPins = new Array(8);
for (let i = 0; i < singleDigitPins.length; ++i) {
  singleDigitPins[i] = pinBuilder
    .fromText("" + (i + 2), Cesium.Color.DARKRED, 48)
    .toDataURL();
}

const markerBase = {
  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  width: 36,
  height: 36,
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  disableDepthTestDistance: Number.POSITIVE_INFINITY
}

const markerContrastMap = {
  BLACK: 'WHITE',
  DARKGREEN: 'WHITE',
  DARKRED: 'WHITE',
  DARKBLUE: 'WHITE',
  DARKORANGE: 'BLACK',
  DARKMAGENTA: 'WHITE',
  LIMEGREEN: 'BLACK',
  YELLOW: 'BLACK',
  GREEN: 'WHITE',
  ROYALBLUE: 'WHITE'
};

const markerIconMap = {
  ART_GALLERY: 'art-gallery',
  BUILDING: 'building',
  CASTLE: 'castle',
  CEMETERY: 'cemetery',
  HOME: 'home',
  HOSPITAL: 'hospital',
  LANDMARK: 'landmark',
  LIBRARY: 'library',
  MUSEUM: 'museum',
  MONUMENT: 'monument',
  PARK: 'park',
  PLACE_OF_WORSHIP: 'place-of-worship',
  RELIGIOUS_BUDDHIST: 'religious-buddhist',
  RELIGIOUS_CHRISTIAN: 'religious-christian',
  RELIGIOUS_JEWISH: 'religious-jewish',
  RELIGIOUS_MUSLIM: 'religious-muslim',
  RELIGIOUS_SHINTO: 'religious-shinto'
};

const createMarkerDef = (markericon,markercolor) => {
  return {
    image: pinBuilder.fromMakiIconId(markerIconMap[markericon], Cesium.Color[markercolor], 36),
    color: Cesium.Color[markerContrastMap[markercolor]],
    ...markerBase
  }
};


let label = {
  font : 'bold 14pt Arial',
  backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
  showBackground: true,
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  outlineWidth : 2,
  verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
  pixelOffset : new Cesium.Cartesian2(0, -40),
  heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
  disableDepthTestDistance: Number.POSITIVE_INFINITY,
  show: false
}


let eventListener;
let clusteredMarkers = [];

//handle styles for clustered markers
let customStyle = () => {
  if (Cesium.defined(eventListener) === false) {
    eventListener = markersLayer.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) => {
        clusteredEntities.forEach(ent => {
          //ent.label.show = false;
        });
        console.log('there was a cluster event');
        console.log(clusteredEntities);
        if(clusteredMarkers.length > 0) {
          clusteredMarkers.forEach(marker => {
            if(clusteredEntities.includes(marker) === false ) {
              //marker.label.show = true;
            }
          });
        }
        clusteredMarkers = clusteredEntities;
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;

        if (clusteredEntities.length >= 50) {
          cluster.billboard.image = pin50;
        } else if (clusteredEntities.length >= 40) {
          cluster.billboard.image = pin40;
        } else if (clusteredEntities.length >= 30) {
          cluster.billboard.image = pin30;
        } else if (clusteredEntities.length >= 20) {
          cluster.billboard.image = pin20;
        } else if (clusteredEntities.length >= 10) {
          cluster.billboard.image = pin10;
        } else {
          cluster.billboard.image =
            singleDigitPins[clusteredEntities.length - 2];
        }
      }
    );
  }

  // force a re-cluster with the new styling
  let pixelRange = markersLayer.clustering.pixelRange;
  markersLayer.clustering.pixelRange = 0;
  markersLayer.clustering.pixelRange = pixelRange;
}


//pickedEntities is the collection of currently hovered polygons
//it is renewed every time the mouse moves and detects a hover over a polygon
let pickedEntities = new Cesium.EntityCollection();
let openBusRoutePicked = new Cesium.EntityCollection();

//define a callback property that will be applied to polygons that are included in the pickedEntities collection:
//the result is a change to a darker alpha transparency on hover
const pickColor = Cesium.Color.BLACK.withAlpha(0.3);
const openBusRoutePickColor = Cesium.Color.ORANGE.withAlpha(1.0);
const makeProperty = (entity, property) => {
  if(Cesium.defined(entity.polygon)){
    let colorProperty = new Cesium.CallbackProperty((time,result) => {
      if (pickedEntities.contains(entity)) {
        return pickColor.clone(result);
      }
      return property.clone(result);
    },
    false);
    entity.polygon.material = new Cesium.ColorMaterialProperty(colorProperty);
  }
  else if (Cesium.defined(entity.polyline)) {
    let colorProperty = new Cesium.CallbackProperty((time,result) => {
      if (openBusRoutePicked.contains(entity)) {
        return openBusRoutePickColor.clone(result);
      }
      return property.clone(result);
    }, false);
    entity.polyline.material = new Cesium.ColorMaterialProperty(colorProperty);
  }
}

/** DEFINE LAYERS AND CREATION FUNCTIONS FOR ENTITIES THAT WILL BE LOADED SHORTLY */

let markersLayer = new Cesium.CustomDataSource();
let openBusMarkersLayer = new Cesium.CustomDataSource();
openBusMarkersLayer.show = false;

let createMarker = (latitude,longitude,marker,name,description,properties,show) => markersLayer.entities.add({
    position : Cesium.Cartesian3.fromDegrees(longitude,latitude),
    name : name,
    description: description,
    billboard : marker,
    show: show,
    label : { ...label, text: name},
    properties: properties
  });

let createOpenBusMarker = (latitude,longitude,name,description) => openBusMarkersLayer.entities.add({
  position : Cesium.Cartesian3.fromDegrees(longitude,latitude),
  name : name,
  description: description,
  billboard : openBusMarker,
  show: true
});
//LATITUDE: increasing the value will increase vertical position, towards north
//LATITUDE: decreasing the value will decrease vertical position, towards south
//LONGITUDE: increase = move east
//LONGITUDE: decrease = move west

OpenBusMarkers.forEach(marker => {
  createOpenBusMarker(marker.position.cartographicDegrees[1], marker.position.cartographicDegrees[0], marker.name, marker.description );
});

let PilgrimageMarkers = {};
let allMarkers = [];


/** START LOADING DATA SOURCES AND DEFINE PROMISES */

let databaseResults;
let params = new URLSearchParams({
  LANG: lang.toUpperCase()
});

fetch(`${ENDPOINT}?${params.toString()}`).then((response) => response.json()).then((json) => {
  databaseResults = json;
  console.log('retrieved rows from database:');
  console.log(json);
  let row;
  for( let i=0; i< json.length; i++ ) {
    row = json[i];
    PilgrimageMarkers[row.id_key] = createMarker(
      row.latitude,
      row.longitude,
      createMarkerDef(row.marker_icon,row.marker_color),
      row.name,
      row.description,
      { isoAlpha3: row.country },
      false
    );
    let cats = row.category.split(',');
    cats.forEach(cat => {
      CATEGORIES[cat].push(row.id_key);
    });
    allMarkers.push(row.id_key);
    //console.log(PilgrimageMarkers[row.id_key].properties.isoAlpha3.getValue());
    if( i === json.length-1 ) {
      console.log('all markers loaded from the database should now have been created');
      //console.log(PilgrimageMarkers);
      GLOBE_STATE.MARKERS_CREATED = true;
      hideLoaderIfGlobeReady();
      Object.entries(CATEGORIES).forEach(([key,val]) => {
        let $label = $(`[data-filter='${key}']`).siblings('.label');
        let count = ` (${CATEGORIES[key].length})`;
        $label.html($label.html() + count);
      });
    }
  }
});

/*
let francigenaDataSourcePromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/Via Francigena/Via_Francigena.kmz',
  {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
  })
).then(dataSource => {
  console.log("francigenaDataSource is ready!");
});
*/

/*
let francigenaDataSourcePromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/Via Francigena/via-francigena-tessellate.kml',
  {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
  })
).then(dataSource => {
  console.log("francigenaIIDataSource is ready!");
});

let francisciDataSourcePromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/Via Francisci/ViaFrancisci.kmz',
  {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
  })
).then(dataSource => {
  console.log("francisciDataSource is ready!");
});

let francisciSudDataSourcePromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/Via Francisci/Via Francisci Sud.kmz',
  {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
  })
).then(dataSource => {
  console.log("francisciSudDataSource is ready!");
});

let lauretanaDataSourcePromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/Via Lauretana/Via Lauretana - tappe.kmz',
  {
       camera: viewer.scene.camera,
       canvas: viewer.scene.canvas,
       clampToGround: true
  })
).then(dataSource => {
  console.log("lauretanaDataSource is ready!");
});
*/

let markersDataSource;
let markersLayerPromise = viewer.dataSources.add(markersLayer);
markersLayerPromise.then(dataSource => {
  markersDataSource = dataSource;
  console.log("markersLayer is ready!");
  GLOBE_STATE.MARKERS_LAYER_READY = true;
  hideLoaderIfGlobeReady();

  dataSource.clustering.enabled = true;
  dataSource.clustering.pixelRange = 15;
  dataSource.clustering.minimumClusterSize = 3;
  customStyle();
});

let openBusRouteDataSource;
let omniaVaticanRomeDataSourcePromise = viewer.dataSources.add(
  Cesium.CzmlDataSource.load('assets/dataSources/OpenBus/OpenBusRoute.czml')
).then(dataSource => {
  openBusRouteDataSource = dataSource;
  let entities = dataSource.entities.values;
  for(let i = 0; i < entities.length; i++){
    makeProperty(entities[i], Cesium.Color.ORANGE.withAlpha(0.7));
  }
  console.log("omniaVaticanRomeDataSource is ready!");
  //console.log(dataSource);

  GLOBE_STATE.OMNIA_VR_READY = true;
  hideLoaderIfGlobeReady();
  /*let entities = dataSource.entities.values;
  for (let i = 0; i < entities.length; i++) {
    let entity = entities[i];
    entity.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
  }*/
  //openBusModel = dataSource.entities.getById("CesiumMilkTruck");
  //openBusPosition = openBusModel.position;
});

let openBusMarkersDataSource;
let openBusMarkersLayerPromise = viewer.dataSources.add(openBusMarkersLayer);
openBusMarkersLayerPromise.then(dataSource => {
  openBusMarkersDataSource = dataSource;
  console.log("OpenBus markers layer is ready!");
  GLOBE_STATE.OPENBUS_MARKERS_LAYER = true;
  hideLoaderIfGlobeReady();
});


let countryBordersDataSource = undefined;
let countryBordersPromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/countries/country-borders.kmz', {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  })
).then(dataSource => {
  countryBordersDataSource = dataSource;
  console.log("country borders kmz is ready!");
  GLOBE_STATE.COUNTRY_BORDERS_READY = true;
  hideLoaderIfGlobeReady();
});

let countryPolysDataSource = undefined;
let countryPolysPromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/countries/polygons.kmz', {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  })
).then(dataSource => {
  countryPolysDataSource = dataSource;
  console.log("country polys kmz is ready!");
  console.log(dataSource);
  let entities = dataSource.entities.values;
  for(let i = 0; i < entities.length; i++){
    makeProperty(entities[i], Cesium.Color.BLACK.withAlpha(0.1));
  }
  GLOBE_STATE.COUNTRY_POLYS_READY = true;
  hideLoaderIfGlobeReady();
});

/*
let biblicalSitesDataSource;
let biblicalSitesPromise = viewer.dataSources.add(
  Cesium.KmlDataSource.load('assets/dataSources/mymaps/Siti biblici in Israele.kml', {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  })
  .then(dataSource => {
    console.log("biblical sites kml is ready!");
    console.log(dataSource);
    biblicalSitesDataSource = dataSource;
    //dataSource.show = false;
    dataSource.entities.values.forEach(entity => {
      CATEGORIES.BIBLICAL_SITES_ISRAEL.push(entity.id);
      entity.billboard = biblicalSitePin;
    });
    GLOBE_STATE.BIBLICAL_SITES_ISRAEL_READY = true;
    hideLoaderIfGlobeReady();
  })
);
*/


/** DEFINE INTERACTIONS FOR HOVERED ENTITIES (MARKERS, POLYGONS, POLYLINES) */

let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
let hoveredEntities = new Cesium.EntityCollection();

handler.setInputAction((event) => {
  let pickedObjects = viewer.scene.drillPick(event.endPosition);
  //const pickedPrimitive = viewer.scene.pick(event.endPosition);
  //const pickedEntity = (Cesium.defined(pickedPrimitive)) ? pickedPrimitive.id : undefined;
  if(Cesium.defined(pickedObjects)) {
    //Update the collection of picked entities: start afresh on each mousemove.
    pickedEntities.removeAll();
    openBusRoutePicked.removeAll();
    for (let i = 0; i < pickedObjects.length; ++i) {
      let entity = pickedObjects[i].id;
      if(Cesium.defined(entity.billboard) && hoveredEntities.contains(entity) === false ) {
        console.log('billboard entity was hovered:');
        console.log(entity.name);
        jQuery('#currentNation').text(entity.name);
        hoveredEntities.add(entity);
        entity.billboard.scale = 1.1;
        //entity.label.show = true;
        //entity.label.pixelOffset = new Cesium.Cartesian2(0, -50);
        setTimeout(() => {
          entity.billboard.scale = 1.0;
          //entity.label.pixelOffset = new Cesium.Cartesian2(0, -40);
          hoveredEntities.remove(entity);
        }, 250, entity);
        /*setTimeout(() => {
          entity.label.show = false;
        }, 1000, entity);*/
      } else {
        if(Cesium.defined(entity.polygon) && countryPolysDataSource.entities.getById(entity.id)){
          jQuery('#currentNation').text(entity.name);
          pickedEntities.add(entity);
        } else if (Cesium.defined(entity.polyline)) {
          jQuery('#currentNation').text(entity.name);
          console.log('a polyline was hovered: ' + entity.name);
          if( openBusRouteDataSource.entities.getById(entity.id) ) {
            console.log('specifically, the open bus route polyline was hovered');
            openBusRoutePicked.add(entity);
          }
        } else {
          jQuery('#currentNation').text('Planet earth');
        }
      }
    }
  } else {
    jQuery('#currentNation').text('Planet earth');
  }
  /*
  const cartesian = viewer.scene.pickPosition(event.endPosition);
  if (Cesium.defined(cartesian)) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const labelText = latitude.toFixed(10) + ',' + longitude.toFixed(10);
    mousemoveLabel.position = Cesium.Cartesian3.fromDegrees(longitude,latitude);
    //mousemoveLabel.label.position = Cesium.Cartesian3.fromDegrees(longitude,latitude);
    mousemoveLabel.label.text = labelText;
    mousemoveLabel.label.show = true;
  } else {
    mousemoveLabel.label.show = false;
  }
  */
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

handler.setInputAction((event) => {
  const cartesian = viewer.scene.pickPosition(event.position);
  if (Cesium.defined(cartesian)) {
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const labelText = latitude.toFixed(10) + ',' + longitude.toFixed(10);
    navigator.clipboard.writeText(labelText);
    console.log('copied coordinates to clipboard: ' + labelText);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//:FLYTO_COUNTRY_CLICKED
handler.setInputAction((event) => {
  console.log(event);
  let pickedObjects = viewer.scene.drillPick(event.position);
  if(Cesium.defined(pickedObjects)){
    //Update the collection of picked entities.
    pickedEntities.removeAll();
    for (let i = 0; i < pickedObjects.length; ++i) {
      let entity = pickedObjects[i].id;
      pickedEntities.add(entity);
      if(Cesium.defined(entity.polygon) && countryPolysDataSource.entities.getById(entity.id)){
        viewer.flyTo(entity);
        console.log(entity);
        $('.togglebutton input[type="checkbox"]').prop('checked', false);
        let isoAlpha3 = entity.kml.extendedData.isoAlpha3.value;
        console.log(isoAlpha3);
        markersDataSource.clustering.enabled = false;
        allMarkers.forEach((key,idx) => {
          let show = (PilgrimageMarkers[key].properties.isoAlpha3.getValue() === isoAlpha3);
          //PilgrimageMarkers[key].label.show = show;
          PilgrimageMarkers[key].show = show;
          if( idx === allMarkers.length - 1 ) {
            markersDataSource.clustering.enabled = true;
          }
        });
      }
    }
  }
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

let scaling = false;

/** Double tap event for mobile */
function detectDoubleTapClosure() {
  let lastTap = 0;
  let timeout;
  return function detectDoubleTap(event) {
    const curTime = new Date().getTime();
    const tapLen = curTime - lastTap;
    if( scaling ) {
      console.log('filtering out pinches from double taps');
    }
    if ((tapLen < 500 && tapLen > 0) && scaling === false) {
      console.log('Double tapped!');
      event.preventDefault();
      console.log(event);
      let pickedObjects = viewer.scene.drillPick({ x: event.changedTouches[0].pageX, y: event.changedTouches[0].pageY });
      if(Cesium.defined(pickedObjects)){
        //Update the collection of picked entities.
        pickedEntities.removeAll();
        for (let i = 0; i < pickedObjects.length; ++i) {
          let entity = pickedObjects[i].id;
          pickedEntities.add(entity);
          if(Cesium.defined(entity.polygon) && countryPolysDataSource.entities.getById(entity.id)){
            viewer.flyTo(entity);
            console.log(entity);
            $('.togglebutton input[type="checkbox"]').prop('checked', false);
            let isoAlpha3 = entity.kml.extendedData.isoAlpha3.value;
            console.log(isoAlpha3);
            markersDataSource.clustering.enabled = false;
            allMarkers.forEach((key,idx) => {
              let show = (PilgrimageMarkers[key].properties.isoAlpha3.getValue() === isoAlpha3);
              //PilgrimageMarkers[key].label.show = show;
              PilgrimageMarkers[key].show = show;
              if( idx === allMarkers.length - 1 ) {
                markersDataSource.clustering.enabled = true;
              }
            });
          }
        }
      }
    } else if (tapLen < 0 || tapLen > 499) {
      console.log('Single tapped!')
      scaling = false;
      timeout = setTimeout(() => {
        clearTimeout(timeout);
      }, 500);
    }
    lastTap = curTime;
  };
}

function detectPinchStartClosure() {
  return function detectPinchStart(e) {
    if (e.touches.length === 2) {
      console.log('pinch detected!');
      scaling = true;
    }
  }
}

/* Regex test to determine if user is on mobile */
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  document.body.addEventListener('touchend', detectDoubleTapClosure());
  document.body.addEventListener('touchstart', detectPinchStartClosure());
}

/** DEFINE BACKGROUND MUSIC, SOUND EFFECTS, AND GLOBE ANIMATION */
const backgroundMusic = new Audio();
backgroundMusic.src = "assets/media/audio/The Empty Moons of Jupiter - DivKid.mp3"; //Earth Appears - Brian Bolger.mp3
backgroundMusic.loop = true;
let audioCtx;
let gainNode;
let audioSource;

//for more on creating a visualizer, see https://blog.logrocket.com/audio-visualizer-from-scratch-javascript/#web-audio-api-overview
backgroundMusic.onloadstart = ev => {
  console.log('background music is loaded');
  console.log(backgroundMusic);
  console.log('background music plays inline: ' + backgroundMusic.playsinline);
  console.log('background music is muted: ' + backgroundMusic.muted);
  console.log('background music autoplay: ' + backgroundMusic.autoplay);
  console.log(ev);
};
backgroundMusic.oncanplay = ev => {
  console.log('background music is ready to start playing');
  console.log(ev);
  GLOBE_STATE.BACKGROUND_MUSIC_READY = true;
  hideLoaderIfGlobeReady();
};
backgroundMusic.onplay = ev => {
  console.log('background music is playing');
  console.log(ev);
};
backgroundMusic.onpause = ev => {
  console.log('background music has been paused');
  console.log(ev);
}

let lastNow = Date.now();
const initialMoveDistance = 25000;
const targetDistance = 15000000;
const spinAndZoomGlobe = () => {
  const now = Date.now();
  const spinRate = 0.01;
  const delta = (now - lastNow) / 1000;
  lastNow = now;
  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  const cameraPosition = viewer.scene.camera.positionWC;
  const ellipsoidPosition = viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
  const distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(cameraPosition, ellipsoidPosition, new Cesium.Cartesian3()));
  const baseDistance = Math.floor(distance);
  const moveDistance = Math.floor(initialMoveDistance * ( (baseDistance - targetDistance) / targetDistance) );
  //if( Math.floor(delta) % 50 === 0 ) {
  //  console.log('current distance is ' + baseDistance);
  //  console.log('move distance = ' + moveDistance);
  //}
  if( baseDistance > targetDistance ) {
    if( baseDistance - targetDistance < 1000 ) {
      viewer.scene.camera.moveForward(baseDistance - targetDistance);
    } else {
      viewer.scene.camera.moveForward(moveDistance);
    }
  }
}
let unsubscribeTicks;


/** DEFINE HTML DOCUMENT INTERACTIONS */

//jQuery Document Ready
$(function(){
  console.log('document ready!');
  GLOBE_STATE.DOCUMENT_READY = true;
  hideLoaderIfGlobeReady();
  $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
  $('.cesium-home-button').attr('title', 'Rome is Home!');
});


$(document).on('click', ev => {
  if( $('#loadingModal').is(":visible") ) {
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    audioSource = audioCtx.createMediaElementSource(backgroundMusic);
    gainNode.gain.value = 0.3; // 50 %
    audioSource.connect(gainNode).connect(audioCtx.destination);
  
    if(backgroundMusic.paused) {
      backgroundMusic.play();
      unsubscribeTicks = viewer.clock.onTick.addEventListener(spinAndZoomGlobe);
    }
    $('#loadingModal').fadeOut('slow');
  } else {
    unsubscribeTicks();
    //console.log('background music is paused: ' + backgroundMusic.paused);
    if(backgroundMusic.paused === false) {
      gainNode.gain.setValueCurveAtTime([0.3,0.2,0.1,0.05,0.01], audioCtx.currentTime, 3);
      setTimeout(() => {
        backgroundMusic.pause();
      },3100);
    }
  }
});

$(document).on('click', '#accordion > .nav-item > .nav-link', ev => {
  $('#accordion > .nav-item').removeClass('active');
  $(ev.currentTarget).closest('.nav-item').addClass('active');
});

$(document).on('change', '.togglebutton input[type="checkbox"]', ev => {
  let filter = $(ev.currentTarget).data('filter');
  let show = $(ev.currentTarget).prop("checked");
  if( filter === 'BIBLICAL_SITES_ISRAEL' ) {
    allMarkers.forEach((key,idx) => {
      PilgrimageMarkers[key].show = false;
    });
    biblicalSitesDataSource.show = true;
    /*biblicalSitesDataSource.entities.values.forEach(entity => {
      entity.show = show;
    });*/
  } else {
    markersDataSource.clustering.enabled = false;
    allMarkers.forEach((key,idx) => {
      if(CATEGORIES[filter].includes(key)) {
        PilgrimageMarkers[key].show = show;
      }
      if( idx === allMarkers.length - 1 ) {
        markersDataSource.clustering.enabled = true;
      }
    });
  }
});
