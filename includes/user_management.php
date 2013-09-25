<?php
session_start();
echo '<pre>';
//var_dump($_SESSION);
echo '</pre>';
if(isset($_GET['user'])) {
	$user = $_GET['user'];
	if($user == 1) {
		$_SESSION['admin'] = true;
	}
} elseif (isset($_GET['logout'])) {
  $_SESSION['admin'] = false;
}

if(isset($_SESSION['admin'])) {
	// var_dump($_SESSION);
} else {
  // var_dump($_SESSION);
}

function check_user() {
	if($_SESSION['admin']){
		return 'admin';
	}
}