<?php
require_once 'datasource.php';

function template_sidebar() {
	$content = '';
	$categories = makeCouchRequest('/_design/txprintco/_view/categories?group=true');

	foreach ($categories->rows as $row) {
		$content .= "<li><a href=".base_path()."categories.php?product_cat=".urlencode($row->key).">".$row->key."</a></li>";
	}

	return '<ul id="menu">'.$content.'</ul>';
}

// function template_products()
// {
// 	$category = $_GET['product_cat'];
// 	// $url = '/_design/txprintco/_view/products?key="'. $category .'"';
// 	$products = makeCouchRequest('/_design/txprintco/_view/products?key="'. urlencode($category) .'"');
// 	debug($products);
// 	$content = '<div class="category-product-grid">';

// 	foreach($products->rows as $product_id => $product) {
// 		$content .= '<div class="product-item">';
// 		$content .= '<div class="title"><a href="'.base_path().'order.php?product_id='.$product->value->product_id.'">'.$product->value->title.'</a></div>';
// 		$content .= '<div class="base-price">'.$product->value->base_price.'</div>';
// 		$content .= '</div>';
// 	}

// 	$content .= '</div>';

// 	return $content;
// }

function template_products_with_subcat()
{
	
	$category = $_GET['product_cat'];
	$products_with_subcat = makeCouchRequest('/_design/txprintco/_view/products', false, array('startkey' => '["'.$category.'"]', 'endkey' => '["'.$category.'", []]'));
	//debug($products_with_subcat);

	$content = '';
	foreach(groupProducts($products_with_subcat) as $row_key => $group) {
		//$i = 0;
		//debug($group);
		$content .= '<div class="product-group">';
		foreach($group as $index => $product) {
			//debug($index);
			//debug($product);
			if($index == 0) {
				$content .= '<h2>'.$product->subcat.'</h2>';
			}
			$content .= '<div class="product-item">';
			$content .= '<div class="title"><a href="'.base_path().'order.php?product_id='.$product->product_id.'">'.$product->title.'</a></div>';
			$content .= '<div class="base-price">'.$product->base_price.'</div>';
			$content .= '</div>';
			//$i++;
		}
		$content .= '</div>';
	}
	
	return $content;
}

function template_product_details()
{
	$product_id = $_GET['product_id'];

	$product_details = makeCouchRequest('/_design/txprintco/_view/products_details?key="' . urlencode($product_id). '"');
	// debug($product_details);
	$product_runsizes = array();
	foreach ($product_details->rows[0]->value->runsizes as $runsizes => $runsize) {
		array_push($product_runsizes, $runsize);
	}
	// debug($product_runsizes);

	$content = '<div class="product-details">';
	$content .= '<div class="product-title"><h3>Title: '.$product_details->rows[0]->value->title.'</h3></div>';
	//$content .= '<div class="product-base-price"><h3>Base Price: '.$product_details->rows[0]->value->base_price.'</h3></div>';
	$content .= '<div class="product-base-price" data-price-title="Base Price" data-base-price="$0.00"><h3><span class="price-title">Base Price</span>: <span class="base-price">$0.00</span></h3></div>';
	$content .= '<h2>Select a runsize:</h2>';
	
	$content .= '<div class="runsizes-wrap">';
	$content .= '<select name="runsize" class="runsizes">';
	$content .= '<option value="select">--Select Runsize--</option>';
	foreach ($product_runsizes as $runsizes => $runsize) {
		$content .= '<option>' .$runsize . '</option>';
	}
	$content .= '</select>';
	$content .= '</div>';
				
	$content .= '<div class="colors-wrap"></div>';
	$content .= '<div class="tat-wrap"></div>';
	$content .= '<div class="options-wrap"></div>';
	
	$content .= '<div class="order-details"></div>';
	
	$content .= '</div>';
	return $content;
}