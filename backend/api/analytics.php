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

$type = $_GET['type'] ?? '';

if ($type === 'waste') {
    // Get waste collection trends for the last 30 days
    $query = "
        SELECT 
            DATE(date_collected) as date,
            SUM(weight_kg) as total_weight
        FROM waste_entries
        WHERE status = 'collected'
        AND date_collected >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(date_collected)
        ORDER BY date
    ";
    
    $result = $conn->query($query);
    $labels = [];
    $values = [];
    
    while ($row = $result->fetch_assoc()) {
        $labels[] = $row['date'];
        $values[] = floatval($row['total_weight']);
    }
    
    echo json_encode([
        'success' => true,
        'labels' => $labels,
        'values' => $values
    ]);
}
else if ($type === 'participation') {
    // Get user participation data
    $query = "
        SELECT 
            DATE(created_at) as date,
            COUNT(DISTINCT user_id) as active_users
        FROM waste_entries
        WHERE date_collected >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY date
    ";
    
    $result = $conn->query($query);
    $labels = [];
    $values = [];
    
    while ($row = $result->fetch_assoc()) {
        $labels[] = $row['date'];
        $values[] = intval($row['active_users']);
    }
    
    echo json_encode([
        'success' => true,
        'labels' => $labels,
        'values' => $values
    ]);
}
else {
    echo json_encode(['success' => false, 'message' => 'Invalid analytics type']);
}

$conn->close();
?> 