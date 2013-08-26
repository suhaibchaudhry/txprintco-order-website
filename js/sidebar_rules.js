$(document).ready(function() {
	$('#edit-sidebar-rules').click(function(){
		if($('.side-bar').find('#menu').length)
		{
			// Add edit buttons on each category when "Edit Sidebar" is clicked
			$("#menu li:not(:has(span.edit-category))").each(function( index ) {
				$(this).append('<span class="edit-category"><input type="submit" value="edit" class="edit-category-edit-button"></span>');
			});
			
			// var $edit_category_span = $('#menu li span.edit-category');
			// Add text input and button when "edit" button is clicked on a product
			$('#menu li span.edit-category input.edit-category-edit-button').click(function(index){	
				console.log(index);
				var title_of_category = $(this).parent().parent().find("a").text();
				console.log(title_of_category);
				$(this).parent().empty().append('<input type="text" placeholder="'+title_of_category+'"><input type="submit" value="Done" class="edit-category-done-button">');
				
				if('#menu li span.edit-category input.edit-category-done-button') {
					console.log('Dont button found');
				}
				
			});
		}
	});
});

