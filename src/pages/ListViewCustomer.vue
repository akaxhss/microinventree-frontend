<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title">Manage Customers</h2>

        <!-- Customers List -->
        <div class="customers-list-section">
          <div class="section-header">
            <h3 class="section-title">Existing Customers</h3>
            
            <!-- Filter Section -->
            <div class="filter-section">
              <div class="filter-group">
                <label for="customerFilter">Filter by Name</label>
                <input 
                  type="text" 
                  id="customerFilter" 
                  v-model="customerFilter" 
                  placeholder="Search customer by name..." 
                  class="filter-input" 
                />
                <button 
                  v-if="customerFilter" 
                  class="clear-filter-btn" 
                  @click="clearFilter"
                  title="Clear filter"
                >
                  ❌
                </button>
              </div>
              <router-link to="/add-customer" class="btn add-new-btn">
                ➕ Add New Customer
              </router-link>
            </div>
          </div>

          <div v-if="filteredCustomers.length === 0" class="empty-state">
            <div v-if="customerFilter">
              No customers found matching "{{ customerFilter }}"
            </div>
            <div v-else>
              No customers added yet. 
              <router-link to="/add-customer" class="add-link">Add your first customer</router-link>
            </div>
          </div>
          <div v-else class="customers-table">
            <div class="results-info">
              Showing {{ filteredCustomers.length }} of {{ customers.length }} customers
              <span v-if="customerFilter">for "{{ customerFilter }}"</span>
              <button class="btn download-all-btn" @click="downloadAllCustomers" title="Download all customers as CSV">
                📥 Download All as CSV
              </button>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Place</th>
                  <th>Address</th>
                  <th class="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in filteredCustomers" :key="customer.id">
                  <td class="name-cell">
                    <strong>{{ customer.name }}</strong>
                  </td>
                  <td class="contact-cell">
                    {{ customer.contact || '-' }}
                  </td>
                  <td class="place-cell">
                    {{ customer.place || '-' }}
                  </td>
                  <td class="address-cell">
                    <div class="address-info">
                      {{ customer.address || '-' }}
                      <div v-if="customer.address && customer.address.length > 50" class="address-tooltip">
                        📍
                        <div class="tooltip-text">{{ customer.address }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="actions-cell">
                    <button class="btn edit-btn" @click="openEditPopup(customer)" title="Edit">
                      ✏️
                    </button>
                    <button class="btn download-btn" @click="downloadCustomer(customer)" title="Download Details">
                      📥
                    </button>
                    <button class="btn danger-btn" @click="deleteCustomer(customer.id)" title="Delete">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Edit Customer Popup -->
      <div v-if="showEditPopup" class="popup-overlay" @click="closeEditPopup">
        <div class="popup-content" @click.stop>
          <div class="popup-header">
            <h3>Edit Customer</h3>
            <button class="close-btn" @click="closeEditPopup">✕</button>
          </div>
          <div class="popup-body">
            <div class="customer-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="editCustomerName">Customer Name *</label>
                  <input type="text" id="editCustomerName" v-model="editForm.name" placeholder="Enter customer name"
                    class="form-input" />
                </div>
                <div class="form-group">
                  <label for="editCustomerContact">Contact</label>
                  <input type="text" id="editCustomerContact" v-model="editForm.contact"
                    placeholder="Phone number or email" class="form-input" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="editCustomerPlace">Place</label>
                  <input type="text" id="editCustomerPlace" v-model="editForm.place" placeholder="City or location"
                    class="form-input" />
                </div>
                <div class="form-group full-width">
                  <label for="editCustomerAddress">Address</label>
                  <textarea id="editCustomerAddress" v-model="editForm.address" placeholder="Full address"
                    class="form-textarea" rows="3"></textarea>
                </div>
              </div>
            </div>
          </div>
          <div class="popup-footer">
            <button class="btn cancel-btn" @click="closeEditPopup">
              ❌ Cancel
            </button>
            <button class="btn save-btn" @click="updateCustomer" :disabled="!editForm.name">
              💾 Update Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

const router = useRouter();

// Customer data
const customers = ref([]);
const editingId = ref(null);

// Filter state
const customerFilter = ref("");

// Popup state
const showEditPopup = ref(false);

// Edit form for popup
const editForm = reactive({
  name: "",
  contact: "",
  place: "",
  address: ""
});

// Computed property for filtered customers
const filteredCustomers = computed(() => {
  if (!customerFilter.value) {
    return sortedCustomers.value;
  }
  
  const filter = customerFilter.value.toLowerCase();
  return sortedCustomers.value.filter(customer => 
    customer.name.toLowerCase().includes(filter) ||
    (customer.contact && customer.contact.toLowerCase().includes(filter)) ||
    (customer.place && customer.place.toLowerCase().includes(filter))
  );
});

// Computed property for sorted customers
const sortedCustomers = computed(() => {
  return [...customers.value].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

// Clear filter
const clearFilter = () => {
  customerFilter.value = "";
};

// Download single customer details as JSON
const downloadCustomer = (customer) => {
  const customerData = JSON.stringify([customer], null, 2);
  const blob = new Blob([customerData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `customer_${customer.name.replace(/\s+/g, '_')}_details.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Download all customers as CSV
const downloadAllCustomers = () => {
  if (customers.value.length === 0) {
    alert('No customers to download!');
    return;
  }

  // Convert customers data to CSV format
  const headers = ['ID', 'Name', 'Contact', 'Place', 'Address'];
  
  const csvData = customers.value.map(customer => [
    customer.id,
    `"${customer.name}"`,
    `"${customer.contact || ''}"`,
    `"${customer.place || ''}"`,
    `"${(customer.address || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `all_customers_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Load customers on mount
onMounted(async () => {
  await loadCustomers();
});

// Load customers from API
const loadCustomers = async () => {
  try {
    const res = await axios.get("/customers/");
    customers.value = res.data;
  } catch (error) {
    console.error("Error loading customers:", error);
    alert("Error loading customers!");
  }
};

// Open edit popup
const openEditPopup = (customer) => {
  showEditPopup.value = true;
  editingId.value = customer.id;

  // Fill edit form with customer data
  editForm.name = customer.name;
  editForm.contact = customer.contact || "";
  editForm.place = customer.place || "";
  editForm.address = customer.address || "";
};

// Close edit popup
const closeEditPopup = () => {
  showEditPopup.value = false;
  editingId.value = null;
};

// Update customer from popup
const updateCustomer = async () => {
  if (!editForm.name.trim()) {
    alert("Please enter customer name!");
    return;
  }

  try {
    const customerData = {
      name: editForm.name.trim(),
      contact: editForm.contact.trim(),
      place: editForm.place.trim(),
      address: editForm.address.trim()
    };

    // Update existing customer
    await axios.put(`/customers/${editingId.value}/`, customerData);
    alert("Customer updated successfully!");

    // Close popup and reload customers
    closeEditPopup();
    await loadCustomers();

  } catch (error) {
    console.error("Error updating customer:", error);
    alert("Error updating customer!");
  }
};

// Delete customer
const deleteCustomer = async (customerId) => {
  if (!confirm("Are you sure you want to delete this customer?")) {
    return;
  }

  try {
    await axios.delete(`/customers/${customerId}/`);
    await loadCustomers();
    alert("Customer deleted successfully!");
  } catch (error) {
    console.error("Error deleting customer:", error);
    alert("Error deleting customer!");
  }
};
</script>

<style scoped>

.add-new-btn {
  background: #4CAF50;
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.add-new-btn:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.add-link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 600;
  margin-left: 5px;
}

.add-link:hover {
  text-decoration: underline;
}

.filter-section {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}


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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.section-title {
  margin-bottom: 0;
  flex: 1;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
}

.filter-group label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
  margin-bottom: 0;
}

.filter-input {
  padding: 8px 35px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s;
  min-width: 250px;
}

.filter-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.clear-filter-btn {
  position: absolute;
  right: 8px;
  top: 70%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.clear-filter-btn:hover {
  background: #f0f0f0;
  color: #666;
}

.results-info {
  margin-bottom: 15px;
  color: #666;
  font-size: 0.9rem;
  font-style: italic;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #4CAF50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.download-all-btn {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.download-all-btn:hover {
  background: #1976D2;
  transform: translateY(-1px);
}

.customers-list-section {
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
  width: 150px;
  text-align: center;
}

.actions-cell {
  text-align: center;
}

.name-cell {
  font-weight: 600;
}

.contact-cell,
.place-cell,
.address-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.address-cell {
  max-width: 300px;
}

.address-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-tooltip {
  position: relative;
  cursor: pointer;
}

.address-tooltip:hover .tooltip-text {
  visibility: visible;
  opacity: 1;
}

.tooltip-text {
  visibility: hidden;
  width: 300px;
  background-color: #333;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
  white-space: normal;
  word-wrap: break-word;
}

.tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

/* Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.popup-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.popup-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e0e0e0;
}

.popup-body {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
}

.popup-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 25px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

/* Form Styles for Edit Popup */
.customer-form {
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

.form-textarea {
  resize: vertical;
  min-height: 80px;
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
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.download-btn {
  background: #FF9800;
  color: white;
  padding: 6px 10px;
  margin-right: 5px;
}

.download-btn:hover {
  background: #F57C00;
}

.danger-btn {
  background: #f44336;
  color: white;
  padding: 6px 10px;
}

.danger-btn:hover {
  background: #d32f2f;
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

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-section {
    justify-content: stretch;
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .filter-input {
    min-width: auto;
    width: 100%;
  }

  .results-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-col {
    width: 120px;
  }

  .address-cell {
    max-width: 150px;
  }

  .tooltip-text {
    width: 250px;
    font-size: 0.7rem;
  }

  .popup-content {
    width: 95%;
    max-height: 95vh;
  }

  .popup-body {
    padding: 15px;
  }

  .popup-footer {
    flex-direction: column;
  }
}
</style>