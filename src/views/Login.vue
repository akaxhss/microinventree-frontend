<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="title">Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="username" placeholder="Enter your username" required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="password" placeholder="Enter your password" required />
        </div>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" class="login-btn">Login</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "../plugins/axios.js";

const username = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Both fields are required!";
    return;
  }

  try {
    const res = await axios.post("token/", {
      username: username.value,
      password: password.value,
    });

    const data = res.data;

    // Save tokens in localStorage
    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);
    localStorage.setItem("role", data.role || "User");
    localStorage.setItem("username", data.username);

    // Redirect to any
    router.push("/home");
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail || "Invalid credentials. Please try again.";
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #f3f4f6;
  font-family: "Segoe UI", sans-serif;
}

.login-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
}

.title {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #2563eb;
}

.form-group {
  text-align: left;
  margin-bottom: 15px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 10px;
  margin-top: 6px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
}

.login-btn {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  background: #2563eb;
  border: none;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
}

.login-btn:hover {
  background: #1e40af;
}

.error {
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 10px;
}
</style>
