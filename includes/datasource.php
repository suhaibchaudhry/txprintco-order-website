<?php
require_once 'config.php';
require_once 'krumo/class.krumo.php';
require_once('./vendor/sag/src/Sag.php');

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
	// debug($url);
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

function makeCouchRuleRequest($type, $request) {
	try
	{
		$sag = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$sag->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$sag->setDatabase($config['couchruledb']['database']);
	}
	catch (SagCouchException $ex )
	{
		// print $ex->getMessage();
		// print $ex->getCode();
	}
}

function makeCouchPutRuleRequest($type, $object) {
	global $config;
	
	try
	{
		$sag = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$sag->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$sag->setDatabase($config['couchruledb']['database']);
	} 
	catch (SagCouchException $ex) 
	{
		// print $ex->getMessage();
		// print $ex->getCode();
	}
	
	if($type == 'category')
	{
		// print $type;
		$doc = json_decode($object);
		$id = md5($doc->title);
		 try
		{
		    $doc_check = $sag->get($id)->body;
		    $doc_rev = $doc_check->_rev;
			$doc->_rev = $doc_rev;
			try
			{
				$sag->put($id, json_encode($doc));
			}
			catch(Exception $e)
			{
				print $e->getMessage();
				print $e->getCode();
			}
		}
		catch(Exception $e)
		{
			// 404 - document does not exist
			// 409 - document conflict	
			print $e->getMessage();
			print $e->getCode();
			if($e->getCode() == 404)
				$sag->put($id, json_encode($doc));
		}
	}
	else if($type == 'subcat')
	{
		
	}
	else if($type == 'product')
	{
		
	}
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
