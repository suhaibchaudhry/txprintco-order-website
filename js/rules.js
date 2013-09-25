$(document).ready(function () {

    SidebarClickEvents();
    SubcatClickEvents();

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
	},
	error: function(xhr,status,error) {
		console.log(error);
	}
	};
	$.ajax(options);

}

function getRules(id, edit_div ,callback) {
    var options = {
        url: 'gateway.php',
        data: id,
        type: "GET",
        success: function (data) {
            //callback(jQuery.parseJSON(data));
            var clicked_div = edit_div;
            callback(data, clicked_div);
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    };
    $.ajax(options);
}

function SidebarClickEvents() {
    // Edit Categories
    $('#edit-sidebar-rules').click(function () {
        $('#edit-sidebar-rules').toggleClass('active').val('Done');
        if ($('#edit-sidebar-rules.edit-rules.active').length) {
            if ($('.side-bar').find('#menu').length) {
                // Add edit buttons on each category when "Edit Sidebar" is clicked
                $("#menu li:not(:has(span.edit-category))").each(function (index) {
                    $(this).append('<span class="edit-category"><input type="submit" value="edit" class="edit-category-edit-button"></span>');
                });
                // Add text input and button when "edit" button is clicked on a product
                $('#menu li span.edit-category input.edit-category-edit-button').click(function (index) {
                    var title_of_category = $(this).parent().parent().find("a").text();
                    $(this).parent().find('input.edit-category-edit-button').hide();
                    getRules({ get_rule_for: title_of_category }, $(this), function (data, clicked_button) {
                        // clicked_button.parent().find('input.edit-category-edit-button').hide();
                        clicked_button.parent().append('<input type="text" placeholder="' + title_of_category + '" value="' +data+ '" class="edit-category-markup-input"><input type="submit" value="Done" class="edit-category-done-button">');
                        if ($('#menu li span.edit-category input.edit-category-done-button').length) {
                            $('#menu li span.edit-category input.edit-category-done-button').click(function () {
                                var myCategoryDocument = {};
                                myCategoryDocument['_id'] = title_of_category;
                                myCategoryDocument['type'] = 'category';
                                myCategoryDocument['title'] = title_of_category;
                                myCategoryDocument['markup'] = $(this).parent().find('input.edit-category-markup-input').val();
                                makeCouchRuleRequest('category', myCategoryDocument);
                                $(this).parent().find('input.edit-category-edit-button').show();
                                $(this).parent().find('input.edit-category-markup-input').remove();
                                $(this).parent().find('input.edit-category-done-button').remove();
                            });
                        }
                    });
                });
            }
        } else {
            $('#edit-sidebar-rules').val('Edit Sidebar');
            $('#menu li').each(function () {
                $(this).find('span.edit-category').remove();
            });
        }
    });
}

function SubcatClickEvents() {
    var subcat_button = $('#edit-subcat-rules');
    subcat_button.click(function () {
        $(this).toggleClass('active').val('Done');
        var subcat_heading_div = $('.products-subcat-title');
        if ($(this).hasClass('active')) {
            console.log(subcat_heading_div.length);
            // Add edit button div to each subcat title div
            if (subcat_heading_div.length) {
                $(subcat_heading_div).each(function (index) {
                    $(this).append('<span class="edit-subcat"><input type="submit" value="edit" class="edit-subcat-edit-button"></span>');
                });

                // Add text input and button when "edit" button is clicked on a subcat
                subcat_heading_div.find('.edit-subcat-edit-button').click(function () {
                    //console.log($(this).parent().parent().find('h2'));
                    var title_of_subcat = $(this).parent().parent().find('h2').text();
                    var title_of_category = js_config['product_cat'];
                    var subcat_cat_concat = title_of_category+title_of_subcat;
                    getRules({ get_rule_for: subcat_cat_concat }, $(this), function (data, clicked_button) {
                        console.log(data);
                        console.log(clicked_button);
                        clicked_button.hide();
                        clicked_button.parent().append('<input type="text" placeholder="' + title_of_subcat + '" value="' + data + '" class="edit-subcat-markup-input"><input type="submit" value="Done" class="edit-subcat-done-button">');
                        clicked_button.parent().find('input.edit-subcat-done-button').click(function () {
                            var mySubcatDocument = {};
                            mySubcatDocument['_id'] = subcat_cat_concat;
                            mySubcatDocument['type'] = 'subcat';
                            mySubcatDocument['title'] = title_of_subcat;
                            mySubcatDocument['parent_cat'] = title_of_category;
                            mySubcatDocument['markup'] = clicked_button.parent().find('input.edit-subcat-markup-input').val();
                            makeCouchRuleRequest('subcat', mySubcatDocument);
                            clicked_button.parent().find('input.edit-subcat-edit-button').show();
                            clicked_button.parent().find('input.edit-subcat-markup-input').remove();
                            clicked_button.parent().find('input.edit-subcat-done-button').remove();
                        });
                    });
                });
            }
        } else {
            $(this).val('Edit Subcat');
            subcat_heading_div.find('span.edit-subcat').remove();
            //console.log(subcat_heading_div.has('span.edit-subcat'));
        }
    });
}
