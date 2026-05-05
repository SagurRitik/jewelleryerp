

import MetalLedger from "../models/MetalLedger.js";

/* ---------------- METAL NORMALIZER ---------------- */

const normalizeMetal = (metal) => {

if (!metal) return null;

const m = metal.toString().toLowerCase();

if (m.includes("gold")) return "Gold";
if (m.includes("silver")) return "Silver";
if (m.includes("platinum")) return "Platinum";

return null;

};


/* ---------------- MANUAL CREDIT ---------------- */

export const manualMetalCredit = async (req, res) => {

try {

const {
metalType,
purity,
weight,
ratePerGram,
notes,
partyName,
customerName
} = req.body;

if (!metalType || !weight || !ratePerGram) {
return res.status(400).json({
success: false,
error: "Metal type, weight and rate required"
});
}

const metal = normalizeMetal(metalType);

if (!metal) {
return res.status(400).json({
success:false,
error:"Invalid metal type"
});
}

const w = Number(weight);
const r = Number(ratePerGram);
const value = w * r;

const entry = await MetalLedger.create({

type: "CREDIT",
source: "MANUAL",

partyName: partyName || customerName || null,

metalType: metal,
purity: purity || null,

weight: w,
ratePerGram: r,

value,
notes

});

res.json({
success: true,
entry
});

} catch (err) {

res.status(500).json({
success: false,
error: err.message
});

}

};


/* ---------------- MANUAL DEBIT ---------------- */

export const manualMetalDebit = async (req, res) => {

try {

const {
metalType,
purity,
weight,
ratePerGram,
value,
source,
partyName,
customerName,
notes
} = req.body;

if (!metalType || !weight || !ratePerGram) {
return res.status(400).json({
success:false,
error:"Metal type, weight and rate required"
});
}

const metal = normalizeMetal(metalType);

if (!metal) {
return res.status(400).json({
success:false,
error:"Invalid metal type"
});
}

const w = Number(weight);
const r = Number(ratePerGram);

/* ================= CHECK METAL STOCK ================= */

const entries = await MetalLedger.find({
metalType: metal,
purity: purity
});

let creditWeight = 0;
let debitWeight = 0;

entries.forEach(e => {

if(e.type === "CREDIT"){
creditWeight += Number(e.weight) || 0;
}

if(e.type === "DEBIT"){
debitWeight += Number(e.weight) || 0;
}

});

const availableStock = creditWeight - debitWeight;

if(w > availableStock){

return res.status(400).json({
success:false,
error:`Not enough stock. Available ${availableStock}g ${metal} ${purity}`
});

}

/* ================= CREATE ENTRY ================= */

const debitValue = value || (w * r);

const entry = await MetalLedger.create({

type:"DEBIT",
source: source || "VENDOR",

partyName: partyName || customerName || null,

metalType: metal,
purity: purity || null,

weight: w,
ratePerGram: r,

value: Number(debitValue),

notes

});

res.json({
success:true,
entry
});

} catch(err){

res.status(500).json({
success:false,
error:err.message
});

}

};

/* ---------------- LEDGER LIST ---------------- */

// export const getMetalLedger = async (req, res) => {

// try {

// const rawEntries = await MetalLedger
// .find()
// .sort({ createdAt: -1 })
// .lean();


// /* ---------- NORMALIZE PARTY NAME ---------- */

// const entries = rawEntries.map(e => ({

// ...e,

// partyName: e.partyName || e.customerName || "-",

// metalType: normalizeMetal(e.metalType) || e.metalType

// }));


// /* ---------- VALUE SUMMARY ---------- */

// const totalCredit = entries
// .filter(e => e.type === "CREDIT")
// .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

// const totalDebit = entries
// .filter(e => e.type === "DEBIT")
// .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

// const balance = totalCredit - totalDebit;


// /* ---------- METAL WEIGHT SUMMARY ---------- */

// const metalBalances = {

// Gold: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 },
// Silver: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 },
// Platinum: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 }

// };


// entries.forEach(e => {

// const metal = normalizeMetal(e.metalType);

// if (!metal) return;

// if (!metalBalances[metal]) return;

// if (e.type === "CREDIT") {
// metalBalances[metal].creditWeight += Number(e.weight) || 0;
// }

// if (e.type === "DEBIT") {
// metalBalances[metal].debitWeight += Number(e.weight) || 0;
// }

// });


// /* ---------- FINAL BALANCE ---------- */

// Object.keys(metalBalances).forEach(metal => {

// const m = metalBalances[metal];

// m.balanceWeight = m.creditWeight - m.debitWeight;

// });


// res.json({

// entries,

// summary: {
// totalCredit,
// totalDebit,
// balance
// },

// metalBalances

// });

// } catch (err) {

// res.status(500).json({
// error: err.message
// });

// }

// };


export const getMetalLedger = async (req, res) => {
  try {
    /* ---------------- QUERY PARAMS ---------------- */
    const {
      page = 1,
      limit = 20,
      search = "",
      metalType,
      type,
      sortBy = "createdAt",
      order = "desc"
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    /* ---------------- FILTER ---------------- */
    const filter = {};

    if (metalType) {
      filter.metalType = normalizeMetal(metalType);
    }

    if (type) {
      filter.type = type.toUpperCase(); // CREDIT / DEBIT
    }

    if (search) {
      filter.$or = [
        { partyName: { $regex: search, $options: "i" } },
        { metalType: { $regex: search, $options: "i" } },
      ];
    }

    /* ---------------- SORT ---------------- */
    const sortOrder = order === "asc" ? 1 : -1;

    /* ---------------- QUERY ---------------- */
    const [rawEntries, total] = await Promise.all([
      MetalLedger.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      MetalLedger.countDocuments(filter),
    ]);

    /* ---------------- NORMALIZE ---------------- */
    const entries = rawEntries.map(e => ({
      ...e,
      partyName: e.partyName || e.customerName || "-",
      metalType: normalizeMetal(e.metalType) || e.metalType
    }));

    /* ---------------- SUMMARY (ONLY FILTERED DATA) ---------------- */
    const totalCredit = entries
      .filter(e => e.type === "CREDIT")
      .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    const totalDebit = entries
      .filter(e => e.type === "DEBIT")
      .reduce((sum, e) => sum + (Number(e.value) || 0), 0);

    const balance = totalCredit - totalDebit;

    /* ---------------- METAL BALANCE ---------------- */
    const metalBalances = {
      Gold: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 },
      Silver: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 },
      Platinum: { creditWeight: 0, debitWeight: 0, balanceWeight: 0 }
    };

    entries.forEach(e => {
      const metal = normalizeMetal(e.metalType);
      if (!metal) return;

      if (e.type === "CREDIT") {
        metalBalances[metal].creditWeight += Number(e.weight) || 0;
      }

      if (e.type === "DEBIT") {
        metalBalances[metal].debitWeight += Number(e.weight) || 0;
      }
    });

    Object.keys(metalBalances).forEach(metal => {
      const m = metalBalances[metal];
      m.balanceWeight = m.creditWeight - m.debitWeight;
    });

    /* ---------------- RESPONSE ---------------- */
    res.json({
      entries,

      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },

      summary: {
        totalCredit,
        totalDebit,
        balance,
      },

      metalBalances,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};