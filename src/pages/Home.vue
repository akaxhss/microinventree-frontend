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

        <!-- User Guide Section -->
        <section class="guide-section">
          <h2 class="section-title">Getting Started Guide</h2>
          <div class="guide-grid">
            <div class="guide-card">
              <div class="guide-icon">📝</div>
              <h3>Setup Basics</h3>
              <ul>
                <li>Add Products with SKU codes</li>
                <li>Create Color options</li>
                <li>Create Size options</li>
                <li>Register Suppliers</li>
                <li>Add Stock</li>
              </ul>
            </div>

            <div class="guide-card">
              <div class="guide-icon">🧾</div>
              <h3>Create Packing Slips</h3>
              <ul>
                <li>Select/create customer</li>
                <li>Choose colors and sizes</li>
                <li>Set quantities and prices</li>
                <li>Generate packing slips in reports</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Recent Packing Slips -->
        <section class="activity-section">
          <div class="section-header">
            <h2>🧾 Recent Packing Slips</h2>
            <button class="view-all-btn" @click="navigateTo('/packing-slips')">View All</button>
          </div>
          <div class="activity-list">
            <div v-for="slip in recentSlips" :key="slip.id" class="activity-item">
              <div class="activity-icon">📄</div>
              <div class="activity-content">
                <div class="activity-title">{{ slip.slip_number }}</div>
                <div class="activity-details">
                  {{ slip.customer?.name || 'No Customer' }} • {{ slip.total_items }} items
                </div>
                <div class="activity-date">{{ formatDate(slip.created_at) }}</div>
              </div>
            </div>
            <div v-if="recentSlips.length === 0" class="empty-activity">
              No recent packing slips
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import axios from "../plugins/axios.js";
import ModernHeader from '../components/header.vue';
import Sidebar from '../components/Sidebar.vue';

const router = useRouter();
const username = localStorage.getItem("username") || "User";

const recentSlips = ref([]);

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Methods
const navigateTo = (path) => {
  router.push(path);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(async () => {
  try {
    const [packingSlips] = await Promise.all([
      axios.get("packingslips/?limit=5"),
    ]);

    recentSlips.value = packingSlips.data.slice(0, 5);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
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

/* Section Titles */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

/* Guide Section */
.guide-section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.guide-card {
  background: #f8fafc;
  padding: 30px;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: transform 0.2s ease;
}

.guide-card:hover {
  transform: translateX(5px);
}

.guide-icon {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.guide-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.guide-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guide-card li {
  padding: 8px 0;
  color: #4b5563;
  position: relative;
  padding-left: 20px;
  font-size: 1rem;
  line-height: 1.5;
}

.guide-card li:before {
  content: "•";
  color: #667eea;
  font-weight: bold;
  position: absolute;
  left: 0;
  font-size: 1.2rem;
}

/* Activity Section */
.activity-section {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.view-all-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.2s ease;
}

.view-all-btn:hover {
  background: #5a6fd8;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 10px;
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: #f1f5f9;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e7ff;
  border-radius: 8px;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-details {
  font-size: 0.85rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.activity-date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.empty-activity {
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  padding: 30px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .guide-grid {
    grid-template-columns: 1fr;
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
  }

  .guide-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .guide-card {
    padding: 20px;
  }
}
</style>