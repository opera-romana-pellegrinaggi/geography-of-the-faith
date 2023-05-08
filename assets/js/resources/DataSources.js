import { lang } from '../i18n/I18n';
import { CATEGORIES, createMarker, createMarkerDef, PilgrimageMarkers, allMarkers, markersLayer, openBusMarkersLayer } from '../entities/Markers';
import { GLOBE_STATE, hideLoaderIfGlobeReady } from '../viewer/GLOBE_STATE';
import viewer from '../viewer/Viewer';
import customClusterStyle from '../entities/ClusteredMarkers';
import { makeProperty } from '../effects/EntityHover';

const ENDPOINT = `https://${location.hostname}${location.pathname}geofaith_backend.php`;
let markersDataSource;
let openBusRouteDataSource;
let openBusMarkersDataSource;
let countryBordersDataSource;
let countryPolysDataSource;

const dbFetch = () => {
    //let databaseResults;
    let params = new URLSearchParams({
        LANG: lang.toUpperCase()
    });
    let databasePromise = fetch(`${ENDPOINT}?${params.toString()}`);
    databasePromise.then((response) => response.json()).then((json) => {
      //databaseResults = json;
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
    //return databaseResults;
}

const loadDataSources = () => {
  let markersLayerPromise = viewer.dataSources.add(markersLayer);
  markersLayerPromise.then(dataSource => {
    markersDataSource = dataSource;
    console.log("markersLayer is ready!");
    GLOBE_STATE.MARKERS_LAYER_READY = true;
    hideLoaderIfGlobeReady();
  
    dataSource.clustering.enabled = true;
    dataSource.clustering.pixelRange = 15;
    dataSource.clustering.minimumClusterSize = 3;
    customClusterStyle();
  });
  
  let omniaVaticanRomeDataSourcePromise = viewer.dataSources.add(
    Cesium.CzmlDataSource.load('assets/dataSources/OpenBus/OpenBusRoute.czml')
  );
  omniaVaticanRomeDataSourcePromise.then(dataSource => {
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
  
  let openBusMarkersLayerPromise = viewer.dataSources.add(openBusMarkersLayer);
  openBusMarkersLayerPromise.then(dataSource => {
    openBusMarkersDataSource = dataSource;
    console.log("OpenBus markers layer is ready!");
    GLOBE_STATE.OPENBUS_MARKERS_LAYER = true;
    hideLoaderIfGlobeReady();
  });


  let countryBordersPromise = viewer.dataSources.add(
    Cesium.KmlDataSource.load('assets/dataSources/countries/country-borders.kmz', {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: true
    })
  );
  countryBordersPromise.then(dataSource => {
    countryBordersDataSource = dataSource;
    console.log("country borders kmz is ready!");
    GLOBE_STATE.COUNTRY_BORDERS_READY = true;
    hideLoaderIfGlobeReady();
  });
  
  let countryPolysPromise = viewer.dataSources.add(
    Cesium.KmlDataSource.load('assets/dataSources/countries/polygons.kmz', {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas,
      clampToGround: true
    })
  );
  countryPolysPromise.then(dataSource => {
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

}



export { dbFetch, loadDataSources, markersDataSource, openBusRouteDataSource, openBusMarkersDataSource, countryBordersDataSource, countryPolysDataSource };


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
