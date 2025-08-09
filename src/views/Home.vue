<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// State
const registeredCoins = ref([]);
const conversionType = ref('fiatToCrypto');
const inputAmount = ref(1);
const outputAmount = ref('');
const selectedFiatCurrency = ref('');
const selectedCrypto = ref('');
const selectedToCrypto = ref('');
const conversionResult = ref('');
const lastUpdated = ref('');
const isLoading = ref(false);

const fiatCurrencies = ['usd', 'eur', 'ghs', 'gbp', 'jpy', 'nzd', 'cad', 'aud', 'inr'];

const fetchCoins = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get(`${baseUrl}/api/CoinData`);
    registeredCoins.value = response.data.map(coin => ({ 
      symbol: coin.symbol, 
      name: coin.name 
    }));
  } catch (error) {
    console.error('Error fetching coins:', error);
  } finally {
    isLoading.value = false;
  }
};

const convertCryptoToCrypto = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post(`${baseUrl}/api/CoinData/convert-coin-to-coin`, {
      amount: Number(inputAmount.value),
      fromCryptoSymbol: selectedCrypto.value.toLowerCase(),
      toCryptoSymbol: selectedToCrypto.value.toLowerCase()
    });
    
    return {
      convertedAmount: parseFloat(response.data.convertedAmount).toFixed(8),
      lastUpdated: response.data.lastUpdated
    };
  } catch (error) {
    console.error('Error converting crypto to crypto:', error);
    return null;
  } finally {
    isLoading.value = false;
  }
};

const convertFiatToCrypto = async () => {
  try {
    isLoading.value = true;
    const response = await axios.post(`${baseUrl}/api/CoinData/convert-coin-to-fiat`, {
      amount: Number(inputAmount.value),
      cryptoSymbol: selectedCrypto.value.toLowerCase(),
      toCurrency: selectedFiatCurrency.value.toLowerCase()
    });
    
    return {
      convertedAmount: parseFloat(response.data.convertedAmount).toFixed(8),
      outputAmount: response.data.convertedAmount,
      lastUpdated: response.data.lastUpdated
    };
  } catch (error) {
    console.error('Error converting fiat to crypto:', error);
    return null;
  } finally {
    isLoading.value = false;
  }
};

const convert = async () => {
  if (isNaN(inputAmount.value) || inputAmount.value <= 0) {
    outputAmount.value = '';
    conversionResult.value = '';
    return;
  }

  let result;
  if (conversionType.value === 'fiatToCrypto') {
    if (!selectedFiatCurrency.value || !selectedToCrypto.value) {
      outputAmount.value = '';
      conversionResult.value = '';
      return;
    }
    result = await convertFiatToCrypto();
  } else if (conversionType.value === 'cryptoToCrypto') {
    if (!selectedCrypto.value || !selectedToCrypto.value) {
      outputAmount.value = '';
      conversionResult.value = '';
      return;
    }
    result = await convertCryptoToCrypto();
  }

  if (result) {
    outputAmount.value = result.convertedAmount;
    conversionResult.value = outputAmount.value;
    lastUpdated.value = result.lastUpdated;
  }
};

// Watchers
watch([inputAmount, selectedCrypto, selectedToCrypto, selectedFiatCurrency, conversionType], () => {
  convert();
});

// Initialize
onMounted(async () => {
  await fetchCoins();
});
</script>
<template>
  <div class="min-h-screen flex flex-col items-center justify-start bg-white text-gray-900 pt-16">
    <nav class="fixed top-0 left-0 w-full bg-white shadow-md z-10">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="text-2xl font-bold text-gray-800">Crypto Converter</div>
        <div class="flex space-x-4">
          <button @click="conversionType = 'fiatToCrypto'"
            :class="{ 'bg-blue-600 text-white': conversionType === 'fiatToCrypto', 'bg-gray-200 text-gray-800': conversionType !== 'fiatToCrypto' }"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            Fiat to Crypto
          </button>
          <button @click="conversionType = 'cryptoToCrypto'"
            :class="{ 'bg-blue-600 text-white': conversionType === 'cryptoToCrypto', 'bg-gray-200 text-gray-800': conversionType !== 'cryptoToCrypto' }"
            class="px-4 py-2 rounded-lg font-medium transition-colors duration-200">
            Crypto to Crypto
          </button>
        </div>
      </div>
    </nav>
    
    <div class="w-full max-w-4xl p-8 mt-16">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-normal tracking-wide">Cryptocurrency Converter & Calculator</h1>
        <p class="text-gray-500 mt-2">
          <span v-if="conversionType === 'cryptoToCrypto'">
            BTC to ETH: 1 Bitcoin converts to ETH {{ conversionResult }} as of {{ lastUpdated }}
          </span>
        </p>
      </div>

      <div class="flex items-center justify-center space-x-4">
        <div class="relative flex-1 max-w-xs">
          <input
            type="text"
            v-model="inputAmount"
            class="w-full p-4 pr-24 text-xl border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <select
              v-if="conversionType === 'fiatToCrypto'"
              v-model="selectedFiatCurrency"
              class="h-full bg-transparent text-gray-500 rounded-md focus:outline-none text-lg"
            >
              <option v-for="currency in fiatCurrencies" :key="currency" :value="currency" >
                {{ currency.toUpperCase() }}
              </option>
            </select>
            <select
              v-else
              v-model="selectedCrypto"
              class="h-full bg-transparent text-gray-500 rounded-md focus:outline-none text-lg"
            >
              <option v-for="coin in registeredCoins" :key="coin.symbol" :value="coin.symbol">
                {{ coin.symbol.toUpperCase() }}
              </option>
            </select>
          </div>
        </div>

        <div class="p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-gray-400 transform rotate-90 md:rotate-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>

        <div class="relative flex-1 max-w-xs">
          <input
            type="text"
            v-model="outputAmount"
            readonly
            class="w-full p-4 pr-24 text-xl border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <select
              v-if="conversionType === 'fiatToCrypto'"
              v-model="selectedToCrypto"
              class="h-full bg-transparent text-gray-500 rounded-md focus:outline-none text-lg"
            >
              <option v-for="coin in registeredCoins" :key="coin.symbol" :value="coin.symbol">
                {{ coin.symbol.toUpperCase() }}
              </option>
            </select>
            <select
              v-else
              v-model="selectedToCrypto"
              class="h-full bg-transparent text-gray-500 rounded-md focus:outline-none text-lg"
            >
              <option v-for="coin in registeredCoins" :key="coin.symbol" :value="coin.symbol">
                {{ coin.symbol.toUpperCase() }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <button
          @click="convert"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full"
        >
          Convert
        </button>
      </div>
    </div>
  </div>
</template>

