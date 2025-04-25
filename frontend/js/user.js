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
        fetch('../backend/auth/logout.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '../login.html';
                }
            });
    });

    // Form submissions
    document.getElementById('submitWasteForm')?.addEventListener('submit', handleSubmitWaste);
    document.getElementById('feedbackForm')?.addEventListener('submit', handleSubmitFeedback);

    // Load initial dashboard data
    loadPageData('dashboard');
});

function loadPageData(page) {
    switch(page) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'waste':
            loadWasteEntries();
            break;
        case 'rewards':
            loadRewards();
            break;
        case 'schedules':
            loadPickupSchedules();
            break;
        case 'feedback':
            loadFeedback();
            break;
    }
}

function loadDashboardStats() {
    fetch('../backend/api/user/stats.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('totalWaste').textContent = data.totalWaste;
                document.getElementById('totalPoints').textContent = data.totalPoints;
                document.getElementById('nextPickup').textContent = data.nextPickup || 'No upcoming pickups';
            }
        });
}

function loadWasteEntries() {
    fetch('../backend/api/user/waste.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tbody = document.querySelector('#wasteEntriesTable tbody');
                tbody.innerHTML = '';
                
                data.entries.forEach(entry => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${entry.date_collected}</td>
                        <td>${entry.weight_kg}</td>
                        <td>${entry.status}</td>
                        <td>${entry.points}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        });
}

function loadRewards() {
    fetch('../backend/api/user/rewards.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('currentPoints').textContent = data.totalPoints;
                document.getElementById('lastRedeemed').textContent = data.lastRedeemed || 'Never';
            }
        });
}

function loadPickupSchedules() {
    fetch('../backend/api/user/schedules.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tbody = document.querySelector('#pickupSchedulesTable tbody');
                tbody.innerHTML = '';
                
                data.schedules.forEach(schedule => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${schedule.date}</td>
                        <td>${schedule.time}</td>
                        <td>${schedule.area}</td>
                        <td>${schedule.status}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        });
}

function loadFeedback() {
    fetch('../backend/api/user/feedback.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const container = document.getElementById('previousFeedback');
                container.innerHTML = '';
                
                data.feedback.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'feedback-item';
                    div.innerHTML = `
                        <p class="feedback-date">${item.submitted_at}</p>
                        <p class="feedback-message">${item.message}</p>
                    `;
                    container.appendChild(div);
                });
            }
        });
}

function handleSubmitWaste(e) {
    e.preventDefault();
    const formData = {
        weight_kg: document.getElementById('wasteWeight').value,
        date_collected: document.getElementById('wasteDate').value
    };
    
    fetch('../backend/api/user/waste.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Waste submission successful! Points earned: ' + data.points);
            loadWasteEntries();
            loadDashboardStats();
            e.target.reset();
        } else {
            alert(data.message || 'Error submitting waste');
        }
    });
}

function handleSubmitFeedback(e) {
    e.preventDefault();
    const formData = {
        message: document.getElementById('feedbackMessage').value
    };
    
    fetch('../backend/api/user/feedback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Feedback submitted successfully');
            loadFeedback();
            e.target.reset();
        } else {
            alert(data.message || 'Error submitting feedback');
        }
    });
} 