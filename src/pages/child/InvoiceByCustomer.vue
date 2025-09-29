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

    <!-- Packing Slips -->
    <div v-if="customerReport.length" class="slip-list">
      <div v-for="invoice in customerReport" :key="invoice.id" class="slip-card">
        <!-- Header -->
        <div class="slip-header" @click="toggleInvoice(invoice.id)">
          <div>
            <h3>Packing Slip #{{ invoice.invoice_number }}</h3>
            <p>{{ formatDate(invoice.date) }}</p>
          </div>
          <div class="customer-info">
            <p><strong>{{ invoice.customer.name }}</strong></p>
            <p>{{ invoice.customer.contact }}</p>
          </div>

          <!-- Export per slip -->
          <div class="export-icons" @click.stop>
            <button class="icon-btn" @click="exportSingleExcel(invoice)">📊</button>
            <button class="icon-btn" @click="exportSinglePDF(invoice)">📄</button>
            <span class="expand-icon">{{ expandedInvoice === invoice.id ? "▲" : "▼" }}</span>
          </div>
        </div>

        <!-- Grouped Details -->
        <div v-if="expandedInvoice === invoice.id" class="slip-details">
          <div
            v-for="(group, productName) in groupByProduct(invoice.lines)"
            :key="productName"
            class="product-block"
          >
            <h4 class="product-title">{{ productName }}</h4>
            <table>
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
                  <td v-for="size in sizeHeaders" :key="size">{{ variant.sizes[size] ?? 0 }}</td>
                  <td>{{ variant.total }}</td>
                </tr>
                <tr class="grand-total">
                  <td><strong>Grand Total</strong></td>
                  <td v-for="size in sizeHeaders" :key="size"><strong>{{ group.totals[size] }}</strong></td>
                  <td><strong>{{ group.grandTotal }}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <p v-else>No packing slips found</p>
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

const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

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

const groupByProduct = (lines) => {
  const grouped = {};
  lines.forEach((line) => {
    const product = line.variant.product;
    const color = line.variant.color.name;
    const size = line.size.display_name || line.size.code;

    if (!grouped[product]) grouped[product] = {};
    if (!grouped[product][color]) grouped[product][color] = { color, sizes: {}, total: 0 };

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

// Export Functions
// ---- Export Functions ----
const exportExcel = (data) => {
  const wb = XLSX.utils.book_new();

  data.forEach((inv) => {
    const wsData = [];
    const grouped = groupByProduct(inv.lines);

    Object.keys(grouped).forEach((prod) => {
      const group = grouped[prod];

      // Product heading row
      wsData.push([`${prod} (${inv.invoice_number})`]);

      // Header row
      wsData.push(["Color", ...sizeHeaders, "Total"]);

      // Color rows
      group.rows.forEach((r) => {
        wsData.push([
          r.color,
          ...sizeHeaders.map((s) => r.sizes[s] || 0),
          r.total,
        ]);
      });

      // Grand total row
      wsData.push([
        "Grand Total",
        ...sizeHeaders.map((s) => group.totals[s]),
        group.grandTotal,
      ]);

      // Blank row between products
      wsData.push([]);
    });

    // Convert wsData → worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `Slip_${inv.invoice_number}`
    );
  });

  XLSX.writeFile(wb, "PackingSlips.xlsx");
};


const exportPDF = (data) => {
  const doc = new jsPDF();
  data.forEach((inv, idx) => {
    if (idx > 0) doc.addPage();
    doc.setFontSize(16);
    doc.text("Packing Slip", 90, 20);
    doc.text(`Slip #: ${inv.invoice_number}`, 14, 35);
    doc.text(`Date: ${formatDate(inv.date)}`, 14, 45);
    doc.text(`Customer: ${inv.customer.name}`, 14, 55);
    doc.text(`Contact: ${inv.customer.contact}`, 14, 65);

    const grouped = groupByProduct(inv.lines);
    let y = 80;
    Object.keys(grouped).forEach((prod) => {
      doc.text(`${prod}`, 14, y);
      y += 6;
      const group = grouped[prod];
      const rows = group.rows.map((r) => [
        r.color,
        ...sizeHeaders.map((s) => r.sizes[s] || 0),
        r.total,
      ]);
      rows.push([
        "Grand Total",
        ...sizeHeaders.map((s) => group.totals[s]),
        group.grandTotal,
      ]);
      autoTable(doc, {
        head: [["Color", ...sizeHeaders, "Total"]],
        body: rows,
        startY: y,
      });
      y = doc.lastAutoTable.finalY + 15;
    });
  });
  doc.save("PackingSlips.pdf");
};

const exportSingleExcel = (invoice) => exportExcel([invoice]);
const exportSinglePDF = (invoice) => exportPDF([invoice]);

onMounted(loadCustomers);
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center;
}
.filters label {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}
.filters input[type="date"] {
  width: 160px;
}
.filters button {
  margin-left: auto;
  padding: 8px 14px;
  background: #10b981;
  color: white;
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
  color: white;
  border: none;
  border-radius: 6px;
}
.slip-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 15px;
}
.slip-header {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f3f4f6;
  cursor: pointer;
}
.slip-details {
  padding: 10px;
}
.product-title {
  font-weight: bold;
  margin: 10px 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #e5e7eb;
  padding: 8px;
  text-align: center;
}
th {
  background: #f9fafb;
}
.grand-total {
  background: #fef3c7;
  font-weight: bold;
}
</style>
