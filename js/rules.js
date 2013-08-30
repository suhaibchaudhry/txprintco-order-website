$(document).ready(function() {
	
	// Edit Categories
	$('#edit-sidebar-rules').click(function(){
		$('#edit-sidebar-rules').toggleClass('active').val('Done');
		if($('#edit-sidebar-rules.edit-rules.active').length)
		{
			if($('.side-bar').find('#menu').length)
			{
				// Add edit buttons on each category when "Edit Sidebar" is clicked
				$("#menu li:not(:has(span.edit-category))").each(function( index ) {
					$(this).append('<span class="edit-category"><input type="submit" value="edit" class="edit-category-edit-button"></span>');
				});
				// Add text input and button when "edit" button is clicked on a product
				$('#menu li span.edit-category input.edit-category-edit-button').click(function(index){	
					var title_of_category = $(this).parent().parent().find("a").text();
					console.log(title_of_category);
					$(this).parent().find('input.edit-category-edit-button').hide();
					$(this).parent().append('<input type="text" placeholder="'+title_of_category+'" class="edit-category-markup-input"><input type="submit" value="Done" class="edit-category-done-button">');
					
					if($('#menu li span.edit-category input.edit-category-done-button').length) {
						$('#menu li span.edit-category input.edit-category-done-button').click(function() {
							var myCategoryDocument = {};
							myCategoryDocument['_id'] = title_of_category;
							myCategoryDocument['type'] = 'category';
							myCategoryDocument['title'] = title_of_category;
							myCategoryDocument['markup'] = $(this).parent().find('input.edit-category-markup-input').val();
							//console.log(myCategoryObject);
							makeCouchRuleRequest('category', myCategoryDocument);
							$(this).parent().find('input.edit-category-edit-button').show();
							$(this).parent().find('input.edit-category-markup-input').remove();
							$(this).parent().find('input.edit-category-done-button').remove();
							
						});
					}
					
				});
			}
		} else {
			$('#edit-sidebar-rules').val('Edit Sidebar');
			$('#menu li').each(function() {
				$(this).find('span.edit-category').remove();	
			});
		}
	});
});

function makeCouchRuleRequest(type, object) {
	var myObject = {};
	myObject['rule_type'] = type;
	myObject['doc'] = JSON.stringify(object);
	console.log(myObject);
	var options = {
	url: 'gateway.php',
	data: myObject,
	type: "GET",
	success: function(data) {
		//callback(jQuery.parseJSON(data));
	},
	error: function(xhr,status,error) {
		console.log(error);
	}
	};
	$.ajax(options);
	
}