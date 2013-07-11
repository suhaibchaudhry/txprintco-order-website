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

function makeCouchRequest($request, $json_output = FALSE) {
	global $config;

	$url = "http://".$config['couchdb']['user'].":".$config['couchdb']['pass'].'@'.$config['couchdb']['host'].":".$config['couchdb']['port']."/".$config['couchdb']['database'].$request;
	// var_dump($url);
	$ch = curl_init($url);

	$options = array(CURLOPT_RETURNTRANSFER => true);
	// Setting curl options
	curl_setopt_array($ch, $options);

	// Getting results
	$data = curl_exec($ch);
	if(!$json_output) {
		$data = json_decode($data);
	}
	//debug($data);
	return $data;
}

function get_products($product_cat)
{
	$products = makeCouchRequest("/_design/txprintco/_view/products");
	debug($products);
}

function base_path() {
	global $config;
 	return $config['app']['base_path'];
}