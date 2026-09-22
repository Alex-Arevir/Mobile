<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$authUser = null;
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($method === 'GET') {
    $authUser = requireAuth($pdo);
    if ($id > 0 && $id !== (int)$authUser['id'] && $authUser['role'] !== 'admin') {
        jsonResponse(false, 'You can only view your own user.', [], 403);
    }
    if ($id === 0 && $authUser['role'] !== 'admin') {
        jsonResponse(false, 'Only administrators can view all users.', [], 403);
    }
    if ($id > 0) {
        $stmt = $pdo->prepare(
            'SELECT id, username, email, role, status, preferred_name, phone, position, created_at, updated_at
             FROM users WHERE id = :id LIMIT 1'
        );
        $stmt->execute(['id' => $id]);
        $user = $stmt->fetch();

        if (!$user) {
            jsonResponse(false, 'User not found.', [], 404);
        }

        jsonResponse(true, 'User found.', ['user' => publicUser($user)]);
    }

    $stmt = $pdo->query(
        'SELECT id, username, email, role, status, preferred_name, phone, position, created_at, updated_at
         FROM users ORDER BY id DESC'
    );
    $users = array_map('publicUser', $stmt->fetchAll());

    jsonResponse(true, 'Users retrieved successfully.', [
        'users' => $users,
        'count' => count($users),
        'current_user_id' => (int)$authUser['id'],
    ]);
}

if ($method === 'POST') {
    // Public registration. Administrative role changes are only available through
    // protected PUT/PATCH operations.
    $data = getJsonInput();
    $username = trim((string)($data['username'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $password = (string)($data['password'] ?? '');

    if ($username === '' || $email === '' || strlen($password) < 6) {
        jsonResponse(false, 'Username, valid email and password (min. 6 chars) are required.', [], 400);
    }

    $check = $pdo->prepare('SELECT id FROM users WHERE username = :username OR email = :email LIMIT 1');
    $check->execute(['username' => $username, 'email' => $email]);
    if ($check->fetch()) {
        jsonResponse(false, 'Username or email already exists.', [], 409);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO users (username, email, password_hash, role, status)
         VALUES (:username, :email, :password_hash, :role, :status)'
    );
    $stmt->execute([
        'username' => $username,
        'email' => $email,
        'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        'role' => 'user',
        'status' => 'active',
    ]);

    $newId = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare(
        'SELECT id, username, email, role, status, created_at, updated_at FROM users WHERE id = :id'
    );
    $stmt->execute(['id' => $newId]);

    jsonResponse(true, 'User created successfully.', ['user' => publicUser($stmt->fetch())], 201);
}

if ($method === 'PUT' || $method === 'PATCH') {
    $authUser = requireAuth($pdo);
    $targetId = $id ?: (int)$authUser['id'];

    if ($targetId !== (int)$authUser['id'] && $authUser['role'] !== 'admin') {
        jsonResponse(false, 'You can only modify your own user.', [], 403);
    }

    $data = getJsonInput();
    $allowed = ['username', 'email', 'password', 'preferred_name', 'phone', 'position', 'role', 'status'];
    $fields = [];

    if ($method === 'PUT') {
        foreach (['username', 'email'] as $required) {
            if (!isset($data[$required]) || trim((string)$data[$required]) === '') {
                jsonResponse(false, "Field {$required} is required for PUT.", [], 400);
            }
        }
    }

    foreach ($allowed as $field) {
        if (!array_key_exists($field, $data)) {
            continue;
        }

        if ($field === 'password') {
            if (strlen((string)$data[$field]) < 6) {
                jsonResponse(false, 'Password must contain at least 6 characters.', [], 400);
            }
            $fields[] = 'password_hash = :password_hash';
        } elseif ($field === 'email') {
            $email = trim((string)$data[$field]);
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                jsonResponse(false, 'Invalid email.', [], 400);
            }
            $fields[] = 'email = :email';
        } elseif ($field === 'username') {
            $username = trim((string)$data[$field]);
            if (mb_strlen($username) < 3 || mb_strlen($username) > 50) {
                jsonResponse(false, 'Username must contain between 3 and 50 characters.', [], 400);
            }
            $fields[] = 'username = :username';
        } elseif ($field === 'preferred_name' || $field === 'phone') {
            $fields[] = "{$field} = :{$field}";
        } elseif ($field === 'position') {
            if ($authUser['role'] !== 'admin') {
                continue;
            }
            $fields[] = 'position = :position';
        } elseif ($field === 'role' || $field === 'status') {
            if ($authUser['role'] !== 'admin') {
                continue;
            }
            if ($field === 'role' && !in_array($data[$field], ['admin', 'moderator', 'user'], true)) {
                jsonResponse(false, 'Invalid role.', [], 400);
            }
            if ($field === 'status' && !in_array($data[$field], ['active', 'inactive', 'blocked'], true)) {
                jsonResponse(false, 'Invalid status.', [], 400);
            }
            $fields[] = "{$field} = :{$field}";
        }
    }

    if (!$fields) {
        jsonResponse(false, 'No valid fields to update.', [], 400);
    }

    $params = ['id' => $targetId];
    foreach ($allowed as $field) {
        if (!array_key_exists($field, $data)) {
            continue;
        }
        if ($field === 'password') {
            $params['password_hash'] = password_hash((string)$data[$field], PASSWORD_DEFAULT);
        } elseif ($field === 'username' || $field === 'email' || $field === 'preferred_name' || $field === 'phone' || $field === 'position' || $field === 'role' || $field === 'status') {
            if ($field === 'position' || $field === 'role' || $field === 'status') {
                if ($authUser['role'] !== 'admin') continue;
            }
            $params[$field] = trim((string)$data[$field]);
        }
    }

    // Avoid duplicate username/email values.
    if (isset($params['username']) || isset($params['email'])) {
        $check = $pdo->prepare(
            'SELECT id FROM users
             WHERE (username = :username_check OR email = :email_check) AND id <> :id
             LIMIT 1'
        );
        $check->execute([
            'username_check' => $params['username'] ?? '',
            'email_check' => $params['email'] ?? '',
            'id' => $targetId,
        ]);
        if ($check->fetch()) {
            jsonResponse(false, 'Username or email already exists.', [], 409);
        }
    }

    $sql = 'UPDATE users SET ' . implode(', ', $fields) . ', updated_at = CURRENT_TIMESTAMP WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $stmt = $pdo->prepare(
        'SELECT id, username, email, role, status, preferred_name, phone, position, created_at, updated_at FROM users WHERE id = :id'
    );
    $stmt->execute(['id' => $targetId]);

    jsonResponse(true, 'User updated successfully.', ['user' => publicUser($stmt->fetch())]);
}

if ($method === 'DELETE') {
    $authUser = requireAuth($pdo);
    $targetId = $id ?: (int)$authUser['id'];

    if ($targetId !== (int)$authUser['id'] && $authUser['role'] !== 'admin') {
        jsonResponse(false, 'You can only delete your own user.', [], 403);
    }

    if ($targetId === (int)$authUser['id'] && $authUser['role'] === 'admin') {
        jsonResponse(false, 'An administrator cannot delete their own account from this endpoint.', [], 400);
    }

    $stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
    $stmt->execute(['id' => $targetId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, 'User not found.', [], 404);
    }

    jsonResponse(true, 'User deleted successfully.');
}

jsonResponse(false, 'Method not allowed.', [], 405);
