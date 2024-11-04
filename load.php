<?php
if (file_exists('saved_website.html')) {
    echo file_get_contents('saved_website.html');
} else {
    echo 'No saved content found';
}
?>
