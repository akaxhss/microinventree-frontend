<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">📦 Create Packing Slip</h2>

                <!-- Customer Selection -->
                <div class="form-row">
                    <div class="form-group">
                        <label>Customer</label>
                        <select v-model="selectedCustomer">
                            <option value="">-- Select Customer --</option>
                            <option v-for="c in customers" :key="c.id" :value="c.id">{{ c.name }}</option>
                        </select>
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
                                    <select v-model="item.productId" @change="onProductChange(idx)">
                                        <option value="">-- Select Product --</option>
                                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.colorId" @change="onColorChange(idx)">
                                        <option value="">-- Select Color --</option>
                                        <option v-for="color in item.availableColors" :key="color.color_id"
                                            :value="color.color_id" :disabled="color.total_quantity === 0">
                                            {{ color.color_name }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.sizeId" @change="updateAvailableQuantity(idx)">
                                        <option value="">-- Select Size --</option>
                                        <option v-for="size in item.availableSizes" :key="size.size_id"
                                            :value="size.size_id" :disabled="size.available_quantity === 0">
                                            {{ size.size_code }} ({{ size.available_quantity }})
                                        </option>
                                    </select>
                                </td>
                                <td class="quantity-col">
                                    <input type="number" v-model="item.quantity" min="1" :max="item.maxQuantity"
                                        class="quantity-input" @input="validateQuantity(idx)" />
                                </td>
                                <td class="available-col">
                                    <span class="available-qty">{{ item.maxQuantity }}</span>
                                </td>
                                <td class="action-col">
                                    <button class="btn danger" @click="removeItem(idx)">❌</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="7" class="add-row">
                                    <button class="btn add-row-btn" @click="addNewRow">➕ Add New Row</button>
                                </td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="5"><strong>Total</strong></td>
                                <td colspan="2"><strong>{{ totalQuantity }} QTY</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Save/Reset Buttons -->
                <div class="form-actions">
                    <button class="btn save" @click="savePackingSlip" :disabled="!canSave">💾 Save Packing Slip</button>
                    <button class="btn reset" @click="resetForm">🔄 Reset</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Form State
const selectedCustomer = ref("");

// Data
const customers = ref([]);
const products = ref([]);
const packingItems = ref([createEmptyItem()]);

// Computed
const totalQuantity = computed(() =>
    packingItems.value.reduce((sum, i) => sum + (parseInt(i.quantity) || 0), 0)
);

const canSave = computed(() => {
    return selectedCustomer.value &&
        packingItems.value.length > 0 &&
        packingItems.value.every(item =>
            item.productId && item.colorId && item.sizeId && item.quantity > 0 && item.quantity <= item.maxQuantity
        );
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
        stockData: []
    };
}

// API Calls
onMounted(async () => {
    await Promise.all([
        loadCustomers(),
        loadProducts()
    ]);
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
    packingItems.value.push(createEmptyItem());
};


const removeItem = (idx) => {
    if (packingItems.value.length > 1) {
        packingItems.value.splice(idx, 1);
    } else {

        packingItems.value[0] = createEmptyItem();
    }
};

// Save Packing Slip
const savePackingSlip = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields and ensure quantities don't exceed available stock!");
        return;
    }

    try {
        // Generate slip number
        const slipNumber = `PSLIP${Date.now()}`;
        const today = new Date().toISOString().split('T')[0];

        // Prepare lines array
        const lines = packingItems.value.map(item => ({
            product: item.productId,
            color: item.colorId,
            size: item.sizeId,
            quantity: item.quantity
        }));

        // Single API call with all lines
        await axios.post("/packingslips/", {
            slip_number: slipNumber,
            date: today,
            customer: selectedCustomer.value,
            lines: lines
        });

        alert("Packing slip created successfully!");
        resetForm();
    } catch (err) {
        console.error("Error creating packing slip:", err);
        alert("Error creating packing slip! Please check the console for details.");
    }
};

// Reset form
const resetForm = () => {
    selectedCustomer.value = "";
    packingItems.value = [createEmptyItem()];
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
}

.page-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    color: #333;
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

.available-col {
    width: 90px;
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
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.2s;
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
</style>