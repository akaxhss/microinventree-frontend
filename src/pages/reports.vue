<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />
    <div class="main-content">
      <ModernHeader />
      <div class="reporting-container">
        <h2 class="page-title">Reports</h2>

        <!-- Tabs -->
        <div class="tabs">
          <button v-for="tab in tabs" :key="tab" :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab">
            {{ tab }}
          </button>
        </div>

        <!-- Child -->
        <InvoiceByCustomer v-if="activeTab === 'Packing Slips by Customer'" />
        <ReportsOfProducts v-if="activeTab === 'Reports of Products'" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ModernHeader from "../components/header.vue";
import InvoiceByCustomer from "./child/InvoiceByCustomer.vue";
import ReportsOfProducts from "./child/ReportsOfProducts.vue";
import Sidebar from '../components/Sidebar.vue';


const tabs = ["Packing Slips by Customer", "Reports of Products"];
const activeTab = ref("Packing Slips by Customer");
</script>

<style scoped>
.main-content {
  margin-left: 260px;
  flex: 1;
  background: #f8fafc;
  min-height: 100vh;
}

.reporting-container {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  font-family: "Segoe UI", sans-serif;
}

.page-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 16px;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  background: #e5e7eb;
  font-weight: 600;
}

.tab.active {
  background: #2563eb;
  color: #fff;
}
</style>
