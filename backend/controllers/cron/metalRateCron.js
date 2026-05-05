// import cron from "node-cron";
// // import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";
// import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";

// export function startMetalRateCron() {
//   // Every 5 minutes
//   cron.schedule("*/5 * * * *", async () => {
//     await fetchAndStoreMetalRates();
//   });
// }
// import cron from "node-cron";
// import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";

// export function startMetalRateCron() {
//   // every 5 minutes
//   cron.schedule("*/5 * * * *", async () => {
//     await fetchAndStoreMetalRates();
//   });
// }

// import cron from "node-cron";
// import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";

// export function startMetalRateCron() {
//   cron.schedule("*/5 * * * *", async () => {
//     await fetchAndStoreMetalRates();
//   });
// }
// import cron from "node-cron";
// import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";

// export function startMetalRateCron() {
//   // Every 6 hours → 4 times/day
//   cron.schedule("0 */6 * * *", async () => {
//     await fetchAndStoreMetalRates();
//   });
// }
// jobs/metalRateCron.js


// import cron from "node-cron";
// import { fetchAndStoreMetalRates } from "../services/fetchMetalRates.js";

// export function startMetalRateCron() {
//   // Run twice a day at 9 AM and 6 PM
//   cron.schedule("0 9,18 * * *", async () => {
//     console.log("⏰ Running scheduled metal rate update...");
//     try {
//       await fetchAndStoreMetalRates();
//     } catch (error) {
//       console.error("❌ Scheduled update failed:", error.message);
//     }
//   });
  
//   // Run immediately on server start
//   console.log("⏰ Initial metal rate update...");
//   setTimeout(() => {
//     fetchAndStoreMetalRates().catch(error => {
//       console.error("❌ Initial update failed:", error.message);
//     });
//   }, 3000);
// }