<template>
  <div>
    <div class="filters">
      <label>Select Product</label>
      <multiselect
        v-model="selectedProduct"
        :options="products"
        label="name"
        track-by="id"
        placeholder="Choose a product"
      />
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
              <th>S</th>
              <th>M</th>
              <th>L</th>
              <th>XL</th>
              <th>XXL</th>
              <th>XXXL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(variant, idx) in productReport.variants" :key="variant.color">
              <td>{{ idx + 1 }}</td>
              <td>{{ variant.color }}</td>
              <td>{{ variant.sizes.S ?? '-' }}</td>
              <td>{{ variant.sizes.M ?? '-' }}</td>
              <td>{{ variant.sizes.L ?? '-' }}</td>
              <td>{{ variant.sizes.XL ?? '-' }}</td>
              <td>{{ variant.sizes.XXL ?? '-' }}</td>
              <td>{{ variant.sizes.XXXL ?? '-' }}</td>
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
};

// Export to Excel with heading
const exportProductExcel = (report) => {
  const wb = XLSX.utils.book_new();

  // First row: product heading
  const heading = [[`${report.product} (${report.sku})`]];

  // Second row: table headers
  const headers = [["#", "Color", "S", "M", "L", "XL", "XXL", "XXXL"]];

  // Data rows
  const rows = report.variants.map((v, idx) => [
    idx + 1,
    v.color,
    v.sizes.S ?? 0,
    v.sizes.M ?? 0,
    v.sizes.L ?? 0,
    v.sizes.XL ?? 0,
    v.sizes.XXL ?? 0,
    v.sizes.XXXL ?? 0,
  ]);

  // Combine everything
  const sheetData = [...heading, [], ...headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, "Product Report");
  XLSX.writeFile(wb, "ProductReport.xlsx");
};

//Export to PDF with heading
const exportProductPDF = (report) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(14);
  doc.text(`${report.product} (${report.sku})`, 14, 20);

  // Table rows
  const rows = report.variants.map((v, idx) => [
    idx + 1,
    v.color,
    v.sizes.S ?? 0,
    v.sizes.M ?? 0,
    v.sizes.L ?? 0,
    v.sizes.XL ?? 0,
    v.sizes.XXL ?? 0,
    v.sizes.XXXL ?? 0,
  ]);

  autoTable(doc, {
    head: [["#", "Color", "S", "M", "L", "XL", "XXL", "XXXL"]],
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
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}
th {
  background: #f3f4f6;
  font-weight: 600;
}
</style>
