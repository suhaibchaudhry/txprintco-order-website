<?php
global $config;
$config = array();

$config['couchdb']['host'] = '127.0.0.1';
$config['couchdb']['user'] = 'root';
$config['couchdb']['pass'] = 'xyz786';
$config['couchdb']['port'] = '5984';
$config['couchdb']['database'] = 'tpc_product_documents';

$config['couchruledb']['host'] = '127.0.0.1';
$config['couchruledb']['user'] = 'root';
$config['couchruledb']['pass'] = 'xyz786';
$config['couchruledb']['port'] = '5984';
$config['couchruledb']['database'] = 'tpc_product_rules_documents';

$config['app']['base_path'] = '/';
$config['app']['debug'] = true;
