$(document).ready(function() {
	$('#edit-sidebar-rules').click(function(){
		if($('.side-bar').find('#menu').length)
		{
			var count = $('#menu li').size();
			var i = 0;
			console.log(count);
			while(i < count)
			{
				$('#menu li').eq(i).append(' - edit');
				i++;
			}
			
		}
	});

	$('#menu li').click(function(){
		console.log($(this).index());
	});

	console.log('The 5th li element: ' + $('#menu li').eq(4).text());
});