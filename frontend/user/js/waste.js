document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '../login.html';
        return;
    }

    // Set today's date as default for the date input
    document.getElementById('collectionDate').valueAsDate = new Date();

    // Load waste entries
    loadWasteEntries();

    // Add form submit event listener
    document.getElementById('submitWasteForm').addEventListener('submit', handleWasteSubmission);
});

async function loadWasteEntries() {
    try {
        const response = await fetch('../../backend/api/user/waste.php');
        const data = await response.json();

        if (data.success) {
            const tableBody = document.getElementById('wasteEntriesTableBody');
            tableBody.innerHTML = '';

            data.waste_entries.forEach(entry => {
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
                    <td>${entry.notes || '-'}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading waste entries:', error);
        showAlert('Error loading waste entries. Please try again.', 'danger');
    }
}

async function handleWasteSubmission(event) {
    event.preventDefault();

    const weight = document.getElementById('wasteWeight').value;
    const date = document.getElementById('collectionDate').value;
    const notes = document.getElementById('notes').value;

    console.log('Submitting waste:', { weight, date, notes });

    try {
        const response = await fetch('../../backend/api/user/waste.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                weight_kg: parseFloat(weight),
                date_collected: date,
                notes: notes
            })
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (data.success) {
            showAlert('Waste collection submitted successfully! Points earned: ' + data.points, 'success');
            document.getElementById('submitWasteForm').reset();
            loadWasteEntries();
        } else {
            showAlert(data.message || 'Error submitting waste collection', 'danger');
        }
    } catch (error) {
        console.error('Error submitting waste:', error);
        showAlert('Error submitting waste collection. Please try again.', 'danger');
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