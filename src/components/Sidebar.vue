<template>
    <aside class="sidebar">
        <!-- Brand with Logo -->
        <div class="brand">
            <div class="logo-container">
                <img src="../assets/JPINWHITE.png" alt="JPIN Logo" class="logo" />
            </div>
            <h2>Micro<span>InvenTree</span></h2>
        </div>

        <!-- Menu -->
        <nav class="menu">
            <div class="menu-content">
                <!-- DASH BOARD -->
                <router-link to="/home" class="menu-item" active-class="active">
                    📊 Dashboard
                </router-link>

                <!-- PEOPLE -->
                <div class="menu-section">People</div>
                <router-link to="/customers" class="menu-item" active-class="active">
                    👤 Customers
                </router-link>
                <router-link to="/suppliers" class="menu-item" active-class="active">
                    🏭 Suppliers
                </router-link>

                <!-- PACKING SLIP -->
                <div class="menu-section">Packing Slip</div>
                <router-link to="/packingslip" class="menu-item submenu-item" active-class="active">
                    ➕ Add Packing Slip
                </router-link>
                <router-link to="/viewpackingslips" class="menu-item submenu-item" active-class="active">
                    👁️ View Packing Slip
                </router-link>

                <!-- PURCHASE (STOCK) -->
                <div class="menu-section">Purchase (Stock)</div>
                <router-link to="/addstock" class="menu-item submenu-item" active-class="active">
                    ➕ Add Stock
                </router-link>
                <router-link to="/stockbysuppliers" class="menu-item submenu-item" active-class="active">
                    👁️ View Stock
                </router-link>

                <!-- INVENTORY -->
                <div class="menu-section">Inventory</div>
                <router-link to="/stock-items" class="menu-item" active-class="active">
                    📂 Inventory
                </router-link>

                <!-- REPORTS -->
                <div class="menu-section">Reports</div>
                <router-link to="/reports" class="menu-item" active-class="active">
                    📑 Reports
                </router-link>

                <!-- PRODUCT SETUP -->
                <div class="menu-section">Product Setup</div>
                <router-link to="/products" class="menu-item" active-class="active">
                    📦 Products
                </router-link>
                <router-link to="/colors" class="menu-item" active-class="active">
                    🎨 Colors
                </router-link>
                <router-link to="/sizes" class="menu-item" active-class="active">
                    📏 Sizes
                </router-link>

                <!-- ACTIVITIES -->
                <div class="menu-section">Activities</div>
                <router-link to="/stock-movements" class="menu-item" active-class="active">
                    🔁 Stock Movements
                </router-link>

                <!-- ADMIN -->
                <div class="menu-section">Admin</div>
                <router-link to="/databasebackup" class="menu-item" active-class="active">
                    💾 DataBase Backup
                </router-link>
                <router-link to="/auditlogs" class="menu-item" active-class="active">
                    📋 Audit Logs
                </router-link>
                <router-link to="/packingslipeditable" class="menu-item" active-class="active">
                    🧾 Packing Slip Update
                </router-link>

                <!-- Add space after last item -->
                <div class="bottom-space"></div>
            </div>
        </nav>
    </aside>
</template>

<script setup>
</script>

<style scoped>
.sidebar {
    width: 230px;
    height: 100vh;
    background: #0f172a;
    color: #e5e7eb;
    display: flex;
    flex-direction: column;
    padding: 15px;
    font-family: "Segoe UI", sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
    /* Prevent overall sidebar scrolling */
}

.brand {
    text-align: center;
    margin-bottom: 25px;
    flex-shrink: 0;
    /* Prevent brand from shrinking */
}

.logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
}

.logo {
    max-width: 80px;
    max-height: 80px;
    object-fit: contain;
    border-radius: 0px;
}

.brand h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
    margin: 0;
}

.brand span {
    color: #38bdf8;
}

.menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* Contain the scrollable content */
}

.menu-content {
    flex: 1;
    overflow-y: auto;
    /* Enable vertical scrolling */
    overflow-x: hidden;
    /* Hide horizontal scroll */
    padding-right: 5px;
    /* Space for scrollbar */
    display: flex;
    flex-direction: column;
}

/* Custom scrollbar for webkit browsers */
.menu-content::-webkit-scrollbar {
    width: 6px;
}

.menu-content::-webkit-scrollbar-track {
    background: #2d3a5a;
    border-radius: 3px;
}

.menu-content::-webkit-scrollbar-thumb {
    background: #10b981;
    border-radius: 3px;
}

.menu-content::-webkit-scrollbar-thumb:hover {
    background: #0da271;
}

/* Custom scrollbar for Firefox */
.menu-content {
    scrollbar-width: thin;
    scrollbar-color: #10b981 #2d3a5a;
}

.menu-section {
    margin: 15px 0 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.menu-item {
    display: block;
    padding: 10px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    text-decoration: none;
    color: #e5e7eb;
    transition: background 0.2s, color 0.2s;
    margin-bottom: 2px;
    /* Small gap between items */
}

.menu-item:hover {
    background: #2d3a5a;
    color: #fff;
}

.menu-item.active {
    background: #10b981;
    color: #fff;
}

/* Submenu item styles */
.submenu-item {
    padding-left: 28px;
    font-size: 0.9rem;
    position: relative;
}

.submenu-item::before {
    content: "";
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 4px;
    background-color: #94a3b8;
    border-radius: 50%;
}

.submenu-item:hover::before {
    background-color: #fff;
}

.submenu-item.active::before {
    background-color: #fff;
}

/* Space after last item */
.bottom-space {
    height: 30px;
    flex-shrink: 0;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
        z-index: 1000;
    }

    .menu-content {
        max-height: 400px;
        /* Limit height on mobile */
    }

    .bottom-space {
        height: 20px;
    }
}

/* Ensure content doesn't get hidden behind sidebar */
@media (min-width: 769px) {
    body {
        margin-left: 230px;
    }
}
</style>