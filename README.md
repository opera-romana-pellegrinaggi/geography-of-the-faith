# Geography of the Faith
An interactive globe, presenting the Geography of Christian pilgrimage sites throughout different countries

|Code quality|
|:----------:|
|[![CodeFactor](https://www.codefactor.io/repository/github/opera-romana-pellegrinaggi/geography-of-the-faith/badge)](https://www.codefactor.io/repository/github/opera-romana-pellegrinaggi/geography-of-the-faith)|

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


# Repository branches

There are currently three branches with three different approaches. The first two attempts were not very successful, the third attempt has been more successful and is now the `main` branch.

1) [ThreeJS branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/threeJS): this was the very first attempt at creating an interactive globe, using `ThreeJS` to create a 3d scene of a globe with an earth image as the texture of the 3d sphere. Does not incorporate geometry with country boundaries (at least successfully)...
2) [D3js branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/D3js): following the first unsuccesfull attempt at creating country boundaries with `ThreeJS`, this was an attempt to solve the issue by implementing `D3.js` which seems to do a better job for geographic data. `D3.js` however needs to be bridged to `ThreeJS.js`, so this an attempt to utilize `D3-threeD.js` to fill the gap. However `D3-threeD.js` isn't updated much, and I didn't have much success in getting it to play nicely with the current versions of `ThreeJS` and `D3.js`... This attempt was ultimately abandoned in favor of using `CesiumJS`, which is now utilized in the `main` branch.
3) [Main branch](https://github.com/opera-romana-pellegrinaggi/geography-of-the-faith/tree/main): takes a completely different approach, using `Cesium.js`. This branch has successfully implemented an interactive country boundary layer, and Cesium can ingest data layers such as KML, KMZ, GeoJSON, it's own CZML format, etc.

# Local development

This project uses Yarn v4, but continues to implement `node-modules` rather than `pnp`, simply because it's simpler to link to static resources in the `node-modules` folder. There aren't any build steps, simply run `corepack enable` and `yarn install`. This should create the required `node-modules` folder.

We are linking directly to assets in the `node_modules` folder, such as `material-dashboard-dark-edition` and the Cesium build.

The reason we decided to use a local `node_modules` rather than link from a CDN, is that the Cesium scripts attempt to create workers but cannot do so from a remote script on a CDN, the script must be local. This also makes it easier to keep dependencies up to date with the latest versions using Yarn / Dependabot.

This repo combines together a frontend (`index.php`) and a backend (`geofaith_backend.php`). The backend talks with a database and produces results from the database in JSON format, consumable by the frontend.

In order to launch the backend database, use the docker compose file in the `.docker` folder. You will first have to set your environment variables in a `.env.development` (or `.env`) file, using `.env.development.example` as an example. All environment variables in `.env.development.example` are required except for `ADMINER_PORT` which is optional: if you have other projects exposing a port for Adminer you can prevent any conflicts by customizing the port.

For local development, you should also keep `MYSQLDNS` with a value of `mysql:unix_socket=./socket/mysqld.sock`. In order to avoid any complications with localhost addresses and ports (sometimes Docker will set an IPV6 address, and WSL will have it's own IP address that's not 127.0.0.1 ...) we figured we'll keep things simple and use a unix socket. This way we don't have to expose any ports, and don't risk any conflict with other services running on your local system.

The socket is defined in  `.docker/custom-socket.cnf` and will be created at `.docker/socket/mysqld.sock` when the Docker container is created.

In order to create an `ION_ACCESS_TOKEN`, see https://cesium.com/learn/ion/cesium-ion-access-tokens/ .

In order to create a `BING_ACCESS_TOKEN`, see https://learn.microsoft.com/en-us/bingmaps/getting-started/bing-maps-dev-center-help/getting-a-bing-maps-key .

Once all the environment variables are set, you can spin up the docker compose project from within the `.docker` folder, keeping in mind that the `.env.development` (or simply `.env`) file is in the root folder of the repository, not in the `.docker` folder, so you should point to the environment file when starting the compose project:

```bash
docker compose --env-file ../.env.development up -d
```
or
```bash
docker compose --env-file ../.env up -d
```

Once the containers are started and the unix socket is created, you can then launch the project:

```bash
php -S localhost:8000
```

Now when visiting localhost:8000 in your browser, you should see the loading screen, and after about 20-40 secs. you should get the message that the multimedia experience is ready.
