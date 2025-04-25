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
    // Get all pickup schedules with collector names
    $query = "
        SELECT 
            ps.id,
            ps.collector_id,
            u.name as collector_name,
            ps.area,
            ps.date,
            ps.time,
            ps.status
        FROM pickup_schedules ps
        JOIN users u ON ps.collector_id = u.id
        ORDER BY ps.date, ps.time
    ";
    
    $result = $conn->query($query);
    $schedules = [];
    
    while ($row = $result->fetch_assoc()) {
        $schedules[] = $row;
    }
    
    echo json_encode(['success' => true, 'schedules' => $schedules]);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new schedule
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['collector_id']) || !isset($data['area']) || !isset($data['date']) || !isset($data['time'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    $collector_id = $data['collector_id'];
    $area = $data['area'];
    $date = $data['date'];
    $time = $data['time'];
    
    // Insert new schedule
    $stmt = $conn->prepare("INSERT INTO pickup_schedules (collector_id, area, date, time) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("isss", $collector_id, $area, $date, $time);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Schedule added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error adding schedule']);
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update schedule
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['id']) || !isset($data['collector_id']) || !isset($data['area']) || !isset($data['date']) || !isset($data['time'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    $id = $data['id'];
    $collector_id = $data['collector_id'];
    $area = $data['area'];
    $date = $data['date'];
    $time = $data['time'];
    
    // Update schedule
    $stmt = $conn->prepare("UPDATE pickup_schedules SET collector_id = ?, area = ?, date = ?, time = ? WHERE id = ?");
    $stmt->bind_param("isssi", $collector_id, $area, $date, $time, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Schedule updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating schedule']);
    }
}
else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete schedule
    $id = $_GET['id'] ?? 0;
    
    if ($id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid schedule ID']);
        exit();
    }
    
    $stmt = $conn->prepare("DELETE FROM pickup_schedules WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Schedule deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error deleting schedule']);
    }
}

$conn->close();
?> 