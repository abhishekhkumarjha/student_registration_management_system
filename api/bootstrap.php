<?php

declare(strict_types=1);

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017';
const DEFAULT_DB_NAME = 'student_registration_system';

function json_response(mixed $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json(): mixed
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        json_response(['error' => 'Invalid JSON request body'], 400);
    }

    return $decoded;
}

function manager(): MongoDB\Driver\Manager
{
    static $manager = null;

    if ($manager === null) {
        if (!extension_loaded('mongodb')) {
            json_response(['error' => 'MongoDB PHP extension is not installed or enabled'], 500);
        }

        $manager = new MongoDB\Driver\Manager(getenv('MONGODB_URI') ?: DEFAULT_MONGODB_URI);
    }

    return $manager;
}

function db_name(): string
{
    return getenv('MONGODB_DATABASE') ?: DEFAULT_DB_NAME;
}

function collection(string $name): string
{
    return db_name() . '.' . $name;
}

function query_all(string $collection, array $filter = [], array $options = []): array
{
    $cursor = manager()->executeQuery(collection($collection), new MongoDB\Driver\Query($filter, $options));
    return array_map(static fn ($doc) => bson_to_array($doc), $cursor->toArray());
}

function query_one(string $collection, array $filter = [], array $options = []): ?array
{
    $options['limit'] = 1;
    $rows = query_all($collection, $filter, $options);
    return $rows[0] ?? null;
}

function bulk_write(string $collection, MongoDB\Driver\BulkWrite $bulk): MongoDB\Driver\WriteResult
{
    return manager()->executeBulkWrite(collection($collection), $bulk);
}

function command(array $command): MongoDB\Driver\Cursor
{
    return manager()->executeCommand(db_name(), new MongoDB\Driver\Command($command));
}

function bson_to_array(object|array $value): array
{
    return json_decode(json_encode($value), true) ?: [];
}

function object_id(string $id): MongoDB\BSON\ObjectId
{
    try {
        return new MongoDB\BSON\ObjectId($id);
    } catch (Throwable) {
        json_response(['error' => 'Invalid MongoDB document id'], 400);
    }
}

function normalize_student(array $student): array
{
    $id = $student['_id']['$oid'] ?? (string) ($student['_id'] ?? '');

    return [
        'id' => $id,
        'student_id' => (int) ($student['student_id'] ?? 0),
        'roll_no' => (string) ($student['roll_no'] ?? ''),
        'name' => (string) ($student['name'] ?? ''),
        'department' => (string) ($student['department'] ?? ''),
        'school' => (string) ($student['school'] ?? ''),
        'email' => (string) ($student['email'] ?? ''),
        'mobile' => (string) ($student['mobile'] ?? ''),
        'address' => (string) ($student['address'] ?? ''),
        'createdAt' => (string) ($student['createdAt'] ?? ''),
    ];
}

function normalize_admin(array $admin): array
{
    return [
        'admin_id' => (int) ($admin['admin_id'] ?? 1),
        'username' => (string) ($admin['username'] ?? 'admin'),
        'email' => (string) ($admin['email'] ?? 'admin@gmail.com'),
        'mobileno' => (string) ($admin['mobileno'] ?? '9876543210'),
    ];
}

function required_string(array $payload, string $field): string
{
    $value = trim((string) ($payload[$field] ?? ''));
    if ($value === '') {
        json_response(['error' => "$field is required"], 422);
    }
    return $value;
}

function student_payload(array $payload): array
{
    return [
        'roll_no' => required_string($payload, 'roll_no'),
        'name' => required_string($payload, 'name'),
        'department' => required_string($payload, 'department'),
        'school' => required_string($payload, 'school'),
        'email' => strtolower(required_string($payload, 'email')),
        'mobile' => required_string($payload, 'mobile'),
        'address' => required_string($payload, 'address'),
    ];
}

function next_student_id(): int
{
    $latest = query_one('students', [], ['sort' => ['student_id' => -1]]);
    return $latest ? ((int) $latest['student_id'] + 1) : 1;
}

function seed_students(): void
{
    $students = [
        ['student_id' => 1, 'roll_no' => '22CSE001', 'name' => 'Aarav Sharma', 'department' => 'Computer Science & Engineering', 'school' => 'School of Engineering', 'email' => 'aarav.sharma@example.com', 'mobile' => '9876543210', 'address' => 'Flat 402, Shanti Vihar, MG Road, Bengaluru, Karnataka - 560001', 'createdAt' => '2026-01-15T09:30:00Z'],
        ['student_id' => 2, 'roll_no' => '22CSE042', 'name' => 'Aditi Rao', 'department' => 'Computer Science & Engineering', 'school' => 'School of Engineering', 'email' => 'aditi.rao@example.com', 'mobile' => '9812345678', 'address' => 'Block C-12, Green Park, New Delhi - 110016', 'createdAt' => '2026-01-18T10:15:00Z'],
        ['student_id' => 3, 'roll_no' => '23ECE012', 'name' => 'Rohan Kulkarni', 'department' => 'Electronics & Communication', 'school' => 'School of Engineering', 'email' => 'rohan.k@example.com', 'mobile' => '9898765432', 'address' => '15, Mayur Colony, Kothrud, Pune, Maharashtra - 411038', 'createdAt' => '2026-02-02T14:45:00Z'],
        ['student_id' => 4, 'roll_no' => '23MGT008', 'name' => 'Meera Nair', 'department' => 'Business Administration', 'school' => 'School of Business', 'email' => 'meera.nair@example.com', 'mobile' => '9765432109', 'address' => 'G-4, Riverview Apartments, Adyar, Chennai, Tamil Nadu - 600020', 'createdAt' => '2026-02-10T11:00:00Z'],
        ['student_id' => 5, 'roll_no' => '24PHY015', 'name' => 'Ananya Iyer', 'department' => 'Applied Physics', 'school' => 'School of Science', 'email' => 'ananya.iyer@example.com', 'mobile' => '9654321098', 'address' => 'A-304, Palm Beach Road, Vashi, Navi Mumbai, Maharashtra - 400703', 'createdAt' => '2026-03-01T08:20:00Z'],
        ['student_id' => 6, 'roll_no' => '24BIO003', 'name' => 'Kabir Banerjee', 'department' => 'Biotechnology', 'school' => 'School of Science', 'email' => 'kabir.b@example.com', 'mobile' => '9543210987', 'address' => '42/1, Salt Lake Sector V, Kolkata, West Bengal - 700091', 'createdAt' => '2026-03-12T15:30:00Z'],
    ];

    $bulk = new MongoDB\Driver\BulkWrite();
    foreach ($students as $student) {
        $bulk->insert($student);
    }
    bulk_write('students', $bulk);
}

function ensure_seed_data(): void
{
    try {
        command(['ping' => 1])->toArray();

        if (query_one('admin') === null) {
            $bulk = new MongoDB\Driver\BulkWrite();
            $bulk->insert([
                'admin_id' => 1,
                'username' => 'admin',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'email' => 'admin@gmail.com',
                'mobileno' => '9876543210',
            ]);
            bulk_write('admin', $bulk);
        }

        if (query_one('students') === null) {
            seed_students();
        }
    } catch (MongoDB\Driver\Exception\Exception $error) {
        json_response(['error' => 'Unable to connect to MongoDB: ' . $error->getMessage()], 500);
    }
}

