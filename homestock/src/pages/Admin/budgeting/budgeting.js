import React, { useState } from 'react';
import BudgetDash from './BadgetDash';
import BudgetDetails from './BudgetDetails';
import ExpensesList from './ExpensesList';

const Budgeting = () => {  // Renamed to start with uppercase
  const [activeTab, setActiveTab] = useState('BudgetDash'); 
  return (
    <div>
      {activeTab === 'BudgetDash' ? (
        <BudgetDash setActiveTab={setActiveTab} />
      ) : activeTab === 'BudgetDetails' ? (
        <BudgetDetails setActiveTab={setActiveTab} />
      ) : (
        <ExpensesList setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

export default Budgeting;
