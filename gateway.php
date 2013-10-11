<?php
require_once 'includes/datasource.php';
header("Content-Type: text/html");
define("MARKUP", 1.5);
$orig_url = '';
if(isset($_GET['url'])) {
	$orig_url = $_GET['url'];
	$url = $_GET['url'];
	$url = str_replace('/db', '/_design/txprintco/_view', $url);
}

if(isset($_GET['key'])) {
	$key = $_GET['key'];
	$key_clean = str_replace(str_split('[]" ') ,'' , $key);
	$key_array = explode(',', $key_clean);
}

function apply_factor($markup_factor, $base_price) {
	return '$'.number_format(((float)preg_replace("/[^0-9.]/", "", $base_price))*$markup_factor, 2);
}

function apply_flat_rate($flat_price) {
  return '$'.number_format(((float)preg_replace("/[^0-9.]/", "", $flat_price)), 2);
}

function recursive_apply_markup(&$products, $markup = false) {
  foreach($products as $key => $val) {
		if($key === 'base_price') {
      if($markup) {
        if(is_array($markup)){
          $products->$key = apply_flat_rate($markup['flat']);
        } else {
          $products->$key = apply_factor($markup, $val);
        }
      } else {
          $products->$key = apply_factor(MARKUP, $val);
      }
		} elseif(is_array($val) || is_object($val)) {
      if($markup) {
          recursive_apply_markup($products->$key, $markup);
      } else {
          recursive_apply_markup($products->$key);
      }
		} else {
			return;
		}
	}
}

if($orig_url == '/db/best_price') {
    $rule_markup = makeCouchRuleRequest($key_array);

    if($rule_markup) {
      if(is_array($rule_markup)){
        $products = makeCouchRequest($url, false, $_GET);
        $products->rows[0]->value = apply_flat_rate($rule_markup['flat']);
        print json_encode($products);
      } else {
        $products = makeCouchRequest($url, false, $_GET);
        $products->rows[0]->value = apply_factor((($rule_markup + 100) / 100), $products->rows[0]->value);
        print json_encode($products);
      }

    } else {
	    $products = makeCouchRequest($url, false, $_GET);
	    $products->rows[0]->value = apply_factor(MARKUP, $products->rows[0]->value);
	    print json_encode($products);
    }
} else if($orig_url == '/db/options-object') {
    $rule_markup = makeCouchRuleRequest($key_array);

    if($rule_markup){
      if(is_array($rule_markup)){
        $products = makeCouchRequest($url, false, $_GET);
        recursive_apply_markup($products->rows[0]->value, $rule_markup);
      } else {
        $products = makeCouchRequest($url, false, $_GET);
        recursive_apply_markup($products->rows[0]->value, (($rule_markup + 100) / 100));
      }
    } else {
        $products = makeCouchRequest($url, false, $_GET);
        recursive_apply_markup($products->rows[0]->value);
    }

  	print json_encode($products);
} else if($orig_url == '/db/price') {
    $rule_markup = makeCouchRuleRequest($key_array);
  	$products = makeCouchRequest($url, false, $_GET);
  	foreach($products->rows[0]->value as $tat) {
      if($rule_markup){
        if(is_array($rule_markup)){
          $tat->base_price = apply_flat_rate($rule_markup['flat']);
        } else {
          $tat->base_price = apply_factor((($rule_markup + 100) / 100), $tat->base_price);
        }
      } else {
        $tat->base_price = apply_factor(MARKUP, $tat->base_price);
      }
  	}
  	print json_encode($products);
} else if(isset($_GET['rule_type']) && isset($_GET['doc'])) {
  	$rule_type = $_GET['rule_type'];
  	$doc       = $_GET['doc'];
  	makeCouchPutRuleRequest($rule_type, $doc);
} else if(isset($_GET['get_rule_for'])) {
    $get_rule_options = $_GET['options'];
    $get_rule_for_type = $_GET['options']['type'];
    $get_rule_for_cat =  $_GET['get_rule_for'];
    if($get_rule_for_type == 'categories') {
      $markup = getMarkup(md5($get_rule_for_cat), $get_rule_options);
      if($markup) {
        print $markup;
      } else {
        return false;
      }
    } else if($get_rule_for_type == 'subcat') {
      $markup = getMarkup(md5($get_rule_for_cat), $get_rule_options);
      if($markup) {
        print $markup;
      } else {
        return false;
      }
    } else if($get_rule_for_type == 'product') {
      $markup_object = getMarkup($get_rule_for_cat, $get_rule_options);
      if($markup_object) {
        print json_encode($markup_object);
      } else {
        return false;
      }
    }
} else {
  	$products = makeCouchRequest($url, true, $_GET);
  	print $products;
}
