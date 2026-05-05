


import express from "express";

import { createExpense, getExpenses,  getExpenseById,updateExpense, deleteExpense, getExpenseCategories, exportExpenses} from "../controllers/Expense.js";  



const router = express.Router();



// router.post("/expenses",createExpense);

// router.get("/expenses",getExpenses);



router.post("/", createExpense);

router.get("/", getExpenses);

router.get("/categories", getExpenseCategories);
router.get("/export", exportExpenses);

router.get("/:id", getExpenseById);

router.put("/:id", updateExpense);     

router.delete("/:id", deleteExpense); 





export default router;
