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

const thirdlevel = location.hostname.split('.')[0];
const lang = thirdlevelMap[thirdlevel] ?? 'en';
console.log(location.hostname + ' : lang set to ' + lang);

const ENDPOINT = `https://${location.hostname}/geofaith_backend.php`;

const GLOBE_STATE = {
  DOCUMENT_READY: false,
  MARKERS_LAYER_READY: false,
  MARKERS_CREATED: false,
  COUNTRY_POLYS_READY: false,
  COUNTRY_BORDERS_READY: false,
  OMNIA_VR_READY: false,
  MAPS_SOURCE_READY: false,
  TILES_LOADED: false,
  ALL_DRAWN: false
}

const isGlobeReady = () => {
  return Object.values(GLOBE_STATE).reduce((prev,curr,idx) => {
    return (prev && curr);
  }, true);
};

const hideLoaderIfGlobeReady = () => {
  if(isGlobeReady()) {
    console.log('all conditions for globe ready are now met! hiding loader...');
    $('.loader').fadeOut();
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

const extent = Cesium.Rectangle.fromDegrees(12.373249, 41.987067, 12.626621, 41.797435);

Cesium.Camera.DEFAULT_VIEW_RECTANGLE = extent;
Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;


let allPromisedResolved = false;

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YzNlODY2Yy0yZjY1LTRkMDktOTViYi02M2I3M2NjMTg3YmIiLCJpZCI6NTM3MjUsImlhdCI6MTYxOTM1MzA0NX0.t8ZCZb4qQKgU2sQbzAwgZ85ReK07ZmRZjnecUP8IE9Y';

var bing = new Cesium.BingMapsImageryProvider({
  url : 'https://dev.virtualearth.net',
  key : 'AsRSrIU0SOTDG268mtY0kyGIN86fK07A9rjb5QPWU-9kW64slsXWdhTe0thkvykQ',
  mapStyle : Cesium.BingMapsStyle.AERIAL
});

let mapTiler = new Cesium.UrlTemplateImageryProvider({
  url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=SxVQSzWgRNS3fbFsWN4k',
  tileWidth: 512,
  tileHeight: 512,
  credit: null
});

let viewer = new Cesium.Viewer('map', {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  sceneModePicker: false,
  navigationHelpButton: true,
  homeButton: true,
  geocoder: true,
  fullscreenButton: true,
  imageryProvider: bing, //mapTiler,
  terrainProvider : Cesium.createWorldTerrain({
    requestVertexNormals: true,
    requestWaterMask: true
  }),
  scene3DOnly: true,
  shadows: true,
  creditContainer: document.getElementById("credits"),
  creditViewport: null,
  shouldAnimate: true
});

//we remove the default double click action, because we will implement a flyTo for a country polygon on double click
//see :FLYTO_COUNTRY_CLICKED
viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

let isViewerReady = () => {
  GLOBE_STATE.ALL_DRAWN = viewer.dataSourceDisplay.ready;
  if( GLOBE_STATE.ALL_DRAWN ) {
    console.log('all viewer polygons are now completely drawn');
    clearInterval(viewerIntvl);
    hideLoaderIfGlobeReady();
  }
}

let viewerIntvl = setInterval(isViewerReady, 50);

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

let pinBuilder = new Cesium.PinBuilder();

const pin50 = pinBuilder
.fromText("50+", Cesium.Color.RED, 48)
.toDataURL();
const pin40 = pinBuilder
.fromText("40+", Cesium.Color.ORANGE, 48)
.toDataURL();
const pin30 = pinBuilder
.fromText("30+", Cesium.Color.YELLOW, 48)
.toDataURL();
const pin20 = pinBuilder
.fromText("20+", Cesium.Color.GREEN, 48)
.toDataURL();
const pin10 = pinBuilder
.fromText("10+", Cesium.Color.BLUE, 48)
.toDataURL();

let singleDigitPins = new Array(8);
for (let i = 0; i < singleDigitPins.length; ++i) {
  singleDigitPins[i] = pinBuilder
    .fromText("" + (i + 2), Cesium.Color.DARKRED, 48)
    .toDataURL();
}

const placeOfWorship = {
  RED: {
    image: pinBuilder.fromMakiIconId("place-of-worship", Cesium.Color.DARKRED, 36),
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 36,
    height: 36,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  },
  BLUE: {
    image: pinBuilder.fromMakiIconId("place-of-worship", Cesium.Color.DARKBLUE, 36),
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 36,
    height: 36,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
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
  disableDepthTestDistance: Number.POSITIVE_INFINITY
}

let markersLayer = new Cesium.CustomDataSource();

let createMarker = (latitude,longitude,marker,name,description,properties,show) => markersLayer.entities.add({
    position : Cesium.Cartesian3.fromDegrees(longitude,latitude),
    name : name,
    billboard : marker,
    description: description,
    show: show,
    label : { ...label, text: name},
    properties: properties
  });
//LATITUDE: increasing the value will increase vertical position, towards north
//LATITUDE: decreasing the value will decrease vertical position, towards south
//LONGITUDE: increase = move east
//LONGITUDE: decrease = move west

let PilgrimageMarkers = {};
let allMarkers = [];

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
  SCULPTURE: []
};

let databaseResults;
let params = new URLSearchParams({
  LANG: lang.toUpperCase()
});

fetch(`${ENDPOINT}?${params.toString()}`).then((response) => response.json()).then((json) => {
  databaseResults = json;
  console.log('retrieved rows from database:');
  console.log(json);
  let row;
  let marker;
  for( let i=0; i< json.length; i++ ) {
    row = json[i];
    switch( row.marker_icon ) {
      case 'PLACE_OF_WORSHIP':
        marker = placeOfWorship[row.marker_color];
        break;
    }
    PilgrimageMarkers[row.id_key] = createMarker(
      row.latitude,
      row.longitude,
      marker,
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


let eventListener;
let clusteredMarkers = [];

let customStyle = () => {
  if (Cesium.defined(eventListener) === false) {
    eventListener = markersLayer.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) => {
        clusteredEntities.forEach(ent => {
          ent.label.show = false;
        });
        console.log('there was a cluster event');
        console.log(clusteredEntities);
        if(clusteredMarkers.length > 0) {
          clusteredMarkers.forEach(marker => {
            if(clusteredEntities.includes(marker) === false ) {
              marker.label.show = true;
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

let mousemoveLabel = viewer.entities.add({
  name: 'mousemoveLabel',
  label: {
    ...label,
    font : 'bold 14pt monospace',
    pixelOffset: null,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    text: 'no position',
    show: false
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
let openBusModel,
  openBusPosition;
let omniaVaticanRomeDataSourcePromise = viewer.dataSources.add(
  Cesium.CzmlDataSource.load('assets/dataSources/OpenBus/OpenBusRoute.czml',{
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true
  })
).then(dataSource => {
  console.log("omniaVaticanRomeDataSource is ready!");
  GLOBE_STATE.OMNIA_VR_READY = true;
  hideLoaderIfGlobeReady();
  //openBusModel = dataSource.entities.getById("CesiumMilkTruck");
  //openBusPosition = openBusModel.position;
});

let markersDataSource;
let markersLayerPromise = viewer.dataSources.add(markersLayer);
markersLayerPromise.then(dataSource => {
  markersDataSource = dataSource;
  console.log("markersLayer is ready!");
  GLOBE_STATE.MARKERS_LAYER_READY = true;
  hideLoaderIfGlobeReady();

  let pixelRange = 15;
  let minimumClusterSize = 3;
  let enabled = true;

  dataSource.clustering.enabled = enabled;
  dataSource.clustering.pixelRange = pixelRange;
  dataSource.clustering.minimumClusterSize = minimumClusterSize;
  customStyle();
});


let helper = new Cesium.EventHelper();
helper.add(scene.globe.tileLoadProgressEvent, ev => {
  console.log("tiles to load = " + ev);
  if(ev === 0){
    console.log("and all tiles are now loaded");
    GLOBE_STATE.TILES_LOADED = true;
    hideLoaderIfGlobeReady();
  }
});

bing.readyPromise.then(() => {
  console.log("bing maps is ready!");
  GLOBE_STATE.MAPS_SOURCE_READY = true;
  hideLoaderIfGlobeReady();
});

const pickColor = Cesium.Color.BLACK.withAlpha(0.3);
const makeProperty = (entity, color) => {
  if(Cesium.defined(entity.polygon)){
    let colorProperty = new Cesium.CallbackProperty((time,result) => {
      if (pickedEntities.contains(entity)) {
        return pickColor.clone(result);
      }
      return color.clone(result);
    },
    false);
    entity.polygon.material = new Cesium.ColorMaterialProperty(colorProperty);
  }
}

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

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(12.4531362,41.9020481, 15000000)
});


let handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
let pickedEntities = new Cesium.EntityCollection();

handler.setInputAction((event) => {
  let pickedObjects = viewer.scene.drillPick(event.endPosition);
  //const pickedPrimitive = viewer.scene.pick(event.endPosition);
  //const pickedEntity = (Cesium.defined(pickedPrimitive)) ? pickedPrimitive.id : undefined;
  if(Cesium.defined(pickedObjects)){
    //Update the collection of picked entities.
    pickedEntities.removeAll();
    for (let i = 0; i < pickedObjects.length; ++i) {
      let entity = pickedObjects[i].id;
      if(Cesium.defined(entity.billboard)){
        entity.billboard.scale = 1.1;
        entity.label.pixelOffset = new Cesium.Cartesian2(0, -50);
      } else if(Cesium.defined(entity.polygon) && countryPolysDataSource.entities.getById(entity.id)){
        jQuery('#currentNation').text(entity.name);
      } else {
        jQuery('#currentNation').text('Planet earth');
      }
      pickedEntities.add(entity);
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


//viewer.flyTo(PilgrimageMarkers.StPeterBasilicaRome,{duration:5});

//jQuery Document Ready
$(function(){
  console.log('document ready!');
  GLOBE_STATE.DOCUMENT_READY = true;
  hideLoaderIfGlobeReady();
  $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
  $('.cesium-home-button').attr('title', 'Rome is Home!');
});

$(document).on('click', '#accordion > .nav-item > .nav-link', ev => {
  $('#accordion > .nav-item').removeClass('active');
  $(ev.currentTarget).closest('.nav-item').addClass('active');
});

$(document).on('change', '.togglebutton input[type="checkbox"]', ev => {
  let filter = $(ev.currentTarget).data('filter');
  let show = $(ev.currentTarget).prop("checked");
  markersDataSource.clustering.enabled = false;
  allMarkers.forEach((key,idx) => {
    if(CATEGORIES[filter].includes(key)) {
      PilgrimageMarkers[key].show = show;
    }
    if( idx === allMarkers.length - 1 ) {
      markersDataSource.clustering.enabled = true;
    }
  });
});
