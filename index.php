<?php
	// session_start();
	// $_SESSION['admin'] = 'Usman Tamanna is a good coder.';
	// echo session_id();
	// echo '<pre>';
	// var_dump($_SESSION);
	// echo '</pre>';
	// session_start();
	require_once 'includes/user_management.php';
  require_once 'includes/template.php';
  // Get the type of user
  $user_type = check_user();
  // var_dump(check_user());
?>
<!doctype html>
<html lang="us">
<head>
	<meta charset="utf-8">
	<title>Tx Printing Co.</title>
	<link href="/css/styles.css" rel="stylesheet">
	<script src="js/jquery-1.9.1.js"></script>
	<?php if($user_type == 'admin') echo '<script src="js/rules.js"></script>' ?>
</head>
<body>
	<div id="content">
		<div class="side-bar">
			<?php print template_sidebar(); ?>
		</div>
	</div>
</body>
</html>