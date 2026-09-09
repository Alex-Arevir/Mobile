<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    return is_array($data) ? $data : [];
}

function jsonResponse(bool $success, string $message, array $extra = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(
        array_merge(['success' => $success, 'message' => $message], $extra),
        JSON_UNESCAPED_UNICODE
    );
    exit;
}

function bearerToken(): ?string {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (preg_match('/Bearer\s+(.+)/i', $header, $matches)) {
        return trim($matches[1]);
    }
    return null;
}

function requireAuth(PDO $pdo): array {
    $token = bearerToken();

    if (!$token) {
        jsonResponse(false, 'Authorization token is required.', [], 401);
    }

    $stmt = $pdo->prepare(
        'SELECT id, username, email, role, status
         FROM users
         WHERE api_token = :token AND status = "active" AND (api_token_expires_at IS NULL OR api_token_expires_at > CURRENT_TIMESTAMP)
         LIMIT 1'
    );
    $stmt->execute(['token' => hash('sha256', $token)]);
    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(false, 'Invalid or expired authorization token.', [], 401);
    }

    return $user;
}

function publicUser(array $user): array {
    return [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'user',
        'status' => $user['status'] ?? 'active',
        'created_at' => $user['created_at'] ?? null,
        'updated_at' => $user['updated_at'] ?? null,
    ];
}
