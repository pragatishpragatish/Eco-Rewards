document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a collector
    if (!isLoggedIn() || getUserRole() !== 'collector') {
        window.location.href = '../login.html';
        return;
    }

    // Load dashboard data
    loadDashboardData();

    // Add refresh button event listener
    document.getElementById('refreshBtn').addEventListener('click', loadDashboardData);
});

async function loadDashboardData() {
    try {
        // Load today's stats
        const statsResponse = await fetch('../../backend/api/collector/stats.php');
        const statsData = await statsResponse.json();

        if (statsData.success) {
            document.getElementById('todayPickups').textContent = statsData.today_pickups;
            document.getElementById('completedPickups').textContent = statsData.completed_pickups;
            document.getElementById('totalWaste').textContent = statsData.total_waste + ' kg';
        }

        // Load today's schedule
        const scheduleResponse = await fetch('../../backend/api/collector/schedule.php');
        const scheduleData = await scheduleResponse.json();

        if (scheduleData.success) {
            const scheduleTableBody = document.getElementById('scheduleTableBody');
            scheduleTableBody.innerHTML = '';

            scheduleData.schedule.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.time}</td>
                    <td>${item.area}</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(item.status)}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="updatePickupStatus(${item.id}, 'completed')">
                            <i class="bi bi-check-circle"></i> Complete
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="updatePickupStatus(${item.id}, 'in_progress')">
                            <i class="bi bi-clock"></i> In Progress
                        </button>
                    </td>
                `;
                scheduleTableBody.appendChild(row);
            });
        }

        // Load recent pickups
        const pickupsResponse = await fetch('../../backend/api/collector/pickups.php');
        const pickupsData = await pickupsResponse.json();

        if (pickupsData.success) {
            const pickupsTableBody = document.getElementById('pickupsTableBody');
            pickupsTableBody.innerHTML = '';

            pickupsData.pickups.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.area}</td>
                    <td>${item.waste_collected} kg</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(item.status)}">
                            ${item.status}
                        </span>
                    </td>
                `;
                pickupsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showAlert('Error loading dashboard data. Please try again.', 'danger');
    }
}

function getStatusBadgeColor(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'success';
        case 'in_progress':
            return 'warning';
        case 'pending':
            return 'info';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}

async function updatePickupStatus(pickupId, status) {
    try {
        const response = await fetch('../../backend/api/collector/update_pickup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pickup_id: pickupId,
                status: status
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Pickup status updated successfully!', 'success');
            loadDashboardData();
        } else {
            showAlert(data.message || 'Error updating pickup status', 'danger');
        }
    } catch (error) {
        console.error('Error updating pickup status:', error);
        showAlert('Error updating pickup status. Please try again.', 'danger');
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const mainContent = document.querySelector('main');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
} 