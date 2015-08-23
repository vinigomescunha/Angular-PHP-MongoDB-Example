<?php
require_once 'lib' . DIRECTORY_SEPARATOR . 'mongo.php';

$a = FILTER_INPUT(INPUT_GET, 'a' , FILTER_SANITIZE_STRING);
$m = new mongoCustom();
if(method_exists($m,$a)) call_user_func(array($m,$a));
