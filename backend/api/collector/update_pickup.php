<?php
require_once '../../config.php';

header('Content-Type: application/json');

// Check if user is logged in and is a collector
if (!isLoggedIn() || getUserRole() !== 'collector') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['pickup_id']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit();
}

$pickupId = $data['pickup_id'];
$status = $data['status'];

// Validate status
$validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
if (!in_array($status, $validStatuses)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid status']);
    exit();
}

$conn = getDBConnection();

// Check if pickup belongs to the collector
$stmt = $conn->prepare("
    SELECT id
    FROM pickup_schedules
    WHERE id = ?
    AND collector_id = ?
");
$stmt->bind_param("ii", $pickupId, $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    $conn->close();
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Pickup not found or unauthorized']);
    exit();
}

// Update pickup status
$stmt = $conn->prepare("
    UPDATE pickup_schedules
    SET status = ?
    WHERE id = ?
    AND collector_id = ?
");
$stmt->bind_param("sii", $status, $pickupId, $_SESSION['user_id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Pickup status updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error updating pickup status']);
}

$conn->close();
?> 