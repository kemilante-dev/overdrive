<?php
// db.php
// PDO connection for Overdrive API
$DB_HOST = '127.0.0.1';
$DB_NAME = 'overdrive_db';
$DB_USER = 'root'; // XAMPP default
$DB_PASS = '';     // XAMPP default (empty)

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'DB connection failed']);
    exit;
}
