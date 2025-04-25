<?php
require_once '../../config.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isLoggedIn()) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

$conn = getDBConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get user's waste entries
    $stmt = $conn->prepare("
        SELECT 
            date_collected,
            weight_kg,
            status,
            (weight_kg * (SELECT points_per_kg FROM settings ORDER BY id DESC LIMIT 1)) as points
        FROM waste_entries
        WHERE user_id = ?
        ORDER BY date_collected DESC
    ");
    $stmt->bind_param("i", $_SESSION['user_id']);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $entries = [];
    while ($row = $result->fetch_assoc()) {
        $entries[] = $row;
    }
    
    echo json_encode(['success' => true, 'entries' => $entries]);
}
else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Submit new waste entry
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Debug log
    error_log("Received waste submission data: " . print_r($data, true));
    
    if (!isset($data['weight_kg']) || !isset($data['date_collected'])) {
        error_log("Missing required fields in waste submission");
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit();
    }
    
    $weight_kg = floatval($data['weight_kg']);
    $date_collected = $data['date_collected'];
    
    // Debug log
    error_log("Processed weight: " . $weight_kg . ", date: " . $date_collected);
    
    if ($weight_kg <= 0) {
        error_log("Invalid weight submitted: " . $weight_kg);
        echo json_encode(['success' => false, 'message' => 'Weight must be greater than 0']);
        exit();
    }
    
    // Get points per kg
    $result = $conn->query("SELECT points_per_kg FROM settings ORDER BY id DESC LIMIT 1");
    $pointsPerKg = $result->fetch_assoc()['points_per_kg'];
    
    // Calculate points
    $points = $weight_kg * $pointsPerKg;
    
    // Debug log
    error_log("Calculated points: " . $points);
    
    // Insert waste entry
    $stmt = $conn->prepare("
        INSERT INTO waste_entries (user_id, weight_kg, date_collected, status, notes)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("idsss", $_SESSION['user_id'], $weight_kg, $date_collected, 'pending', $data['notes']);
    
    if ($stmt->execute()) {
        error_log("Successfully inserted waste entry");
        // Update user's total points
        $stmt = $conn->prepare("
            UPDATE rewards
            SET total_points = total_points + ?
            WHERE user_id = ?
        ");
        $stmt->bind_param("di", $points, $_SESSION['user_id']);
        $stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Waste entry submitted successfully',
            'points' => number_format($points, 2)
        ]);
    } else {
        error_log("Error inserting waste entry: " . $conn->error);
        echo json_encode(['success' => false, 'message' => 'Error submitting waste entry: ' . $conn->error]);
    }
}

$conn->close();
?> 