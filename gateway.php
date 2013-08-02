<?php
require_once 'includes/datasource.php';
header("Content-Type: text/html");

$orig_url = $_GET['url'];
$url = $_GET['url'];
$url = str_replace('/db', '/_design/txprintco/_view', $url);

//var_dump($orig_url);

function apply_factor($markup_factor, $base_price) {
	//return $base_price;
	//var_dump(preg_replace("/[^0-9.]/", "", $base_price));
	//return preg_replace("[^0-9]", "", $base_price)*$markup_factor;
	return '$'.money_format('%i', ((float)preg_replace("/[^0-9.]/", "", $base_price))*$markup_factor);
}

function recursive_apply_markup($products) {
	//var_dump($item)."<br />";
	foreach($products as $key => $val) {
		if($key == 'base_price') {
			$obj[$key] = apply_factor(1.5, $val);
		} elseif(is_array($val) || is_object($val)) {
			recursive_apply_markup($products);
		} else {
			return;
		}
	}	
}

if($orig_url == '/db/best_price') {
	$products = makeCouchRequest($url, false, $_GET);
	$products->rows[0]->value = apply_factor(1.5, $products->rows[0]->value);
	print json_encode($products);
} else if($orig_url == '/db/options-object') {
	$products = makeCouchRequest($url, false, $_GET);
	recursive_apply_markup($products->rows[0]->value);
	print json_encode($products);
} else {
	$products = makeCouchRequest($url, true, $_GET);
	print $products;
}