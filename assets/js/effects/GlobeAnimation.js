import viewer from "../viewer/Viewer";

let lastNow = Date.now();
const initialMoveDistance = 25000;

const targetDistance = 15000000;

const spinAndZoom = () => {
  const now = Date.now();
  const spinRate = 0.01;
  const delta = (now - lastNow) / 1000;
  lastNow = now;
  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, -spinRate * delta);
  const cameraPosition = viewer.scene.camera.positionWC;
  const ellipsoidPosition = viewer.scene.globe.ellipsoid.scaleToGeodeticSurface(cameraPosition);
  const distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(cameraPosition, ellipsoidPosition, new Cesium.Cartesian3()));
  const baseDistance = Math.floor(distance);
  const moveDistance = Math.floor(initialMoveDistance * ( (baseDistance - targetDistance) / targetDistance) );
  //if( Math.floor(delta) % 50 === 0 ) {
  //  console.log('current distance is ' + baseDistance);
  //  console.log('move distance = ' + moveDistance);
  //}
  if( baseDistance > targetDistance ) {
    if( baseDistance - targetDistance < 1000 ) {
      viewer.scene.camera.moveForward(baseDistance - targetDistance);
    } else {
      viewer.scene.camera.moveForward(moveDistance);
    }
  }
}

export { spinAndZoom };
