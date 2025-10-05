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
                                    placeholder="supplier@example.com" class="form-input" />
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
                                <input type="url" id="website" v-model="supplierForm.website"
                                    placeholder="https://example.com" class="form-input" />
                            </div>
                            <div class="form-group">
                                <label for="gstNumber">GST Number</label>
                                <input type="text" id="gstNumber" v-model="supplierForm.gst_number"
                                    placeholder="GST number" class="form-input" />
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
                            <button class="btn save-btn" @click="saveSupplier" :disabled="!supplierForm.name">
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
                                    <th>Contact</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th class="actions-col">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="supplier in suppliers" :key="supplier.id"
                                    :class="{ 'inactive-row': supplier.status === 'inactive' }">
                                    <td class="name-cell">
                                        <strong>{{ supplier.name }}</strong>
                                        <span v-if="supplier.gst_number" class="gst-badge">GST</span>
                                    </td>
                                    <td class="company-cell">
                                        {{ supplier.company_name || '-' }}
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
                                    <td class="status-cell">
                                        <span class="status-badge" :class="supplier.status">
                                            {{ supplier.status === 'active' ? '✅ Active' : '❌ Inactive' }}
                                        </span>
                                    </td>
                                    <td class="actions-cell">
                                        <button class="btn edit-btn" @click="editSupplier(supplier)">
                                            ✏️
                                        </button>
                                        <button class="btn danger-btn" @click="deleteSupplier(supplier.id)">
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
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Supplier data
const suppliers = ref([]);
const isEditing = ref(false);
const editingId = ref(null);

// Supplier form
const supplierForm = reactive({
    name: "",
    email: "",
    contact_number: "",
    company_name: "",
    website: "",
    note: "",
    status: "active",
    gst_number: ""
});

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

    try {
        const supplierData = {
            name: supplierForm.name.trim(),
            email: supplierForm.email.trim() || null,
            contact_number: supplierForm.contact_number.trim() || null,
            company_name: supplierForm.company_name.trim() || null,
            website: supplierForm.website.trim() || null,
            note: supplierForm.note.trim() || null,
            status: supplierForm.status,
            gst_number: supplierForm.gst_number.trim() || null
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

// Edit supplier
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

.form-textarea {
    resize: vertical;
    min-height: 80px;
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
.email-cell {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.email-link {
    color: #1976d2;
    text-decoration: none;
}

.email-link:hover {
    text-decoration: underline;
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
}
</style>