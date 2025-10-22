<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />
            <div class="supplier-stock-container">
                <div class="header-section">
                    <h1 class="page-title">📦 Stock Items by Invoice</h1>
                    <p class="page-subtitle">View Stock Items by Invoice Number</p>
                </div>

                <!-- Invoice Selection -->
                <div class="filters-card">
                    <div class="filters-header">
                        <h3>Search Invoice</h3>
                    </div>
                    <div class="filters-grid">
                        <div class="filter-group">
                            <label>Select or Type Invoice Number</label>
                            <el-select 
                                v-model="invoiceNumber" 
                                placeholder="Shows only last 7 days in drop down. Otherwise type the Invoice No:"
                                class="filter-select" 
                                filterable 
                                clearable
                                allow-create
                                default-first-option
                                @change="fetchInvoiceStock"
                                :loading="loading"
                            >
                                <el-option 
                                    v-for="invoice in recentInvoices" 
                                    :key="invoice.id"
                                    :label="`${invoice.invoice_number} - ${invoice.supplier_name}(${invoice.supplier_location})`"
                                    :value="invoice.invoice_number" 
                                />
                            </el-select>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-spinner"></div>
                    <p>Loading invoice data...</p>
                </div>

                <!-- Invoice Stock Summary -->
                <div v-if="invoiceData && !loading" class="supplier-summary">
                    <div class="summary-card">
                        <div class="supplier-info">
                            <h2 class="supplier-name">Invoice: {{ invoiceData.invoice_number }}</h2>
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
                                    <span class="stat-value">{{ invoiceData.supplier.name }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Contact</span>
                                    <span class="stat-value">{{ invoiceData.supplier.contact_number }}</span>
                                </div>
                            </div>
                            <div class="supplier-details" v-if="invoiceData.supplier">
                                <div class="detail-row">
                                    <strong>Company:</strong> {{ invoiceData.supplier.company_name }}
                                </div>
                                <div class="detail-row">
                                    <strong>GST:</strong> {{ invoiceData.supplier.gst_number }}
                                </div>
                                <div class="detail-row">
                                    <strong>Place:</strong> {{ invoiceData.supplier.place }}
                                </div>
                                <div class="detail-row">
                                    <strong>Address:</strong> {{ invoiceData.supplier.address }}
                                </div>
                            </div>
                        </div>
                    </div>

                    Stock Items List
                    <div class="stock-items-section">
                        <div class="section-header">
                            <h3>Invoice Items ({{ invoiceData.items.length }})</h3>
                            <!-- <div class="export-actions" v-if="invoiceData.items.length > 0">
                                <el-button type="success" @click="exportExcel">
                                    <i class="el-icon-download"></i>
                                    Export Excel
                                </el-button>
                                <el-button type="danger" @click="exportPDF">
                                    <i class="el-icon-document"></i>
                                    Export PDF
                                </el-button>
                            </div> -->
                        </div>

                        <div v-if="invoiceData.items.length === 0" class="empty-state">
                            <div class="empty-icon">📦</div>
                            <h3>No Items Found</h3>
                            <p>This invoice doesn't have any items.</p>
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
                                </div>
                            </div>

                            <div class="table-container">
                                <table class="stock-table">
                                    <thead>
                                        <tr>
                                            <th class="product-col">Product</th>
                                            <th class="sku-col">SKU</th>
                                            <th class="color-col">Color</th>
                                            <th class="size-col">Size</th>
                                            <th class="quantity-col">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in filteredItems" :key="item.id">
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
                                                <span class="quantity-value">{{ item.quantity }}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- No Results Message -->
                            <div v-if="filteredItems.length === 0 && invoiceData.items.length > 0" class="no-results">
                                <div class="no-results-icon">🔍</div>
                                <h3>No matching items found</h3>
                                <p>Try adjusting your filters to see more results</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Initial State -->
                <div v-else-if="!loading && !invoiceData" class="initial-state">
                    <div class="initial-icon">🔍</div>
                    <h3>Select or Type Invoice</h3>
                    <p>Select an invoice from the dropdown or type any invoice number to view its items</p>
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
import { ref, computed, onMounted } from "vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../../plugins/axios.js";
import Sidebar from "../../components/Sidebar.vue";
import ModernHeader from "../../components/header.vue";

// Element Plus components
import { ElSelect, ElOption, ElInput, ElButton } from 'element-plus';

// Data
const invoiceData = ref(null);
const invoiceNumber = ref("");
const loading = ref(false);
const errorMessage = ref("");
const recentInvoices = ref([]);

// Filters
const filters = ref({
    product: '',
    color: '',
    size: '',
    quantity: ''
});

// Computed properties
const filteredItems = computed(() => {
    if (!invoiceData.value || !invoiceData.value.items) return [];

    return invoiceData.value.items.filter(item => {
        // Product filter
        if (filters.value.product && !item.product.name.toLowerCase().includes(filters.value.product.toLowerCase())) {
            return false;
        }

        // Color filter
        if (filters.value.color && !item.color.name.toLowerCase().includes(filters.value.color.toLowerCase())) {
            return false;
        }

        // Size filter
        if (filters.value.size && !item.size.display_name.toLowerCase().includes(filters.value.size.toLowerCase())) {
            return false;
        }

        // Quantity filter
        if (filters.value.quantity) {
            const quantityFilter = filters.value.quantity.toLowerCase();
            if (quantityFilter.includes('>')) {
                const value = parseInt(quantityFilter.replace('>', '').trim());
                if (isNaN(value) || item.quantity <= value) return false;
            } else if (quantityFilter.includes('<')) {
                const value = parseInt(quantityFilter.replace('<', '').trim());
                if (isNaN(value) || item.quantity >= value) return false;
            } else {
                const value = parseInt(quantityFilter);
                if (!isNaN(value) && item.quantity !== value) return false;
            }
        }

        return true;
    });
});

// Methods
const loadRecentInvoices = async () => {
    try {
        const res = await axios.get('/purchase-history/recent/');
        if (res.data && res.data.results) {
            recentInvoices.value = res.data.results;
        }
    } catch (error) {
        console.error("Error loading recent invoices:", error);
    }
};

const fetchInvoiceStock = async () => {
    if (!invoiceNumber.value) {
        errorMessage.value = "Please select or enter an invoice number";
        return;
    }

    loading.value = true;
    errorMessage.value = "";
    invoiceData.value = null;
    
    // Reset filters when searching new invoice
    filters.value = {
        product: '',
        color: '',
        size: '',
        quantity: ''
    };

    try {
        const res = await axios.get(`/purchase-history/search/?invoice=${invoiceNumber.value}`);
        
        if (Array.isArray(res.data) && res.data.length > 0) {
            invoiceData.value = res.data[0];
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

const applyFilters = () => {
    // Filters are applied automatically through computed property
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

// Export functions
const exportExcel = () => {
    if (!invoiceData.value) return;

    const wb = XLSX.utils.book_new();
    const wsData = [];

    // Header
    wsData.push(["Invoice Stock Report"]);
    wsData.push([`Invoice Number: ${invoiceData.value.invoice_number}`]);
    wsData.push([`Invoice Date: ${formatDate(invoiceData.value.invoice_date)}`]);
    wsData.push([`Supplier: ${invoiceData.value.supplier.name}`]);
    wsData.push([`Company: ${invoiceData.value.supplier.company_name}`]);
    wsData.push([`Contact: ${invoiceData.value.supplier.contact_number}`]);
    wsData.push([`Total Items: ${invoiceData.value.total_items}`]);
    wsData.push([]);

    // Table header
    wsData.push(["Product", "SKU", "Color", "Size", "Quantity"]);

    // Table data (use filtered data if filters are applied, otherwise all data)
    const exportData = filters.value.product || filters.value.color || filters.value.size || filters.value.quantity
        ? filteredItems.value
        : invoiceData.value.items;

    exportData.forEach(item => {
        wsData.push([
            item.product.name,
            item.product.sku,
            item.color.name,
            item.size.display_name,
            item.quantity
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
        { wch: 25 }, // Product
        { wch: 15 }, // SKU
        { wch: 15 }, // Color
        { wch: 10 }, // Size
        { wch: 12 }  // Quantity
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Invoice_Items");
    XLSX.writeFile(wb, `Invoice_${invoiceData.value.invoice_number}_Items.xlsx`);
};

const exportPDF = () => {
    if (!invoiceData.value) return;

    const doc = new jsPDF();

    // Header
    doc.setFontSize(16);
    doc.text("Invoice Stock Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Invoice Number: ${invoiceData.value.invoice_number}`, 14, 35);
    doc.text(`Invoice Date: ${formatDate(invoiceData.value.invoice_date)}`, 14, 42);
    doc.text(`Supplier: ${invoiceData.value.supplier.name}`, 14, 49);
    doc.text(`Company: ${invoiceData.value.supplier.company_name}`, 14, 56);
    doc.text(`Contact: ${invoiceData.value.supplier.contact_number}`, 14, 63);
    doc.text(`Total Items: ${invoiceData.value.total_items}`, 14, 70);

    // Table data (use filtered data if filters are applied, otherwise all data)
    const exportData = filters.value.product || filters.value.color || filters.value.size || filters.value.quantity
        ? filteredItems.value
        : invoiceData.value.items;

    const tableData = exportData.map(item => [
        item.product.name,
        item.product.sku,
        item.color.name,
        item.size.display_name,
        item.quantity.toString()
    ]);

    autoTable(doc, {
        head: [["Product", "SKU", "Color", "Size", "Quantity"]],
        body: tableData,
        startY: 80,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Invoice_${invoiceData.value.invoice_number}_Items.pdf`);
};

onMounted(() => {
    loadRecentInvoices();
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
</style>