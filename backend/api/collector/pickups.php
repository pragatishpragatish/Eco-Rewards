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

// Get recent pickups
$stmt = $conn->prepare("
    SELECT 
        DATE_FORMAT(ps.date, '%Y-%m-%d') as date,
        ps.area,
        COALESCE(SUM(we.weight_kg), 0) as waste_collected,
        ps.status
    FROM pickup_schedules ps
    LEFT JOIN waste_entries we ON ps.id = we.pickup_id
    WHERE ps.collector_id = ?
    GROUP BY ps.id
    ORDER BY ps.date DESC, ps.time DESC
    LIMIT 10
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$pickups = [];
while ($row = $result->fetch_assoc()) {
    $pickups[] = $row;
}

$conn->close();

echo json_encode([
    'success' => true,
    'pickups' => $pickups
]);
?> 