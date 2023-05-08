import { openBusMarkersLayer } from "../entities/Markers";

const GLOBE_STATE = {
    MAPS_SOURCE_READY: false,
    TERRAIN_READY: false,
    DOCUMENT_READY: false,
    MARKERS_LAYER_READY: false,
    OPENBUS_MARKERS_LAYER: false,
    MARKERS_CREATED: false,
    COUNTRY_POLYS_READY: false,
    COUNTRY_BORDERS_READY: false,
    OMNIA_VR_READY: false,
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

export { GLOBE_STATE, isGlobeReady, hideLoaderIfGlobeReady };
