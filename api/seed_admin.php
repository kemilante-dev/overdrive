<?php
// seed_admin.php
// Run this once (via browser or CLI) to create a default admin user if it doesn't exist.
// WARNING: remove or protect this file after use in production.
require_once __DIR__ . '/db.php';

$defaultUser = 'admin';
$defaultPass = 'admin123';

// check if exists
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
$stmt->execute([$defaultUser]);
$exists = $stmt->fetch();

if ($exists) {
    echo json_encode(['ok' => false, 'message' => 'Admin already exists']);
    exit;
}

$hash = password_hash($defaultPass, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')");
$stmt->execute([$defaultUser, $hash]);

echo json_encode(['ok' => true, 'username' => $defaultUser, 'password' => $defaultPass, 'note' => 'Change the password immediately']);
