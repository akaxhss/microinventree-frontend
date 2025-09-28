<template>
  <div>
    <h2 class="text-xl font-bold mb-4">{{ title }}</h2>

    <form @submit.prevent="addItem" class="mb-4 flex gap-2">
      <input v-for="(field, key) in newItem" :key="key" v-model="newItem[key]" :placeholder="key" class="border p-2 rounded" />
      <button class="bg-blue-500 text-white px-4 py-2 rounded">Add</button>
    </form>

    <table class="w-full border">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col" class="border p-2">{{ col }}</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td v-for="col in columns" :key="col" class="border p-2">{{ item[col] }}</td>
          <td class="border p-2">
            <button @click="deleteItem(item.id)" class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../plugins/axios.js';

const props = defineProps({
  endpoint: String,
  columns: Array,
  title: String,
});

const items = ref([]);
const newItem = ref({});

props.columns.forEach(col => newItem.value[col] = '');

const fetchItems = async () => {
  const res = await api.get(props.endpoint);
  items.value = res.data;
};

const addItem = async () => {
  const res = await api.post(props.endpoint, newItem.value);
  items.value.push(res.data);
  Object.keys(newItem.value).forEach(key => newItem.value[key] = '');
};

const deleteItem = async (id) => {
  await api.delete(`${props.endpoint}${id}/`);
  items.value = items.value.filter(i => i.id !== id);
};

onMounted(fetchItems);
</script>
