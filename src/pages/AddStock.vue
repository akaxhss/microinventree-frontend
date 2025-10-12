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
                        <el-select v-model="selectedSupplier" filterable placeholder="Select Supplier" class="w-full"
                            :disabled="loading" clearable>
                            <el-option v-for="s in sortedSuppliers" :key="s.id"
                                :label="`${s.name} (${s.place || 'No place'})`" :value="s.id" />
                        </el-select>
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
                                    <el-select v-model="item.productId" @change="onProductChange(idx)" filterable
                                        placeholder="Select Product" class="w-full" :disabled="loading" clearable>
                                        <el-option v-for="p in sortedProducts" :key="p.id" :label="p.name"
                                            :value="p.id" />
                                    </el-select>
                                </td>
                                <td>
                                    <el-select v-model="item.sizeId" filterable placeholder="Select Size" class="w-full"
                                        :disabled="loading" clearable>
                                        <el-option v-for="s in sortedSizes" :key="s.id" :label="s.display_name"
                                            :value="s.id" />
                                    </el-select>
                                </td>
                                <td>
                                    <el-select v-model="item.colorId" @change="onColorChange(idx)" filterable
                                        placeholder="Select Color" class="w-full" :disabled="loading" clearable>
                                        <el-option v-for="c in sortedColors" :key="c.id" :label="c.name"
                                            :value="c.id" />
                                    </el-select>
                                </td>
                                <td class="quantity-col">
                                    <input type="number" v-model="item.quantity" min="1" class="quantity-input"
                                        @input="validateQuantity(idx)" :disabled="loading" />
                                </td>
                                <td class="action-col">
                                    <button class="btn danger" @click="removeItem(idx)" :disabled="loading">❌</button>
                                </td>
                            </tr>
                            <tr v-if="!isLastRowComplete">
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
import { ref, computed, onMounted, watch, nextTick } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Element Plus components
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/dist/index.css';

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

// Computed properties for sorted data
const sortedSuppliers = computed(() => {
    return [...suppliers.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedSizes = computed(() => {
    // Define custom size order for better sorting
    const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, 'XXXL': 6 };
    return [...sizes.value].sort((a, b) => {
        const orderA = sizeOrder[a.display_name] || 999;
        const orderB = sizeOrder[b.display_name] || 999;
        return orderA - orderB;
    });
});

const sortedColors = computed(() => {
    return [...colors.value].sort((a, b) => a.name.localeCompare(b.name));
});

const totalQuantity = computed(() =>
    stockItems.value.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)
);

// Check if last row is complete (all fields filled)
const isLastRowComplete = computed(() => {
    const lastItem = stockItems.value[stockItems.value.length - 1];
    return lastItem.productId && lastItem.sizeId && lastItem.colorId && lastItem.quantity > 0;
});

const canSave = computed(() => {
    // Check if supplier is selected
    if (!selectedSupplier.value) return false;

    // Only consider rows that have actual data (not empty rows)
    const validRows = stockItems.value.filter(item =>
        item.productId && item.sizeId && item.colorId && item.quantity > 0
    );

    // Must have at least one valid row
    if (validRows.length === 0) return false;

    // Check if there are any incomplete rows that have started but not finished
    const hasIncompleteRows = stockItems.value.some(item =>
        // A row is incomplete if it has any field filled but not all required fields
        (item.productId || item.sizeId || item.colorId || item.quantity > 0) &&
        (!item.productId || !item.sizeId || !item.colorId || item.quantity === 0)
    );

    // If there are incomplete rows, disable save
    if (hasIncompleteRows) return false;

    return true;
});

const hasFormData = computed(() => {
    return selectedSupplier.value || stockItems.value.some(item =>
        item.productId && item.sizeId && item.colorId && item.quantity > 0
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
        quantity: 0
    };
}

// Draft Management Functions
const saveDraft = () => {
    // Only save valid rows to draft
    const validItems = stockItems.value.filter(item =>
        item.productId && item.sizeId && item.colorId && item.quantity > 0
    );

    const draftData = {
        selectedSupplier: selectedSupplier.value,
        stockItems: validItems.length > 0 ? validItems.map(item => ({
            productId: item.productId,
            sizeId: item.sizeId,
            colorId: item.colorId,
            quantity: item.quantity
        })) : [],
        timestamp: new Date().toISOString()
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    draftTimestamp.value = draftData.timestamp;

    console.log('Stock draft saved successfully');
};

const loadDraft = () => {
    try {
        const draftData = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draftData) {
            selectedSupplier.value = draftData.selectedSupplier || "";

            // Restore basic item data - ensure we have at least one row
            if (draftData.stockItems && draftData.stockItems.length > 0) {
                stockItems.value = draftData.stockItems.map(itemData => ({
                    ...createEmptyItem(),
                    ...itemData
                }));
            } else {
                stockItems.value = [createEmptyItem()];
            }

            draftTimestamp.value = draftData.timestamp;

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

// Watch for changes to auto-save - Only save when there's actual form data
watch([selectedSupplier, stockItems], () => {
    const hasRealData = selectedSupplier.value || stockItems.value.some(item =>
        item.productId && item.sizeId && item.colorId && item.quantity > 0
    );

    if (hasRealData) {
        autoSaveDraft();
    }
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

// Product change handler
const onProductChange = (idx) => {
    console.log(`Product changed for row ${idx + 1}`);

    // Auto-add new row if this is the last row and product is selected
    const currentItem = stockItems.value[idx];
    if (idx === stockItems.value.length - 1 && currentItem.productId) {
        // Wait a bit for the current selection to settle, then add new row
        setTimeout(() => {
            addNewRow();
        }, 300);
    }
};

// Color change handler with automatic row addition
const onColorChange = (idx) => {
    // If this is the last row and all fields are filled, add a new row
    const currentItem = stockItems.value[idx];
    if (idx === stockItems.value.length - 1 &&
        currentItem.productId &&
        currentItem.sizeId &&
        currentItem.colorId &&
        currentItem.quantity > 0) {

        // Wait a bit for the current selection to settle, then add new row
        setTimeout(() => {
            addNewRow();
        }, 300);
    }
};

// Add new row
const addNewRow = () => {
    // Only add new row if the last row is not empty
    const lastItem = stockItems.value[stockItems.value.length - 1];
    if (lastItem.productId || lastItem.sizeId || lastItem.colorId || lastItem.quantity > 0) {
        stockItems.value.push(createEmptyItem());

        // Scroll to the new row
        nextTick(() => {
            const tableWrapper = document.querySelector('.table-wrapper');
            if (tableWrapper) {
                tableWrapper.scrollTop = tableWrapper.scrollHeight;
            }
        });
    } else {
        console.log('Not adding new row - last row is empty');
    }
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

// Validate quantity
const validateQuantity = (idx) => {
    const item = stockItems.value[idx];
    if (item.quantity < 0) {
        item.quantity = 0;
    }
};

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
};

// Save Stock - Only send valid rows
const saveStock = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

    loading.value = true;
    try {
        // Filter only valid rows (with all fields filled and quantity > 0)
        const validItems = stockItems.value.filter(item =>
            item.productId && item.sizeId && item.colorId && item.quantity > 0
        );

        console.log('Saving valid items:', validItems);

        if (validItems.length === 0) {
            alert("No valid items to save!");
            return;
        }

        // Send only valid items to the API
        const promises = validItems.map(item =>
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

        alert(`Stock added successfully! ${validItems.length} item(s) saved.`);
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

.form-group :deep(.el-select) {
    width: 100%;
}

.form-group :deep(.el-input__inner) {
    height: 40px !important;
    border-radius: 4px !important;
}

.table-wrapper {
    margin: 20px 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    max-height: 600px;
    overflow-y: auto;
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

.stock-table :deep(.el-select) {
    width: 100%;
}

.stock-table :deep(.el-input__inner) {
    height: 36px !important;
    border-radius: 4px !important;
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

/* Element Plus custom styles */
:deep(.el-select) {
    --el-select-input-focus-border-color: #409eff;
}

:deep(.el-select .el-input__inner:focus) {
    border-color: #409eff;
}

:deep(.el-select-dropdown) {
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-select-dropdown__item) {
    padding: 8px 12px;
}

:deep(.el-select-dropdown__item.hover) {
    background-color: #f5f7fa;
}

:deep(.el-select-dropdown__item.selected) {
    background-color: #409eff;
    color: white;
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

    .main-content {
        margin-left: 0;
        padding: 10px;
    }
}
</style>