# geography-of-the-faith
An interactive website, presenting the Geography of the Catholic Faith throughout different countries

The data layer can be coordinated in the repository https://github.com/opera-romana-pellegrinaggi/maps-of-the-faith .

There are currently three branches with three different approaches:

1) [Main branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/main): uses `ThreeJS` to create a 3d scene of a globe with an earth image as the texture of the 3d sphere. Does not incorporate geometry with country boundaries (at least successfully)...
2) [Main2 branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/main2): attempts to solve the issue of geometry of country boundaries from branch Main, by implementing `D3.js` which seems to do a better job for geographic data. `D3.js` however needs to be bridged to `ThreeJS.js`, so this an attempt to utilize `D3-threeD.js` to fill the gap. However `D3-threeD.js` isn't update much, and I didn't have much success in getting it to play nicely with the current versions of `ThreeJS` and `D3.js`...
3) [Main3 branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/main3): takes a completely different approach, using `Cesium.js`. This branch has successfully implemented an interactive country boundary layer, and Cesium can ingest data layers such as KML, KMZ, GeoJSON, it's own CZML format, etc.
