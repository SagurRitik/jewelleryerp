

// // services/fetchMetalRates.js
// import axios from "axios";
// import MetalRate from "../../models/MetalRate.js";

// export async function fetchAndStoreMetalRates() {
//   try {
//     console.log("🔄 Fetching metal rates...");

//     // Try multiple free APIs with fallbacks
//     let goldRate = await tryGoldSources();
//     let silverRate = await trySilverSources();
    
//     // If rates are still 0, use fallback/static rates
//     if (goldRate <= 0) goldRate = 6200; // Fallback INR per gram
//     if (silverRate <= 0) silverRate = 75; // Fallback INR per gram

//     // Store in database
//     await updateMetalRate("GOLD", "24K", goldRate, "Multiple Sources");
//     await updateMetalRate("SILVER", "999", silverRate, "Multiple Sources");
    
//     // Static rates for other metals (can be updated manually)
//     await updateMetalRate("PLATINUM", "950", 5000, "Fixed Rate");
//     await updateMetalRate("MAKING_CHARGE", "", 500, "Fixed Rate");
    
//     console.log(`✅ Metal rates updated - Gold: ₹${goldRate}/g, Silver: ₹${silverRate}/g`);
//     return { goldRate, silverRate };
    
//   } catch (err) {
//     console.error("❌ Metal rate cron failed:", err.message);
//     // Use fallback IBJA rates
//     return await updateWithFallbackRates();
//   }
// }

// // Try multiple gold API sources
// async function tryGoldSources() {
//   const sources = [
//     tryMCXAPI,
//     tryGoldPriceAPI,
//     tryFreeForexAPI,
//     tryMetalDevAPI
//   ];

//   for (const source of sources) {
//     try {
//       const rate = await source();
//       if (rate > 0) {
//         console.log(`✅ Got gold rate from ${source.name}: ₹${rate}`);
//         return rate;
//       }
//     } catch (error) {
//       console.log(`⚠️ ${source.name} failed: ${error.message}`);
//       continue;
//     }
//   }
//   return 0;
// }

// // Try multiple silver API sources
// async function trySilverSources() {
//   const sources = [
//     tryMCXSilverAPI,
//     tryGoldPriceSilverAPI,
//     tryFreeForexSilverAPI
//   ];

//   for (const source of sources) {
//     try {
//       const rate = await source();
//       if (rate > 0) {
//         console.log(`✅ Got silver rate from ${source.name}: ₹${rate}`);
//         return rate;
//       }
//     } catch (error) {
//       console.log(`⚠️ ${source.name} failed: ${error.message}`);
//       continue;
//     }
//   }
//   return 0;
// }

// // ==================== GOLD API SOURCES ====================

// // Source 1: MCX India (Most reliable for Indian rates)
// async function tryMCXAPI() {
//   try {
//     // This endpoint might require parsing HTML or using unofficial APIs
//     const response = await axios.get(
//       "https://www.mcxindia.com/market-data/market-watch",
//       { timeout: 10000 }
//     );
    
//     // Parse HTML for gold rate (simplified)
//     const html = response.data;
//     // Look for gold rate pattern - this will need adjustment based on actual HTML
//     const goldMatch = html.match(/Gold.*?(\d+,\d+)/);
//     if (goldMatch) {
//       const rateString = goldMatch[1].replace(',', '');
//       const ratePer10g = parseInt(rateString);
//       return Math.round(ratePer10g / 10); // Convert to per gram
//     }
    
//     // Alternative: Use unofficial MCX API
//     const mcxResponse = await axios.get(
//       "https://api.allorigins.win/get?url=" + 
//       encodeURIComponent("https://www.mcxindia.com/backpage.aspx/GetMarketWatch"),
//       { timeout: 10000 }
//     );
    
//     if (mcxResponse.data.contents) {
//       const data = JSON.parse(mcxResponse.data.contents);
//       // Parse the response structure
//       return parseMCXGoldRate(data);
//     }
    
//     return 0;
//   } catch (error) {
//     throw new Error(`MCX API: ${error.message}`);
//   }
// }

// // Source 2: GoldPrice.org API (No API key needed)
// async function tryGoldPriceAPI() {
//   try {
//     const response = await axios.get(
//       "https://data-asg.goldprice.org/dbXRates/INR",
//       { timeout: 10000 }
//     );
    
//     const goldPer10g = response.data?.items?.[0]?.xauPrice;
//     if (goldPer10g) {
//       return Math.round(goldPer10g / 10); // Convert to per gram
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`GoldPrice API: ${error.message}`);
//   }
// }

// // Source 3: Free Forex API (Gold in INR)
// async function tryFreeForexAPI() {
//   try {
//     const response = await axios.get(
//       "https://api.fastforex.io/fetch-multi?from=USD&to=XAU,INR&api_key=free",
//       { timeout: 10000 }
//     );
    
//     const goldPerOzUSD = response.data?.results?.XAU;
//     const usdToInr = response.data?.results?.INR;
    
//     if (goldPerOzUSD && usdToInr) {
//       // Convert: (USD per ounce) * (INR per USD) / 31.1035 (grams per ounce)
//       const goldPerGramINR = (goldPerOzUSD * usdToInr) / 31.1035;
//       return Math.round(goldPerGramINR);
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`FreeForex API: ${error.message}`);
//   }
// }

// // Source 4: metals-api.com with demo key
// async function tryMetalDevAPI() {
//   try {
//     const response = await axios.get(
//       "https://metals-api.com/api/latest?access_key=demo&base=USD&symbols=XAU,INR",
//       { timeout: 10000 }
//     );
    
//     const goldPerOzUSD = response.data?.rates?.XAU;
//     const usdToInr = response.data?.rates?.INR;
    
//     if (goldPerOzUSD && usdToInr) {
//       // Convert: USD per ounce → INR per gram
//       const goldPerGramINR = (goldPerOzUSD * usdToInr) / 31.1035;
//       return Math.round(goldPerGramINR);
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`Metals-API: ${error.message}`);
//   }
// }

// // ==================== SILVER API SOURCES ====================

// async function tryMCXSilverAPI() {
//   try {
//     const response = await axios.get(
//       "https://api.allorigins.win/get?url=" + 
//       encodeURIComponent("https://www.mcxindia.com/backpage.aspx/GetMarketWatch"),
//       { timeout: 10000 }
//     );
    
//     if (response.data.contents) {
//       const data = JSON.parse(response.data.contents);
//       // Parse for silver rate
//       const silverPerKg = parseMCXSilverRate(data);
//       return Math.round(silverPerKg / 1000); // Convert to per gram
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`MCX Silver API: ${error.message}`);
//   }
// }

// async function tryGoldPriceSilverAPI() {
//   try {
//     const response = await axios.get(
//       "https://data-asg.goldprice.org/dbXRates/INR",
//       { timeout: 10000 }
//     );
    
//     const silverPerKg = response.data?.items?.[0]?.xagPrice;
//     if (silverPerKg) {
//       return Math.round(silverPerKg / 1000); // Convert to per gram
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`GoldPrice Silver API: ${error.message}`);
//   }
// }

// async function tryFreeForexSilverAPI() {
//   try {
//     const response = await axios.get(
//       "https://api.fastforex.io/fetch-multi?from=USD&to=XAG,INR&api_key=free",
//       { timeout: 10000 }
//     );
    
//     const silverPerOzUSD = response.data?.results?.XAG;
//     const usdToInr = response.data?.results?.INR;
    
//     if (silverPerOzUSD && usdToInr) {
//       const silverPerGramINR = (silverPerOzUSD * usdToInr) / 31.1035;
//       return Math.round(silverPerGramINR);
//     }
//     return 0;
//   } catch (error) {
//     throw new Error(`FreeForex Silver API: ${error.message}`);
//   }
// }

// // ==================== HELPER FUNCTIONS ====================

// async function updateMetalRate(metal, purity, ratePerGram, source) {
//   return await MetalRate.findOneAndUpdate(
//     { metal, purity },
//     {
//       ratePerGram,
//       source,
//       updatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );
// }

// // Fallback to IBJA rates if all APIs fail
// async function updateWithFallbackRates() {
//   const IBJA_GOLD_24K_10G = 62500; // Update this manually once daily
//   const IBJA_SILVER_1KG = 82000;   // Update this manually once daily
  
//   const goldPerGram = Math.round(IBJA_GOLD_24K_10G / 10);
//   const silverPerGram = Math.round(IBJA_SILVER_1KG / 1000);

//   await updateMetalRate("GOLD", "24K", goldPerGram, "IBJA Fallback");
//   await updateMetalRate("SILVER", "999", silverPerGram, "IBJA Fallback");
  
//   console.log(`⚠️ Using fallback rates - Gold: ₹${goldPerGram}/g, Silver: ₹${silverPerGram}/g`);
  
//   return { goldRate: goldPerGram, silverRate: silverPerGram };
// }

// // Parse MCX response (adjust based on actual response structure)
// function parseMCXGoldRate(data) {
//   try {
//     // Example parsing - adjust based on actual MCX response
//     const goldData = data.d?.filter(item => 
//       item.CommodityName && item.CommodityName.includes('GOLD')
//     )[0];
    
//     if (goldData && goldData.LastTradedPrice) {
//       const pricePer10g = parseFloat(goldData.LastTradedPrice);
//       return Math.round(pricePer10g / 10);
//     }
//     return 0;
//   } catch (error) {
//     console.error("Error parsing MCX data:", error);
//     return 0;
//   }
// }

// function parseMCXSilverRate(data) {
//   try {
//     // Example parsing - adjust based on actual MCX response
//     const silverData = data.d?.filter(item => 
//       item.CommodityName && item.CommodityName.includes('SILVER')
//     )[0];
    
//     if (silverData && silverData.LastTradedPrice) {
//       const pricePerKg = parseFloat(silverData.LastTradedPrice);
//       return Math.round(pricePerKg);
//     }
//     return 0;
//   } catch (error) {
//     console.error("Error parsing MCX silver data:", error);
//     return 0;
//   }
// }

// services/fetchMetalRates.js - SIMPLE & RELIABLE

// import MetalRate from "../../models/MetalRate.js";

// // ⚠️ UPDATE THESE VALUES DAILY with actual rates from GoodReturns
// const CURRENT_RATES = {
//   // ⚠️ IMPORTANT: Update these daily with REAL market rates
//   date: "2024-01-25",
//   gold24KT: 6520,    // Today's 24K gold rate per gram
//   silver999: 78,     // Today's silver rate per gram
//   platinum950: 4560, // Platinum rate (approx 70% of gold)
//   diamondRate: 150000,  // Diamond per carat
//   stoneRate: 5000,      // Other stones per carat
//   makingCharge: 500     // Making charge per gram
// };

// export async function fetchAndStoreMetalRates() {
//   try {
//     console.log(`🔄 Updating metal rates...`);
//     console.log(`📅 Date: ${CURRENT_RATES.date}`);
//     console.log(`💰 Gold: ₹${CURRENT_RATES.gold24KT}/g, Silver: ₹${CURRENT_RATES.silver999}/g`);
    
//     // Update all rates in database
//     await Promise.all([
//       updateRate("GOLD", "24K", CURRENT_RATES.gold24KT, "Manual Daily"),
//       updateRate("SILVER", "999", CURRENT_RATES.silver999, "Manual Daily"),
//       updateRate("PLATINUM", "950", CURRENT_RATES.platinum950, "Manual Daily"),
//       updateRate("DIAMOND", "", CURRENT_RATES.diamondRate, "Manual Daily"),
//       updateRate("STONE", "", CURRENT_RATES.stoneRate, "Manual Daily"),
//       updateRate("MAKING_CHARGE", "", CURRENT_RATES.makingCharge, "Manual Daily")
//     ]);
    
//     console.log("✅ All rates updated successfully!");
    
//     return {
//       ...CURRENT_RATES,
//       source: 'Manual Daily Rates'
//     };
    
//   } catch (error) {
//     console.error("❌ Failed to update rates:", error.message);
//     throw error;
//   }
// }

// async function updateRate(metal, purity, rate, source) {
//   return await MetalRate.findOneAndUpdate(
//     { metal, purity },
//     {
//       ratePerGram: rate,
//       source,
//       updatedAt: new Date(),
//     },
//     { upsert: true, new: true }
//   );
// }

// // Function to update rates manually via API
// export async function updateManualRates(newRates) {
//   // Update CURRENT_RATES with new values
//   Object.assign(CURRENT_RATES, newRates);
//   CURRENT_RATES.date = new Date().toISOString().split('T')[0];
  
//   console.log(`📝 Updating rates to: Gold ₹${CURRENT_RATES.gold24KT}/g, Silver ₹${CURRENT_RATES.silver999}/g`);
  
//   // Save to database
//   return await fetchAndStoreMetalRates();
// }

// // Get current rates
// export async function getCurrentRates() {
//   try {
//     const rates = await MetalRate.find().sort({ updatedAt: -1 });
//     return rates;
//   } catch (error) {
//     console.error("Error getting rates:", error);
//     return [];
//   }
// }