const API_URL = 'http://127.0.0.1:5000/api/opportunities';

// State
let opportunities = [];

// DOM Elements
const opportunitiesContainer = document.getElementById('opportunitiesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const opportunityForm = document.getElementById('opportunityForm');
const btnSave = document.getElementById('btnSave');
const btnConfirmDelete = document.getElementById('btnConfirmDelete');
const btnCreateNew = document.getElementById('btnCreateNew');

// Modals
let opportunityModal;
let detailsModal;
let deleteModal;

// Toast
let toastElement;
let toastInstance;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Modals
    opportunityModal = new bootstrap.Modal(document.getElementById('opportunityModal'));
    detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    
    // Initialize Toast
    toastElement = document.getElementById('liveToast');
    toastInstance = bootstrap.Toast.getOrCreateInstance(toastElement);

    // Event Listeners
    btnCreateNew.addEventListener('click', openCreateModal);
    btnSave.addEventListener('click', saveOpportunity);
    btnConfirmDelete.addEventListener('click', deleteOpportunity);

    // Initial Fetch
    fetchOpportunities();
});

// Toast functionality
function showToast(message, type = 'success') {
    const toastBody = document.getElementById('toastMessage');
    toastBody.textContent = message;
    
    toastElement.className = `toast align-items-center border-0 text-bg-${type === 'success' ? 'dark' : 'danger'}`;
    toastInstance.show();
}

// Fetch all opportunities
async function fetchOpportunities() {
    try {
        opportunitiesContainer.innerHTML = '';
        opportunitiesContainer.appendChild(loadingIndicator);
        loadingIndicator.style.display = 'block';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        opportunities = await response.json();
        renderOpportunities();
    } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load opportunities', 'error');
        renderEmptyState('Failed to load data. Ensure the backend is running.');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Render the grid
function renderOpportunities() {
    opportunitiesContainer.innerHTML = '';

    if (opportunities.length === 0) {
        renderEmptyState('No research opportunities found. Create one to get started.');
        return;
    }

    opportunities.forEach(opp => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4';
        
        const badgeClass = opp.status === 'Open' ? 'badge-open' : 'badge-closed';
        const formattedDate = new Date(opp.application_deadline).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        // Use safe textContent inside templates by creating elements or parsing carefully
        // Creating DOM structure manually is safer but verbose. We'll use innerHTML with escaped text helper.
        const escapeHTML = (str) => {
            if(!str) return '';
            return str.toString().replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
            );
        };

        col.innerHTML = `
            <div class="card position-relative h-100">
                <span class="status-badge ${badgeClass}">${escapeHTML(opp.status)}</span>
                <div class="card-body d-flex flex-column">
                    <div class="mb-3">
                        <div class="text-uppercase text-muted" style="font-size: 0.75rem; letter-spacing: 0.05em; font-weight: 600;">
                            ${escapeHTML(opp.department)} • ${escapeHTML(opp.area)}
                        </div>
                        <h5 class="card-title mt-2 mb-3">${escapeHTML(opp.title)}</h5>
                        <p class="card-text flex-grow-1">${escapeHTML(opp.description.substring(0, 100))}${opp.description.length > 100 ? '...' : ''}</p>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top" style="border-color: var(--border-color) !important;">
                        <small class="text-muted fw-medium"><i class="ph ph-calendar-blank me-1"></i>${formattedDate}</small>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary rounded-start-pill" onclick="viewDetails(${opp.id})">Details</button>
                            <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${opp.id})">Edit</button>
                            <button class="btn btn-sm btn-outline-primary rounded-end-pill" onclick="confirmDelete(${opp.id})">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        opportunitiesContainer.appendChild(col);
    });
}

function renderEmptyState(message) {
    opportunitiesContainer.innerHTML = `
        <div class="col-12">
            <div class="empty-state">
                <i class="ph ph-magnifying-glass fs-1 text-muted mb-3"></i>
                <h3 class="empty-state-title">No Opportunities</h3>
                <p class="empty-state-text">${message}</p>
            </div>
        </div>
    `;
}

// View Details
async function viewDetails(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Not found');
        const opp = await response.json();
        
        const body = document.getElementById('detailsModalBody');
        const escapeHTML = (str) => {
            if(!str) return '';
            return str.toString().replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
            );
        };
        
        const badgeClass = opp.status === 'Open' ? 'badge-open' : 'badge-closed';
        const formattedDate = new Date(opp.application_deadline).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });

        body.innerHTML = `
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <div class="text-uppercase text-muted mb-1" style="font-size: 0.8rem; letter-spacing: 0.05em; font-weight: 600;">
                        ${escapeHTML(opp.department)} • ${escapeHTML(opp.area)}
                    </div>
                    <h4 class="fw-bold mb-0">${escapeHTML(opp.title)}</h4>
                </div>
                <span class="status-badge position-static ms-3 ${badgeClass}">${escapeHTML(opp.status)}</span>
            </div>
            
            <p class="mb-4" style="line-height: 1.7; color: var(--text-muted);">${escapeHTML(opp.description)}</p>
            
            <div class="details-grid p-4 rounded bg-light border">
                <div class="detail-item">
                    <span class="detail-label">Faculty Member</span>
                    <span class="detail-value">${escapeHTML(opp.faculty_name)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Required Skills</span>
                    <span class="detail-value">${escapeHTML(opp.required_skills)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Available Positions</span>
                    <span class="detail-value">${escapeHTML(opp.available_positions)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Application Deadline</span>
                    <span class="detail-value">${formattedDate}</span>
                </div>
            </div>
        `;
        
        detailsModal.show();
    } catch (error) {
        showToast('Failed to load details', 'error');
    }
}

// Open Create Modal
function openCreateModal() {
    document.getElementById('opportunityForm').reset();
    document.getElementById('oppId').value = '';
    document.getElementById('statusGroup').style.display = 'none';
    document.getElementById('opportunityModalLabel').textContent = 'Create New Opportunity';
}

// Open Edit Modal
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Not found');
        const opp = await response.json();
        
        document.getElementById('oppId').value = opp.id;
        document.getElementById('title').value = opp.title;
        document.getElementById('description').value = opp.description;
        document.getElementById('area').value = opp.area;
        document.getElementById('faculty_name').value = opp.faculty_name;
        document.getElementById('department').value = opp.department;
        document.getElementById('required_skills').value = opp.required_skills;
        document.getElementById('available_positions').value = opp.available_positions;
        
        // Format date to YYYY-MM-DD for input
        const dateObj = new Date(opp.application_deadline);
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        document.getElementById('application_deadline').value = `${yyyy}-${mm}-${dd}`;
        
        document.getElementById('statusGroup').style.display = 'block';
        document.getElementById('status').value = opp.status;
        
        document.getElementById('opportunityModalLabel').textContent = 'Edit Opportunity';
        opportunityModal.show();
    } catch (error) {
        showToast('Failed to load opportunity for editing', 'error');
    }
}

// Save (Create or Update)
async function saveOpportunity() {
    const form = document.getElementById('opportunityForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('oppId').value;
    const isEdit = !!id;
    
    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        area: document.getElementById('area').value,
        faculty_name: document.getElementById('faculty_name').value,
        department: document.getElementById('department').value,
        required_skills: document.getElementById('required_skills').value,
        available_positions: parseInt(document.getElementById('available_positions').value),
        application_deadline: document.getElementById('application_deadline').value,
    };

    if (isEdit) {
        data.status = document.getElementById('status').value;
    }

    try {
        btnSave.disabled = true;
        btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        const url = isEdit ? `${API_URL}/${id}` : API_URL;
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save');
        }

        showToast(isEdit ? 'Opportunity updated successfully' : 'Opportunity created successfully');
        opportunityModal.hide();
        fetchOpportunities();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btnSave.disabled = false;
        btnSave.textContent = isEdit ? 'Save Changes' : 'Save Opportunity';
    }
}

// Confirm Delete
function confirmDelete(id) {
    document.getElementById('deleteId').value = id;
    deleteModal.show();
}

// Execute Delete
async function deleteOpportunity() {
    const id = document.getElementById('deleteId').value;
    try {
        btnConfirmDelete.disabled = true;
        btnConfirmDelete.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete');

        showToast('Opportunity deleted successfully');
        deleteModal.hide();
        fetchOpportunities();
    } catch (error) {
        showToast('Failed to delete opportunity', 'error');
    } finally {
        btnConfirmDelete.disabled = false;
        btnConfirmDelete.textContent = 'Delete';
    }
}
