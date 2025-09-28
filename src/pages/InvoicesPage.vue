<template>
  <div>
    <!-- Modern Header -->
    <ModernHeader />

    <!-- Dashboard Container -->
    <div class="dashboard-container">
      <h2 class="page-title">Invoices</h2>

      <div v-if="invoices.length === 0" class="empty-state">
        <div class="empty-content">
          <span class="empty-icon">📄</span>
          <p>No invoices available</p>
        </div>
      </div>

      <div class="invoice-grid">
        <div v-for="invoice in invoices" :key="invoice.id" class="invoice-card">
          <div class="invoice-summary" @click="toggleInvoice(invoice.id)">
            <span class="invoice-number">#{{ invoice.invoice_number }}</span>
            <span class="invoice-date">{{ invoice.date }}</span>
            <span class="toggle-icon">{{ openInvoiceId === invoice.id ? '-' : '+' }}</span>
          </div>

          <div v-if="openInvoiceId === invoice.id" class="invoice-details">
            <div class="customer-info">
              <h4>Customer:</h4>
              <p><strong>Name:</strong> {{ invoice.customer.name }}</p>
              <p><strong>Contact:</strong> {{ invoice.customer.contact || '-' }}</p>
              <p><strong>Address:</strong> {{ invoice.customer.address || '-' }}</p>
            </div>

            <div class="invoice-lines">
              <h4>Items:</h4>
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Color</th>
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="line in invoice.lines" :key="line.id">
                    <td>{{ line.variant.product }}</td>
                    <td>{{ line.variant.color.name }}</td>
                    <td>{{ line.size.display_name || line.size.code }}</td>
                    <td>{{ line.quantity }}</td>
                    <td>{{ line.unit_price }}</td>
                    <td>{{ (parseFloat(line.unit_price) * line.quantity).toFixed(2) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';

const invoices = ref([]);
const openInvoiceId = ref(null);

const fetchInvoices = async () => {
  try {
    const res = await axios.get('/invoices');
    invoices.value = res.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
};

const toggleInvoice = (id) => {
  openInvoiceId.value = openInvoiceId.value === id ? null : id;
};

onMounted(fetchInvoices);
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1a202c;
}

/* Empty State */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #a0aec0;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 10px;
}

/* Invoice Grid */
.invoice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

/* Invoice Card */
.invoice-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  overflow: hidden;
}

.invoice-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

/* Summary Header */
.invoice-summary {
  display: flex;
  justify-content: space-between;
  padding: 15px 20px;
  font-weight: 600;
  background-color: #f7fafc;
  cursor: pointer;
}

.toggle-icon {
  font-size: 1.3rem;
}

/* Invoice Details */
.invoice-details {
  padding: 15px 20px;
  border-top: 1px solid #e2e8f0;
}

.customer-info h4,
.invoice-lines h4 {
  margin-bottom: 8px;
}

.customer-info p {
  margin: 3px 0;
}

/* Modern Table */
.modern-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.modern-table th,
.modern-table td {
  border: 1px solid #e2e8f0;
  padding: 10px;
  text-align: left;
}

.modern-table th {
  background: #f3f4f6;
  font-weight: 600;
  color: #4a5568;
}

@media (max-width: 768px) {
  .invoice-grid {
    grid-template-columns: 1fr;
  }
}
</style>
