<template>
  <div>
    <ModernHeader />

    <div class="dashboard-container">
      <h2 class="page-title">Stock Movements</h2>

      <div class="table-wrapper">
        <table class="modern-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Color</th>
              <th>Size</th>
              <th>Change</th>
              <th>Type</th>
              <th>Timestamp</th>
              <th>Note</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="movement in movements" :key="movement.id">
              <td>{{ movement.id }}</td>
              <td>{{ movement.stock_item.variant.product }}</td>
              <td>{{ movement.stock_item.variant.color.name }}</td>
              <td>{{ movement.stock_item.size.display_name }}</td>
              <td>{{ movement.change }}</td>
              <td>{{ movement.movement_type }}</td>
              <td>{{ formatDate(movement.timestamp) }}</td>
              <td>{{ movement.note || '-' }}</td>
              <td>{{ movement.performed_by || '-' }}</td>
            </tr>
            <tr v-if="movements.length === 0">
              <td colspan="9" class="empty-state">
                <span class="empty-icon">📦</span>
                <p>No stock movements available</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from '../plugins/axios.js';
import ModernHeader from '../components/header.vue';

const movements = ref([]);

const fetchMovements = async () => {
  try {
    const res = await axios.get('/movements');
    movements.value = res.data;
  } catch (error) {
    console.error('Error fetching movements:', error);
  }
};

const formatDate = (ts) => {
  return new Date(ts).toLocaleString();
};

onMounted(fetchMovements);
</script>

<style scoped>
.dashboard-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100vh;
  border-radius: 12px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 25px;
  color: #1a202c;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  box-sizing: border-box;
}

.modern-table th,
.modern-table td {
  padding: 14px 15px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  box-sizing: border-box;
}

.modern-table th {
  background: #f7fafc;
  font-weight: 600;
  text-transform: uppercase;
  color: #4a5568;
}

tbody tr:hover {
  background: #f1f5f9;
  transition: background 0.2s;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #9ca3af;
  font-style: italic;
}

.empty-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: auto;
  }
}
</style>
