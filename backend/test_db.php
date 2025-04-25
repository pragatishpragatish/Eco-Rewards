<?php
require_once 'config.php';

header('Content-Type: text/plain');

echo "Testing database connection...\n";
$conn = getDBConnection();
echo "Database connection successful!\n\n";

echo "Checking required tables:\n";

// Check users table
$result = $conn->query("SHOW TABLES LIKE 'users'");
if ($result->num_rows > 0) {
    echo "✓ users table exists\n";
} else {
    echo "✗ users table is missing\n";
}

// Check pickup_schedules table
$result = $conn->query("SHOW TABLES LIKE 'pickup_schedules'");
if ($result->num_rows > 0) {
    echo "✓ pickup_schedules table exists\n";
} else {
    echo "✗ pickup_schedules table is missing\n";
}

// Check waste_entries table
$result = $conn->query("SHOW TABLES LIKE 'waste_entries'");
if ($result->num_rows > 0) {
    echo "✓ waste_entries table exists\n";
} else {
    echo "✗ waste_entries table is missing\n";
}

// Check rewards table
$result = $conn->query("SHOW TABLES LIKE 'rewards'");
if ($result->num_rows > 0) {
    echo "✓ rewards table exists\n";
} else {
    echo "✗ rewards table is missing\n";
}

// Check settings table
$result = $conn->query("SHOW TABLES LIKE 'settings'");
if ($result->num_rows > 0) {
    echo "✓ settings table exists\n";
} else {
    echo "✗ settings table is missing\n";
}

echo "\nChecking sample data:\n";

// Check for admin users
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
$count = $result->fetch_assoc()['count'];
echo "Admin users: $count\n";

// Check for collectors
$result = $conn->query("SELECT COUNT(*) as count FROM users WHERE role = 'collector'");
$count = $result->fetch_assoc()['count'];
echo "Collectors: $count\n";

// Check for pickup schedules
$result = $conn->query("SELECT COUNT(*) as count FROM pickup_schedules");
$count = $result->fetch_assoc()['count'];
echo "Pickup schedules: $count\n";

// Check for waste entries
$result = $conn->query("SELECT COUNT(*) as count FROM waste_entries");
$count = $result->fetch_assoc()['count'];
echo "Waste entries: $count\n";

$conn->close();
?>