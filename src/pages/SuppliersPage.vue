<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">Manage Suppliers</h2>

                <!-- Add/Edit Supplier Form -->
                <div class="supplier-form-section">
                    <h3 class="section-title">{{ isEditing ? 'Edit Supplier' : 'Add New Supplier' }}</h3>
                    <div class="supplier-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="supplierName">Supplier Name *</label>
                                <input type="text" id="supplierName" v-model="supplierForm.name"
                                    placeholder="Enter supplier name" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label for="companyName">Company Name</label>
                                <input type="text" id="companyName" v-model="supplierForm.company_name"
                                    placeholder="Company name" class="form-input" />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="supplierEmail">Email</label>
                                <input type="email" id="supplierEmail" v-model="supplierForm.email"
                                    @blur="validateEmail" @input="clearEmailError" placeholder="supplier@example.com"
                                    class="form-input" :class="{ 'input-error': emailError }" />
                                <div v-if="emailError" class="error-message">
                                    ❌ {{ emailError }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="contactNumber">Contact Number</label>
                                <input type="text" id="contactNumber" v-model="supplierForm.contact_number"
                                    placeholder="Phone number" class="form-input" />
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="website">Website</label>
                                <input type="url" id="website" v-model="supplierForm.website" @blur="validateWebsite"
                                    @input="clearWebsiteError" placeholder="https://example.com" class="form-input"
                                    :class="{ 'input-error': websiteError }" />
                                <div v-if="websiteError" class="error-message">
                                    ❌ {{ websiteError }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="gstNumber">GST Number</label>
                                <input type="text" id="gstNumber" v-model="supplierForm.gst_number"
                                    placeholder="GST number" class="form-input" />
                            </div>
                        </div>

                        <!-- Address and Place Fields -->
                        <div class="form-row">
                            <div class="form-group">
                                <label for="place">Place *</label>
                                <input type="text" id="place" v-model="supplierForm.place"
                                    placeholder="Enter place/city" class="form-input" />
                            </div>
                            <div class="form-group full-width">
                                <label for="address">Address *</label>
                                <textarea id="address" v-model="supplierForm.address"
                                    placeholder="Full address of the supplier" class="form-textarea"
                                    rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="status">Status</label>
                                <select id="status" v-model="supplierForm.status" class="form-input">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div class="form-group full-width">
                                <label for="note">Notes</label>
                                <textarea id="note" v-model="supplierForm.note"
                                    placeholder="Additional notes about the supplier" class="form-textarea"
                                    rows="3"></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button class="btn save-btn" @click="saveSupplier" :disabled="!canSave">
                                {{ isEditing ? '💾 Update Supplier' : '➕ Add Supplier' }}
                            </button>
                            <button v-if="isEditing" class="btn cancel-btn" @click="cancelEdit">
                                ❌ Cancel
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Suppliers List -->
                <div class="suppliers-list-section">
                    <h3 class="section-title">Existing Suppliers</h3>
                    <div v-if="suppliers.length === 0" class="empty-state">
                        No suppliers added yet. Add your first supplier above.
                    </div>
                    <div v-else class="suppliers-table">
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
                                <tr v-for="supplier in sortedSuppliers" :key="supplier.id"
                                    :class="{ 'inactive-row': supplier.status === 'inactive' }">
                                    <td class="name-cell">
                                        <strong>{{ supplier.name }}</strong>
                                        <span v-if="supplier.gst_number" class="gst-badge">GST</span>
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
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Supplier data
const suppliers = ref([]);
const isEditing = ref(false);
const editingId = ref(null);
const websiteError = ref("");

// Popup state
const showEditPopup = ref(false);

// Supplier form
const supplierForm = reactive({
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
const emailError = ref("");
const editEmailError = ref("");
const websiteEditError = ref("");
const editWebsiteError = ref("");

// Computed property for save button
const canSave = computed(() => {
    const hasRequiredFields = supplierForm.name.trim() &&
        supplierForm.place.trim() &&
        supplierForm.address.trim();

    const hasValidWebsite = !supplierForm.website || isValidWebsite(supplierForm.website);

    return hasRequiredFields && hasValidWebsite;
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

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate email on blur
const validateEmail = () => {
    if (!supplierForm.email) {
        emailError.value = "";
        return;
    }

    if (!isValidEmail(supplierForm.email)) {
        emailError.value = "Please enter a valid email address (e.g., example@domain.com)";
    } else {
        emailError.value = "";
    }
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

// Clear email error when user starts typing
const clearEmailError = () => {
    if (emailError.value) {
        emailError.value = "";
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

    // Check if URL starts with http:// or https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return false;
    }

    // Basic URL validation with domain extension check
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // Check if hostname has a valid domain extension
        // This regex checks for domain with at least 2 characters after the last dot
        const domainRegex = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

        // Remove 'www.' if present and check the domain
        const cleanHostname = hostname.replace(/^www\./, '');

        return domainRegex.test(cleanHostname);
    } catch {
        return false;
    }
};

// Validate website on blur
const validateWebsite = () => {
    if (!supplierForm.website) {
        websiteError.value = "";
        return;
    }

    if (!isValidWebsite(supplierForm.website)) {
        websiteError.value = "Please enter a valid website URL (e.g., https://example.com)";
    } else {
        websiteError.value = "";
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

// Clear website error when user starts typing
const clearWebsiteError = () => {
    if (websiteError.value) {
        websiteError.value = "";
    }
};

// Clear edit website error when user starts typing
const clearEditWebsiteError = () => {
    if (editWebsiteError.value) {
        editWebsiteError.value = "";
    }
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

// Save supplier (add or update)
const saveSupplier = async () => {
    if (!supplierForm.name.trim()) {
        alert("Please enter supplier name!");
        return;
    }

    if (!supplierForm.place.trim()) {
        alert("Please enter supplier place!");
        return;
    }

    if (!supplierForm.address.trim()) {
        alert("Please enter supplier address!");
        return;
    }

    // Final website validation before saving
    if (supplierForm.website && !isValidWebsite(supplierForm.website)) {
        websiteError.value = "Please enter a valid website URL (e.g., https://example.com)";
        alert("Please fix the website URL before saving!");
        return;
    }

    try {
        const supplierData = {
            name: supplierForm.name.trim(),
            email: supplierForm.email.trim() || null,
            contact_number: supplierForm.contact_number.trim() || null,
            company_name: supplierForm.company_name.trim() || null,
            website: supplierForm.website.trim() || null,
            note: supplierForm.note.trim() || null,
            status: supplierForm.status,
            gst_number: supplierForm.gst_number.trim() || null,
            place: supplierForm.place.trim(),
            address: supplierForm.address.trim()
        };

        if (isEditing.value) {
            // Update existing supplier
            await axios.put(`/suppliers/${editingId.value}/`, supplierData);
            alert("Supplier updated successfully!");
        } else {
            // Add new supplier
            await axios.post("/suppliers/", supplierData);
            alert("Supplier added successfully!");
        }

        // Reset form and reload suppliers
        resetForm();
        await loadSuppliers();

    } catch (error) {
        console.error("Error saving supplier:", error);
        alert("Error saving supplier!");
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

// Edit supplier (for the main form)
const editSupplier = (supplier) => {
    isEditing.value = true;
    editingId.value = supplier.id;

    // Fill form with supplier data
    supplierForm.name = supplier.name;
    supplierForm.email = supplier.email || "";
    supplierForm.contact_number = supplier.contact_number || "";
    supplierForm.company_name = supplier.company_name || "";
    supplierForm.website = supplier.website || "";
    supplierForm.note = supplier.note || "";
    supplierForm.status = supplier.status;
    supplierForm.gst_number = supplier.gst_number || "";
    supplierForm.place = supplier.place || "";
    supplierForm.address = supplier.address || "";

    // Clear any existing website error when editing
    websiteError.value = "";
};

// Cancel edit
const cancelEdit = () => {
    resetForm();
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

// Reset form
const resetForm = () => {
    isEditing.value = false;
    editingId.value = null;
    supplierForm.name = "";
    supplierForm.email = "";
    supplierForm.contact_number = "";
    supplierForm.company_name = "";
    supplierForm.website = "";
    supplierForm.note = "";
    supplierForm.status = "active";
    supplierForm.gst_number = "";
    supplierForm.place = "";
    supplierForm.address = "";
    websiteError.value = "";
};
</script>

<style scoped>
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

/* Supplier Form */
.supplier-form-section {
    margin-bottom: 40px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

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

.form-input.input-error:focus {
    border-color: #f44336;
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
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

.form-actions {
    display: flex;
    gap: 12px;
    align-items: center;
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

.danger-btn {
    background: #f44336;
    color: white;
    padding: 6px 10px;
}

.danger-btn:hover {
    background: #d32f2f;
}

/* Suppliers List */
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
}

.actions-col {
    width: 120px;
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

    .form-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .btn {
        text-align: center;
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
}
</style>