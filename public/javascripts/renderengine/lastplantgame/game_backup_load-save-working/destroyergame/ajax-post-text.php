<?php

$posted = &$_POST ;

$fname=$posted["file"];

if(strcmp($fname, "ajax-post-text.txt") != 0)
	die("You are not authorized to change this file.");

$value = $posted["content"];

$nfile = fopen($fname, "w");

if($nfile != false)
{
	fwrite($nfile, $value);
	fclose($nfile);
}	

?>