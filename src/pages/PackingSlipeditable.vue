<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">📦 Edit Packing Slip</h2>

                <!-- Loading Overlay -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>Loading Packing Slip...</p>
                        <p class="loading-subtext">Please wait while we load your data</p>
                    </div>
                </div>

                <!-- Search/Edit Section -->
                <div class="search-section">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Select Packing Slip to Edit</label>
                            <el-select v-model="selectedSlipNumber" @change="loadPackingSlipForEdit" filterable
                                placeholder="Select Packing Slip from dropdown" class="w-full"
                                :disabled="loading || loadingSlips" clearable>
                                <el-option v-for="slip in sortedPackingSlips" :key="slip.id"
                                    :label="`${slip.slip_number} - ${formatDate(slip.date)} - ${slip.customer_name}`"
                                    :value="slip.slip_number" />
                            </el-select>
                            <div v-if="loadingSlips" class="loading-text">Loading packing slips...</div>
                        </div>
                    </div>
                </div>

                <!-- Editing Section (Only shown when a slip is selected) -->
                <div v-if="isEditing" class="editing-section">
                    <!-- Customer Display (Read-only in edit mode) -->
                    <div class="form-row">
                        <div class="form-group">
                            <label>Customer</label>
                            <div class="customer-display">
                                {{ getCustomerNameById(selectedCustomer) }}
                            </div>
                        </div>
                    </div>

                    <!-- Packing Slip Items Table -->
                    <div class="table-wrapper">
                        <table class="stock-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Color</th>
                                    <th>Size</th>
                                    <th class="quantity-col">QTY</th>
                                    <th class="available-col">Available</th>
                                    <th class="action-col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, idx) in packingItems" :key="item.lineId || idx">
                                    <td class="index-col">{{ idx + 1 }}</td>
                                    <td>
                                        <!-- Make product editable for new rows, read-only for existing rows -->
                                        <div v-if="item.lineId" class="readonly-field">{{ getProductName(item.productId)
                                            }}</div>
                                        <el-select v-else v-model="item.productId" @change="onProductChange(idx)"
                                            filterable placeholder="Select Product" class="w-full" :disabled="loading"
                                            clearable>
                                            <el-option v-for="p in sortedProducts" :key="p.id" :label="p.name"
                                                :value="p.id" />
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-select v-model="item.colorId" @change="onColorChange(idx)" filterable
                                            placeholder="Select Color" class="w-full"
                                            :disabled="loading || !item.productId" clearable>
                                            <el-option v-for="color in getAvailableColors(idx)" :key="color.color_id"
                                                :label="color.color_name" :value="color.color_id"
                                                :disabled="color.total_quantity === 0">
                                                <span :class="{ 'text-red-500': color.total_quantity === 0 }">
                                                    {{ color.color_name }}
                                                    <span v-if="color.total_quantity === 0"
                                                        class="text-xs text-red-500">
                                                        (Out of stock)
                                                    </span>
                                                </span>
                                            </el-option>
                                        </el-select>
                                    </td>
                                    <td>
                                        <el-select v-model="item.sizeId" @change="onSizeChange(idx)" filterable
                                            placeholder="Select Size" class="w-full"
                                            :disabled="loading || !item.colorId" clearable>
                                            <el-option v-for="size in getAvailableSizes(idx)" :key="size.size_id"
                                                :label="`${size.size_code} (${size.available_quantity})`"
                                                :value="size.size_id" :disabled="size.available_quantity === 0">
                                                <span :class="{ 'text-red-500': size.available_quantity === 0 }">
                                                    {{ size.size_code }}
                                                    <span class="text-xs"
                                                        :class="size.available_quantity === 0 ? 'text-red-500' : 'text-green-600'">
                                                        ({{ size.available_quantity }})
                                                    </span>
                                                </span>
                                            </el-option>
                                        </el-select>
                                    </td>
                                    <td class="quantity-col">
                                        <input type="number" v-model="item.quantity" min="1" :max="item.maxQuantity"
                                            class="quantity-input" @input="validateQuantity(idx)" :disabled="loading" />
                                    </td>
                                    <td class="available-col">
                                        <span class="available-qty">{{ item.availableStock }}</span>
                                    </td>
                                    <td class="action-col">
                                        <button class="btn danger" @click="removeItem(idx)"
                                            :disabled="loading">❌</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="7" class="add-row">
                                        <button class="btn add-row-btn" @click="addNewRow" :disabled="loading">➕ Add New
                                            Row</button>
                                    </td>
                                </tr>
                                <tr class="total-row">
                                    <td colspan="5"><strong>Total</strong></td>
                                    <td colspan="2"><strong>{{ totalQuantity }} QTY</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Action Buttons -->
                    <div class="form-actions">
                        <button class="btn update" @click="updatePackingSlip" :disabled="!canSave || loading">
                            <span v-if="loading">⏳ Updating...</span>
                            <span v-else>🔄 Update Packing Slip</span>
                        </button>

                        <button class="btn remove" @click="removePackingSlip" :disabled="loading">
                            <span v-if="loading">⏳ Removing...</span>
                            <span v-else>🗑️ Remove Packing Slip</span>
                        </button>

                        <button class="btn excel" @click="updateAndExportExcel" :disabled="!canSave || loading">
                            <span v-if="loading">⏳ Saving...</span>
                            <span v-else>📊 Update & Download Excel</span>
                        </button>

                        <button class="btn pdf" @click="updateAndExportPDF" :disabled="!canSave || loading">
                            <span v-if="loading">⏳ Saving...</span>
                            <span v-else>📄 Update & Download PDF</span>
                        </button>

                        <button class="btn cancel" @click="cancelEdit" :disabled="loading">❌ Cancel Edit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

import { useRoute } from 'vue-router';

const route = useRoute();

// Element Plus components
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/dist/index.css';

// Form State
const selectedCustomer = ref("");
const selectedSlipNumber = ref("");
const isEditing = ref(false);
const currentSlipId = ref(null);

// Data
const customers = ref([]);
const products = ref([]);
const packingItems = ref([]);
const packingSlips = ref([]); // All packing slips from API

// Loading state
const loading = ref(false);
const searchLoading = ref(false);
const loadingSlips = ref(false);

// Computed properties
const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => a.name.localeCompare(b.name));
});

// Sort packing slips by date in descending order (newest first)
const sortedPackingSlips = computed(() => {
    return [...packingSlips.value].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
});

const sortedAvailableColors = (colors) => {
    if (!colors) return [];
    return [...colors].sort((a, b) => a.color_name.localeCompare(b.color_name));
};

const sortedAvailableSizes = (sizes) => {
    if (!sizes) return [];
    const sizeOrder = { 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, 'XXXL': 6 };
    return [...sizes].sort((a, b) => {
        const orderA = sizeOrder[a.size_code] || 999;
        const orderB = sizeOrder[b.size_code] || 999;
        return orderA - orderB;
    });
};

// Get available colors for a specific row (allow multiple same colors but filter based on product)
const getAvailableColors = (currentIndex) => {
    const currentItem = packingItems.value[currentIndex];
    if (!currentItem.productId || !currentItem.availableColors) {
        return sortedAvailableColors(currentItem.availableColors || []);
    }

    return sortedAvailableColors(currentItem.availableColors || []);
};

// Get available sizes for a specific row (prevent duplicate sizes for same product-color combo)
const getAvailableSizes = (currentIndex) => {
    const currentItem = packingItems.value[currentIndex];
    if (!currentItem.productId || !currentItem.colorId || !currentItem.availableSizes) {
        return sortedAvailableSizes(currentItem.availableSizes || []);
    }

    // Get all sizes that are already selected for the same product and color in other rows
    const selectedSizes = packingItems.value
        .filter((item, index) =>
            index !== currentIndex &&
            item.productId === currentItem.productId &&
            item.colorId === currentItem.colorId &&
            item.sizeId
        )
        .map(item => item.sizeId);

    // Filter out sizes that are already selected for the same product-color combination
    return sortedAvailableSizes(currentItem.availableSizes || []).filter(size =>
        !selectedSizes.includes(size.size_id)
    );
};

const totalQuantity = computed(() =>
    packingItems.value.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)
);

const canSave = computed(() => {
    if (!selectedCustomer.value) return false;

    const validRows = packingItems.value.filter(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0 && item.quantity <= item.maxQuantity
    );

    if (validRows.length === 0) return false;

    const hasIncompleteRows = packingItems.value.some(item =>
        (item.productId || item.colorId || item.sizeId || item.quantity > 1) &&
        (!item.productId || !item.colorId || !item.sizeId || item.quantity === 0)
    );

    if (hasIncompleteRows) return false;

    return true;
});

// Helper functions
const getCustomerNameById = (customerId) => {
    const customer = customers.value.find(c => c.id == customerId);
    return customer ? customer.name : `Customer #${customerId}`;
};

const getProductName = (productId) => {
    const product = products.value.find(p => p.id == productId);
    return product ? product.name : `Product #${productId}`;
};

// Create empty item
function createEmptyItem() {
    return {
        lineId: null, // null for new rows
        productId: "",
        colorId: "",
        sizeId: "",
        quantity: 1,
        maxQuantity: 0,
        availableColors: [],
        availableSizes: [],
        stockData: [],
        colorStockData: [],
        availableStock: 0,
    };
}

// Load all packing slips from API
const loadAllPackingSlips = async () => {
    loadingSlips.value = true;
    try {
        const response = await axios.get('/packingslips/recent/');

        if (response.data && response.data.results) {
            packingSlips.value = response.data.results;
        } else if (Array.isArray(response.data)) {
            packingSlips.value = response.data;
        } else {
            packingSlips.value = [];
            console.error('Unexpected API response format:', response.data);
        }
    } catch (error) {
        console.error("Error loading packing slips:", error);
        packingSlips.value = [];
    } finally {
        loadingSlips.value = false;
    }
};


const checkUrlForSlipNumber = () => {
    const slipNumberFromUrl = route.query.slip_number;
    if (slipNumberFromUrl) {
        selectedSlipNumber.value = slipNumberFromUrl;
        console.log('Auto-loading packing slip from URL:', slipNumberFromUrl);


        setTimeout(() => {
            loadPackingSlipForEdit();
        }, 500);
    }
};

// Load packing slip for editing
const loadPackingSlipForEdit = async () => {
    if (!selectedSlipNumber.value) return;

    loading.value = true;
    try {
        const response = await axios.get(`/packingslip/search/?slip_number=${selectedSlipNumber.value}`);
        let slipData;

        if (Array.isArray(response.data)) {
            slipData = response.data.find(slip => slip.slip_number === selectedSlipNumber.value) || response.data[0];
        } else if (response.data.results && Array.isArray(response.data.results)) {
            slipData = response.data.results.find(slip => slip.slip_number === selectedSlipNumber.value) || response.data.results[0];
        } else if (response.data.slip_number) {
            slipData = response.data;
        } else {
            slipData = response.data;
        }

        if (slipData && slipData.slip_number) {
            currentSlipId.value = slipData.id;
            selectedCustomer.value = slipData.customer;
            isEditing.value = true;

            packingItems.value = [];

            for (const line of slipData.lines) {
                const newItem = {
                    lineId: line.id,
                    productId: line.product,
                    colorId: line.color,
                    sizeId: line.size,
                    quantity: line.quantity,
                    maxQuantity: 9999,
                    availableColors: [],
                    availableSizes: [],
                    stockData: [],
                    colorStockData: []
                };

                packingItems.value.push(newItem);
                await loadProductDataForEdit(packingItems.value.length - 1);
            }


            if (!route.query.slip_number) {
                alert(`Packing slip "${slipData.slip_number}" loaded for editing!`);
            }
        } else {
            alert('Packing slip not found or invalid data format!');
        }
    } catch (error) {
        console.error("Error loading packing slip:", error);
        alert('Error loading packing slip for editing!');
    } finally {
        loading.value = false;
    }
};

// Format date for display
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

// Load product data for editing
const loadProductDataForEdit = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId) return;

    try {
        const res = await axios.get(`/available-stock/?product_id=${item.productId}`);
        item.stockData = res.data;

        const colorMap = new Map();
        item.stockData.forEach(stock => {
            if (colorMap.has(stock.color_id)) {
                colorMap.get(stock.color_id).total_quantity += stock.available_quantity;
            } else {
                colorMap.set(stock.color_id, {
                    color_id: stock.color_id,
                    color_name: stock.color_name,
                    total_quantity: stock.available_quantity
                });
            }
        });

        item.availableColors = Array.from(colorMap.values());

        if (item.colorId) {
            await loadSizesForColor(idx);
        }

        if (item.sizeId) {
            updateAvailableQuantity(idx);
        }

    } catch (error) {
        console.error('Error loading product data for edit:', error);
    }
};

// Load sizes for selected color
const loadSizesForColor = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId || !item.colorId) return;

    try {
        const allSizesMap = new Map();
        item.stockData.forEach(stock => {
            if (!allSizesMap.has(stock.size_id)) {
                allSizesMap.set(stock.size_id, {
                    size_id: stock.size_id,
                    size_code: stock.size_code,
                    available_quantity: 0
                });
            }
        });

        const colorStockData = item.stockData.filter(stock =>
            parseInt(stock.color_id) === parseInt(item.colorId)
        );

        const availableSizes = Array.from(allSizesMap.values()).map(size => {
            const colorStock = colorStockData.find(stock =>
                parseInt(stock.size_id) === parseInt(size.size_id)
            );
            return {
                ...size,
                available_quantity: colorStock ? colorStock.available_quantity : 0
            };
        });

        item.availableSizes = availableSizes;
        item.colorStockData = colorStockData;

    } catch (error) {
        console.error('Error loading sizes for color:', error);
    }
};

// Product change handler for new rows
const onProductChange = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId) {
        item.availableColors = [];
        item.availableSizes = [];
        item.stockData = [];
        item.maxQuantity = 0;
        item.colorId = "";
        item.sizeId = "";
        return;
    }

    try {
        const res = await axios.get(`/available-stock/?product_id=${item.productId}`);
        item.stockData = res.data;

        const colorMap = new Map();
        item.stockData.forEach(stock => {
            if (colorMap.has(stock.color_id)) {
                colorMap.get(stock.color_id).total_quantity += stock.available_quantity;
            } else {
                colorMap.set(stock.color_id, {
                    color_id: stock.color_id,
                    color_name: stock.color_name,
                    total_quantity: stock.available_quantity
                });
            }
        });

        item.availableColors = Array.from(colorMap.values());
        item.colorId = "";
        item.sizeId = "";
        item.availableSizes = [];
        item.maxQuantity = 0;

    } catch (error) {
        console.error("Error loading available stock:", error);
        item.availableColors = [];
        item.availableSizes = [];
        item.stockData = [];
    }
};

// Color change handler
const onColorChange = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId || !item.colorId) {
        item.availableSizes = [];
        item.sizeId = "";
        item.maxQuantity = 0;
        return;
    }

    try {
        await loadSizesForColor(idx);
        item.sizeId = "";
        item.maxQuantity = 0;

    } catch (error) {
        console.error("Error loading available sizes:", error);
        item.availableSizes = [];
    }
};

// Size change handler
const onSizeChange = (idx) => {
    updateAvailableQuantity(idx);
};

const updateAvailableQuantity = (idx) => {
    const item = packingItems.value[idx];
    if (item.sizeId && item.colorStockData && item.colorStockData.length > 0) {
        const matchingStock = item.colorStockData.find(stock =>
            parseInt(stock.size_id) === parseInt(item.sizeId)
        );

        if (matchingStock) {
            // Show actual available stock in the Available column (5)
            item.availableStock = matchingStock.available_quantity;


            // So max allowed = current quantity + available stock - 1
            const currentQuantityInThisRow = item.quantity || 0;
            item.maxQuantity = currentQuantityInThisRow + matchingStock.available_quantity - 1;

            // Ensure quantity doesn't exceed the new max
            if (item.quantity > item.maxQuantity) {
                item.quantity = item.maxQuantity;
            }
        } else {
            item.availableStock = 0;
            item.maxQuantity = 0;
            item.quantity = 0;
        }
    } else {
        item.availableStock = 0;
        item.maxQuantity = 0;
    }
};
const validateQuantity = (idx) => {
    const item = packingItems.value[idx];
    if (item.quantity > item.maxQuantity) {
        item.quantity = item.maxQuantity;
    }
    if (item.quantity < 1) {
        item.quantity = 1;
    }
};

const addNewRow = () => {
    packingItems.value.push(createEmptyItem());

    nextTick(() => {
        const tableWrapper = document.querySelector('.table-wrapper');
        if (tableWrapper) {
            tableWrapper.scrollTop = tableWrapper.scrollHeight;
        }
    });
};

const removeItem = (idx) => {
    packingItems.value.splice(idx, 1);
};

// Update packing slip
const updatePackingSlip = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

    loading.value = true;
    try {
        const updateData = {
            slip_number: selectedSlipNumber.value,
            customer: selectedCustomer.value,
            date: new Date().toISOString().split('T')[0],
            lines: packingItems.value.map(item => ({
                id: item.lineId,
                product: item.productId,
                color: item.colorId,
                size: item.sizeId,
                quantity: item.quantity
            }))
        };

        console.log('Update data:', updateData);

        await axios.put(`packingslip/update/${currentSlipId.value}/`, updateData);

        alert("Packing slip updated successfully!");
        resetForm();
    } catch (err) {
        console.error("Error updating packing slip:", err);
        alert("Error updating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

// Common function to update and get slip data
const updateAndGetSlipData = async () => {
    const updateData = {
        slip_number: selectedSlipNumber.value,
        customer: selectedCustomer.value,
        date: new Date().toISOString().split('T')[0],
        lines: packingItems.value.map(item => ({
            id: item.lineId,
            product: item.productId,
            color: item.colorId,
            size: item.sizeId,
            quantity: item.quantity
        }))
    };

    console.log('Update data for export:', updateData);

    await axios.put(`packingslip/update/${currentSlipId.value}/`, updateData);

    // Prepare data for export with names
    const linesForExport = packingItems.value.map(item => {
        const product = products.value.find(p => p.id == item.productId);
        const color = item.availableColors.find(c => c.color_id == item.colorId);
        const size = item.availableSizes.find(s => s.size_id == item.sizeId);

        return {
            product: item.productId,
            product_name: product ? product.name : `Product ${item.productId}`,
            color: item.colorId,
            color_name: color ? color.color_name : `Color ${item.colorId}`,
            size: item.sizeId,
            size_code: size ? size.size_code : `Size ${item.sizeId}`,
            quantity: item.quantity
        };
    });

    return {
        slip_number: selectedSlipNumber.value,
        date: new Date().toISOString().split('T')[0],
        customer: selectedCustomer.value,
        lines: linesForExport
    };
};

// Update and export functions
const updateAndExportExcel = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

    loading.value = true;
    try {
        const slipData = await updateAndGetSlipData();
        exportExcel(slipData);
        alert("Packing slip updated and Excel downloaded successfully!");
        resetForm();
    } catch (err) {
        console.error("Error updating packing slip:", err);
        alert("Error updating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

const updateAndExportPDF = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

    loading.value = true;
    try {
        const slipData = await updateAndGetSlipData();
        exportPDF(slipData);
        alert("Packing slip updated and PDF downloaded successfully!");
        resetForm();
    } catch (err) {
        console.error("Error updating packing slip:", err);
        alert("Error updating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

// Export functions (same as create component)
const exportExcel = (slipData) => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const grouped = groupByProduct(slipData.lines);
    const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

    // Slip header
    wsData.push(["Packing Slip Report"]);
    wsData.push([`Slip Number: ${slipData.slip_number}`]);
    wsData.push([`Date: ${formatDate(slipData.date)}`]);
    wsData.push([`Customer: ${getCustomerNameById(slipData.customer)}`]);
    wsData.push([]);

    Object.keys(grouped).forEach((product) => {
        const group = grouped[product];

        // Product heading
        wsData.push([product]);

        // Header row
        wsData.push(["Color", ...sizeHeaders, "Total Qty"]);

        // Data rows
        group.rows.forEach((row) => {
            wsData.push([
                row.color,
                ...sizeHeaders.map(size => row.sizes[size] || 0),
                row.total
            ]);
        });

        // Grand total row
        wsData.push([
            "Grand Total",
            ...sizeHeaders.map(size => group.totals[size]),
            group.grandTotal
        ]);

        wsData.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, `Slip_${slipData.slip_number}`);
    XLSX.writeFile(wb, `PackingSlip_${slipData.slip_number}.xlsx`);
};

const exportPDF = (slipData) => {
    const doc = new jsPDF();
    const grouped = groupByProduct(slipData.lines);
    const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

    // Header
    doc.setFontSize(16);
    doc.text("Packing Slip Report", 105, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Slip #: ${slipData.slip_number}`, 14, 35);
    doc.text(`Date: ${formatDate(slipData.date)}`, 14, 42);
    doc.text(`Customer: ${getCustomerNameById(slipData.customer)}`, 14, 49);

    let y = 60;

    Object.keys(grouped).forEach((product) => {
        const group = grouped[product];

        // Product title
        doc.setFontSize(12);
        doc.text(product, 14, y);
        y += 8;

        // Table data
        const tableData = group.rows.map(row => [
            row.color,
            ...sizeHeaders.map(size => row.sizes[size] || 0),
            row.total.toString()
        ]);

        // Add grand total row
        tableData.push([
            "Grand Total",
            ...sizeHeaders.map(size => group.totals[size].toString()),
            group.grandTotal.toString()
        ]);

        autoTable(doc, {
            head: [["Color", ...sizeHeaders, "Total"]],
            body: tableData,
            startY: y,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [59, 130, 246] }
        });

        y = doc.lastAutoTable.finalY + 15;
    });

    doc.save(`PackingSlip_${slipData.slip_number}.pdf`);
};

// Group by product function
const groupByProduct = (lines) => {
    const grouped = {};
    const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

    lines.forEach((line) => {
        const product = line.product_name;
        const color = line.color_name;
        const size = line.size_code;
        const quantity = line.quantity;

        if (!grouped[product]) grouped[product] = {};
        if (!grouped[product][color]) {
            grouped[product][color] = {
                color,
                sizes: {},
                total: 0
            };
        }

        grouped[product][color].sizes[size] =
            (grouped[product][color].sizes[size] || 0) + quantity;
        grouped[product][color].total += quantity;
    });

    const result = {};
    Object.keys(grouped).forEach((product) => {
        const rows = Object.values(grouped[product]);
        const totals = {};
        let grandTotal = 0;

        sizeHeaders.forEach((size) => {
            totals[size] = rows.reduce((acc, row) => acc + (row.sizes[size] || 0), 0);
            grandTotal += totals[size];
        });

        result[product] = { rows, totals, grandTotal };
    });

    return result;
};

// Remove packing slip
const removePackingSlip = async () => {
    if (!confirm('Are you sure you want to remove this packing slip? This action cannot be undone.')) {
        return;
    }

    loading.value = true;
    try {
        await axios.delete(`/packingslips/${currentSlipId.value}/`);
        alert("Packing slip removed successfully!");
        resetForm();
    } catch (err) {
        console.error("Error removing packing slip:", err);
        alert("Error removing packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

// Cancel edit
const cancelEdit = () => {
    if (confirm('Are you sure you want to cancel editing? Any unsaved changes will be lost.')) {
        resetForm();
    }
};

// API Calls
onMounted(async () => {
    await Promise.all([
        loadCustomers(),
        loadProducts(),
        loadAllPackingSlips() // Load all packing slips on component mount
    ]);

    // Check for slip_number in URL after all data is loaded
    checkUrlForSlipNumber();
});

const loadCustomers = async () => {
    try {
        const res = await axios.get("/customers/");
        customers.value = res.data;
    } catch (error) {
        console.error("Error loading customers:", error);
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

// Reset form
const resetForm = () => {
    selectedCustomer.value = "";
    selectedSlipNumber.value = "";
    packingItems.value = [];
    isEditing.value = false;
    currentSlipId.value = null;
};

// Watch for route changes in case user navigates with browser back forward
watch(
    () => route.query.slip_number,
    (newSlipNumber) => {
        if (newSlipNumber) {
            selectedSlipNumber.value = newSlipNumber;
            loadPackingSlipForEdit();
        }
    }
);
</script>

<style scoped>
.loading-text {
    font-size: 12px;
    color: #666;
    margin-top: 5px;
    text-align: center;
}

.btn.excel {
    background: #059669;
    color: #fff;
}

.btn.pdf {
    background: #dc2626;
    color: #fff;
}

.btn.excel:hover:not(:disabled) {
    background: #047857;
}

.btn.pdf:hover:not(:disabled) {
    background: #b91c1c;
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

.search-section {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.search-section .form-group label {
    font-weight: 600;
    color: #495057;
}

.editing-section {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 2px solid #e9ecef;
}

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

.customer-display {
    padding: 10px 12px;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    font-weight: 500;
    color: #495057;
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

.index-col {
    width: 50px;
}

.quantity-col {
    width: 80px;
}

.available-col {
    width: 90px;
}

.action-col {
    width: 70px;
}

.quantity-input {
    width: 60px;
    padding: 6px;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.85rem;
}

.available-qty {
    font-weight: 600;
    color: #4CAF50;
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

.btn.update {
    background: #f59e0b;
    color: white;
}

.btn.update:hover:not(:disabled) {
    background: #d97706;
}

.btn.remove {
    background: #dc2626;
    color: white;
}

.btn.remove:hover:not(:disabled) {
    background: #b91c1c;
}

.btn.cancel {
    background: #6b7280;
    color: white;
}

.btn.cancel:hover:not(:disabled) {
    background: #4b5563;
}

.btn.danger {
    background: #f44336;
    color: #fff;
    padding: 6px 8px;
    border-radius: 3px;
    font-size: 0.8rem;
}

.text-red-500 {
    color: #f44336;
}

.text-green-600 {
    color: #059669;
}

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

@media (max-width: 768px) {
    .form-actions {
        flex-direction: column;
    }

    .btn {
        width: 100%;
        text-align: center;
    }

    .main-content {
        margin-left: 0;
        padding: 10px;
    }
}
</style>