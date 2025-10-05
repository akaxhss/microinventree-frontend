<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title">Manage Products</h2>

        <!-- Add/Edit Product Form -->
        <div class="product-form-section">
          <h3 class="section-title">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h3>
          <div class="product-form">
            <div class="form-row">
              <div class="form-group">
                <label for="productSKU">SKU *</label>
                <input type="text" id="productSKU" v-model="productForm.sku" placeholder="e.g. TB1503"
                  class="form-input" :class="{ 'error': skuError }" />
                <div v-if="skuError" class="error-message">{{ skuError }}</div>
              </div>
              <div class="form-group">
                <label for="productName">Product Name *</label>
                <input type="text" id="productName" v-model="productForm.name" placeholder="Enter product name"
                  class="form-input" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="productMSRP">MSRP</label>
                <input type="number" id="productMSRP" v-model="productForm.msrp" placeholder="0.00" step="0.01" min="0"
                  class="form-input" />
              </div>
              <div class="form-group full-width">
                <label for="productDescription">Description</label>
                <textarea id="productDescription" v-model="productForm.description" placeholder="Product description"
                  class="form-textarea" rows="4"></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn save-btn" @click="saveProduct" :disabled="!canSave">
                {{ isEditing ? '💾 Update Product' : '➕ Add Product' }}
              </button>
              <button v-if="isEditing" class="btn cancel-btn" @click="cancelEdit">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Products List -->
        <div class="products-list-section">
          <h3 class="section-title">Existing Products</h3>
          <div v-if="products.length === 0" class="empty-state">
            No products added yet. Add your first product above.
          </div>
          <div v-else class="products-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product Name</th>
                  <th>MSRP</th>
                  <th>Description</th>
                  <th class="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="product in products" :key="product.id">
                  <td class="sku-cell">
                    <strong>{{ product.sku }}</strong>
                  </td>
                  <td class="name-cell">
                    {{ product.name }}
                  </td>
                  <td class="msrp-cell">
                    <span v-if="product.msrp" class="price">{{ formatPrice(product.msrp) }}</span>
                    <span v-else class="no-price">-</span>
                  </td>
                  <td class="description-cell">
                    <div class="description-text" :title="product.description">
                      {{ product.description || '-' }}
                    </div>
                  </td>
                  <td class="actions-cell">
                    <button class="btn edit-btn" @click="editProduct(product)">
                      ✏️
                    </button>
                    <button class="btn danger-btn" @click="deleteProduct(product.id)">
                      🗑️
                    </button>
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
import { ref, onMounted, reactive, computed } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Product data
const products = ref([]);
const isEditing = ref(false);
const editingId = ref(null);
const skuError = ref("");

// Product form
const productForm = reactive({
  sku: "",
  name: "",
  msrp: "",
  description: ""
});

// Computed properties
const canSave = computed(() => {
  return productForm.sku.trim() && productForm.name.trim();
});

// Load products on mount
onMounted(async () => {
  await loadProducts();
});

// Load products from API
const loadProducts = async () => {
  try {
    const res = await axios.get("/products/");
    products.value = res.data;
  } catch (error) {
    console.error("Error loading products:", error);
    alert("Error loading products!");
  }
};

// Save product (add or update)
const saveProduct = async () => {
  if (!canSave.value) {
    alert("Please enter SKU and product name!");
    return;
  }

  try {
    const productData = {
      sku: productForm.sku.trim(),
      name: productForm.name.trim(),
      description: productForm.description.trim() || "",
      msrp: productForm.msrp ? parseFloat(productForm.msrp) : null
    };

    if (isEditing.value) {
      // Update existing product
      await axios.put(`/products/${editingId.value}/`, productData);
      alert("Product updated successfully!");
    } else {
      // Add new product
      await axios.post("/products/", productData);
      alert("Product added successfully!");
    }

    // Reset form and reload products
    resetForm();
    await loadProducts();

  } catch (error) {
    console.error("Error saving product:", error);
    if (error.response?.data?.sku) {
      skuError.value = error.response.data.sku[0];
    } else {
      alert("Error saving product!");
    }
  }
};

// Edit product
const editProduct = (product) => {
  isEditing.value = true;
  editingId.value = product.id;
  skuError.value = "";

  // Fill form with product data
  productForm.sku = product.sku;
  productForm.name = product.name;
  productForm.msrp = product.msrp || "";
  productForm.description = product.description || "";
};

// Cancel edit
const cancelEdit = () => {
  resetForm();
};

// Delete product
const deleteProduct = async (productId) => {
  if (!confirm("Are you sure you want to delete this product?")) {
    return;
  }

  try {
    await axios.delete(`/products/${productId}/`);
    await loadProducts();
    alert("Product deleted successfully!");
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Error deleting product!");
  }
};

// Reset form
const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  skuError.value = "";
  productForm.sku = "";
  productForm.name = "";
  productForm.msrp = "";
  productForm.description = "";
};

// Format price
const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
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
  max-width: 1200px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

/* Product Form */
.product-form-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.form-group.full-width {
  flex: 2;
  min-width: 300px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-input.error {
  border-color: #f44336;
}

.error-message {
  color: #f44336;
  font-size: 0.8rem;
  margin-top: 4px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  padding: 10px 16px;
}

.save-btn {
  background: #4CAF50;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
}

.save-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #757575;
  color: white;
}

.cancel-btn:hover {
  background: #616161;
}

.edit-btn {
  background: #2196F3;
  color: white;
  padding: 6px 10px;
  margin-right: 5px;
}

.edit-btn:hover {
  background: #1976D2;
}

.danger-btn {
  background: #f44336;
  color: white;
  padding: 6px 10px;
}

.danger-btn:hover {
  background: #d32f2f;
}

/* Products List */
.products-list-section {
  padding: 0 10px;
}

.empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.data-table td {
  color: #333;
  font-size: 0.9rem;
}

.actions-col {
  width: 120px;
  text-align: center;
}

.actions-cell {
  text-align: center;
}

.sku-cell {
  font-weight: 600;
  font-family: monospace;
  background: #f8f9fa;
}

.name-cell {
  font-weight: 600;
  color: #333;
}

.msrp-cell {
  text-align: right;
}

.price {
  font-weight: 600;
  color: #2e7d32;
  font-family: monospace;
}

.no-price {
  color: #999;
  font-style: italic;
}

.description-cell {
  max-width: 300px;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #666;
}

.description-text:hover {
  white-space: normal;
  overflow: visible;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: auto;
  }

  .data-table {
    display: block;
    overflow-x: auto;
  }

  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    text-align: center;
  }

  .description-text {
    white-space: normal;
    overflow: visible;
    max-height: 60px;
    overflow-y: auto;
  }
}
</style>