<template>
  <div>
    <div class="filters">
      <label>Select Product</label>
      <multiselect v-model="selectedProduct" :options="products" label="name" track-by="id"
        placeholder="Choose a product" />
      <button @click="fetchProductReport">Generate Report</button>
    </div>

    <!-- Export Buttons -->
    <div v-if="productReport" class="export-buttons">
      <button @click="exportProductExcel(productReport)">Export Excel</button>
      <button @click="exportProductPDF(productReport)">Export PDF</button>
    </div>

    <!-- Grouped Product Report -->
    <div v-if="productReport" class="product-report">
      <h3 class="product-heading">{{ productReport.product }} ({{ productReport.sku }})</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Color</th>
              <th v-for="size in sizeHeaders" :key="size">{{ size }}</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(variant, idx) in groupedVariants" :key="variant.color">
              <td>{{ idx + 1 }}</td>
              <td>{{ variant.color }}</td>
              <td v-for="size in sizeHeaders" :key="size">{{ variant.sizes[size] ?? '-' }}</td>
              <td>
                {{
                  sizeHeaders.reduce(
                    (sum, s) => sum + (variant.sizes[s] || 0),
                    0
                  )
                }}
              </td>
            </tr>
            <!-- Totals Row -->
            <tr class="totals-row">
              <td></td>
              <td><strong>TOTAL</strong></td>
              <td v-for="size in sizeHeaders" :key="size">
                <strong>{{ totals[size] }}</strong>
              </td>
              <td><strong>{{ totals.grand }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-else>No product report found</p>
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

const products = ref([]);
const selectedProduct = ref(null);
const productReport = ref(null);
const groupedVariants = ref([]);
const totals = ref({});
const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

const loadProducts = async () => {
  const res = await axios.get("products/");
  products.value = Array.isArray(res.data) ? res.data : [];
};

const fetchProductReport = async () => {
  if (!selectedProduct.value) {
    alert("Please select a product");
    return;
  }
  const res = await axios.get(`stockreport/${selectedProduct.value.id}/`);
  productReport.value = res.data;

  // Group stock by color
  const grouped = {};
  res.data.stock.forEach((item) => {
    if (!grouped[item.color]) {
      grouped[item.color] = { color: item.color, sizes: {} };
    }
    grouped[item.color].sizes[item.size] =
      (grouped[item.color].sizes[item.size] || 0) + item.quantity;
  });
  groupedVariants.value = Object.values(grouped);

  // Calculate totals
  const totalObj = {};
  let grand = 0;
  sizeHeaders.forEach((s) => {
    totalObj[s] = groupedVariants.value.reduce(
      (acc, v) => acc + (v.sizes[s] || 0),
      0
    );
    grand += totalObj[s];
  });
  totalObj["grand"] = grand;
  totals.value = totalObj;
};

// Export to Excel with Totals
const exportProductExcel = (report) => {
  const wb = XLSX.utils.book_new();
  const heading = [[`${report.product} (${report.sku})`]];
  const headers = [["#", "Color", ...sizeHeaders, "Total"]];

  const rows = groupedVariants.value.map((v, idx) => {
    const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
    return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
  });

  // Add totals row
  const totalRow = ["", "TOTAL", ...sizeHeaders.map((s) => totals.value[s]), totals.value.grand];

  const sheetData = [...heading, [], ...headers, ...rows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, "Product Report");
  XLSX.writeFile(wb, "ProductReport.xlsx");
};

// Export to PDF with Totals
const exportProductPDF = (report) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`${report.product} (${report.sku})`, 14, 20);

  const rows = groupedVariants.value.map((v, idx) => {
    const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
    return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
  });

  // Add totals row
  rows.push(["", "TOTAL", ...sizeHeaders.map((s) => totals.value[s]), totals.value.grand]);

  autoTable(doc, {
    head: [["#", "Color", ...sizeHeaders, "Total"]],
    body: rows,
    startY: 30,
  });

  doc.save("ProductReport.pdf");
};

onMounted(loadProducts);
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

.product-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

th {
  background: #f3f4f6;
  font-weight: 600;
}

.totals-row {
  background: #fef3c7;
}
</style>
