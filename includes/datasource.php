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

function makeCouchRuleRequest($id) {
	global $config;
    try {
		$rules_db = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$rules_db->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$rules_db->setDatabase($config['couchruledb']['database']);

        $products_db = new Sag($config['couchdb']['host'], $config['couchdb']['port']);
		$products_db->login($config['couchdb']['user'], $config['couchdb']['pass']);
		$products_db->setDatabase($config['couchdb']['database']);
	}
	catch (SagCouchException $ex ) {
		 print $ex->getMessage();
		 print $ex->getCode();
	}

    try { // Get the product/doc
        $encoded_id = urlencode('"'.$id.'"');
        $doc = $products_db->get('_design/txprintco/_view/products_details?key=' .$encoded_id)->body->rows[0]->value;

        $product_parent_cat = $doc->parent_cat->title;
        $product_subcat = $doc->subcat;
	}
	catch (SagCouchException $ex ) {
		 //print $ex->getMessage();
		 //print $ex->getCode();
	}

    // Check if the product has any rules in the rules_db
    try { 
        $product_query = $rules_db->get($id);
        //var_dump($product_query);
	}
	catch (SagCouchException $ex ) {
		 //print $ex->getMessage();
		 //print $ex->getCode();
	}
    
    // Check if the products subcat has any rules in the database
    try {
        $concat_parentcat_subcat = $product_parent_cat.$product_subcat;
        //echo md5($concat_parentcat_subcat);
        $product_subcat_query = $rules_db->get(md5($concat_parentcat_subcat));
        return $product_subcat_query->body->markup;
	}
	catch (SagCouchException $ex ) {
		 //print $ex->getMessage();
		 //print $ex->getCode();
	}

    // Check if the products parent cat has any rules in the database
    try { 
        $product_parent_cat_query = $rules_db->get(md5($product_parent_cat));
        return $product_parent_cat_query->body->markup;
	}
	catch (SagCouchException $ex ) { // return false here because there are no rules for the product in the rules database
		 //print $ex->getMessage();
		 //print $ex->getCode();
         return false;
	}
}

function makeCouchPutRuleRequest($type, $object) {
	global $config;

	try {
		$sag = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$sag->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$sag->setDatabase($config['couchruledb']['database']);
	}
	catch (Exception $ex) {
		 print $ex->getMessage();
		 print $ex->getCode();
	}

	if($type == 'category') {
        var_dump($sag);
		// print $type;
		$doc = json_decode($object);
		$id = md5($doc->title);
		try {
		    $doc_check = $sag->get($id)->body;
		    $doc_rev = $doc_check->_rev;
			$doc->_rev = $doc_rev;
            $sag->put($id, json_encode($doc));
		}
		catch(Exception $e) {
			// 404 - document does not exist
			// 409 - document conflict
			//print $e->getMessage();
			//print $e->getCode();
			if($e->getCode() == 404)
				$sag->put($id, json_encode($doc));
		}
	}
	else if($type == 'subcat') {
		$doc = json_decode($object);
        echo $doc->_id;
        $id = md5($doc->_id);
        try {
            $doc_check = $sag->get($id)->body;
            $doc_rev = $doc_check->_rev;
            $doc->_rev = $doc_rev;
            $sag->put($id, json_encode($doc));
        } catch (Exception $e) {
            if($e->getcode() == 404)
                //echo $e->getMessage();
                //echo $e->getCode();
                $sag->put($id, json_encode($doc));
        }
	}
	else if($type == 'product') {

	}
}

function getMarkup($id) {
    global $config;
    try {
		$rules_db = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$rules_db->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$rules_db->setDatabase($config['couchruledb']['database']);

        $markup_for_product = $rules_db->get($id)->body->markup;
        return $markup_for_product;
	}
	catch (SagCouchException $ex ) {
		 //print $ex->getMessage();
		 //print $ex->getCode();
         return false;
	}
}

function get_products($product_cat) {
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
