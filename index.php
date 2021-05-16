<?php
  //define possible third levels
  $thirdLevels = [
    "de" => "geographiedesglaubens",
    "en" => "geographyofthefaith",
    "es" => "geografiadelafe",
    "fr" => "geographiedelafoi",
    "it" => "geografiadellafede",
    "pt" => "geografiadafe"
  ];

  //detect language based on hostname
  $hostname = $_SERVER["HTTP_HOST"];
  $thirdlevel = explode(".",$hostname)[0];
  $lang = "en";

  if(in_array($thirdlevel,$thirdLevels)){
    $lang = array_search($thirdlevel,$thirdLevels);
  }
  // Set language accordingly
  putenv('LC_ALL=' . $lang);
  setlocale(LC_ALL, $lang);

  // Specify location of translation tables
  bindtextdomain("geographyofthefaith", "./locale");
  // Choose domain
  textdomain("geographyofthefaith");

  function _e($string) {
    echo _($string);
  };


?>

<!DOCTYPE html>
<html>
  <head>
    <title><?php _e("Geography of the Faith - Opera Romana Pellegrinaggi"); ?></title>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta http-equiv="content-language" content="<?php echo $lang; ?>">
    <meta name="keywords" content="opera romana, <?php _e("pilgrimage, pilgrimages, pilgrim, pilgrima, travel, trip, route, holy land, via francigena, santiago, compostela, rome, map, maps, itinerary, itineraries, walk, walks, path, paths, walking") ?>">
    <meta name="description" content="<?php _e("Geography of the Faith is an interactive globe presenting christian pilgrimage destinations and routes from around the world."); ?>">

    <!-- Fonts and icons -->
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Roboto+Slab:400,700|Material+Icons" />
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css" />

    <!-- Material Dashboard CSS -->
    <link rel="stylesheet" href="node_modules/material-dashboard-dark-edition/assets/css/material-dashboard.min.css?v=2.1.2" />

    <!-- Cesium CSS -->
    <link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.62/Build/Cesium/Widgets/widgets.css" />

    <link rel="stylesheet" href="assets/css/styles.css" />
  </head>
  <body class="dark-edition">
    <div class="wrapper">
      <div class="sidebar" data-color="azure" data-background-color="black">
        <div class="logo">
          <a href="/" class="simple-text logo-normal"><?php _e("The geography of the faith"); ?></a>
        </div>
        <div class="sidebar-wrapper ps-container ps-theme-default">
          <div><button id="placesApostles">LUOGHI DEGLI APOSTOLI</button></div>
          <div><button id="placesEvangelists">LUOGHI DEGLI EVANGELISTI</button></div>
          <div><button id="showAllPlaces">MOSTRA TUTTI</button></div>
        </div>
      </div>
      <div class="main-panel ps-container ps-theme-default">
        <div id="map"></div>
        <div id="credits"></div>
        <div class="loader">
          <div class="loaderBar"></div>
        </div>
      </div>
    </div>
    <footer>
      <!-- Core JS files -->
      <script src="https://cesium.com/downloads/cesiumjs/releases/1.80/Build/Cesium/Cesium.js"></script>
      <script>window.zip = {};</script>
      <script src="https://cesium.com/downloads/cesiumjs/releases/1.80/Build/Cesium/ThirdParty/Workers/inflate.js"></script>
      <script src="https://cesium.com/downloads/cesiumjs/releases/1.80/Build/Cesium/ThirdParty/Workers/deflate.js"></script>

      <script src="node_modules/material-dashboard-dark-edition/assets/js/core/jquery.min.js"></script>
      <script src="node_modules/material-dashboard-dark-edition/assets/js/core/popper.min.js"></script>
      <script src="node_modules/material-dashboard-dark-edition/assets/js/core/bootstrap-material-design.min.js"></script>

      <!-- Library for adding dinamically elements -->
      <script src="node_modules/arrive/minified/arrive.min.js" type="text/javascript"></script>

      <!--  Notifications Plugin, full documentation here: http://bootstrap-notify.remabledesigns.com/    -->
      <script src="node_modules/material-dashboard-dark-edition/assets/js/plugins/bootstrap-notify.js"></script>

      <!--  Charts Plugin, full documentation here: https://gionkunz.github.io/chartist-js/ -->
      <script src="node_modules/material-dashboard-dark-edition/assets/js/plugins/chartist.min.js"></script>

      <!-- Plugin for Scrollbar documentation here: https://github.com/utatti/perfect-scrollbar -->
      <script src="node_modules/material-dashboard-dark-edition/assets/js/plugins/perfect-scrollbar.jquery.min.js"></script>

      <script src="https://unpkg.com/i18next@20.2.4/dist/umd/i18next.js"></script>
      <script src="assets/js/index.js"></script>

      <!-- Material Dashboard Core initialisations of plugins and Bootstrap Material Design Library -->
      <script src="node_modules/material-dashboard-dark-edition/assets/js/material-dashboard.js?v=2.1.2"></script>

    </footer>
  </body>
</html>
