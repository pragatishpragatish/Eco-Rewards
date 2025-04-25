document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a collector
    if (!isLoggedIn() || getUserRole() !== 'collector') {
        window.location.href = '../login.html';
        return;
    }

    // Load pickups data
    loadPickupsData();

    // Add refresh button event listener
    document.getElementById('refreshBtn').addEventListener('click', loadPickupsData);

    // Add filter form submit event listener
    document.getElementById('filterForm').addEventListener('submit', function(e) {
        e.preventDefault();
        loadPickupsData();
    });
});

async function loadPickupsData() {
    try {
        // Get filter values
        const dateFilter = document.getElementById('dateFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const areaFilter = document.getElementById('areaFilter').value;

        // Build query string
        const queryParams = new URLSearchParams();
        if (dateFilter) queryParams.append('date', dateFilter);
        if (statusFilter) queryParams.append('status', statusFilter);
        if (areaFilter) queryParams.append('area', areaFilter);

        // Load pickups data
        const response = await fetch(`../../backend/api/collector/pickups.php?${queryParams.toString()}`);
        const data = await response.json();

        if (data.success) {
            const pickupsTableBody = document.getElementById('pickupsTableBody');
            pickupsTableBody.innerHTML = '';

            data.pickups.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.time}</td>
                    <td>${item.area}</td>
                    <td>${item.waste_collected} kg</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(item.status)}">
                            ${item.status}
                        </span>
                    </td>
                    <td>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-primary" onclick="updatePickupStatus(${item.id}, 'completed')" ${item.status === 'completed' ? 'disabled' : ''}>
                                <i class="bi bi-check-circle"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="updatePickupStatus(${item.id}, 'in_progress')" ${item.status === 'in_progress' ? 'disabled' : ''}>
                                <i class="bi bi-clock"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="updatePickupStatus(${item.id}, 'cancelled')" ${item.status === 'cancelled' ? 'disabled' : ''}>
                                <i class="bi bi-x-circle"></i>
                            </button>
                        </div>
                    </td>
                `;
                pickupsTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading pickups data:', error);
        showAlert('Error loading pickups data. Please try again.', 'danger');
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
            loadPickupsData();
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