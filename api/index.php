<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

ensure_seed_data();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/') ?: '/';
$segments = array_values(array_filter(explode('/', $path)));

if ($method === 'GET' && $path === '/health') {
    json_response(['ok' => true, 'database' => db_name()]);
}

if ($method === 'POST' && $path === '/login') {
    $payload = read_json();
    $username = trim((string) ($payload['username'] ?? ''));
    $password = (string) ($payload['password'] ?? '');
    $admin = query_one('admin', ['username' => $username]);

    if ($admin && password_verify($password, (string) ($admin['password'] ?? ''))) {
        json_response(['admin' => normalize_admin($admin)]);
    }

    json_response(['error' => 'Invalid username or password'], 401);
}

if ($method === 'POST' && $path === '/logout') {
    json_response(['ok' => true]);
}

if ($method === 'GET' && $path === '/admin') {
    $admin = query_one('admin', ['username' => 'admin']);
    json_response(['admin' => normalize_admin($admin ?? [])]);
}

if ($method === 'PUT' && $path === '/admin/password') {
    $payload = read_json();
    $currentPassword = (string) ($payload['currentPassword'] ?? '');
    $newPassword = (string) ($payload['newPassword'] ?? '');

    if (strlen($newPassword) < 5) {
        json_response(['error' => 'New password must be at least 5 characters long.'], 422);
    }

    $admin = query_one('admin', ['username' => 'admin']);
    if (!$admin || !password_verify($currentPassword, (string) ($admin['password'] ?? ''))) {
        json_response(['error' => 'Current password is incorrect.'], 401);
    }

    $bulk = new MongoDB\Driver\BulkWrite();
    $bulk->update(
        ['username' => 'admin'],
        ['$set' => ['password' => password_hash($newPassword, PASSWORD_DEFAULT)]],
        ['multi' => false, 'upsert' => false]
    );
    bulk_write('admin', $bulk);
    json_response(['ok' => true]);
}

if ($method === 'GET' && $path === '/students') {
    $students = query_all('students', [], ['sort' => ['student_id' => 1]]);
    json_response(['students' => array_map('normalize_student', $students)]);
}

if ($method === 'POST' && $path === '/students') {
    $student = student_payload(read_json());
    $duplicate = query_one('students', ['roll_no' => new MongoDB\BSON\Regex('^' . preg_quote($student['roll_no'], '/') . '$', 'i')]);
    if ($duplicate) {
        json_response(['error' => 'Roll Number already registered to another student'], 409);
    }

    $student['student_id'] = next_student_id();
    $student['createdAt'] = gmdate('c');

    $bulk = new MongoDB\Driver\BulkWrite();
    $id = $bulk->insert($student);
    bulk_write('students', $bulk);

    $student['_id'] = $id;
    json_response(['student' => normalize_student(bson_to_array($student))], 201);
}

if ($method === 'PUT' && count($segments) === 2 && $segments[0] === 'students') {
    $id = $segments[1];
    $student = student_payload(read_json());
    $duplicate = query_one('students', [
        'roll_no' => new MongoDB\BSON\Regex('^' . preg_quote($student['roll_no'], '/') . '$', 'i'),
        '_id' => ['$ne' => object_id($id)],
    ]);
    if ($duplicate) {
        json_response(['error' => 'Roll Number already registered to another student'], 409);
    }

    $bulk = new MongoDB\Driver\BulkWrite();
    $bulk->update(['_id' => object_id($id)], ['$set' => $student], ['multi' => false, 'upsert' => false]);
    $result = bulk_write('students', $bulk);

    if ($result->getMatchedCount() === 0) {
        json_response(['error' => 'Student not found'], 404);
    }

    $updated = query_one('students', ['_id' => object_id($id)]);
    json_response(['student' => normalize_student($updated ?? [])]);
}

if ($method === 'DELETE' && count($segments) === 2 && $segments[0] === 'students') {
    $bulk = new MongoDB\Driver\BulkWrite();
    $bulk->delete(['_id' => object_id($segments[1])], ['limit' => 1]);
    $result = bulk_write('students', $bulk);

    if ($result->getDeletedCount() === 0) {
        json_response(['error' => 'Student not found'], 404);
    }

    json_response(['ok' => true]);
}

if ($method === 'POST' && $path === '/students/reset') {
    $bulk = new MongoDB\Driver\BulkWrite();
    $bulk->delete([], ['limit' => 0]);
    bulk_write('students', $bulk);
    seed_students();

    $students = query_all('students', [], ['sort' => ['student_id' => 1]]);
    json_response(['students' => array_map('normalize_student', $students)]);
}

if ($method === 'POST' && $path === '/students/import') {
    $payload = read_json();
    if (!is_array($payload)) {
        json_response(['error' => 'Expected an array of student records'], 422);
    }

    $bulk = new MongoDB\Driver\BulkWrite();
    $bulk->delete([], ['limit' => 0]);
    $nextId = 1;
    foreach ($payload as $record) {
        if (!is_array($record)) {
            json_response(['error' => 'Invalid student record in import'], 422);
        }

        $student = student_payload($record);
        $student['student_id'] = (int) ($record['student_id'] ?? $nextId);
        $student['createdAt'] = (string) ($record['createdAt'] ?? gmdate('c'));
        $nextId = max($nextId, $student['student_id'] + 1);
        $bulk->insert($student);
    }
    bulk_write('students', $bulk);

    $students = query_all('students', [], ['sort' => ['student_id' => 1]]);
    json_response(['students' => array_map('normalize_student', $students)]);
}

json_response(['error' => 'Not found'], 404);

