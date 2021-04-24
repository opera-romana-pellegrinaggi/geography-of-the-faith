var camera, scene, renderer;
var mesh;
// ms to wait after dragging before auto-rotating
var rotationDelay = 3000;
// scale of the globe (not the canvas element)
var scaleFactor = 0.9;
// autorotation speed
var degPerSec = 2.425;
// start angles
var angles = { x: -20, y: 40, z: 0};
var colorWater = 'rgba(0,0,50,.1)'
var colorLand = 'rgba(10,10,10,.5)'
var colorGraticule = 'rgba(0,0,80,.1)'
var colorCountry = '#a00';
var current = d3.select('#current');
var canvas = d3.select('#globe');
var context = canvas.node().getContext('2d');
var water = {type: 'Sphere'};
var projection = d3.geoOrthographic().precision(0.1);
var graticule = d3.geoGraticule10();
var path = d3.geoPath(projection).context(context);
var v0 // Mouse position in Cartesian coordinates at start of drag gesture.
var r0 // Projection rotation as Euler angles at start.
var q0 // Projection rotation as versor at start.
var lastTime = d3.now()
var degPerMs = degPerSec / 1000
var width, height;
var land, countries;
var countryList;
var autorotate, now, diff;
var currentCountry;

const lang = window.location.hostname.includes("geografia") ? "it" : "en";
document.title = lang === "it" ? "Geografia della Fede - ORP" : "Geography of the Faith - ORP";

init();
animate();

function init() {
  starrySky();
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    alpha: true
  });

  camera = new THREE.PerspectiveCamera(50, 1, 1, 50);
  camera.position.z = 25;

  scene = new THREE.Scene();

  var geometry = new THREE.SphereGeometry(9.5, 360, 100);
  var material  = new THREE.MeshPhongMaterial();

  THREE.ImageUtils.crossOrigin = '';
  const loader = new THREE.TextureLoader();
  material.map = loader.load('assets/images/8081_earthmap4k.jpg');
  material.bumpMap = loader.load('assets/images/8081_earthbump4k.jpg');
  material.bumpScale = 0.2;
  material.specularMap = loader.load('assets/images/8081_earthspec4k.jpg');
  material.emissiveMap = loader.load('assets/images/8081_earthlights4k.jpg');
  material.emissive = new THREE.Color( 0xffffaa );
  material.emissiveIntesity = 0.2;

  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x += 0.3;
  mesh.rotation.y -= 0.9;
  mesh.rotation.z -= 0.1;
  scene.add(mesh);

  var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light1.position.set(100, 50, 100);
  scene.add(light1);
}

function resize() {
  var width = renderer.domElement.clientWidth;
  var height = renderer.domElement.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); 
}

function animate() {
  resize();
  mesh.rotation.y += 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function starrySky(){

  //stars

  let style = ["style1", "style2", "style3", "style4"];
  let tam = ["tam1", "tam1", "tam1", "tam2", "tam3"];
  let opacity = ["opacity1", "opacity1", "opacity1", "opacity2", "opacity2", "opacity3"];

  let getRandomArbitrary = (min, max) => Math.floor(Math.random() * (max - min)) + min;

  let star = "";
  let starCount = 250;
  let night = document.querySelector(".constellation");
  let widthWindow = window.innerWidth;
  let heightWindow = window.innerHeight;

  for (let i = 0; i < starCount; i++) {
    star += "<span class='star " + style[getRandomArbitrary(0, 4)] + " " + opacity[getRandomArbitrary(0, 6)] + " "
    + tam[getRandomArbitrary(0, 5)] + "' style='animation-delay: ." +getRandomArbitrary(0, 9)+ "s; left: "
    + getRandomArbitrary(0, widthWindow) + "px; top: " + getRandomArbitrary(0, heightWindow) + "px;'></span>";
  }

  night.innerHTML = star;

  //meteors
  let nextMeteorAppearanceTime;
  let loadMeteor = () => {
    setTimeout(loadMeteor, nextMeteorAppearanceTime);
    nextMeteorAppearanceTime = getRandomArbitrary(5000, 20000);
    var meteor = "<div class='meteor "+ style[getRandomArbitrary(0, 4)] +"'></div>";
    document.getElementsByClassName('meteorShower')[0].innerHTML = meteor;
    setTimeout(function(){
      document.getElementsByClassName('meteorShower')[0].innerHTML = "";
    }, 1000);
  }
  setTimeout(loadMeteor, 2000);
}

function enter(country) {
  var country = countryList.find(c => parseInt(c.id, 10) === parseInt(country.id, 10))
  current.text(country && country["name_"+lang] || '')
  stopRotation()
}

function leave(country) {
  current.text('')
  startRotation()
}


function setAngles() {
  var rotation = projection.rotate()
  rotation[0] = angles.y
  rotation[1] = angles.x
  rotation[2] = angles.z
  projection.rotate(rotation)
}

function scale() {
  width = document.documentElement.clientWidth
  height = document.documentElement.clientHeight
  canvas.attr('width', width).attr('height', height)
  projection
    .scale((scaleFactor * Math.min(width, height)) / 2)
    .translate([width / 2, height / 2])
  render()
}

function startRotation(delay) {
  autorotate.restart(rotate, delay || 0)
}

function stopRotation() {
  autorotate.stop()
}

function dragstarted() {
  v0 = versor.cartesian(projection.invert(d3.mouse(this)))
  r0 = projection.rotate()
  q0 = versor(r0)
  stopRotation()
}

function dragged() {
  var v1 = versor.cartesian(projection.rotate(r0).invert(d3.mouse(this)))
  var q1 = versor.multiply(q0, versor.delta(v0, v1))
  var r1 = versor.rotation(q1)
  projection.rotate(r1)
  render()
}

function dragended() {
  startRotation(rotationDelay)
}

function render() {
  context.clearRect(0, 0, width, height)
  fill(water, colorWater)
  stroke(graticule, colorGraticule)
  fill(land, colorLand)
  if (currentCountry) {
    fill(currentCountry, colorCountry)
  }
}

function fill(obj, color) {
  context.beginPath()
  path(obj)
  context.fillStyle = color
  context.fill()
}

function stroke(obj, color) {
  context.beginPath()
  path(obj)
  context.strokeStyle = color
  context.stroke()
}

function rotate(elapsed) {
  now = d3.now()
  diff = now - lastTime
  if (diff < elapsed) {
    rotation = projection.rotate()
    rotation[0] += diff * degPerMs
    projection.rotate(rotation)
    render()
  }
  lastTime = now
}

function loadData(cb) {
  d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json', function(error, world) {
    if (error) throw error
    d3.tsv('assets/tsv/world-country-names.tsv', function(error, countries) {
      if (error) throw error
      cb(world, countries)
    })
  })
}

// https://github.com/d3/d3-polygon
function polygonContains(polygon, point) {
  var n = polygon.length
  var p = polygon[n - 1]
  var x = point[0], y = point[1]
  var x0 = p[0], y0 = p[1]
  var x1, y1
  var inside = false
  for (var i = 0; i < n; ++i) {
    p = polygon[i], x1 = p[0], y1 = p[1]
    if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside
    x0 = x1, y0 = y1
  }
  return inside
}

function mousemove() {
  var c = getCountry(this)
  if (!c) {
    if (currentCountry) {
      leave(currentCountry)
      currentCountry = undefined
      render()
    }
    return
  }
  if (c === currentCountry) {
    return
  }
  currentCountry = c
  render()
  enter(c)
}

function getCountry(event) {
  var pos = projection.invert(d3.mouse(event))
  return countries.features.find(function(f) {
    return f.geometry.coordinates.find(function(c1) {
      return polygonContains(c1, pos) || c1.find(function(c2) {
        return polygonContains(c2, pos)
      })
    })
  })
}

//
// Initialization
//

setAngles()

canvas
  .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
   )
  .on('mousemove', mousemove)

loadData(function(world, cList) {
  land = topojson.feature(world, world.objects.land)
  countries = topojson.feature(world, world.objects.countries)
  countryList = cList
  
  window.addEventListener('resize', scale)
  scale()
  autorotate = d3.timer(rotate)
})
