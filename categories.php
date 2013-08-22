<?php
	require_once 'includes/template.php';
	require_once 'includes/datasource.php';
	$js_config['base_path'] = base_path();
?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Tx Print Co Order</title>
	<link href="/css/styles.css" rel="stylesheet">
	<script src="js/jquery-1.9.1.js"></script>
	<script src="js/datasource.js"></script>
	<script type="text/javascript">
	<!--//--><![CDATA[//><!--
	js_config = {};
	jQuery.extend(js_config, <?php print json_encode($js_config) ?>);
	//--><!]]>
	</script>
</head>
<body>
	<div id="content">
		<div class="side-bar">
		<input type="submit" value="Edit Sidebar" class="edit-rules">
			<?php print template_sidebar(); ?>
		</div>
		<div class="products">
			<ul class="menu">
				<?php /*print template_products()*/ ?>
				<!-- <input type="submit" value="Edit Subcat" class="edit-rules"> -->
				<?php print template_products_with_subcat() ?>
			</ul>
			
		</div>
	</div>
</body>
</html>