/*
$sidebar = $('.sidebar');
$full_page = $('.full-page');
$sidebar_responsive = $('body > .navbar-collapse');
window_width = $(window).width();
*/

import { lang } from './i18n';
import { GLOBE_STATE, hideLoaderIfGlobeReady } from './GLOBE_STATE';
import viewer from './viewer';
import {
  OpenBusMarkers,
  openBusMarkersLayer,
  createOpenBusMarker,
  PilgrimageMarkers,
  allMarkers,
  CATEGORIES
} from './markers';
import { defineEntityHover, entityHoverCallback } from './entityHover';
import { dbFetch, loadDataSources, markersDataSource } from './datasources';
import { defineEntityDblClk, entityDblClkCallback } from './countryDblClk';
import { detectDoubleTapClosure, detectPinchStartClosure } from './mobileEvents';
import handler from './screenSpaceEventHandler';
import { backgroundMusic, zoomInBlob, zoomOutBlob, switchSound } from './soundEffects';
import { spinAndZoom } from './globeAnimation';
import { zoomCheck } from './cameraZoomState';

console.log(location.hostname + location.pathname + ' : lang set to ' + lang);


/** QUALIFY OUR CESIUM VIEWER WITH MAPS IMAGERY, TERRAIN, AND CHECK READY STATES */

Cesium.BingMapsImageryProvider.fromUrl( 'https://dev.virtualearth.net', {
  key : BING_ACCESS_TOKEN,
  mapStyle : Cesium.BingMapsStyle.AERIAL
}).then((res) => {
  const imageryLayer = Cesium.ImageryLayer.fromProviderAsync(res);
  viewer.imageryLayers.add(imageryLayer);
  console.log("%cbing maps is ready!", 'color: yellow;background-color:blue;padding:2px');
  GLOBE_STATE.MAPS_SOURCE_READY = true;
  hideLoaderIfGlobeReady();
});

Cesium.createWorldTerrainAsync({
  requestVertexNormals: true,
  requestWaterMask: true
}).then((res) => {
  console.log('%cworld terrain provider is ready, with watermask!', 'color: yellow;background-color:blue;padding:2px');
  viewer.terrainProvider = res;
  GLOBE_STATE.TERRAIN_READY = true;
  hideLoaderIfGlobeReady();
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

let helper = new Cesium.EventHelper();
helper.add(viewer.scene.globe.tileLoadProgressEvent, ev => {
  //console.log("tiles to load = " + ev);
  if(ev === 0){
    console.log("all tiles are now loaded");
    GLOBE_STATE.TILES_LOADED = true;
    hideLoaderIfGlobeReady();
  }
});



/** DEFINE CUSTOM MARKERS AND LABELS AND COLLECTIONS */
openBusMarkersLayer.show = false;

OpenBusMarkers.forEach( marker => {
  createOpenBusMarker( marker.position.cartographicDegrees[ 1 ], marker.position.cartographicDegrees[ 0 ], marker.name, marker.description );
} );


/** START LOADING DATA SOURCES AND DEFINE PROMISES */
dbFetch();
loadDataSources();

/** DEFINE INTERACTIONS FOR HOVERED ENTITIES (MARKERS, POLYGONS, POLYLINES) */

defineEntityHover(entityHoverCallback);

defineEntityDblClk(entityDblClkCallback);

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


/* Regex test to determine if user is on mobile */
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  document.body.addEventListener('touchend', detectDoubleTapClosure());
  document.body.addEventListener('touchstart', detectPinchStartClosure());
}

/** DEFINE HTML DOCUMENT INTERACTIONS */

//jQuery Document Ready
$(function(){
  console.log('document ready!');
  GLOBE_STATE.DOCUMENT_READY = true;
  hideLoaderIfGlobeReady();
  $('.sidebar .sidebar-wrapper, .main-panel').perfectScrollbar();
  $('.cesium-home-button').attr('title', 'Rome is Home!');
});


let audioCtx;
let gainNode;
let audioSource;
let audioParam = null;
let unsubscribeTicks;
let unsubscribeZoomCheck;
$(document).on('click', ev => {
  if( $('#loadingModal').is(":visible") ) {
    audioCtx = new AudioContext();
    gainNode = audioCtx.createGain();
    audioSource = audioCtx.createMediaElementSource(backgroundMusic);
    gainNode.gain.value = 0.3; // 50 %
    audioSource.connect(gainNode).connect(audioCtx.destination);
  
    if(backgroundMusic.paused) {
      backgroundMusic.play();
      unsubscribeTicks = viewer.clock.onTick.addEventListener(spinAndZoom);
    }
    $('#loadingModal').fadeOut('slow');
  } else {
    unsubscribeTicks();
    //console.log('background music is paused: ' + backgroundMusic.paused);
    if(backgroundMusic.paused === false) {
      if( audioParam === null ) { //just to make sure setValueCurveAtTime doesn't get set more than once within an overlapping time period
        audioParam = gainNode.gain.setValueCurveAtTime([0.3,0.2,0.1,0.05,0.01], audioCtx.currentTime, 3);
        setTimeout(() => {
          backgroundMusic.pause();
          audioParam = null;
        },3100);  
      }
    }
    unsubscribeZoomCheck = viewer.scene.preRender.addEventListener(zoomCheck);
  }
});

$(document).on('click', '#accordion > .nav-item > .nav-link', ev => {
  $('#accordion > .nav-item').removeClass('active');
  $(ev.currentTarget).closest('.nav-item').addClass('active');
  if(sidebarClickSound.paused) {
    sidebarClickSound.play();
  } else {
    sidebarClickSound.currentTime = 0;
  }
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
  if(switchSound.paused) {
    switchSound.play();
  } else {
    switchSound.currentTime = 0;
  }
});
