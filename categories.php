<?php
	// session_start();
	// echo session_id();
	// echo '<pre>';
	// var_dump($_SESSION);
	// echo '</pre>';
	require_once 'includes/user_management.php';
	require_once 'includes/template.php';
	require_once 'includes/datasource.php';
	// var_dump(check_user());
	$js_config['base_path'] = base_path();
  $js_config['product_cat'] = $_GET['product_cat'];

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Tx Print Co Order</title>
	<link href="/css/styles.css" rel="stylesheet">
	<script src="js/jquery-1.9.1.js"></script>
	<script src="js/datasource.js"></script>
    <script src="js/rules.js"></script>
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
		<div class="products">
			<ul class="menu">
				<?php print template_products_with_subcat() ?>
			</ul>

		</div>
	</div>
</body>
</html>