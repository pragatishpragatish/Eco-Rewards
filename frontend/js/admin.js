document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    const navLinks = document.querySelectorAll('.sidebar a[data-page]');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
            
            // Load data for the selected page
            loadPageData(targetPage);
        });
    });

    // Logout functionality
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('../../backend/auth/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '../../frontend/login.html';
                } else {
                    alert('Error logging out: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
            });
    });

    // Load initial dashboard data
    loadPageData('dashboard');

    // Form submissions
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);
    document.getElementById('addScheduleForm')?.addEventListener('submit', handleAddSchedule);
    document.getElementById('rewardSettingsForm')?.addEventListener('submit', handleUpdateRewardSettings);
});

function loadPageData(page) {
    console.log('Loading page:', page);
    switch(page) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsers();
            break;
        case 'collectors':
            loadCollectors();
            break;
        case 'schedules':
            loadSchedules();
            loadCollectorsForSchedule();
            break;
        case 'rewards':
            loadRewardSettings();
            break;
        case 'analytics':
            loadAnalytics();
            break;
    }
}

function loadDashboardStats() {
    fetch('../../backend/api/stats.php')
        .then(response => {
            console.log('Stats response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Stats data:', data);
            if (data.success) {
                document.getElementById('totalUsers').textContent = data.totalUsers;
                document.getElementById('totalCollectors').textContent = data.totalCollectors;
                document.getElementById('totalWaste').textContent = data.totalWaste;
                document.getElementById('totalPoints').textContent = data.totalPoints;
            } else {
                console.error('Error loading stats:', data.message);
                alert('Error loading dashboard stats: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading dashboard stats. Please check console for details.');
        });
}

function loadUsers() {
    console.log('Loading users...');
    fetch('../../backend/api/users.php')
        .then(response => {
            console.log('Users response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Users data:', data);
            if (data.success) {
                const tbody = document.querySelector('#usersTable tbody');
                tbody.innerHTML = '';
                
                if (data.users && data.users.length > 0) {
                    data.users.forEach(user => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button onclick="editUser(${user.id})">Edit</button>
                                <button onclick="deleteUser(${user.id})">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
                }
            } else {
                console.error('Error loading users:', data.message);
                alert('Error loading users: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading users:', error);
            alert('Error loading users. Please check console for details.');
        });
}

function loadCollectors() {
    console.log('Loading collectors...');
    fetch('../../backend/api/collectors.php')
        .then(response => {
            console.log('Collectors response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Collectors data:', data);
            if (data.success) {
                const tbody = document.querySelector('#collectorsTable tbody');
                tbody.innerHTML = '';
                
                if (data.collectors && data.collectors.length > 0) {
                    data.collectors.forEach(collector => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${collector.name || 'N/A'}</td>
                            <td>${collector.email || 'N/A'}</td>
                            <td>${Array.isArray(collector.areas) ? collector.areas.join(', ') : 'No areas assigned'}</td>
                            <td>
                                <button onclick="editCollector(${collector.id})">Edit</button>
                                <button onclick="deleteCollector(${collector.id})">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4">No collectors found</td></tr>';
                }
            } else {
                throw new Error(data.message || 'Failed to load collectors');
            }
        })
        .catch(error => {
            console.error('Error loading collectors:', error);
            const tbody = document.querySelector('#collectorsTable tbody');
            tbody.innerHTML = `<tr><td colspan="4">Error loading collectors: ${error.message}</td></tr>`;
        });
}

function loadSchedules() {
    console.log('Loading schedules...');
    fetch('../../backend/api/schedules.php')
        .then(response => {
            console.log('Schedules response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Schedules data:', data);
            if (data.success) {
                const tbody = document.querySelector('#schedulesTable tbody');
                tbody.innerHTML = '';
                
                if (data.schedules && data.schedules.length > 0) {
                    data.schedules.forEach(schedule => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${schedule.collector_name || 'N/A'}</td>
                            <td>${schedule.area || 'N/A'}</td>
                            <td>${schedule.date || 'N/A'}</td>
                            <td>${schedule.time || 'N/A'}</td>
                            <td>${schedule.status || 'pending'}</td>
                            <td>
                                <button onclick="editSchedule(${schedule.id})">Edit</button>
                                <button onclick="deleteSchedule(${schedule.id})">Delete</button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="6">No schedules found</td></tr>';
                }
            } else {
                throw new Error(data.message || 'Failed to load schedules');
            }
        })
        .catch(error => {
            console.error('Error loading schedules:', error);
            const tbody = document.querySelector('#schedulesTable tbody');
            tbody.innerHTML = `<tr><td colspan="6">Error loading schedules: ${error.message}</td></tr>`;
        });
}

function loadCollectorsForSchedule() {
    fetch('../backend/api/collectors.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('scheduleCollector');
                select.innerHTML = '';
                
                data.collectors.forEach(collector => {
                    const option = document.createElement('option');
                    option.value = collector.id;
                    option.textContent = collector.name;
                    select.appendChild(option);
                });
            }
        });
}

function loadRewardSettings() {
    console.log('Loading reward settings...');
    fetch('../../backend/api/rewards.php')
        .then(response => {
            console.log('Rewards response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Rewards data:', data);
            if (data.success) {
                document.getElementById('pointsPerKg').value = data.pointsPerKg;
            } else {
                console.error('Error loading reward settings:', data.message);
                alert('Error loading reward settings: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading reward settings:', error);
            alert('Error loading reward settings. Please check console for details.');
        });
}

function loadAnalytics() {
    console.log('Loading analytics...');
    
    // Load waste collection trends
    fetch('../../backend/api/analytics.php?type=waste')
        .then(response => {
            console.log('Waste analytics response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Waste analytics data:', data);
            if (data.success) {
                createWasteTrendsChart(data);
            } else {
                throw new Error(data.message || 'Failed to load waste analytics');
            }
        })
        .catch(error => {
            console.error('Error loading waste analytics:', error);
            const wasteChartContainer = document.getElementById('wasteTrendsChart').parentElement;
            wasteChartContainer.innerHTML = `<p class="error">Error loading waste trends: ${error.message}</p>`;
        });
    
    // Load user participation data
    fetch('../../backend/api/analytics.php?type=participation')
        .then(response => {
            console.log('Participation analytics response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Participation analytics data:', data);
            if (data.success) {
                createUserParticipationChart(data);
            } else {
                throw new Error(data.message || 'Failed to load participation analytics');
            }
        })
        .catch(error => {
            console.error('Error loading participation analytics:', error);
            const participationChartContainer = document.getElementById('userParticipationChart').parentElement;
            participationChartContainer.innerHTML = `<p class="error">Error loading user participation: ${error.message}</p>`;
        });
}

function handleAddUser(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        password: document.getElementById('userPassword').value,
        role: document.getElementById('userRole').value
    };
    
    console.log('Adding user with data:', formData);
    
    fetch('../../backend/api/users.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            alert('User added successfully!');
            loadUsers();
            e.target.reset();
        } else {
            alert('Error adding user: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding user:', error);
        alert('Error adding user. Please check console for details.');
    });
}

function handleAddSchedule(e) {
    e.preventDefault();
    const formData = {
        collector_id: document.getElementById('scheduleCollector').value,
        area: document.getElementById('scheduleArea').value,
        date: document.getElementById('scheduleDate').value,
        time: document.getElementById('scheduleTime').value
    };
    
    console.log('Adding schedule with data:', formData);
    
    fetch('../../backend/api/schedules.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Schedule response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Schedule response data:', data);
        if (data.success) {
            alert('Schedule added successfully!');
            loadSchedules();
            e.target.reset();
        } else {
            alert('Error adding schedule: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error adding schedule:', error);
        alert('Error adding schedule. Please check console for details.');
    });
}

function handleUpdateRewardSettings(e) {
    e.preventDefault();
    const pointsPerKg = document.getElementById('pointsPerKg').value;
    
    console.log('Updating reward settings:', pointsPerKg);
    
    fetch('../../backend/api/rewards.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pointsPerKg })
    })
    .then(response => {
        console.log('Rewards update response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Rewards update response data:', data);
        if (data.success) {
            alert('Reward settings updated successfully!');
        } else {
            alert('Error updating reward settings: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Error updating reward settings:', error);
        alert('Error updating reward settings. Please check console for details.');
    });
}

function createWasteTrendsChart(data) {
    const ctx = document.getElementById('wasteTrendsChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Waste Collected (kg)',
                data: data.values || [],
                borderColor: '#2ecc71',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createUserParticipationChart(data) {
    const ctx = document.getElementById('userParticipationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels || [],
            datasets: [{
                label: 'Active Users',
                data: data.values || [],
                backgroundColor: '#2ecc71'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function editUser(id) {
    console.log('Editing user:', id);
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Deleting user:', id);
        fetch(`../../backend/api/users.php?id=${id}`, {
            method: 'DELETE'
        })
        .then(response => {
            console.log('Delete response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Delete response data:', data);
            if (data.success) {
                alert('User deleted successfully!');
                loadUsers();
            } else {
                alert('Error deleting user: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            alert('Error deleting user. Please check console for details.');
        });
    }
} 