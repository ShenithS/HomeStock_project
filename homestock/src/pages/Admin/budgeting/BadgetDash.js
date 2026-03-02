import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Receipt,
  PieChart, Calendar
} from 'lucide-react';

import Notification from "../budgeting/Notification";

function BudgetDash({ setActiveTab }) {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    // Replace with your actual endpoints
    axios.get('http://localhost:5000/api/budgets').then(res => setBudgets(res.data)).catch(console.error);
    axios.get('http://localhost:5000/api/expenses').then(res => setExpenses(res.data)).catch(console.error);
  }, []);

  const totalBudget = budgets.reduce((sum, item) => sum + item.amount, 0);
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const remaining = totalBudget - totalSpent;

  const categories = [...new Set([...budgets.map(b => b.category), ...expenses.map(e => e.category)])];

  return (
    <main className="p-4 bg-white rounded-lg ">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="w-4 h-4 mr-2" />
            April 2025
          </button>
        </div>

        <Notification />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Total Budget Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer transform transition-transform hover:scale-[1.02]" onClick={() => setActiveTab('BudgetDetails')}>
            <div className="flex items-center justify-between mb-4">
              <Wallet className="w-8 h-8 opacity-80" />
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium opacity-90">Total Budget</p>
            <p className="mt-2 text-3xl font-bold">Rs.{totalBudget.toLocaleString()}</p>
            
          </div>

          {/* Total Spent Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white cursor-pointer transform transition-transform hover:scale-[1.02]" onClick={() => setActiveTab('ExpensesList')}>
            <div className="flex items-center justify-between mb-4">
              <Receipt className="w-8 h-8 opacity-80" />
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium opacity-90">Total Spent</p>
            <p className="mt-2 text-3xl font-bold">Rs.{totalSpent.toLocaleString()}</p>
            
          </div>

          {/* Remaining Budget Card */}
          <div className="p-6 text-white bg-gradient-to-br from-green-500 to-green-600 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <PieChart className="w-8 h-8 opacity-80" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-lg font-medium opacity-90">Remaining</p>
            <p className="mt-2 text-3xl font-bold">Rs.{remaining.toLocaleString()}</p>
            <p className="mt-2 text-sm opacity-75">Available balance</p>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="p-6 bg-white shadow-sm rounded-2xl">
          <h2 className="mb-6 text-xl font-semibold">Category Breakdown</h2>
          <div className="space-y-6">
            {categories.map((category) => {
              const categoryTotal = expenses
                .filter((e) => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);
              const percentage = totalSpent === 0 ? 0 : (categoryTotal / totalSpent) * 100;

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-500">Rs.{categoryTotal.toLocaleString()}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden bg-gray-100 rounded-full">
                    <div
                      className="h-full transition-all duration-500 ease-in-out rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

BudgetDash.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default BudgetDash;
