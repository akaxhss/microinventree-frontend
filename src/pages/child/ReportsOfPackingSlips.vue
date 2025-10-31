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
  Total Packing Slips: {{ totalItems }}
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
  
  <!-- In the table body -->
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
const sizes = ref([]); // Add sizes array
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

// Remove hardcoded sizeHeaders and use computed property
const sizeHeaders = computed(() => {
  return sizes.value.map(size => size.code);
});

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

const sortedSizes = computed(() => {
  return [...sizes.value].sort((a, b) => {
    // Custom sorting logic for sizes
    const sizeOrder = { 
      'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'XXXL': 7,
      'FREE SIZE': 8, 'S/M': 9, 'L/XL': 10, '2/3XL': 11
    };
    return (sizeOrder[a.code] || 999) - (sizeOrder[b.code] || 999);
  });
});

const totalItems = computed(() => {
  
  if (showPagination.value && totalCount.value > 0) {
    return totalCount.value;
  }
  
 
  return packingSlips.value.length;
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

const loadSizes = async () => {
  try {
    const res = await axios.get("/sizes/");
    sizes.value = res.data;
  } catch (error) {
    console.error("Error loading sizes:", error);
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
  return new Date(dateString).toLocaleDateString('en-GB'); 
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

    // Use dynamic size headers
    sizeHeaders.value.forEach((size) => {
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

    // PACKING SLIP REPORT Header
    wsData.push(["PACKING SLIP"]);
    wsData.push([]);

    // 🏢 Distributor + 👤 Customer headers aligned
    wsData.push([
      "A.S.DISTRIBUTORS",
      "",
      "",
      "",
      "",
      "",
      "CUSTOMER DETAILS"
    ]);

    // Distributor + Customer lines (like PDF layout)
    wsData.push([
      "1st FLOOR. GOLDEN TOWER",
      "",
      "",
      "",
      "",
      "",
      `Name: ${customer ? customer.name : "Unknown"}`
    ]);
    wsData.push([
      "VEZHEKKATTUCHIRA, CHANGANACHERRY",
      "",
      "",
      "",
      "",
      "",
      `Address: ${customer ? customer.address || "N/A" : "N/A"}`
    ]);
    wsData.push([
      "Kerala, PIN: 686101",
      "",
      "",
      "",
      "",
      "",
      `Place: ${customer ? customer.place || "N/A" : "N/A"}`
    ]);
    wsData.push([
      "Ph: 04812955578  Email: asdistributors2008@yahoo.com",
      "",
      "",
      "",
      "",
      "",
      `Contact: ${customer ? customer.contact || "N/A" : "N/A"}`
    ]);
    wsData.push([
      "GSTIN: 32AAPFA6202P2B"
    ]);

    wsData.push([]);

    //  Slip Information
    const cartons = Object.keys(grouped).length;
    wsData.push([`Slip Number: ${slip.slip_number}`]);
    wsData.push([`Date: ${formatDate(slip.date)}`]);
    wsData.push([`No of Cartons: `]);
    wsData.push([`Created At: ${formatDateTime(slip.created_at)}`]);
    wsData.push([]);

    // Products and Quantity Data
    Object.keys(grouped).forEach((product) => {
      const group = grouped[product];

      // Product Title
      wsData.push([product]);

      // Table header row (dynamic)
      wsData.push(["Color", ...sizeHeaders.value, "Total"]);

      // Product rows
      group.rows.forEach((row) => {
        wsData.push([
          row.color,
          ...sizeHeaders.value.map(size => row.sizes[size] || 0),
          row.total
        ]);
      });

      // Grand Total row
      wsData.push([
        "Grand Total",
        ...sizeHeaders.value.map(size => group.totals[size]),
        group.grandTotal
      ]);

      wsData.push([]);
    });

    // Overall Summary Section
    const totalProducts = Object.keys(grouped).length;
    const totalItems = Object.values(grouped).reduce((sum, g) => sum + g.grandTotal, 0);

    wsData.push(["SUMMARY"]);
    wsData.push([`Total Products: ${totalProducts}`]);
    wsData.push([`Total Items: ${totalItems}`]);

    //  Convert data to Excel Sheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    //  Dynamic Column Widths
    const colWidths = [
      { wch: 25 }, // Color column
      ...sizeHeaders.value.map(() => ({ wch: 10 })), // Size columns
      { wch: 12 } // Total Qty
    ];
    ws["!cols"] = colWidths;

    //  Append to workbook
    XLSX.utils.book_append_sheet(
      wb,
      ws,
      `Slip_${slip.slip_number.substring(0, 25)}`
    );
  });

  XLSX.writeFile(wb, "Packing_Slip_Report.xlsx");
};


const exportPDF = (data) => {
    const doc = new jsPDF();
    const slips = Array.isArray(data) ? data : [data];

    slips.forEach((slip, index) => {
        if (index > 0) doc.addPage();

        const customer = customers.value.find(c => c.id == slip.customer);
        const grouped = groupByProduct(slip.lines);
        const dynamicSizeHeaders = sizeHeaders.value;

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("PACKING SLIP", 105, 15, { align: "center" });
        doc.setDrawColor(150);
        doc.setLineWidth(0.4);
        doc.line(20, 18, 190, 18);

        // Distributor Details
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("A.S.DISTRIBUTORS", 20, 25);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        const addressLines = [
            "1st FLOOR. GOLDEN TOWER",
            "VEZHEKKATTUCHIRA, CHANGANACHERRY",
            "Kerala, PIN: 686101",
            "Ph: 04812955578  Email: asdistributors2008@yahoo.com",
            "GSTIN: 32AAPFA6202P2B"
        ];
        addressLines.forEach((line, i) => {
            doc.text(line, 20, 30 + (i * 3.5));
        });

        // Customer Details (Smart wrapping)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("CUSTOMER DETAILS", 130, 25);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);

        let customerY = 30;
        if (customer) {
            doc.text(`Name: ${customer.name || "N/A"}`, 130, customerY);
            customerY += 4;

            let addressText = `Address: ${customer.address || "N/A"}`;
            let commaCount = 0;
            addressText = addressText.replace(/,/g, (match) => {
                commaCount++;
                return commaCount % 3 === 0 ? ",\n" : ",";
            });

            const addressLines = doc.splitTextToSize(addressText, 65);
            addressLines.forEach((line, i) => {
                doc.text(line.trim(), 130, customerY + (i * 3.5));
            });

            customerY += (addressLines.length * 3.5) + 2;

            const locationText = `Place: ${customer.place || "N/A"}`;
            const locationLines = doc.splitTextToSize(locationText, 65);
            locationLines.forEach((line, i) => {
                doc.text(line.trim(), 130, customerY + (i * 3.5));
            });
        } else {
            const fallback = [
                "Name: Unknown",
                "Address: N/A",
                "Location: N/A"
            ];
            fallback.forEach((line, i) => doc.text(line, 130, customerY + (i * 3.5)));
        }

        // Separator
        const slipY = 53;
        doc.setDrawColor(180);
        doc.line(15, slipY, 195, slipY);

        // Slip Info
        const cartons = Object.keys(grouped).length;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const infoY = slipY + 5;
        doc.text(`Slip #: ${slip.slip_number || "N/A"}`, 20, infoY);
        doc.text(`Date: ${formatDate(slip.date) || "N/A"}`, 90, infoY);
        doc.text(`No of Cartons: `, 160, infoY);
        doc.line(15, infoY + 2, 195, infoY + 2);

        // Table Section
        let y = infoY + 10;
        Object.keys(grouped).forEach((product, idx) => {
            const group = grouped[product];

            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.text(product, 20, y);
            y += 3;

            // Header
            const headers = ["SN", "Color", ...dynamicSizeHeaders, "Total"];
            const baseWidths = { SN: 8, Color: 25, Total: 12 };
            const maxWidth = 190 - (baseWidths.SN + baseWidths.Color + baseWidths.Total + 10);
            const dynamicWidth = Math.max(7, Math.min(15, maxWidth / dynamicSizeHeaders.length));
            const columnWidths = [
                baseWidths.SN,
                baseWidths.Color,
                ...dynamicSizeHeaders.map(() => dynamicWidth),
                baseWidths.Total
            ];
            const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

            // Header Bar
            doc.setFillColor(59, 130, 246);
            doc.rect(20, y, totalWidth, 6, "F");
            doc.setTextColor(255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(6.5);

            let x = 20;
            headers.forEach((h, i) => {
                const colWidth = columnWidths[i];
                const txtWidth = doc.getTextWidth(h);
                const xOffset = (colWidth - txtWidth) / 2;
                doc.text(h, x + xOffset, y + 4);
                x += colWidth;
            });

            y += 6;
            doc.setTextColor(0);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);

            // Table Rows
            group.rows.forEach((row, rowIndex) => {
                if (rowIndex % 2 === 0) {
                    doc.setFillColor(245);
                    doc.rect(20, y, totalWidth, 6, "F");
                }

                x = 20;
                const rowData = [
                    (rowIndex + 1).toString(),
                    row.color,
                    ...dynamicSizeHeaders.map(size => row.sizes[size] || 0),
                    row.total.toString()
                ];

                rowData.forEach((cell, i) => {
                    const colWidth = columnWidths[i];
                    const txtWidth = doc.getTextWidth(String(cell));
                    const xOffset = Math.max(1, (colWidth - txtWidth) / 2);
                    doc.text(String(cell), x + xOffset, y + 4);
                    x += colWidth;
                });
                y += 6;
            });

            // Grand Total
            y += 2;
            doc.setFillColor(230, 230, 230);
            doc.rect(20, y, totalWidth, 7, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            x = 20;
            const totalData = [
                "",
                "Grand Total",
                ...dynamicSizeHeaders.map(size => group.totals[size] || 0),
                group.grandTotal.toString()
            ];
            totalData.forEach((cell, i) => {
                const colWidth = columnWidths[i];
                const txtWidth = doc.getTextWidth(String(cell));
                const xOffset = (colWidth - txtWidth) / 2;
                doc.text(String(cell), x + xOffset, y + 5);
                x += colWidth;
            });

            y += 10;
        });

        // Footer Summary (Aligned and Styled)
        const totalProducts = Object.keys(grouped).length;
        const totalItems = Object.values(grouped).reduce((a, g) => a + g.grandTotal, 0);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(`Total Products: ${totalProducts}`, 20, y);
        doc.setFontSize(10);
        doc.text(`Total Items: ${totalItems}`, 185, y, { align: "right" }); // right-aligned

        // Footer Lines
        y += 10;
        doc.setFontSize(7);
        doc.text("Packed By: ___________________", 20, y);
        doc.text("Checked By: ___________________", 120, y);
    });

    doc.save("Packing_Slip.pdf");
};






const exportSingleExcel = (slip) => exportExcel([slip]);
const exportSinglePDF = (slip) => exportPDF([slip]);

onMounted(() => {
  loadCustomers();
  loadSizes(); // Load sizes on mount
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