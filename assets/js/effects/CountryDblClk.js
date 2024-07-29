import handler from "./ScreenSpaceEvent.js"
import { pickedEntities } from "./EntityHover.js"
import { countryDblClkWhoosh } from "./SoundEffects.js"
import { markersDataSource, countryPolysDataSource } from "../resources/DataSources.js"
import { allMarkers, PilgrimageMarkers } from "../entities/Markers.js"
import viewer from "../viewer/Viewer.js"

const entityDblClkCallback = (event) => {
    console.log(event);
    let pickedObjects = viewer.scene.drillPick(event.position);
    if(Cesium.defined(pickedObjects)) {
      //Update the collection of picked entities.
      pickedEntities.removeAll();
      for (let i = 0; i < pickedObjects.length; ++i) {
        let entity = pickedObjects[i].id;
        pickedEntities.add(entity);
        if(Cesium.defined(entity.polygon) && countryPolysDataSource.entities.getById(entity.id)) {
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
}

const defineEntityDblClk = (callback) => {
    //:FLYTO_COUNTRY_CLICKED
    handler.setInputAction(callback, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
}


export { entityDblClkCallback, defineEntityDblClk };
