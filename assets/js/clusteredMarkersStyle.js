import { markersLayer } from "./markers";
import { pin10, pin20, pin30, pin40, pin50, singleDigitPins } from "./digitpins";

let eventListener;
let clusteredMarkers = [];

//handle styles for clustered markers
let customClusterStyle = () => {
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

export default customClusterStyle;
