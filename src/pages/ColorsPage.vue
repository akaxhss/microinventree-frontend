<template>
  <div class="layout">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="main-content">
      <ModernHeader />

      <div class="form-container">
        <h2 class="page-title"> Manage Colors</h2>

        <!-- Add Color Form -->
        <div class="add-color-section">
          <h3 class="section-title">Add New Color</h3>
          <div class="color-form">
            <div class="form-group">
              <label for="colorName">Color Name *</label>
              <input type="text" id="colorName" v-model="newColor.name" placeholder="Enter color name"
                class="color-input" @keyup.enter="addColor" />
            </div>
            <div class="form-group">
              <label for="hexCode">Hex Code (Optional)</label>
              <div class="hex-input-wrapper">
                <input type="text" id="hexCode" v-model="newColor.hex_code" placeholder="#FFFFFF"
                  class="color-input hex-input" maxlength="7" />
                <div class="color-preview" :style="{ backgroundColor: newColor.hex_code || '#f0f0f0' }"></div>
              </div>
            </div>
            <button class="btn add-btn" @click="addColor" :disabled="!newColor.name">
              ➕ Add Color
            </button>
          </div>
        </div>

        <!-- Colors List -->
        <div class="colors-list-section">
          <h3 class="section-title">Existing Colors</h3>
          <div v-if="colors.length === 0" class="empty-state">
            No colors added yet. Add your first color above.
          </div>
          <div v-else class="colors-grid">
            <div v-for="color in colors" :key="color.id" class="color-card">
              <div class="color-display">
                <!-- <div class="color-swatch" :style="{ backgroundColor: color.hex_code || '#cccccc' }"></div> -->
                <div class="color-info">
                  <span class="color-name">{{ color.name }}</span>
                  <span class="color-hex" v-if="color.hex_code">{{ color.hex_code }}</span>
                  <span class="no-hex" v-else>No hex code</span>
                </div>
              </div>
              <button class="btn danger small" @click="deleteColor(color.id)">
                ❌
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../plugins/axios.js";
import Sidebar from "../components/Sidebar.vue";
import ModernHeader from "../components/header.vue";

// Color data
const colors = ref([]);
const newColor = ref({
  name: "",
  hex_code: ""
});

// Load colors on mount
onMounted(async () => {
  await loadColors();
});

// Load colors from API
const loadColors = async () => {
  try {
    const res = await axios.get("/colors/");
    colors.value = res.data;
  } catch (error) {
    console.error("Error loading colors:", error);
    alert("Error loading colors!");
  }
};

// Add new color
const addColor = async () => {
  if (!newColor.value.name.trim()) {
    alert("Please enter a color name!");
    return;
  }

  try {
    const colorData = {
      name: newColor.value.name.trim()
    };

    // Only add hex_code if it's provided and not empty
    if (newColor.value.hex_code && newColor.value.hex_code.trim()) {
      colorData.hex_code = newColor.value.hex_code.trim();
    }

    await axios.post("/colors/", colorData);

    // Reset form and reload colors
    newColor.value = { name: "", hex_code: "" };
    await loadColors();

    alert("Color added successfully!");
  } catch (error) {
    console.error("Error adding color:", error);
    alert("Error adding color!");
  }
};

// Delete color
const deleteColor = async (colorId) => {
  if (!confirm("Are you sure you want to delete this color?")) {
    return;
  }

  try {
    await axios.delete(`/colors/${colorId}/`);
    await loadColors();
    alert("Color deleted successfully!");
  } catch (error) {
    console.error("Error deleting color:", error);
    alert("Error deleting color!");
  }
};
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

.form-container {
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 800px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #333;
  text-align: center;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 8px;
}

/* Add Color Form */
.add-color-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.color-form {
  display: flex;
  gap: 15px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.form-group {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.color-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  transition: border-color 0.2s;
}

.color-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.hex-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.hex-input {
  padding-right: 50px;
  text-transform: uppercase;
  font-family: monospace;
}

.color-preview {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f0f0f0;
}

.add-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  height: fit-content;
}

.add-btn:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-1px);
}

.add-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

/* Colors List */
.colors-list-section {
  padding: 0 20px;
}

.empty-state {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #ddd;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.color-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.color-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.color-display {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.color-swatch {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid #e0e0e0;
  flex-shrink: 0;
}

.color-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.color-name {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.color-hex {
  font-size: 0.8rem;
  color: #666;
  font-family: monospace;
}

.no-hex {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn.danger {
  background: #f44336;
  color: #fff;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.btn.danger:hover {
  background: #d32f2f;
}

.btn.small {
  padding: 4px 8px;
  font-size: 0.8rem;
}

/* Responsive */
@media (max-width: 768px) {
  .color-form {
    flex-direction: column;
    align-items: stretch;
  }

  .form-group {
    min-width: auto;
  }

  .colors-grid {
    grid-template-columns: 1fr;
  }

  .main-content {
    margin-left: 0;
    padding: 15px;
  }
}
</style>