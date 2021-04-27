Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5YzNlODY2Yy0yZjY1LTRkMDktOTViYi02M2I3M2NjMTg3YmIiLCJpZCI6NTM3MjUsImlhdCI6MTYxOTM1MzA0NX0.t8ZCZb4qQKgU2sQbzAwgZ85ReK07ZmRZjnecUP8IE9Y';
//Cesium.BingMapsApi.defaultKey = 'AsRSrIU0SOTDG268mtY0kyGIN86fK07A9rjb5QPWU-9kW64slsXWdhTe0thkvykQ';
const lang = location.hostname.includes('geografiadellafede') ? 'it' : 'en';

var bing = new Cesium.BingMapsImageryProvider({
  url : 'https://dev.virtualearth.net',
  key : 'AsRSrIU0SOTDG268mtY0kyGIN86fK07A9rjb5QPWU-9kW64slsXWdhTe0thkvykQ',
  mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS_ON_DEMAND
});

let mapTiler = new Cesium.UrlTemplateImageryProvider({
  url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=SxVQSzWgRNS3fbFsWN4k',
  tileWidth: 512,
  tileHeight: 512,
  credit: null
});

let viewer = new Cesium.Viewer('map', {
  animation: false,
  baseLayerPicker: false,
  sceneModePicker: false,
  navigationHelpButton: true,
  homeButton: true,
  geocoder: true,
  fullscreenButton: true,
  imageryProvider: bing, //mapTiler
  timeline: false,
  scene3DOnly: true,
  shadows: true,
  creditContainer: document.getElementById("credits"),
  creditViewport: null
});

let scene = viewer.scene;
scene.skyAtmosphere.show = false;
scene.fog.enabled = false;
scene.globe.showGroundAtmosphere = false;
scene.screenSpaceCameraController.maximumZoomDistance = 30000000;
scene.screenSpaceCameraController.minimumZoomDistance = 1000;

let frame = viewer.infoBox.frame;
frame.addEventListener('load', function () {
  let cssLink = frame.contentDocument.createElement('link');
  cssLink.href = 'assets/css/infoBox.css';
  cssLink.rel = 'stylesheet';
  cssLink.type = 'text/css';
  frame.contentDocument.head.appendChild(cssLink);
}, false);

let pinBuilder = new Cesium.PinBuilder();

const pin50 = pinBuilder
.fromText("50+", Cesium.Color.RED, 48)
.toDataURL();
const pin40 = pinBuilder
.fromText("40+", Cesium.Color.ORANGE, 48)
.toDataURL();
const pin30 = pinBuilder
.fromText("30+", Cesium.Color.YELLOW, 48)
.toDataURL();
const pin20 = pinBuilder
.fromText("20+", Cesium.Color.GREEN, 48)
.toDataURL();
const pin10 = pinBuilder
.fromText("10+", Cesium.Color.BLUE, 48)
.toDataURL();

let singleDigitPins = new Array(8);
for (let i = 0; i < singleDigitPins.length; ++i) {
  singleDigitPins[i] = pinBuilder
    .fromText("" + (i + 2), Cesium.Color.DARKRED, 48)
    .toDataURL();
}

const placeOfWorship = {
  RED: {
    image: pinBuilder.fromMakiIconId("place-of-worship", Cesium.Color.DARKRED, 36),
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 36,
    height: 36
  },
  BLUE: {
    image: pinBuilder.fromMakiIconId("place-of-worship", Cesium.Color.DARKBLUE, 36),
    color: Cesium.Color.WHITE,
    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    width: 36,
    height: 36
  }
};

let label = {
  font : 'bold 14pt Arial',
  backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8),
  showBackground: true,
  style: Cesium.LabelStyle.FILL_AND_OUTLINE,
  outlineWidth : 2,
  verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
  pixelOffset : new Cesium.Cartesian2(0, -40)
}

let markersLayer = new Cesium.CustomDataSource();

let createMarker = (latitude,longitude,title,marker,description) => markersLayer.entities.add({
    name : title[lang],
    description: description[lang],
    position : Cesium.Cartesian3.fromDegrees(longitude,latitude),
    billboard : marker,
    label : { ...label, text: title[lang]}
  });
//LATITUDE: increasing the value will increase vertical position, towards north
//LATITUDE: decreasing the value will decrease vertical position, towards south
//LONGITUDE: increase = move east
//LONGITUDE: decrease = move west
let PilgrimageMarkers = {
  StPeterBasilicaRome: createMarker(
    41.9020481,12.4531362,
    {
      en: "Saint Peter's Basilica",
      it: "Basilica di San Pietro"
    },
    placeOfWorship.RED,
    {
      en: '<p class="justify"><img alt="Saint Peters Basilica" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/320px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg" width="320" height="167" class="entityImage" />The Basilica of Saint Peter is the main pilgrimage destination for all of christianity, after the Holy Land. This is the burial site of Saint Peter, prince of the Apostles and first Bishop of Rome; the tomb is directly below the high altar of the basilica. For this reason, many popes have been interred at St. Peter\'s since the Early Christian period. A church has stood on this site since the time of the Roman emperor Constantine the Great. Old St. Peter\'s Basilica dates from the 4th century AD. Construction of the present basilica began on 18 April 1506 and was completed on 18 November 1626.</p><p class="linkBookVisitContainer"><a class="linkBookVisit" href="https://www.omniavaticanrome.org/en/cards/la-basilica-di-san-pietro">Book your visit</a></p>',
      it: '<p class="justify"><img alt="La Basilica di San Pietro" src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/320px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg" width="320" height="167" class="entityImage" />La Basilica di San Pietro è la principale destinazione del pellegrinaggio cristiano, dopo la Terra Santa. Qui c\è la tomba di San Pietro, principe degli Apostoli e primo Vescovo di Roma; la tomba si trova direttamente sotto l\'altare principale della basilica. Per questo motivo, molti dei papi, successori di San Pietro, sono stati sepolti nella Basilica sin dai primordi del cristianesimo. La prima chiesa in questo sito risale all\'epoca dell\'Imperatore Costantino il Grande, nel sec. IV d.C. La costruzione della basilica attuale ebbe inizio il 18 aprile 1506 e fu completata il 18 novembre 1626.</p><p class="linkBookVisitContainer"><a class="linkBookVisit" href="https://www.omniavaticanrome.org/it/cards/la-basilica-di-san-pietro">Prenota la visita</a></p>'
    }
  ),
  StMarkVenice: createMarker(
    45.4346203,12.3399706,
    {
      en: "Basilica of Saint Mark",
      it: "Basilica di San Marco"
    },
    placeOfWorship.RED,
    {
      en: '<p class="justify"><img alt="Saint Marks Basilica" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Venezia_Basilica_di_San_Marco_Fassade_2.jpg/320px-Venezia_Basilica_di_San_Marco_Fassade_2.jpg" width="320" height="214" class="entityImage" />The first Basilica was founded in the 9th century to house the mortal remains of St Mark the Evangelist, brought back to Italy from Egypt by Venetian merchants. According to christian tradition, Mark the Evangelist founded the church of Alexandria, one of the most important episcopal sees of early Christianity. His feast day is celebrated on April 25, and his symbol is the winged lion.</p><p class="justify">Saint Mark became the travel companion and interpreter for Saint Peter during his travels throughout Asia Minor (1 Peter 1:1), after Peter was miraculously freed by angels from his imprisonment by Herod Agrippa I (Eusebius of Caesarea, Eccl. Hist. 2.9.1–4; Acts 12:1–19). Mark the Evangelist wrote down the sermons of Peter, thus composing the Gospel according to Mark (Eccl. Hist. 15–16), before he left for Alexandria in the third year of Claudius (AD 43). According to Acts 15:39, Mark went to Cyprus with Barnabas after the Council of Jerusalem; then in AD 49 (about 19 years after the Ascension of Jesus) Mark travelled to Alexandria and founded the Church of Alexandria. Today, the Coptic Orthodox Church, the Greek Orthodox Church of Alexandria, and the Coptic Catholic Church trace their origins to this community. Aspects of the Coptic liturgy can be traced back to Mark himself. He became the first bishop of Alexandria and he is honored as the founder of Christianity in Africa.</p><p class="linkBookVisitContainer"><a class="linkBookVisit" href="https://www.omniaforitaly.org">Book your visit</a></p>',
      it: '<p class="justify"><img alt="Saint Marks Basilica" src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Venezia_Basilica_di_San_Marco_Fassade_2.jpg/320px-Venezia_Basilica_di_San_Marco_Fassade_2.jpg" width="320" height="214" class="entityImage" />La prima Basilica fu fondata nel sec. IX per ospitare i resti mortali di San Marco l\'Evangelista, portati in Italia dall\'Egitto da alcuni mercanti veneziani. Secondo la tradizione cristiana, San Marco l\'Evangelista fondò la chiesa di Alessandria, una delle più importanti sedi del cristianesimo antico. La sua festa viene celebrata il 25 Aprile, e suo simbolo è il leone alato.</p><p class="justify">San Marco fu compagno di viaggio e interprete per San Pietro durante il viaggio da lui compiuto nell\'Asia Minore (1 Pietro 1,1), a seguito della miracolosa liberazione per intervento degli angeli dall\'imprigionamento da parte di Erode Agrippa I (Eusebio di Caesarea, Eccl. Hist. 2.9.1–4; Atti 12,1–19). San Marco l\'Evangelista appuntò i sermoni di Pietro, e così compose il Vangelo a lui attribuito (Eccl. Hist. 15–16), prima di partire per Alessandria nell\'anno terzo di Claudio (43 d.C.). Secondo Atti 15,39, Marco andò a Cipro con Barnaba dopo il Concilio di Gerusalemme; poi nel 49 d.C. (circa 19 anni dopo l\'Ascensione di Gesù) in Egitto dove fondò la chiesa di Alessandria; ad oggi la Chiesa Copta Ortodossa, la Chiesa Greco-ortodossa di Alessandria, e la Chiesa Copta Cattolica si fanno risalire a questa stessa comunità. Certi aspetti della liturgia Copta risalgono fino a San Marco. Fu il primo vescovo di Alessandria e viene onorato come il fondatore del cristianesimo nel continente africano.</p><p class="linkBookVisitContainer"><a class="linkBookVisit" href="https://www.omniaforitaly.org">Prenota la visita</a></p>'
    }
  ),
  StPaulBasilicaRome: createMarker(
    41.8587417,12.4765089,
    {
      en: "Basilica Saint Paul Outside the Walls",
      it: "Basilica di San Paolo fuori le Mura"
    },
    placeOfWorship.RED,
    {
      en: '<p class="justify"><img alt="Basilica Saint Paul outside the Walls Rome" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Roma_San_Paolo_fuori_le_mura_BW_1.JPG/320px-Roma_San_Paolo_fuori_le_mura_BW_1.JPG" width="320" height="223" class="entityImage" />The Apostle Paul arrived in Rome when, after having been arrested in Jerusalem and put into custody in Caesarea, he exercised his right as roman citizen and requested to stand trial before Caesar in Rome (Acts 21-24). After having been shipwrecked on the island of Malta, he traveled to Rome via Syracuse, Rhegium and Puteoli, arriving around the year 60 A.D. While in Rome, he spent two years under house arrest, and the narrative of the Acts of the Apostles ends with Paul preaching in Rome from his rented home while awaiting trial (Acts 28).</p><p class="justify">Pope Clement I (1st century), Saint Ignatius of Antioch (2nd century), and Saint Dionysius of Corinth (2nd century) recount that Saint Paul was martyred; the date of Paul\'s death is believed to have occurred after the Great Fire in Rome (64 A.D.), but before the end of Nero\'s reign (68 AD). The apocryphal Acts of Paul (160 AD), Tertullian (200 AD), Eusebius of Caesarea (320 AD), Lactantius (318 AD), Saint Jerome (392 AD), Saint John Chrysostom (c. 349–407) and Sulpicius Severus (403 AD) describe the martyrdom of Paul citing that Nero condemned Paul to death by decapitation at Rome. Caius, a priest in Rome in the 2nd century, mentions that the remains of Saint Paul were buried on the Ostian Way, and the christians in Rome erected a memorial. Emperor Constantine the Great built a church over the burial site in the 4th century, which was consecrated by Pope Sylvester I in 324 AD.</p>',
      it: '<p class="justify"><img alt="Basilica Saint Paul outside the Walls Rome" src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Roma_San_Paolo_fuori_le_mura_BW_1.JPG/320px-Roma_San_Paolo_fuori_le_mura_BW_1.JPG" width="320" height="223" class="entityImage" />L\'Apostolo Paolo giunse a Roma quando, dopo esser stato arrestato a Gerusalemme e esser stato messo in custodia tutelare a Cesarea, esercitò il suo diritto di cittadino romano e si appellò al giudizio dell\'imperatore a Roma (Atti 21-24). Dopo il naufragio sull\'isola di Malta, viaggiò a Roma via Siracusa, Reggio Calabria e Pozzuoli, per arrivare poi a Roma intorno al 60 d.C. Mentre a Roma, passò due anni agli arresti domiciliari, durante i quali predicò alla gente di Roma dalla casa presa in pigione, in attesa di comparire davanti a Cesare, e su questa nota arrivano a conclusione gli Atti degli Apostoli (Acts 28).</p><p class="justify">Papa Clemente I (sec. I), Sant\'Ignazio di Antiochia (sec. II), e San Dionisio di Corinto (sec. II) afferman che San Paolo fu martirizzato; si ritiene che la data del martirio di San Paolo si collochi a seguito del Incendio di Roma (64 d.C.), ma prima della fine del regno di Nerone (68 d.C.). Gli atti apocrifi  di Paolo (uno scritto del 160 d.C.), Tertulliano (200 d.C.), Eusebio di Cesarea (320 d.C.), Lattanzio (318 d.C.), San Girolamo (392 d.C.), San Giovanni Crisostomo (c. 349–407 d.C.) e Sulpicio Severo (403 d.C.) descrivono il martirio di Paolo dichiarando che Nerone abbia condannato Paolo a morte per decapitazione a Roma. Caio, un presiberto di Roma del sec. II, menziona che i resti di San Paolo furono seppelliti sulla Via Ostiense; i cristiani di Roma eressero un memoriale sul luogo della sepoltura. L\'Imperatore Constantino il Grande fece costruire una chiesa sul sito della sepoltura nel sec. IV, e la chiesa fu consacrata da Papa Silvestro I nel 324 d.C.</p>'
    }
  ),
  SantaMariaViaLata: createMarker(
    41.8981223,12.4812894,
    {
      en: "Santa Maria in Via Lata",
      it: "Santa Maria in Via Lata"
    },
    placeOfWorship.RED,
    {
      en: "Santa Maria in Via Lata",
      it: "Santa Maria in Via Lata"
    }
  ),
  SanPaoloAllaRegola: createMarker(
    41.8930597,12.4732267,
    {
      en: "San Paolo alla Regola",
      it: "San Paolo alla Regola"
    },
    placeOfWorship.RED,
    {
      en: "San Paolo alla Regola",
      it: "San Paolo alla Regola"
    }
  ),
  ChiesaSanPaoloMartirio: createMarker(
    41.8338692361,12.4878894914,
    {
      en: "Church of the Martyrdom of Saint Paul at the Three Fountains",
      it: "Chiesa del Martirio di San Paolo alle Tre Fontane"
    },
    placeOfWorship.RED,
    {
      en: "<p class=\"justify\">A church was first built here in the 5th or 6th century to memorialize the place where, according to tradition, Saint Paul was beheaded. According to a popular legend, his head bounced three times on the ground, and in those three spots, three fountains sprang forth; these still flow and are located in the church.</p>"
          + "<p class=\"justify\">The church standing today was built at the start of the 17th century by the architect and sculptor Giacomo della Porta, as requested by cardinal Pietro Aldobrandini.</p>"
          + "<p class=\"justify\">Inside the church the three fountains are yet extant, enclosed within three symbolic monumental covers in black marble, each at a different level. Near the first niche there is a pillar, which popular legend holds to be that to which Saint Paul was bound for his beheading.</p>"
      ,
      it: "<p class=\"justify\">La chiesa sorse nel sec. V-VI sul luogo dove, secondo la tradizione, San Paolo fu decapitato e la sua testa, rimbalzando tre volte sul terreno, fece scaturire ad ogni colpo altrettante sorgenti d’acqua: una calda, una tiepida e una fredda.</p>"
          + "<p class=\"justify\">L’edificio fu ricostruito all’inizio del Seicento da Giacomo della Porta, per volere del cardinale Pietro Aldobrandini.</p>"
          + "<p class=\"justify\">L’interno ospita ancora le tre fontane, racchiuse da altrettante edicole in marmo nero, poste su livelli diversi. Vicino alla prima nicchia, si trova la colonna dove, secondo la legenda popolare, San Paolo venne legato per essere decapitato.</p>"
    }
  )
}

const allMarkers = Object.values(PilgrimageMarkers);

const placesSaintPaul = [
  PilgrimageMarkers.StPaulBasilicaRome,
  PilgrimageMarkers.SantaMariaViaLata,
  PilgrimageMarkers.SanPaoloAllaRegola
];

const placesSaintPeter = [
  PilgrimageMarkers.StPeterBasilicaRome
];

const placesEvangelists = [
  PilgrimageMarkers.StMarkVenice
];

const placesApostles = [
  ...placesSaintPaul,
  ...placesSaintPeter
];

let removeListener;
let clusteredMarkers;

let customStyle = () => {
  if (Cesium.defined(removeListener)) {
    removeListener();
    removeListener = undefined;
  } else {
    removeListener = markersLayer.clustering.clusterEvent.addEventListener(
      (clusteredEntities, cluster) => {
        console.log('there was a cluster event');
        console.log(clusteredEntities);
        clusteredMarkers = clusteredEntities;
        cluster.label.show = false;
        /*
        allMarkers.forEach(a => {
          if(clusteredEntities.includes(a)){
            console.log('entity with id ' + a._id + ' is in the clustered collection');
            a.label.show = false;
          } else {
            console.log('entity with id ' + a._id + ' is not in the clustered collection');
            a.label.show = true;
          }
        });
        */
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin =
          Cesium.VerticalOrigin.BOTTOM;

        if (clusteredEntities.length >= 50) {
          cluster.billboard.image = pin50;
        } else if (clusteredEntities.length >= 40) {
          cluster.billboard.image = pin40;
        } else if (clusteredEntities.length >= 30) {
          cluster.billboard.image = pin30;
        } else if (clusteredEntities.length >= 20) {
          cluster.billboard.image = pin20;
        } else if (clusteredEntities.length >= 10) {
          cluster.billboard.image = pin10;
        } else {
          cluster.billboard.image =
            singleDigitPins[clusteredEntities.length - 2];
        }
      }
    );
  }

  // force a re-cluster with the new styling
  let pixelRange = markersLayer.clustering.pixelRange;
  markersLayer.clustering.pixelRange = 0;
  markersLayer.clustering.pixelRange = pixelRange;
}

let ellipsoid = viewer.scene.globe.ellipsoid;
let mousemoveLabel = viewer.entities.add({
  name: 'mousemoveLabel',
  label: {
    ...label,
    text: 'no position',
    show: false
  }
});

viewer.scene.canvas.addEventListener('click', (e) => {
  let cartesian = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(e.clientX, e.clientY), ellipsoid);
  if (cartesian) {
    //console.log('we have cartesian coordinates');
    let cartographic = ellipsoid.cartesianToCartographic(cartesian);
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(10);
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(10);
    let labelText = '(' + longitudeString + ', ' + latitudeString + ')';
    console.log(labelText);
    mousemoveLabel.position = cartesian;
    mousemoveLabel.label.text = labelText;
    mousemoveLabel.show = true;
  } else {
    mousemoveLabel.show = false;
  }
});


document.getElementById('placesApostles').addEventListener("click", () => {
  console.log('placesApostles was called');
  allMarkers.forEach(a => {
    if(placesApostles.includes(a)){
      a.show = true;
      if(clusteredMarkers.includes(a)){
        a.label.show = false;
      } else {
        a.label.show = true;
      }
    } else {
      a.show = false;
    }
  });
});

document.getElementById('placesEvangelists').addEventListener("click", () => {
  console.log('placesEvangelists was called');
  allMarkers.forEach(a => {
    if(placesEvangelists.includes(a)){
      a.show = true;
      if(clusteredMarkers.includes(a)){
        a.label.show = false;
      } else {
        a.label.show = true;
      }
    } else {
      a.show = false;
    }
  });
});

document.getElementById('showAllPlaces').addEventListener("click", () => {
  console.log('showAllPlaces was called');
  allMarkers.forEach(a => {
    a.show = true;
    if(clusteredMarkers.includes(a)){
      a.label.show = false;
    } else {
      a.label.show = true;
    }
  });
});

let dataSourcePromise = viewer.dataSources.add(markersLayer);
dataSourcePromise.then(dataSource => {
  let pixelRange = 15;
  let minimumClusterSize = 3;
  let enabled = true;

  dataSource.clustering.enabled = enabled;
  dataSource.clustering.pixelRange = pixelRange;
  dataSource.clustering.minimumClusterSize = minimumClusterSize;
  customStyle();
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(12.4531362,41.9020481, 15000000)
  });

});

//viewer.flyTo(viewer.entities);
