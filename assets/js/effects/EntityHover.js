import handler from "./ScreenSpaceEvent.js";
import { openBusRouteDataSource, countryPolysDataSource } from "../resources/DataSources.js";
import viewer from "../viewer/Viewer.js";
import { hoverSound } from "./SoundEffects.js";

//pickedEntities is the collection of currently hovered polygons
//it is renewed every time the mouse moves and detects a hover over a polygon
let pickedEntities = new Cesium.EntityCollection();
let openBusRoutePicked = new Cesium.EntityCollection();
let hoveredEntities = new Cesium.EntityCollection();

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

const entityHoverCallback = (event) => {
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
        if( hoverSound.paused ) {
          hoverSound.play();
        } else {
          hoverSound.currentTime = 0;
        }
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
            if( hoverSound.paused ) {
              hoverSound.play();
            } else {
              hoverSound.currentTime = 0;
            }
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
}


const defineEntityHover = (callback) => {
  handler.setInputAction(callback, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

export { pickedEntities, openBusRoutePicked, hoveredEntities, pickColor, openBusRoutePickColor, makeProperty, defineEntityHover, entityHoverCallback };
