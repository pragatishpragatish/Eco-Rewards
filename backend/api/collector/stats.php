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

// Get today's pickups count
$stmt = $conn->prepare("
    SELECT COUNT(*) as count
    FROM pickup_schedules
    WHERE date = CURDATE()
    AND collector_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$todayPickups = $result->fetch_assoc()['count'];

// Get completed pickups count for today
$stmt = $conn->prepare("
    SELECT COUNT(*) as count
    FROM pickup_schedules
    WHERE date = CURDATE()
    AND collector_id = ?
    AND status = 'completed'
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$completedPickups = $result->fetch_assoc()['count'];

// Get total waste collected today
$stmt = $conn->prepare("
    SELECT COALESCE(SUM(weight_kg), 0) as total
    FROM waste_entries
    WHERE DATE(created_at) = CURDATE()
    AND collector_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$totalWaste = $result->fetch_assoc()['total'];

$conn->close();

echo json_encode([
    'success' => true,
    'today_pickups' => $todayPickups,
    'completed_pickups' => $completedPickups,
    'total_waste' => number_format($totalWaste, 2)
]);
?> 