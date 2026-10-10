const API_BASE_URL = 'http://localhost:5000/api';
let currentDeleteId = null;
let currentModal = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', () => {
    fetchOpportunities();
    
    // Initialize Modal
    currentModal = new bootstrap.Modal(document.getElementById('opportunityModal'));
    
    // Setup event listeners
    document.getElementById('btnCreateNew').addEventListener('click', openCreateModal);
    document.getElementById('btnSave').addEventListener('click', saveOpportunity);
    document.getElementById('btnConfirmDelete').addEventListener('click', confirmDelete);
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
        // Convert the object to a JSON string and escape quotes for HTML attribute
        const oppJson = JSON.stringify(opp).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
        
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card shadow-sm h-100 position-relative">
                <span class="badge ${statusClass} status-badge">${opp.status}</span>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title pr-4">${opp.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${opp.department}</h6>
                    <p class="card-text text-truncate" title="${opp.description}">${opp.description}</p>
                    <div class="mt-auto">
                        <p class="mb-1"><small><strong>Faculty:</strong> ${opp.faculty_name}</small></p>
                        <p class="mb-3"><small><strong>Deadline:</strong> ${date}</small></p>
                        <div class="d-flex justify-content-between align-items-center">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${opp.id})">Details</button>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-secondary" onclick="openEditModal(${opp.id})">Edit</button>
                                <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${opp.id})">Delete</button>
                            </div>
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

// Modal Management
function openCreateModal() {
    isEditMode = false;
    document.getElementById('opportunityModalLabel').textContent = 'Create Opportunity';
    document.getElementById('opportunityForm').reset();
    document.getElementById('oppId').value = '';
    document.getElementById('statusGroup').style.display = 'none';
}

async function openEditModal(id) {
    isEditMode = true;
    document.getElementById('opportunityModalLabel').textContent = 'Edit Opportunity';
    
    try {
        const response = await fetch(`${API_BASE_URL}/opportunities/${id}`);
        if (!response.ok) throw new Error('Failed to fetch details');
        const opp = await response.json();
        
        document.getElementById('oppId').value = opp.id;
        document.getElementById('title').value = opp.title;
        document.getElementById('description').value = opp.description;
        document.getElementById('area').value = opp.area;
        document.getElementById('faculty_name').value = opp.faculty_name;
        document.getElementById('department').value = opp.department;
        document.getElementById('required_skills').value = opp.required_skills;
        document.getElementById('available_positions').value = opp.available_positions;
        
        // Format date for input field (YYYY-MM-DD)
        const dateObj = new Date(opp.application_deadline);
        document.getElementById('application_deadline').value = dateObj.toISOString().split('T')[0];
        
        document.getElementById('statusGroup').style.display = 'block';
        document.getElementById('status').value = opp.status;
        
        currentModal.show();
    } catch (error) {
        console.error('Error fetching details for edit:', error);
        showAlert('Failed to load opportunity details.', 'danger');
    }
}

function openDeleteModal(id) {
    currentDeleteId = id;
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
}

// CRUD Operations
async function saveOpportunity() {
    const form = document.getElementById('opportunityForm');
    
    // Simple HTML5 validation check
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('oppId').value;
    
    const payload = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim(),
        area: document.getElementById('area').value.trim(),
        faculty_name: document.getElementById('faculty_name').value.trim(),
        department: document.getElementById('department').value.trim(),
        required_skills: document.getElementById('required_skills').value.trim(),
        available_positions: parseInt(document.getElementById('available_positions').value),
        application_deadline: document.getElementById('application_deadline').value
    };

    if (isEditMode) {
        payload.status = document.getElementById('status').value;
    }

    try {
        const url = isEditMode ? `${API_BASE_URL}/opportunities/${id}` : `${API_BASE_URL}/opportunities`;
        const method = isEditMode ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to save');
        }
        
        currentModal.hide();
        showAlert(`Opportunity successfully ${isEditMode ? 'updated' : 'created'}.`, 'success');
        fetchOpportunities();
        
    } catch (error) {
        console.error('Save error:', error);
        showAlert(error.message, 'danger');
    }
}

async function confirmDelete() {
    if (!currentDeleteId) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/opportunities/${currentDeleteId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete');
        }
        
        const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        deleteModal.hide();
        
        showAlert('Opportunity deleted successfully.', 'success');
        fetchOpportunities();
        
    } catch (error) {
        console.error('Delete error:', error);
        showAlert(error.message, 'danger');
    } finally {
        currentDeleteId = null;
    }
}

// Utility for alerts
function showAlert(message, type = 'success') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
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
