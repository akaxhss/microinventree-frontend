<template>
    <div class="layout">
        <Sidebar />

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

                <!-- Draft Banner -->
                <div class="draft-banner" v-if="hasDraft">
                    <div class="draft-info">
                        <span>📋 Draft found from {{ formatDate(draftTimestamp) }}</span>
                        <div class="draft-actions">
                            <button class="btn draft-load" @click="loadDraft" :disabled="loading">🔄 Load Draft</button>
                            <button class="btn draft-discard" @click="discardDraft" :disabled="loading">🗑️ Discard</button>
                        </div>
                    </div>
                </div>

                <!-- Supplier -->
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

                <!-- Stock Table -->
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
                                    <el-select v-model="item.productId" filterable
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

                <!-- Invoice Section -->
                <div class="form-row invoice-section">
    <div class="form-group invoice-number-box">
        <label>Invoice Number <span class="required">*</span></label>
        <input type="text" v-model="invoiceNumber" placeholder="Enter Invoice Number"
            class="invoice-input" :disabled="loading" />
    </div>
    <div class="form-group date-picker-box">
        <label>Invoice Date <span class="required">*</span></label>
        <el-date-picker
            v-model="invoiceDate"
            type="date"
            placeholder="Select invoice date"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            :disabled="loading"
            class="invoice-input"
        />
    </div>
</div>

                <!-- Buttons -->
                <div class="form-actions">
                    <button class="btn draft" @click="manualSaveDraft" :disabled="!hasFormData || loading">💾 Save
                        Draft</button>
                    <button class="btn save" @click="saveStock" :disabled="!canSave || loading || !invoiceNumber || !invoiceDate">
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
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/dist/index.css';
import { ElDatePicker } from 'element-plus';

// ---- FORM STATE ----
const selectedSupplier = ref("");
const invoiceNumber = ref("");
const invoiceDate = ref("");

// ---- DATA ----
const suppliers = ref([]);
const products = ref([]);
const sizes = ref([]);
const colors = ref([]);
const stockItems = ref([createEmptyItem()]);

// ---- STATE ----
const loading = ref(false);
const draftTimestamp = ref(null);
const DRAFT_KEY = "stock_form_draft";
const AUTO_SAVE_DELAY = 2000;
let autoSaveTimeout = null;

// ---- COMPUTED ----
const sortedSuppliers = computed(() => [...suppliers.value].sort((a, b) => a.name.localeCompare(b.name)));
const sortedProducts = computed(() => [...products.value].sort((a, b) => a.name.localeCompare(b.name)));
const sortedSizes = computed(() => {
    const order = { S: 1, M: 2, L: 3, XL: 4, XXL: 5, XXXL: 6 };
    return [...sizes.value].sort((a, b) => (order[a.display_name] || 999) - (order[b.display_name] || 999));
});
const sortedColors = computed(() => [...colors.value].sort((a, b) => a.name.localeCompare(b.name)));
const totalQuantity = computed(() => stockItems.value.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0));

const isLastRowComplete = computed(() => {
    const last = stockItems.value[stockItems.value.length - 1];
    return last.productId && last.sizeId && last.colorId && last.quantity > 0;
});

const canSave = computed(() => {
    if (!selectedSupplier.value) return false;
    const valid = stockItems.value.filter(i => i.productId && i.sizeId && i.colorId && i.quantity > 0);
    if (!valid.length) return false;
    const incomplete = stockItems.value.some(i =>
        (i.productId || i.sizeId || i.colorId || i.quantity > 0) &&
        (!i.productId || !i.sizeId || !i.colorId || i.quantity === 0)
    );
    return !incomplete;
});

const hasFormData = computed(() =>
    selectedSupplier.value ||
    stockItems.value.some(i => i.productId && i.sizeId && i.colorId && i.quantity > 0) ||
    invoiceNumber.value || invoiceDate.value
);

const hasDraft = computed(() => localStorage.getItem(DRAFT_KEY) !== null);

// ---- HELPERS ----
function createEmptyItem() {
    return { productId: "", sizeId: "", colorId: "", quantity: 0 };
}

// ---- DRAFT ----
const saveDraft = () => {
    const validItems = stockItems.value.filter(i => i.productId && i.sizeId && i.colorId && i.quantity > 0);
    const draft = {
        selectedSupplier: selectedSupplier.value,
        invoiceNumber: invoiceNumber.value,
        invoiceDate: invoiceDate.value,
        stockItems: validItems.map(i => ({ ...i })),
        timestamp: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    draftTimestamp.value = draft.timestamp;
};

const loadDraft = () => {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!draft) return;

    selectedSupplier.value = draft.selectedSupplier || "";
    invoiceNumber.value = draft.invoiceNumber || "";
    invoiceDate.value = draft.invoiceDate || "";

    // Restore saved items
    stockItems.value = draft.stockItems?.length ? draft.stockItems.map(item => ({ ...item })) : [createEmptyItem()];

   
    if (stockItems.value.length === 0 || isLastRowComplete.value) {
        stockItems.value.push(createEmptyItem());
    }

    draftTimestamp.value = draft.timestamp;
    alert("Draft loaded successfully!");
};


const discardDraft = () => {
    if (confirm("Discard the saved draft?")) {
        localStorage.removeItem(DRAFT_KEY);
        draftTimestamp.value = null;
    }
};

const autoSaveDraft = () => {
    clearTimeout(autoSaveTimeout);
    if (hasFormData.value) {
        autoSaveTimeout = setTimeout(saveDraft, AUTO_SAVE_DELAY);
    }
};

const manualSaveDraft = () => {
    if (hasFormData.value) {
        saveDraft();
        alert("Draft saved successfully!");
    } else alert("No data to save.");
};

const clearDraft = () => localStorage.removeItem(DRAFT_KEY);

// ---- API ----
onMounted(async () => {
    await Promise.all([loadSuppliers(), loadProducts(), loadSizes(), loadColors()]);
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) draftTimestamp.value = JSON.parse(draft).timestamp;
});

watch([selectedSupplier, stockItems, invoiceNumber, invoiceDate], autoSaveDraft, { deep: true });

const loadSuppliers = async () => {
    try {
        const res = await axios.get("/suppliers/");
        suppliers.value = res.data;
    } catch (e) { console.error(e); }
};
const loadProducts = async () => {
    try {
        const res = await axios.get("/products/");
        products.value = res.data;
    } catch (e) { console.error(e); }
};
const loadSizes = async () => {
    try {
        const res = await axios.get("/sizes/");
        sizes.value = res.data;
    } catch (e) { console.error(e); }
};
const loadColors = async () => {
    try {
        const res = await axios.get("/colors/");
        colors.value = res.data;
    } catch (e) { console.error(e); }
};

// ---- EVENTS ----
const onColorChange = (idx) => {
    // Only add new row if this is the last row and color is selected
    if (idx === stockItems.value.length - 1 && stockItems.value[idx].colorId) {
        setTimeout(() => {
            addNewRowWithProduct(idx);
        }, 300);
    }
};

const addNewRowWithProduct = (previousRowIndex) => {
    const previousRow = stockItems.value[previousRowIndex];
    const newRow = createEmptyItem();
    
    // Copy the product from the previous row
    if (previousRow.productId) {
        newRow.productId = previousRow.productId;
    }
    
    stockItems.value.push(newRow);
};

const addNewRow = () => {
    const last = stockItems.value[stockItems.value.length - 1];
    if (last.productId || last.sizeId || last.colorId || last.quantity > 0) {
        const newRow = createEmptyItem();
        
        // Copy the product from the previous row when manually adding
        if (last.productId) {
            newRow.productId = last.productId;
        }
        
        stockItems.value.push(newRow);
    }
};

const removeItem = (i) => stockItems.value.length > 1 ? stockItems.value.splice(i, 1) : stockItems.value[0] = createEmptyItem();
const validateQuantity = (i) => { if (stockItems.value[i].quantity < 0) stockItems.value[i].quantity = 0; };
const formatDate = (d) => d ? new Date(d).toLocaleString() : "";

// ---- SAVE STOCK ----
const saveStock = async () => {
    if (!canSave.value || !invoiceNumber.value || !invoiceDate.value) {
        alert("Please fill all fields including invoice details!");
        return;
    }
    loading.value = true;
    try {
        const valid = stockItems.value.filter(i => i.productId && i.sizeId && i.colorId && i.quantity > 0);
        const promises = valid.map(i =>
            axios.post("/addstock/", {
                product_id: i.productId,
                color_id: i.colorId,
                size_id: i.sizeId,
                supplier_id: selectedSupplier.value,
                quantity: i.quantity,
                invoice_number: invoiceNumber.value,
                invoice_date: invoiceDate.value,
            })
        );
        await Promise.all(promises);
        clearDraft();
        alert(`Stock added successfully! ${valid.length} item(s) saved.`);
        resetForm();
    } catch (err) {
        console.error(err);
        alert("Error adding stock!");
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    if (confirm("Reset form? Unsaved changes will be lost.")) {
        selectedSupplier.value = "";
        invoiceNumber.value = "";
        invoiceDate.value = "";
        stockItems.value = [createEmptyItem()];
    }
};
</script> 

<style scoped>
.invoice-section {
    display: flex;
    justify-content: flex-start;
    gap: 40px; 
    align-items: flex-end;
    flex-wrap: wrap;
    margin: 15px 0 25px 0;
    background: #f9fafb;
    padding: 20px 25px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    max-width: 100%;
}

.invoice-number-box {
    flex: 0 0 auto;
    width: 300px; 
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
}


.date-picker-box {
    flex: 0 0 auto;
    width: 300px; 
    display: flex;
    flex-direction: column;
    margin-bottom: 0;
}

.invoice-section label {
    font-weight: 600;
    font-size: 0.8rem;
    margin-bottom: 6px;
    color: #444;
    display: block;
}


.invoice-input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.85rem;
    width: 100%;
    height: 38px;
    background-color: #fff;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.invoice-input:focus {
    outline: none;
    border-color: #409eff;
    box-shadow: 0 0 4px rgba(64, 158, 255, 0.3);
}


.date-picker-container {
    width: 100%;
}


.date-picker-box :deep(.el-date-editor) {
    width: 100% !important;
}

.date-picker-box :deep(.el-input__inner) {
    width: 100% !important;
}

.date-picker-box :deep(.el-input) {
    width: 100% !important;
}

.required {
    color: red;
    font-weight: bold;
}
.list-container {
    background: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}

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