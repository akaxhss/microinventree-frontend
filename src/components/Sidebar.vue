<template>
    <aside class="sidebar">
        <!-- Brand -->
        <div class="brand">
            <h2>Micro<span>InvenTree</span></h2>
        </div>

        <!-- Menu -->
        <nav class="menu">
            <router-link to="/home" class="menu-item" active-class="active">
                📊 Dashboard
            </router-link>

            <div class="menu-section">Activities</div>
            <router-link to="/addstock" class="menu-item" active-class="active">
                📦 Add Stock
            </router-link>
            <router-link to="/purchase-list" class="menu-item" active-class="active">
                📜 Purchase List
            </router-link>
            <router-link to="/return-list" class="menu-item" active-class="active">
                ↩ Return List
            </router-link>
            <router-link to="/sales" class="menu-item" active-class="active">
                💰 Sale
            </router-link>

            <div class="menu-section">People</div>
            <router-link to="/customers" class="menu-item" active-class="active">
                👤 Customers
            </router-link>
            <router-link to="/suppliers" class="menu-item" active-class="active">
                🏭 Suppliers
            </router-link>

            <div class="menu-section">Inventory</div>
            <router-link to="/products" class="menu-item" active-class="active">
                📦 Products
            </router-link>
            <router-link to="/stock-items" class="menu-item" active-class="active">
                📂 Inventory
            </router-link>

            <div class="menu-section">Reports</div>
            <router-link to="/reports" class="menu-item" active-class="active">
                📑 Reports
            </router-link>
            <router-link to="/inventory-report" class="menu-item" active-class="active">
                📑 Inventory Report
            </router-link>
            <router-link to="/out-of-stock" class="menu-item" active-class="active">
                ⚠ Out of Stock Report
            </router-link>

            <div class="menu-section">Account</div>
            <router-link to="/setup" class="menu-item" active-class="active">
                ⚙ Setup
            </router-link>
            <router-link to="/backup" class="menu-item" active-class="active">
                💾 Database Backup
            </router-link>
            <router-link to="/account" class="menu-item" active-class="active">
                👤 Account
            </router-link>
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
}

.brand {
    text-align: center;
    margin-bottom: 25px;
}

.brand h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
}

.brand span {
    color: #38bdf8;
}

.menu {
    flex: 1;
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
}

.menu-item:hover {
    background: #1e293b;
    color: #fff;
}

.menu-item.active {
    background: #10b981;
    color: #fff;
}
</style>
