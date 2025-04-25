document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
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
        // Load user stats
        const statsResponse = await fetch('../../backend/api/user/stats.php');
        const statsData = await statsResponse.json();

        if (statsData.success) {
            document.getElementById('totalWaste').textContent = statsData.total_waste + ' kg';
            document.getElementById('totalPoints').textContent = statsData.total_points;
            document.getElementById('nextPickup').textContent = statsData.next_pickup || 'Not Scheduled';
        }

        // Load recent activity
        const activityResponse = await fetch('../../backend/api/user/waste.php');
        const activityData = await activityResponse.json();

        if (activityData.success) {
            const activityTableBody = document.getElementById('activityTableBody');
            activityTableBody.innerHTML = '';

            activityData.waste_entries.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.weight_kg} kg</td>
                    <td>${entry.points}</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(entry.status)}">
                            ${entry.status}
                        </span>
                    </td>
                `;
                activityTableBody.appendChild(row);
            });
        }

        // Load rewards progress
        const rewardsResponse = await fetch('../../backend/api/user/rewards.php');
        const rewardsData = await rewardsResponse.json();

        if (rewardsData.success) {
            const progressBar = document.getElementById('rewardsProgress');
            const rewardsText = document.getElementById('rewardsText');
            
            // Calculate progress (assuming 1000 points for next reward)
            const pointsToNextReward = 1000 - (rewardsData.total_points % 1000);
            const progress = ((rewardsData.total_points % 1000) / 1000) * 100;
            
            progressBar.style.width = `${progress}%`;
            rewardsText.textContent = `${pointsToNextReward} points until next reward`;
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
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
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