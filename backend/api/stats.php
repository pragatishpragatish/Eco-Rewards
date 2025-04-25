<?php
require_once '../config.php';

header('Content-Type: application/json');

// Check if user is logged in and is admin
if (!isLoggedIn() || getUserRole() !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$conn = getDBConnection();

// Get total users
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
$totalUsers = $result->fetch_assoc()['count'];

// Get total collectors
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'collector'");
$totalCollectors = $result->fetch_assoc()['count'];

// Get total waste collected
$result = $conn->query("SELECT COALESCE(SUM(weight_kg), 0) as total FROM waste_entries");
$totalWaste = $result->fetch_assoc()['total'];

// Get total points awarded
$result = $conn->query("SELECT SUM(total_points) as total FROM rewards");
$totalPoints = $result->fetch_assoc()['total'] ?? 0;

$conn->close();

echo json_encode([
    'success' => true,
    'totalUsers' => $totalUsers,
    'totalCollectors' => $totalCollectors,
    'totalWaste' => number_format($totalWaste, 2),
    'totalPoints' => number_format($totalPoints, 2)
]);
?> 