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

// Get weekly schedule
$stmt = $conn->prepare("
    SELECT 
        id,
        DATE_FORMAT(date, '%Y-%m-%d') as date,
        TIME_FORMAT(time, '%h:%i %p') as time,
        area,
        status
    FROM pickup_schedules
    WHERE collector_id = ?
    AND date >= CURDATE()
    AND date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    ORDER BY date, time
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