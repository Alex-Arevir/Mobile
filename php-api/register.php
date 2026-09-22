<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed.', [], 405);
}

$data = getJsonInput();
$username = trim((string)($data['username'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $email === '' || $password === '') {
    jsonResponse(false, 'Username, email and password are required.', [], 400);
}

if (mb_strlen($username) < 3 || mb_strlen($username) > 50) {
    jsonResponse(false, 'Username must contain between 3 and 50 characters.', [], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 120) {
    jsonResponse(false, 'Use a valid email.', [], 400);
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must contain at least 6 characters.', [], 400);
}

$check = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
$check->execute(['username' => $username, 'email' => $email]);

if ($check->fetch()) {
    jsonResponse(false, 'Username or email already exists.', [], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO users (username, email, password_hash, role, status)
     VALUES (:username, :email, :password_hash, "user", "inactive")'
);
$stmt->execute([
    'username' => $username,
    'email' => $email,
    'password_hash' => $hash,
]);

$id = (int)$pdo->lastInsertId();

$request = $pdo->prepare(
    'INSERT INTO employee_requests (user_id, username, email, status)
     VALUES (:user_id, :username, :email, "pending")'
);
$request->execute([
    'user_id' => $id,
    'username' => $username,
    'email' => $email,
]);

$created = $pdo->prepare(
    'SELECT id, username, email, role, status, preferred_name, phone, position, created_at, updated_at FROM users WHERE id = :id'
);
$created->execute(['id' => $id]);

jsonResponse(true, 'Registration submitted for HR approval.', [
    'user' => publicUser($created->fetch()),
], 201);
