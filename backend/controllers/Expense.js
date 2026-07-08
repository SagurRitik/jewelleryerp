
import Expense from "../models/Expense.js";
import xlsx from "xlsx";

export const createExpense = async (req,res)=>{

try{

const {
title,
amount,
category,
paymentMode,
partyName,
reference,
notes,
expenseDate
} = req.body;

if(!amount){
return res.status(400).json({
error:"amount required"
});
}  

const expense = await Expense.create({

title,
amount:Number(amount),
category,
paymentMode,
partyName,
reference,
notes,
expenseDate

});

res.json({
success:true,
expense
});

}catch(err){

res.status(500).json({
error:err.message
});

}

};


export const getExpenses = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const { startDate, endDate, category } = req.query;

    const skip = (page - 1) * limit;

    let query = {};
    if (startDate && endDate) {
      query.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Expense.countDocuments(query)
    ]);

    const totalExpense = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      expenses,
      summary: {
        totalExpense: totalExpense[0]?.total || 0
      },
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenseCategories = async (req, res) => {
  try {
    const categories = await Expense.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const exportExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.expenseDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) {
      query.category = category;
    }

    const expenses = await Expense.find(query).sort({ expenseDate: -1 }).lean();

    const formattedExpenses = expenses.map(exp => ({
      "Date": new Date(exp.expenseDate).toLocaleDateString("en-IN"),
      "Category": exp.category,
      "Amount": exp.amount,
      "Payment Mode": exp.paymentMode,
      "Reference": exp.reference,
      "Party": exp.partyName,
      "Notes": exp.notes,
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedExpenses);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expenses.xlsx"
    );
    res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        error: "Expense not found"
      });
    }

    res.json(expense);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      amount,
      category,
      paymentMode,
      partyName,
      reference,
      notes,
      expenseDate
    } = req.body;

    const expense = await Expense.findById(id);

    if (!expense) {
      return res.status(404).json({
        error: "Expense not found"
      });
    }

    // ✅ update fields
    expense.title = title ?? expense.title;
    expense.amount = amount !== undefined ? Number(amount) : expense.amount;
    expense.category = category ?? expense.category;
    expense.paymentMode = paymentMode ?? expense.paymentMode;
    expense.partyName = partyName ?? expense.partyName;
    expense.reference = reference ?? expense.reference;
    expense.notes = notes ?? expense.notes;
    expense.expenseDate = expenseDate ?? expense.expenseDate;

    await expense.save();

    res.json({
      success: true,
      expense
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        error: "Expense not found"
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
};


export const importExpenses = async (req, res) => {
  try {
    console.log("DEBUG: Bulk Expense Import Request Received");
    if (!req.file) {
      console.log("DEBUG: No file found in request");
      return res.status(400).json({ success: false, message: "Excel file is required" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    console.log(`DEBUG: Found ${rows.length} rows in Excel`);

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: "Excel sheet is empty" });
    }

    const parseExpenseDate = (val) => {
      if (!val) return new Date();
      if (val instanceof Date) return val;
      
      if (typeof val === 'number') {
        return new Date((val - 25569) * 86400 * 1000);
      }
      
      const str = String(val).trim();
      if (!str) return new Date();

      const matchDMY = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (matchDMY) {
        const day = parseInt(matchDMY[1], 10);
        const month = parseInt(matchDMY[2], 10) - 1;
        const year = parseInt(matchDMY[3], 10);
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return d;
      }
      
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d;
      return new Date();
    };

    // Map Excel rows to Expense model fields
    const expensesToCreate = [];
    let skippedCount = 0;

    for (const row of rows) {
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        const normalizedKey = key.toString().replace(/\s+/g, "").replace(/_/g, "").toLowerCase();
        normalizedRow[normalizedKey] = row[key];
      });

      // Amount extraction and validation
      let amountRaw = String(normalizedRow.amount || "").trim();
      amountRaw = amountRaw.replace(/[₹\s,]/g, "");
      const amount = Number(amountRaw);

      if (isNaN(amount) || amount <= 0) {
        skippedCount++;
        continue;
      }

      // Date parsing
      const expenseDate = parseExpenseDate(normalizedRow.date);

      // Category fallback
      const category = normalizedRow.category ? String(normalizedRow.category).trim().toUpperCase() : "OTHER";

      // Payment Mode fallback
      let paymentMode = String(normalizedRow.paymentmode || "").trim().toUpperCase();
      if (!["CASH", "BANK", "UPI", "CARD", "CHEQUE"].includes(paymentMode)) {
        paymentMode = "CASH";
      }

      const partyName = String(normalizedRow.party || normalizedRow.partyname || normalizedRow.specificexpense || normalizedRow.specificexpence || "").trim();
      const reference = String(normalizedRow.reference || "").trim();
      const notes = String(normalizedRow.notes || "").trim();
      const title = String(normalizedRow.title || category || "Expense").trim();

      expensesToCreate.push({
        title,
        amount,
        category,
        paymentMode,
        partyName,
        reference,
        notes,
        expenseDate
      });
    }

    console.log(`DEBUG: Valid expenses to import: ${expensesToCreate.length}, Skipped: ${skippedCount}`);

    if (expensesToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid expense records found in Excel. Ensure the sheet has an 'Amount' column with valid positive values."
      });
    }

    const createdExpenses = await Expense.insertMany(expensesToCreate, { ordered: false });

    return res.status(201).json({
      success: true,
      count: createdExpenses.length,
      skipped: skippedCount,
      data: createdExpenses
    });

  } catch (err) {
    console.error("DEBUG: importExpenses error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};