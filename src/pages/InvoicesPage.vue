<template>
  <div>
    <ModernHeader />

    <div class="dashboard-container">
      <h2 class="page-title">Packing Slips</h2>

      <!-- Empty State -->
      <div v-if="invoices.length === 0" class="empty-state">
        <span class="empty-icon">📦</span>
        <p>No packing slips available</p>
      </div>

      <!-- Invoice List -->
      <div class="invoice-grid">
        <div v-for="invoice in invoices" :key="invoice.id" class="invoice-card">
          <!-- Summary -->
          <div class="invoice-summary" @click="toggleInvoice(invoice.id)">
            <div class="left-info">
              <span class="invoice-number">#{{ invoice.invoice_number }}</span>
              <span class="invoice-date">{{ formatDate(invoice.date) }}</span>
            </div>
            <div class="customer-brief">
              <span class="customer-name">{{ invoice.customer.name }}</span>
              <span class="customer-contact">{{ invoice.customer.contact }}</span>
            </div>
            <div class="toggle-btn">
              {{ openInvoiceId === invoice.id ? "▲" : "▼" }}
            </div>
          </div>

          <!-- Details -->
          <transition name="fade">
            <div v-show="openInvoiceId === invoice.id" class="invoice-details">
              <div class="customer-info">
                <h4>Customer</h4>
                <p><strong>Name:</strong> {{ invoice.customer.name }}</p>
                <p><strong>Contact:</strong> {{ invoice.customer.contact }}</p>
                <p><strong>Address:</strong> {{ invoice.customer.address }}</p>
              </div>

              <!-- Grouped Products -->
              <div class="invoice-lines">
                <div v-for="(group, productName) in groupByProduct(invoice.lines)" :key="productName"
                  class="product-block">
                  <h5 class="product-title">{{ productName }}</h5>
                  <div class="table-wrapper">
                    <table class="matrix-table">
                      <thead>
                        <tr>
                          <th>Color</th>
                          <th v-for="size in sizeHeaders" :key="size">{{ size }}</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="variant in group.rows" :key="variant.color">
                          <td>{{ variant.color }}</td>
                          <td v-for="size in sizeHeaders" :key="size">
                            {{ variant.sizes[size] ?? 0 }}
                          </td>
                          <td class="font-bold">{{ variant.total }}</td>
                        </tr>
                        <tr class="grand-total-row">
                          <td><strong>Grand Total</strong></td>
                          <td v-for="size in sizeHeaders" :key="size">
                            <strong>{{ group.totals[size] }}</strong>
                          </td>
                          <td><strong>{{ group.grandTotal }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../plugins/axios.js";
import ModernHeader from "../components/header.vue";

const invoices = ref([]);
const openInvoiceId = ref(null);

const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

const fetchInvoices = async () => {
  try {
    const res = await axios.get("/invoices");
    invoices.value = res.data;
  } catch (err) {
    console.error("Error fetching invoices:", err);
  }
};

const toggleInvoice = (id) => {
  openInvoiceId.value = openInvoiceId.value === id ? null : id;
};

const formatDate = (d) => new Date(d).toLocaleDateString();

const groupByProduct = (lines) => {
  const grouped = {};

  lines.forEach((line) => {
    const product = line.variant.product;
    const color = line.variant.color.name;
    const size = line.size.display_name || line.size.code;

    if (!grouped[product]) grouped[product] = {};
    if (!grouped[product][color])
      grouped[product][color] = { color, sizes: {}, total: 0 };

    grouped[product][color].sizes[size] =
      (grouped[product][color].sizes[size] || 0) + line.quantity;

    grouped[product][color].total += line.quantity;
  });

  const result = {};
  Object.keys(grouped).forEach((prod) => {
    const rows = Object.values(grouped[prod]);
    const totals = {};
    let grandTotal = 0;

    sizeHeaders.forEach((s) => {
      totals[s] = rows.reduce((acc, r) => acc + (r.sizes[s] || 0), 0);
      grandTotal += totals[s];
    });

    result[prod] = { rows, totals, grandTotal };
  });

  return result;
};

onMounted(fetchInvoices);
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  color: #a0aec0;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.invoice-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invoice-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.invoice-card:hover {
  transform: translateY(-3px);
}

.invoice-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #edf2f7;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 1px solid #e2e8f0;
}

.left-info {
  display: flex;
  flex-direction: column;
}

.invoice-number {
  font-weight: bold;
  color: #2563eb;
}

.invoice-date {
  font-size: 0.85rem;
  color: #4a5568;
}

.customer-brief {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.customer-contact {
  font-size: 0.85rem;
  color: #4b5563;
}

.toggle-btn {
  font-size: 1.2rem;
  color: #374151;
  margin-left: 12px;
}

.invoice-details {
  padding: 15px;
}

.customer-info {
  margin-bottom: 15px;
}

.customer-info h4 {
  margin-bottom: 6px;
  font-weight: 600;
}

.product-block {
  margin-bottom: 20px;
}

.product-title {
  font-weight: 700;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #111827;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
}

.matrix-table th,
.matrix-table td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.matrix-table th {
  background: #f3f4f6;
}

.matrix-table tr:nth-child(even) {
  background: #f9fafb;
}

.grand-total-row {
  background: #fef3c7;
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
