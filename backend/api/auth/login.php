<?php
require_once '../../config.php';

header('Content-Type: application/json');

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing email or password']);
    exit();
}

$email = trim($data['email']);
$password = $data['password'];

$conn = getDBConnection();

// Get user by email
$stmt = $conn->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit();
}

$user = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    exit();
}

// Start session
session_start();

// Store user data in session
$_SESSION['user_id'] = $user['id'];
$_SESSION['user_name'] = $user['name'];
$_SESSION['user_email'] = $user['email'];
$_SESSION['user_role'] = $user['role'];

// Generate token
$token = bin2hex(random_bytes(32));

// Store token in session
$_SESSION['token'] = $token;

// Determine dashboard URL based on role
$dashboardUrl = '';
switch ($user['role']) {
    case 'admin':
        $dashboardUrl = '../frontend/admin/dashboard.html';
        break;
    case 'user':
        $dashboardUrl = '../frontend/user/dashboard.html';
        break;
    case 'collector':
        $dashboardUrl = '../frontend/collector/dashboard.html';
        break;
}

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'token' => $token,
    'dashboardUrl' => $dashboardUrl,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role']
    ]
]);

$conn->close();
?> 