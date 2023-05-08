
import viewer from "../viewer/Viewer";
import { pickedEntities } from "./EntityHover";
import { countryPolysDataSource } from "../resources/DataSources";
import { countryDblClkWhoosh } from "./SoundEffects";
import { markersDataSource } from "../resources/DataSources";
import { PilgrimageMarkers, allMarkers } from "../entities/Markers";

let scaling = false;

/** Double tap event for mobile */
const detectDoubleTapClosure = () => {
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
            setTimeout(() => {
              if(countryDblClkWhoosh.paused) {
                countryDblClkWhoosh.play();
              } else {
                countryDblClkWhoosh.currentTime = 0;
              }
            }, 100);
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

export { detectDoubleTapClosure, detectPinchStartClosure };
