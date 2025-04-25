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

// Get today's schedule
$stmt = $conn->prepare("
    SELECT 
        id,
        TIME_FORMAT(time, '%h:%i %p') as time,
        area,
        status
    FROM pickup_schedules
    WHERE date = CURDATE()
    AND collector_id = ?
    ORDER BY time
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$schedule = [];
while ($row = $result->fetch_assoc()) {
    $schedule[] = $row;
}

$conn->close();

echo json_encode([
    'success' => true,
    'schedule' => $schedule
]);
?> 