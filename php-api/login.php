<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', [], 405);
}

$data = getJsonInput();
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
    jsonResponse(false, 'Username and password are required.', [], 400);
}

$stmt = $pdo->prepare(
    'SELECT id, username, email, password_hash, role, status, created_at, updated_at
     FROM users WHERE username = :username OR email = :username LIMIT 1'
);
$stmt->execute(['username' => $username]);
$user = $stmt->fetch();

if (!$user || $user['status'] !== 'active' || !password_verify($password, $user['password_hash'])) {
    jsonResponse(false, 'Invalid username or password.', [], 401);
}

$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);

$update = $pdo->prepare('UPDATE users SET api_token = :token, api_token_expires_at = DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 7 DAY), last_login = CURRENT_TIMESTAMP WHERE id = :id');
$update->execute(['token' => $tokenHash, 'id' => $user['id']]);

jsonResponse(true, 'Login successful.', [
    'token' => $token,
    'user' => publicUser($user),
]);
