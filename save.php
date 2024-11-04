<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $content = $_POST['content'];
    file_put_contents('saved_website.html', $content);
    echo 'Content saved successfully';
}
?>
