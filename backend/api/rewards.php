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
    // Get current reward settings
    $result = $conn->query("SELECT points_per_kg FROM settings ORDER BY id DESC LIMIT 1");
    $settings = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'pointsPerKg' => $settings['points_per_kg'] ?? 1.0
    ]);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Update reward settings
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['pointsPerKg'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    $pointsPerKg = floatval($data['pointsPerKg']);
    
    if ($pointsPerKg <= 0) {
        echo json_encode(['success' => false, 'message' => 'Points per kg must be greater than 0']);
        exit();
    }
    
    // Insert new settings
    $stmt = $conn->prepare("INSERT INTO settings (points_per_kg) VALUES (?)");
    $stmt->bind_param("d", $pointsPerKg);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Reward settings updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error updating reward settings']);
    }
}

$conn->close();
?> 