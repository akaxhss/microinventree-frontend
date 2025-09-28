<template>
  <div>
    <div class="filters">
      <label>Select Customer</label>
      <multiselect
        v-model="selectedCustomer"
        :options="customerOptions"
        label="name"
        track-by="id"
        placeholder="Choose a customer"
      />

      <label>Start Date</label>
      <input type="date" v-model="startDate" />

      <label>End Date</label>
      <input type="date" v-model="endDate" />

      <button @click="fetchCustomerReport">Generate Report</button>
    </div>

    <!-- Export Buttons -->
    <div v-if="customerReport.length" class="export-buttons">
      <button @click="exportExcel(customerReport)">Export All Excel</button>
      <button @click="exportPDF(customerReport)">Export All PDF</button>
    </div>

    <!-- Collapsible Invoice List -->
    <div v-if="customerReport.length" class="invoice-list">
      <div v-for="invoice in customerReport" :key="invoice.id" class="invoice-card">
        <!-- Header -->
        <div class="invoice-header" @click="toggleInvoice(invoice.id)">
          <div>
            <h3>#{{ invoice.invoice_number }}</h3>
            <p>{{ formatDate(invoice.date) }}</p>
          </div>
          <div class="customer-info">
            <p><strong>{{ invoice.customer.name }}</strong></p>
            <p>{{ invoice.customer.contact }}</p>
          </div>

          <!-- Right Side: Export Buttons -->
          <div class="export-icons" @click.stop>
            <button class="icon-btn" @click="exportSingleExcel(invoice)">📊</button>
            <button class="icon-btn" @click="exportSinglePDF(invoice)">📄</button>
            <span class="expand-icon">{{ expandedInvoice === invoice.id ? "▲" : "▼" }}</span>
          </div>
        </div>

        <!-- Expanded Details -->
        <div v-if="expandedInvoice === invoice.id" class="invoice-details">
          <table>
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
                <td>{{ line.size.display_name }}</td>
                <td>{{ line.quantity }}</td>
                <td>₹{{ line.unit_price }}</td>
                <td>₹{{ (line.quantity * parseFloat(line.unit_price)).toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <p v-else>No invoices found</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../../plugins/axios.js";

const customerOptions = ref([]);
const selectedCustomer = ref(null);
const startDate = ref("");
const endDate = ref("");
const customerReport = ref([]);
const expandedInvoice = ref(null);

const toggleInvoice = (id) => {
  expandedInvoice.value = expandedInvoice.value === id ? null : id;
};

const loadCustomers = async () => {
  const res = await axios.get("customers/");
  customerOptions.value = Array.isArray(res.data) ? res.data : [];
};
const fetchCustomerReport = async () => {
  if (!selectedCustomer.value) {
    alert("Please select a customer");
    return;
  }
  const res = await axios.get("fetchcustomerinvoice", {
    params: {
      customer: selectedCustomer.value.name,
      start_date: startDate.value,
      end_date: endDate.value,
    },
  });
  customerReport.value = res.data;
};
const formatDate = (d) => new Date(d).toLocaleDateString();

// Bulk Export
const exportExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  data.forEach((inv) => {
    const rows = inv.lines.map((line) => ({
      Invoice: inv.invoice_number,
      Date: formatDate(inv.date),
      Customer: inv.customer.name,
      Contact: inv.customer.contact,
      Product: line.variant.product,
      Color: line.variant.color.name,
      Size: line.size.display_name,
      Quantity: line.quantity,
      "Unit Price": line.unit_price,
      Total: (line.quantity * parseFloat(line.unit_price)).toFixed(2),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, ws, `Invoice_${inv.invoice_number}`);
  });
  XLSX.writeFile(workbook, "AllInvoices.xlsx");
};
const exportPDF = (data) => {
  const doc = new jsPDF();
  data.forEach((inv, idx) => {
    if (idx > 0) doc.addPage();
    doc.setFontSize(16);
    doc.text("INVOICE", 90, 20);
    doc.text(`Invoice Number: ${inv.invoice_number}`, 14, 35);
    doc.text(`Date: ${formatDate(inv.date)}`, 14, 45);
    doc.text(`Customer: ${inv.customer.name}`, 14, 55);
    doc.text(`Contact: ${inv.customer.contact}`, 14, 65);
    const rows = inv.lines.map((line) => [
      line.variant.product,
      line.variant.color.name,
      line.size.display_name,
      line.quantity,
      line.unit_price,
      (line.quantity * parseFloat(line.unit_price)).toFixed(2),
    ]);
    autoTable(doc, { head: [["Product","Color","Size","Qty","Unit Price","Total"]], body: rows, startY: 80 });
  });
  doc.save("AllInvoices.pdf");
};

// Single Invoice
const exportSingleExcel = (invoice) => {
  const rows = invoice.lines.map((line) => ({
    Product: line.variant.product,
    Color: line.variant.color.name,
    Size: line.size.display_name,
    Quantity: line.quantity,
    "Unit Price": line.unit_price,
    Total: (line.quantity * parseFloat(line.unit_price)).toFixed(2),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Invoice_${invoice.invoice_number}`);
  XLSX.writeFile(wb, `Invoice_${invoice.invoice_number}.xlsx`);
};
const exportSinglePDF = (invoice) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("INVOICE", 90, 20);
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 14, 40);
  doc.text(`Date: ${formatDate(invoice.date)}`, 14, 50);
  doc.text(`Customer: ${invoice.customer.name}`, 14, 65);
  doc.text(`Contact: ${invoice.customer.contact}`, 14, 75);
  const rows = invoice.lines.map((line) => [
    line.variant.product,
    line.variant.color.name,
    line.size.display_name,
    line.quantity,
    line.unit_price,
    (line.quantity * parseFloat(line.unit_price)).toFixed(2),
  ]);
  autoTable(doc, { head: [["Product","Color","Size","Qty","Unit Price","Total"]], body: rows, startY: 90 });
  doc.save(`Invoice_${invoice.invoice_number}.pdf`);
};

onMounted(loadCustomers);
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 25px;
}
.filters label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
  font-weight: 500;
}
.filters input[type="date"] {
  width: 160px;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
}
.filters button {
  margin-left: auto;
  padding: 8px 14px;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.export-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.export-buttons button {
  padding: 8px 14px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.invoice-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.invoice-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f3f4f6;
  cursor: pointer;
}
.export-icons {
  display: flex;
  gap: 8px;
  align-items: center;
}
.icon-btn {
  border: none;
  background: #e5e7eb;
  border-radius: 50%;
  padding: 6px;
  cursor: pointer;
}
.invoice-details {
  padding: 10px 16px;
}
.invoice-details table {
  width: 100%;
  border-collapse: collapse;
}
.invoice-details th,
.invoice-details td {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}
.invoice-details th {
  background: #f9fafb;
  font-weight: 600;
}
</style>
