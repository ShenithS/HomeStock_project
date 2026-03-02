import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaTimes,
  FaExclamationTriangle,
  FaPrint,
} from "react-icons/fa";
import axios from "axios";

function Notification({ onLowStockItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory");
        const lowStock = response.data.filter(
          (item) => Number(item.quantity) < 5
        );
        setLowStockItems(lowStock);

        if (lowStock.length > 0) {
          setNotifications((prev) => [
            {
              id: Date.now(),
              message: `${lowStock.length} low stock item(s) need attention`,
              isAlert: true,
              isLowStock: true,
            },
            ...prev,
          ]);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
      }
    };

    fetchData();
  }, []);

  const toggleNotificationPanel = () => {
    setIsOpen(!isOpen);
  };

  const toggleLowStockModal = () => {
    setShowLowStockModal(!showLowStockModal);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  return (
    <div className="absolute right-11 z-50 top-24">
      <button
        onClick={toggleNotificationPanel}
        className={`text-3xl relative ${
          notifications.some((n) => n.isAlert)
            ? "text-red-700 animate-pulse hover:animate-bounce"
            : "text-gray-600"
        }`}
      >
        <FaBell className="text-red-700 text-4xl relative" />
        {notifications.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 text-white text-xs 
                         rounded-full h-5 w-5 flex items-center justify-center ${
                           notifications.some((n) => n.isAlert)
                             ? "bg-red-600"
                             : "bg-gray-500"
                         }`}
          >
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg 
                       border border-gray-200 z-50"
        >
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Notifications</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-3 border-b last:border-b-0 flex items-start cursor-pointer
                      ${
                        notification.isAlert
                          ? "bg-red-50 text-red-800 hover:bg-red-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    onClick={() => {
                      if (notification.isLowStock) {
                        setShowLowStockModal(true);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <span
                      className={`mr-2 mt-0.5 ${
                        notification.isAlert ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {notification.isLowStock ? (
                        <FaExclamationTriangle />
                      ) : notification.isAlert ? (
                        "⚠️"
                      ) : (
                        "✓"
                      )}
                    </span>
                    <span>{notification.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}

      {/* Low Stock Modal */}
      {showLowStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Low Stock Items
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full"
                  title="Print Low Stock List"
                >
                  <FaPrint />
                </button>
                <button
                  onClick={toggleLowStockModal}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {lowStockItems.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <li
                      key={item._id}
                      className="py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        onLowStockItemClick(item.name);
                        toggleLowStockModal();
                      }}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                            {item.quantity} left
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Expires:{" "}
                            {item.expiryDate
                              ? item.expiryDate.split("T")[0]
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No low stock items found</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={toggleLowStockModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      {isPrinting && (
        <div className="hidden print:block">
          <h1 className="text-2xl font-bold mb-4">Low Stock Report</h1>
          <p className="mb-4">Generated on: {new Date().toLocaleString()}</p>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-left">Item Name</th>
                <th className="border p-2 text-left">Category</th>
                <th className="border p-2 text-left">Quantity</th>
                <th className="border p-2 text-left">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item._id} className="border">
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.category}</td>
                  <td className="border p-2 text-red-600">{item.quantity}</td>
                  <td className="border p-2">
                    {item.expiryDate ? item.expiryDate.split("T")[0] : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8 text-sm text-gray-500">
            <p>
              This is an automated report. Please restock the items marked in
              red.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
