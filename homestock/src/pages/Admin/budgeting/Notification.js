// In Notification.js
import React, { useState, useEffect } from "react";
import { FaBell, FaTimes, FaShoppingCart } from "react-icons/fa";
import axios from "axios";

function Notification({ onLowStockItemClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/groceries/archived"
        );
        const archivedItems = res.data;

        // Only show notifications for items archived in the last 7 days
        const recentItems = archivedItems.filter((item) => {
          const archiveDate = new Date(item.updatedAt || item.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return archiveDate > weekAgo;
        });

        setNotifications(
          recentItems.map((item) => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            category: item.category,
            date: new Date(item.updatedAt || item.createdAt).toLocaleString(),
            type: item.completed ? "purchased" : "other",
          }))
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up polling for new notifications every 5 minutes
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);
  }, []);

  const toggleNotification = () => setIsOpen(!isOpen);

  const clearNotifications = async () => {
    try {
      // Optional: Mark notifications as read in backend
      // await axios.post("/api/notifications/mark-as-read");
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        className="relative p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
        onClick={toggleNotification}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <FaBell className="text-red-600 text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-xl z-50 border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center px-4 py-3 bg-red-600 text-white rounded-t-md">
            <h3 className="text-sm font-semibold">
              Notifications ({notifications.length})
            </h3>
            <div className="flex space-x-2">
              {notifications.length > 0 && (
                <button
                  className="text-xs hover:underline"
                  onClick={clearNotifications}
                >
                  Clear All
                </button>
              )}
              <button
                className="text-xs hover:underline"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500">
                {error}
              </div>
            ) : notifications.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {notifications.map((note) => (
                  <li
                    key={note.id}
                    className="px-4 py-3 hover:bg-gray-50 text-sm text-gray-800 relative"
                  >
                    <button
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      onClick={() => removeNotification(note.id)}
                      aria-label="Remove notification"
                    >
                      <FaTimes size={12} />
                    </button>
                    <div className="flex items-start">
                      {note.type === "purchased" && (
                        <FaShoppingCart className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium text-red-600">
                          {note.name}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {note.type === "purchased"
                            ? `Purchased on: ${note.date}`
                            : `Added on: ${note.date}`}
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Qty: {note.quantity}</span>
                          <span>Category: {note.category || "None"}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                No new notifications
              </div>
            )}
          </div>

          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 rounded-b-md border-t">
            Showing recent activity (last 7 days)
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
