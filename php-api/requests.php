<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';
require_once __DIR__ . '/config.php';

$authUser = requireAuth($pdo);
if ($authUser['role'] !== 'admin') {
    jsonResponse(false, 'Only administrators can manage employee requests.', [], 403);
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($method === 'GET') {
    $status = $_GET['status'] ?? 'pending';
    if (!in_array($status, ['pending', 'approved', 'rejected'], true)) {
        jsonResponse(false, 'Invalid request status.', [], 400);
    }

    $stmt = $pdo->prepare(
        'SELECT id, user_id, username, email, phone, position, message, status, created_at
         FROM employee_requests WHERE status = :status ORDER BY created_at DESC'
    );
    $stmt->execute(['status' => $status]);
    $requests = $stmt->fetchAll();

    jsonResponse(true, 'Requests retrieved successfully.', [
        'requests' => array_map(static function (array $request): array {
            $request['id'] = (int)$request['id'];
            $request['user_id'] = (int)$request['user_id'];
            return $request;
        }, $requests),
        'count' => count($requests),
    ]);
}

if ($method === 'PATCH' && $id > 0) {
    $data = getJsonInput();
    $status = $data['status'] ?? '';
    if (!in_array($status, ['approved', 'rejected'], true)) {
        jsonResponse(false, 'A request can only be approved or rejected.', [], 400);
    }

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('SELECT user_id, status FROM employee_requests WHERE id = :id FOR UPDATE');
        $stmt->execute(['id' => $id]);
        $request = $stmt->fetch();
        if (!$request || $request['status'] !== 'pending') {
            $pdo->rollBack();
            jsonResponse(false, 'Pending request not found.', [], 404);
        }

        $updateRequest = $pdo->prepare('UPDATE employee_requests SET status = :status, reviewed_at = CURRENT_TIMESTAMP WHERE id = :id');
        $updateRequest->execute(['status' => $status, 'id' => $id]);

        $updateUser = $pdo->prepare('UPDATE users SET status = :user_status WHERE id = :user_id');
        $updateUser->execute([
            'user_status' => $status === 'approved' ? 'active' : 'blocked',
            'user_id' => $request['user_id'],
        ]);
        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        jsonResponse(false, 'Could not update the employee request.', [], 500);
    }

    jsonResponse(true, 'Request updated successfully.');
}

jsonResponse(false, 'Method not allowed.', [], 405);