/** 
 * DigitPins
 * pins (map markers) with digits
 * useful as pins for clustered entities
 * to showing how many entities are in a cluster
 * 
 * Single digits 2-9 are handled by the singleDigitPins array
 * When more than 9 entities are in a cluster,
 * the number of entities in the cluster will be indicated by the nearest 10
 * 
 */

let pinBuilder = new Cesium.PinBuilder();

const pin50 = pinBuilder.fromText("50+", Cesium.Color.RED, 48).toDataURL();
const pin40 = pinBuilder.fromText("40+", Cesium.Color.ORANGE, 48).toDataURL();
const pin30 = pinBuilder.fromText("30+", Cesium.Color.YELLOW, 48).toDataURL();
const pin20 = pinBuilder.fromText("20+", Cesium.Color.GREEN, 48).toDataURL();
const pin10 = pinBuilder.fromText("10+", Cesium.Color.BLUE, 48).toDataURL();

const createSingleDigitPins = () => {
    let singleDigitPins = new Array(8);
    for (let i = 0; i < singleDigitPins.length; ++i) {
      singleDigitPins[i] = pinBuilder
        .fromText("" + (i + 2), Cesium.Color.DARKRED, 48)
        .toDataURL();
    }
    return singleDigitPins;
}

const singleDigitPins = createSingleDigitPins();

export { pinBuilder, pin50, pin40, pin30, pin20, pin10, singleDigitPins };
