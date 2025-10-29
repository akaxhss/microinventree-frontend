<template>
  <header class="pro-header">
    <div class="header-left">
      <h1 class="welcome-text">Welcome <span>{{ companyName }}</span></h1>
    </div>

    <!-- User Info with Dropdown -->
    <div class="user-menu" @click="toggleDropdown">
      <div class="avatar">{{ userInitials }}</div>
      <span class="username">{{ username }}</span>
      <div class="session-timer" :class="{ 'warning': remainingTime < 300 }">
        <Icon name="timer" size="16" class="icon-align " />
        {{ formatTime(remainingTime) }}
      </div>
      <span class="arrow">{{ showDropdown ? "▲" : "▼" }}</span>

      <div v-if="showDropdown" class="dropdown">
        <div class="session-info">
          <div class="session-title">Session Expires In:</div>
          <div class="session-time" :class="{ 'warning': remainingTime < 300 }">
            <Icon name="timer" size="16" class="timer-icon" />
            {{ formatTime(remainingTime) }}
          </div>
          <div class="session-details">
            Expires at: {{ expiryTimeFormatted }}
          </div>
        </div>
        <button class="dropdown-item" @click="resetSession">
          <Icon name="reset" size="16" class="dropdown-icon" />
          Reset Session
        </button>
        <button class="dropdown-item">
          <Icon name="users" size="16" class="dropdown-icon" />
          Profile
        </button>
        <button class="dropdown-item logout" @click="handleLogout">
          <Icon name="logout" size="16" class="dropdown-icon" />
          Logout
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";

const router = useRouter();

const companyName = localStorage.getItem("company") || "AS DISTRIBUTORS";
const username = localStorage.getItem("username") || "User";
const userInitials = username.split(" ").map(word => word[0]).join("").slice(0, 2).toUpperCase();

const showDropdown = ref(false);
const remainingTime = ref(0);
const tokenExpiry = ref(null);
let timerInterval = null;

// Decode JWT token to get expiry time
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get token expiry time from JWT
const getTokenExpiry = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;
  
  const decoded = decodeJWT(accessToken);
  if (decoded && decoded.exp) {
    return decoded.exp; // Expiry time in seconds
  }
  return null;
};

// Calculate remaining time dynamically
const calculateRemainingTime = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return 0;
  
  const currentTime = Math.floor(Date.now() / 1000);
  const remaining = expiry - currentTime;
  
  return Math.max(0, remaining); // Don't go below 0
};

// Format time to MM:SS
const formatTime = (seconds) => {
  if (seconds <= 0) return "00:00";
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format expiry time for display
const expiryTimeFormatted = computed(() => {
  if (!tokenExpiry.value) return "Unknown";
  
  const date = new Date(tokenExpiry.value * 1000);
  return date.toLocaleTimeString() + ' ' + date.toLocaleDateString();
});

// Get total session duration for display
const sessionDuration = computed(() => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return "Unknown";
  
  const decoded = decodeJWT(accessToken);
  if (decoded && decoded.exp && decoded.iat) {
    const duration = decoded.exp - decoded.iat; // in seconds
    const minutes = Math.floor(duration / 60);
    return `${minutes} minutes`;
  }
  return "Unknown";
});

// Reset session by refreshing token
const resetSession = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      alert('No refresh token available. Please login again.');
      handleLogout();
      return;
    }

    const response = await axios.post('/token/refresh/', {
      refresh: refreshToken
    });

    if (response.data.access) {
      // Store new tokens
      localStorage.setItem('accessToken', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      
      // Update expiry time
      const decoded = decodeJWT(response.data.access);
      if (decoded && decoded.exp) {
        tokenExpiry.value = decoded.exp;
      }
      
      showDropdown.value = false;
      alert(`Session refreshed successfully! New session duration: ${sessionDuration.value}`);
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    alert('Failed to refresh session. Please login again.');
    handleLogout();
  }
};

// Auto logout when token expires
const checkTokenExpiry = () => {
  remainingTime.value = calculateRemainingTime();
  
  if (remainingTime.value <= 0) {
    alert('Your session has expired. Please login again.');
    handleLogout();
  } else if (remainingTime.value <= 60) {
    // Warning when less than 1 minute remaining
    console.warn('Session expiring in less than 1 minute');
  }
};

const toggleDropdown = (event) => {
  event.stopPropagation();
  showDropdown.value = !showDropdown.value;
};

const handleLogout = () => {
  // Clear all stored data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("company");
  
  // Clear interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  
  router.push("/login");
};

// Close dropdown when clicking outside
const closeDropdown = (event) => {
  if (!event.target.closest('.user-menu')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  // Initialize token expiry time from JWT
  const expiry = getTokenExpiry();
  if (expiry) {
    tokenExpiry.value = expiry;
  }
  
  // Calculate initial remaining time
  checkTokenExpiry();
  
  // Start timer to update every second
  timerInterval = setInterval(checkTokenExpiry, 1000);
  
  // Add click outside listener
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  // Cleanup
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  document.removeEventListener('click', closeDropdown);
});
</script>

<style scoped>
.icon-align {
    vertical-align: middle;
    position: relative;
    top: -0.5px; 
}
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
  gap: 12px;
  position: relative;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.user-menu:hover {
  background-color: #f9fafb;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3b82f6;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.username {
  font-size: 0.95rem;
  color: #374151;
  font-weight: 500;
}

.session-timer {
  font-size: 0.8rem;
  color: #059669;
  background: #d1fae5;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.session-timer.warning {
  color: #dc2626;
  background: #fecaca;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
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
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 260px;
  z-index: 10;
  overflow: hidden;
}

.session-info {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

.session-title {
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 4px;
}

.session-time {
  font-size: 1.1rem;
  font-weight: 600;
  color: #059669;
  font-family: 'Monaco', 'Consolas', monospace;
  margin-bottom: 4px;
}

.session-time.warning {
  color: #dc2626;
}

.session-details {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  width: 100%;
  border: none;
  text-align: left;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #374151;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f9fafb;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.logout {
  color: #dc2626;
  font-weight: 600;
}

/* Responsive design */
@media (max-width: 768px) {
  .pro-header {
    padding: 10px 16px;
  }
  
  .user-menu {
    gap: 8px;
  }
  
  .session-timer {
    display: none; /* Hide timer on mobile to save space */
  }
  
  .dropdown {
    width: 240px;
    right: -10px;
  }
  
  .welcome-text {
    font-size: 0.9rem;
  }
  
  .username {
    display: none; /* Hide username on very small screens */
  }
}

@media (max-width: 480px) {
  .user-menu {
    padding: 6px 8px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .dropdown {
    width: 200px;
  }
  
  .session-details {
    font-size: 0.7rem;
  }
}
</style>