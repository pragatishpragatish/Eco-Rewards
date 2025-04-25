document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = '../login.html';
        return;
    }

    // Load rewards data
    loadRewardsData();

    // Initialize reward modal
    const rewardModal = new bootstrap.Modal(document.getElementById('rewardModal'));
    let selectedReward = null;

    // Add event listener for confirm redeem button
    document.getElementById('confirmRedeem').addEventListener('click', async function() {
        if (selectedReward) {
            await redeemReward(selectedReward);
            rewardModal.hide();
        }
    });
});

async function loadRewardsData() {
    try {
        // Load user points and last redeemed date
        const rewardsResponse = await fetch('../../backend/api/user/rewards.php');
        const rewardsData = await rewardsResponse.json();

        if (rewardsData.success) {
            document.getElementById('currentPoints').textContent = rewardsData.total_points;
            document.getElementById('lastRedeemed').textContent = rewardsData.last_redeemed || 'Never';
        }

        // Load available rewards
        const availableRewardsResponse = await fetch('../../backend/api/user/available-rewards.php');
        const availableRewardsData = await availableRewardsResponse.json();

        if (availableRewardsData.success) {
            const rewardsGrid = document.getElementById('rewardsGrid');
            rewardsGrid.innerHTML = '';

            availableRewardsData.rewards.forEach(reward => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${reward.name}</h5>
                            <p class="card-text">${reward.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-primary">${reward.points_required} points</span>
                                <button class="btn btn-success redeem-btn" data-reward-id="${reward.id}">
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                rewardsGrid.appendChild(card);
            });

            // Add event listeners to redeem buttons
            document.querySelectorAll('.redeem-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const reward = availableRewardsData.rewards.find(r => r.id === parseInt(this.dataset.rewardId));
                    if (reward) {
                        selectedReward = reward;
                        document.getElementById('modalRewardName').textContent = reward.name;
                        document.getElementById('modalRewardPoints').textContent = reward.points_required;
                        rewardModal.show();
                    }
                });
            });
        }

        // Load reward history
        const historyResponse = await fetch('../../backend/api/user/reward-history.php');
        const historyData = await historyResponse.json();

        if (historyData.success) {
            const tableBody = document.getElementById('rewardHistoryTableBody');
            tableBody.innerHTML = '';

            historyData.history.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.reward_name}</td>
                    <td>${entry.points_used}</td>
                    <td>
                        <span class="badge bg-${getStatusBadgeColor(entry.status)}">
                            ${entry.status}
                        </span>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error loading rewards data:', error);
        showAlert('Error loading rewards data. Please try again.', 'danger');
    }
}

async function redeemReward(reward) {
    try {
        const response = await fetch('../../backend/api/user/redeem-reward.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                reward_id: reward.id
            })
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Reward redeemed successfully!', 'success');
            loadRewardsData(); // Refresh the page data
        } else {
            showAlert(data.message || 'Error redeeming reward', 'danger');
        }
    } catch (error) {
        console.error('Error redeeming reward:', error);
        showAlert('Error redeeming reward. Please try again.', 'danger');
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