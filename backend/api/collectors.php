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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all collectors with their assigned areas
    $query = "
        SELECT 
            u.id, 
            u.name, 
            u.email,
            GROUP_CONCAT(DISTINCT ps.area) as areas
        FROM users u
        LEFT JOIN pickup_schedules ps ON u.id = ps.collector_id
        WHERE u.role = 'collector'
        GROUP BY u.id
        ORDER BY u.name
    ";
    
    $result = $conn->query($query);
    $collectors = [];
    
    while ($row = $result->fetch_assoc()) {
        $row['areas'] = $row['areas'] ? explode(',', $row['areas']) : [];
        $collectors[] = $row;
    }
    
    echo json_encode(['success' => true, 'collectors' => $collectors]);
}

$conn->close();
?> 