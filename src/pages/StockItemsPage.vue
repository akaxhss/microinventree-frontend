<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="main-content">
      <ModernHeader />

      <div class="dashboard-container">
        <!-- Header Section -->
        <div class="modern-header">
          <div class="header-title">
            <span>Stock Inventory</span>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="message" class="alert alert-success">
          {{ message }}
        </div>
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Filter Section -->
        <div class="filter-section">
          <div class="filter-header">
            <h3 class="filter-title">Filters</h3>
            <button class="clear-filters-btn" @click="clearFilters" :disabled="!hasActiveFilters">
              Clear All
            </button>
          </div>

          <div class="filter-grid">
            <!-- Search Input -->
            <div class="filter-group">
              <label class="filter-label">Search</label>
              <div class="search-input-container">
                <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor"
                    d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
                </svg>
                <input type="text" v-model="filters.search" placeholder="Search by product, color, size, or supplier..."
                  class="search-input" @input="applyFilters" />
                <button v-if="filters.search" @click="filters.search = ''; applyFilters()" class="clear-search-btn">
                  <svg viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor"
                      d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Product Filter -->
            <div class="filter-group">
              <label class="filter-label">Product</label>
              <select v-model="filters.product" @change="applyFilters" class="filter-select">
                <option value="">All Products</option>
                <option v-for="product in uniqueProducts" :key="product.id" :value="product.name">
                  {{ product.name }}
                </option>
              </select>
            </div>

            <!-- Color Filter -->
            <div class="filter-group">
              <label class="filter-label">Color</label>
              <select v-model="filters.color" @change="applyFilters" class="filter-select">
                <option value="">All Colors</option>
                <option v-for="color in uniqueColors" :key="color.id" :value="color.name">
                  {{ color.name }}
                </option>
              </select>
            </div>

            <!-- Size Filter -->
            <div class="filter-group">
              <label class="filter-label">Size</label>
              <select v-model="filters.size" @change="applyFilters" class="filter-select">
                <option value="">All Sizes</option>
                <option v-for="size in uniqueSizes" :key="size.id" :value="size.display_name || size.code">
                  {{ size.display_name || size.code }}
                </option>
              </select>
            </div>

            <!-- Supplier Filter -->
            <div class="filter-group">
              <label class="filter-label">Supplier</label>
              <select v-model="filters.supplier" @change="applyFilters" class="filter-select">
                <option value="">All Suppliers</option>
                <option v-for="supplier in uniqueSuppliers" :key="supplier.id" :value="supplier.name">
                  {{ supplier.name }}
                </option>
              </select>
            </div>

            <!-- Quantity Filter -->
            <div class="filter-group">
              <label class="filter-label">Min Quantity</label>
              <input type="number" v-model.number="filters.minQuantity" placeholder="Minimum quantity"
                class="search-input" @input="applyFilters" min="0" />
            </div>
          </div>

          <!-- Active Filters Badges -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="active-filters-label">Active Filters:</span>
            <div class="filter-badges">
              <span v-if="filters.search" class="filter-badge" @click="filters.search = ''; applyFilters()">
                Search: "{{ filters.search }}"
                <span class="badge-remove">×</span>
              </span>
              <span v-if="filters.product" class="filter-badge" @click="filters.product = ''; applyFilters()">
                Product: {{ filters.product }}
                <span class="badge-remove">×</span>
              </span>
              <span v-if="filters.color" class="filter-badge" @click="filters.color = ''; applyFilters()">
                Color: {{ filters.color }}
                <span class="badge-remove">×</span>
              </span>
              <span v-if="filters.size" class="filter-badge" @click="filters.size = ''; applyFilters()">
                Size: {{ filters.size }}
                <span class="badge-remove">×</span>
              </span>
              <span v-if="filters.supplier" class="filter-badge" @click="filters.supplier = ''; applyFilters()">
                Supplier: {{ filters.supplier }}
                <span class="badge-remove">×</span>
              </span>
              <span v-if="filters.minQuantity" class="filter-badge" @click="filters.minQuantity = null; applyFilters()">
                Min Quantity: {{ filters.minQuantity }}
                <span class="badge-remove">×</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Results Count -->
        <div class="results-count">
          Showing {{ paginatedStock.length }} of {{ filteredStock.length }} stock items 
          <span v-if="totalPages > 1">• Page {{ currentPage }} of {{ totalPages }}</span>
        </div>

        <!-- Table Card -->
        <div class="modern-card">
          <div class="table-container">
            <table class="modern-table">
              <thead class="table-header">
                <tr>
                  <th class="table-checkbox">ID</th>
                  <th>Product</th>
                  <th>Color</th>
                  <th>Size</th>
                  <th class="supplier-header">Supplier</th>
                  <th class="text-right">Quantity</th>
                </tr>
              </thead>
              <tbody class="table-body">
                <tr v-if="paginatedStock.length === 0">
                  <td colspan="6" class="text-center text-gray-500 py-8">
                    <div class="no-results">
                      <svg class="no-results-icon" viewBox="0 0 24 24" width="48" height="48">
                        <path fill="#9ca3af" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                      <p>No stock items found matching your filters.</p>
                      <button @click="clearFilters" class="text-blue-500 underline mt-2">
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-for="item in paginatedStock" :key="item.id">
                  <td class="table-checkbox">
                    <span class="id-badge">#{{ item.id }}</span>
                  </td>
                  <td class="product-cell">
                    <div class="product-info">
                      <div class="product-details">
                        <strong class="product-name">{{ item.product?.name || '-' }}</strong>
                        <span class="product-sku" v-if="item.product?.sku">SKU: {{ item.product.sku }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="color-info">
                      <span class="color-name">{{ item.color?.name || '-' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="size-badge">{{ item.size?.display_name || item.size?.code || '-' }}</span>
                  </td>
                  <td>
                    <span class="supplier-name" v-if="item.supplier">{{ item.supplier.name }}</span>
                    <span class="no-supplier" v-else>-</span>
                  </td>
                  <td class="text-right">
                    <span class="quantity-text" :class="{
                      'low-stock': item.quantity < 10,
                      'out-of-stock': item.quantity === 0
                    }">
                      {{ item.quantity }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination-info">
              Showing {{ startItem }}-{{ endItem }} of {{ filteredStock.length }} items
            </div>
            <div class="pagination-controls">
              <button 
                class="pagination-btn" 
                :disabled="currentPage === 1" 
                @click="goToPage(currentPage - 1)"
              >
                Previous
              </button>

              <div class="page-numbers">
                <button 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-number"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
                <span v-if="showEllipsis" class="page-ellipsis">...</span>
              </div>

              <button 
                class="pagination-btn" 
                :disabled="currentPage === totalPages" 
                @click="goToPage(currentPage + 1)"
              >
                Next
              </button>
            </div>
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
  search: '',
  product: '',
  color: '',
  size: '',
  supplier: '',
  minQuantity: null
});

// Pagination
const currentPage = ref(1);
const itemsPerPage = 30;

const message = ref('');
const error = ref('');

// Computed properties
const uniqueProducts = computed(() => {
  const productsMap = new Map();
  stock.value.forEach(item => {
    if (item.product) {
      productsMap.set(item.product.id, item.product);
    }
  });
  return Array.from(productsMap.values());
});

const uniqueColors = computed(() => {
  const colorsMap = new Map();
  stock.value.forEach(item => {
    if (item.color) {
      colorsMap.set(item.color.id, item.color);
    }
  });
  return Array.from(colorsMap.values());
});

const uniqueSizes = computed(() => {
  const sizesMap = new Map();
  stock.value.forEach(item => {
    if (item.size) {
      sizesMap.set(item.size.id, item.size);
    }
  });
  return Array.from(sizesMap.values());
});

const uniqueSuppliers = computed(() => {
  const suppliersMap = new Map();
  stock.value.forEach(item => {
    if (item.supplier) {
      suppliersMap.set(item.supplier.id, item.supplier);
    }
  });
  return Array.from(suppliersMap.values());
});

const filteredStock = computed(() => {
  return stock.value.filter(item => {
    // Global search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      const productMatch = item.product?.name?.toLowerCase().includes(searchTerm);
      const colorMatch = item.color?.name?.toLowerCase().includes(searchTerm);
      const sizeMatch = item.size?.display_name?.toLowerCase().includes(searchTerm) ||
        item.size?.code?.toLowerCase().includes(searchTerm);
      const supplierMatch = item.supplier?.name?.toLowerCase().includes(searchTerm);

      if (!productMatch && !colorMatch && !sizeMatch && !supplierMatch) {
        return false;
      }
    }

    // Product filter
    if (filters.value.product && item.product?.name !== filters.value.product) {
      return false;
    }

    // Color filter
    if (filters.value.color && item.color?.name !== filters.value.color) {
      return false;
    }

    // Size filter
    if (filters.value.size) {
      const sizeDisplay = item.size?.display_name || item.size?.code;
      if (sizeDisplay !== filters.value.size) {
        return false;
      }
    }

    // Supplier filter
    if (filters.value.supplier && item.supplier?.name !== filters.value.supplier) {
      return false;
    }

    // Quantity filter
    if (filters.value.minQuantity !== null && item.quantity < filters.value.minQuantity) {
      return false;
    }

    return true;
  });
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredStock.value.length / itemsPerPage);
});

const paginatedStock = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredStock.value.slice(start, end);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, filteredStock.value.length);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

const showEllipsis = computed(() => {
  return totalPages.value > visiblePages.value.length &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value;
});

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(value =>
    value !== '' && value !== null
  );
});

// Methods
const applyFilters = () => {
  // Reset to first page when filters change
  currentPage.value = 1;
};

const clearFilters = () => {
  filters.value = {
    search: '',
    product: '',
    color: '',
    size: '',
    supplier: '',
    minQuantity: null
  };
  currentPage.value = 1;
};

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  // Scroll to top of table
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const fetchStock = async () => {
  try {
    const res = await axios.get('/stock-items/');
    stock.value = res.data;
  } catch (error) {
    console.error('Error fetching stock:', error);
    error.value = 'Failed to load stock data';
  }
};

const fetchProducts = async () => {
  try {
    const res = await axios.get('/products/');
    products.value = res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchSizes = async () => {
  try {
    const res = await axios.get('/sizes/');
    sizes.value = res.data;
  } catch (error) {
    console.error('Error fetching sizes:', error);
  }
};

const fetchColors = async () => {
  try {
    const res = await axios.get('/colors/');
    colors.value = res.data;
  } catch (error) {
    console.error('Error fetching colors:', error);
  }
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
  max-width: calc(100vw - 280px);
}

.dashboard-container {
  padding: 16px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  width: 100%;
  max-width: 2000px;
  margin: 0 auto;
}

/* Modern Header */
.modern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-title {
  font-weight: 600;
  font-size: 18px;
  color: #1e293b;
}

.modern-button-group {
  display: flex;
  gap: 8px;
}

.modern-save-button {
  background: #4a6cf7;
  color: white;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modern-save-button:hover {
  background: #3a5bd9;
  transform: translateY(-1px);
}

/* Alert Messages */
.alert {
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.alert-success {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

/* Filter Section */
.filter-section {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 100%;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.clear-filters-btn {
  background: transparent;
  border: 1px solid #dc2626;
  color: #dc2626;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover:not(:disabled) {
  background: #dc2626;
  color: white;
}

.clear-filters-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #64748b;
  pointer-events: none;
  z-index: 2;
}

.search-input {
  width: 80%;
  padding: 8px 10px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
  background: #ffffff;
}

.search-input:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 6px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 3px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.clear-search-btn:hover {
  background: #f1f5f9;
  color: #374151;
}

.filter-select {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 10px;
}

.filter-select:focus {
  outline: none;
  border-color: #4a6cf7;
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.1);
}

/* Active Filters */
.active-filters {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.active-filters-label {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
  margin-top: 2px;
}

.filter-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #4a6cf7;
  color: white;
  padding: 3px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-badge:hover {
  background: #3a5bd9;
}

.badge-remove {
  font-size: 12px;
  font-weight: bold;
  margin-left: 1px;
}

/* Results Count */
.results-count {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
  font-weight: 500;
  padding: 8px 0;
}

/* Modern Card */
.modern-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 100%;
}

.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  flex: 1;
  position: relative;
  border: 1px solid #e2e8f0;
  border-radius: 0 0 8px 8px;
}

.table-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, rgba(0,0,0,0.05));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.table-container.scrolling::after {
  opacity: 1;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #f8fafc;
}

.modern-table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 13px;
  text-align: left;
  padding: 12px 10px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modern-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modern-table tr:hover {
  background-color: #f8fafc;
}

/* Column Width Controls */
.table-checkbox {
  width: 60px;
  min-width: 60px;
}

.modern-table th:nth-child(2),
.product-cell {
  width: 25%;
  min-width: 140px;
  max-width: 160px;
}

.modern-table th:nth-child(3),
.color-cell {
  width: 15%;
  min-width: 100px;
  max-width: 120px;
}

.modern-table th:nth-child(4),
.size-cell {
  width: 10%;
  min-width: 60px;
  max-width: 80px;
}

.modern-table th:nth-child(5),
.supplier-header,
.supplier-cell {
  width: 20%;
  min-width: 120px;
  max-width: 140px;
}

.modern-table th:nth-child(6),
.quantity-cell {
  width: 8%;
  min-width: 60px;
  max-width: 70px;
  text-align: center;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

/* Cell Styles */
.id-badge {
  background: #f1f5f9;
  color: #64748b;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  font-family: 'Monaco', 'Consolas', monospace;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #4a6cf7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-sku {
  font-size: 10px;
  color: #6b7280;
  font-family: 'Monaco', 'Consolas', monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.color-name {
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.size-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.supplier-name {
  font-weight: 500;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-supplier {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
}

.quantity-text {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
  text-align: center;
  display: block;
  width: 100%;
}

.quantity-text.low-stock {
  color: #dc2626;
}

.quantity-text.out-of-stock {
  color: #ef4444;
  font-style: italic;
}

/* No Results Styling */
.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px;
}

.no-results-icon {
  opacity: 0.5;
  width: 40px;
  height: 40px;
}

.text-gray-500 {
  color: #6b7280;
}

.py-8 {
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}

.text-blue-500 {
  color: #3b82f6;
}

.underline {
  text-decoration: underline;
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.pagination-info {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  color: #374151;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
  min-width: 40px;
  color: #374151;
}

.page-number:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.page-number.active {
  background: #4a6cf7;
  color: white;
  border-color: #4a6cf7;
}

.page-ellipsis {
  color: #64748b;
  padding: 0 4px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0;
    max-width: 100vw;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
    max-width: 100%;
  }

  .modern-table th,
  .modern-table td {
    padding: 10px 8px;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .modern-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .modern-button-group {
    width: 100%;
    justify-content: flex-end;
  }

  .pagination-container {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }

  .table-checkbox {
    width: 50px;
    min-width: 50px;
  }

  .modern-table th:nth-child(2),
  .product-cell {
    min-width: 120px;
    max-width: 140px;
  }

  .modern-table th:nth-child(5),
  .supplier-header,
  .supplier-cell {
    min-width: 100px;
    max-width: 120px;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    padding: 8px;
  }

  .modern-table {
    font-size: 12px;
  }

  .modern-table th,
  .modern-table td {
    padding: 8px 6px;
  }

  .product-info {
    gap: 4px;
  }

  .profile-icon {
    width: 20px;
    height: 20px;
  }

  .product-name {
    font-size: 12px;
  }

  .product-sku {
    font-size: 9px;
  }

  .page-numbers {
    gap: 4px;
  }

  .page-number {
    padding: 6px 10px;
    min-width: 35px;
    font-size: 12px;
  }

  .pagination-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>