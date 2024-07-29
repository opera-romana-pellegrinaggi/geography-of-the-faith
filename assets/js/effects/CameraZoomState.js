import viewer from "../viewer/Viewer.js";
import { zoomInBlob, zoomOutBlob } from "./SoundEffects.js";

let lastHeight;
let lastHeightCheck;

const zoomCheck = () => {
  let currentHeight = viewer.scene.camera.positionCartographic.height;
  let currentHeightCheck = Date.now();
  if( typeof lastHeightCheck === 'undefined' ) {
    lastHeightCheck = Date.now();
  }
  if( typeof lastHeight === 'undefined' ) {
    lastHeight = viewer.scene.camera.positionCartographic.height;
  }
  if( lastHeight !== currentHeight ) {
    if(lastHeight > currentHeight) {
      if( currentHeightCheck - lastHeightCheck > 50 ) { //if more than 50ms since last check
        console.log('camera has zoomed in');
        new Audio(zoomInBlob).play();
        // if( zoomIn.paused && zoomOut.paused ) {
        //   zoomIn.play();
        // } else {
        //   if( zoomOut.paused === false ) {
        //     zoomOut.pause();
        //     zoomOut.currentTime = 0;
        //   }
        //   if( zoomIn.paused === false ) {
        //     zoomIn.currentTime = 0;
        //   } else {
        //     zoomIn.play();
        //   }
        // }
      }
    }
    else if ( lastHeight < currentHeight ) {
      if( currentHeightCheck - lastHeightCheck > 50 ) { //if more than 50 ms since last check
        console.log('camera has zoomed out');
        new Audio(zoomOutBlob).play();
        // if( zoomOut.paused && zoomIn.paused ) {
        //   zoomOut.play();
        // } else {
        //   if( zoomIn.paused === false ) {
        //     zoomIn.pause();
        //     zoomIn.currentTime = 0;
        //   }
        //   if( zoomOut.paused === false ) {
        //     zoomOut.currentTime = 0;
        //   } else {
        //     zoomOut.play();
        //   }
        // }
      }
    }
    lastHeight = currentHeight;
    lastHeightCheck = currentHeightCheck;
  }
};

export { zoomCheck };
