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
	<link href="css/vader/jquery-ui-1.10.3.custom.css" rel="stylesheet">
	<link href="styles.css" rel="stylesheet">
	<script src="js/jquery-1.9.1.js"></script>
	<script src="js/jquery-ui-1.10.3.custom.js"></script>
	<script src="js/components.js"></script>
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
			<?php print template_sidebar(); ?>
		</div>
		<div class="product-form">
			<?php print template_product_details() ?>
		</div>
	</div>
</body>
</html>