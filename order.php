<?php 
	require_once 'includes/template.php';
	require_once 'includes/datasource.php';
	$js_config['base_path'] = base_path();
	$js_config['product_id'] = $_GET['product_id'];
?>

<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Document</title>
	<link href="/css/styles.css" rel="stylesheet">
	<script src="js/jquery-1.9.1.js"></script>
	<script src="js/datasource.js"></script>
    <script src="js/sidebar_rules.js"></script>
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
			<input type="submit" value="Edit Sidebar" id="edit-sidebar-rules" class="edit-rules">
			<?php print template_sidebar(); ?>
		</div>
		<div class="product-form">
			<!-- <input type="submit" value="Edit Product" class="edit-rules"> -->
			<?php print template_product_details() ?>
		</div>
	</div>
</body>
</html>