import OpenBusMarkers from '../resources/OpenBusMarkers';
import label from './MarkerLabel';
import { markersLayer, openBusMarkersLayer } from './EntityLayers';
import { pinBuilder } from './DigitPins';

const openBusMarker = {
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAMAAACfWMssAAAACXBIWXMAAAAcAAAAHAAPAbmPAAAAvVBMVEUAAAAAAAAAAAAAAAAAAAAAAADOzs5ycnIFBQXr6+v///9aWlqSkpL////////////////////////v7+9+fn7////7+/v////////////////m5ub7+/vz8/P39/fOzs7///////+urq7KysqGhob////mUQD/+/vrdjX3wqbztpL3yrLvnm775tr/8+/zpn7mWg377+braiXrgkn73srmVgXvnnLzrormUQXmXhXzupr77+v78+vmWgnvjl4Q9G0WAAAAJXRSTlMAUQ0wGUmycjnakmp+JUk5xuZq2na689qK987O9+bzrjEJkn5JnsBJ6AAAAstJREFUeNrt/cWC4zAMhgGEg+VyYVB2uFyeef/HWicFQzOF217+Y+wvlmRJ1lH6T1SqO63OGONxp+XUS89S790acKp135/AylWy9RDEi/lutdrNF3FwIB+q5QdYhWDH0Eec/PBI0Mod7MMBmK1/0I1+1jMA5+MvrtQHvJmiQk03GPp/hKnShsRHf8pPoF1obrkH0RTd0TSCXkGMKj3Yb9FdbffQuzmz1IY9eqg9tAU/P/oQbR+D2wj6fGwdSKboCU0TcDgHAbPx9CfBcpZiAJzOlsGEW8LAulmFDV1bJCAoWdDVDVQpV4YZNfQXw43wLzV2BmXmwDVdSKFAKf3xmh75Dkean79QKHrkzxEuVdaFEDE/LBQ1CYXQPYM1YOI2AfC3gnyACd3hQ+3EleCAeBAJ4kF0gFP61CF4DQygnoMOxK+B8Tl7WrB4DVxAKwc7MH8NnEMnB8ewew3cwTgHMax4MAoERTy4AlwMFqkIvDH1EXgxdSQG5xE4h1EODsTrgGW4pMgyTEC8jkEOGmICRKssO84iLWy1FBPAyMEvMeXi/K9nZdasxZT7ysFvMclDxLga5zuFJP/OQY0rK1LIeOLH1/6Rxn72E1rIWVlpOai8sYW8K24dzI2F8KacCtJkW0dx72AOJK3DPHGSarOdYU724YhRZjVz02uw1TOoeGx7zMAUMUo5kLRH72ypJFk205AzkA0zymYA6uIGbOvCSZrJPgEBCSsLTjCmF02eAFO7gpJlPP/oGPRA4qXcePaZa8gKA0qq++zD6qoSJ705fOYpHzZ1npMU3Rs+Hh6Gnq4IoKTpzcfjSlMnEb0l3cb9AanhFnEZKRv3RjJDLuYyP2XT/msItE351r+rVFn2bCgYO21PllXpjhRLls03cdB9M2XZUqT70ggqu5/GYJSN1qOB8emSD5YmPZai6jInXVWkJ6VoqqXnslStmPoHjhdHI1NHJmUAAAAASUVORK5CYII=",
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 32,
    height: 32,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    scaleByDistance: new Cesium.NearFarScalar( 500, 1, 1500000, 0.2 )
};

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

const createMarkerDef = ( markericon, markercolor ) => {
    return {
        image: pinBuilder.fromMakiIconId( markerIconMap[ markericon ], Cesium.Color[ markercolor ], 36 ),
        color: Cesium.Color[ markerContrastMap[ markercolor ] ],
        ...markerBase
    }
};

let createMarker = ( latitude, longitude, marker, name, description, properties, show ) => markersLayer.entities.add( {
    position: Cesium.Cartesian3.fromDegrees( longitude, latitude ),
    name: name,
    description: description,
    billboard: marker,
    show: show,
    label: { ...label, text: name },
    properties: properties
} );

let createOpenBusMarker = ( latitude, longitude, name, description ) => openBusMarkersLayer.entities.add( {
    position: Cesium.Cartesian3.fromDegrees( longitude, latitude ),
    name: name,
    description: description,
    billboard: openBusMarker,
    show: true
} );
//LATITUDE: increasing the value will increase vertical position, towards north
//LATITUDE: decreasing the value will decrease vertical position, towards south
//LONGITUDE: increase = move east
//LONGITUDE: decrease = move west
/* 
const biblicalSitePin = {
    image: pinBuilder.fromText("!", Cesium.Color.DARKRED, 36).toDataURL(), // ✡ Star of David
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 36,
    height: 36,
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
}
 */

let PilgrimageMarkers = {};
let allMarkers = [];


export {
    OpenBusMarkers,
    openBusMarker,
    markerBase,
    markerContrastMap,
    markerIconMap,
    createMarkerDef,
    markersLayer,
    openBusMarkersLayer,
    createMarker,
    createOpenBusMarker,
    label,
    CATEGORIES,
    PilgrimageMarkers,
    allMarkers
};
