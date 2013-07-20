<?php
require_once 'config.php';
require_once 'krumo/class.krumo.php';

function debug($var) {
	global $config;

	if($config['app']['debug']) {
		krumo($var);
	} else {
		return;
	}
}

function makeCouchRequest($request, $json_output = FALSE, $reqData = NULL) {
	global $config;

	$url = "http://".$config['couchdb']['user'].":".$config['couchdb']['pass'].'@'.$config['couchdb']['host'].":".$config['couchdb']['port']."/".$config['couchdb']['database'].$request;
	if(!is_null($reqData)) {
		$url .= '?'.http_build_query($reqData);
	}

	$ch = curl_init($url);
 	$options = array(CURLOPT_RETURNTRANSFER => true);
	// Setting curl options
	curl_setopt_array($ch, $options);

	// Getting results
	$data = curl_exec($ch);
	if(!$json_output) {
		$data = json_decode($data);
	}
// 	debug($data);
	return $data;
}

function get_products($product_cat)
{
	$products = makeCouchRequest("/_design/txprintco/_view/products");
	debug($products);
}

function groupProducts($doc) {
	$groups = array();
	foreach($doc->rows as $row) {
		if(!isset($groups[$row->value->subcat]) || !is_array($groups[$row->value->subcat])) {
			$groups[$row->value->subcat] = array();
		}

		$groups[$row->value->subcat][] = $row->value;
		//Dictionary Sort on product names @Asad
		usort($groups[$row->value->subcat], function($a, $b) {
			return strcmp($a->title, $b->title);
		});
	}

	//ksort($groups, function($a, $b) {
	//	return strcmp($a, $b);
	//});

	return $groups;
}

function base_path() {
	global $config;
 	return $config['app']['base_path'];
}
