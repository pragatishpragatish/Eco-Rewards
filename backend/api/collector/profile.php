<?php
require_once '../../config.php';

header('Content-Type: application/json');

// Check if user is logged in and is a collector
if (!isLoggedIn() || getUserRole() !== 'collector') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$conn = getDBConnection();

// Get collector profile information
$stmt = $conn->prepare("
    SELECT 
        first_name,
        last_name,
        email,
        phone,
        address
    FROM collectors
    WHERE id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$profile = $result->fetch_assoc();

// Get collector statistics
$stmt = $conn->prepare("
    SELECT 
        COUNT(*) as total_pickups,
        COALESCE(SUM(weight_kg), 0) as total_waste,
        COALESCE(AVG(rating), 0) as average_rating
    FROM pickup_schedules ps
    LEFT JOIN waste_entries we ON ps.id = we.pickup_id
    WHERE ps.collector_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$stats = $result->fetch_assoc();

$conn->close();

echo json_encode([
    'success' => true,
    'first_name' => $profile['first_name'],
    'last_name' => $profile['last_name'],
    'email' => $profile['email'],
    'phone' => $profile['phone'],
    'address' => $profile['address'],
    'total_pickups' => $stats['total_pickups'],
    'total_waste' => number_format($stats['total_waste'], 2),
    'average_rating' => number_format($stats['average_rating'], 1)
]);
?> 