<?php

if (!defined('GEOFAITH')) {
  die('Direct access not permitted');
}

if (file_exists(".env.development")) {
  $env = file_get_contents(".env.development");
} elseif (file_exists(".env.production")) {
  $env = file_get_contents(".env.production");
} elseif (file_exists(".env")) {
  $env = file_get_contents(".env");
} else {
  die("Could not find environment file: expected either .env.development, .env.production, or .env");
}

$lines = explode("\n", $env);
foreach ($lines as $line) {
  preg_match("/([^#]+)\=(.*)/", $line, $matches);
  if (isset($matches[2])) {
    putenv(trim($line));
  }
}

$expectedKeys = ['MYSQLDNS', 'DBUSER', 'DBPASS', 'DBNAME', 'ION_ACCESS_TOKEN', 'BING_ACCESS_TOKEN'];
$envKeys = array_keys(getenv());
$intersect = array_intersect($envKeys, $expectedKeys);
$diff = array_diff($expectedKeys, $intersect);

if (count($diff)) {
  die('Missing required environment variables: ' . implode(', ', $diff));
}
