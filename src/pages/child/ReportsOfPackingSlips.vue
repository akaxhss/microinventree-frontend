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
          <el-select v-model="selectedCustomerId" placeholder="All Customers" class="filter-select"
            @change="handleCustomerChange" clearable filterable>
            <!-- Always show "All Customers" option at the top -->
            <el-option label="All Customers" value="" />
            <!-- Then show sorted customers -->
            <el-option v-for="customer in sortedCustomers" :key="customer.id"
              :label="`${customer.name} (${customer.place})`" :value="customer.id" />
          </el-select>
        </div>

        <div class="filter-group">
          <label>Single Date</label>
          <el-date-picker v-model="singleDate" type="date" placeholder="Select date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" class="filter-input" />
        </div>

        <div class="filter-group">
          <label>Start Date</label>
          <el-date-picker v-model="startDate" type="date" placeholder="Select start date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" class="filter-input" />
        </div>

        <div class="filter-group">
          <label>End Date</label>
          <el-date-picker v-model="endDate" type="date" placeholder="Select end date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" class="filter-input" />
        </div>

        <div class="filter-actions">
          <el-button type="primary" @click="fetchPackingSlips(1)" :loading="loading" class="generate-btn">
            {{ loading ? 'Loading...' : 'Generate Report' }}
          </el-button>
          <el-button @click="resetFilters" :disabled="loading" class="reset-btn">
            Reset Filters
          </el-button>
        </div>
      </div>
    </div>

    <!-- Export Buttons -->
    <div v-if="packingSlips.length" class="export-section">
      <div class="export-header">
        <h3> Export Options</h3>
      </div>
      <div class="export-buttons">
        <el-button type="success" @click="exportExcel(packingSlips)">
          <i class="el-icon-download"></i>
          Export All Excel
        </el-button>
        <el-button type="danger" @click="exportPDF(packingSlips)">
          <i class="el-icon-document"></i>
          Export All PDF
        </el-button>
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
              <div class="customer-place" v-if="getCustomerPlace(slip.customer)">
                Location: {{ getCustomerPlace(slip.customer) }}
              </div>
              <div class="slip-meta">
                {{ slip.lines.length }} items • Created: {{ formatDateTime(slip.created_at) }}
              </div>
            </div>

            <div class="slip-actions" @click.stop>
              <el-button size="small" @click="editSlip(slip.slip_number)" title="Edit Packing Slip">
                <i class="el-icon-edit"></i>
                Edit
              </el-button>
              <el-button size="small" type="success" @click="exportSingleExcel(slip)" title="Export Excel">
                <i class="el-icon-download"></i>
                Excel
              </el-button>
              <el-button size="small" type="danger" @click="exportSinglePDF(slip)" title="Export PDF">
                <i class="el-icon-document"></i>
                PDF
              </el-button>
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
          <el-button size="small" :disabled="currentPage === 1 || loading" @click="() => goToPage(currentPage - 1)">
            Previous
          </el-button>

          <div class="page-numbers">
            <el-button v-for="page in visiblePages" :key="page" size="small"
              :type="page === currentPage ? 'primary' : ''" @click="() => goToPage(page)" :disabled="loading"
              class="page-number">
              {{ page }}
            </el-button>
            <span v-if="showEllipsis" class="page-ellipsis">...</span>
          </div>

          <el-button size="small" :disabled="currentPage === totalPages || loading"
            @click="() => goToPage(currentPage + 1)">
            Next
          </el-button>
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

// Element Plus components
import { ElSelect, ElOption, ElButton, ElDatePicker } from 'element-plus';

const props = defineProps({
  autoLoadToday: {
    type: Boolean,
    default: false
  }
});

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

const sizeHeaders = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];

// Distributor details
const distributorInfo = {
  name: "AS Distributors",
  address: "Allpy3rd Floor, Golden Tower, M.c Road, Vezhakkattuchira, Changanassery-",
  contact: "Phone: 0481 2425578 | Email: asdistributors2008@yahoo.com",
  gst: "GST: 32AAPFA6202PIZB"
};

// Computed properties
const sortedCustomers = computed(() => {
  return [...customers.value].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });
});

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


const loadLast20PackingSlips = async () => {
  try {
    loading.value = true;
    hasSearched.value = true;

    // Fetch last 20 packing slips using the  API endpoint
    const res = await axios.get("/packingslips/recent20/");

    packingSlips.value = res.data;
    resetPaginationData();

  } catch (error) {
    console.error("Error fetching last 20 packing slips:", error);
    alert("Error fetching packing slips!");
  } finally {
    loading.value = false;
  }
};

// Auto load today data
const loadTodaysData = async () => {
  try {
    loading.value = true;
    hasSearched.value = true;

    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    singleDate.value = today;

    // Fetch today's packing slips
    const res = await axios.get("/packingslipsfilter/", {
      params: { date: today }
    });

    packingSlips.value = res.data;
    resetPaginationData();

  } catch (error) {
    console.error("Error fetching today's packing slips:", error);
    alert("Error fetching today's packing slips!");
  } finally {
    loading.value = false;
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
      console.log('Fetching page:', page);
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
  console.log('Going to page:', page);
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
  // Load last 20 packing slips when resetting filters
  loadLast20PackingSlips();
};

const toggleSlip = (id) => {
  expandedSlip.value = expandedSlip.value === id ? null : id;
};

const getCustomerName = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId);
  return customer ? customer.name : `Customer #${customerId}`;
};

const getCustomerPlace = (customerId) => {
  const customer = customers.value.find(c => c.id === customerId);
  return customer ? customer.place : null;
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

// Export functions
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

    // Set smaller default font size
    doc.setFontSize(8);

    // Distributor details (left side - compact)
    doc.setFont(undefined, 'bold');
    doc.text("AS DISTRIBUTORS", 20, 15);

    doc.setFont(undefined, 'normal');

    // Distributor info with proper spacing
    const distributorLines = [
      "3rd Floor, Golden tower, Venkatarachina",
      "Nevagoschemy, Katryanska, Kerala | PN: 6965 U1",
      "TEL: 0481 2425578 | Email: asdistributors2008@yahoo.com",
      "GSTIN: 32AAPFA6202P2B"
    ];

    distributorLines.forEach((line, i) => {
      doc.text(line, 20, 22 + (i * 4));
    });

    // Customer details (right side - compact)
    doc.setFont(undefined, 'bold');
    doc.text("CUSTOMER DETAILS", 120, 15);
    doc.setFont(undefined, 'normal');

    let customerY = 22;

    if (customer) {
      // Customer info with proper line breaks
      const nameContact = `Name: ${customer.name || 'N/A'} | Contact: ${customer.contact || 'N/A'}`;
      const nameContactWidth = doc.getTextWidth(nameContact);

      if (nameContactWidth < 75) {
        doc.text(nameContact, 120, customerY);
        customerY += 4;
      } else {
        doc.text(`Name: ${customer.name || 'N/A'}`, 120, customerY);
        customerY += 4;
        doc.text(`Contact: ${customer.contact || 'N/A'}`, 120, customerY);
        customerY += 4;
      }

      doc.text(`Place: ${customer.place || 'N/A'}`, 120, customerY);
      customerY += 4;

      // Address with proper line wrapping
      const address = customer.address || 'N/A';
      const addressLines = doc.splitTextToSize(`Address: ${address}`, 70);
      addressLines.forEach((line, i) => {
        doc.text(line, 120, customerY + (i * 4));
      });
      customerY += (addressLines.length * 4);
    } else {
      doc.text("Name: Unknown", 120, customerY);
      customerY += 4;
      doc.text("Contact: N/A", 120, customerY);
      customerY += 4;
      doc.text("Place: N/A", 120, customerY);
      customerY += 4;
      doc.text("Address: N/A", 120, customerY);
    }

    // Horizontal separator line
    const slipY = 42;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(15, slipY - 3, 195, slipY - 3);

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("PACKING SLIP", 100, slipY, { align: "center" });

    // Calculate number of cartons (number of products)
    const numberOfCartons = Object.keys(grouped).length;

    // Slip information - compact single line (removed Created, added No of Cartons)
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    const slipInfoY = slipY + 5;
    doc.text(`Slip #: ${slip.slip_number || 'N/A'}`, 20, slipInfoY);
    doc.text(`Date: ${formatDate(slip.date) || 'N/A'}`, 90, slipInfoY);
    doc.text(`No of Cartons: `, 150, slipInfoY);//`No of Cartons: ${numberOfCartons}

    // Another separator line
    doc.line(15, slipInfoY + 3, 195, slipInfoY + 3);

    let y = slipInfoY + 10;

    Object.keys(grouped).forEach((product, productIndex) => {
      const group = grouped[product];

      // Check if we need a new page
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Product title NO SPACE after this
      doc.setFontSize(7);
      doc.setFont(undefined, 'bold');
      doc.text(product, 20, y);
      y += 1; // Small space after title header 

      // Table headers with better column widths
      doc.setFontSize(7);
      const headers = ["SN", "Color", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size", "S/M", "L/XL", "2/3XL", "Total"];

      // Draw table header with adjusted column widths
      let x = 20;
      const columnWidths = [8, 28, 8, 8, 8, 8, 10, 12, 14, 10, 12, 12, 12];

      // Header background
      doc.setFillColor(59, 130, 246);
      doc.rect(20, y, 170, 5, 'F');

      // Header text
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined, 'bold');

      headers.forEach((header, i) => {
        doc.text(header, x + 1, y + 3.5);
        x += columnWidths[i];
      });

      y += 5;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');

      // Table rows
      group.rows.forEach((row, rowIndex) => {
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;

          // Redraw header on new page
          doc.setFillColor(59, 130, 246);
          doc.rect(20, y, 170, 5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFont(undefined, 'bold');

          x = 20;
          headers.forEach((header, i) => {
            doc.text(header, x + 1, y + 3.5);
            x += columnWidths[i];
          });

          y += 5;
          doc.setTextColor(0, 0, 0);
          doc.setFont(undefined, 'normal');
        }

        x = 20;
        const rowData = [
          (rowIndex + 1).toString(),
          row.color,
          row.sizes.S || 0,
          row.sizes.M || 0,
          row.sizes.L || 0,
          row.sizes.XL || 0,
          row.sizes.XXL || 0,
          row.sizes.XXXL || 0,
          row.sizes["Free Size"] || 0,
          row.sizes["S/M"] || 0,
          row.sizes["L/XL"] || 0,
          row.sizes["2/3XL"] || 0,
          row.total.toString()
        ];

        // Alternate row background
        if (rowIndex % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(20, y, 170, 5, 'F');
        }

        rowData.forEach((cell, i) => {
          doc.text(cell.toString(), x + 1, y + 3.5);
          x += columnWidths[i];
        });

        y += 5;
      });

      // Grand total row
      y += 2;
      doc.setFillColor(220, 220, 220);
      doc.rect(20, y, 170, 5, 'F');
      doc.setFont(undefined, 'bold');

      x = 20;
      const grandTotalData = [
        "",
        "Grand Total",
        group.totals.S || 0,
        group.totals.M || 0,
        group.totals.L || 0,
        group.totals.XL || 0,
        group.totals.XXL || 0,
        group.totals.XXXL || 0,
        group.totals["Free Size"] || 0,
        group.totals["S/M"] || 0,
        group.totals["L/XL"] || 0,
        group.totals["2/3XL"] || 0,
        group.grandTotal.toString()
      ];

      grandTotalData.forEach((cell, i) => {
        doc.text(cell.toString(), x + 1, y + 3.5);
        x += columnWidths[i];
      });

      doc.setFont(undefined, 'normal');

      if (productIndex < Object.keys(grouped).length - 1) {
        y += 10; // Space between product sections
      } else {
        y += 8; // Less space after last product
      }
    });

    // Footer summary - compact
    const totalQuantity = Object.values(grouped).reduce((sum, group) => sum + group.grandTotal, 0);
    const totalProducts = Object.keys(grouped).length;

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Products: ${totalProducts}`, 20, y);
    doc.text(`Total Items: ${totalQuantity}`, 120, y);

    y += 8;

    // Signature lines - compact
    doc.text("Packed By: ___________________", 20, y);
    doc.text("Checked By: ___________________", 120, y);
  });

  doc.save("PackingSlips_Report.pdf");
};

const exportSingleExcel = (slip) => exportExcel([slip]);
const exportSinglePDF = (slip) => exportPDF([slip]);

onMounted(() => {
  loadCustomers();
  // Load last 20 packing slips automatically when page loads
  loadLast20PackingSlips();
});
</script>

<style scoped>
.reports-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 8px;
}

.page-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.filters-card {
  background: white;
  border-radius: 15px;
  padding: 34px 70px;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.filters-header h3 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.2rem;
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
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.filter-select,
.filter-input {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.generate-btn,
.reset-btn {
  flex: 1;
}

.export-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.export-header h3 {
  margin: 0 0 16px 0;
  color: #333;
}

.export-buttons {
  display: flex;
  gap: 12px;
}

.slips-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-header h3 {
  margin: 0;
  color: #333;
}

.results-summary {
  color: #666;
  font-size: 0.9rem;
}

.pagination-info {
  color: #999;
}

.slips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slip-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.slip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  cursor: pointer;
  transition: background-color 0.2s;
}

.slip-header:hover {
  background: #f1f5f9;
}

.slip-basic-info {
  flex: 0 0 150px;
}

.slip-number {
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.slip-date {
  color: #666;
  font-size: 0.9rem;
}

.slip-customer-info {
  flex: 1;
  margin: 0 20px;
}

.customer-name {
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.customer-place {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.slip-meta {
  color: #888;
  font-size: 0.8rem;
}

.slip-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.expand-icon {
  margin-left: 12px;
  color: #666;
}

.slip-details {
  padding: 20px;
  background: white;
}

.empty-lines {
  text-align: center;
  color: #666;
  padding: 20px;
}

.lines-header h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.product-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-block {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.product-title {
  background: #f8fafc;
  padding: 12px 16px;
  margin: 0;
  font-size: 1rem;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.table-container {
  overflow-x: auto;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th {
  background: #f1f5f9;
  padding: 8px 12px;
  text-align: center;
  font-weight: 600;
  color: #333;
  border: 1px solid #e2e8f0;
}

.items-table td {
  padding: 8px 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.color-cell {
  font-weight: 500;
  background: #f8fafc;
}

.quantity-cell {
  min-width: 50px;
}

.total-qty {
  font-weight: 600;
  background: #f0f9ff;
}

.grand-total {
  background: #dbeafe;
}

.grand-total td {
  font-weight: 600;
}

.pagination-container {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.page-numbers {
  display: flex;
  gap: 8px;
  align-items: center;
}

.page-ellipsis {
  color: #666;
  padding: 0 8px;
}

.empty-state,
.initial-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon,
.initial-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
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