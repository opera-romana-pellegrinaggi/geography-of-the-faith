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

if( ! isset($params['LANG']) ) {
    $params['LANG'] = 'EN';
}

if( isset( $params['CAT'] ) && in_array( $params['CAT'], CATEGORIES ) ) {
    $stmt = $dbh->prepare("SELECT p.id_key, n.{$params['LANG']} AS name, d.{$params['LANG']} as description, p.`latitude`, p.`longitude`, p.`category`, p.`marker_icon`, p.`marker_color`, p.`city`, p.`country`, p.`tags` FROM `pilgrimage_sites` p LEFT JOIN `i18n__name` n ON p.`id_key` = n.`id_key` LEFT JOIN `i18n__description` d ON p.`id_key` = d.`id_key` WHERE FIND_IN_SET(:CAT, p.`category`) > 0");
    $stmt->execute(['CAT' => $params['CAT']]);
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode( $result );
} else {
    $stmt = $dbh->query("SELECT p.id_key, n.{$params['LANG']} AS name, d.{$params['LANG']} as description, p.`latitude`, p.`longitude`, p.`category`, p.`marker_icon`, p.`marker_color`, p.`city`, p.`country`, p.`tags` FROM `pilgrimage_sites` p LEFT JOIN `i18n__name` n ON p.`id_key` = n.`id_key` LEFT JOIN `i18n__description` d ON p.`id_key` = d.`id_key`");
    $result = $stmt->fetchAll(PDO::FETCH_OBJ);
    echo json_encode( $result );
}

$result = NULL;
$dbh = NULL;

die();
