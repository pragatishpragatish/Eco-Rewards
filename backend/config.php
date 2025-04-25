<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'ecorewards');

// Create database connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    return $conn;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Helper function to check if user is logged in
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Helper function to get current user's role
function getUserRole() {
    return $_SESSION['user_role'] ?? null;
}

// Helper function to redirect based on role
function redirectBasedOnRole() {
    if (!isLoggedIn()) {
        header('Location: ../frontend/login.html');
        exit();
    }

    $role = getUserRole();
    switch ($role) {
        case 'admin':
            header('Location: ../frontend/admin/dashboard.html');
            break;
        case 'user':
            header('Location: ../frontend/user/dashboard.html');
            break;
        case 'collector':
            header('Location: ../frontend/collector/dashboard.html');
            break;
        default:
            header('Location: ../frontend/login.html');
    }
    exit();
}
?> 