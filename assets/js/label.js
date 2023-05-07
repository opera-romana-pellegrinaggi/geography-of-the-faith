let label = {
    font: 'bold 14pt Arial',
    backgroundColor: new Cesium.Color( 0.165, 0.165, 0.165, 0.8 ),
    showBackground: true,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineWidth: 2,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    pixelOffset: new Cesium.Cartesian2( 0, -40 ),
    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY,
    show: false
}

export default label;
