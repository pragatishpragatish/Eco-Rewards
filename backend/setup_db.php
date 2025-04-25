<?php
require_once 'config.php';

header('Content-Type: text/plain');

echo "Setting up database...\n";
$conn = getDBConnection();

// Create users table
$conn->query("
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
    )
");
echo "Created users table\n";

// Create pickup_schedules table
$conn->query("
    CREATE TABLE IF NOT EXISTS pickup_schedules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        collector_id INT NOT NULL,
        area VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        FOREIGN KEY (collector_id) REFERENCES users(id)
    )
");
echo "Created pickup_schedules table\n";

// Create waste_entries table
$conn->query("
    CREATE TABLE IF NOT EXISTS waste_entries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        collector_id INT,
        weight_kg DECIMAL(10,2) NOT NULL,
        date_collected DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (collector_id) REFERENCES users(id)
    )
");
echo "Created waste_entries table\n";

// Create rewards table
$conn->query("
    CREATE TABLE IF NOT EXISTS rewards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_points INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
");
echo "Created rewards table\n";

// Create settings table
$conn->query("
    CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        points_per_kg DECIMAL(10,2) DEFAULT 1.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
");
echo "Created settings table\n";

// Insert default admin user if not exists
$adminEmail = 'admin@ecorewards.com';
$adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
$adminName = 'Admin User';

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $adminEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')");
    $stmt->bind_param("sss", $adminName, $adminEmail, $adminPassword);
    $stmt->execute();
    echo "Created admin user\n";
}

// Insert default collector if not exists
$collectorEmail = 'collector@ecorewards.com';
$collectorPassword = password_hash('collector123', PASSWORD_DEFAULT);
$collectorName = 'Test Collector';

$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $collectorEmail);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'collector')");
    $stmt->bind_param("sss", $collectorName, $collectorEmail, $collectorPassword);
    $stmt->execute();
    echo "Created collector user\n";
}

// Insert default settings if not exists
$stmt = $conn->prepare("SELECT id FROM settings");
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    $stmt = $conn->prepare("INSERT INTO settings (points_per_kg) VALUES (1.00)");
    $stmt->execute();
    echo "Created default settings\n";
}

$conn->close();
echo "\nDatabase setup complete!\n";
?> 