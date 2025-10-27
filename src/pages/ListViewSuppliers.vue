<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">Manage Suppliers</h2>

                <!-- Suppliers List -->
                <div class="suppliers-list-section">
                    <div class="section-header">
                        <h3 class="section-title">Existing Suppliers</h3>
                        
                        <!-- Filter Section -->
                        <div class="filter-section">
                            <div class="filter-group">
                                <label for="supplierFilter">Filter by Name</label>
                                <input 
                                    type="text" 
                                    id="supplierFilter" 
                                    v-model="supplierFilter" 
                                    placeholder="Search supplier by name..." 
                                    class="filter-input" 
                                />
                                <button 
                                    v-if="supplierFilter" 
                                    class="clear-filter-btn" 
                                    @click="clearFilter"
                                    title="Clear filter"
                                >
                                    ❌
                                </button>
                            </div>
                            <router-link to="/add-supplier" class="btn add-new-btn">
                                ➕ Add New Supplier
                            </router-link>
                        </div>
                    </div>

                    <div v-if="filteredSuppliers.length === 0" class="empty-state">
                        <div v-if="supplierFilter">
                            No suppliers found matching "{{ supplierFilter }}"
                        </div>
                        <div v-else>
                            No suppliers added yet. 
                            <router-link to="/add-supplier" class="add-link">Add your first supplier</router-link>
                        </div>
                    </div>
                    <div v-else class="suppliers-table">
                        <div class="results-info">
                            Showing {{ filteredSuppliers.length }} of {{ suppliers.length }} suppliers
                            <span v-if="supplierFilter">for "{{ supplierFilter }}"</span>
                            <button class="btn download-all-btn" @click="downloadAllSuppliers" title="Download all suppliers as CSV">
                                📥 Download All as CSV
                            </button>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Place</th>
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Website</th>
                                    <th>Status</th>
                                    <th class="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="supplier in filteredSuppliers" :key="supplier.id"
                                    :class="{ 'inactive-row': supplier.status === 'inactive' }">
                                    <td class="name-cell">
                                        <strong>{{ supplier.name }}</strong>
                                       
                                    </td>
                                    <td class="company-cell">
                                        {{ supplier.company_name || '-' }}
                                    </td>
                                    <td class="place-cell">
                                        <div class="place-info">
                                            <strong>{{ supplier.place || '-' }}</strong>
                                            <div v-if="supplier.address" class="address-tooltip">
                                                📍
                                                <div class="tooltip-text">{{ supplier.address }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="contact-cell">
                                        {{ supplier.contact_number || '-' }}
                                    </td>
                                    <td class="email-cell">
                                        <a v-if="supplier.email" :href="`mailto:${supplier.email}`" class="email-link">
                                            {{ supplier.email }}
                                        </a>
                                        <span v-else>-</span>
                                    </td>
                                    <td class="website-cell">
                                        <a v-if="isValidWebsite(supplier.website)" :href="supplier.website"
                                            target="_blank" class="website-link">
                                            🌐 Visit
                                        </a>
                                        <span v-else-if="supplier.website" class="invalid-website"
                                            :title="supplier.website">
                                            ❌ Invalid
                                        </span>
                                        <span v-else>-</span>
                                    </td>
                                    <td class="status-cell">
                                        <span class="status-badge" :class="supplier.status">
                                            {{ supplier.status === 'active' ? '✅ Active' : '❌ Inactive' }}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="btn edit-btn" @click="openEditPopup(supplier)" title="Edit">
                                            ✏️
                                        </button>
                                        <button class="btn download-btn" @click="downloadSupplier(supplier)" title="Download Details">
                                            📥
                                        </button>
                                        <button class="btn danger-btn" @click="deleteSupplier(supplier.id)"
                                            title="Delete">
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Edit Supplier Popup -->
            <div v-if="showEditPopup" class="popup-overlay" @click="closeEditPopup">
                <div class="popup-content" @click.stop>
                    <div class="popup-header">
                        <h3>Edit Supplier</h3>
                        <button class="close-btn" @click="closeEditPopup">✕</button>
                    </div>
                    <div class="popup-body">
                        <div class="supplier-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editSupplierName">Supplier Name *</label>
                                    <input type="text" id="editSupplierName" v-model="editForm.name"
                                        placeholder="Enter supplier name" class="form-input" />
                                </div>
                                <div class="form-group">
                                    <label for="editCompanyName">Company Name</label>
                                    <input type="text" id="editCompanyName" v-model="editForm.company_name"
                                        placeholder="Company name" class="form-input" />
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editSupplierEmail">Email</label>
                                    <input type="email" id="editSupplierEmail" v-model="editForm.email"
                                        @blur="validateEditEmail" @input="clearEditEmailError"
                                        placeholder="supplier@example.com" class="form-input"
                                        :class="{ 'input-error': editEmailError }" />
                                    <div v-if="editEmailError" class="error-message">
                                        ❌ {{ editEmailError }}
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="editContactNumber">Contact Number</label>
                                    <input type="text" id="editContactNumber" v-model="editForm.contact_number"
                                        placeholder="Phone number" class="form-input" />
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editWebsite">Website</label>
                                    <input type="url" id="editWebsite" v-model="editForm.website"
                                        @blur="validateEditWebsite" @input="clearEditWebsiteError"
                                        placeholder="https://example.com" class="form-input"
                                        :class="{ 'input-error': editWebsiteError }" />
                                    <div v-if="editWebsiteError" class="error-message">
                                        ❌ {{ editWebsiteError }}
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="editGstNumber">GST Number</label>
                                    <input type="text" id="editGstNumber" v-model="editForm.gst_number"
                                        placeholder="GST number" class="form-input" />
                                </div>
                            </div>

                            <!-- Address and Place Fields -->
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editPlace">Place *</label>
                                    <input type="text" id="editPlace" v-model="editForm.place"
                                        placeholder="Enter place/city" class="form-input" />
                                </div>
                                <div class="form-group full-width">
                                    <label for="editAddress">Address *</label>
                                    <textarea id="editAddress" v-model="editForm.address"
                                        placeholder="Full address of the supplier" class="form-textarea"
                                        rows="3"></textarea>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="editStatus">Status</label>
                                    <select id="editStatus" v-model="editForm.status" class="form-input">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                                <div class="form-group full-width">
                                    <label for="editNote">Notes</label>
                                    <textarea id="editNote" v-model="editForm.note"
                                        placeholder="Additional notes about the supplier" class="form-textarea"
                                        rows="3"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="popup-footer">
                        <button class="btn cancel-btn" @click="closeEditPopup">
                            ❌ Cancel
                        </button>
                        <button class="btn save-btn" @click="updateSupplier" :disabled="!canEditSave">
                            💾 Update Supplier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

const router = useRouter();

// Supplier data
const suppliers = ref([]);
const editingId = ref(null);

// Filter state
const supplierFilter = ref("");

// Popup state
const showEditPopup = ref(false);

// Edit form for popup
const editForm = reactive({
    name: "",
    email: "",
    contact_number: "",
    company_name: "",
    website: "",
    note: "",
    status: "active",
    gst_number: "",
    place: "",
    address: ""
});

// Validation errors
const editEmailError = ref("");
const editWebsiteError = ref("");

// Computed property for filtered suppliers
const filteredSuppliers = computed(() => {
    if (!supplierFilter.value) {
        return sortedSuppliers.value;
    }
    
    const filter = supplierFilter.value.toLowerCase();
    return sortedSuppliers.value.filter(supplier => 
        supplier.name.toLowerCase().includes(filter) ||
        (supplier.company_name && supplier.company_name.toLowerCase().includes(filter))
    );
});

// Computed property for edit save button
const canEditSave = computed(() => {
    const hasRequiredFields = editForm.name.trim() &&
        editForm.place.trim() &&
        editForm.address.trim();

    const hasValidWebsite = !editForm.website || isValidWebsite(editForm.website);

    return hasRequiredFields && hasValidWebsite;
});

// Computed property for sorted suppliers
const sortedSuppliers = computed(() => {
    return [...suppliers.value].sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
});

// Email validation function
const isValidEmail = (email) => {
    if (!email) return true; // Empty is valid (optional field)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate edit email on blur
const validateEditEmail = () => {
    if (!editForm.email) {
        editEmailError.value = "";
        return;
    }

    if (!isValidEmail(editForm.email)) {
        editEmailError.value = "Please enter a valid email address (e.g., example@domain.com)";
    } else {
        editEmailError.value = "";
    }
};

// Clear edit email error when user starts typing
const clearEditEmailError = () => {
    if (editEmailError.value) {
        editEmailError.value = "";
    }
};

const isValidWebsite = (url) => {
    if (!url) return true; // Empty is valid (optional field)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
    }
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
        const cleanHostname = hostname.replace(/^www\./, '');
        return domainRegex.test(cleanHostname);
    } catch {
        return false;
    }
};

// Validate edit website on blur
const validateEditWebsite = () => {
    if (!editForm.website) {
        editWebsiteError.value = "";
        return;
    }

    if (!isValidWebsite(editForm.website)) {
        editWebsiteError.value = "Please enter a valid website URL (e.g., https://example.com)";
    } else {
        editWebsiteError.value = "";
    }
};

// Clear edit website error when user starts typing
const clearEditWebsiteError = () => {
    if (editWebsiteError.value) {
        editWebsiteError.value = "";
    }
};

// Clear filter
const clearFilter = () => {
    supplierFilter.value = "";
};

// Download single supplier details as JSON
const downloadSupplier = (supplier) => {
    const supplierData = JSON.stringify([supplier], null, 2);
    const blob = new Blob([supplierData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `supplier_${supplier.name.replace(/\s+/g, '_')}_details.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Download all suppliers as CSV
const downloadAllSuppliers = () => {
    if (suppliers.value.length === 0) {
        alert('No suppliers to download!');
        return;
    }

    const headers = ['ID', 'Name', 'Email', 'Contact Number', 'Company Name', 'Website', 'GST Number', 'Place', 'Address', 'Status', 'Notes'];
    
    const csvData = suppliers.value.map(supplier => [
        supplier.id,
        `"${supplier.name}"`,
        `"${supplier.email || ''}"`,
        `"${supplier.contact_number || ''}"`,
        `"${supplier.company_name || ''}"`,
        `"${supplier.website || ''}"`,
        `"${supplier.gst_number || ''}"`,
        `"${supplier.place || ''}"`,
        `"${(supplier.address || '').replace(/"/g, '""')}"`,
        `"${supplier.status}"`,
        `"${(supplier.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all_suppliers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Load suppliers on mount
onMounted(async () => {
    await loadSuppliers();
});

// Load suppliers from API
const loadSuppliers = async () => {
    try {
        const res = await axios.get("/suppliers/");
        suppliers.value = res.data;
    } catch (error) {
        console.error("Error loading suppliers:", error);
        alert("Error loading suppliers!");
    }
};

// Open edit popup
const openEditPopup = (supplier) => {
    showEditPopup.value = true;
    editingId.value = supplier.id;

    // Fill edit form with supplier data
    editForm.name = supplier.name;
    editForm.email = supplier.email || "";
    editForm.contact_number = supplier.contact_number || "";
    editForm.company_name = supplier.company_name || "";
    editForm.website = supplier.website || "";
    editForm.note = supplier.note || "";
    editForm.status = supplier.status;
    editForm.gst_number = supplier.gst_number || "";
    editForm.place = supplier.place || "";
    editForm.address = supplier.address || "";

    // Clear any existing errors
    editEmailError.value = "";
    editWebsiteError.value = "";
};

// Close edit popup
const closeEditPopup = () => {
    showEditPopup.value = false;
    editingId.value = null;
};

// Update supplier from popup
const updateSupplier = async () => {
    if (!editForm.name.trim()) {
        alert("Please enter supplier name!");
        return;
    }

    if (!editForm.place.trim()) {
        alert("Please enter supplier place!");
        return;
    }

    if (!editForm.address.trim()) {
        alert("Please enter supplier address!");
        return;
    }

    // Final website validation before saving
    if (editForm.website && !isValidWebsite(editForm.website)) {
        editWebsiteError.value = "Please enter a valid website URL (e.g., https://example.com)";
        alert("Please fix the website URL before saving!");
        return;
    }

    try {
        const supplierData = {
            name: editForm.name.trim(),
            email: editForm.email.trim() || null,
            contact_number: editForm.contact_number.trim() || null,
            company_name: editForm.company_name.trim() || null,
            website: editForm.website.trim() || null,
            note: editForm.note.trim() || null,
            status: editForm.status,
            gst_number: editForm.gst_number.trim() || null,
            place: editForm.place.trim(),
            address: editForm.address.trim()
        };

        // Update existing supplier
        await axios.put(`/suppliers/${editingId.value}/`, supplierData);
        alert("Supplier updated successfully!");

        // Close popup and reload suppliers
        closeEditPopup();
        await loadSuppliers();

    } catch (error) {
        console.error("Error updating supplier:", error);
        alert("Error updating supplier!");
    }
};

// Delete supplier
const deleteSupplier = async (supplierId) => {
    if (!confirm("Are you sure you want to delete this supplier?")) {
        return;
    }

    try {
        await axios.delete(`/suppliers/${supplierId}/`);
        await loadSuppliers();
        alert("Supplier deleted successfully!");
    } catch (error) {
        console.error("Error deleting supplier:", error);
        alert("Error deleting supplier!");
    }
};
</script>

<style scoped>
/* Add these new styles for the add button */
.add-new-btn {
    background: #4CAF50;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.add-new-btn:hover {
    background: #45a049;
    transform: translateY(-1px);
}

.add-link {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 600;
    margin-left: 5px;
}

.add-link:hover {
    text-decoration: underline;
}

.filter-section {
    display: flex;
    align-items: flex-end;
    gap: 15px;
}

/* Keep all the existing styles from the original code */
.layout {
    display: flex;
}

.main-content {
    margin-left: 235px;
    flex: 1;
    min-height: 100vh;
    background: #f9fafb;
    padding: 20px;
}

.form-container {
    background: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 1200px;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 30px;
    color: #333;
    text-align: center;
}

.section-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 20px;
    color: #555;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
}

.section-title {
    margin-bottom: 0;
    flex: 1;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    position: relative;
}

.filter-group label {
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
    margin-bottom: 0;
}

.filter-input {
    padding: 8px 35px 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background: #fff;
    transition: border-color 0.2s;
    min-width: 250px;
}

.filter-input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.clear-filter-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #999;
    padding: 4px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.clear-filter-btn:hover {
    background: #f0f0f0;
    color: #666;
}

.results-info {
    margin-bottom: 15px;
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #4CAF50;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.download-all-btn {
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
}

.download-all-btn:hover {
    background: #1976D2;
    transform: translateY(-1px);
}

.suppliers-list-section {
    padding: 0 10px;
}

.empty-state {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 40px 20px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px dashed #ddd;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
}

.data-table th {
    background: #f5f5f5;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.data-table td {
    color: #333;
    font-size: 0.9rem;
    vertical-align: middle;
    height: 55px;
}

.actions-col {
    width: 150px;
    text-align: center;
}

.actions-cell {
    text-align: center;
}

.name-cell {
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.gst-badge {
    background: #e3f2fd;
    color: #1976d2;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
}

.company-cell,
.contact-cell,
.email-cell,
.place-cell,
.website-cell {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.place-cell {
    max-width: 120px;
}

.place-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.address-tooltip {
    position: relative;
    cursor: pointer;
}

.address-tooltip:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
}

.tooltip-text {
    visibility: hidden;
    width: 300px;
    background-color: #333;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 8px 12px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    font-size: 0.8rem;
    white-space: normal;
    word-wrap: break-word;
}

.tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
}

.email-link {
    color: #1976d2;
    text-decoration: none;
}

.email-link:hover {
    text-decoration: underline;
}

.website-link {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 500;
}

.website-link:hover {
    text-decoration: underline;
}

.invalid-website {
    color: #f44336;
    font-weight: 500;
    cursor: help;
}

.status-cell {
    text-align: center;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.status-badge.active {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-badge.inactive {
    background: #ffebee;
    color: #c62828;
}

.inactive-row {
    background-color: #fafafa;
    opacity: 0.7;
}

/* Popup Styles */
.popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
}

.popup-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid #e0e0e0;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
}

.popup-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 5px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.close-btn:hover {
    background-color: #e0e0e0;
}

.popup-body {
    padding: 25px;
    flex: 1;
    overflow-y: auto;
}

.popup-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 20px 25px;
    border-top: 1px solid #e0e0e0;
    background: #f8f9fa;
    border-radius: 0 0 8px 8px;
}

/* Form Styles for Edit Popup */
.supplier-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.form-group {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
}

.form-group.full-width {
    flex: 2;
    min-width: 300px;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
}

.form-input,
.form-textarea {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background: #fff;
    transition: border-color 0.2s;
    font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-input.input-error {
    border-color: #f44336;
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
}

.form-textarea {
    resize: vertical;
    min-height: 80px;
}

.error-message {
    color: #f44336;
    font-size: 0.8rem;
    margin-top: 5px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
}

/* Buttons */
.btn {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
    padding: 10px 16px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.save-btn {
    background: #4CAF50;
    color: white;
}

.save-btn:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-1px);
}

.save-btn:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
}

.cancel-btn {
    background: #757575;
    color: white;
}

.cancel-btn:hover {
    background: #616161;
}

.edit-btn {
    background: #2196F3;
    color: white;
    padding: 6px 10px;
    margin-right: 5px;
}

.edit-btn:hover {
    background: #1976D2;
}

.download-btn {
    background: #FF9800;
    color: white;
    padding: 6px 10px;
    margin-right: 5px;
}

.download-btn:hover {
    background: #F57C00;
}

.danger-btn {
    background: #f44336;
    color: white;
    padding: 6px 10px;
}

.danger-btn:hover {
    background: #d32f2f;
}

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
    }

    .form-group {
        min-width: auto;
    }

    .data-table {
        display: block;
        overflow-x: auto;
    }

    .main-content {
        margin-left: 0;
        padding: 15px;
    }

    .section-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-section {
        justify-content: stretch;
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-group {
        width: 100%;
    }
    
    .filter-input {
        min-width: auto;
        width: 100%;
    }

    .results-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .actions-col {
        width: 120px;
    }

    .company-cell,
    .contact-cell,
    .email-cell,
    .place-cell,
    .website-cell {
        max-width: 120px;
    }

    .popup-content {
        width: 95%;
        max-height: 95vh;
    }

    .popup-body {
        padding: 15px;
    }

    .popup-footer {
        flex-direction: column;
    }

    .name-cell {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .place-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .tooltip-text {
        width: 250px;
        font-size: 0.7rem;
    }
}
</style>