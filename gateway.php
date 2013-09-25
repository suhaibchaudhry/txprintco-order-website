<?php
require_once 'includes/datasource.php';
header("Content-Type: text/html");
define("MARKUP", 1.5);
$orig_url = '';
if(isset($_GET['url'])) {
	$orig_url = $_GET['url'];
	$url = $_GET['url'];
	$url = str_replace('/db', '/_design/txprintco/_view', $url);
	//var_dump($orig_url);
}

if(isset($_GET['key'])) {
	$key = $_GET['key'];
	$key_clean = str_replace(str_split('[]" ') ,'' , $key);
	$key_array = explode(',', $key_clean);
}

function apply_factor($markup_factor, $base_price) {
	return '$'.number_format(((float)preg_replace("/[^0-9.]/", "", $base_price))*$markup_factor, 2);
}

function recursive_apply_markup(&$products) {
	foreach($products as $key => $val) {
		if($key === 'base_price') {
			$products->$key = apply_factor(MARKUP, $val);
		} elseif(is_array($val) || is_object($val)) {
			recursive_apply_markup($products->$key);
		} else {
			return;
		}
	}
}

if($orig_url == '/db/best_price') {
    $rule_markup = makeCouchRuleRequest($key_array[0]);
    //echo $rule_markup;
    if($rule_markup) {
      $products = makeCouchRequest($url, false, $_GET);
	    $products->rows[0]->value = apply_factor((($rule_markup + 100) / 100), $products->rows[0]->value);
	    print json_encode($products);
    } else {
	    $products = makeCouchRequest($url, false, $_GET);
	    $products->rows[0]->value = apply_factor(MARKUP, $products->rows[0]->value);
	    print json_encode($products);
    }
} else if($orig_url == '/db/options-object') {
	$products = makeCouchRequest($url, false, $_GET);
	recursive_apply_markup($products->rows[0]->value);
	print json_encode($products);
} else if($orig_url == '/db/price') {
    $rule_markup = makeCouchRuleRequest($key_array[0]);
    //echo $key_array[0];
    echo $rule_markup;
	$products = makeCouchRequest($url, false, $_GET);
	foreach($products->rows[0]->value as $tat) {
		$tat->base_price = apply_factor(MARKUP, $tat->base_price);
	}
	print json_encode($products);
} else if(isset($_GET['rule_type']) && isset($_GET['doc'])) {
	$rule_type = $_GET['rule_type'];
	$doc       = $_GET['doc'];
	makeCouchPutRuleRequest($rule_type, $doc);
} else if(isset($_GET['get_rule_for'])) {
    $get_rule_for_cat =  $_GET['get_rule_for'];
     $cat_markup = getMarkup(md5($get_rule_for_cat));
     if($cat_markup) {
        print $cat_markup;
     } else {
        print 0;
     }
} else {
	$products = makeCouchRequest($url, true, $_GET);
	print $products;
}
