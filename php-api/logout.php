<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', [], 405);
}

$token = bearerToken();
if ($token) {
    $stmt = $pdo->prepare('UPDATE users SET api_token = NULL, api_token_expires_at = NULL WHERE api_token = :token');
    $stmt->execute(['token' => hash('sha256', $token)]);
}

jsonResponse(true, 'Logout successful.');
