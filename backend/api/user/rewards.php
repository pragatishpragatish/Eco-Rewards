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

// Get user's rewards
$stmt = $conn->prepare("
    SELECT 
        total_points,
        last_redeemed
    FROM rewards
    WHERE user_id = ?
");
$stmt->bind_param("i", $_SESSION['user_id']);
$stmt->execute();
$result = $stmt->get_result();
$rewards = $result->fetch_assoc();

$conn->close();

echo json_encode([
    'success' => true,
    'totalPoints' => number_format($rewards['total_points'], 2),
    'lastRedeemed' => $rewards['last_redeemed'] ? date('Y-m-d H:i:s', strtotime($rewards['last_redeemed'])) : null
]);
?> 