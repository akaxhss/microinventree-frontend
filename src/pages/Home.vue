<template>
    <div>
 <ModernHeader />
   
  <div class="home-container">
    <!-- Welcome Section -->
    <section class="welcome-section">
      <h1 class="welcome-title">👋 Welcome back, {{ username }}!</h1>
      <p class="welcome-subtitle">Manage your clothing inventory with ease.</p>
    </section>

  

    <!-- Recent Activity -->
    <section class="activity-section">
      <h2>📦 Recent Stock Movements</h2>
      <ul>
        <li v-for="move in recentStock" :key="move.id" class="activity-item">
          <span>{{ move.timestamp }}:</span>
          <strong>{{ move.change > 0 ? "Added" : "Removed" }}</strong>
          {{ Math.abs(move.change) }} units of
          <em>{{ move.variant }}</em> ({{ move.size }})
        </li>
      </ul>
    </section>

    <section class="activity-section">
      <h2>🧾 Recent Invoices</h2>
      <ul>
        <li v-for="invoice in recentInvoices" :key="invoice.id" class="activity-item">
          <span>{{ invoice.date }}</span> → 
          <strong>{{ invoice.customer?.name }}</strong> 
          ({{ invoice.total_items }} items)
        </li>
      </ul>
    </section>
  </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../plugins/axios.js";
import ModernHeader from '../components/header.vue';

const username = localStorage.getItem("username") || "User";

const stats = ref({
  products: 0,
  customers: 0,
  stock: 0,
  invoices: 0,
});

const recentStock = ref([]);
const recentInvoices = ref([]);

onMounted(async () => {
  try {
    const [products, customers, stock, invoices, stockMovements] = await Promise.all([
      axios.get("products/"),
      axios.get("customers/"),
      axios.get("stock-items/"),
      axios.get("invoices/"),
      axios.get("stock-movements/?limit=5"),
    ]);

    stats.value.products = products.data.length;
    stats.value.customers = customers.data.length;
    stats.value.stock = stock.data.length;
    stats.value.invoices = invoices.data.length;

    recentStock.value = stockMovements.data.slice(0, 5);
    recentInvoices.value = invoices.data.slice(0, 5);
  } catch (err) {
    console.error("Error fetching home data:", err);
  }
});
</script>

<style scoped>
.home-container {
  padding: 30px;
  font-family: "Segoe UI", sans-serif;
  background: #f8fafc;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-title {
  font-size: 2rem;
  font-weight: bold;
  color: #00923f;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-top: 5px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card h3 {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #111827;
}

/* Color Accents */
.products { border-top: 5px solid #2563eb; }
.customers { border-top: 5px solid #f59e0b; }
.stock { border-top: 5px solid #10b981; }
.invoices { border-top: 5px solid #dc2626; }

/* Recent Activity */
.activity-section {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.activity-section h2 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #374151;
}

.activity-item {
  font-size: 0.95rem;
  margin-bottom: 10px;
  color: #4b5563;
}

.activity-item strong {
  color: #111827;
}

.activity-item em {
  color: #2563eb;
  font-style: normal;
}
</style>
