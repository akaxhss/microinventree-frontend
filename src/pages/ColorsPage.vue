<template>
  <div>
    <!-- Modern Header -->
    <ModernHeader />

    <!-- Page Container -->
    <div class="dashboard-container">
      <!-- Stats Header -->
     

      

      <!-- Colors Table -->
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" class="row-checkbox">
              </th>
              <th>ID</th>
              <th>Color Name</th>
              <th>Hex Code</th>
              
             
              
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="color in colors" :key="color.id" class="table-row">
              <td>
                <input type="checkbox" class="row-checkbox">
              </td>
              <td class="id-cell">{{ color.id }}</td>
              <td class="name-cell">
                <div class="color-display">
                 
                  {{ color.name }}
                </div>
              </td>
              <td class="hex-cell">{{ color.hex_code || 'Not set' }}</td>
              
              
             
              <td class="actions-cell">
                <button class="action-btn edit" @click="editColor(color)">Edit</button>
                <button class="action-btn delete" @click="deleteColor(color.id)">Delete</button>
              </td>
            </tr>
            <tr v-if="colors.length === 0">
              <td colspan="8" class="empty-state">
                <div class="empty-content">
                  <span class="empty-icon">🎨</span>
                  <p>No colors available</p>
                  <button class="add-first-btn" @click="showAddForm = true">Add First Color</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Color Modal -->
      <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Add New Color</h3>
            <button class="close-btn" @click="showAddForm = false">×</button>
          </div>
          <form @submit.prevent="addColor" class="modal-form">
            <div class="form-group">
              <label>Color Name</label>
              <input v-model="newColor" placeholder="Enter color name" class="form-input" required>
            </div>
            <div class="form-group">
              <label>Hex Code</label>
              <input v-model="newHexCode" placeholder="#FFFFFF" class="form-input">
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showAddForm = false">Cancel</button>
              <button type="submit" class="btn-primary">Add Color</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Floating Add Button -->
      <button class="floating-add-btn" @click="showAddForm = true">
        <span>+</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';

const colors = ref([]);
const newColor = ref('');
const newHexCode = ref('');
const showAddForm = ref(false);

const fetchColors = async () => {
  try {
    const res = await axios.get('colors/');
    colors.value = res.data;
  } catch (error) {
    console.error('Error fetching colors:', error);
  }
};

const addColor = async () => {
  if (!newColor.value.trim()) return;
  try {
    const res = await axios.post('colors/', { 
      name: newColor.value,
      hex_code: newHexCode.value 
    });
    colors.value.push(res.data);
    newColor.value = '';
    newHexCode.value = '';
    showAddForm.value = false;
  } catch (error) {
    console.error('Error adding color:', error);
  }
};

const editColor = (color) => {
  // Implement edit functionality
  console.log('Edit color:', color);
};

const deleteColor = async (id) => {
  if (!confirm('Are you sure you want to delete this color?')) return;
  try {
    await axios.delete(`colors/${id}/`);
    colors.value = colors.value.filter(c => c.id !== id);
  } catch (error) {
    console.error('Error deleting color:', error);
  }
};

onMounted(fetchColors);
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

/* Stats Header */
.stats-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 10px;
  color: white;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
}

/* Control Bar */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.control-left {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn.active,
.control-btn:hover {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

.control-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box {
  display: flex;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.search-input {
  padding: 8px 12px;
  border: none;
  outline: none;
  min-width: 200px;
}

.search-btn {
  padding: 8px 12px;
  background: #f8fafc;
  border: none;
  cursor: pointer;
}

.filter-btn,
.export-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
}

/* Table Styles */
.table-wrapper {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  background: #f7fafc;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.modern-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.table-row:hover {
  background: #f7fafc;
}

/* Specific Cell Styles */
.id-cell {
  font-weight: 600;
  color: #4f46e5;
}

.name-cell {
  font-weight: 500;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
}

.hex-cell {
  font-family: monospace;
  color: #718096;
}

.usage-cell {
  text-align: center;
  font-weight: 600;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #c6f6d5;
  color: #276749;
}

.date-cell {
  color: #718096;
  font-size: 0.9rem;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.action-btn.edit {
  background: #bee3f8;
  color: #2c5282;
}

.action-btn.delete {
  background: #fed7d7;
  color: #c53030;
}

/* Checkbox */
.row-checkbox {
  transform: scale(1.2);
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
  background: rgba(0,0,0,0.5);
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
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
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
  font-size: 1rem;
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

/* Floating Button */
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
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .control-bar {
    flex-direction: column;
    gap: 15px;
  }
  
  .control-left, .control-right {
    width: 100%;
    justify-content: center;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
}
</style>