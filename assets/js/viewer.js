/** viewer.js
 *  create our Cesium globe setting default Cesium options
 */

const createViewer = () => {
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

    //we remove the default double click action, because we will implement a flyTo for a country polygon on double click
    //see :FLYTO_COUNTRY_CLICKED
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    //set our initial camera view for our pilgrimage globe
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(12.4531362,41.9020481, 30000000)
    });

    viewer.scene.skyAtmosphere.show = false;
    viewer.scene.fog.enabled = true;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.globe.enableLighting = true;
    viewer.scene.globe.dynamicAtmosphereLighting = true;
    viewer.scene.globe.dynamicAtmosphereLightingFromSun = true;
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
    viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500;
    viewer.scene.globe.depthTestAgainstTerrain=true;

    let lensFlare = viewer.scene.postProcessStages.add(
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

    return viewer;
}

const viewer = createViewer();

export default viewer;





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
