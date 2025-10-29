<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <div class="page-header">
          <h2 class="page-title">
            <Icon name="plus" size="20" class="page-icon" />
            Add New Customer
          </h2>
          <router-link to="/listviewcustomer" class="btn back-btn">
            <Icon name="arrowLeft" size="16" class="btn-icon" />
            Back to Customers List
          </router-link>
        </div>

        <!-- Add Customer Form -->
        <div class="customer-form-section">
          <h3 class="section-title">Customer Details</h3>
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
                <Icon name="plus" size="16" class="btn-icon" />
                Add Customer
              </button>
              <router-link to="/listviewcustomer" class="btn cancel-btn">
                <Icon name="close" size="16" class="btn-icon" />
                Cancel
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

const router = useRouter();

// Customer form
const customerForm = reactive({
  name: "",
  contact: "",
  place: "",
  address: ""
});

// Save customer
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

    // Add new customer
    await axios.post("/customers/", customerData);
    alert("Customer added successfully!");

    // Redirect to customers list
    router.push('/listviewcustomer');

  } catch (error) {
    console.error("Error saving customer:", error);
    alert("Error saving customer!");
  }
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
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.back-btn {
  background: #757575;
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

.back-btn:hover {
  background: #616161;
  transform: translateY(-1px);
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
  justify-content: flex-start;
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

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: auto;
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

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>