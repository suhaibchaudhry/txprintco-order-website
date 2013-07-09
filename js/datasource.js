$(document).ready(function() {
	//Cache JQuery Objects
	$runsizes_wrap = $('div.runsizes-wrap');
	$colors_wrap = $('div.colors-wrap');
	$tat_wrap = $('div.tat-wrap');
	$options_wrap = $('div.options-wrap');
	$order_details = $('div.order-details');
	$base_price = $('div.product-base-price');
	
	$base_price.hide();

	$('div.runsizes-wrap select.runsizes').change(function(){
		var runsize = $(this).val();
		template_get_colors(runsize);
	});
});

function makeCouchRequest(url, callback, data) {
	var options = {
		url: url,
		//dataType: 'application/json; charset=utf-8',
		type: "get",
		success: function(data) {
			// console.log(data);
			callback(data);
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

	makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/colors", function(data){
		// Add a heading and append a drop down to the form
		colors = data['rows'][0]['value'];
		$colors_wrap.empty().append('<h2>Select a color:</h2><select class="colors"></select>');
		
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
			template_get_tat(runsize, $(this).val());
		});
		
		if(count < 2) {
			$color_select.hide();
			template_get_tat(runsize, last_key);
			$colors_wrap.append('<div class="one-option">'+ last_val +'</div>');
		}

	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'"]'});
}


function template_get_tat(runsize, color) {
	
  makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/tat", function(data){
	
	makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/price", function(data_price){
		console.log(data_price);
		
	}, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});
	
	console.log(color);
	console.log(data);
	
	tat = data['rows'][0]['value'];
	$tat_wrap.empty().append('<h2>Select a turn around time:</h2><select class="tat"></select>');
	
	var last_ket = '';
	var last_value = '';
	
	var $tat_select = $tat_wrap.find('select.tat');
	
	count = 0;
	$.each(tat, function(key, val){
		$tat_select.append('<option value="' + key + '">' + val + '</option>');
		last_ket = key;
		last_val = val;
		count++;
	});
	
	// Add a event handler on tat
	// TODO:
	
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