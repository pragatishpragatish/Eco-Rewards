document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a collector
    if (!isLoggedIn() || getUserRole() !== 'collector') {
        window.location.href = '../login.html';
        return;
    }

    // Load profile data
    loadProfileData();

    // Add form submit event listeners
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
    document.getElementById('savePasswordBtn').addEventListener('click', changePassword);
});

async function loadProfileData() {
    try {
        // Load profile information
        const profileResponse = await fetch('../../backend/api/collector/profile.php');
        const profileData = await profileResponse.json();

        if (profileData.success) {
            // Update profile information
            document.getElementById('collectorName').textContent = `${profileData.first_name} ${profileData.last_name}`;
            document.getElementById('collectorEmail').textContent = profileData.email;
            document.getElementById('firstName').value = profileData.first_name;
            document.getElementById('lastName').value = profileData.last_name;
            document.getElementById('email').value = profileData.email;
            document.getElementById('phone').value = profileData.phone || '';
            document.getElementById('address').value = profileData.address || '';

            // Update statistics
            document.getElementById('totalPickups').textContent = profileData.total_pickups;
            document.getElementById('totalWaste').textContent = profileData.total_waste + ' kg';
            document.getElementById('averageRating').textContent = profileData.average_rating.toFixed(1);
        }

        // Load recent activity
        const activityResponse = await fetch('../../backend/api/collector/activity.php');
        const activityData = await activityResponse.json();

        if (activityData.success) {
            const activityTableBody = document.getElementById('activityTableBody');
            activityTableBody.innerHTML = '';

            activityData.activity.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.date}</td>
                    <td>${item.description}</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(item.status)}">
                            ${item.status}
                        </span>
                    </td>
                `;
                activityTableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading profile data:', error);
        showAlert('Error loading profile data. Please try again.', 'danger');
    }
}

async function updateProfile(e) {
    e.preventDefault();

    try {
        const formData = {
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        const response = await fetch('../../backend/api/collector/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Profile updated successfully!', 'success');
            loadProfileData();
        } else {
            showAlert(data.message || 'Error updating profile', 'danger');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showAlert('Error updating profile. Please try again.', 'danger');
    }
}

async function changePassword() {
    try {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match', 'danger');
            return;
        }

        const response = await fetch('../../backend/api/collector/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Password changed successfully!', 'success');
            document.getElementById('changePasswordModal').querySelector('.btn-close').click();
            document.getElementById('changePasswordForm').reset();
        } else {
            showAlert(data.message || 'Error changing password', 'danger');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showAlert('Error changing password. Please try again.', 'danger');
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