<template>
  <div>
    <!-- Modern Header -->
    <ModernHeader />

    <!-- Page Container -->
    <div class="dashboard-container">

      

      <!-- Customers Table -->
      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" class="row-checkbox" @change="toggleAllCustomers">
              </th>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Contact Info</th>
             
             
             
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in filteredCustomers" :key="customer.id" class="table-row">
              <td>
                <input type="checkbox" class="row-checkbox" :value="customer.id" v-model="selectedCustomers">
              </td>
              <td class="id-cell">{{ customer.id }}</td>
              <td class="name-cell">
                <div class="customer-display">
                  <span class="customer-avatar">{{ getInitials(customer.name) }}</span>
                  {{ customer.name }}
                </div>
              </td>
              <td class="contact-cell">
                <div v-if="customer.email || customer.contact">
                  <div v-if="customer.email" class="contact-info">{{ customer.email }}</div>
                  <div v-if="customer.contact" class="contact-info">{{ customer.contact }}</div>
                  <div v-else class="contact-info">Not provided</div>
                </div>
                <div v-else class="contact-info">Not provided</div>
              </td>
             
             
            
              <td class="actions-cell">
                <button class="action-btn edit" @click="editCustomer(customer)">Edit</button>
               
                <button class="action-btn delete" @click="deleteCustomer(customer.id)">Delete</button>
              </td>
            </tr>
            <tr v-if="filteredCustomers.length === 0">
              <td colspan="9" class="empty-state">
                <div class="empty-content">
                  <span class="empty-icon">👥</span>
                  <p>No customers available</p>
                  <button class="add-first-btn" @click="showAddForm = true">Add First Customer</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedCustomers.length > 0" class="bulk-actions">
        <span>{{ selectedCustomers.length }} customer(s) selected</span>
        <button class="bulk-delete-btn" @click="deleteSelectedCustomers">Delete Selected</button>
      </div>

      <!-- Add Customer Modal -->
      <div v-if="showAddForm" class="modal-overlay" @click="showAddForm = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>Add New Customer</h3>
            <button class="close-btn" @click="showAddForm = false">×</button>
          </div>
          <form @submit.prevent="addCustomer" class="modal-form">
            <div class="form-group">
              <label>Customer Name *</label>
              <input 
                v-model="newCustomer.name" 
                placeholder="Enter customer name" 
                class="form-input" 
                required
                maxlength="100"
              >
            </div>
           
            <div class="form-group">
              <label>Phone Number</label>
              <input 
                v-model="newCustomer.phone" 
                placeholder="+91 999" 
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>Address</label>
              <textarea 
                v-model="newCustomer.address" 
                placeholder="Enter customer address" 
                class="form-input textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="showAddForm = false">Cancel</button>
              <button type="submit" class="btn-primary">Add Customer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Floating Add Button -->
      <button class="floating-add-btn" @click="showAddForm = true" title="Add New Customer">
        <span>+</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';

const customers = ref([]);
const selectedCustomers = ref([]);
const searchQuery = ref('');
const showAddForm = ref(false);
const newCustomer = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
});

// Computed property for filtered customers
const filteredCustomers = computed(() => {
  if (!searchQuery.value.trim()) {
    return customers.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return customers.value.filter(customer => 
    customer.name.toLowerCase().includes(query) ||
    (customer.email && customer.email.toLowerCase().includes(query)) ||
    (customer.phone && customer.phone.includes(query))
  );
});

const fetchCustomers = async () => {
  try {
    const res = await axios.get('customers/');
    customers.value = res.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
};

const addCustomer = async () => {
  if (!newCustomer.value.name.trim()) return;
  
  try {
    const res = await axios.post('customers/', { 
      name: newCustomer.value.name.trim(),
     
      contact: newCustomer.value.phone.trim() || null,
      address: newCustomer.value.address.trim() || null
    });
    
    customers.value.push(res.data);
    resetNewCustomer();
    showAddForm.value = false;
  } catch (error) {
    console.error('Error adding customer:', error);
    alert('Error adding customer. Please try again.');
  }
};

const editCustomer = (customer) => {
  console.log('Edit customer:', customer);
  
};

const viewCustomer = (customer) => {
  console.log('View customer:', customer);
  
};

const deleteCustomer = async (id) => {
  if (!confirm('Are you sure you want to delete this customer?')) return;
  
  try {
    await axios.delete(`customers/${id}/`);
    customers.value = customers.value.filter(c => c.id !== id);
    selectedCustomers.value = selectedCustomers.value.filter(customerId => customerId !== id);
  } catch (error) {
    console.error('Error deleting customer:', error);
    alert('Error deleting customer. Please try again.');
  }
};

const toggleAllCustomers = (event) => {
  if (event.target.checked) {
    selectedCustomers.value = customers.value.map(customer => customer.id);
  } else {
    selectedCustomers.value = [];
  }
};

const deleteSelectedCustomers = async () => {
  if (!confirm(`Are you sure you want to delete ${selectedCustomers.value.length} customer(s)?`)) return;
  
  try {
    await Promise.all(
      selectedCustomers.value.map(id => axios.delete(`customers/${id}/`))
    );
    await fetchCustomers();
    selectedCustomers.value = [];
  } catch (error) {
    console.error('Error deleting customers:', error);
    alert('Error deleting customers. Please try again.');
  }
};

const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const resetNewCustomer = () => {
  newCustomer.value = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };
};

onMounted(fetchCustomers);
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
  margin-bottom: 20px;
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

.customer-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.contact-cell {
  font-size: 0.9rem;
}

.contact-info {
  margin-bottom: 2px;
  color: #718096;
}

.orders-cell, .spent-cell {
  text-align: center;
  font-weight: 600;
}

.spent-cell {
  color: #10b981;
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
  gap: 6px;
}

.action-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #bee3f8;
  color: #2c5282;
}

.action-btn.edit:hover {
  background: #90cdf4;
}

.action-btn.view {
  background: #c6f6d5;
  color: #276749;
}

.action-btn.view:hover {
  background: #9ae6b4;
}

.action-btn.delete {
  background: #fed7d7;
  color: #c53030;
}

.action-btn.delete:hover {
  background: #feb2b2;
}

/* Checkbox */
.row-checkbox {
  transform: scale(1.1);
  cursor: pointer;
}

/* Bulk Actions */
.bulk-actions {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.bulk-delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.bulk-delete-btn:hover {
  background: #c82333;
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
  transition: background-color 0.2s;
}

.add-first-btn:hover {
  background: #4338ca;
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
  padding: 5px;
}

.close-btn:hover {
  color: #4a5568;
}

.modal-form {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #4a5568;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 30px;
}

.btn-secondary {
  padding: 12px 24px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.btn-primary {
  padding: 12px 24px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #4338ca;
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
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-add-btn:hover {
  transform: scale(1.1);
  background: #4338ca;
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
  
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .actions-cell {
    flex-direction: column;
    gap: 5px;
  }
  
  .action-btn {
    width: 100%;
    text-align: center;
  }
}
</style>