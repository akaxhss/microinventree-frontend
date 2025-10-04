<template>
  <header class="pro-header">
    <div class="header-left">

      <h1 class="welcome-text">Welcome <span>{{ companyName }}</span></h1>
    </div>

    <!-- User Info with Dropdown -->
    <div class="user-menu" @click="toggleDropdown">
      <div class="avatar">{{ userInitials }}</div>
      <span class="username">{{ username }}</span>
      <span class="arrow">{{ showDropdown ? "▲" : "▼" }}</span>

      <div v-if="showDropdown" class="dropdown">
        <button class="dropdown-item">Profile</button>
        <button class="dropdown-item logout" @click="handleLogout">Logout</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const companyName = localStorage.getItem("company") || "AS DISTRIBUTORS";
const username = localStorage.getItem("role") || "Super Admin";
const userInitials = username.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  router.push("/login");
};
</script>

<style scoped>
.pro-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: "Segoe UI", sans-serif;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  font-size: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
}

.welcome-text {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
}

.welcome-text span {
  font-weight: 700;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #9ca3af;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.username {
  font-size: 0.95rem;
  color: #374151;
}

.arrow {
  font-size: 0.8rem;
  color: #6b7280;
}

.dropdown {
  position: absolute;
  top: 110%;
  right: 0;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 160px;
  z-index: 10;
}

.dropdown-item {
  display: block;
  padding: 10px;
  width: 100%;
  border: none;
  text-align: left;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #dc2626;
  font-weight: 600;
}
</style>
