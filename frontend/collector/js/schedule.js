document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a collector
    if (!isLoggedIn() || getUserRole() !== 'collector') {
        window.location.href = '../login.html';
        return;
    }

    // Initialize calendar
    initializeCalendar();

    // Load weekly schedule
    loadWeeklySchedule();

    // Add refresh button event listener
    document.getElementById('refreshBtn').addEventListener('click', function() {
        calendar.refetchEvents();
        loadWeeklySchedule();
    });
});

let calendar;

function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: '../../backend/api/collector/calendar_events.php',
        eventClick: function(info) {
            showScheduleDetails(info.event);
        },
        eventDidMount: function(info) {
            info.el.style.backgroundColor = getStatusColor(info.event.extendedProps.status);
        }
    });

    calendar.render();
}

async function loadWeeklySchedule() {
    try {
        const response = await fetch('../../backend/api/collector/weekly_schedule.php');
        const data = await response.json();

        if (data.success) {
            const weeklyScheduleTableBody = document.getElementById('weeklyScheduleTableBody');
            weeklyScheduleTableBody.innerHTML = '';

            data.schedule.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.time}</td>
                    <td>${item.area}</td>
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
                weeklyScheduleTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading weekly schedule:', error);
        showAlert('Error loading weekly schedule. Please try again.', 'danger');
    }
}

function showScheduleDetails(event) {
    const scheduleDetails = document.getElementById('scheduleDetails');
    scheduleDetails.innerHTML = `
        <h6>${event.title}</h6>
        <p><strong>Date:</strong> ${event.start.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${event.extendedProps.time}</p>
        <p><strong>Area:</strong> ${event.extendedProps.area}</p>
        <p><strong>Status:</strong> 
            <span class="badge bg-${getStatusBadgeColor(event.extendedProps.status)}">
                ${event.extendedProps.status}
            </span>
        </p>
        <div class="mt-3">
            <button class="btn btn-sm btn-primary" onclick="updatePickupStatus(${event.extendedProps.id}, 'completed')" ${event.extendedProps.status === 'completed' ? 'disabled' : ''}>
                <i class="bi bi-check-circle me-1"></i> Complete
            </button>
            <button class="btn btn-sm btn-warning" onclick="updatePickupStatus(${event.extendedProps.id}, 'in_progress')" ${event.extendedProps.status === 'in_progress' ? 'disabled' : ''}>
                <i class="bi bi-clock me-1"></i> In Progress
            </button>
            <button class="btn btn-sm btn-danger" onclick="updatePickupStatus(${event.extendedProps.id}, 'cancelled')" ${event.extendedProps.status === 'cancelled' ? 'disabled' : ''}>
                <i class="bi bi-x-circle me-1"></i> Cancel
            </button>
        </div>
    `;
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return '#28a745';
        case 'in_progress':
            return '#ffc107';
        case 'pending':
            return '#17a2b8';
        case 'cancelled':
            return '#dc3545';
        default:
            return '#6c757d';
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
            calendar.refetchEvents();
            loadWeeklySchedule();
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