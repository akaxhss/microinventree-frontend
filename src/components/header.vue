<template>
  <header class="modern-header">
    <!-- Main Header -->
    <div class="main-header">
      <div class="header-container">
        <!-- Navigation -->
        <nav class="nav-links">
          <router-link to="/colors" class="nav-item">Colors</router-link>
          <router-link to="/customers" class="nav-item">Customers</router-link>
          <router-link to="/products" class="nav-item">Products</router-link>
          <router-link to="/product-variants" class="nav-item">Variants</router-link>
          <router-link to="/sizes" class="nav-item">Sizes</router-link>
          <router-link to="/stock-items" class="nav-item">Stock Items</router-link>
          <router-link to="/stock-movements" class="nav-item">Stock Movements</router-link>
          <router-link to="/invoices" class="nav-item">Invoices</router-link>
          <router-link to="/reports" class="nav-item">Reports</router-link>
        </nav>

        <!-- Auth Buttons -->
        <div class="auth-buttons">
          <button
            v-if="!isLoggedIn"
            class="auth-btn login"
            @click="goLogin"
          >
            Login
          </button>
          <button
            v-else
            class="auth-btn logout"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const isLoggedIn = ref(false);

onMounted(() => {
  checkAuth();
});

// ✅ Check if token exists
const checkAuth = () => {
  const token = localStorage.getItem("accessToken");
  isLoggedIn.value = !!token;
};

const goLogin = () => {
  router.push("/login");
};

const handleLogout = () => {
  // Clear tokens & user info
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("username");

  isLoggedIn.value = false;

  // Redirect to login
  router.push("/login");
};
</script>

<style scoped>
.modern-header {
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

/* Main Header Styles */
.main-header {
  background-color: #ffffff;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nav-item {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 600;
  color: #333333;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item:hover {
  background-color: #577363;
  color: #ffffff;
  transform: translateY(-1px);
}

.nav-item.router-link-active {
  background-color: #464b52;
  color: #ffffff;
}

/* Auth Buttons */
.auth-buttons {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.auth-btn {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.auth-btn.login {
  background: #2563eb;
  color: #fff;
}

.auth-btn.login:hover {
  background: #1e40af;
}

.auth-btn.logout {
  background: #dc2626;
  color: #fff;
}

.auth-btn.logout:hover {
  background: #991b1b;
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-links {
    gap: 4px;
  }
  .nav-item {
    padding: 8px 12px;
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .nav-links {
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 2px;
  }
  .nav-item {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
