<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />
      <div class="dashboard-container">
        <!-- Welcome Section -->
        <section class="welcome-section">
          <div class="welcome-content">
            <h1 class="welcome-title">👋 Welcome back, {{ username }}!</h1>
            <p class="welcome-subtitle">Your clothing inventory management dashboard</p>
          </div>
          <div class="date-display">
            {{ currentDate }}
          </div>
        </section>

        <!-- Dashboard Stats Grid -->
        <section class="stats-grid">
          <!-- Last Backup -->
          <div class="stat-card">
            <div class="stat-icon">💾</div>
            <div class="stat-content">
              <h3 class="stat-title">Last Backup</h3>
              <p class="stat-value" v-if="lastBackup.file_name">{{ lastBackup.file_name }}</p>
              <p class="stat-value" v-else>No backup taken</p>
              <p class="stat-details">
                <span v-if="lastBackup.last_backup_at">Date: {{ formatDateTime(lastBackup.last_backup_at) }}</span>
                <span v-if="lastBackup.performed_by"> • By: {{ lastBackup.performed_by }}</span>
              </p>
            </div>
          </div>

          <!-- Last Login -->
          <div class="stat-card">
            <div class="stat-icon">👤</div>
            <div class="stat-content">
              <h3 class="stat-title">Last Login</h3>
              <p class="stat-value">{{ lastLogin.username || 'N/A' }}</p>
              <p class="stat-details" v-if="lastLogin.last_login">
                {{ formatDateTime(lastLogin.last_login) }}
              </p>
              <p class="stat-details" v-else>
                No login data
              </p>
            </div>
          </div>

          <!-- Recent Packing Slip -->
          <div class="stat-card">
            <div class="stat-icon">🧾</div>
            <div class="stat-content">
              <h3 class="stat-title">Recent Packing Slip</h3>
              <p class="stat-value">{{ lastPackingSlip.slip_number || 'No slips' }}</p>
              <p class="stat-details" v-if="lastPackingSlip.customer">
                Customer: {{ lastPackingSlip.customer }}
                <span v-if="lastPackingSlip.created_by"> • By: {{ lastPackingSlip.created_by }}</span>
              </p>
              <p class="stat-details" v-if="lastPackingSlip.created_at">
                {{ formatDateTime(lastPackingSlip.created_at) }}
              </p>
            </div>
          </div>

          <!-- Recent Stock Addition -->
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <h3 class="stat-title">Recent Stock</h3>
              <p class="stat-value">{{ lastStock.product || 'No stock added' }}</p>
              <p class="stat-details" v-if="lastStock.product">
                {{ lastStock.color }} • {{ lastStock.size }} • Qty: {{ lastStock.quantity }}
              </p>
              <p class="stat-details" v-if="lastStock.supplier">
                Supplier: {{ lastStock.supplier }}
              </p>
              <p class="stat-details" v-if="lastStock.added_at && lastStock.added_at !== 'N/A'">
                {{ formatDateTime(lastStock.added_at) }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "../plugins/axios.js";
import ModernHeader from '../components/header.vue';
import Sidebar from '../components/Sidebar.vue';

const username = localStorage.getItem("username") || "User";

// Data for dashboard stats
const lastBackup = ref({});
const lastLogin = ref({});
const lastPackingSlip = ref({});
const lastStock = ref({});

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Methods
const formatDateTime = (dateString) => {
  if (!dateString || dateString === 'N/A') return 'N/A';

  // Handle both ISO format and "YYYY-MM-DD HH:mm:ss" format
  let date;
  if (dateString.includes('T')) {
    date = new Date(dateString);
  } else {
    // Replace space with T for ISO format
    date = new Date(dateString.replace(' ', 'T'));
  }

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const fetchDashboardData = async () => {
  try {
    const endpoints = [
      { key: 'lastBackup', url: 'dashboard/last-backup/' },
      { key: 'lastLogin', url: 'dashboard/last-login/' },
      { key: 'lastPackingSlip', url: 'dashboard/last-slip/' },
      { key: 'lastStock', url: 'dashboard/last-stock/' }
    ];

    const requests = endpoints.map(endpoint =>
      axios.get(endpoint.url).then(response => ({
        key: endpoint.key,
        data: response.data
      })).catch(error => {
        console.error(`Error fetching ${endpoint.key}:`, error);
        return { key: endpoint.key, data: {} };
      })
    );

    const results = await Promise.all(requests);

    results.forEach(result => {
      switch (result.key) {
        case 'lastBackup':
          lastBackup.value = result.data;
          break;
        case 'lastLogin':
          lastLogin.value = result.data;
          break;
        case 'lastPackingSlip':
          lastPackingSlip.value = result.data;
          break;
        case 'lastStock':
          lastStock.value = result.data;
          break;
      }
    });

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.layout {
  display: flex;
}

.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
}

.dashboard-container {
  padding: 30px;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #6b7280;
  margin-top: 8px;
}

.date-display {
  font-size: 1.1rem;
  color: #667eea;
  font-weight: 600;
  background: #f0f4ff;
  padding: 12px 20px;
  border-radius: 12px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.stat-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 8px 0;
  word-break: break-word;
}

.stat-details {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 4px 0;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .dashboard-container {
    padding: 20px;
  }

  .welcome-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
    padding: 20px;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .stat-card {
    padding: 20px;
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .stat-icon {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 15px;
  }

  .welcome-section {
    padding: 15px;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .stat-card {
    padding: 15px;
  }
}
</style>