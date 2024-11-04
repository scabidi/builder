<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $htmlContent = $data['html'];
    $images = $data['images'];

    $websiteDir = 'website';
    $imagesDir = $websiteDir . '/images';

    if (!file_exists($websiteDir)) {
        mkdir($websiteDir, 0777, true);
    }

    if (!file_exists($imagesDir)) {
        mkdir($imagesDir, 0777, true);
    }

    // Save images with original names
    foreach ($images as $image) {
        $imageData = explode(',', $image['data'])[1];
        $decodedImageData = base64_decode($imageData);
        file_put_contents("$imagesDir/{$image['name']}", $decodedImageData);
    }

    // Update HTML content to use the relative path to the image files
    foreach ($images as $image) {
        $htmlContent = str_replace($image['data'], "images/{$image['name']}", $htmlContent);
    }

    // Save HTML content
    file_put_contents("$websiteDir/website.html", $htmlContent);

    // Create ZIP archive
    $zip = new ZipArchive();
    $zipFile = tempnam(sys_get_temp_dir(), 'zip');

    if ($zip->open($zipFile, ZipArchive::CREATE) !== true) {
        exit("Cannot open <$zipFile>\n");
    }

    // Add HTML file to the root of the zip
    $zip->addFile("$websiteDir/website.html", "website.html");

    // Add images to the zip
    foreach ($images as $image) {
        $filePath = "$imagesDir/{$image['name']}";
        $zip->addFile($filePath, "images/{$image['name']}");
    }

    $zip->close();

    // Send ZIP file as response
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="website.zip"');
    header('Content-Length: ' . filesize($zipFile));
    readfile($zipFile);

    // Clean up
    unlink($zipFile);
    array_map('unlink', glob("$imagesDir/*.*"));
    rmdir($imagesDir);
    array_map('unlink', glob("$websiteDir/*.*"));
    rmdir($websiteDir);
}
?>
