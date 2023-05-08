import { GLOBE_STATE, hideLoaderIfGlobeReady } from "../viewer/GLOBE_STATE"

const backgroundMusic = new Audio();
backgroundMusic.src = "assets/media/audio/The Empty Moons of Jupiter - DivKid.mp3"; //Earth Appears - Brian Bolger.mp3
backgroundMusic.loop = true;
backgroundMusic.onloadstart = ev => {
    console.log('background music has started to load...');
    //console.log(backgroundMusic);
    //console.log(ev);
};
backgroundMusic.oncanplay = ev => {
    console.log('background music is ready to start playing');
    console.log(ev);
    GLOBE_STATE.BACKGROUND_MUSIC_READY = true;
    hideLoaderIfGlobeReady();
};
backgroundMusic.onplay = ev => {
    console.log('background music is playing');
    console.log(ev);
};
backgroundMusic.onpause = ev => {
    console.log('background music has been paused');
    console.log(ev);
}


const countryDblClkWhoosh = new Audio();
countryDblClkWhoosh.src = "assets/media/audio/whoosh-6316.mp3";

const sidebarClickSound = new Audio();
sidebarClickSound.src = "assets/media/audio/interface-124464.mp3";

const switchSound = new Audio();
switchSound.src = "assets/media/audio/button-124476.mp3";

const hoverSound = new Audio();
hoverSound.src = "assets/media/audio/high-pitch-click-47137.mp3";

let zoomOutBlob;
let zoomInBlob;
let zoomInBlobPromise = fetch("assets/media/audio/woosh-1-84800.mp3");
let zoomOutBlobPromise = fetch("assets/media/audio/woosh-2-6471.mp3");
let respInBlobPromise = zoomInBlobPromise.then(resp => resp.blob());
let respOutBlobPromise = zoomOutBlobPromise.then(resp => resp.blob());
let audioInBlobPromise = respInBlobPromise.then(blob => {
    zoomOutBlob = URL.createObjectURL(blob);
    new Audio(zoomOutBlob);
  });
let audioOutBlobPromise = respOutBlobPromise.then(blob => {
    zoomInBlob = URL.createObjectURL(blob);
    new Audio(zoomInBlob);
});


// const zoomOut = new Audio();
// zoomOut.src = "assets/media/audio/woosh-1-84800.mp3";

// const zoomIn = new Audio();
// zoomIn.src = "assets/media/audio/woosh-2-6471.mp3";

export { backgroundMusic, countryDblClkWhoosh, sidebarClickSound, switchSound, zoomOutBlob, zoomInBlob, hoverSound };
