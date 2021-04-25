(function () {
  let webglEl = document.getElementById("webgl");

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage(webglEl);
    return;
  }

  let width = window.innerWidth,
    height = window.innerHeight;

  /**
   * Prepare D3 variables
   */
  let land, countries, countryList, autorotate;
  let projection = d3.geoOrthographic().precision(0.1);
  let graticule = d3.geoGraticule10();
  //let path = d3.geoPath(projection).context(context);




  /**
   * Prepare THREE configurations
   */

  // Earth params
  let radius = 0.5,
    segments = 64,
    rotation = 6;




  /**
   * Define functions for creating and rendering THREE geometries
   */

  let render = () => {
    controls.update();
    sphere.rotation.y += 0.0005;
    clouds.rotation.y += 0.0005;
    stars.rotation.z += 0.00001;
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  let createSphere = (radius, segments) => new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        map: loader.load("assets/images/8081_earthmap4k.jpg"),
        bumpMap: loader.load("assets/images/8081_earthbump4k.jpg"),
        bumpScale: 0.005,
        specularMap: loader.load("assets/images/water_4k.png"),
        specular: new THREE.Color("#221"),
      })
    );

  let createClouds = (radius, segments) => new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),
      new THREE.MeshPhongMaterial({
        map: loader.load("assets/images/fair_clouds_4k.png"),
        transparent: true,
      })
    );

  let createStars = (radius, segments) => new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map: loader.load("assets/images/galaxy_starfield.png"),
        side: THREE.BackSide,
      })
    );

  let scale = (ev) => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };




  /**
   * Define functions for D3 map functionality
   */
   let loadData = (callback) => {
    d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json', (error, world) => {
      if (error) throw error
      d3.tsv('assets/tsv/world-country-names.tsv', (error, countries) => {
        if (error) throw error
        callback(world, countries);
      });
    });
  }


  /**
   * Start creating our THREE scene
   */

  let scene = new THREE.Scene();
  const loader = new THREE.TextureLoader();

  let camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.position.z = 1.5;

  let renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(width, height);
  //renderer.shadowMap.enabled = true;
  //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(new THREE.AmbientLight(0x666666));

  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(25, 10, 15);
  //light.castShadow = true;
  scene.add(light);

  //light.shadow.mapSize.width = 512; // default
  //light.shadow.mapSize.height = 512; // default
  //light.shadow.camera.near = 0.5; // default
  //light.shadow.camera.far = 500; // default


  let sphere = createSphere(radius, segments);
  sphere.rotation.y = rotation;
  //sphere.castShadow = true; //default is false
  //sphere.receiveShadow = true; //default
  scene.add(sphere);

  let clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds);

  let stars = createStars(90, 64);
  scene.add(stars);

  let controls = new THREE.TrackballControls(camera);
  
  webglEl.appendChild(renderer.domElement);

  loadData((world, cList) => {
    land = topojson.feature(world, world.objects.land);
    countries = topojson.feature(world, world.objects.countries);
    countryList = cList;
  })

  window.addEventListener('resize', scale);
  render();

})();
