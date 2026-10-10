const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchOpportunities();
});

// Fetch all opportunities
async function fetchOpportunities() {
    const container = document.getElementById('opportunitiesContainer');
    
    try {
        const response = await fetch(`${API_BASE_URL}/opportunities`);
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data = await response.json();
        renderOpportunities(data);
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Failed to load opportunities. Is the backend running?
            </div>
        `;
    }
}

// Render cards
function renderOpportunities(opportunities) {
    const container = document.getElementById('opportunitiesContainer');
    container.innerHTML = '';
    
    if (opportunities.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No opportunities found.</p></div>';
        return;
    }
    
    opportunities.forEach(opp => {
        const statusClass = opp.status === 'Open' ? 'bg-success' : 'bg-secondary';
        const date = new Date(opp.application_deadline).toLocaleDateString();
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card shadow-sm h-100 position-relative">
                <span class="badge ${statusClass} status-badge">${opp.status}</span>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title pr-4">${opp.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${opp.department}</h6>
                    <p class="card-text text-truncate">${opp.description}</p>
                    <div class="mt-auto">
                        <p class="mb-1"><small><strong>Faculty:</strong> ${opp.faculty_name}</small></p>
                        <p class="mb-3"><small><strong>Deadline:</strong> ${date}</small></p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${opp.id})">View Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

// View details
async function viewDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/opportunities/${id}`);
        if (!response.ok) throw new Error('Failed to fetch details');
        
        const opp = await response.json();
        
        const detailsHtml = `
            <h4>${opp.title}</h4>
            <div class="mb-3">
                <span class="badge ${opp.status === 'Open' ? 'bg-success' : 'bg-secondary'}">${opp.status}</span>
            </div>
            <p><strong>Department:</strong> ${opp.department}</p>
            <p><strong>Research Area:</strong> ${opp.area}</p>
            <p><strong>Faculty:</strong> ${opp.faculty_name}</p>
            <hr>
            <h5>Description</h5>
            <p>${opp.description}</p>
            <hr>
            <h5>Requirements</h5>
            <p><strong>Skills:</strong> ${opp.required_skills}</p>
            <p><strong>Positions:</strong> ${opp.available_positions}</p>
            <p><strong>Deadline:</strong> ${new Date(opp.application_deadline).toLocaleDateString()}</p>
        `;
        
        document.getElementById('detailsModalBody').innerHTML = detailsHtml;
        const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
        modal.show();
    } catch (error) {
        console.error('Error fetching details:', error);
        showAlert('Failed to load opportunity details.', 'danger');
    }
}

// Utility for alerts (will be useful in Step 7)
function showAlert(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    const container = document.getElementById('alertContainer');
    container.innerHTML = alertHtml;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alertNode = container.querySelector('.alert');
        if (alertNode) {
            const alert = new bootstrap.Alert(alertNode);
            alert.close();
        }
    }, 5000);
}
