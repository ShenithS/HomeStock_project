import React, { useState, useEffect } from "react";
import Temperature from "./Temperature/Temperature";
import ScannerItem from "./ScannerItems/ScannerItems";
import ItemTep from "./Temperature/itemTep";
import War from "../iot/Messages/WarningMessage";
import {
  FaThermometerHalf,
  FaBox,
  FaBarcode,
  FaToggleOn,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Iot() {
  const [activeTab, setActiveTab] = useState("temperature");
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [pulse, setPulse] = useState(false);

  // Simulate IoT connection status
  useEffect(() => {
    const statuses = ["connecting", "connected", "warning", "error"];
    let current = 0;

    const interval = setInterval(() => {
      setConnectionStatus(statuses[current]);
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
      current = (current + 1) % statuses.length;
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: "temperature",
      icon: <FaThermometerHalf />,
      label: "Temperature",
      component: (
        <Temperature
          currentTemperature={22}
          maxTemperature={40}
          temperaturePercentage={(22 / 40) * 100}
        />
      ),
    },
    {
      id: "ItemTep",
      icon: <FaBox />,
      label: "Inventory",
      component: <ItemTep />,
    },
    {
      id: "scannerItem",
      icon: <FaBarcode />,
      label: "Scanner",
      component: <ScannerItem />,
    },
  ];

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "All systems normal";
      case "warning":
        return "Minor issues detected";
      case "error":
        return "Connection error";
      default:
        return "Connecting to devices...";
    }
  };

  return (
    <main className="bg-gray-900 bg-opacity-90 p-6 rounded-xl border border-gray-800 shadow-2xl">
      {/* Connection Status Bar */}
      <div
        className={`relative mb-6 p-3 rounded-lg ${getStatusColor()} bg-opacity-20 border ${getStatusColor()} border-opacity-50 transition-all duration-500`}
      >
        <div className="flex items-center">
          <span
            className={`relative flex h-3 w-3 ${pulse ? "animate-ping" : ""}`}
          >
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusColor()}`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${getStatusColor()}`}
            ></span>
          </span>
          <span className="ml-2 text-sm font-medium text-gray-200">
            {getStatusText()}
          </span>
          <span className="ml-auto text-xs text-gray-400">IoT Network</span>
        </div>
      </div>

      {/* Animated Tab Navigation */}
      <div className="flex justify-center sm:justify-start mb-8">
        <div className="inline-flex bg-gray-800 rounded-xl p-1 shadow-lg border border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {activeTab === tab.id && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                {tab.icon}
                <span className="hidden sm:inline ml-2">{tab.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Warning Message with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <War />
        <div className="h-px w-full my-6 bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </motion.div>

      {/* Animated Content Area */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {tabs.find((tab) => tab.id === activeTab)?.component}
        </motion.section>
      </AnimatePresence>

      {/* Floating IoT Elements */}
      <div className="fixed top-1/4 left-1/4 w-8 h-8 rounded-full bg-blue-500/10 animate-float pointer-events-none"></div>
      <div className="fixed top-1/3 right-1/3 w-6 h-6 rounded-full bg-green-500/10 animate-float-delay pointer-events-none"></div>
      <div className="fixed bottom-1/4 right-1/4 w-10 h-10 rounded-full bg-indigo-500/10 animate-float pointer-events-none"></div>
    </main>
  );
}

export default Iot;
