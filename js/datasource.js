$(document).ready(function(){

	//js_config.product_cat;
	// alert(first);
	// getProductDetails();

  // $('.runsizes').val(function(){
  //   var runsize = $(this).val();
  //   template_get_colors(runsize);
  // });

  $('.runsizes').change(function(){
    var runsize = $(this).val();
    template_get_colors(runsize);
  });
});

function makeCouchRequest(url, callback, data) {
  console.log(url);
  var options = {
      url: url,
      //dataType: 'application/json; charset=utf-8',
      type: "get",
      success: function(data) {
        // console.log(data);
        callback(data);
      },
      error: function(xhr,status,error)
      {
        //alert(xhr);
        console.log(error);
      }
  };

  if(data) {
      options['data'] = data;
  }

  $.ajax(options);
}

function template_get_colors(runsize)
{
  var count;
  // console.log('Template function: ' + runsize);
  // console.log('Template function: ' + js_config.product_id);
  makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/colors", function(data){


    // Remove .runsize-colors drop down and h2 heading if it exists
    if($('.product-details').find('.runsize-colors')){
      // console.log('Element found');
      $('.runsize-colors').prev().remove();
      $('.runsize-colors').remove();
    }

    // Add a heading and append a drop down to the form
    count = data['rows'][0]['value'].length;
    console.log('Array length: ' + count);
    if(count > 1)
      {
        $('.product-details').append($('<h2>Select a color:</h2>'));
        $('.product-details').append($('<select>').addClass('runsize-colors'));
        for (var i in data['rows'][0]['value']) {
          for (var j in data['rows'][0]['value'][i]) {
            $('.runsize-colors').append('<option>'+ j +'</option>');
            // console.log(key);
          }
        }
      }
      else
      {
        $('.product-details').append($('<h2>Color:</h2>'));
        for (var k in data['rows'][0]['value']){
          for (var l in data['rows'][0]['value'][k]){
            $('.product-details').append('<div class="one-option">'+ l +'</di>');
            color = l;
          }
        }

        template_get_tat(runsize, color);
      }
      // Add a event handler on .runsize-colors
      $('.runsize-colors').change(function(){
        var color = $(this).val();
        console.log(color);
        template_get_tat(runsize, color);
      });



  }, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'"]'});
}

function template_get_tat(runsize, color)
{

  makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/tat", function(data){

    console.log(data);
    // Remove .runsize-tat drop down and h2 heading if it exists
    if($('product-details').find('.runsize-tat'))
    {
      $('.runsize-tat').prev().remove();
      $('.runsize-tat').remove();
    }

    // Add a heading and append a drop down to the form
    $('.product-details').append($('<h2>Select a turn around time:</h2>'));
    $('.product-details').append($('<select>').addClass('runsize-tat'));

    // Add a event handler on .runsize-tat
    // TODO:

    // console.log(data['rows'][0]['value'][1693741]);
    for (var i in data['rows'][0]['value']) {
      for (var j in data['rows'][0]['value'][i]) {
        $('.runsize-tat').append('<option>'+ data['rows'][0]['value'][i][j] +'</option>');
        // console.log(data['rows'][0]['value'][i][j]);
      }
    }

  }, {key: '["' + js_config.product_id + '"' + ',"' + runsize +'","' + color +'"]'});

}


// function getProductDetails() {
// 	console.log("Function was called");
// 	//alert("Function was called");
// 	// var the_url = "http://127.0.0.1:5984/tpc_product_documents/_design/txprintco/_view/products?key=%22Akuafoil%22"
// 	makeCouchRequest(js_config['base_path']+"db/_design/txprintco/_view/products_details", function(data) {
//     console.log(data);
//   }, {key: '"'+js_config.product_id+'"'});
// }
