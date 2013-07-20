$(document).ready(function() {
	//Cache JQuery Objects
	$product_datails = $('div.product-details');
	$runsizes_wrap = $('div.runsizes-wrap');
	$colors_wrap = $('div.colors-wrap');
	$tat_wrap = $('div.tat-wrap');
	$options_wrap = $('div.options-wrap');
	$shipping_wrap = $('div.shipping-wrap');
	$order_details = $('div.order-details');
	//$base_price = $('div.product-base-price');

	//Cache variables
	var selected_runsize = '';
	var selected_color = '';
	var selected_tat = '';
	
	// $base_price.hide();

	$('div.runsizes-wrap select.runsizes').change(function(){
		selected_runsize = $(this).val();
		//console.log($tat_wrap.is(':empty'));
		// $tat_wrap.hide(); // Hide the tat_wrap if a previous one existed.
		template_reset_base_price();
		reset_shipping_table();
		template_get_colors(selected_runsize);
	});
});

function makeCouchRequest(url, callback, data) {
	var options = {
		url: url,
		//dataType: 'application/json',
		type: "GET",
		//contentType: "json",
		success: function(data) {
			// console.log(data);
			callback(jQuery.parseJSON(data));
		},
		error: function(xhr,status,error) {
			//alert(xhr);
			console.log(error);
		}
	};

	if(data) {
		options['data'] = data;
	}

	$.ajax(options);
}

function template_get_colors(runsize) {
	var  colors, count;

	//makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/colors", function(data){ // For Apache
		makeCouchRequest(js_config['base_path']+"db/colors", function(data){ 
		// Add a heading and append a drop down to the form
		//var data = jQuery.parseJSON(json_data);
		//console.log(data);
		colors = data['rows'][0]['value'];
		$colors_wrap.html('<h2>Select a color:</h2><select class="colors"></select>');
		$tat_wrap.empty();
		
		var last_key = '';
		var last_val = '';

		var $color_select = $colors_wrap.find('select.colors');
		$color_select.append('<option value="select">--Select Color--</option>');

		count = 0;
		$.each(colors, function(key, val) {
			$color_select.append('<option value="'+key+'">'+val+'</option>');
			last_key = key;
			last_val = val;
			count++;
		});

		// Add a event handler on colors
		$color_select.change(function() {
			selected_color = $(this).val();
			if(selected_color == 'select')
			{
				$tat_wrap.empty();
				template_reset_base_price();
				reset_shipping_table();
			}
			else
			{
				get_best_price(runsize, selected_color);
				reset_shipping_table();
				template_get_tat(runsize, selected_color);	
			}
			
		});
		
		if(count < 2) {
			$color_select.hide();
			template_get_tat(runsize, last_key);
			$colors_wrap.append('<div class="one-option">'+ last_val +'</div>');
		}

	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'"]'});
}


function template_get_tat(runsize, color) {

  // makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/tat", function(data){ // For Apache
makeCouchRequest(js_config['base_path']+"db/tat", function(data){

	tat = data['rows'][0]['value'];
	$tat_wrap.html('<h2>Select a turn around time:</h2><select class="tat"></select>');
	
	var last_ket = '';
	var last_value = '';
	
	var $tat_select = $tat_wrap.find('select.tat');
	$tat_select.append('<option value="select">--Select Turn Around Time--</option>');
	
	count = 0;
	$.each(tat, function(key, val){
		$tat_select.append('<option value="' + key + '">' + val + '</option>');
		last_ket = key;
		last_val = val;
		count++;
	});
	
	// Add a event handler on tat
	$tat_select.change(function() {
		var selected_tat = $(this).val();
		// console.log(selected_tat);
		var $runsize = $runsizes_wrap.find('select.runsizes');
		var $color = $colors_wrap.find('select.colors');
		// console.log($runsize.val());

		var first_child = $tat_select.find('option:first-child').val();
		if(first_child == selected_tat) // First option on tat, if selected reset shipping table and get the best price
		{
			get_best_price($runsize.val(), $color.val());
			reset_shipping_table();
		}
		else // Anyother option on tat, get the base price and populate shipping table
		{
			template_get_base_price($runsize.val(), $color.val(), $(this).val());
			template_get_shipping($runsize.val(), $color.val(), $(this).val());
	
		}
		


	});
	
	if( count < 2){

		$tat_select.hide();
		$tat_wrap.append('<div class="one-option">' + last_val + '<div>');
		one_option_value = $tat_wrap.find('select.tat option:nth-child(2)').val();
		// console.log(one_option_value);
		// get_best_price(runsize, color);
		$
		template_get_base_price(runsize, color, one_option_value);
		template_get_shipping(runsize, color, one_option_value);
	}

  }, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});
}

function template_get_shipping(runsize, color, tat) {

	makeCouchRequest(js_config['base_path']+"db/price", function(data){
		//var data = jQuery.parseJSON(data_price);
		console.log(data);
		shipping = data['rows'][0]['value'][tat]['defaultShipping'];
		console.log(shipping);
		
		$shipping_wrap.html('<h2>Shipping Table</h2><table class="shipping-table"></table>');

		var $shipping_table = $shipping_wrap.find('table.shipping-table');
		// console.log($shipping_table);
		// $shipping_table.append('<tr><th>Shipping Type</th><th>Price</th></tr>');

		$.each(shipping, function(key, val){
			if(key == 'originEnglish')
			{
				$shipping_table.append('<tr><td><h3>This product will be shipped from: '+ val +'</h3></td></tr>');		
			}
		});
		$.each(shipping, function(key, val){
			if(!(key == 'originEnglish' || key == 'originCode'))
			{
				$shipping_table.append('<tr><td>'+ val +'</td></tr>');
			}
		});
	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});

}

function template_reset_base_price() {
	var $base_price = $product_datails.find('.product-base-price');
	$base_price.find('span.price-title').html($base_price.data('price-title'));
	$base_price.find('span.base-price').html($base_price.data('base-price'));
}
function reset_shipping_table(){
	$shipping_wrap.empty();
}

function template_get_base_price(runsize, color, tat)
{
	// Get the base price for the run size
	makeCouchRequest(js_config['base_path']+"db/price", function(data){
		//var data = jQuery.parseJSON(data_price);
		// console.log(data);
		price = data['rows'][0]['value'];
		// console.log(price);
		
		$.each(price, function(key, val){
			// console.log(key);
			if(key === tat)
			{
				// console.log(price[key].base_price);
				//$base_price.show().empty().append('<h3>Base Price: '+ price[key].base_price +'</h3>');
				$product_datails.find('.product-base-price span.price-title').html('Subtotal');
				$product_datails.find('.product-base-price span.base-price').html(price[key].base_price);
			}
		});


	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});
	
	
}

function get_best_price(runsize, color)
{
	bs = 0;
	makeCouchRequest(js_config['base_path']+"db/best_price", function(data) {

    	// console.log(data);
    	bs = data['rows'][0]['value'];
    	// console.log(bs);
    	$product_datails.find('.product-base-price span.price-title').html('Subtotal');
		$product_datails.find('.product-base-price span.base-price').html(bs);
  
  	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '"]'});
}