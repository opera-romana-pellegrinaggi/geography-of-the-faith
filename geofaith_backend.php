<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (isset($_SERVER['HTTP_ORIGIN'])) {
  header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
} else {
  header("Access-Control-Allow-Origin: *");
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400');    // cache for 1 day

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
    // may also be using PUT, PATCH, HEAD etc
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  }

  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
  }

  exit(0);
}

header("Content-type: application/json; charset=utf-8");

const GEOFAITH = true;

const CATEGORIES = [
  'RELIC', 'APOSTLE', 'EVANGELIST', 'MARTYR', 'EUCHARISTIC_MIRACLE',
  'CATHEDRAL', 'MARIAN_SHRINE', 'SHRINE',
  'SAINT_UNIVERSAL', 'SAINT_LOCAL', 'FRESCO', 'MOSAIC', 'ICON', 'PAINTING', 'STATUE'
];

include_once 'geofaith_credentials.php';

$dbh = new PDO(getenv('MYSQLDNS') . ';dbname=' . getenv('DBNAME'), getenv('DBUSER'), getenv('DBPASS'));

$params = [];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $params = $_GET;
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $params = $_POST;
}

if (!isset($params['LANG'])) {
    $params['LANG'] = 'EN';
}

if (isset($params['CAT']) && in_array($params['CAT'], CATEGORIES)) {
    $stmt = $dbh->prepare("SELECT p.id_key, n.{$params['LANG']} AS name, d.{$params['LANG']} as description, p.`latitude`, p.`longitude`, p.`category`, p.`marker_icon`, p.`marker_color`, p.`city`, p.`country`, p.`tags` FROM `pilgrimage_sites` p LEFT JOIN `i18n__name` n ON p.`id_key` = n.`id_key` LEFT JOIN `i18n__description` d ON p.`id_key` = d.`id_key` WHERE FIND_IN_SET(:CAT, p.`category`) > 0");
    $stmt->execute(['CAT' => $params['CAT']]);
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode($result);
} else {
    $stmt = $dbh->query("SELECT p.id_key, n.{$params['LANG']} AS name, d.{$params['LANG']} as description, p.`latitude`, p.`longitude`, p.`category`, p.`marker_icon`, p.`marker_color`, p.`city`, p.`country`, p.`tags` FROM `pilgrimage_sites` p LEFT JOIN `i18n__name` n ON p.`id_key` = n.`id_key` LEFT JOIN `i18n__description` d ON p.`id_key` = d.`id_key`");
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode($result);
}

$result = null;
$dbh = null;

die();
