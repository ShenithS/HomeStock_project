const Budget = require('../../models/budgeting/budgetingModel');

// Create a new budget
exports.createBudget = async (req, res) => {
    try {
        console.log("Creating a new budget:", req.body);
        const budget = new Budget(req.body);
        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all budgets
exports.getAllBudgets = async (req, res) => {
    try {
        console.log("Retrieving all budgets");
        const budgets = await Budget.find();
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a budget
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!budget) {
            console.log(`Budget with ID ${req.params.id} not found`);
            return res.status(404).json({ message: 'Budget not found' });
        }
        console.log("Updating budget:", budget);
        res.status(200).json(budget);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);
        if (!budget) {
            console.log(`Budget with ID ${req.params.id} not found`);
            return res.status(404).json({ message: 'Budget not found' });
        }
        console.log("Deleting budget:", budget);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
