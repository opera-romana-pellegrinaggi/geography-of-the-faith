# Geography of the Faith
An interactive globe, presenting the Geography of Christian pilgrimage sites throughout different countries

Jesus Christ is God made man.
From the height of the heavens, he descended upon earth, in a specific time and place.
He was born in **Bethlehem of Judea**, grew up in **Nazareth of Galilee**, and lived in **Capernaum** along the shores of the **Sea of Galilee**.
He walked to towns in **Lebanon**, in **Syria**, in **Galilee**, in the **Decapolis**, in **Samaria**, in **Judea**, and finally died on the cross in **Jerusalem** outside of the city walls.
He entered into human history, and walked with us along the streets of our towns.
When God intervenes in human history, he intervenes at specific times and in specific places.
Salvation history is linked to human history and to human geography.

This project aims to map out all those places that have been touched in some way by the grace of God.
Whether they are places where Jesus walked, or where biblical episodes took place, or where saints gave witness to the Gospel, or where human expressions of faith through art and beauty sing the glories of God...

This project aims, among other things, to show how Christianity has spread to the ends of the earth, according to the invitation that Jesus made to his apostles before ascending into heaven:

> *"All power in heaven and on earth has been given to me. Go, therefore, and make disciples of all nations, baptizing them in the name of the Father, and of the Son, and of the holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, until the end of the age." (Matthew 28:18-20)*

and

> *"You will receive power when the holy Spirit comes upon you, and you will be my witnesses in Jerusalem, throughout Judea and Samaria, and to the ends of the earth." (Acts 1:8)*

# CesiumJS

This project implements the open source project [CesiumJS](https://github.com/CesiumGS/cesium) for rendering of the globe, markers, polygons and polylines.

The data layer can be coordinated in the repository https://github.com/opera-romana-pellegrinaggi/maps-of-the-faith .

There are currently three branches with three different approaches:

# Repository branches

1) [ThreeJS branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/threeJS): this was the very first attempt at creating an interactive globe, using `ThreeJS` to create a 3d scene of a globe with an earth image as the texture of the 3d sphere. Does not incorporate geometry with country boundaries (at least successfully)...
2) [D3js branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/D3js): following the first unsuccesfull attempt at creating country boundaries with `ThreeJS`, this was an attempt to solve the issue by implementing `D3.js` which seems to do a better job for geographic data. `D3.js` however needs to be bridged to `ThreeJS.js`, so this an attempt to utilize `D3-threeD.js` to fill the gap. However `D3-threeD.js` isn't updated much, and I didn't have much success in getting it to play nicely with the current versions of `ThreeJS` and `D3.js`... This attempt was ultimately abandoned in favor of using `CesiumJS`, which is now utilized in the `main` branch.
3) [Main branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/main): takes a completely different approach, using `Cesium.js`. This branch has successfully implemented an interactive country boundary layer, and Cesium can ingest data layers such as KML, KMZ, GeoJSON, it's own CZML format, etc.
