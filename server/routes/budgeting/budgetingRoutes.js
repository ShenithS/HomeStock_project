const express = require('express');
const router = express.Router();
const budgetingController = require('../../controllers/budgeting/budgetingController');
const expensesController = require('../../controllers/budgeting/expensesController');


// Budget routes
router.post('/budgets', budgetingController.createBudget);
router.get('/budgets', budgetingController.getAllBudgets);
router.put('/budgets/:id', budgetingController.updateBudget);
router.delete('/budgets/:id', budgetingController.deleteBudget);
 
// Expense routes
router.post('/expenses', expensesController.createExpense);
router.get('/expenses', expensesController.getAllExpenses);
router.put('/expenses/:id', expensesController.updateExpense);
router.delete('/expenses/:id', expensesController.deleteExpense);

module.exports = router;
