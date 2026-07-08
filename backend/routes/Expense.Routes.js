


import express from "express";

import { createExpense, getExpenses,  getExpenseById,updateExpense, deleteExpense, getExpenseCategories, exportExpenses, importExpenses} from "../controllers/Expense.js";  
import { uploadExcel } from "../middlewares/excelUpload.js";


const router = express.Router();



// router.post("/expenses",createExpense);

// router.get("/expenses",getExpenses);



router.post("/", createExpense);

router.get("/", getExpenses);

router.get("/categories", getExpenseCategories);
router.get("/export", exportExpenses);
router.post("/import", uploadExcel.single("excel"), importExpenses);

router.get("/:id", getExpenseById);

router.put("/:id", updateExpense);     

router.delete("/:id", deleteExpense); 





export default router;
