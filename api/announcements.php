<?php
// announcements.php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT a.id, a.title, a.body, a.created_at, u.username AS author FROM announcements a LEFT JOIN users u ON a.author_id = u.id ORDER BY a.created_at DESC");
    $ann = $stmt->fetchAll();
    echo json_encode(['announcements' => $ann]);
    exit;
}

if ($method === 'POST') {
    if (empty($_SESSION['user'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $title = trim($data['title'] ?? '');
    $body = $data['body'] ?? '';

    if ($title === '' || $body === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing title or body']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO announcements (title, body, author_id) VALUES (?, ?, ?)");
    $stmt->execute([$title, $body, $_SESSION['user']['id']]);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

if ($method === 'DELETE') {
    if (empty($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden']);
        exit;
    }
    // expecting ?id={id}
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid id']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
