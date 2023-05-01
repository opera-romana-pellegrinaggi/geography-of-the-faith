<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geography of the Faith - KML import</title>
</head>
<body>

<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


function human_filesize($file, $dec = 2): string {
    $bytes = filesize($file);
    $size   = array('B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB');
    $factor = floor((strlen($bytes) - 1) / 3);
    if ($factor == 0) $dec = 0;
    return sprintf("%.{$dec}f %s", $bytes / (1024 ** $factor), $size[$factor]);
}

function display_xml_error($error, $xml) {
    $return  = $xml[$error->line - 1] . "\n";
    $return .= str_repeat('-', $error->column) . "^\n";

    switch ($error->level) {
        case LIBXML_ERR_WARNING:
            $return .= "Warning $error->code: ";
            break;
         case LIBXML_ERR_ERROR:
            $return .= "Error $error->code: ";
            break;
        case LIBXML_ERR_FATAL:
            $return .= "Fatal Error $error->code: ";
            break;
    }

    $return .= trim($error->message) .
               "\n  Line: $error->line" .
               "\n  Column: $error->column";

    if ($error->file) {
        $return .= "\n  File: $error->file";
    }

    return "$return\n\n--------------------------------------------\n\n";
}

const GEOFAITH = true;
include_once 'geofaith_credentials.php';
const CATEGORIES = [
    'RELIC', 'APOSTLE', 'EVANGELIST', 'MARTYR', 'EUCHARISTIC_MIRACLE', 'CATHEDRAL', 'MARIAN_SHRINE', 'SHRINE', 'SAINT_UNIVERSAL', 'SAINT_LOCAL', 'FRESCO', 'MOSAIC', 'ICON', 'PAINTING', 'STATUE'
];

if( $_SERVER["REQUEST_METHOD"] === "POST" && isset( $_POST["filename"] ) ) {

    $id_key = '';
    $city = '';
    $country = '';
    $category = '';
    $latitude = 0;
    $longitude = 0;
    $tag = '';
    $markerIcon = '';
    $markerColor = '';
    $name_EN = '';
    $name_IT = '';
    $name_ES = '';
    $name_FR = '';
    $name_DE = '';
    $name_PT = '';
    $description_EN = '';
    $description_IT = '';
    $description_ES = '';
    $description_FR = '';
    $description_DE = '';
    $description_PT = '';

    $dbh = new PDO('mysql:host=localhost;dbname=' . DBNAME, DBUSER, DBPASS);
    $stmt1 = $dbh->prepare("INSERT INTO `pilgrimage_sites` (`id_key`,`latitude`,`longitude`,`category`,`marker_icon`,`marker_color`,`city`,`country`,`tags`) VALUES (:IDKEY,:LAT,:LONG,:CAT,:ICON,:COLOR,:CITY,:COUNTRY,:TAG)");
    $stmt2 = $dbh->prepare("INSERT INTO `i18n__name` (`id_key`,`EN`,`IT`,`ES`,`FR`,`DE`,`PT`) VALUES (:IDKEY,:EN,:IT,:ES,:FR,:DE,:PT)");
    $stmt3 = $dbh->prepare("INSERT INTO `i18n__description` (`id_key`,`EN`,`IT`,`ES`,`FR`,`DE`,`PT`) VALUES (:IDKEY,:EN,:IT,:ES,:FR,:DE,:PT)");
    //$stmt1 = $dbh->prepare("UPDATE `pilgrimage_sites` SET `latitude` = :LAT, `longitude` = :LONG WHERE `id_key` = :IDKEY");
    //$stmt2 = $dbh->prepare("UPDATE `i18n__name` SET `EN`=:EN,`IT`=:IT,`ES`=:ES,`FR`=:FR,`DE`=:DE,`PT`=:PT WHERE `id_key` = :IDKEY");
    //$stmt3 = $dbh->prepare("UPDATE `i18n__description` SET `EN`=:EN,`IT`=:IT,`ES`=:ES,`FR`=:FR,`DE`=:DE,`PT`=:PT WHERE `id_key` = :IDKEY");

    $stmt1->bindParam(':IDKEY', $id_key, PDO::PARAM_STR);
    $stmt1->bindParam(':LAT', $latitude, PDO::PARAM_STR);
    $stmt1->bindParam(':LONG', $longitude, PDO::PARAM_STR);
    $stmt1->bindParam(':CAT', $category, PDO::PARAM_STR);
    $stmt1->bindParam(':CITY', $city, PDO::PARAM_STR);
    $stmt1->bindParam(':COUNTRY', $country, PDO::PARAM_STR);
    $stmt1->bindParam(':TAG', $tag, PDO::PARAM_STR);
    $stmt1->bindParam(':ICON', $markerIcon, PDO::PARAM_STR);
    $stmt1->bindParam(':COLOR', $markerColor, PDO::PARAM_STR);

    $stmt2->bindParam(':IDKEY', $id_key, PDO::PARAM_STR);
    $stmt2->bindParam(':EN', $name_EN, PDO::PARAM_STR);
    $stmt2->bindParam(':IT', $name_IT, PDO::PARAM_STR);
    $stmt2->bindParam(':ES', $name_ES, PDO::PARAM_STR);
    $stmt2->bindParam(':FR', $name_FR, PDO::PARAM_STR);
    $stmt2->bindParam(':DE', $name_DE, PDO::PARAM_STR);
    $stmt2->bindParam(':PT', $name_PT, PDO::PARAM_STR);

    $stmt3->bindParam(':IDKEY', $id_key, PDO::PARAM_STR);
    $stmt3->bindParam(':EN', $description_EN, PDO::PARAM_STR);
    $stmt3->bindParam(':IT', $description_IT, PDO::PARAM_STR);
    $stmt3->bindParam(':ES', $description_ES, PDO::PARAM_STR);
    $stmt3->bindParam(':FR', $description_FR, PDO::PARAM_STR);
    $stmt3->bindParam(':DE', $description_DE, PDO::PARAM_STR);
    $stmt3->bindParam(':PT', $description_PT, PDO::PARAM_STR);

    $xml = simplexml_load_file($_POST["filename"], "SimpleXMLElement", LIBXML_NOCDATA );
    //$xml->registerXPathNamespace('f', 'http://www.opengis.net/kml/2.2');
    if( $xml === false ) {
        $errors = libxml_get_errors();
        foreach ($errors as $error) {
            echo '<p>' . display_xml_error($error, $xml) . '</p>';
        }
    } else {
        echo '<p>now reading and importing data from ' . $_POST["filename"] . '...</p>';
        //print_r($xml);
        //echo '<br>';
        echo "<p> {$xml->getName()} has {$xml->count()} child:<br>";
        foreach( $xml->children() as $child ) {
            echo "{$child->getName()}";
        }
        echo "</p>";
        $folders = $xml->Document->Folder;
        $foldersCount = 0;
        $placemarkCount = 0;
        if( $folders === false || $folders === null ) {
            echo '<p>query returned false or null</p>';
        } else {
            $foldersCount = count( $folders );
            echo "<p>folders var is of type " . gettype( $folders ) . "</p>";
            echo '<p>' . count( $folders ) . ' folders were found...</p>';
        }
        $segnaposti = [];
        foreach( $folders as $folder ) {
            $placemarksInFolder = count( $folder->Placemark );
            echo "<p>" . $placemarksInFolder . " placemarks were found in the current folder $folder->name...</p>";
            //print_r( $folder );
            foreach( $folder->Placemark as $placemark ) {
                $name_EN = '';
                $name_IT = '';
                $name_ES = '';
                $name_FR = '';
                $name_DE = '';
                $name_PT = '';
                ++$placemarkCount;
                $name_EN = (string) $placemark->name;
                $description_EN = (string) $placemark->description;
                $coordStr = (string) $placemark->Point->coordinates;
                $coordinates = explode(',', trim($coordStr) );
                //echo '<h1>NAME</h1>';
                //print_r($name);
                //echo '<h1>DESCRIPTION</h1>';
                //print_r($description);
                //echo '<br>' . $coordinates . '<br>';
                $extDatas = $placemark->ExtendedData->Data;
                if( $extDatas === false || $extDatas === null ) {
                    echo 'query for ExtendedData/Data returned false or null <br>';
                }
                else {
                    echo 'query for ExtendedData/Data produced ' . count($extDatas) . ' results</br>';
                }
                //echo '<pre>';
                foreach( $extDatas as $extData ) {
                    /*
                    echo '<pre>';
                    print_r($extData);
                    echo '</pre>';
                    */
                    switch( $extData->attributes()->name ) {
                        case 'id_key':
                            $id_key = (string) $extData->value;
                            break;
                        case 'city':
                            $city = (string) $extData->value;
                            break;
                        case 'country':
                            $country = (string) $extData->value;
                            break;
                        case 'category':
                            $category = (string) $extData->value;
                            break;
                        case 'tags':
                            $tag = (string) $extData->value;
                            break;
                        case 'name_IT':
                            $name_IT = (string) $extData->value;
                            break;
                        case 'name_ES':
                            $name_ES = (string) $extData->value;
                            break;
                        case 'name_FR':
                            $name_FR = (string) $extData->value;
                            break;
                        case 'name_DE':
                            $name_DE = (string) $extData->value;
                            break;
                        case 'name_PT':
                            $name_PT = (string) $extData->value;
                            break;
                        case 'description_IT':
                            $description_IT = (string) $extData->value;
                            break;
                        case 'description_ES':
                            $description_ES = (string) $extData->value;
                            break;
                        case 'description_FR':
                            $description_FR = (string) $extData->value;
                            break;
                        case 'description_DE':
                            $description_DE = (string) $extData->value;
                            break;
                        case 'description_PT':
                            $description_PT = (string) $extData->value;
                            break;
                        case 'markerIcon':
                            $markerIcon = (string) $extData->value;
                            break;
                        case 'markerColor':
                            $markerColor = (string) $extData->value;
                            break;
                    }
                }
                //echo '</pre>';
                $segnaposti[$id_key] = [
                    'name' => $name_EN,
                    'description' => $description_EN,
                    'coordinates' => $coordinates,
                    'city' => $city,
                    'country' => $country,
                    'category' => $category
                ];
                $latitude = $coordinates[1];
                $longitude = $coordinates[0];

                $result = $dbh->query("SELECT COUNT(*) FROM `pilgrimage_sites` WHERE `id_key` = '$id_key'");
                $count = $result->fetchColumn();

                if($count === 0) {
                    $resultA = $stmt1->execute();
                    $resultB = $stmt2->execute();
                    $resultC = $stmt3->execute();
    
                    if( false === $resultA ) {
                        echo "<p>There was an error executing SQL statement 1</p>";
                    }
                    if( false === $resultB ) {
                        echo "<p>There was an error executing SQL statement 2</p>";
                    }
                    if( false === $resultC ) {
                        echo "<p>There was an error executing SQL statement 3</p>";
                    }
                } else {
                    echo "<p>Skipping id_key $id_key since it already seems to exist in the database...</p>";
                }


            }
        }

        echo "<h1>RESULTS " . count($segnaposti) . " ($placemarkCount)</h1>";
        //echo '<pre>';
        //print_r($segnaposti);
        //echo '</pre>';
        //echo '(' . $segnaposti['BasilicaAssumptionBMVBaltimore']['coordinates'][0] . ')';
    }
    $dbh = null;
}

?>
    <div style="margin: 3em auto; text-align: center;">
        <form method="post">
            <div style="margin: 1em auto;"><select name="filename">
                <?php
                    foreach (glob("assets/dataSources/mymaps/*.kml") as $filename) {
                        echo "<option value=\"$filename\">$filename (" . human_filesize($filename) . ")</option>";
                    }
                ?>
            </select></div>
            <div style="margin: 1em auto;"><button type="submit">SUBMIT</button></div>
        </form>
    </div>
</body>
</html>
