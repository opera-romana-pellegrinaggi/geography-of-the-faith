<?php

header("Content-type: application/json; charset=utf-8");

const GEOFAITH = true;

const CATEGORIES = [
    'RELIC', 'APOSTLE', 'EVANGELIST', 'MARTYR', 'EUCHARISTIC_MIRACLE', 'CATHEDRAL', 'MARIAN_SHRINE', 'SHRINE', 'SAINT_UNIVERSAL', 'SAINT_LOCAL', 'FRESCO', 'MOSAIC', 'ICON', 'PAINTING', 'STATUE'
];

include_once 'geofaith_credentials.php';

$dbh = new PDO('mysql:host=localhost;dbname=' . DBNAME, DBUSER, DBPASS);

$params = [];

if( $_SERVER['REQUEST_METHOD'] === 'GET' ) {
    $params = $_GET;
}
else if( $_SERVER['REQUEST_METHOD'] === 'POST' ) {
    $params = $_POST;
}

if( isset( $params['CAT'] ) && in_array( $params['CAT'], CATEGORIES ) ) {
    $stmt = $dbh->prepare("SELECT * FROM `pilgrimage_sites` WHERE `category` = :CAT");
    $stmt->execute(['CAT' => $params['CAT']]);
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode( $result );
} else {
    $stmt = $dbh->query("SELECT * FROM `pilgrimage_sites`");
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode( $result );
}

$result = NULL;
$dbh = NULL;

die();
