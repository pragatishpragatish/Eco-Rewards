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

// Get collector's recent activities
$stmt = $conn->prepare("
    SELECT 
        ps.id,
        ps.date,
        ps.time,
        ps.area,
        ps.status,
        COALESCE(we.weight_kg, 0) as weight_kg,
        COALESCE(we.points, 0) as points,
        COALESCE(we.rating, 0) as rating
    FROM pickup_schedules ps
    LEFT JOIN waste_entries we ON ps.id = we.pickup_id
    WHERE ps.collector_id = ?
    ORDER BY ps.date DESC, ps.time DESC
    LIMIT 10
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

$activities = [];
while ($row = $result->fetch_assoc()) {
    $activities[] = [
        'id' => $row['id'],
        'date' => date('M d, Y', strtotime($row['date'])),
        'time' => date('h:i A', strtotime($row['time'])),
        'area' => $row['area'],
        'status' => $row['status'],
        'weight_kg' => number_format($row['weight_kg'], 2),
        'points' => number_format($row['points'], 2),
        'rating' => $row['rating']
    ];
}

$conn->close();

echo json_encode([
    'success' => true,
    'activities' => $activities
]);
?> 