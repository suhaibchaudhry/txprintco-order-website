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

function makeCouchRuleRequest($options) {
	global $config;
  $id = $options[0];
  $runsize = $options[1];
  // var_dump("Runsize in datasource.php: " . $runsize);
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
        $product_runsizes_query = $rules_db->get($id)->body->runsizes;
        foreach ($product_runsizes_query as $product_runsize => $data) {
          if ($product_runsize == $runsize) {
            // var_dump("Match found for runsize: " . $runsize);
            $default_markup = $data->default;
            // var_dump($default_markup);
            if($default_markup == 'flat') {
              // var_dump($data->default_markup);
              $markup_array = array('flat' => $data->$default_markup );
              // var_dump($markup_array);
              return $markup_array;
            } else {
              return $data->$default_markup;
            }

          }
        }
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
        // var_dump($sag);
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
    // var_dump('makeCouchPutRuleRequest product statement hit.');

    $doc = json_decode($object);
    // var_dump($doc);
    $id = $doc->_id;
    // var_dump($doc_runsize);
    // var_dump($doc);
    foreach ($doc as $key => $value) {
      if($key == 'runsizes') {
        foreach ($value as $key => $value) {
          $doc_runsize = $key;
        }
      }
    }
    try {
      $product_check = $sag->get($id)->body;
      $product_rev = $product_check->_rev;
      // var_dump($product_check);
      $product_check_runsizes = $product_check->runsizes;
      // var_dump($product_check_runsizes);
      var_dump($product_check);
      // var_dump($product_check_runsizes);
      foreach ($product_check_runsizes as $key => $value) {
        // var_dump($key);
        if($key == $doc_runsize) /* If a runsize is already in the database, update it with the new values passed in*/
        {
          // var_dump("Match Found!");
          // var_dump($product_check_runsizes->$key);
          // var_dump($doc->runsizes->$key);
          $product_check_runsizes->$key = $doc->runsizes->$key;
          // var_dump("The overridden object is:");
          // var_dump($product_check_runsizes->$key);
          // var_dump($product_check_runsizes);
          // var_dump($product_check);
          $product_check->runsizes = $product_check_runsizes;
          // var_dump($product_check);
          $sag->put($id, json_encode($product_check));
          return;
        }
      }
      $doc->_rev = $doc_rev;
      // var_dump($product_check->runsizes);
      // var_dump($doc->runsizes);
      // array_push($product_check->runsizes, $doc->runsizes);
      foreach ($doc->runsizes as $key => $value) {
        // var_dump($key);
        $product_check->runsizes->$key = $value;
        $sag->put($id, json_encode($product_check));
        return;
      }
      // var_dump($product_check);
    } catch (Exception $e) {
      if($e->getcode() == 404){
        $sag->put($id, json_encode($doc));
      }
    }
	}
}

function getMarkup($id, $options) {
  global $config;
  // var_dump($options['type']);
  try {
		$rules_db = new Sag($config['couchruledb']['host'], $config['couchruledb']['port']);
		$rules_db->login($config['couchruledb']['user'], $config['couchruledb']['pass']);
		$rules_db->setDatabase($config['couchruledb']['database']);

    if($options['type'] == 'categories') {
      // var_dump("Inside categories if statement");
      // var_dump($options);
      $markup_for_product = $rules_db->get($id)->body->markup;
      // var_dump($markup_for_product);
      return $markup_for_product;
    } else if ($options['type'] == 'subcat') {
      $markup_for_product = $rules_db->get($id)->body->markup;
      return $markup_for_product;
    } else if ($options['type'] == 'product') {
      // var_dump("Inside getMarkup function");
      // var_dump($options);
      // var_dump($id);
      $requested_runsize = $options['runsize'];
      $markup_object_for_product = $rules_db->get($id)->body;
      // var_dump($markup_object_for_product->runsizes);
      foreach ($markup_object_for_product->runsizes as $runsize => $object) {
        if($runsize == $requested_runsize) {
          // var_dump("Match found");
          // var_dump($object);
          return $object;
        }
      }
      return false;
    }
	}
	catch (SagCouchException $ex ) {
		 // print $ex->getMessage();
		 // print $ex->getCode();
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
