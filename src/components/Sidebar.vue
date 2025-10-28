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
                <router-link to="/home" class="menu-item" active-class="active" @click="handleMenuClick('/home')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Dashboard
                </router-link>

                <!-- PEOPLE -->
                <div class="menu-section">People</div>
                <router-link to="/listviewcustomer" class="menu-item" active-class="active" @click="handleMenuClick('/customers')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    List Customers
                </router-link>
                <router-link to="/add-customer" class="menu-item" active-class="active" @click="handleMenuClick('/add-customer')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add Customers
                </router-link>
                <router-link to="/listviewsupplier" class="menu-item" active-class="active" @click="handleMenuClick('/suppliers')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.27002 6.96002L12 12L20.73 6.96002" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 22.08V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    List Suppliers
                </router-link>
                <router-link to="/add-supplier" class="menu-item" active-class="active" @click="handleMenuClick('/suppliers')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add Supplier
                </router-link>

                <!-- PACKING SLIP -->
                <div class="menu-section">Packing Slip</div>
                <router-link to="/packingslip" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/packingslip')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add Packing Slip
                </router-link>
                <router-link to="/viewpackingslips" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/viewpackingslips')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Packing Slip
                </router-link>

                <!-- PURCHASE (STOCK) -->
                <div class="menu-section">Purchase (Stock)</div>
                <router-link to="/addstock" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/addstock')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Add Stock
                </router-link>
                <router-link to="/stockbysuppliers" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/stockbysuppliers')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Stock
                </router-link>
                <router-link to="/viewstockbyinvoice" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/viewstockbyinvoice')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    View Stock by Invoice
                </router-link>
                <router-link to="/editsockbyinvoice" class="menu-item submenu-item" active-class="active" @click="handleMenuClick('/editsockbyinvoice')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Edit Stock by Invoice
                </router-link>

                <!-- INVENTORY -->
                <div class="menu-section">Inventory</div>
                <router-link to="/stock-items" class="menu-item" active-class="active" @click="handleMenuClick('/stock-items')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6H16V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6H4C3.46957 6 2.96086 6.21071 2.58579 6.58579C2.21071 6.96086 2 7.46957 2 8V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V8C22 7.46957 21.7893 6.96086 21.4142 6.58579C21.0391 6.21071 20.5304 6 20 6Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 4V6H14V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Inventory
                </router-link>

                <!-- REPORTS -->
                <div class="menu-section">Reports</div>
                <router-link to="/reports" class="menu-item" active-class="active" @click="handleMenuClick('/reports')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Reports
                </router-link>

                <!-- PRODUCT SETUP -->
                <div class="menu-section">Product Setup</div>
                <router-link to="/products" class="menu-item" active-class="active" @click="handleMenuClick('/products')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 7H4C3.46957 7 2.96086 7.21071 2.58579 7.58579C2.21071 7.96086 2 8.46957 2 9V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V9C22 8.46957 21.7893 7.96086 21.4142 7.58579C21.0391 7.21071 20.5304 7 20 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Products
                </router-link>
                <router-link to="/colors" class="menu-item" active-class="active" @click="handleMenuClick('/colors')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.69L17.66 8.35C18.78 9.47 19.34 10.04 19.67 10.75C20 11.46 20 12.26 20 13.86V14.88C20 17.08 20 18.18 19.54 19.01C19.25 19.55 18.81 20.01 18.27 20.32C17.48 20.79 16.42 20.79 14.31 20.79H9.69C7.58 20.79 6.52 20.79 5.73 20.32C5.19 20.01 4.75 19.55 4.46 19.01C4 18.18 4 17.08 4 14.88V13.86C4 12.26 4 11.46 4.33 10.75C4.66 10.04 5.22 9.47 6.34 8.35L12 2.69Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9 14.5C9 14.5 10 15.5 12 15.5C14 15.5 15 14.5 15 14.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Colors
                </router-link>
                <router-link to="/sizes" class="menu-item" active-class="active" @click="handleMenuClick('/sizes')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 6L12 3L7 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 18L12 21L17 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M17 18V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Sizes
                </router-link>

                <!-- ACTIVITIES -->
                <div class="menu-section">Activities</div>
                <router-link to="/stock-movements" class="menu-item" active-class="active" @click="handleMenuClick('/stock-movements')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 7H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 7H4.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 12H4.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M4 17H4.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Stock Movements
                </router-link>

                <!-- ADMIN -->
                <div class="menu-section">Admin</div>
                <router-link to="/databasebackup" class="menu-item" active-class="active" @click="handleMenuClick('/databasebackup')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.27002 6.96002L12 12L20.73 6.96002" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 22.08V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    DataBase Backup
                </router-link>
                <router-link to="/auditlogs" class="menu-item" active-class="active" @click="handleMenuClick('/auditlogs')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 13H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 17H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 9H9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Audit Logs
                </router-link>
                <router-link to="/packingslipeditable" class="menu-item" active-class="active" @click="handleMenuClick('/packingslipeditable')">
                    <svg class="menu-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Packing Slip Update
                </router-link>

                <!-- Add space after last item -->
                <div class="bottom-space"></div>
            </div>
        </nav>
    </aside>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const handleMenuClick = (path) => {
    
    if (route.path === path) {
        // Force navigation to the same route to trigger a refresh
        router.replace(path).then(() => {
            // This will cause the component to reerender and refresh data
            window.location.reload();
        });
    }
   
};
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