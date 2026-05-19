import axios from 'axios';

const BASE_URL = 'https://api.gold-api.com/price';
const TROY_OZ_TO_GRAM = 31.1035;

/**
 * Fetch live Gold & Silver rates using gold-api.com
 * No API key required. Returns INR per gram.
 * Endpoint: GET https://api.gold-api.com/price/{symbol}/{currency}
 */
export const fetchLiveRates = async () => {
  try {
    // Fetch Gold (XAU) and Silver (XAG) prices directly in INR
    const [goldRes, silverRes] = await Promise.all([
      axios.get(`${BASE_URL}/XAU/INR`),
      axios.get(`${BASE_URL}/XAG/INR`)
    ]);

    const goldPricePerOzINR = goldRes.data?.price;
    const silverPricePerOzINR = silverRes.data?.price;

    if (!goldPricePerOzINR) throw new Error('Gold price unavailable');

    // Convert troy oz → per gram
    const goldPerGram = Math.round(goldPricePerOzINR / TROY_OZ_TO_GRAM);
    const silverPerGram = silverPricePerOzINR
      ? Math.round(silverPricePerOzINR / TROY_OZ_TO_GRAM)
      : null;

    return {
      gold: goldPerGram,
      silver: silverPerGram,
      goldRaw: goldPricePerOzINR,
      silverRaw: silverPricePerOzINR,
      lastUpdated: goldRes.data?.updatedAt || new Date().toISOString(),
      lastUpdatedReadable: goldRes.data?.updatedAtReadable || 'just now',
      isSimulated: false,
    };
  } catch (err) {
    console.error('gold-api.com fetch failed:', err.message);
    // Fallback approximate values
    return {
      gold: 9650,
      silver: 98,
      lastUpdated: new Date().toISOString(),
      lastUpdatedReadable: 'fallback data',
      isSimulated: true,
    };
  }
};
