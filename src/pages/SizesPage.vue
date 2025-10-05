<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title">Manage Sizes</h2>

        <!-- Add/Edit Size Form -->
        <div class="size-form-section">
          <h3 class="section-title">{{ isEditing ? 'Edit Size' : 'Add New Size' }}</h3>
          <div class="size-form">
            <div class="form-row">
              <div class="form-group">
                <label for="sizeCode">Size Code *</label>
                <input type="text" id="sizeCode" v-model="sizeForm.code" placeholder="e.g. S, M, L, XL"
                  class="form-input" :class="{ 'error': codeError }" maxlength="16" />
                <div v-if="codeError" class="error-message">{{ codeError }}</div>
                <div class="help-text">Unique code (max 16 characters)</div>
              </div>
              <div class="form-group">
                <label for="displayName">Display Name</label>
                <input type="text" id="displayName" v-model="sizeForm.display_name"
                  placeholder="e.g. Small, Medium, Large" class="form-input" maxlength="32" />
                <div class="help-text">Optional friendly name (max 32 characters)</div>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn save-btn" @click="saveSize" :disabled="!canSave">
                {{ isEditing ? '💾 Update Size' : '➕ Add Size' }}
              </button>
              <button v-if="isEditing" class="btn cancel-btn" @click="cancelEdit">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Sizes List -->
        <div class="sizes-list-section">
          <h3 class="section-title">Existing Sizes</h3>
          <div v-if="sizes.length === 0" class="empty-state">
            No sizes added yet. Add your first size above.
          </div>
          <div v-else class="sizes-table">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Display Name</th>
                  <!-- <th>Preview</th> -->
                  <th class="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="size in sizes" :key="size.id">
                  <td class="code-cell">
                    <span class="code-badge">{{ size.code }}</span>
                  </td>
                  <td class="name-cell">
                    <span v-if="size.display_name" class="display-name">{{ size.display_name }}</span>
                    <span v-else class="no-display-name">-</span>
                  </td>
                  <!-- <td class="preview-cell">
                    <div class="size-preview">
                      <span class="size-example" :class="getSizeClass(size.code)">
                        {{ size.display_name || size.code }}
                      </span>
                    </div>
                  </td> -->
                  <td class="actions-cell">
                    <button class="btn edit-btn" @click="editSize(size)">
                      ✏️
                    </button>
                    <button class="btn danger-btn" @click="deleteSize(size.id)">
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

// Size data
const sizes = ref([]);
const isEditing = ref(false);
const editingId = ref(null);
const codeError = ref("");

// Size form
const sizeForm = reactive({
  code: "",
  display_name: ""
});

// Computed properties
const canSave = computed(() => {
  return sizeForm.code.trim();
});

// Load sizes on mount
onMounted(async () => {
  await loadSizes();
});

// Load sizes from API
const loadSizes = async () => {
  try {
    const res = await axios.get("/sizes/");
    sizes.value = res.data;
  } catch (error) {
    console.error("Error loading sizes:", error);
    alert("Error loading sizes!");
  }
};

// Save size (add or update)
const saveSize = async () => {
  if (!canSave.value) {
    alert("Please enter size code!");
    return;
  }

  try {
    const sizeData = {
      code: sizeForm.code.trim().toUpperCase(),
      display_name: sizeForm.display_name.trim() || ""
    };

    if (isEditing.value) {
      // Update existing size
      await axios.put(`/sizes/${editingId.value}/`, sizeData);
      alert("Size updated successfully!");
    } else {
      // Add new size
      await axios.post("/sizes/", sizeData);
      alert("Size added successfully!");
    }

    // Reset form and reload sizes
    resetForm();
    await loadSizes();

  } catch (error) {
    console.error("Error saving size:", error);
    if (error.response?.data?.code) {
      codeError.value = error.response.data.code[0];
    } else {
      alert("Error saving size!");
    }
  }
};

// Edit size
const editSize = (size) => {
  isEditing.value = true;
  editingId.value = size.id;
  codeError.value = "";

  // Fill form with size data
  sizeForm.code = size.code;
  sizeForm.display_name = size.display_name || "";
};

// Cancel edit
const cancelEdit = () => {
  resetForm();
};

// Delete size
const deleteSize = async (sizeId) => {
  if (!confirm("Are you sure you want to delete this size?")) {
    return;
  }

  try {
    await axios.delete(`/sizes/${sizeId}/`);
    await loadSizes();
    alert("Size deleted successfully!");
  } catch (error) {
    console.error("Error deleting size:", error);
    alert("Error deleting size!");
  }
};

// Reset form
const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  codeError.value = "";
  sizeForm.code = "";
  sizeForm.display_name = "";
};

// Get CSS class for size preview
const getSizeClass = (code) => {
  const sizeMap = {
    'XS': 'extra-small',
    'S': 'small',
    'M': 'medium',
    'L': 'large',
    'XL': 'extra-large',
    'XXL': 'double-extra-large',
    'XXXL': 'triple-extra-large'
  };

  const normalizedCode = code.toUpperCase();
  return sizeMap[normalizedCode] || 'default';
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
  max-width: 1000px;
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

/* Size Form */
.size-form-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.size-form {
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

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input:focus {
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

.help-text {
  color: #666;
  font-size: 0.75rem;
  margin-top: 4px;
  font-style: italic;
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

/* Sizes List */
.sizes-list-section {
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

.code-cell {
  font-weight: 600;
}

.code-badge {
  background: #e3f2fd;
  color: #1976d2;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: monospace;
  border: 1px solid #bbdefb;
}

.name-cell {
  color: #333;
}

.display-name {
  font-weight: 500;
}

.no-display-name {
  color: #999;
  font-style: italic;
}

.preview-cell {
  text-align: center;
}

.size-preview {
  display: flex;
  justify-content: center;
}

.size-example {
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  background: #f5f5f5;
  color: #333;
  min-width: 80px;
  text-align: center;
  transition: all 0.2s;
}

/* Size preview styles */
.size-example.extra-small {
  background: #e8f5e8;
  border-color: #c8e6c9;
  color: #2e7d32;
  transform: scale(0.8);
}

.size-example.small {
  background: #f3e5f5;
  border-color: #e1bee7;
  color: #7b1fa2;
  transform: scale(0.9);
}

.size-example.medium {
  background: #e3f2fd;
  border-color: #bbdefb;
  color: #1976d2;
}

.size-example.large {
  background: #fff3e0;
  border-color: #ffcc80;
  color: #ef6c00;
  transform: scale(1.1);
}

.size-example.extra-large {
  background: #fbe9e7;
  border-color: #ffab91;
  color: #d84315;
  transform: scale(1.2);
}

.size-example.double-extra-large {
  background: #ffebee;
  border-color: #ff8a80;
  color: #c62828;
  transform: scale(1.3);
}

.size-example.triple-extra-large {
  background: #fce4ec;
  border-color: #f48fb1;
  color: #ad1457;
  transform: scale(1.4);
}

.size-example.default {
  background: #f5f5f5;
  border-color: #e0e0e0;
  color: #666;
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

  .size-example {
    min-width: 60px;
    font-size: 0.8rem;
    padding: 6px 12px;
  }
}
</style>