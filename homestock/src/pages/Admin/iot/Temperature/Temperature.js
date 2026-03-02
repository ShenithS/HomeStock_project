import React, { useState, useEffect } from "react";
import {
  FaTemperatureHigh,
  FaFan,
  FaFireExtinguisher,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { WiHumidity } from "react-icons/wi";
import axios from "axios";
import TmpChart from "../Charts/TmpChart";
import backgroundImage from "../../../../assets/g2.png";
import GasDisplay from "../Temperature/GasDisplay";
function Temperature({ temperaturePercentage }) {
  // State management
  const [controls, setControls] = useState({
    temperature: false,
    fan: false,
    fireAlarm: false,
  });
  const [sensorData, setSensorData] = useState({
    temperature: "--",
    humidity: "--",
    gas: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Color thresholds
  const getStatusColor = (percentage) => {
    if (percentage > 80) return "bg-red-500";
    if (percentage > 50) return "bg-amber-400";
    return "bg-emerald-500";
  };

  const getGasStatus = (value) => {
    if (!value) return { text: "Loading...", color: "text-gray-400" };
    if (value >= 2000) return { text: "Danger", color: "text-red-500" };
    if (value >= 1000) return { text: "Moderate", color: "text-amber-400" };
    if (value >= 300) return { text: "Low", color: "text-blue-400" };
    return { text: "Clean", color: "text-green-500" };
  };

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tempRes, gasRes] = await Promise.all([
          axios.get("http://192.168.229.103/temperature"),
          axios.get("http://192.168.229.103/gas"),
        ]);

        setSensorData({
          temperature: tempRes.data.temperature || "--",
          humidity: tempRes.data.humidity || "--",
          gas: gasRes.data.gas_value,
        });
        setError(null);
      } catch (err) {
        setError("Failed to fetch sensor data");
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Toggle handler
  const toggleControl = (control) => {
    setControls((prev) => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  const gasStatus = getGasStatus(sensorData.gas);

  return (
    <div className={`space-y-8 ${darkMode ? "dark" : ""}`}>
      {/* Dark/Light mode toggle button */}
      <div className="flex justify-end">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${
            darkMode
              ? "bg-gray-700 text-yellow-300"
              : "bg-gray-200 text-gray-700"
          }`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GasDisplay />

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
          <TmpChart darkMode={darkMode} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-6 text-white shadow-xl dark:from-red-700 dark:to-red-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <FaTemperatureHigh className="mr-3" /> Temperature
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
              {sensorData.temperature > 30
                ? "High"
                : sensorData.temperature > 20
                ? "Normal"
                : "Low"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold mb-2">
              {sensorData.temperature}
              <span className="text-2xl">°C</span>
            </p>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full ${getStatusColor(temperaturePercentage)}`}
                style={{ width: `${temperaturePercentage}%` }}
              />
            </div>
            <p className="text-sm mt-2 opacity-80">Max: 40°C</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl dark:from-blue-700 dark:to-blue-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center">
              <WiHumidity className="text-2xl mr-3" /> Humidity
            </h3>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
              {sensorData.humidity > 70
                ? "High"
                : sensorData.humidity > 40
                ? "Normal"
                : "Low"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold mb-2">
              {sensorData.humidity}
              <span className="text-2xl">%</span>
            </p>
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-blue-300"
                style={{
                  width:
                    sensorData.humidity !== "--"
                      ? `${((sensorData.humidity - 30) / 50) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <p className="text-sm mt-2 opacity-80">Range: 30-80%</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 text-white shadow-xl dark:from-gray-600 dark:to-gray-700">
          <h3 className="text-xl font-semibold mb-6">Device Controls</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaTemperatureHigh className="mr-3 text-red-300" />
                <span>Cooling System</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={controls.temperature}
                  onChange={() => toggleControl("temperature")}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFan className="mr-3 text-blue-300" />
                <span>Ventilation Fan</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={controls.fan}
                  onChange={() => toggleControl("fan")}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaFireExtinguisher className="mr-3 text-red-400" />
                <span>Fire Alarm</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={controls.fireAlarm}
                  onChange={() => toggleControl("fireAlarm")}
                />
                <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded dark:bg-red-900 dark:bg-opacity-20 dark:text-red-200">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default Temperature;
