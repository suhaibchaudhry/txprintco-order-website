$(document).ready(function() {
	//Cache JQuery Objects
	$product_datails = $('div.product-details');
	$runsizes_wrap = $('div.runsizes-wrap');
	$colors_wrap = $('div.colors-wrap');
	$tat_wrap = $('div.tat-wrap');
	$options_wrap = $('div.options-wrap');
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
		makeCouchRequest(js_config['base_path']+"db/tpc_product_documents/_design/txprintco/_view/colors", function(data){ 
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
			// var selected_color = $(this).val();
			// console.log(selected_color);
			selected_color = $(this).val();
			//$tat_wrap.show();
			template_get_tat(runsize, selected_color);
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
makeCouchRequest(js_config['base_path']+"db/tpc_product_documents/_design/txprintco/_view/tat", function(data){
	//console.log(json_data);
	//var data = jQuery.parseJSON(json_data);
	// console.log(color);
	// console.log(data);
	console.log(data);
	tat = data['rows'][0]['value'];
	// console.log(tat);
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
		console.log(selected_tat);
		var $runsize = $runsizes_wrap.find('select.runsizes');
		var $color = $colors_wrap.find('select.colors');
		console.log($runsize.val());
		template_get_base_price($runsize.val(), $color.val(), $(this).val());
	});
	
	if( count < 2){
		$tat_select.hide();
		
		$tat_wrap.append('<div class="one-option">' + last_val + '<div>');
	}
	
   /* 
    console.log(data['rows'][0]['value']);
    for(var h in data['rows'][0]['value'])
    {
      count = data['rows'][0]['value'][h].length;
      console.log(count);
    }
    if(count > 1)
    {
      // Add a heading and append a drop down to the form
      $('.product-details').append($('<h2>Select a turn around time:</h2>'));
      $('.product-details').append($('<select>').addClass('runsize-tat'));

      // console.log(data['rows'][0]['value'][1693741]);
      for (var i in data['rows'][0]['value']) {
        for (var j in data['rows'][0]['value'][i]) {
          $('.runsize-tat').append('<option>'+ data['rows'][0]['value'][i][j] +'</option>');
        }
      }
    }
    else
    {
      $('.product-details').append($('<h2>Turn around time:</h2>'));
      for (var k in data['rows'][0]['value']) {
        for (var l in data['rows'][0]['value'][k]) {
          $('.product-details').append('<div class="one-tat-option">'+ data['rows'][0]['value'][k][l] +'</div>');
        }
      }
    }
    // Add a event handler on .runsize-tat
    $('.runsize-tat').change(function(){
        var tat = $(this).val();
        console.log(tat);
        // template_get_tat(runsize, color);
      });*/

  }, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});

//}


// function getProductDetails() {
// 	console.log("Function was called");
// 	//alert("Function was called");
// 	// var the_url = "http://127.0.0.1:5984/tpc_product_documents/_design/txprintco/_view/products?key=%22Akuafoil%22"
// 	makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/products_details", function(data) {
//     console.log(data);
//   }, {key: '"'+js_config.product_id+'"'});
}

function template_reset_base_price() {
	var $base_price = $product_datails.find('.product-base-price');
	$base_price.find('span.price-title').html($base_price.data('price-title'));
	$base_price.find('span.base-price').html($base_price.data('base-price'));
}

function template_get_base_price(runsize, color, tat)
{
		// Get the base price for the run size
	makeCouchRequest(js_config['base_path']+"db/tpc_product_documents/_design/txprintco/_view/price", function(data){
		//var data = jQuery.parseJSON(data_price);
		
		price = data['rows'][0]['value'];
		console.log(price);
		
		$.each(price, function(key, val){
			console.log(key);
			if(key === tat)
			{
				console.log(price[key].base_price);
				//$base_price.show().empty().append('<h3>Base Price: '+ price[key].base_price +'</h3>');
				$product_datails.find('.product-base-price span.price-title').html('Subtotal');
				$product_datails.find('.product-base-price span.base-price').html(price[key].base_price);
			}
		});


	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});
}