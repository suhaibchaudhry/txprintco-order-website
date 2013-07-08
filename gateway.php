<?php
require_once 'includes/datasource.php';
header("Content-Type: application/json");

$url = str_replace('/db', '', $_SERVER['REQUEST_URI']);
$products = makeCouchRequest($url, true);
print $products;