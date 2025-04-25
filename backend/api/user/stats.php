<?php
require_once '../../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$conn = getDBConnection();

// Get user's total waste collected
$stmt = $conn->prepare("
    SELECT SUM(weight_kg) as total_waste
    FROM waste_entries
    WHERE user_id = ? AND status = 'collected'
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$totalWaste = $result->fetch_assoc()['total_waste'] ?? 0;

// Get user's total points
$stmt = $conn->prepare("
    SELECT total_points
    FROM rewards
    WHERE user_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$totalPoints = $result->fetch_assoc()['total_points'] ?? 0;

// Get next pickup
$stmt = $conn->prepare("
    SELECT date, time, area
    FROM pickup_schedules
    WHERE area = (
        SELECT area
        FROM pickup_schedules
        WHERE date >= CURDATE()
        ORDER BY date, time
        LIMIT 1
    )
    AND date >= CURDATE()
    ORDER BY date, time
    LIMIT 1
");
$stmt->execute();
$result = $stmt->get_result();
$nextPickup = $result->fetch_assoc();

$conn->close();

echo json_encode([
    'success' => true,
    'totalWaste' => number_format($totalWaste, 2),
    'totalPoints' => number_format($totalPoints, 2),
    'nextPickup' => $nextPickup ? $nextPickup['date'] . ' ' . $nextPickup['time'] . ' (' . $nextPickup['area'] . ')' : null
]);
?> 