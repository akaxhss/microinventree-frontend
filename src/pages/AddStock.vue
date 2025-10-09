<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">➕ Add Stock</h2>

                <!-- Loading Overlay -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>Saving Stock...</p>
                        <p class="loading-subtext">Please wait while we process your request</p>
                    </div>
                </div>

                <!-- Draft Management -->
                <div class="draft-banner" v-if="hasDraft">
                    <div class="draft-info">
                        <span>📋 Draft found from {{ formatDate(draftTimestamp) }}</span>
                        <div class="draft-actions">
                            <button class="btn draft-load" @click="loadDraft" :disabled="loading">🔄 Load Draft</button>
                            <button class="btn draft-discard" @click="discardDraft" :disabled="loading">🗑️
                                Discard</button>
                        </div>
                    </div>
                </div>

                <!-- Supplier Selection -->
                <div class="form-row">
                    <div class="form-group">
                        <label>Supplier</label>
                        <select v-model="selectedSupplier" :disabled="loading">
                            <option value="">-- Select Supplier --</option>
                            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
                        </select>
                    </div>
                </div>

                <!-- Stock Items Table -->
                <div class="table-wrapper">
                    <table class="stock-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Size</th>
                                <th>Color</th>
                                <th class="quantity-col">QTY</th>
                                <th class="action-col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in stockItems" :key="idx">
                                <td class="index-col">{{ idx + 1 }}</td>
                                <td>
                                    <select v-model="item.productId" @change="onProductChange(idx)" :disabled="loading">
                                        <option value="">-- Select Product --</option>
                                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.sizeId" :disabled="loading">
                                        <option value="">-- Select Size --</option>
                                        <option v-for="s in sizes" :key="s.id" :value="s.id">{{ s.display_name }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.colorId" :disabled="loading">
                                        <option value="">-- Select Color --</option>
                                        <option v-for="c in colors" :key="c.id" :value="c.id">{{ c.name }}</option>
                                    </select>
                                </td>
                                <td class="quantity-col">
                                    <input type="number" v-model="item.quantity" min="1" class="quantity-input"
                                        @input="autoSaveDraft" :disabled="loading" />
                                </td>
                                <td class="action-col">
                                    <button class="btn danger" @click="removeItem(idx)" :disabled="loading">❌</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="6" class="add-row">
                                    <button class="btn add-row-btn" @click="addNewRow" :disabled="loading">➕ Add New
                                        Row</button>
                                </td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4"><strong>Total</strong></td>
                                <td colspan="2"><strong>{{ totalQuantity }} QTY</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Save/Reset Buttons -->
                <div class="form-actions">
                    <button class="btn draft" @click="manualSaveDraft" :disabled="!hasFormData || loading">💾 Save
                        Draft</button>
                    <button class="btn save" @click="saveStock" :disabled="!canSave || loading">
                        <span v-if="loading">⏳ Saving...</span>
                        <span v-else>Save to Database</span>
                    </button>
                    <button class="btn reset" @click="resetForm" :disabled="loading">🔄 Reset</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Form State
const selectedSupplier = ref("");

// Data
const suppliers = ref([]);
const products = ref([]);
const sizes = ref([]);
const colors = ref([]);
const stockItems = ref([createEmptyItem()]);

// Loading state
const loading = ref(false);

// Draft Management
const draftTimestamp = ref(null);
const DRAFT_KEY = 'stock_form_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds
let autoSaveTimeout = null;

// Computed
const totalQuantity = computed(() =>
    stockItems.value.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)
);

const canSave = computed(() => {
    return selectedSupplier.value &&
        stockItems.value.length > 0 &&
        stockItems.value.every(item =>
            item.productId && item.sizeId && item.colorId && item.quantity > 0
        );
});

const hasFormData = computed(() => {
    return selectedSupplier.value || stockItems.value.some(item =>
        item.productId || item.sizeId || item.colorId || item.quantity > 1
    );
});

const hasDraft = computed(() => {
    return localStorage.getItem(DRAFT_KEY) !== null;
});

// Create empty item
function createEmptyItem() {
    return {
        productId: "",
        sizeId: "",
        colorId: "",
        quantity: 1
    };
}

// Draft Management Functions
const saveDraft = () => {
    const draftData = {
        selectedSupplier: selectedSupplier.value,
        stockItems: stockItems.value,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    draftTimestamp.value = draftData.timestamp;

    console.log('Draft saved successfully');
};

const loadDraft = () => {
    try {
        const draftData = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draftData) {
            selectedSupplier.value = draftData.selectedSupplier || "";
            stockItems.value = draftData.stockItems || [createEmptyItem()];
            draftTimestamp.value = draftData.timestamp;

            // Ensure we have at least one row
            if (stockItems.value.length === 0) {
                stockItems.value = [createEmptyItem()];
            }

            alert('Draft loaded successfully!');
        }
    } catch (error) {
        console.error('Error loading draft:', error);
        alert('Error loading draft. The draft data might be corrupted.');
    }
};

const discardDraft = () => {
    if (confirm('Are you sure you want to discard the saved draft? This action cannot be undone.')) {
        localStorage.removeItem(DRAFT_KEY);
        draftTimestamp.value = null;
        alert('Draft discarded successfully!');
    }
};

const autoSaveDraft = () => {
    // Clear existing timeout
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save
    autoSaveTimeout = setTimeout(() => {
        if (hasFormData.value) {
            saveDraft();
        }
    }, AUTO_SAVE_DELAY);
};

const manualSaveDraft = () => {
    if (hasFormData.value) {
        saveDraft();
        alert('Draft saved successfully!');
    } else {
        alert('No form data to save as draft.');
    }
};

const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    draftTimestamp.value = null;
};


watch([selectedSupplier, stockItems], () => {
    autoSaveDraft();
}, { deep: true });

// API Calls
onMounted(async () => {
    await Promise.all([
        loadSuppliers(),
        loadProducts(),
        loadSizes(),
        loadColors()
    ]);

    // Check for existing draft on component mount
    checkForDraft();
});

const checkForDraft = () => {
    if (hasDraft.value) {
        try {
            const draftData = JSON.parse(localStorage.getItem(DRAFT_KEY));
            draftTimestamp.value = draftData.timestamp;

        } catch (error) {
            console.error('Error checking draft:', error);
            // If draft is corrupted, remove it
            localStorage.removeItem(DRAFT_KEY);
        }
    }
};

const loadSuppliers = async () => {
    try {
        const res = await axios.get("/suppliers/");
        suppliers.value = res.data;
    } catch (error) {
        console.error("Error loading suppliers:", error);
    }
};

const loadProducts = async () => {
    try {
        const res = await axios.get("/products/");
        products.value = res.data;
    } catch (error) {
        console.error("Error loading products:", error);
    }
};

const loadSizes = async () => {
    try {
        const res = await axios.get("/sizes/");
        sizes.value = res.data;
    } catch (error) {
        console.error("Error loading sizes:", error);
    }
};

const loadColors = async () => {
    try {
        const res = await axios.get("/colors/");
        colors.value = res.data;
    } catch (error) {
        console.error("Error loading colors:", error);
    }
};

// Add new row
const addNewRow = () => {
    stockItems.value.push(createEmptyItem());
};

// Remove item
const removeItem = (idx) => {
    if (stockItems.value.length > 1) {
        stockItems.value.splice(idx, 1);
    } else {
        // If it's the last row, just reset it
        stockItems.value[0] = createEmptyItem();
    }
};

// Product change handler
const onProductChange = (idx) => {
    console.log(`Product changed for row ${idx + 1}`);
};

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
};

// Save Stock
const saveStock = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

    loading.value = true;
    try {
        // Send each item individually to the API
        const promises = stockItems.value.map(item =>
            axios.post("/addstock/", {
                product_id: item.productId,
                color_id: item.colorId,
                size_id: item.sizeId,
                supplier_id: selectedSupplier.value,
                quantity: item.quantity
            })
        );

        await Promise.all(promises);

        // Clear draft after successful save
        clearDraft();

        alert("Stock added successfully!");
        resetForm();
    } catch (err) {
        console.error("Error saving stock:", err);
        alert("Error adding stock! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

// Reset form
const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? Any unsaved changes will be lost.')) {
        selectedSupplier.value = "";
        stockItems.value = [createEmptyItem()];
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
    position: relative;
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #333;
}

/* Loading Overlay */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    border-radius: 8px;
}

.loading-content {
    text-align: center;
    padding: 30px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;
}

.loading-spinner {
    border: 4px solid #f3f4f6;
    border-left: 4px solid #3b82f6;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-content p {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 8px 0;
}

.loading-subtext {
    font-size: 0.9rem !important;
    font-weight: normal !important;
    color: #6b7280 !important;
    margin: 0 !important;
}

/* Draft Banner */
.draft-banner {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 20px;
}

.draft-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.draft-info span {
    color: #856404;
    font-weight: 500;
}

.draft-actions {
    display: flex;
    gap: 8px;
}

.btn.draft-load {
    background: #17a2b8;
    color: white;
    padding: 6px 12px;
    font-size: 0.8rem;
}

.btn.draft-discard {
    background: #6c757d;
    color: white;
    padding: 6px 12px;
    font-size: 0.8rem;
}

.btn.draft {
    background: #17a2b8;
    color: white;
}

.form-row {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
    flex: 1;
    min-width: 250px;
}

.form-group label {
    margin-bottom: 5px;
    font-weight: 600;
    color: #555;
    font-size: 0.85rem;
}

.form-group select,
.form-group input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;
    background: #fff;
}

.table-wrapper {
    margin: 20px 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.stock-table {
    width: 100%;
    border-collapse: collapse;
}

.stock-table th,
.stock-table td {
    border: 1px solid #e0e0e0;
    padding: 12px 8px;
    text-align: center;
    font-size: 0.9rem;
}

.stock-table th {
    background: #f5f5f5;
    font-weight: 600;
    color: #555;
}

.stock-table td {
    color: #333;
}

/* Compact columns */
.index-col {
    width: 50px;
}

.quantity-col {
    width: 80px;
}

.action-col {
    width: 70px;
}

.stock-table select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.85rem;
}

.quantity-input {
    width: 60px;
    padding: 6px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.85rem;
}

.add-row {
    text-align: left;
    background: #f9f9f9;
    padding: 8px 12px;
}

.add-row-btn {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 2px 6px !important;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.65rem !important;
    display: block;
    margin-left: 0;
    margin-right: auto;
    width: fit-content;
}

.add-row-btn:hover {
    background: #45a049;
}

.total-row {
    background: #f9f9f9;
    font-weight: 600;
}

.total-row td {
    padding: 12px;
}

.form-actions {
    margin-top: 25px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
    position: relative;
}

.btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.btn.save {
    background: #4CAF50;
    color: #fff;
}

.btn.reset {
    background: #757575;
    color: #fff;
}

.btn.danger {
    background: #f44336;
    color: #fff;
    padding: 6px 8px;
    border-radius: 3px;
    font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        text-align: center;
    }

    .draft-info {
        flex-direction: column;
        align-items: flex-start;
    }

    .draft-actions {
        width: 100%;
        justify-content: flex-start;
    }
}
</style>