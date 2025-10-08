<template>
  <div>
    <div class="filters">
      <label>Select Products</label>
      <multiselect v-model="selectedProducts" :options="products" label="name" track-by="id" :multiple="true"
        placeholder="Choose products" :close-on-select="false" />
      <button @click="fetchProductReports">Generate Report</button>
    </div>

    <!-- Export Buttons -->
    <div v-if="productReports.length" class="export-buttons">
      <button @click="exportAllExcel">Export All Excel</button>
      <button @click="exportAllPDF">Export All PDF</button>
    </div>

    <!-- Multiple Product Reports -->
    <div v-for="report in productReports" :key="report.id" class="product-report">
      <h3 class="product-heading">{{ report.product }} ({{ report.sku }})</h3>
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
            <tr v-for="(variant, idx) in report.groupedVariants" :key="variant.color">
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
                <strong>{{ report.totals[size] }}</strong>
              </td>
              <td><strong>{{ report.totals.grand }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p v-if="!productReports.length && hasSearched">No product reports found</p>
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
const selectedProducts = ref([]);
const productReports = ref([]);
const hasSearched = ref(false);
const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

const loadProducts = async () => {
  const res = await axios.get("products/");
  products.value = Array.isArray(res.data) ? res.data : [];
};

const fetchProductReports = async () => {
  if (!selectedProducts.value.length) {
    alert("Please select at least one product");
    return;
  }

  hasSearched.value = true;
  productReports.value = [];

  // Fetch reports for all selected products
  for (const product of selectedProducts.value) {
    try {
      const res = await axios.get(`stockreport/${product.id}/`);
      const reportData = res.data;

      // Group stock by color
      const grouped = {};
      reportData.stock.forEach((item) => {
        if (!grouped[item.color]) {
          grouped[item.color] = { color: item.color, sizes: {} };
        }
        grouped[item.color].sizes[item.size] =
          (grouped[item.color].sizes[item.size] || 0) + item.quantity;
      });
      const groupedVariants = Object.values(grouped);

      // Calculate totals
      const totalObj = {};
      let grand = 0;
      sizeHeaders.forEach((s) => {
        totalObj[s] = groupedVariants.reduce(
          (acc, v) => acc + (v.sizes[s] || 0),
          0
        );
        grand += totalObj[s];
      });
      totalObj["grand"] = grand;

      // Add to reports array with all calculated data
      productReports.value.push({
        id: product.id,
        product: reportData.product,
        sku: reportData.sku,
        groupedVariants,
        totals: totalObj
      });
    } catch (error) {
      console.error(`Error fetching report for product ${product.id}:`, error);
    }
  }
};

// Export all products to Excel
const exportAllExcel = () => {
  const wb = XLSX.utils.book_new();

  productReports.value.forEach((report, index) => {
    const heading = [[`${report.product} (${report.sku})`]];
    const headers = [["#", "Color", ...sizeHeaders, "Total"]];

    const rows = report.groupedVariants.map((v, idx) => {
      const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
      return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
    });

    // Add totals row
    const totalRow = ["", "TOTAL", ...sizeHeaders.map((s) => report.totals[s]), report.totals.grand];

    const sheetData = [...heading, [], ...headers, ...rows, totalRow];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Limit sheet name to 31 characters (Excel limitation)
    const sheetName = `${report.product.substring(0, 25)}${index + 1}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, "Multiple_Product_Reports.xlsx");
};

// Export all products to PDF
const exportAllPDF = () => {
  const doc = new jsPDF();

  productReports.value.forEach((report, index) => {
    if (index > 0) {
      doc.addPage();
    }

    doc.setFontSize(14);
    doc.text(`${report.product} (${report.sku})`, 14, 20);

    const rows = report.groupedVariants.map((v, idx) => {
      const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
      return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
    });

    // Add totals row
    rows.push(["", "TOTAL", ...sizeHeaders.map((s) => report.totals[s]), report.totals.grand]);

    autoTable(doc, {
      head: [["#", "Color", ...sizeHeaders, "Total"]],
      body: rows,
      startY: 30,
    });
  });

  doc.save("Multiple_Product_Reports.pdf");
};

// Single product export functions (optional - if you want to keep them)
const exportProductExcel = (report) => {
  const wb = XLSX.utils.book_new();
  const heading = [[`${report.product} (${report.sku})`]];
  const headers = [["#", "Color", ...sizeHeaders, "Total"]];

  const rows = report.groupedVariants.map((v, idx) => {
    const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
    return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
  });

  // Add totals row
  const totalRow = ["", "TOTAL", ...sizeHeaders.map((s) => report.totals[s]), report.totals.grand];

  const sheetData = [...heading, [], ...headers, ...rows, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  XLSX.utils.book_append_sheet(wb, ws, "Product Report");
  XLSX.writeFile(wb, `${report.product}_Report.xlsx`);
};

const exportProductPDF = (report) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`${report.product} (${report.sku})`, 14, 20);

  const rows = report.groupedVariants.map((v, idx) => {
    const rowTotal = sizeHeaders.reduce((sum, s) => sum + (v.sizes[s] || 0), 0);
    return [idx + 1, v.color, ...sizeHeaders.map((s) => v.sizes[s] ?? 0), rowTotal];
  });

  // Add totals row
  rows.push(["", "TOTAL", ...sizeHeaders.map((s) => report.totals[s]), report.totals.grand]);

  autoTable(doc, {
    head: [["#", "Color", ...sizeHeaders, "Total"]],
    body: rows,
    startY: 30,
  });

  doc.save(`${report.product}_Report.pdf`);
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

.product-report {
  margin-bottom: 30px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.product-heading {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #1f2937;
  border-bottom: 2px solid #10b981;
  padding-bottom: 8px;
}

.table-wrapper {
  overflow-x: auto;
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
  font-weight: 600;
}
</style>