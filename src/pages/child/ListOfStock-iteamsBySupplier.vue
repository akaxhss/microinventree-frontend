<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />
            <div class="supplier-stock-container">
                <div class="header-section">
                    <h1 class="page-title">📦 Stock by Suppliers</h1>
                    <p class="page-subtitle">View Stock Inventory by Suppliers</p>
                </div>

                <!-- Supplier Selection -->
                <div class="filters-card">
                    <div class="filters-header">
                        <h3>Select Supplier</h3>
                    </div>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>Choose Supplier</label>
                            <el-select v-model="selectedSupplierId" placeholder="Select a supplier"
                                class="filter-select" @change="fetchSupplierStock" clearable filterable>
                                <el-option v-for="supplier in sortedSuppliers" :key="supplier.id"
                                    :label="`${supplier.name} (${supplier.place || 'No place'})`"
                                    :value="supplier.id" />
                            </el-select>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <p>Loading supplier stock data...</p>
                </div>

                <!-- Supplier Stock Summary -->
                <div v-if="supplierStock && !loading" class="supplier-summary">
                    <div class="summary-card">
                        <div class="supplier-info">
                            <h2 class="supplier-name">{{ supplierStock.supplier_name }}</h2>
                            <div class="supplier-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Total Items</span>
                                    <span class="stat-value">{{ supplierStock.total_items }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Total Quantity</span>
                                    <span class="stat-value">{{ supplierStock.total_quantity }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Supplier ID</span>
                                    <span class="stat-value">#{{ supplierStock.supplier_id }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Stock Items List -->
                    <div class="stock-items-section">
                        <div class="section-header">
                            <h3>Stock Items ({{ supplierStock.stocks.length }})</h3>
                            <div class="export-actions" v-if="supplierStock.stocks.length > 0">
                                <el-button type="success" @click="exportExcel">
                                    <i class="el-icon-download"></i>
                                    Export Excel
                                </el-button>
                                <el-button type="danger" @click="exportPDF">
                                    <i class="el-icon-document"></i>
                                    Export PDF
                                </el-button>
                            </div>
                        </div>

                        <div v-if="supplierStock.stocks.length === 0" class="empty-state">
                            <div class="empty-icon">📦</div>
                            <h3>No Stock Items Found</h3>
                            <p>This supplier doesn't have any stock items yet.</p>
                        </div>

                        <div v-else class="stock-items-list">
                            <!-- Filter Options -->
                            <div class="filter-options">
                                <div class="filter-row">
                                    <div class="filter-item">
                                        <label>Product</label>
                                        <el-input v-model="filters.product" placeholder="Filter by product" clearable
                                            @input="applyFilters" />
                                    </div>
                                    <div class="filter-item">
                                        <label>Color</label>
                                        <el-input v-model="filters.color" placeholder="Filter by color" clearable
                                            @input="applyFilters" />
                                    </div>
                                    <div class="filter-item">
                                        <label>Size</label>
                                        <el-input v-model="filters.size" placeholder="Filter by size" clearable
                                            @input="applyFilters" />
                                    </div>
                                    <div class="filter-item">
                                        <label>Quantity</label>
                                        <el-input v-model="filters.quantity" placeholder="Filter by quantity" clearable
                                            @input="applyFilters" />
                                    </div>
                                    <div class="filter-item">
                                        <label>Status</label>
                                        <el-select v-model="filters.status" placeholder="Filter by status" clearable
                                            @change="applyFilters">
                                            <el-option label="In Stock" value="in-stock" />
                                            <el-option label="Low Stock" value="low-stock" />
                                            <el-option label="Out of Stock" value="out-of-stock" />
                                        </el-select>
                                    </div>
                                </div>
                            </div>

                            <div class="table-container">
                                <table class="stock-table">
                                    <thead>
                                        <tr>
                                            <th class="product-col">Product</th>
                                            <th class="color-col">Color</th>
                                            <th class="size-col">Size</th>
                                            <th class="quantity-col">Quantity</th>
                                            <th class="status-col">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(stock, index) in filteredStocks" :key="index"
                                            :class="{ 'low-stock': stock.quantity <= 10, 'out-of-stock': stock.quantity === 0 }">
                                            <td class="product-col">
                                                <span class="product-name">{{ stock.product }}</span>
                                            </td>
                                            <td class="color-col">
                                                <span class="color-name">{{ stock.color }}</span>
                                            </td>
                                            <td class="size-col">
                                                <span class="size-badge">{{ stock.size }}</span>
                                            </td>
                                            <td class="quantity-col">
                                                <span class="quantity-value">{{ stock.quantity }}</span>
                                            </td>
                                            <td class="status-col">
                                                <el-tag :type="getStatusTagType(stock.quantity)" size="small">
                                                    {{ getStatusText(stock.quantity) }}
                                                </el-tag>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- No Results Message -->
                            <div v-if="filteredStocks.length === 0 && supplierStock.stocks.length > 0"
                                class="no-results">
                                <div class="no-results-icon">🔍</div>
                                <h3>No matching stock items found</h3>
                                <p>Try adjusting your filters to see more results</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Initial State -->
                <div v-else-if="!loading && !supplierStock" class="initial-state">
                    <div class="initial-icon">🔍</div>
                    <h3>Select a Supplier</h3>
                    <p>Choose a supplier from the dropdown above to view their stock items</p>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../../plugins/axios.js";
import Sidebar from "../../components/Sidebar.vue";
import ModernHeader from "../../components/header.vue";



// Element Plus components
import { ElSelect, ElOption, ElButton, ElTag, ElInput } from 'element-plus';

// Data
const suppliers = ref([]);
const supplierStock = ref(null);
const selectedSupplierId = ref("");
const loading = ref(false);

// Filters
const filters = ref({
    product: '',
    color: '',
    size: '',
    quantity: '',
    status: ''
});

// Computed properties
const sortedSuppliers = computed(() => {
    return [...suppliers.value].sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
});

const filteredStocks = computed(() => {
    if (!supplierStock.value || !supplierStock.value.stocks) return [];

    return supplierStock.value.stocks.filter(stock => {
        // Product filter
        if (filters.value.product && !stock.product.toLowerCase().includes(filters.value.product.toLowerCase())) {
            return false;
        }

        // Color filter
        if (filters.value.color && !stock.color.toLowerCase().includes(filters.value.color.toLowerCase())) {
            return false;
        }

        // Size filter
        if (filters.value.size && !stock.size.toLowerCase().includes(filters.value.size.toLowerCase())) {
            return false;
        }

        // Quantity filter
        if (filters.value.quantity) {
            const quantityFilter = filters.value.quantity.toLowerCase();
            if (quantityFilter.includes('>')) {
                const value = parseInt(quantityFilter.replace('>', '').trim());
                if (isNaN(value) || stock.quantity <= value) return false;
            } else if (quantityFilter.includes('<')) {
                const value = parseInt(quantityFilter.replace('<', '').trim());
                if (isNaN(value) || stock.quantity >= value) return false;
            } else {
                const value = parseInt(quantityFilter);
                if (!isNaN(value) && stock.quantity !== value) return false;
            }
        }

        // Status filter
        if (filters.value.status) {
            const status = getStatusClass(stock.quantity);
            if (status !== filters.value.status) return false;
        }

        return true;
    });
});

// Methods
const loadSuppliers = async () => {
    try {
        const res = await axios.get("/suppliers/");
        suppliers.value = res.data;
    } catch (error) {
        console.error("Error loading suppliers:", error);
    }
};

const fetchSupplierStock = async () => {
    if (!selectedSupplierId.value) {
        supplierStock.value = null;
        return;
    }

    loading.value = true;
    supplierStock.value = null;
    // Reset filters when changing supplier
    filters.value = {
        product: '',
        color: '',
        size: '',
        quantity: '',
        status: ''
    };

    try {
        const res = await axios.get(`/stock-itemsbysuppliers/?supplier_id=${selectedSupplierId.value}`);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (Array.isArray(res.data) && res.data.length > 0) {
            supplierStock.value = res.data[0];
        } else if (typeof res.data === 'object') {
            supplierStock.value = res.data;
        } else {
            console.error('Unexpected response format:', res.data);
            supplierStock.value = null;
        }
    } catch (error) {
        console.error("Error fetching supplier stock:", error);
        supplierStock.value = null;
    } finally {
        loading.value = false;
    }
};

const applyFilters = () => {
    // Filters are applied automatically through computed property
};

const getStatusTagType = (quantity) => {
    if (quantity === 0) return 'danger';
    if (quantity <= 10) return 'warning';
    return 'success';
};

const getStatusClass = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= 10) return 'low-stock';
    return 'in-stock';
};

const getStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
};

// Export functions
const exportExcel = () => {
    if (!supplierStock.value) return;

    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Get selected supplier details for location
    const selectedSupplier = suppliers.value.find(s => s.id === parseInt(selectedSupplierId.value));
    const supplierLocation = selectedSupplier?.place || 'No location';

    // Header
    wsData.push(["Supplier Stock Report"]);
    wsData.push([`Supplier: ${supplierStock.value.supplier_name}`]);
    wsData.push([`Location: ${supplierLocation}`]);
    wsData.push([`Supplier ID: ${supplierStock.value.supplier_id}`]);
    wsData.push([`Total Items: ${supplierStock.value.total_items}`]);
    wsData.push([`Total Quantity: ${supplierStock.value.total_quantity}`]);
    wsData.push([]);

    // Table header
    wsData.push(["Product", "Color", "Size", "Quantity", "Status"]);

    // Table data (use filtered data if filters are applied, otherwise all data)
    const exportData = filters.value.product || filters.value.color || filters.value.size || filters.value.quantity || filters.value.status
        ? filteredStocks.value
        : supplierStock.value.stocks;

    exportData.forEach(stock => {
        wsData.push([
            stock.product,
            stock.color, // Plain color name without badge
            stock.size,
            stock.quantity,
            getStatusText(stock.quantity)
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
        { wch: 25 }, // Product
        { wch: 15 }, // Color
        { wch: 10 }, // Size
        { wch: 12 }, // Quantity
        { wch: 15 }  // Status
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Supplier_Stock");
    XLSX.writeFile(wb, `Supplier_Stock_${supplierStock.value.supplier_name.replace(/\s+/g, '_')}.xlsx`);
};

const exportPDF = () => {
    if (!supplierStock.value) return;

    const doc = new jsPDF();

    // Get selected supplier details for location
    const selectedSupplier = suppliers.value.find(s => s.id === parseInt(selectedSupplierId.value));
    const supplierLocation = selectedSupplier?.place || 'No location';

    // Header
    doc.setFontSize(16);
    doc.text("Supplier Stock Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Supplier: ${supplierStock.value.supplier_name}`, 14, 35);
    doc.text(`Location: ${supplierLocation}`, 14, 42);
    doc.text(`Supplier ID: ${supplierStock.value.supplier_id}`, 14, 49);
    doc.text(`Total Items: ${supplierStock.value.total_items}`, 14, 56);
    doc.text(`Total Quantity: ${supplierStock.value.total_quantity}`, 14, 63);

    // Table data (use filtered data if filters are applied, otherwise all data)
    const exportData = filters.value.product || filters.value.color || filters.value.size || filters.value.quantity || filters.value.status
        ? filteredStocks.value
        : supplierStock.value.stocks;

    const tableData = exportData.map(stock => [
        stock.product,
        stock.color, // Plain color name without badge
        stock.size,
        stock.quantity.toString(),
        getStatusText(stock.quantity)
    ]);

    autoTable(doc, {
        head: [["Product", "Color", "Size", "Quantity", "Status"]],
        body: tableData,
        startY: 70,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Supplier_Stock_${supplierStock.value.supplier_name.replace(/\s+/g, '_')}.pdf`);
};

onMounted(() => {
    loadSuppliers();
});
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

.filter-select {
    width: 100%;
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
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.supplier-summary {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
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
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
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

.export-actions {
    display: flex;
    gap: 12px;
}

.empty-state,
.initial-state {
    text-align: center;
    padding: 60px 20px;
    color: #666;
}

.empty-icon,
.initial-icon {
    font-size: 4rem;
    margin-bottom: 16px;
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

.low-stock {
    background: #fef3c7;
}

.out-of-stock {
    background: #fee2e2;
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
</style>