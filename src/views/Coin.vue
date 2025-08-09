<script setup>
import { ref, reactive, onMounted } from 'vue';
import Navbar from '../components/Navbar.vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const baseUrl = import.meta.env.VITE_API_BASE_URL
const router = useRouter();

// Sample initial coins data
const coins = ref([]);
const showDeleteModal = ref(false);
const coinToDelete = ref(null);

const fetchCoins = async () => {
  try {
    const response = await axios.get(`${baseUrl}/api/CoinData`);
    coins.value = response.data;
    console.log(coins.value)
  } catch (error) {
    console.error('Error fetching coins:', error);
  }
}

const deleteCoin = async () => {
  try {
    await axios.delete(`${baseUrl}/api/CoinData/${coinToDelete.value.id}`);
    fetchCoins();
    showDeleteModal.value = false;
  } catch (error) {
    console.error('Error deleting coin:', error);
  }
}

const openDeleteModal = (coin) => {
  coinToDelete.value = coin;
  showDeleteModal.value = true;
}

const closeDeleteModal = () => {
  showDeleteModal.value = false;
}

const formatPrice = (price) => {
  return price.toFixed(2);
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
}

const editCoin = (coin) => {
  console.log(coin.id)
  router.push({ name: 'addCoin', query: { id: coin.id, isEditing: true } });
}

onMounted(() => {
  fetchCoins();
});
</script>

<template>
  <Navbar/>
  <div class="min-h-screen bg-gray-50 p-6 mt-20">
   <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-8">
     <h1 class="text-3xl font-bold text-gray-800">Coins Management</h1>
     <button
      @click="router.push('/addCoin')"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
     >
      Add Coin
     </button>
    </div>

    <div class="bg-white shadow rounded-lg overflow-hidden">
     <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
       <tr>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Name
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Symbol
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Price (USD)
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
         Last Updated
        </th>
        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
         Actions
        </th>
       </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
       <tr v-for="coin in coins" :key="coin.id" class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap">
         <div class="flex items-center">
          <div class="ml-4">
           <div class="text-sm font-medium text-gray-900">{{ coin.name }}</div>
          </div>
         </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
         <div class="text-sm text-gray-900 font-mono uppercase">{{ coin.symbol }}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
         <div class="text-sm text-gray-900">${{ formatPrice(coin.price) }}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
         <div class="text-sm text-gray-500">{{ formatDate(coin.lastUpdated) }}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
         <button @click="editCoin(coin)" class="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
         <button @click="openDeleteModal(coin)" class="text-red-600 hover:text-red-900">Delete</button>
        </td>
       </tr>
      </tbody>
     </table>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-lg font-medium text-gray-900">Delete Coin</h3>
          <div class="mt-2">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete <span class="font-semibold">{{ coinToDelete?.name }}</span> ({{ coinToDelete?.symbol }})?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button
            type="button"
            @click="deleteCoin"
            class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
          >
            Delete
          </button>
          <button
            type="button"
            @click="closeDeleteModal"
            class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
   </div>
  </div>
</template>