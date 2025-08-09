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
          <span v-if="conversionType === 'cryptoToFiat'">
            BTC to GHS: 1 Bitcoin converts to GHS {{ conversionResult }} as of {{ lastUpdated }}
          </span>
          <span v-if="conversionType === 'fiatToCrypto'">
            USD to BTC: 1 USD converts to BTC {{ conversionResult }} as of {{ lastUpdated }}
          </span>
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
              <option v-for="currency in fiatCurrencies" :key="currency" :value="currency">
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

<script setup>
import { ref, onMounted, watch } from 'vue';

// State
const conversionType = ref('fiatToCrypto');
const inputAmount = ref(1);
const outputAmount = ref('');
const selectedFiatCurrency = ref('usd');
const selectedCrypto = ref('btc');
const selectedToCrypto = ref('eth');
const conversionResult = ref('');
const lastUpdated = ref('');
const isLoading = ref(false);

// Mock data
const registeredCoins = ref([
  { symbol: 'btc', name: 'Bitcoin' },
  { symbol: 'eth', name: 'Ethereum' },
  { symbol: 'sol', name: 'Solana' },
  { symbol: 'ada', name: 'Cardano' },
]);

const fiatCurrencies = ['usd', 'eur', 'ghs', 'gbp', 'jpy'];

// Mock exchange rates
const exchangeRates = ref({});

// Mock API functions
async function fetchRates() {
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 800));
  
  exchangeRates.value = {
    btc: { usd: 50000, eur: 45000, ghs: 1234964.91, gbp: 40000, jpy: 7000000 },
    eth: { usd: 3000, eur: 2700, ghs: 36000, gbp: 2400, jpy: 420000 },
    sol: { usd: 100, eur: 90, ghs: 1200, gbp: 80, jpy: 14000 },
    ada: { usd: 1.5, eur: 1.35, ghs: 18, gbp: 1.2, jpy: 210 },
  };
  
  lastUpdated.value = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
  });
  isLoading.value = false;
}

// Conversion function
function convert() {
  if (conversionType.value === 'fiatToCrypto') {
    if (!inputAmount.value || !selectedFiatCurrency.value || !selectedToCrypto.value) {
      outputAmount.value = '';
      return;
    }
    const rate = exchangeRates.value[selectedToCrypto.value]?.[selectedFiatCurrency.value] || 0;
    const result = parseFloat(inputAmount.value) / rate;
    outputAmount.value = result.toFixed(8);
    conversionResult.value = outputAmount.value;
  } else if (conversionType.value === 'cryptoToCrypto') {
    if (!inputAmount.value || !selectedCrypto.value || !selectedToCrypto.value) {
      outputAmount.value = '';
      return;
    }
    const fromRate = exchangeRates.value[selectedCrypto.value]?.usd || 1;
    const toRate = exchangeRates.value[selectedToCrypto.value]?.usd || 1;
    const result = (parseFloat(inputAmount.value) * fromRate) / toRate;
    outputAmount.value = result.toFixed(8);
    conversionResult.value = outputAmount.value;
  }
}

// Watchers for immediate conversion on change
watch([inputAmount, selectedCrypto, selectedToCrypto, selectedFiatCurrency, conversionType], () => {
  convert();
});

// Initialize on component mount
onMounted(() => {
  fetchRates().then(() => {
    convert();
  });
});
</script>

<style>
/* No custom styles needed beyond Tailwind for this layout */
</style>