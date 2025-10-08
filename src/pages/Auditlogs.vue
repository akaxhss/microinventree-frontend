<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />
      <div class="activity-logs-container">
        <div class="header-section">
          <h1 class="page-title">User Activity Logs</h1>
          <p class="page-subtitle">Track all user activities and system events</p>
        </div>

        <!-- Activity Logs List -->
        <div v-if="activityLogs.length" class="logs-container">
          <div class="results-header">
            <h3>Activity Logs ({{ totalCount }})</h3>
          </div>

          <div class="logs-table-container">
            <table class="logs-table">
              <thead>
                <tr>
                  <th class="user-column">User</th>
                  <th class="action-column">Action</th>
                  <th class="resource-column">Resource</th>
                  <th class="details-column">Details</th>
                  <th class="timestamp-column">Timestamp</th>
                  <th class="ip-column">IP Address</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in activityLogs" :key="log.id" class="log-row">
                  <td class="user-cell">
                    <span class="user-name">{{ log.user_name }}</span>
                  </td>
                  <td class="action-cell">
                    <span class="action-badge" :class="getActionClass(log.action)">
                      {{ log.action }}
                    </span>
                  </td>
                  <td class="resource-cell">
                    <div class="resource-info">
                      <div class="resource-type">{{ log.resource_type }}</div>
                      <div class="resource-name">{{ log.resource_name }}</div>
                    </div>
                  </td>
                  <td class="details-cell">
                    <div v-if="log.details" class="details-list">
                      <div v-for="(value, key) in getImportantDetails(log.details)" :key="key" class="detail-item">
                        <span class="detail-key">{{ formatKey(key) }}:</span>
                        <span class="detail-value">{{ formatValue(value) }}</span>
                      </div>
                    </div>
                    <span v-else class="no-details">No details</span>
                  </td>
                  <td class="timestamp-cell">
                    {{ formatDateTime(log.timestamp) }}
                  </td>
                  <td class="ip-cell">
                    {{ log.ip_address }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-container">
            <div class="pagination-info">
              Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalCount) }} of {{
                totalCount }} logs
            </div>
            <div class="pagination-controls">
              <button class="pagination-btn" :disabled="!previousPage || loading" @click="loadPage(previousPage)">
                Previous
              </button>

              <div class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
              </div>

              <button class="pagination-btn" :disabled="!nextPage || loading" @click="loadPage(nextPage)">
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading activity logs...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="!activityLogs.length && !loading" class="empty-state">
          <div class="empty-icon">📊</div>
          <h3>No Activity Logs Found</h3>
          <p>User activities will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../plugins/axios.js";

import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";
// Data
const activityLogs = ref([]);
const loading = ref(false);
const totalCount = ref(0);
const nextPage = ref(null);
const previousPage = ref(null);
const currentPage = ref(1);
const pageSize = 50;

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize);
});

// Methods
const fetchActivityLogs = async (url = null) => {
  try {
    loading.value = true;

    const apiUrl = url || "activity-logs/";
    const res = await axios.get(apiUrl);

    activityLogs.value = res.data.results;
    totalCount.value = res.data.count;
    nextPage.value = res.data.next;
    previousPage.value = res.data.previous;

    // Extract current page from next/previous URLs or default to 1
    if (res.data.next) {
      const urlParams = new URLSearchParams(new URL(res.data.next).search);
      currentPage.value = parseInt(urlParams.get('page')) - 1;
    } else if (res.data.previous) {
      const urlParams = new URLSearchParams(new URL(res.data.previous).search);
      currentPage.value = parseInt(urlParams.get('page')) + 1;
    } else {
      currentPage.value = 1;
    }

  } catch (error) {
    console.error("Error fetching activity logs:", error);
    alert("Error loading activity logs!");
  } finally {
    loading.value = false;
  }
};

const loadPage = (url) => {
  if (!url || loading.value) return;
  fetchActivityLogs(url);
};

const getActionClass = (action) => {
  const actionClasses = {
    create: 'action-create',
    update: 'action-update',
    delete: 'action-delete',
    view: 'action-view',
    login: 'action-login',
    logout: 'action-logout'
  };
  return actionClasses[action] || 'action-default';
};

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const formatKey = (key) => {
  // Convert snake_case to Title Case
  return key.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const formatValue = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  return value;
};

const getImportantDetails = (details) => {
  // Show only the most important details in the list view
  const importantKeys = ['quantity_added', 'new_quantity', 'old_quantity', 'size', 'color', 'product', 'supplier'];
  const filteredDetails = {};

  importantKeys.forEach(key => {
    if (details[key] !== undefined && details[key] !== null && details[key] !== '') {
      filteredDetails[key] = details[key];
    }
  });

  return Object.keys(filteredDetails).length > 0 ? filteredDetails : details;
};

// Lifecycle
onMounted(() => {
  fetchActivityLogs();
});
</script>

<style scoped>
.layout {
  display: flex;
}

.main-content {
  margin-left: 235px;
  flex: 1;
  min-height: 100vh;
  background: #f9fafb;
  padding: 20px;
}

.activity-logs-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.logs-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.results-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.logs-table-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.logs-table th {
  background: #f8fafc;
  padding: 1rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.logs-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.log-row:hover {
  background: #f8fafc;
}

/* Column specific styles */
.user-column {
  width: 120px;
}

.action-column {
  width: 100px;
}

.resource-column {
  width: 200px;
}

.details-column {
  width: 250px;
  min-width: 200px;
}

.timestamp-column {
  width: 180px;
}

.ip-column {
  width: 120px;
}

/* Cell content styles */
.user-cell .user-name {
  font-weight: 500;
  color: #1f2937;
}

.action-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

.action-create {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.action-update {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}

.action-delete {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.action-view {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.action-login {
  background: #f3e8ff;
  color: #7c3aed;
  border: 1px solid #e9d5ff;
}

.action-logout {
  background: #e0e7ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
}

.action-default {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.resource-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resource-type {
  font-weight: 500;
  color: #1f2937;
  font-size: 0.8rem;
}

.resource-name {
  color: #6b7280;
  font-size: 0.75rem;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.detail-key {
  font-weight: 500;
  color: #374151;
  font-size: 0.75rem;
  white-space: nowrap;
}

.detail-value {
  color: #6b7280;
  font-size: 0.75rem;
  text-align: right;
  white-space: nowrap;
}

.no-details {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.75rem;
}

.timestamp-cell {
  color: #6b7280;
  white-space: nowrap;
  font-size: 0.8rem;
}

.ip-cell {
  color: #6b7280;
  font-family: monospace;
  font-size: 0.8rem;
  white-space: nowrap;
}

/* Pagination Styles */
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
  gap: 1rem;
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

.page-info {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  border: 4px solid #f3f4f6;
  border-left: 4px solid #3b82f6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #374151;
}

.empty-state p {
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .activity-logs-container {
    padding: 10px;
  }

  .logs-table {
    font-size: 0.8rem;
  }

  .logs-table th,
  .logs-table td {
    padding: 0.75rem 0.5rem;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>