<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />

            <div class="form-container">
                <h2 class="page-title">➕ Add Stock</h2>

                <!-- Supplier Selection -->
                <div class="form-row">
                    <div class="form-group">
                        <label>Supplier</label>
                        <select v-model="selectedSupplier">
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
                                    <select v-model="item.productId" @change="onProductChange(idx)">
                                        <option value="">-- Select Product --</option>
                                        <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.sizeId">
                                        <option value="">-- Select Size --</option>
                                        <option v-for="s in sizes" :key="s.id" :value="s.id">{{ s.display_name }}
                                        </option>
                                    </select>
                                </td>
                                <td>
                                    <select v-model="item.colorId">
                                        <option value="">-- Select Color --</option>
                                        <option v-for="c in colors" :key="c.id" :value="c.id">{{ c.name }}</option>
                                    </select>
                                </td>
                                <td class="quantity-col">
                                    <input type="number" v-model="item.quantity" min="1" class="quantity-input" />
                                </td>
                                <td class="action-col">
                                    <button class="btn danger" @click="removeItem(idx)">❌</button>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="6" class="add-row">
                                    <button class="btn add-row-btn" @click="addNewRow">➕ Add New Row</button>
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
                    <button class="btn save" @click="saveStock" :disabled="!canSave">💾 Save</button>
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
const selectedSupplier = ref("");

// Data
const suppliers = ref([]);
const products = ref([]);
const sizes = ref([]);
const colors = ref([]);
const stockItems = ref([createEmptyItem()]);

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

// Create empty item
function createEmptyItem() {
    return {
        productId: "",
        sizeId: "",
        colorId: "",
        quantity: 1
    };
}

// API Calls
onMounted(async () => {
    await Promise.all([
        loadSuppliers(),
        loadProducts(),
        loadSizes(),
        loadColors()
    ]);
});

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

// Save Stock
const saveStock = async () => {
    if (!canSave.value) {
        alert("Please fill all required fields!");
        return;
    }

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
        alert("Stock added successfully!");
        resetForm();
    } catch (err) {
        console.error("Error saving stock:", err);
        alert("Error adding stock! Please check the console for details.");
    }
};

// Reset form
const resetForm = () => {
    selectedSupplier.value = "";
    stockItems.value = [createEmptyItem()];
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