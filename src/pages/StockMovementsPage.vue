<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title">
          <Icon name="refresh" size="20" class="page-icon" />
          Record Stock Movement
        </h2>

        <!-- Stock Movement Form -->
        <div class="movement-form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Stock Item *</label>
              <select v-model="movementForm.stock_item_id" @change="onStockItemChange" class="form-input">
                <option value="">-- Select Stock Item --</option>
                <option v-for="item in stockItems" :key="item.id" :value="item.id">
                  {{ item.product?.name }} - {{ item.color?.name }} - {{ item.size?.display_name || item.size?.code }}
                  (Current: {{ item.quantity }})
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Movement Type *</label>
              <select v-model="movementForm.movement_type" class="form-input">
                <option value="">-- Select Type --</option>
                <option value="IN">IN - Add to Stock</option>
                <option value="OUT">OUT - Remove from Stock</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantity Change *</label>
              <input type="number" v-model.number="movementForm.change" min="1" class="form-input"
                placeholder="Enter quantity" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>Note</label>
              <textarea v-model="movementForm.note" class="form-textarea"
                placeholder="Add a note for this movement (optional)" rows="3"></textarea>
            </div>
          </div>

          <!-- Stock Information -->
          <div v-if="selectedStockItem" class="stock-info-card">
            <h4>Stock Information</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Product:</span>
                <span class="info-value">{{ selectedStockItem.product?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Color:</span>
                <span class="info-value">{{ selectedStockItem.color?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">{{ selectedStockItem.size?.display_name || selectedStockItem.size?.code
                  }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Current Quantity:</span>
                <span class="info-value">{{ selectedStockItem.quantity }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">After Movement:</span>
                <span class="info-value" :class="getProjectedQuantityClass()">
                  {{ getProjectedQuantity() }}
                </span>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button class="btn reset-btn" @click="resetForm">
              <Icon name="refresh" size="16" class="btn-icon" />
              Reset
            </button>
            <button class="btn save-btn" @click="recordMovement" :disabled="!canRecordMovement">
              <Icon name="save" size="16" class="btn-icon" />
              Record Movement
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';
import Sidebar from '../components/Sidebar.vue';

const stockItems = ref([]);
const selectedStockItem = ref(null);

const movementForm = reactive({
  stock_item_id: '',
  movement_type: '',
  change: null,
  note: ''
});

// Computed properties
const canRecordMovement = computed(() => {
  return movementForm.stock_item_id &&
    movementForm.movement_type &&
    movementForm.change > 0;
});

// Methods
const fetchStockItems = async () => {
  try {
    const res = await axios.get('/stock-items/');
    stockItems.value = res.data;
  } catch (error) {
    console.error('Error fetching stock items:', error);
    alert('Error loading stock items!');
  }
};

const recordMovement = async () => {
  try {
    if (!canRecordMovement.value) {
      alert('Please fill all required fields');
      return;
    }

    // Validate if out movement doesnt exceed current stock
    if (movementForm.movement_type === 'OUT' && selectedStockItem.value) {
      if (movementForm.change > selectedStockItem.value.quantity) {
        alert('Cannot remove more items than available in stock!');
        return;
      }
    }

    await axios.post('/stockmovement/record/', movementForm);
    alert('Stock movement recorded successfully!');
    resetForm();
    await fetchStockItems(); // Refresh to get updated quantities
  } catch (error) {
    console.error('Error recording movement:', error);
    alert('Error recording movement. Please try again.');
  }
};

const onStockItemChange = () => {
  selectedStockItem.value = stockItems.value.find(item => item.id == movementForm.stock_item_id);
};

const getProjectedQuantity = () => {
  if (!selectedStockItem.value || !movementForm.change) return '-';

  const current = selectedStockItem.value.quantity;
  const change = movementForm.change;

  if (movementForm.movement_type === 'IN') {
    return current + change;
  } else if (movementForm.movement_type === 'OUT') {
    return current - change;
  }
  return '-';
};

const getProjectedQuantityClass = () => {
  const projected = getProjectedQuantity();
  if (projected === '-') return '';

  if (projected < 0) {
    return 'negative';
  } else if (projected === 0) {
    return 'zero';
  } else {
    return 'positive';
  }
};

const resetForm = () => {
  movementForm.stock_item_id = '';
  movementForm.movement_type = '';
  movementForm.change = null;
  movementForm.note = '';
  selectedStockItem.value = null;
};

onMounted(() => {
  fetchStockItems();
});
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
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

/* Movement Form Section */
.movement-form-section {
  display: flex;
  flex-direction: column;
  gap: 25px;
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
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  padding: 12px;
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Stock Information Card */
.stock-info-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-top: 10px;
}

.stock-info-card h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #666;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 600;
  color: #333;
}

.info-value.positive {
  color: #4CAF50;
}

.info-value.negative {
  color: #f44336;
}

.info-value.zero {
  color: #ff9800;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
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

.reset-btn {
  background: #757575;
  color: white;
}

.reset-btn:hover {
  background: #616161;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 15px;
  }

  .form-container {
    padding: 20px;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: auto;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>