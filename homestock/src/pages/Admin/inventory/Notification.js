import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    "New message received",
    "System update available",
    "Your profile has been viewed",
    "Reminder: Meeting at 3 PM",
  ]);

  const toggleNotification = () => {
    setIsOpen(!isOpen);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className=" absolute inline-block font-sans right-11  top-20">
      <button
        className="relative p-2 text-2xl rounded-full transition-all duration-300 ease-in-out
                   bg-gray-50 text-indigo-600 shadow-sm hover:bg-gray-200 hover:scale-110
                   active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={toggleNotification}
        aria-label="Notifications"
      >
        <FaBell className="text-red-700 text-4xl relative  " />
        {notifications.length > 0 && (
          <span
            className="absolute top-0 right-0 flex items-center justify-center
                          w-5 h-5 text-xs text-white bg-red-500 rounded-full"
          >
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg
                       border border-gray-200 overflow-hidden z-50 animate-fade-in"
        >
          <div className="flex justify-between items-center p-3 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <button
              className="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
              onClick={clearNotifications}
            >
              Clear All
            </button>
          </div>

          {/* Notification List */}
          {notifications.length > 0 ? (
            <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {notifications.map((message, index) => (
                <li
                  key={index}
                  className="p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-indigo-500">
                      •
                    </div>
                    <div className="ml-2 text-sm text-gray-700">{message}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notification;
