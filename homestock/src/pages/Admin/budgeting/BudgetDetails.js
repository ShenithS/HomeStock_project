import React, { useState, useEffect, useRef } from 'react';
import { Plus, FileText, ArrowLeft, MoreVertical } from 'lucide-react';
import AddBudgetModal from './component/AddBudgetModal';
import BudgetOptionsPopup from './component/BudgetOptionsPopup';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BudgetDetails = ({ setActiveTab }) => {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const optionsButtonRef = useRef(null);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/budgets");
      if (response.data && Array.isArray(response.data)) {
        setBudgets(response.data.map(b => ({ ...b, id: b._id })));
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  const fetchExpenses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/expenses");
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, []);

  const handleAddBudget = async (newBudget) => {
    try {
      await axios.post('http://localhost:5000/api/budgets', newBudget);
      fetchBudgets();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  };

  const handleEditBudget = async (updatedBudget) => {
    try {
      await axios.put(`http://localhost:5000/api/budgets/${updatedBudget.id}`, updatedBudget);
      fetchBudgets();
      setEditingBudget(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error editing budget:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!id) return;
    try {
      await axios.delete(`http://localhost:5000/api/budgets/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const handleMoreOptionsClick = (event, budget) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX - 25,
    });
    setSelectedBudget(budget);
    setShowPopup(true);
  };

  // Calculate total spent per category
  const spentMap = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) acc[expense.category] = 0;
    acc[expense.category] += expense.amount;
    return acc;
  }, {});

  const handleGenerateReport = () => {
    const filtered = selectedPeriod === 'All'
      ? budgets
      : budgets.filter(b => b.period.toLowerCase() === selectedPeriod.toLowerCase());

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Budget Report", 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Period: ${selectedPeriod}`, 105, 22, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

    const totalAmount = filtered.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = filtered.reduce((sum, b) => sum + (spentMap[b.category] || 0), 0);

    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    doc.setFontSize(10);
    doc.text(`Total Budgets: ${filtered.length}`, 14, 50);
    doc.text(`Total Amount: Rs.${totalAmount}.00`, 14, 60);
    doc.text(`Total Spent: Rs.${totalSpent}.00`, 14, 70);
    doc.text(`Total Remaining: Rs.${totalAmount - totalSpent}.00`, 14, 80);

    doc.setFontSize(14);
    doc.text("Budget Details", 14, 95);

    const tableData = filtered.map(b => [
      b.category,
      b.period,
      `Rs.${b.amount}.00`,
      `Rs.${spentMap[b.category] || 0}.00`,
      `Rs.${b.amount - (spentMap[b.category] || 0)}.00`
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['Category', 'Period', 'Amount', 'Spent', 'Remaining']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [54,162,235], textColor:255, fontStyle:'bold' },
      alternateRowStyles: { fillColor: [240,240,240] }
    });

    doc.save(`budget_report_${selectedPeriod.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('BudgetDash')} className="p-2 transition-colors rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          </div>
          <div className="flex gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <option value="All">All</option>
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-gray-900">Budget List</h2>
            <p className="text-sm text-gray-500">Manage your budget allocations across categories</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerateReport} className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <FileText className="w-5 h-5 mr-2" />
              Generate Report
            </button>
            <button onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }} className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              <Plus className="w-5 h-5 mr-2" />
              Add Budget
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {budgets
            .filter(b => selectedPeriod === 'All' || b.period.toLowerCase() === selectedPeriod.toLowerCase())
            .map((budget) => {
              const spent = spentMap[budget.category] || 0;
              const remaining = budget.amount - spent;
              return (
                <div key={budget.id} className="p-6 transition-shadow bg-gray-200 shadow-sm rounded-xl hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                        <p className="text-sm text-gray-500">{budget.period} Budget</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">Rs.{budget.amount}.00</p>
                        <p className="text-sm text-gray-500">Budget</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">Rs.{spent}.00</p>
                        <p className="text-sm text-gray-500">Spent</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-600">Rs.{remaining}.00</p>
                        <p className="text-sm text-gray-500">Remaining</p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={(e) => handleMoreOptionsClick(e, budget)}
                          ref={optionsButtonRef}
                          className="p-2 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                      <div
                        className="h-2 transition-all duration-500 ease-in-out bg-blue-600 rounded-full"
                        style={{ width: `${(spent / budget.amount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {showPopup && selectedBudget && (
          <BudgetOptionsPopup
            onEdit={() => {
              setEditingBudget(selectedBudget);
              setIsModalOpen(true);
              setShowPopup(false);
            }}
            onDelete={() => {
              handleDeleteBudget(selectedBudget.id);
              setShowPopup(false);
            }}
            onClose={() => setShowPopup(false)}
            position={popupPosition}
          />
        )}

        {isModalOpen && (
          <AddBudgetModal
            onSubmit={editingBudget ? handleEditBudget : handleAddBudget}
            onClose={() => {
              setIsModalOpen(false);
              setEditingBudget(null);
            }}
            initialData={editingBudget}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetDetails;
