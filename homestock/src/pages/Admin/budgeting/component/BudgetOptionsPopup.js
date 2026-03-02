import React from 'react';

const BudgetOptionsPopup = ({ onEdit, onDelete, onClose, position }) => {
  return (
    <div 
      className="absolute z-10 p-4 bg-white border rounded shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button onClick={onEdit} className="block w-full p-2 text-left hover:bg-gray-100">
        Edit
      </button>
      <button onClick={onDelete} className="block w-full p-2 text-left hover:bg-gray-100">
        Delete
      </button>
      <button onClick={onClose} className="block w-full p-2 text-left hover:bg-gray-100">
        Cancel
      </button>
    </div>
  );
};

export default BudgetOptionsPopup;