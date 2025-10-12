<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">📦 Create Packing Slip</h2>

                <!-- Loading Overlay -->
                <div v-if="loading" class="loading-overlay">
                    <div class="loading-content">
                        <div class="loading-spinner"></div>
                        <p>Saving Packing Slip...</p>
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

                <!-- Customer Selection -->
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer</label>
                        <el-select v-model="selectedCustomer" @change="autoSaveDraft" filterable
                            placeholder="Select Customer" class="w-full" :disabled="loading" clearable>
                            <el-option v-for="c in sortedCustomers" :key="c.id"
                                :label="`${c.name} (${c.place || 'No place'})`" :value="c.id" />
                        </el-select>
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
                            <tr v-for="(item, idx) in packingItems" :key="idx">
                                <td class="index-col">{{ idx + 1 }}</td>
                                <td>
                                    <el-select v-model="item.productId" @change="onProductChange(idx)" filterable
                                        placeholder="Select Product" class="w-full" :disabled="loading" clearable>
                                        <el-option v-for="p in sortedProducts" :key="p.id" :label="p.name"
                                            :value="p.id" />
                                    </el-select>
                                </td>
                                <td>
                                    <el-select v-model="item.colorId" @change="onColorChange(idx)" filterable
                                        placeholder="Select Color" class="w-full" :disabled="loading || !item.productId"
                                        clearable>
                                        <el-option v-for="color in getAvailableColors(idx)" :key="color.color_id"
                                            :label="color.color_name" :value="color.color_id"
                                            :disabled="color.total_quantity === 0">
                                            <span :class="{ 'text-red-500': color.total_quantity === 0 }">
                                                {{ color.color_name }}
                                                <span v-if="color.total_quantity === 0" class="text-xs text-red-500">
                                                    (Out of stock)
                                                </span>
                                            </span>
                                        </el-option>
                                    </el-select>
                                </td>
                                <td>
                                    <el-select v-model="item.sizeId" @change="onSizeChange(idx)" filterable
                                        placeholder="Select Size" class="w-full" :disabled="loading || !item.colorId"
                                        clearable>
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
                                    <span class="available-qty">{{ item.maxQuantity }}</span>
                                </td>
                                <td class="action-col">
                                    <button class="btn danger" @click="removeItem(idx)" :disabled="loading">❌</button>
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

                <!-- Save/Export Buttons -->
                <div class="form-actions">
                    <button class="btn draft" @click="manualSaveDraft" :disabled="!hasFormData || loading">💾 Save
                        Draft</button>
                    <button class="btn save" @click="savePackingSlip" :disabled="!canSave || loading">
                        <span v-if="loading">⏳ Saving...</span>
                        <span v-else>Save Packing Slip</span>
                    </button>
                    <button class="btn excel" @click="saveAndExportExcel" :disabled="!canSave || loading">
                        <span v-if="loading">⏳ Saving...</span>
                        <span v-else>📊 Save & Download Excel</span>
                    </button>
                    <button class="btn pdf" @click="saveAndExportPDF" :disabled="!canSave || loading">
                        <span v-if="loading">⏳ Saving...</span>
                        <span v-else>📄 Save & Download PDF</span>
                    </button>
                    <button class="btn reset" @click="resetForm" :disabled="loading">🔄 Reset</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Element Plus components
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/dist/index.css';

// Form State
const selectedCustomer = ref("");

// Data
const customers = ref([]);
const products = ref([]);
const packingItems = ref([createEmptyItem()]);

// Loading state
const loading = ref(false);

// Draft Management
const draftTimestamp = ref(null);
const DRAFT_KEY = 'packing_slip_draft';
const AUTO_SAVE_DELAY = 2000; // 2 seconds
let autoSaveTimeout = null;

// Computed properties for sorted data
const sortedCustomers = computed(() => {
    return [...customers.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => a.name.localeCompare(b.name));
});

const sortedAvailableColors = (colors) => {
    if (!colors) return [];
    return [...colors].sort((a, b) => a.color_name.localeCompare(b.color_name));
};

const sortedAvailableSizes = (sizes) => {
    if (!sizes) return [];
    // Define custom size order for better sorting
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

    // Only consider rows that have actual data (not empty rows)
    const validRows = packingItems.value.filter(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0 && item.quantity <= item.maxQuantity
    );

    // Must have at least one valid row
    if (validRows.length === 0) return false;

    // Check if there are any incomplete rows that have started but not finished
    const hasIncompleteRows = packingItems.value.some(item =>
        // A row is incomplete if it has any field filled but not all required fields
        (item.productId || item.colorId || item.sizeId || item.quantity > 1) &&
        (!item.productId || !item.colorId || !item.sizeId || item.quantity === 0)
    );

    // If there are incomplete rows, disable save
    if (hasIncompleteRows) return false;

    return true;
});

const hasFormData = computed(() => {
    return selectedCustomer.value || packingItems.value.some(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0
    );
});

const hasDraft = computed(() => {
    return localStorage.getItem(DRAFT_KEY) !== null;
});

// Create empty item
function createEmptyItem() {
    return {
        productId: "",
        colorId: "",
        sizeId: "",
        quantity: 1,
        maxQuantity: 0,
        availableColors: [],
        availableSizes: [],
        stockData: [],
        colorStockData: []
    };
}

// Draft Management Functions
const saveDraft = () => {
    // Only save valid rows to draft
    const validItems = packingItems.value.filter(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0
    );

    const draftData = {
        selectedCustomer: selectedCustomer.value,
        packingItems: validItems.length > 0 ? validItems.map(item => ({
            productId: item.productId,
            colorId: item.colorId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            maxQuantity: item.maxQuantity
        })) : [],
        timestamp: new Date().toISOString()
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    draftTimestamp.value = draftData.timestamp;

    console.log('Packing slip draft saved successfully');
};

const loadDraft = async () => {
    try {
        const draftData = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draftData) {
            selectedCustomer.value = draftData.selectedCustomer || "";

            // Restore basic item data - ensure we have at least one row
            if (draftData.packingItems && draftData.packingItems.length > 0) {
                packingItems.value = draftData.packingItems.map(itemData => ({
                    ...createEmptyItem(),
                    ...itemData
                }));
            } else {
                packingItems.value = [createEmptyItem()];
            }

            draftTimestamp.value = draftData.timestamp;

            // Reload dynamic data for each item (colors, sizes, etc.)
            for (let idx = 0; idx < packingItems.value.length; idx++) {
                const item = packingItems.value[idx];
                if (item.productId) {
                    await reloadProductData(idx);
                }
            }

            alert('Draft loaded successfully!');
        }
    } catch (error) {
        console.error('Error loading draft:', error);
        alert('Error loading draft. The draft data might be corrupted.');
    }
};

const reloadProductData = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId) return;

    try {
        // Reload product data
        const res = await axios.get(`/available-stock/?product_id=${item.productId}`);
        item.stockData = res.data;

        // Extract unique colors 
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

        // If color was previously selected, reload sizes
        if (item.colorId) {
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

            // Update max quantity if size was selected
            if (item.sizeId) {
                updateAvailableQuantity(idx);
            }
        }
    } catch (error) {
        console.error('Error reloading product data:', error);
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
watch([selectedCustomer, packingItems], () => {
    const hasRealData = selectedCustomer.value || packingItems.value.some(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0
    );

    if (hasRealData) {
        autoSaveDraft();
    }
}, { deep: true });

// API Calls
onMounted(async () => {
    await Promise.all([
        loadCustomers(),
        loadProducts()
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

// Load available colors when product changes
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
        // extract colors
        const res = await axios.get(`/available-stock/?product_id=${item.productId}`);
        item.stockData = res.data;

        // Extract unique colors 
        const colorMap = new Map();

        item.stockData.forEach(stock => {
            if (colorMap.has(stock.color_id)) {
                // Add to existing color total
                colorMap.get(stock.color_id).total_quantity += stock.available_quantity;
            } else {
                // Create new color entry
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

const onColorChange = async (idx) => {
    const item = packingItems.value[idx];
    if (!item.productId || !item.colorId) {
        item.availableSizes = [];
        item.sizeId = "";
        item.maxQuantity = 0;
        return;
    }

    try {
        const res = await axios.get(`/available-stock/?product_id=${item.productId}`);
        const allStockData = res.data;

        const allSizesMap = new Map();

        allStockData.forEach(stock => {
            if (!allSizesMap.has(stock.size_id)) {
                allSizesMap.set(stock.size_id, {
                    size_id: stock.size_id,
                    size_code: stock.size_code,
                    available_quantity: 0
                });
            }
        });

        const colorStockData = allStockData.filter(stock =>
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
        item.sizeId = "";
        item.maxQuantity = 0;

        // Store both all data and filtered data
        item.stockData = allStockData;
        item.colorStockData = colorStockData;

    } catch (error) {
        console.error("Error loading available sizes:", error);
        item.availableSizes = [];
    }
};

// Updated size change handler with proper automatic row addition
const onSizeChange = (idx) => {
    updateAvailableQuantity(idx);

    // If this is the last row and all fields are filled, add a new row
    const currentItem = packingItems.value[idx];
    if (idx === packingItems.value.length - 1 &&
        currentItem.productId &&
        currentItem.colorId &&
        currentItem.sizeId &&
        currentItem.quantity > 0) {

        // Wait a bit for the current selection to settle, then add new row
        setTimeout(() => {
            addNewRow();
        }, 300);
    }
};

const updateAvailableQuantity = (idx) => {
    const item = packingItems.value[idx];
    if (item.sizeId && item.colorStockData && item.colorStockData.length > 0) {
        const matchingStock = item.colorStockData.find(stock =>
            parseInt(stock.size_id) === parseInt(item.sizeId)
        );

        if (matchingStock) {
            item.maxQuantity = matchingStock.available_quantity;

            if (item.quantity > item.maxQuantity) {
                item.quantity = item.maxQuantity;
            }
        } else {
            item.maxQuantity = 0;
            item.quantity = 0;
        }
    } else {
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
    // Only add new row if the last row is not empty
    const lastItem = packingItems.value[packingItems.value.length - 1];
    if (lastItem.productId || lastItem.colorId || lastItem.sizeId || lastItem.quantity > 1) {
        packingItems.value.push(createEmptyItem());

        // Scroll to the new row
        nextTick(() => {
            const tableWrapper = document.querySelector('.table-wrapper');
            if (tableWrapper) {
                tableWrapper.scrollTop = tableWrapper.scrollHeight;
            }
        });
    } else {
        alert('Please fill the current row before adding a new one.');
    }
};

const removeItem = (idx) => {
    const removedItem = packingItems.value[idx];
    packingItems.value.splice(idx, 1);

    // Ensure we have at least one row
    if (packingItems.value.length === 0) {
        packingItems.value = [createEmptyItem()];
    }
};

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
};

// Helper functions for export
const getCustomerName = () => {
    const customer = customers.value.find(c => c.id == selectedCustomer.value);
    return customer ? customer.name : `Customer #${selectedCustomer.value}`;
};

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

// Export Functions
const exportExcel = (slipData) => {
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const grouped = groupByProduct(slipData.lines);
    const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

    // Slip header
    wsData.push(["Packing Slip Report"]);
    wsData.push([`Slip Number: ${slipData.slip_number}`]);
    wsData.push([`Date: ${formatDate(slipData.date)}`]);
    wsData.push([`Customer: ${getCustomerName()}`]);
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
    doc.text(`Customer: ${getCustomerName()}`, 14, 49);

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

// Main save and export functions
const savePackingSlip = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields and ensure quantities don't exceed available stock!");
        return;
    }

    loading.value = true;
    try {
        const slipData = await createPackingSlip();

        // Clear draft after successful save
        clearDraft();

        alert("Packing slip created successfully!");
        resetForm();
    } catch (err) {
        console.error("Error creating packing slip:", err);
        alert("Error creating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

const saveAndExportExcel = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields and ensure quantities don't exceed available stock!");
        return;
    }

    loading.value = true;
    try {
        const slipData = await createPackingSlip();

        // Clear draft after successful save
        clearDraft();

        exportExcel(slipData);
        alert("Packing slip created and Excel downloaded successfully!");
        resetForm();
    } catch (err) {
        console.error("Error creating packing slip:", err);
        alert("Error creating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};

const saveAndExportPDF = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields and ensure quantities don't exceed available stock!");
        return;
    }

    loading.value = true;
    try {
        const slipData = await createPackingSlip();

        // Clear draft after successful save
        clearDraft();

        exportPDF(slipData);
        alert("Packing slip created and PDF downloaded successfully!");
        resetForm();
    } catch (err) {
        console.error("Error creating packing slip:", err);
        alert("Error creating packing slip! Please check the console for details.");
    } finally {
        loading.value = false;
    }
};


const createPackingSlip = async () => {
    // Generate slip number
    const slipNumber = `PSLIP${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];

    // Filter out empty rows and only send valid ones
    const validItems = packingItems.value.filter(item =>
        item.productId && item.colorId && item.sizeId && item.quantity > 0
    );

    if (validItems.length === 0) {
        throw new Error("No valid items to save");
    }

    // Prepare lines array with names and codes from valid items only
    const lines = validItems.map(item => {
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

    console.log('Sending lines to API:', lines); // Debug log


    const response = await axios.post("/packingslips/", {
        slip_number: slipNumber,
        date: today,
        customer: selectedCustomer.value,
        lines: lines
    });

    // Return the created slip data for export with names included
    return {
        slip_number: slipNumber,
        date: today,
        customer: selectedCustomer.value,
        lines: lines
    };
};

// Reset form
const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? Any unsaved changes will be lost.')) {
        selectedCustomer.value = "";
        packingItems.value = [createEmptyItem()];
        // Don't clear draft on reset, let user decide
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

.available-col {
    width: 90px;
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

.btn.save {
    background: #4CAF50;
    color: #fff;
}

.btn.excel {
    background: #059669;
    color: #fff;
}

.btn.pdf {
    background: #dc2626;
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

.text-red-500 {
    color: #f44336;
}

.text-green-600 {
    color: #059669;
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