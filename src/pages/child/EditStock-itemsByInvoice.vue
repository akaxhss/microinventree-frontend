<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />
            <div class="supplier-stock-container">
                <div class="header-section">
                    <h1 class="page-title">Edit Stock by Invoice</h1>
                    <p class="page-subtitle">Edit quantities or delete items from purchase invoices</p>
                </div>

                <!-- Invoice Selection -->
                <div class="filters-card">
                    <div class="filters-header">
                        <h3>Search Invoice to Edit</h3>
                    </div>
                    <div class="filters-grid">
                        <!-- Supplier Selection -->
                        <div class="filter-group">
                            <label>Select Supplier</label>
                            <el-select 
                                v-model="selectedSupplierId" 
                                placeholder="Select Supplier"
                                class="filter-select"
                                filterable
                                clearable
                                @change="handleSupplierChange"
                            >
                                <el-option 
                                    v-for="supplier in sortedSuppliers" 
                                    :key="supplier.id"
                                    :label="`${supplier.name} (${supplier.place})`"
                                    :value="supplier.id" 
                                />
                            </el-select>
                        </div>

                        <!-- Date Range Selection - Separate Pickers -->
                        <div class="filter-group">
                            <label>Select Date Range</label>
                            <div class="separate-date-pickers">
                                <div class="date-picker-group">
                                    <label class="date-label">Start Date</label>
                                    <el-date-picker
                                        v-model="startDate"
                                        type="date"
                                        placeholder="Select start date"
                                        format="DD/MM/YYYY"
                                        value-format="YYYY-MM-DD"
                                        @change="handleStartDateChange"
                                        class="single-date-picker"
                                        clearable
                                    />
                                </div>
                                <div class="date-picker-group">
                                    <label class="date-label">End Date</label>
                                    <el-date-picker
                                        v-model="endDate"
                                        type="date"
                                        placeholder="Select end date"
                                        format="DD/MM/YYYY"
                                        value-format="YYYY-MM-DD"
                                        @change="handleEndDateChange"
                                        :disabled="!startDate"
                                        class="single-date-picker"
                                        clearable
                                    />
                                </div>
                                <div class="date-actions">
                                    <el-button 
                                        type="primary" 
                                        @click="loadInvoicesByFilters" 
                                        :loading="loadingInvoices"
                                        :disabled="!hasActiveFilters"
                                        class="search-date-btn"
                                    >
                                        Search
                                    </el-button>
                                    <el-button 
                                        @click="loadRecentInvoices" 
                                        :loading="loadingInvoices"
                                        class="recent-btn"
                                    >
                                        Show Recent
                                    </el-button>
                                    <el-button 
                                        @click="clearFilters" 
                                        class="clear-btn"
                                    >
                                        Clear All
                                    </el-button>
                                </div>
                            </div>
                        </div>

                        <!-- Invoice Selection with Virtual Scrolling -->
                        <div class="filter-group">
                            <label>Select or Type Invoice Number</label>
                            <el-select 
                                v-model="invoiceNumber" 
                                placeholder="Select from filtered invoices or type invoice number"
                                class="filter-select" 
                                filterable 
                                clearable
                                allow-create
                                default-first-option
                                remote
                                :remote-method="searchInvoices"
                                :loading="loadingInvoices"
                                @change="fetchInvoiceData"
                            >
                                <el-option 
                                    v-for="invoice in visibleInvoices" 
                                    :key="invoice.id"
                                    :label="`${invoice.invoice_number} - ${invoice.supplier_name}(${invoice.supplier_location}) - ${formatDate(invoice.invoice_date)}`"
                                    :value="invoice.invoice_number" 
                                />
                            </el-select>
                            <div class="dropdown-info" v-if="totalInvoices > visibleInvoices.length">
                                Showing {{ visibleInvoices.length }} of {{ totalInvoices }} invoices
                            </div>
                            <div class="filter-info" v-if="activeFilterText">
                                {{ activeFilterText }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <p>Loading invoice data...</p>
                </div>

                <!-- Invoice Edit Section -->
                <div v-if="invoiceData && !loading" class="supplier-summary">
                    <div class="summary-card">
                        <div class="supplier-info">
                            <h2 class="supplier-name">Editing Invoice: {{ invoiceData.invoice_number }}</h2>
                            <div class="supplier-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Invoice Date</span>
                                    <span class="stat-value">{{ formatDate(invoiceData.invoice_date) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Items</span>
                                    <span class="stat-value">{{ invoiceData.total_items }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Supplier</span>
                                    <span class="stat-value">{{ invoiceData.supplier.name }} ({{ invoiceData.supplier.place }})</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Contact</span>
                                    <span class="stat-value">{{ invoiceData.supplier.contact_number }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Items Section -->
                    <div class="stock-items-section">
                        <div class="section-header">
                            <h3>Edit Invoice Items ({{ invoiceData.items.length }})</h3>
                            <div class="action-buttons">
                                <el-button type="primary" @click="saveChanges" :loading="saving" :disabled="!hasChanges">
                                    <i class="el-icon-check"></i>
                                    Save Changes
                                </el-button>
                                <el-button @click="resetChanges" :disabled="!hasChanges">
                                    <i class="el-icon-refresh"></i>
                                    Reset
                                </el-button>
                            </div>
                        </div>

                        <div v-if="invoiceData.items.length === 0" class="empty-state">
                            <div class="empty-icon">📦</div>
                            <h3>No Items Found</h3>
                            <p>This invoice doesn't have any items to edit.</p>
                        </div>

                        <div v-else class="stock-items-list">
                            <div class="table-container">
                                <table class="stock-table edit-table">
                                    <thead>
                                        <tr>
                                            <th class="product-col">Product</th>
                                            <th class="sku-col">SKU</th>
                                            <th class="color-col">Color</th>
                                            <th class="size-col">Size</th>
                                            <th class="quantity-col">QTY</th>
                                            <th class="action-col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in editableItems" :key="item.id" 
                                            :class="{ 'modified': item.modified, 'deleted': item.markedForDelete }">
                                            <td class="product-col">
                                                <span class="product-name">{{ item.product.name }}</span>
                                            </td>
                                            <td class="sku-col">
                                                <span class="sku-code">{{ item.product.sku }}</span>
                                            </td>
                                            <td class="color-col">
                                                <span class="color-name">{{ item.color.name }}</span>
                                            </td>
                                            <td class="size-col">
                                                <span class="size-badge">{{ item.size.display_name }}</span>
                                            </td>
                                            <td class="quantity-col">
                                                <div class="quantity-controls">
                                                    <el-input-number 
                                                        v-model="item.editableQuantity" 
                                                        :min="0" 
                                                        :max="10000"
                                                        size="small"
                                                        @change="markAsModified(item, index)"
                                                        :disabled="item.markedForDelete"
                                                        controls-position="right" />
                                                    <div v-if="item.originalQuantity !== item.editableQuantity" 
                                                         class="quantity-diff">
                                                        {{ item.originalQuantity }} → {{ item.editableQuantity }}
                                                        <span class="diff-indicator" :class="getDiffClass(item)">
                                                            {{ getDiffText(item) }}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="action-col">
                                                <div class="action-buttons">
                                                    <el-button 
                                                        v-if="!item.markedForDelete"
                                                        type="danger" 
                                                        size="small" 
                                                        @click="markForDelete(item, index)"
                                                        title="Delete this item">
                                                        <i class="el-icon-delete"></i>
                                                        Delete
                                                    </el-button>
                                                    <el-button 
                                                        v-else
                                                        type="success" 
                                                        size="small" 
                                                        @click="unmarkDelete(item, index)"
                                                        title="Restore this item">
                                                        <i class="el-icon-refresh-left"></i>
                                                        Restore
                                                    </el-button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Initial State -->
                <div v-else-if="!loading && !invoiceData" class="initial-state">
                    <div class="initial-icon">🔍</div>
                    <h3>Select or Type Invoice</h3>
                    <p>Use filters to search invoices by supplier, date, or show recent invoices</p>
                </div>

                <!-- Error State -->
                <div v-if="errorMessage" class="error-state">
                    <div class="error-icon">❌</div>
                    <h3>Error Loading Invoice</h3>
                    <p>{{ errorMessage }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "../../plugins/axios.js";
import Sidebar from "../../components/Sidebar.vue";
import ModernHeader from "../../components/header.vue";

// Element Plus components
import { ElSelect, ElOption, ElButton, ElInputNumber, ElMessage, ElMessageBox, ElDatePicker } from 'element-plus';

// Data
const invoiceData = ref(null);
const invoiceNumber = ref("");
const startDate = ref("");
const endDate = ref("");
const selectedSupplierId = ref("");
const suppliers = ref([]);
const loading = ref(false);
const loadingInvoices = ref(false);
const saving = ref(false);
const errorMessage = ref("");
const editableItems = ref([]);
const recentInvoices = ref([]);
const filteredInvoices = ref([]);
const searchQuery = ref("");

// Virtual scrolling constants
const VISIBLE_LIMIT = 50;

// Computed properties
const sortedSuppliers = computed(() => {
    return [...suppliers.value].sort((a, b) => a.name.localeCompare(b.name));
});

const hasActiveFilters = computed(() => {
    return selectedSupplierId.value || startDate.value;
});

const activeFilterText = computed(() => {
    if (!hasActiveFilters.value) return '';
    
    let text = 'Filtered by: ';
    const parts = [];
    
    if (selectedSupplierId.value) {
        const supplier = suppliers.value.find(s => s.id === selectedSupplierId.value);
        parts.push(`Supplier: ${supplier?.name || selectedSupplierId.value}`);
    }
    
    if (startDate.value && (!endDate.value || startDate.value === endDate.value)) {
        parts.push(`Date: ${formatDate(startDate.value)}`);
    } else if (startDate.value && endDate.value) {
        parts.push(`Dates: ${formatDate(startDate.value)} to ${formatDate(endDate.value)}`);
    }
    
    return text + parts.join(', ');
});

const hasChanges = computed(() => {
    return modifiedItems.value.length > 0 || deletedItems.value.length > 0;
});

const modifiedItems = computed(() => {
    return editableItems.value.filter(item => 
        item.modified && !item.markedForDelete && item.originalQuantity !== item.editableQuantity
    );
});

const deletedItems = computed(() => {
    return editableItems.value.filter(item => item.markedForDelete);
});

const allInvoices = computed(() => {
    return filteredInvoices.value.length > 0 ? filteredInvoices.value : recentInvoices.value;
});

const visibleInvoices = computed(() => {
    // Virtual scrolling - only show limited items for performance
    return allInvoices.value.slice(0, VISIBLE_LIMIT);
});

const totalInvoices = computed(() => {
    return allInvoices.value.length;
});

// Methods
const searchInvoices = (query) => {
    searchQuery.value = query;
};

const handleSupplierChange = () => {
    // Reset other filters when supplier changes
    startDate.value = "";
    endDate.value = "";
    filteredInvoices.value = [];
};

const handleStartDateChange = (date) => {
    startDate.value = date;
    // If end date is before start date, clear end date
    if (endDate.value && new Date(endDate.value) < new Date(date)) {
        endDate.value = "";
    }
};

const handleEndDateChange = (date) => {
    endDate.value = date;
};

const clearFilters = () => {
    selectedSupplierId.value = "";
    startDate.value = "";
    endDate.value = "";
    filteredInvoices.value = [];
    searchQuery.value = "";
    ElMessage.info('All filters cleared');
};

const loadRecentInvoices = async () => {
    loadingInvoices.value = true;
    selectedSupplierId.value = "";
    startDate.value = "";
    endDate.value = "";
    searchQuery.value = "";
    try {
        const res = await axios.get('/purchase-history/recent/');
        if (res.data && res.data.results) {
            recentInvoices.value = res.data.results;
            filteredInvoices.value = [];
            ElMessage.success(`Loaded ${res.data.results.length} recent invoices`);
        }
    } catch (error) {
        console.error("Error loading recent invoices:", error);
        ElMessage.error('Error loading recent invoices');
    } finally {
        loadingInvoices.value = false;
    }
};

const loadInvoicesByFilters = async () => {
    if (!hasActiveFilters.value) {
        ElMessage.warning('Please select at least one filter (supplier or date)');
        return;
    }

    loadingInvoices.value = true;
    searchQuery.value = "";

    try {
        let url = '/purchase-history/supplier/';
        const params = new URLSearchParams();

        // Add supplier if selected
        if (selectedSupplierId.value) {
            params.append('supplier_id', selectedSupplierId.value);
        }

        // Add date filters
        if (startDate.value && (!endDate.value || startDate.value === endDate.value)) {
            // Single date
            params.append('date', startDate.value);
        } else if (startDate.value && endDate.value) {
            // Date range
            params.append('start_date', startDate.value);
            params.append('end_date', endDate.value);
        }

        const fullUrl = `${url}?${params.toString()}`;
        const res = await axios.get(fullUrl);
        
        if (res.data && res.data.results) {
            filteredInvoices.value = res.data.results;
            
            // Generate filter description
            let filterDesc = '';
            if (selectedSupplierId.value) {
                const supplier = suppliers.value.find(s => s.id === selectedSupplierId.value);
                filterDesc += `supplier ${supplier?.name}`;
            }
            if (startDate.value) {
                if (filterDesc) filterDesc += ' and ';
                if (!endDate.value || startDate.value === endDate.value) {
                    filterDesc += `date ${formatDate(startDate.value)}`;
                } else {
                    filterDesc += `dates ${formatDate(startDate.value)} to ${formatDate(endDate.value)}`;
                }
            }
            
            ElMessage.success(`Found ${res.data.results.length} invoices for ${filterDesc}`);
        } else {
            filteredInvoices.value = [];
            ElMessage.info('No invoices found for selected filters');
        }
    } catch (error) {
        console.error("Error loading invoices by filters:", error);
        ElMessage.error('Error loading invoices for selected filters');
        filteredInvoices.value = [];
    } finally {
        loadingInvoices.value = false;
    }
};

const fetchInvoiceData = async (selectedInvoice) => {
    const invoiceToFetch = selectedInvoice || invoiceNumber.value;
    
    if (!invoiceToFetch) {
        errorMessage.value = "Please select or enter an invoice number";
        return;
    }

    loading.value = true;
    errorMessage.value = "";
    invoiceData.value = null;
    editableItems.value = [];

    try {
        const res = await axios.get(`/purchase-history/search/?invoice=${invoiceToFetch}`);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
            invoiceData.value = res.data[0];
            initializeEditableItems();
        } else {
            errorMessage.value = "No invoice found with this number";
        }
    } catch (error) {
        console.error("Error fetching invoice data:", error);
        errorMessage.value = "Error loading invoice data. Please check the invoice number and try again.";
    } finally {
        loading.value = false;
    }
};

const initializeEditableItems = () => {
    editableItems.value = invoiceData.value.items.map(item => ({
        ...item,
        originalQuantity: item.quantity,
        editableQuantity: item.quantity,
        modified: false,
        markedForDelete: false
    }));
};

const markAsModified = (item, index) => {
    item.modified = true;
    // Update the array to trigger reactivity
    editableItems.value[index] = { ...item };
};

const markForDelete = async (item, index) => {
    try {
        await ElMessageBox.confirm(
            `Are you sure you want to delete ${item.product.name} (${item.color.name}, ${item.size.display_name})? This will remove ${item.editableQuantity} items from inventory.`,
            'Confirm Delete',
            {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        );
        
        item.markedForDelete = true;
        item.modified = true;
        editableItems.value[index] = { ...item };
        
        ElMessage.success('Item marked for deletion');
    } catch (error) {
        // User cancelled deletion
        console.log('Deletion cancelled');
    }
};

const unmarkDelete = (item, index) => {
    item.markedForDelete = false;
    editableItems.value[index] = { ...item };
    ElMessage.info('Item restored');
};

const getDiffClass = (item) => {
    const diff = item.editableQuantity - item.originalQuantity;
    if (diff > 0) return 'increase';
    if (diff < 0) return 'decrease';
    return '';
};

const getDiffText = (item) => {
    const diff = item.editableQuantity - item.originalQuantity;
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return '';
};

const resetChanges = () => {
    ElMessageBox.confirm(
        'Are you sure you want to reset all changes?',
        'Confirm Reset',
        {
            confirmButtonText: 'Reset',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(() => {
        initializeEditableItems();
        ElMessage.success('All changes reset');
    }).catch(() => {
        // User cancelled reset
    });
};

const saveChanges = async () => {
    if (!hasChanges.value) return;

    saving.value = true;

    try {
        // Prepare update data
        const updateData = {
            items: modifiedItems.value.map(item => ({
                id: item.id,
                quantity: item.editableQuantity
            }))
        };

        // Send update request
        const response = await axios.put(
            `/purchase-history/edit/${invoiceData.value.invoice_number}/`,
            updateData
        );

        // Handle deleted items
        for (const item of deletedItems.value) {
            await axios.delete(`/purchase-history/edit/${invoiceData.value.invoice_number}/`, {
                data: { item_id: item.id }
            });
        }

        ElMessage.success('Changes saved successfully!');
        
        // Reload the invoice data to get updated information
        await fetchInvoiceData(invoiceData.value.invoice_number);
        
    } catch (error) {
        console.error("Error saving changes:", error);
        ElMessage.error(error.response?.data?.error || 'Error saving changes. Please try again.');
    } finally {
        saving.value = false;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid date';
    }
};

const loadSuppliers = async () => {
    try {
        const res = await axios.get('/suppliers/');
        suppliers.value = res.data;
    } catch (error) {
        console.error("Error loading suppliers:", error);
        ElMessage.error('Error loading suppliers');
    }
};

onMounted(async () => {
    await Promise.all([
        loadSuppliers(),
        loadRecentInvoices()
    ]);
});
</script>

<style scoped>

.filter-info {
    font-size: 0.8rem;
    color: #666;
    margin-top: 4px;
    font-style: italic;
}


.filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}


@media (max-width: 1024px) {
    .filters-grid {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 768px) {
    .filters-grid {
        grid-template-columns: 1fr;
    }
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

.supplier-stock-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header-section {
    text-align: center;
    margin-bottom: 30px;
}

.page-title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 8px;
}

.page-subtitle {
    color: #666;
    font-size: 1.1rem;
}

.filters-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.filters-header h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.2rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 500;
    color: #555;
}

/* Separate Date Pickers Styles */
.separate-date-pickers {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.date-picker-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.date-label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
}

.single-date-picker {
    width: 100%;
}

.date-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.search-date-btn,
.recent-btn,
.clear-btn {
    flex: 1;
}

.filter-select {
    width: 100%;
}

.dropdown-info {
    font-size: 0.75rem;
    color: #666;
    margin-top: 4px;
    text-align: right;
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

.supplier-stock-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.header-section {
    text-align: center;
    margin-bottom: 30px;
}

.page-title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 8px;
}

.page-subtitle {
    color: #666;
    font-size: 1.1rem;
}

.filters-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.filters-header h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.2rem;
}

.filters-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-weight: 500;
    color: #555;
}

/* Separate Date Pickers Styles */
.separate-date-pickers {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.date-picker-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.date-label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
}

.single-date-picker {
    width: 100%;
}

.date-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.search-date-btn,
.recent-btn,
.clear-btn {
    flex: 1;
}

.filter-select {
    width: 100%;
}

.dropdown-info {
    font-size: 0.75rem;
    color: #666;
    margin-top: 4px;
    text-align: right;
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #666;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.supplier-summary {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.summary-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
}

.supplier-name {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 1.5rem;
}

.supplier-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.stat-label {
    display: block;
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 4px;
}

.stat-value {
    display: block;
    font-size: 1.2rem;
    font-weight: bold;
    color: #333;
}

.supplier-details {
    margin-top: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.detail-row {
    margin-bottom: 8px;
    font-size: 0.9rem;
    color: #555;
}

.stock-items-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.section-header h3 {
    margin: 0;
    color: #333;
}

.action-buttons {
    display: flex;
    gap: 12px;
}

.export-actions {
    display: flex;
    gap: 12px;
}

.empty-state,
.initial-state,
.error-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-icon,
.initial-icon,
.error-icon {
    font-size: 4rem;
    margin-bottom: 16px;
}

.error-state {
    color: #dc2626;
}

.stock-table {
    width: 100%;
    border-collapse: collapse;
}

.stock-table th {
    background: #f8fafc;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e2e8f0;
}

.stock-table td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
}

.edit-table tr.modified {
    background: #fff3cd !important;
}

.edit-table tr.deleted {
    background: #f8d7da !important;
    opacity: 0.7;
}

.product-name {
    font-weight: 500;
    color: #333;
}

.sku-code {
    font-family: monospace;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #475569;
}

.color-name {
    font-weight: 500;
    color: #555;
}

.size-badge {
    display: inline-block;
    padding: 4px 8px;
    background: #f1f5f9;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
}

.quantity-controls {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
}

.quantity-diff {
    font-size: 0.75rem;
    padding: 2px 6px;
    border-radius: 4px;
    background: #f8f9fa;
}

.diff-indicator.increase {
    color: #10b981;
    font-weight: bold;
}

.diff-indicator.decrease {
    color: #ef4444;
    font-weight: bold;
}

.action-col .action-buttons {
    display: flex;
    gap: 8px;
}

/* Filter Options Styles */
.filter-options {
    background: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}

.filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    align-items: end;
}

.filter-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-item label {
    font-weight: 500;
    color: #555;
    font-size: 0.9rem;
}

.quantity-value {
    font-weight: 600;
    color: #333;
}

.no-results {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.no-results-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
    .main-content {
        margin-left: 0;
        padding: 16px;
    }
    
    .supplier-stock-container {
        padding: 16px;
    }
    
    .filters-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .separate-date-pickers {
        gap: 10px;
    }
    
    .date-actions {
        flex-direction: column;
    }
    
    .search-date-btn,
    .recent-btn,
    .clear-btn {
        width: 100%;
    }
    
    .container-top,
    .container-bottom {
        min-height: 50vh;
    }
    
    .container-header {
        padding: 16px 20px 0;
    }
    
    .container-title {
        font-size: 1.3rem;
    }
    
    .section-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .action-buttons {
        width: 100%;
        justify-content: flex-start;
    }
    
    .export-actions {
        width: 100%;
        justify-content: flex-start;
    }
    
    .supplier-stats {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
    }
    
    .stat-item {
        padding: 12px;
    }
    
    .stat-value {
        font-size: 1.1rem;
    }
    
    .stock-table {
        font-size: 0.9rem;
    }
    
    .stock-table th,
    .stock-table td {
        padding: 8px;
    }
    
    .filter-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}

@media (max-width: 480px) {
    .page-title {
        font-size: 1.5rem;
    }
    
    .page-subtitle {
        font-size: 1rem;
    }
    
    .filters-card {
        padding: 16px;
    }
    
    .summary-card {
        padding: 16px;
    }
    
    .stock-items-section {
        padding: 16px;
    }
    
    .supplier-stats {
        grid-template-columns: 1fr 1fr;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .export-actions {
        flex-direction: column;
    }
}
</style>