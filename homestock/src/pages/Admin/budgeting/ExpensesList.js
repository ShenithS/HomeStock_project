import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import AddExpenseModal from "./component/AddExpenseModal";

const ExpensesList = ({ setActiveTab }) => {
  const [showModal, setShowModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [allCategories, setAllCategories] = useState([]);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses');
      const data = response.data;
      setExpenses(data);

      // Extract unique sorted categories
      const uniqueCategories = [...new Set(data.map(e => e.category))].sort();
      setAllCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    try {
      if (editingExpense) {
        // Update existing
        const response = await axios.put(`http://localhost:5000/api/expenses/${editingExpense._id}`, expense);
        setExpenses(expenses.map((e) => (e._id === editingExpense._id ? response.data : e)));
      } else {
        // Add new
        const response = await axios.post('http://localhost:5000/api/expenses', expense);
        setExpenses([...expenses, response.data]);
        // Update category list if new one added
        if (!allCategories.includes(response.data.category)) {
          setAllCategories([...allCategories, response.data.category].sort());
        }
      }
      setEditingExpense(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`);
      setExpenses(expenses.filter((e) => e._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const startEdit = (expense) => {
    setEditingExpense(expense);
    setShowModal(true);
  };

  // Filtered expenses by selected category
  const filteredExpenses = filterCategory === "All"
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('BudgetDash')}
            className="p-2 transition-colors rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Expenses Management</h1>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Expenses List</h2>
            <p className="text-sm text-gray-500">Track and manage your expenses</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingExpense(null);
                setShowModal(true);
              }}
              className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end mb-4">
          <label className="mr-2 text-sm font-medium">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="All">All</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Payment Method</th>
                
                <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id}>
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4">{expense.category}</td>
                  <td className="px-6 py-4">Rs.{expense.amount}</td>
                  <td className="px-6 py-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{expense.paymentMethod}</td>
                  
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => startEdit(expense)} className="text-indigo-600 hover:underline">
                      <Pencil className="inline w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button onClick={() => deleteExpense(expense._id)} className="text-red-600 hover:underline">
                      <Trash2 className="inline w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <AddExpenseModal
            onClose={() => {
              setShowModal(false);
              setEditingExpense(null);
            }}
            onAdd={addExpense}
            initialData={editingExpense}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesList;
