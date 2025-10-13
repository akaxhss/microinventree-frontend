<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />


            <ChildLayout />
        </div>
    </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";
import ChildLayout from "../pages/child/ReportsOfPackingSlips.vue";
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
</style>