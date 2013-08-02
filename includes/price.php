<?php 
	/* 
	   This php script is called from datasource.js. The data is passed into this
	   script via request and key parameters as POST varialbes.
	*/
require_once 'datasource.php';

$request = $_POST['request'];
$key = $_POST['key'];

if(isset($_POST['request']) & isset($_POST['key']))
{
	// $product_details = makeCouchRequest('/_design/txprintco/_view/products_details?key="' . urlencode($product_id). '"');
	// echo $request;
	// echo $key;
	if($request === 'best_price') {
		$price_object = makeCouchRequest('/_design/txprintco/_view/'.$request. '?key='.$key);
		$priceInCents = convertPriceToCents($price_object);
		
		// echo json_encode($price_object);	
	}
	
}

function convertPriceToCents($amount) {
	global $request;
	if($request === 'best_price') {
		$price = $amount->rows[0]->value;
		$price = floatval(str_replace('$', '', $price));
		echo $price;
		echo '';
		echo json_encode($amount);
	}
	

}

function priceMarkup($percentToMarkup, $amountInCents) {

}