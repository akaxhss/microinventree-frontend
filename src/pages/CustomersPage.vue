<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title">Manage Customers</h2>

        <!-- Add/Edit Customer Form -->
        <div class="customer-form-section">
          <h3 class="section-title">{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h3>
          <div class="customer-form">
            <div class="form-row">
              <div class="form-group">
                <label for="customerName">Customer Name *</label>
                <input type="text" id="customerName" v-model="customerForm.name" placeholder="Enter customer name"
                  class="form-input" />
              </div>
              <div class="form-group">
                <label for="customerContact">Contact</label>
                <input type="text" id="customerContact" v-model="customerForm.contact"
                  placeholder="Phone number or email" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="customerPlace">Place</label>
                <input type="text" id="customerPlace" v-model="customerForm.place" placeholder="City or location"
                  class="form-input" />
              </div>
              <div class="form-group full-width">
                <label for="customerAddress">Address</label>
                <textarea id="customerAddress" v-model="customerForm.address" placeholder="Full address"
                  class="form-textarea" rows="3"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn save-btn" @click="saveCustomer" :disabled="!customerForm.name">
                {{ isEditing ? '💾 Update Customer' : '➕ Add Customer' }}
              </button>
              <button v-if="isEditing" class="btn cancel-btn" @click="cancelEdit">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Customers List -->
        <div class="customers-list-section">
          <h3 class="section-title">Existing Customers</h3>
          <div v-if="customers.length === 0" class="empty-state">
            No customers added yet. Add your first customer above.
          </div>
          <div v-else class="customers-table">
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
                <tr v-for="customer in sortedCustomers" :key="customer.id">
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
                    {{ customer.address || '-' }}
                  </td>
                  <td class="actions-cell">
                    <button class="btn edit-btn" @click="openEditPopup(customer)" title="Edit">
                      ✏️
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
</template>

<script setup>
import { ref, onMounted, reactive, computed } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Customer data
const customers = ref([]);
const isEditing = ref(false);
const editingId = ref(null);

// Popup state
const showEditPopup = ref(false);

// Customer form
const customerForm = reactive({
  name: "",
  contact: "",
  place: "",
  address: ""
});

// Edit form for popup
const editForm = reactive({
  name: "",
  contact: "",
  place: "",
  address: ""
});

// Computed property for sorted customers
const sortedCustomers = computed(() => {
  return [...customers.value].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

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

// Save customer (add or update)
const saveCustomer = async () => {
  if (!customerForm.name.trim()) {
    alert("Please enter customer name!");
    return;
  }

  try {
    const customerData = {
      name: customerForm.name.trim(),
      contact: customerForm.contact.trim(),
      place: customerForm.place.trim(),
      address: customerForm.address.trim()
    };

    if (isEditing.value) {
      // Update existing customer
      await axios.put(`/customers/${editingId.value}/`, customerData);
      alert("Customer updated successfully!");
    } else {
      // Add new customer
      await axios.post("/customers/", customerData);
      alert("Customer added successfully!");
    }

    // Reset form and reload customers
    resetForm();
    await loadCustomers();

  } catch (error) {
    console.error("Error saving customer:", error);
    alert("Error saving customer!");
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

// Edit customer (for the main form)
const editCustomer = (customer) => {
  isEditing.value = true;
  editingId.value = customer.id;

  // Fill form with customer data
  customerForm.name = customer.name;
  customerForm.contact = customer.contact || "";
  customerForm.place = customer.place || "";
  customerForm.address = customer.address || "";
};

// Cancel edit
const cancelEdit = () => {
  resetForm();
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

// Reset form
const resetForm = () => {
  isEditing.value = false;
  editingId.value = null;
  customerForm.name = "";
  customerForm.contact = "";
  customerForm.place = "";
  customerForm.address = "";
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

/* Customer Form */
.customer-form-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

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

/* Customers List */
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
  width: 120px;
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