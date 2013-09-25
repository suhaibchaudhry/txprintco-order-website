<?php
	/*
	   This php script is called from datasource.js. The data is passed into this
	   script via request and key parameters as POST varialbes.
	*/
require_once 'datasource.php';

$request = $_POST['request'];
$key = $_POST['key'];
$markup = 100;

if(isset($_POST['request']) & isset($_POST['key']))
{
	global $markup;
	if($request === 'best_price') {
		$price_object = makeCouchRequest('/_design/txprintco/_view/'.$request. '?key='.$key);
		$priceInCents = convertPriceToCents($price_object);
		$markedUpPrice = priceMarkup($markup, $priceInCents);
		echo json_encode($markedUpPrice);
	}

}

function convertPriceToCents($amount) {
	global $request;
	if($request === 'best_price') {
		$intPart;
		$decimalPart;
		$decimalValue;

		$price = $amount->rows[0]->value;

		$price = floatval(str_replace('$', '', $price));
		$intPart = intval($price);
		$decimalPart =  $price - intval($price);
		// echo "Integer: " .$intPart. "\n";
		// echo "Fraction: " .$decimalPart. "\n";

		$decimalValue = ($intPart * 100) + ($decimalPart * 100);
		// echo "Value in cents: " .$decimalValue. "\n";
		// echo json_encode($amount);

		// echo "Value in array before: " .$amount->rows[0]->value. "\n";
		$amount->rows[0]->value = $decimalValue;
		// echo "Value in array after: " .$amount->rows[0]->value. "\n";
		return $amount;
	}


}

function priceMarkup($percentToMarkup, $amountInCents) {
	$valueToMarkup = $markedUpValue = $intPart = $decimalPart = $amountInCurrency = 0;
	// echo "Value in array in priceMarkup before: " .$amountInCents->rows[0]->value. "\n";
	$valueToMarkup = $amountInCents->rows[0]->value;
	$markedUpValue = ceil($valueToMarkup * (($percentToMarkup / 100) + 1));
	$intPart = intval($markedUpValue / 100);
	$decimalPart = $markedUpValue % 100;
	$amountInCurrency = $intPart + ($decimalPart / 100);
	// echo "Int part after markup and switch: " .$intPart. "\n";
	// echo "Decimal part after markup and switch: " .$decimalPart. "\n";
	// echo "Final markedup value: " .$amountInCurrency. "\n";

	$amountInCents->rows[0]->value = $amountInCurrency;
	// echo "Value in array in priceMarkup after: " .$amountInCents->rows[0]->value. "\n";
	// echo "Marked up value: " .$valueToMarkup;
	return $amountInCents;
}





