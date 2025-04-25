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

// Get pickup schedules for the calendar
$stmt = $conn->prepare("
    SELECT 
        id,
        date,
        time,
        area,
        status
    FROM pickup_schedules
    WHERE collector_id = ?
    AND date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    AND date <= DATE_ADD(CURDATE(), INTERVAL 2 MONTH)
    ORDER BY date, time
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$events = [];
while ($row = $result->fetch_assoc()) {
    $events[] = [
        'id' => $row['id'],
        'title' => $row['area'],
        'start' => $row['date'],
        'time' => $row['time'],
        'area' => $row['area'],
        'status' => $row['status']
    ];
}

$conn->close();

echo json_encode($events);
?> 