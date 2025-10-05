<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="main-content">
      <ModernHeader />

      <div class="dashboard-container">
        <div class="header-section">
          <h2 class="page-title">Stock Inventory</h2>
        </div>

        <!-- Stock Table -->
        <div class="table-container">
          <div class="table-wrapper">
            <table class="modern-table">
              <thead>
                <tr>
                  <th class="id-col">ID</th>
                  <th class="product-col">Product</th>
                  <th class="color-col">Color</th>
                  <th class="size-col">Size</th>
                  <th class="supplier-col">Supplier</th>
                  <th class="quantity-col">Quantity</th>
                </tr>
                <!-- Filter Row -->
                <tr class="filter-row">
                  <th>
                    <input type="text" v-model="filters.id" placeholder="Filter ID" class="filter-input" />
                  </th>
                  <th>
                    <select v-model="filters.product" class="filter-select">
                      <option value="">All Products</option>
                      <option v-for="product in products" :key="product.id" :value="product.name">
                        {{ product.name }}
                      </option>
                    </select>
                  </th>
                  <th>
                    <input type="text" v-model="filters.color" placeholder="Filter color" class="filter-input" />
                  </th>
                  <th>
                    <input type="text" v-model="filters.size" placeholder="Filter size" class="filter-input" />
                  </th>
                  <th>
                    <input type="text" v-model="filters.supplier" placeholder="Filter supplier" class="filter-input" />
                  </th>
                  <th>
                    <input type="number" v-model.number="filters.quantity" placeholder="≥ Qty" class="filter-input" />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredStock" :key="item.id">
                  <td class="id-cell">
                    <span class="id-badge">#{{ item.id }}</span>
                  </td>
                  <td class="product-cell">
                    <div class="product-info">
                      <strong class="product-name">{{ item.product?.name || '-' }}</strong>
                      <span class="product-sku" v-if="item.product?.sku">{{ item.product.sku }}</span>
                    </div>
                  </td>
                  <td class="color-cell">
                    <div class="color-info">
                      <div class="color-swatch" :style="{ backgroundColor: item.color?.hex_code || '#94a3b8' }"></div>
                      <span class="color-name">{{ item.color?.name || '-' }}</span>
                    </div>
                  </td>
                  <td class="size-cell">
                    <span class="size-badge">{{ item.size?.display_name || item.size?.code || '-' }}</span>
                  </td>
                  <td class="supplier-cell">
                    <span class="supplier-name" v-if="item.supplier">{{ item.supplier.name }}</span>
                    <span class="no-supplier" v-else>-</span>
                  </td>
                  <td class="quantity-cell">
                    <span class="quantity-text">{{ item.quantity }}</span>
                  </td>
                </tr>
                <tr v-if="filteredStock.length === 0">
                  <td colspan="6" class="empty-state">
                    <div class="empty-content">
                      <span class="empty-icon">📦</span>
                      <p>No stock items found</p>
                      <p class="empty-subtitle">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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

// Computed properties
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

// Methods
const fetchStock = async () => {
  try {
    const res = await axios.get('/stock-items/');
    stock.value = res.data;
  } catch (error) {
    console.error('Error fetching stock:', error);
  }
};

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

onMounted(() => {
  fetchStock();
  fetchProducts();
  fetchSizes();
  fetchColors();
});
</script>

<style scoped>
.layout {
  display: flex;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
}

/* Container */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header Section */
.header-section {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.modern-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.modern-table th,
.modern-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

/* Filter Row */
.filter-row th {
  background: #f1f5f9;
  padding: 8px 16px;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Table Body */
tbody tr {
  transition: background-color 0.2s ease;
}

tbody tr:hover {
  background-color: #f8fafc;
}

/* Cell Styles */
.id-cell {
  width: 80px;
}

.id-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.product-cell {
  min-width: 200px;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
}

.product-sku {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: 'Monaco', 'Consolas', monospace;
}

.color-cell {
  min-width: 120px;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.color-name {
  font-weight: 500;
}

.size-cell {
  min-width: 80px;
}

.size-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.supplier-cell {
  min-width: 150px;
}

.supplier-name {
  font-weight: 500;
}

.no-supplier {
  color: #9ca3af;
  font-style: italic;
}

.quantity-cell {
  text-align: center;
  min-width: 80px;
}

.quantity-text {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1f2937;
}

/* Empty State */
.empty-state {
  padding: 60px 20px;
}

.empty-content {
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-subtitle {
  font-size: 0.875rem;
  margin-top: 4px;
  color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .modern-table th,
  .modern-table td {
    padding: 8px 12px;
  }
}
</style>