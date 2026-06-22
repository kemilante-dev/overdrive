<?php
// auth.php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '' || strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid username or password (min 6 chars)']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
    try {
        $stmt->execute([$username, $hash]);
        echo json_encode(['ok' => true]);
    } catch (PDOException $e) {
        http_response_code(409);
        echo json_encode(['error' => 'Username taken']);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password_hash'])) {
        // regenerate session id on login
        session_regenerate_id(true);
        $_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']];
        echo json_encode(['ok' => true, 'user' => $_SESSION['user']]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'logout') {
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'me') {
    echo json_encode(['user' => $_SESSION['user'] ?? null]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
