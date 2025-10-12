<template>
  <div class="reports-container">
    <div class="header-section">
      <h1 class="page-title">Packing Slips Reports</h1>
      <p class="page-subtitle">Generate and export packing slip reports</p>
    </div>

    <!-- Filters Section -->
    <div class="filters-card">
      <div class="filters-header">
        <h3>Filter Reports</h3>
      </div>
      <div class="filters-grid">
        <div class="filter-group">
          <label>Select Customer</label>
          <select v-model="selectedCustomerId" class="filter-select" @change="handleCustomerChange">
            <option value="">All Customers</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Single Date</label>
          <input type="date" v-model="singleDate" class="filter-input" />
        </div>

        <div class="filter-group">
          <label>Start Date</label>
          <input type="date" v-model="startDate" class="filter-input" />
        </div>

        <div class="filter-group">
          <label>End Date</label>
          <input type="date" v-model="endDate" class="filter-input" />
        </div>

        <div class="filter-actions">
          <button class="generate-btn" @click="fetchPackingSlips(1)" :disabled="loading">
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </button>
          <button class="reset-btn" @click="resetFilters" :disabled="loading">
            Reset Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Export Buttons -->
    <div v-if="packingSlips.length" class="export-section">
      <div class="export-header">
        <h3> Export Options</h3>
      </div>
      <div class="export-buttons">
        <button class="export-btn excel" @click="exportExcel(packingSlips)">
          Export All Excel
        </button>
        <button class="export-btn pdf" @click="exportPDF(packingSlips)">
          Export All PDF
        </button>
      </div>
    </div>

    <!-- Packing Slips List -->
    <div v-if="packingSlips.length" class="slips-container">
      <div class="results-header">
        <h3> Packing Slips ({{ showPagination ? totalCount : packingSlips.length }})</h3>
        <div class="results-summary">
          Total Items: {{ totalItems }}
          <span v-if="showPagination" class="pagination-info">
            • Page {{ currentPage }} of {{ totalPages }}
          </span>
        </div>
      </div>

      <div class="slips-list">
        <div v-for="slip in packingSlips" :key="slip.id" class="slip-card">
          <!-- Header -->
          <div class="slip-header" @click="toggleSlip(slip.id)">
            <div class="slip-basic-info">
              <div class="slip-number">
                <strong>#{{ slip.slip_number }}</strong>
              </div>
              <div class="slip-date">
                {{ formatDate(slip.date) }}
              </div>
            </div>

            <div class="slip-customer-info">
              <div class="customer-name">
                <strong>{{ slip.customer_name || getCustomerName(slip.customer) }}</strong>
              </div>
              <div class="slip-meta">
                {{ slip.lines.length }} items • Created: {{ formatDateTime(slip.created_at) }}
              </div>
            </div>

            <div class="slip-actions" @click.stop>
              <button class="action-btn edit" @click="editSlip(slip.slip_number)" title="Edit Packing Slip">
                ✏️ Edit
              </button>
              <button class="action-btn excel" @click="exportSingleExcel(slip)" title="Export Excel">
                📊
              </button>
              <button class="action-btn pdf" @click="exportSinglePDF(slip)" title="Export PDF">
                📄
              </button>
              <span class="expand-icon">
                {{ expandedSlip === slip.id ? "▲" : "▼" }}
              </span>
            </div>
          </div>

          <!-- Details -->
          <div v-if="expandedSlip === slip.id" class="slip-details">
            <div v-if="slip.lines.length === 0" class="empty-lines">
              No items in this packing slip
            </div>

            <div v-else class="lines-container">
              <div class="lines-header">
                <h4>Items Details</h4>
              </div>

              <div class="product-groups">
                <div v-for="(group, productName) in groupByProduct(slip.lines)" :key="productName"
                  class="product-block">
                  <h5 class="product-title">{{ productName }}</h5>
                  <div class="table-container">
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Color</th>
                          <th v-for="size in sizeHeaders" :key="size">{{ size }}</th>
                          <th>Total Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="variant in group.rows" :key="variant.color">
                          <td class="color-cell">
                            {{ variant.color }}
                          </td>
                          <td v-for="size in sizeHeaders" :key="size" class="quantity-cell">
                            {{ variant.sizes[size] ?? 0 }}
                          </td>
                          <td class="total-qty">
                            <strong>{{ variant.total }}</strong>
                          </td>
                        </tr>
                        <tr class="grand-total">
                          <td><strong>Grand Total</strong></td>
                          <td v-for="size in sizeHeaders" :key="size">
                            <strong>{{ group.totals[size] || 0 }}</strong>
                          </td>
                          <td><strong>{{ group.grandTotal }}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination - Only show when "All Customers" is selected -->
      <div v-if="showPagination && totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalCount) }} of {{
            totalCount }} results
        </div>
        <div class="pagination-controls">
          <button class="pagination-btn" :disabled="currentPage === 1 || loading"
            @click="() => goToPage(currentPage - 1)">
            Previous
          </button>

          <div class="page-numbers">
            <button v-for="page in visiblePages" :key="page" class="page-number"
              :class="{ active: page === currentPage }" @click="() => goToPage(page)" :disabled="loading">
              {{ page }}
            </button>
            <span v-if="showEllipsis" class="page-ellipsis">...</span>
          </div>

          <button class="pagination-btn" :disabled="currentPage === totalPages || loading"
            @click="() => goToPage(currentPage + 1)">
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="hasSearched && !loading" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No Packing Slips Found</h3>
      <p>Try adjusting your filters or create new packing slips</p>
    </div>

    <!-- Initial State -->
    <div v-else-if="!hasSearched && !loading" class="initial-state">
      <div class="initial-icon">🔍</div>
      <h3>Generate Packing Slip Reports</h3>
      <p>Select filters above to view and export packing slips</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading packing slips...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "../../plugins/axios.js";

// Router
const router = useRouter();

// Data
const customers = ref([]);
const packingSlips = ref([]);
const selectedCustomerId = ref("");
const singleDate = ref("");
const startDate = ref("");
const endDate = ref("");
const expandedSlip = ref(null);
const hasSearched = ref(false);
const loading = ref(false);

// Pagination data
const currentPage = ref(1);
const totalCount = ref(0);
const totalPages = ref(0);
const pageSize = 50;
const nextPage = ref(null);
const previousPage = ref(null);

const sizeHeaders = ["S", "M", "L", "XL", "XXL", "XXXL"];

// Distributor details
const distributorInfo = {
  name: "AS Distributors",
  address: "Allpy3rd Floor, Golden Tower, M.c Road, Vezhakkattuchira, Changanassery-",
  contact: "Phone: 0481 2425578 | Email: asdistributors2008@yahoo.com",
  gst: "GST: 32AAPFA6202PIZB"
};

// Computed properties
const totalItems = computed(() => {
  return packingSlips.value.reduce((total, slip) => {
    return total + slip.lines.reduce((sum, line) => sum + line.quantity, 0);
  }, 0);
});

const showPagination = computed(() => {
  return !selectedCustomerId.value && !singleDate.value && !startDate.value && !endDate.value;
});

// Pagination computed properties
const visiblePages = computed(() => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage.value - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages.value, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

const showEllipsis = computed(() => {
  return totalPages.value > visiblePages.value.length &&
    visiblePages.value[visiblePages.value.length - 1] < totalPages.value;
});

// Methods
const loadCustomers = async () => {
  try {
    const res = await axios.get("/customers/");
    customers.value = res.data;
  } catch (error) {
    console.error("Error loading customers:", error);
  }
};

const handleCustomerChange = () => {
  // Reset to first page when customer changes
  currentPage.value = 1;
};

// Edit function - sends slip number as props
const editSlip = (slipNumber) => {
  if (slipNumber) {
    router.push({
      path: '/packingslipeditable',
      query: {
        slip_number: slipNumber
      }
    });
  }
};

const fetchPackingSlips = async (page = 1) => {
  try {
    loading.value = true;
    hasSearched.value = true;

    if (showPagination.value) {
      // Use paginated API for "All Customers" with no other filters
      console.log('Fetching page:', page); // Debug log
      const res = await axios.get(`/packingslippagination/?page=${page}`);
      handlePaginationResponse(res);
    } else {
      // Use regular filtered API for specific customer or date filters
      const params = {};

      if (selectedCustomerId.value) {
        params.customer_id = selectedCustomerId.value;
      }
      if (singleDate.value) {
        params.date = singleDate.value;
      }
      if (startDate.value && endDate.value) {
        params.start_date = startDate.value;
        params.end_date = endDate.value;
      }

      const res = await axios.get("/packingslipsfilter/", { params });
      packingSlips.value = res.data;
      // Reset pagination data for filtered results
      resetPaginationData();
    }
  } catch (error) {
    console.error("Error fetching packing slips:", error);
    alert("Error fetching packing slips!");
  } finally {
    loading.value = false;
  }
};

const goToPage = (page) => {
  console.log('Going to page:', page); // Debug log
  if (page < 1 || page > totalPages.value || loading.value) return;
  fetchPackingSlips(page);
};

const handlePaginationResponse = (response) => {
  packingSlips.value = response.data.results;
  totalCount.value = response.data.count;
  nextPage.value = response.data.next;
  previousPage.value = response.data.previous;

  // Extract current page from the response or URL
  if (response.data.page) {
    currentPage.value = response.data.page;
  } else if (response.data.next) {
    const urlParams = new URLSearchParams(new URL(response.data.next).search);
    currentPage.value = parseInt(urlParams.get('page')) - 1;
  } else if (response.data.previous) {
    const urlParams = new URLSearchParams(new URL(response.data.previous).search);
    currentPage.value = parseInt(urlParams.get('page')) + 1;
  } else {
    currentPage.value = 1;
  }

  totalPages.value = Math.ceil(totalCount.value / pageSize);
};

const resetPaginationData = () => {
  totalCount.value = packingSlips.value.length;
  nextPage.value = null;
  previousPage.value = null;
  currentPage.value = 1;
  totalPages.value = 1;
};

const resetFilters = () => {
  selectedCustomerId.value = "";
  singleDate.value = "";
  startDate.value = "";
  endDate.value = "";
  packingSlips.value = [];
  hasSearched.value = false;
  expandedSlip.value = null;
  resetPaginationData();
};

const toggleSlip = (id) => {
  expandedSlip.value = expandedSlip.value === id ? null : id;
};

const getCustomerName = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId);
  return customer ? customer.name : `Customer #${customerId}`;
};

const getCustomerDetails = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId);
  return customer ? customer : null;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const groupByProduct = (lines) => {
  const grouped = {};

  lines.forEach((line) => {
    const product = line.product_name;
    const color = line.color_name;
    const size = line.size_code;
    const quantity = line.quantity;

    if (!grouped[product]) grouped[product] = {};
    if (!grouped[product][color]) {
      grouped[product][color] = {
        color,
        sizes: {},
        total: 0
      };
    }

    grouped[product][color].sizes[size] =
      (grouped[product][color].sizes[size] || 0) + quantity;
    grouped[product][color].total += quantity;
  });

  const result = {};
  Object.keys(grouped).forEach((product) => {
    const rows = Object.values(grouped[product]);
    const totals = {};
    let grandTotal = 0;

    sizeHeaders.forEach((size) => {
      totals[size] = rows.reduce((acc, row) => acc + (row.sizes[size] || 0), 0);
      grandTotal += totals[size];
    });

    result[product] = { rows, totals, grandTotal };
  });

  return result;
};

// Export functions remain the same
const exportExcel = (data) => {
  const wb = XLSX.utils.book_new();

  data.forEach((slip) => {
    const wsData = [];
    const grouped = groupByProduct(slip.lines);
    const customer = getCustomerDetails(slip.customer);

    // Slip header with distributor and customer details
    wsData.push(["PACKING SLIP REPORT"]);
    wsData.push([]);

    wsData.push(["AS DISTRIBUTORS", "", "", "", "", "", "CUSTOMER DETAILS"]);
    wsData.push([distributorInfo.name, "", "", "", "", "", `Name: ${customer ? customer.name : 'Unknown'}`]);
    wsData.push([distributorInfo.address, "", "", "", "", "", `Contact: ${customer ? customer.contact : 'N/A'}`]);
    wsData.push([distributorInfo.contact, "", "", "", "", "", `Place: ${customer ? customer.place : 'N/A'}`]);
    wsData.push(["", "", "", "", "", "", `Address: ${customer ? customer.address : 'N/A'}`]);
    wsData.push([`GST: ${distributorInfo.gst}`]);

    wsData.push([]);

    // Slip information
    wsData.push([`Slip Number: ${slip.slip_number}`]);
    wsData.push([`Date: ${formatDate(slip.date)}`]);
    wsData.push([`Created At: ${formatDateTime(slip.created_at)}`]);
    wsData.push([]);

    Object.keys(grouped).forEach((product) => {
      const group = grouped[product];

      // Product heading
      wsData.push([product]);

      // Header row
      wsData.push(["Color", ...sizeHeaders, "Total Qty"]);

      // Data rows
      group.rows.forEach((row) => {
        wsData.push([
          row.color,
          ...sizeHeaders.map(size => row.sizes[size] || 0),
          row.total
        ]);
      });

      // Grand total row
      wsData.push([
        "Grand Total",
        ...sizeHeaders.map(size => group.totals[size]),
        group.grandTotal
      ]);

      wsData.push([]);
    });

    // Overall summary
    const totalQuantity = Object.values(grouped).reduce((sum, group) => sum + group.grandTotal, 0);
    wsData.push(["SUMMARY"]);
    wsData.push([`Total Products: ${Object.keys(grouped).length}`]);
    wsData.push([`Total Items: ${totalQuantity}`]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = [
      { wch: 20 }, // Color column
      { wch: 8 },  // S
      { wch: 8 },  // M
      { wch: 8 },  // L
      { wch: 8 },  // XL
      { wch: 8 },  // XXL
      { wch: 8 },  // XXXL
      { wch: 12 }  // Total Qty
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Slip_${slip.slip_number.substring(0, 25)}`);
  });

  XLSX.writeFile(wb, "PackingSlips_Report.xlsx");
};

const exportPDF = (data) => {
  const doc = new jsPDF();

  data.forEach((slip, index) => {
    if (index > 0) doc.addPage();

    const customer = getCustomerDetails(slip.customer);
    const grouped = groupByProduct(slip.lines);


    doc.setFontSize(16);
    doc.text("PACKING SLIP REPORT", 105, 20, { align: "center" });


    const boxY = 30;
    const boxWidth = 180;
    const boxHeight = 55;


    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, boxY, boxWidth, boxHeight, 'F');
    doc.rect(14, boxY, boxWidth, boxHeight, 'S');


    doc.setDrawColor(150, 150, 150);
    doc.line(105, boxY + 5, 105, boxY + boxHeight - 5);

    // Distributor details (left side of the box)
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text("AS DISTRIBUTORS", 25, boxY + 10);
    doc.setFont(undefined, 'normal');

    let currentY = boxY + 17;



    // Distributor address
    const addressLines = doc.splitTextToSize(distributorInfo.address, 75);
    doc.text(addressLines, 25, currentY);
    currentY += 8;

    // Split phone and email into separate lines
    const phoneMatch = distributorInfo.contact.match(/Phone:\s*([^|]+)/);
    const emailMatch = distributorInfo.contact.match(/Email:\s*(.+)/);

    const phone = phoneMatch ? phoneMatch[1].trim() : '0481 2425578';
    const email = emailMatch ? emailMatch[1].trim() : 'asdistributors2008@yahoo.com';

    // Phone line
    doc.text(`Phone: ${phone}`, 25, currentY);
    currentY += 8;

    // Email line
    doc.text(`Email: ${email}`, 25, currentY);
    currentY += 8;

    // Distributor GST
    doc.text(distributorInfo.gst, 25, currentY);

    // Customer details (right side of the box)
    doc.setFont(undefined, 'bold');
    doc.text("CUSTOMER DETAILS", 115, boxY + 10);
    doc.setFont(undefined, 'normal');

    let customerY = boxY + 17;

    // Customer name
    const customerName = `Name: ${customer ? customer.name : 'Unknown'}`;
    doc.text(customerName, 115, customerY);
    customerY += 8;

    // Customer contact
    const customerContact = `Contact: ${customer ? customer.contact : 'N/A'}`;
    doc.text(customerContact, 115, customerY);
    customerY += 8;

    // Customer place
    const customerPlace = `Place: ${customer ? customer.place : 'N/A'}`;
    doc.text(customerPlace, 115, customerY);
    customerY += 8;

    // Customer address
    const customerAddress = `Address: ${customer ? customer.address : 'N/A'}`;
    const addressTextLines = doc.splitTextToSize(customerAddress, 75);
    doc.text(addressTextLines, 115, customerY);

    // Slip information below the box
    const slipInfoY = boxY + boxHeight + 15;
    doc.setFontSize(10);
    doc.text(`Slip #: ${slip.slip_number}`, 14, slipInfoY);
    doc.text(`Date: ${formatDate(slip.date)}`, 14, slipInfoY + 7);
    doc.text(`Created: ${formatDateTime(slip.created_at)}`, 14, slipInfoY + 14);

    let y = slipInfoY + 30;

    Object.keys(grouped).forEach((product) => {
      const group = grouped[product];

      // Product title
      doc.setFontSize(12);
      doc.text(product, 14, y);
      y += 8;

      // Table data
      const tableData = group.rows.map(row => [
        row.color,
        ...sizeHeaders.map(size => row.sizes[size] || 0),
        row.total.toString()
      ]);

      // Add grand total row
      tableData.push([
        "Grand Total",
        ...sizeHeaders.map(size => group.totals[size].toString()),
        group.grandTotal.toString()
      ]);

      autoTable(doc, {
        head: [["Color", ...sizeHeaders, "Total"]],
        body: tableData,
        startY: y,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });

      y = doc.lastAutoTable.finalY + 15;
    });

    // Add summary
    const totalQuantity = Object.values(grouped).reduce((sum, group) => sum + group.grandTotal, 0);
    doc.text(`Total Products: ${Object.keys(grouped).length}`, 14, y);
    doc.text(`Total Items: ${totalQuantity}`, 14, y + 7);
  });

  doc.save("PackingSlips_Report.pdf");
};

const exportSingleExcel = (slip) => exportExcel([slip]);
const exportSinglePDF = (slip) => exportPDF([slip]);

onMounted(() => {
  loadCustomers();
});
</script>

<style scoped>
/* Edit button in slip actions */
.action-btn.edit {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.action-btn.edit:hover {
  background: #e0a800;
}

/* Update existing slip actions to accommodate edit button */
.slip-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .slip-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>

<style scoped>
.action-btn.edit {
  background: #ffc107;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.action-btn.edit:hover {
  background: #e0a800;
}

/* Update existing slip actions to accommodate edit button */
.slip-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}


@media (max-width: 768px) {
  .slip-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f8fafc;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-number {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 2.5rem;
}

.page-number:hover {
  background: #f3f4f6;
}

.page-number.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.page-ellipsis {
  padding: 0.5rem;
  color: #6b7280;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f4f6;
  border-left: 4px solid #10b981;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.pagination-info {
  margin-left: 10px;
  font-size: 0.8rem;
  color: #6b7280;
}

/* Keep all existing styles below */
.reports-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

.reports-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
}

/* Header Section */
.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Filters Card */
.filters-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filters-header {
  margin-bottom: 20px;
}

.filters-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.filter-select,
.filter-input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  gap: 12px;
  grid-column: 1 / -1;
}

.generate-btn,
.reset-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn {
  background: #10b981;
  color: white;
}

.generate-btn:hover {
  background: #059669;
}

.reset-btn {
  background: #6b7280;
  color: white;
}

.reset-btn:hover {
  background: #4b5563;
}

/* Export Section */
.export-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.export-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
}

.export-buttons {
  display: flex;
  gap: 12px;
}

.export-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-btn.excel {
  background: #059669;
  color: white;
}

.export-btn.excel:hover {
  background: #047857;
}

.export-btn.pdf {
  background: #dc2626;
  color: white;
}

.export-btn.pdf:hover {
  background: #b91c1c;
}

/* Slips Container */
.slips-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.results-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.results-summary {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Slip Cards */
.slips-list {
  padding: 0;
}

.slip-card {
  border-bottom: 1px solid #e5e7eb;
}

.slip-card:last-child {
  border-bottom: none;
}

.slip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.slip-header:hover {
  background: #f8fafc;
}

.slip-basic-info {
  flex: 1;
}

.slip-number {
  font-size: 1.1rem;
  color: #1f2937;
  margin-bottom: 4px;
}

.slip-date {
  font-size: 0.9rem;
  color: #6b7280;
}

.slip-customer-info {
  flex: 2;
  text-align: center;
}

.customer-name {
  font-size: 1rem;
  color: #1f2937;
  margin-bottom: 4px;
}

.slip-meta {
  font-size: 0.85rem;
  color: #6b7280;
}


.action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.action-btn:hover {
  background: #f3f4f6;
}

.expand-icon {
  color: #6b7280;
  font-weight: bold;
  margin-left: 8px;
}

/* Slip Details */
.slip-details {
  padding: 0 24px 24px 24px;
  background: #fafafa;
}

.empty-lines {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 40px;
}

.lines-header {
  margin-bottom: 16px;
}

.lines-header h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.product-block {
  margin-bottom: 24px;
}

.product-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.items-table th,
.items-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.items-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #374151;
  font-size: 0.85rem;
}

.color-cell {
  text-align: left;
}

.quantity-cell {
  font-weight: 500;
}

.total-qty {
  font-weight: 600;
}

.grand-total {
  background: #fef3c7;
  font-weight: 600;
}

.grand-total td {
  border-top: 2px solid #d97706;
}

/* Empty States */
.empty-state,
.initial-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon,
.initial-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-state h3,
.initial-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.empty-state p,
.initial-state p {
  color: #6b7280;
  font-size: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-container {
    padding: 16px;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    flex-direction: column;
  }

  .slip-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .slip-customer-info {
    text-align: left;
  }

  .export-buttons {
    flex-direction: column;
  }
}
</style>