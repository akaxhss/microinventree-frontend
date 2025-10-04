<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="main-content">
      <ModernHeader />

      <div class="dashboard-container">
        <h2 class="page-title">Stock Management</h2>

        <!-- Stock Table -->
        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Product</th>
                <th>Color</th>
                <th>Size</th>
                <th>Supplier</th>
                <th>Quantity</th>
              </tr>
              <!-- Filter Row -->
              <tr class="filter-row">
                <th><input type="text" v-model="filters.id" placeholder="Filter ID" /></th>

                <th>
                  <select v-model="filters.product">
                    <option disabled value="">Select Product</option>
                    <option v-for="product in products" :key="product.id" :value="product.name">
                      {{ product.name }}
                    </option>
                  </select>
                </th>

                <th><input type="text" v-model="filters.color" placeholder="Filter color" /></th>
                <th><input type="text" v-model="filters.size" placeholder="Filter size" /></th>
                <th><input type="text" v-model="filters.supplier" placeholder="Filter supplier" /></th>
                <th><input type="number" v-model.number="filters.quantity" placeholder="≥ Qty" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in filteredStock" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.product?.name || '-' }}</td>
                <td>{{ item.color?.name || '-' }}</td>
                <td>{{ item.size?.display_name || '-' }}</td>
                <td>{{ item.supplier?.name || '-' }}</td>
                <td>{{ item.quantity }}</td>
              </tr>
              <tr v-if="filteredStock.length === 0">
                <td colspan="6" class="empty-state">
                  <span class="empty-icon">📦</span>
                  <p>No stock items available</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Popup -->
      <div v-if="showAddPopup" class="popup-overlay">
        <div class="popup-box">
          <h3>Add New Stock</h3>

          <label>
            Product:
            <multiselect v-model="newStock.product" :options="products" label="name" track-by="id"
              placeholder="Select Product" />
          </label>

          <label>
            Color:
            <multiselect v-model="newStock.color" :options="colors" label="name" track-by="id"
              placeholder="Select Color" />
          </label>

          <label>
            Size:
            <multiselect v-model="newStock.size" :options="sizes" label="display_name" track-by="id"
              placeholder="Select Size" />
          </label>

          <label>
            Quantity:
            <input type="number" v-model.number="newStock.quantity" />
          </label>

          <div class="popup-actions">
            <button class="update-btn" @click="addStock">Add</button>
            <button class="cancel-btn" @click="showAddPopup = false">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import Sidebar from '../components/Sidebar.vue';

const stock = ref([]);
const products = ref([]);
const sizes = ref([]);
const colors = ref([]);

const filters = ref({
  id: '',
  product: '',
  color: '',
  size: '',
  supplier: '',
  quantity: null
});

const showAddPopup = ref(false);
const newStock = ref({
  product: null,
  color: null,
  size: null,
  quantity: null,
  supplier: null
});

//Fetch stock items
const fetchStock = async () => {
  try {
    const res = await axios.get('/stock-items/');
    stock.value = res.data;
  } catch (error) {
    console.error('Error fetching stock:', error);
  }
};

// Fetch dropdown data
const fetchProducts = async () => {
  const res = await axios.get('/products/');
  products.value = res.data;
};

const fetchSizes = async () => {
  const res = await axios.get('/sizes/');
  sizes.value = res.data;
};

const fetchColors = async () => {
  const res = await axios.get('/colors/');
  colors.value = res.data;
};

//  Add stock
const addStock = async () => {
  try {
    const { product, color, size, quantity } = newStock.value;
    if (!product || !color || !size || !quantity) {
      alert('Please fill all fields');
      return;
    }
    await axios.post('/stock-items/', {
      product: product.id,
      color: color.id,
      size: size.id,
      quantity: quantity,
    });
    alert('New stock added successfully!');
    showAddPopup.value = false;
    newStock.value = { product: null, color: null, size: null, quantity: null };
    fetchStock();
  } catch (error) {
    console.error('Error adding stock:', error);
  }
};

// Filtering
const filteredStock = computed(() => {
  return stock.value.filter(item => {
    const matchesId = !filters.value.id || item.id.toString().includes(filters.value.id);
    const matchesProduct = !filters.value.product || item.product?.name === filters.value.product;
    const matchesColor = !filters.value.color || item.color?.name?.toLowerCase().includes(filters.value.color.toLowerCase());
    const matchesSize = !filters.value.size || item.size?.display_name?.toLowerCase().includes(filters.value.size.toLowerCase());
    const matchesSupplier = !filters.value.supplier || item.supplier?.name?.toLowerCase().includes(filters.value.supplier.toLowerCase());
    const matchesQuantity = !filters.value.quantity || item.quantity >= filters.value.quantity;

    return matchesId && matchesProduct && matchesColor && matchesSize && matchesSupplier && matchesQuantity;
  });
});

onMounted(() => {
  fetchStock();
  fetchProducts();
  fetchSizes();
  fetchColors();
});
</script>

<style scoped>
.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
}

/* Container */
.dashboard-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 10px;
  background-color: #f9fafb;
  min-height: 100vh;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: #1f2937;
}

/* Page Title */
.page-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2563eb;
}

/* Actions Bar */
.actions-bar {
  margin-bottom: 10px;
  text-align: right;
}

.add-btn {
  padding: 6px 12px;
  background-color: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #1e40af;
}

/* Table Container */
.table-wrapper {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  background: white;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.modern-table th,
.modern-table td {
  padding: 8px 10px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.modern-table th {
  background: #f3f4f6;
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

tbody tr:hover {
  background: #f9fafb;
  transition: background 0.15s;
}

/* Filter Row */
.filter-row input,
.filter-row select {
  width: 100%;
  padding: 4px 6px;
  font-size: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 20px 0;
  color: #6b7280;
  font-style: italic;
}

.empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 5px;
}

/* Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-box {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 320px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.popup-box h3 {
  margin-bottom: 15px;
  font-size: 1.2rem;
  font-weight: 600;
}

.popup-box label {
  display: block;
  margin-bottom: 10px;
  font-size: 0.85rem;
}

.popup-box input {
  width: 100%;
  padding: 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  margin-top: 4px;
}

.popup-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
