<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const baseUrl = import.meta.env.VITE_API_BASE_URL;

// State management
const isLoading = ref(false);
const error = ref(null);
// Fix: Explicitly check for 'true' string in route.query.isEditing
const isEditing = ref(route.query.isEditing === 'true');
console.log(`isEditing ${isEditing.value}`);
const coinId = ref(route.query.id);

// Form structure - using ref
const form = ref({
  id: null,
  name: '',
  symbol: '',
  price: 0,
  lastUpdated: new Date().toISOString(),
});

// Fetch coin data
const fetchCoinById = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    console.log(`Fetching coin with ID: ${coinId.value}`); // Debug log
    const response = await axios.get(`${baseUrl}/api/CoinData/${coinId.value}`);
    console.log('API Response:', response.data); // Debug log
    response.data.map((coin) => {
      form.value.id = coin.id;
      form.value.name = coin.name;
      form.value.symbol = coin.symbol;
      form.value.price = coin.price;
    })
    console.log('Form updated:', form.value); // Debug log
  } catch (err) {
    console.error('Error fetching coin:', err);
    error.value = 'Failed to load coin data. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Handle form submission
const saveCoin = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    if (isEditing.value) {
      await axios.put(`${baseUrl}/api/CoinData/${form.value.id}`, {
        name: form.value.name,
        symbol: form.value.symbol,
        price: form.value.price,
      });
    } else {
      await axios.post(`${baseUrl}/api/CoinData/create-coin`, {
        id: form.value.id,
        name: form.value.name,
        symbol: form.value.symbol,
        price: form.value.price,
      });
    }
    
    router.push({ name: 'coins' });
  } catch (err) {
    console.error('Error saving coin:', err);
    error.value = isEditing.value 
      ? 'Failed to update coin. Please try again.' 
      : 'Failed to create coin. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Initialize form based on route
onMounted(() => {
  console.log('Route query:', route.query); // Debug log
  console.log('coinId:', coinId.value, 'isEditing:', isEditing.value); // Debug log
  if (isEditing.value && coinId.value) {
    fetchCoinById();
  }
});

// Watch for symbol changes to enforce uppercase
watch(() => form.value.symbol, (newVal) => {
  if (newVal) {
    form.value.symbol = newVal.toUpperCase();
  }
});
</script>

<template>
  <Navbar />
  <div class="min-h-screen bg-gray-50 p-6 mt-20">
    <div class="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-gray-800 mb-6">
        {{ isEditing ? 'Edit Coin' : 'Add New Coin' }}
      </h1>
      
      <!-- Error message -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
        {{ error }}
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="mb-4 p-4 bg-blue-50 text-blue-700 rounded-md">
        Loading...
      </div>

      <form @submit.prevent="saveCoin">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            v-model="form.name"
            id="name"
            :disabled="isLoading"
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
            required
          />
        </div>

        <div class="mb-4">
          <label for="symbol" class="block text-sm font-medium text-gray-700">Symbol</label>
          <input
            type="text"
            v-model="form.symbol"
            id="symbol"
            :disabled="isLoading"
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 uppercase disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
            required
          />
        </div>

        <div class="mb-6">
          <label for="price" class="block text-sm font-medium text-gray-700">Price (USD)</label>
          <input
            type="number"
            v-model.number="form.price"
            id="price"
            :disabled="isLoading"
            step="0.00000001"
            min="0"
            class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md h-10 disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none"
            required
          />
        </div>
        
        <div class="flex justify-end space-x-4">
          <button
            type="button"
            @click="router.push({ name: 'coins' })"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Saving...</span>
            <span v-else>Save Coin</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>