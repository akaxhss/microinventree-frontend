<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <!-- Dashboard Container -->
      <div class="dashboard-container">

        <h2 class="page-title">Products</h2>

        <!-- Products Table -->
        <div class="table-wrapper">
          <table class="modern-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Name</th>
                <th>Variants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id" class="table-row">
                <td>{{ product.id }}</td>
                <td>{{ product.sku }}</td>
                <td>{{ product.name }}</td>
                <td>
                  <ul>
                    <li v-for="variant in product.variants" :key="variant.id">
                      {{ variant.color.name || 'N/A' }}
                    </li>
                  </ul>
                </td>
                <td class="actions-cell">
                  <button class="action-btn delete" @click="deleteProduct(product.id)">Delete</button>
                </td>
              </tr>
              <tr v-if="products.length === 0">
                <td colspan="5" class="empty-state">
                  <div class="empty-content">
                    <span class="empty-icon">📦</span>
                    <p>No products available</p>
                    <button class="add-first-btn" @click="showAddForm = true">Add First Product</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Add Product Modal -->
        <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Add New Product</h3>
              <button class="close-btn" @click="showAddForm = false">×</button>
            </div>
            <form @submit.prevent="addProduct" class="modal-form">
              <div class="form-group">
                <label>Product Name</label>
                <input v-model="newProductName" placeholder="Enter product name" class="form-input" required />
              </div>
              <div class="form-group">
                <label>SKU</label>
                <input v-model="newProductSKU" placeholder="Enter SKU" class="form-input" required />
              </div>
              <div class="form-actions">
                <button type="button" class="btn-secondary" @click="showAddForm = false">Cancel</button>
                <button type="submit" class="btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Floating Add Button -->
        <button class="floating-add-btn" @click="showAddForm = true">+</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';
import Sidebar from '../components/Sidebar.vue';


const products = ref([]);
const newProductName = ref('');
const newProductSKU = ref('');
const showAddForm = ref(false);

const fetchProducts = async () => {
  try {
    const res = await axios.get('products/');
    products.value = res.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const addProduct = async () => {
  if (!newProductName.value.trim() || !newProductSKU.value.trim()) return;
  try {
    const res = await axios.post('products/', {
      name: newProductName.value,
      sku: newProductSKU.value
    });
    products.value.push(res.data);
    newProductName.value = '';
    newProductSKU.value = '';
    showAddForm.value = false;
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await axios.delete(`products/${id}/`);
    products.value = products.value.filter(p => p.id !== id);
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

onMounted(fetchProducts);
</script>

<style scoped>
.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
}

/* Dashboard Container */
.dashboard-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Page Title */
.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 20px;
  text-align: center;
}

/* Table Styles */
.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f7fafc;
  padding: 15px;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.table-row:hover {
  background: #f1f5f9;
  transition: background 0.2s;
}

/* Actions */
.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.delete {
  background: #fed7d7;
  color: #c53030;
}

.action-btn.delete:hover {
  background: #f87171;
}

/* Empty State */
.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-content {
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

.add-first-btn {
  margin-top: 10px;
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 0;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  color: #1a202c;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.modal-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #4a5568;
}

.form-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Floating Add Button */
.floating-add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: transform 0.2s;
}

.floating-add-btn:hover {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
