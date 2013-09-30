$(document).ready(function () {

    SidebarClickEvents();
    SubcatClickEvents();
    EventListenerRunsizes();

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

function EventListenerRunsizes() {
    var $runsize_cache = $('.runsizes');

    $runsize_cache.change(function() {
        $runsize_rules_wrap_cache = $('.runsizes-rules-wrap');
        var picked_runsize = $runsize_cache.find('option:selected').val();
        console.log(picked_runsize);
        if(picked_runsize == 'select') {
            $runsize_rules_wrap_cache.html('Pick a runsize..');
        } else {
            $runsize_rules_wrap_cache.empty();
            var content = '';
            content  = '<div class="runssize-rules-click-nav"><ul class="no-js">';
            content += '<li>';
            content += '<input type="submit" value="Rules for: '+picked_runsize+' runsize" class="runsize-rules clicker">';
            content += '<ul class="inner-runsize-rule">';
            content += '<li><span>Markup: </span><input type="select" placeholder="Markup Percentage..." runsize" class="runsize-markup-rule"></li>';
            content += '<li><span>Promotion: </span><input type="select" placeholder="Promotion Percentage..." runsize" class="runsize-promotion-rule"></li>';
            content += '<li><span>Flat: </span><input type="select" placeholder="Flat Rate..." runsize" class="runsize-flat-rule"></li>';
            content += '<li class="runsize-pick-default">';
            content += 'Pick Default:<span class="radio-error"></span> <br>';
            content += '<input type="radio" name="pick-default" id="pick-default" value="markup">Markup';
            content += '<input type="radio" name="pick-default" id="pick-default" value="promotion">Promotion';
            content += '<input type="radio" name="pick-default" id="pick-default" value="flat">Flat Rate';
            content += '</li>';
            content += '<li><input type="submit" value="Done" class="runsize-rule-submit"></li>';
            content += '</ul></li></ul></div>';;
            $runsize_rules_wrap_cache.html(content);

            var $runsize_wrap_cache = $('.runsizes-wrap');
            var runsize_wrap_height = $runsize_wrap_cache.css('height');
            $('.runssize-rules-click-nav > ul').toggleClass('no-js js');
            $('.runssize-rules-click-nav .js ul').hide();
            $('.runssize-rules-click-nav .runsize-rules').click(function(e) {
                var inner_runsize_rule_display = $('.inner-runsize-rule').css('display');
                $('.runssize-rules-click-nav .js ul').slideToggle(200);
                $('.clicker').toggleClass('active');
                var ul_height = $('.inner-runsize-rule')[0].scrollHeight;
                if(inner_runsize_rule_display == 'none'){
                    $runsize_wrap_cache.css('height', ul_height + 20);
                    e.stopPropagation();
                } else {
                    $runsize_wrap_cache.css('height', runsize_wrap_height);
                }
            });

            var $runsize_rules_cache = $runsize_rules_wrap_cache.find('.runssize-rules-click-nav');
            var $runsize_rules_button = $runsize_rules_wrap_cache.find('.runsize-rule-submit');
            $runsize_rules_button.click(function(){
                var input_values = {};
                // Validate inputs
                var markup_input    = $runsize_rules_cache.find('.runsize-markup-rule').val().trim();
                var promotion_input = $runsize_rules_cache.find('.runsize-promotion-rule').val().trim();
                var flat_rate_input = $runsize_rules_cache.find('.runsize-flat-rule').val().trim();
                var checked = null;
                var inputs = document.getElementsByName('pick-default');
                for (var i = 0; i < inputs.length; i++) {
                      if (inputs[i].checked) {
                       checked = inputs[i];
                   }
                }
                if(checked==null) {
                    $('.runssize-rules-click-nav .radio-error').html(' Please choose a value.');
                }
                else {
                    $('.runssize-rules-click-nav .radio-error').empty();
                    input_values = {markup : markup_input, promotion : promotion_input, flat : flat_rate_input, default: checked.value};
                    // console.log(input_values);
                    ProductRunsizeClickEvents(input_values);
                }
            });
        }
    });
}

function ProductRunsizeClickEvents(values) {
    console.log(values);
}