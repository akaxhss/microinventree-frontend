<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <div class="page-header">
                    <h2 class="page-title">Add New Supplier</h2>
                    <router-link to="/listviewsupplier" class="btn back-btn">
                        ← Back to Suppliers List
                    </router-link>
                </div>

                <!-- Add Supplier Form -->
                <div class="supplier-form-section">
                    <h3 class="section-title">Supplier Details</h3>
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
                                ➕ Add Supplier
                            </button>
                            <router-link to="/listviewsupplier" class="btn cancel-btn">
                                ❌ Cancel
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

const router = useRouter();

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

// Validation errors
const emailError = ref("");
const websiteError = ref("");

// Computed property for save button
const canSave = computed(() => {
    const hasRequiredFields = supplierForm.name.trim() &&
        supplierForm.place.trim() &&
        supplierForm.address.trim();

    const hasValidWebsite = !supplierForm.website || isValidWebsite(supplierForm.website);

    return hasRequiredFields && hasValidWebsite;
});

// Email validation function
const isValidEmail = (email) => {
    if (!email) return true; // Empty is valid (optional field)
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

// Clear email error when user starts typing
const clearEmailError = () => {
    if (emailError.value) {
        emailError.value = "";
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

// Clear website error when user starts typing
const clearWebsiteError = () => {
    if (websiteError.value) {
        websiteError.value = "";
    }
};

// Save supplier
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

        // Add new supplier
        await axios.post("/suppliers/", supplierData);
        alert("Supplier added successfully!");

        // Redirect to suppliers list
        router.push('/listviewsupplier');

    } catch (error) {
        console.error("Error saving supplier:", error);
        alert("Error saving supplier!");
    }
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
    max-width: 800px;
    margin: 0 auto;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin: 0;
}

.back-btn {
    background: #757575;
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

.back-btn:hover {
    background: #616161;
    transform: translateY(-1px);
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
    justify-content: flex-start;
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

/* Responsive */
@media (max-width: 768px) {
    .form-row {
        flex-direction: column;
    }

    .form-group {
        min-width: auto;
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

    .page-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>