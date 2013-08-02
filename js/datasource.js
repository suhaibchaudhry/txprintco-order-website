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
	// var selected_color = '';
	// var selected_tat = '';
	

	$('div.runsizes-wrap select.runsizes').change(function(){
		selected_runsize = $(this).val();
		if(selected_runsize == 'select')
		{
			$colors_wrap.empty();
			$tat_wrap.empty();
			$options_wrap.empty();
			reset_shipping_table();
			template_reset_base_price();
			$options_wrap.empty();
		}
		else
		{
			// selected_runsize = $(this).val();
			//console.log($tat_wrap.is(':empty'));
			// $tat_wrap.hide(); // Hide the tat_wrap if a previous one existed.
			template_reset_base_price();
			reset_shipping_table();
			template_get_colors(selected_runsize);
			$options_wrap.empty();
		}	
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
		$colors_wrap.html('<h2>Select a color</h2><select class="colors"></select>');
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
	$tat_wrap.html('<h2>Select a turn around time</h2><select class="tat"></select>');
	$options_wrap.empty();
	
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
			// get_best_price($runsize.val(), $color.val());
			$options_wrap.empty();
			get_best_price($runsize.val(), color);
			reset_shipping_table();
		}
		else // Any other option on tat, get the base price and populate shipping table
		{
			// template_get_base_price($runsize.val(), $color.val(), $(this).val());
			// template_get_shipping($runsize.val(), $color.val(), $(this).val());
			template_get_base_price($runsize.val(), color, selected_tat);
			template_get_shipping($runsize.val(), color, selected_tat);
			template_get_options($runsize.val(), color, selected_tat);
		}
	});
	
	// If there's onyl one tat option then the following will execute
	if( count < 2){

		$tat_select.hide();
		$tat_wrap.append('<div class="one-option">' + last_val + '<div>');
		one_option_value = $tat_wrap.find('select.tat option:nth-child(2)').val();
		// console.log(one_option_value);
		// get_best_price(runsize, color);
		$
		template_get_base_price(runsize, color, one_option_value);
		template_get_shipping(runsize, color, one_option_value);
		template_get_options(runsize, color, one_option_value)
	}

  }, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});
}

function template_get_options(runsize, color, tat) {
	var count;
	var $option_select;
	var $select_cache = new Array();
	$options_wrap.empty();
	makeCouchRequest(js_config['base_path']+"db/options", function(data){
		options = data['rows'][0]['value']['options'];
		// If the options array if not empty poplate the options-wrap
		if(options)
		{
			$.each(options, function(key, val){
				$options_wrap.append('<h2>'+ val +'</h2><select class="options" id="prod-select-'+key+'" name="addition-select['+key+']"></select>');
				$option_select = $options_wrap.find('#prod-select-'+key);
				$option_select.append('<option value="select">--Select '+ val +'--</option>');
				$select_cache.push($option_select);
				if(key > 0) {
					$option_select.attr('disabled', true);
				}
			});
			makeCouchRequest(js_config['base_path']+"db/options-object", function(data){
				options_object = data['rows'][0]['value'][tat];
				ui_action_option_construct($select_cache, options_object, 0, runsize, color, tat);
			}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});
		}
		else
		{
			$options_wrap.html('<h2>No Options.</h2>');
		}
	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});
}

function template_get_shipping(runsize, color, tat) {

	makeCouchRequest(js_config['base_path']+"db/price", function(data){
		//var data = jQuery.parseJSON(data_price);
		// console.log(data);
		shipping = data['rows'][0]['value'][tat]['defaultShipping'];
		render_shipping_table(shipping);
		
		
	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});
}

function render_shipping_table(shipping_obj) {
	shipping = shipping_obj;
	// console.log(shipping);
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
}

/*

	HELPER FUNCTIONS

*/

function template_get_base_price(runsize, color, tat) {
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
				//$product_datails.find('.product-base-price span.price-title').html('Subtotal');
				//$product_datails.find('.product-base-price span.base-price').html(price[key].base_price);
				render_base_price(price[key].base_price);
			}
		});
	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '","' + tat  +'"]'});
}

function get_best_price(runsize, color) {
	makeCouchRequest(js_config['base_path']+"db/best_price", function(data) {
		render_base_price(data['rows'][0]['value']);
  	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color + '"]'});
}

function render_base_price(subtotal) {
	$product_datails.find('.product-base-price span.price-title').html('Subtotal');
	$product_datails.find('.product-base-price span.base-price').html(subtotal);
}

function ui_action_option_construct($select_cache, options_object, start_key, runsize, color, tat) {
	console.log(options_object);
	$.each($select_cache, function(key, val) {
		if(key == start_key) {
			$.each(options_object, function(option_label, option_tree) {
				var i = 0;
				// console.log(option_tree);
				$select_cache[key].empty();
				$select_cache[key].data('label', option_label);
				$select_cache[key].data('obj', option_tree);
				$select_cache[key].append('<option value="select">--Select '+ option_label +'--</option>');
				$.each(option_tree, function(option_key, option_val) {
					// console.log(option_key);
					$select_cache[key].append('<option class="primary-opt" value="'+i+'" id="primary-opt-'+i+'">'+option_key+'</option>');
					//if(option_val.options) {
						$select_cache[key].find("option#primary-opt-"+i).data('optionSubTree', option_val);
						// console.log(option_val);
					//}
					i++;
				});
			});

			this.change(function() {
				var selected = $(this).find(':selected');
				
				if(selected.val() == 'select') {
					var prev_select_obj = $(this).prev().prev().find(':selected').data('optionSubTree');
					if(start_key > 0) {
						// console.log(my_var);
						// console.log(prev_select_obj['base_price']);
						render_base_price(prev_select_obj['base_price']);
					} else {
						template_get_base_price(runsize, color, tat);
					}
					// template_get_base_price(runsize, color, tat);
					$.each($select_cache, function(key, val) {
						if(key > start_key) {
							$(this).empty();
							$select_cache[start_key+1].append('<option value="select">--Select '+ $(this).data('label') +'--</option>');
							$(this).attr('disabled', true);
						}
					});
				} else {
					// console.log($(this));
					var sub_options = $(this).find(':selected').data('optionSubTree');
					shipping_obj = sub_options['defaultShipping'];
					render_base_price(sub_options.base_price);
					render_shipping_table(shipping_obj);
					if(sub_options.options) {
						ui_action_option_construct($select_cache, sub_options.options, start_key+1, runsize, color, tat);
						$select_cache[start_key+1].attr('disabled', false);
						//$select_cache[start_key+1].append('<option value="select">--Select '+ $select_cache[start_key+1].data('label') +'--</option>');
					}
				}
			});
		}
	});
}

function template_reset_base_price() {
	var $base_price = $product_datails.find('.product-base-price');
	$base_price.find('span.price-title').html($base_price.data('price-title'));
	$base_price.find('span.base-price').html($base_price.data('base-price'));
}

function reset_shipping_table(){
	$shipping_wrap.empty();
}
