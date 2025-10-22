<template>
    <div class="layout">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <div class="main-content">
            <ModernHeader />
            
            <div class="dual-container">
                <!-- Top Container: View Stock by Invoice -->
                <div class="container-top">
                    <div class="container-header">
                        <h2 class="container-title">📋 View Stock by Invoice</h2>
                        <p class="container-subtitle">Search and view invoice items</p>
                    </div>
                    <ListOfStock-itemsByInvoiceNo class="component-wrapper" />
                </div>

                <!-- Bottom Container: Edit Stock by Invoice -->
                <div class="container-bottom">
                    <div class="container-header">
                        <h2 class="container-title">✏️ Edit Stock by Invoice</h2>
                        <p class="container-subtitle">Modify quantities or delete items from invoices</p>
                    </div>
                    <EditStock-itemsByInvoice class="component-wrapper" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";
import ListOfStockItemsByInvoiceNo from "./child/ListOfStock-iteamsByInvoiceNo.vue";
import EditStockItemsByInvoice from "./child/EditStock-itemsByInvoice.vue";
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
}

.main-content {
    margin-left: 235px;
    flex: 1;
    min-height: 100vh;
    background: #f9fafb;
    padding: 20px;
}

.dual-container {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 80px); /* Account for header padding */
    overflow: hidden;
    gap: 20px;
}

.container-top,
.container-bottom {
    flex: 1;
    min-height: 0; /* Important for flex children to respect overflow */
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.container-header {
    background: white;
    padding: 20px 24px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
}

.container-title {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    color: #333;
    font-weight: 600;
}

.container-subtitle {
    margin: 0 0 16px 0;
    color: #666;
    font-size: 0.9rem;
}

.component-wrapper {
    flex: 1;
    overflow: auto;
    padding: 0;
}

/* Disable child components' headers and sidebars from parent */
.component-wrapper :deep(.sidebar) {
    display: none !important;
}

.component-wrapper :deep(.modern-header) {
    display: none !important;
}

.component-wrapper :deep(.header-section) {
    display: none !important;
}

.component-wrapper :deep(.page-title),
.component-wrapper :deep(.page-subtitle) {
    display: none !important;
}

/* Adjust child component layouts */
.component-wrapper :deep(.layout) {
    display: block !important;
}

.component-wrapper :deep(.main-content) {
    margin-left: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    min-height: auto !important;
}

.component-wrapper :deep(.supplier-stock-container) {
    max-width: none !important;
    padding: 20px 24px !important;
    height: 100%;
    margin: 0 !important;
}

.component-wrapper :deep(.filters-card) {
    margin-bottom: 16px !important;
}

.component-wrapper :deep(.stock-items-section) {
    margin-bottom: 0 !important;
}

/* Responsive design */
@media (max-width: 768px) {
    .main-content {
        margin-left: 0;
        padding: 16px;
    }
    
    .dual-container {
        height: calc(100vh - 60px);
        gap: 16px;
    }
    
    .container-top,
    .container-bottom {
        min-height: 50vh;
    }
    
    .container-header {
        padding: 16px 20px 0;
    }
    
    .container-title {
        font-size: 1.3rem;
    }
    
    .component-wrapper :deep(.supplier-stock-container) {
        padding: 16px 20px !important;
    }
}
</style>