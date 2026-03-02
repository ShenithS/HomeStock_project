import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WarningMessage = () => {
  const [alert, setAlert] = useState({
    message: "",
    type: null, // 'gas' or 'temp'
    active: false,
    timestamp: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState("");

  const fetchWarning = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://your-esp32-ip-address/warning");
      const data = await response.json();
      const now = new Date();
      setLastChecked(now.toLocaleTimeString());

      if (data.warning_message) {
        const type = data.warning_message.includes("Gas") ? "gas" : "temp";
        setAlert({
          message: data.warning_message,
          type,
          active: true,
          timestamp: now,
        });
      } else {
        setAlert((prev) => ({
          ...prev,
          active: false,
          message: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching warning:", error);
      setAlert((prev) => ({
        ...prev,
        active: false,
        message: "",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarning();
    const interval = setInterval(fetchWarning, 3000);
    return () => clearInterval(interval);
  }, []);

  const getAlertStyles = () => {
    const base =
      "bg-white/95 backdrop-blur-sm border-l-4 p-4 rounded-xl shadow-lg flex items-start space-x-3";

    if (!alert.active) return `${base} border-green-500`;
    return alert.type === "gas"
      ? `${base} border-red-500`
      : `${base} border-orange-500`;
  };

  const getIcon = () => {
    if (!alert.active) {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    }

    return alert.type === "gas" ? (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 18.657A8 8 0 016.343 7.343M7 17v.01M17 7v.01M12 3a9 9 0 11-9 9 9 9 0 019-9z"
        />
      </svg>
    ) : (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    );
  };

  const getPingColor = () => {
    if (!alert.active) return "bg-green-400";
    return alert.type === "gas" ? "bg-red-400" : "bg-orange-400";
  };

  const getTitle = () => {
    if (!alert.active) return "All systems operational";
    return alert.type === "gas" ? "Gas Alert" : "Temperature Alert";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-xs">
      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white/90 border border-gray-200 text-gray-600 p-4 rounded-xl shadow-lg flex items-center space-x-3"
          ></motion.div>
        ) : (
          <motion.div
            key={alert.active ? "alert" : "clear"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={getAlertStyles()}
          >
            <div className="relative flex-shrink-0 pt-0.5">
              {alert.active && (
                <div
                  className={`absolute animate-ping w-5 h-5 rounded-full opacity-75 ${getPingColor()}`}
                ></div>
              )}
              <div
                className={`relative p-1 rounded-full ${
                  alert.active
                    ? alert.type === "gas"
                      ? "bg-red-100 text-red-500"
                      : "bg-orange-100 text-orange-500"
                    : "bg-green-100 text-green-500"
                }`}
              >
                {getIcon()}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{getTitle()}</h3>

              {alert.active ? (
                <>
                  <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {alert.timestamp?.toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() =>
                        setAlert((prev) => ({ ...prev, active: false }))
                      }
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Acknowledge
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-gray-600">
                    All parameters within normal range
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Last checked: {lastChecked || "Just now"}
                    </span>
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WarningMessage;
