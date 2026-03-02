import React, { useEffect, useState } from "react";
import axios from "axios";
import { WiFire } from "react-icons/wi";
import { FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

const GasDisplay = () => {
  const [gasValue, setGasValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const getGasLevel = (ppm) => {
    if (ppm === undefined || ppm === null) return "LOADING";
    if (ppm > 1000) return "DANGER";
    if (ppm > 500) return "WARNING";
    return "NORMAL";
  };

  const gasLevel = getGasLevel(gasValue);

  const levelColors = {
    DANGER: "bg-red-500",
    WARNING: "bg-yellow-500",
    NORMAL: "bg-green-500",
    LOADING: "bg-gray-500",
  };

  const levelTextColors = {
    DANGER: "text-red-500",
    WARNING: "text-yellow-500",
    NORMAL: "text-green-500",
    LOADING: "text-gray-500",
  };

  const levelIcons = {
    DANGER: <FaExclamationTriangle className="mr-1" />,
    WARNING: <FaExclamationTriangle className="mr-1" />,
    NORMAL: <FaCheckCircle className="mr-1" />,
    LOADING: <FaClock className="mr-1" />,
  };

  const fetchGasData = async () => {
    try {
      const response = await axios.get("http://192.168.229.103/gas");
      setGasValue(response.data.gas_value); // Adjusted to match your API response
      setLastUpdated(new Date());
      setError(null);
    } catch (error) {
      console.error("Error fetching gas data:", error);
      setError("Failed to fetch gas data");
      setGasValue(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGasData();

    const interval = setInterval(fetchGasData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center">
        <WiFire className="mr-2 text-3xl" /> Gas Concentration Monitor
      </h2>

      <div className="bg-gray-700 p-6 rounded-lg">
        {error ? (
          <div className="text-center py-4 text-red-400">
            <p className="font-medium">{error}</p>
            <button
              onClick={fetchGasData}
              className="mt-2 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="animate-pulse flex flex-col items-center py-4">
            <div className="h-8 w-32 bg-gray-600 rounded mb-2"></div>
            <div className="h-6 w-24 bg-gray-600 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-300">Current Reading</p>
                <p className="text-3xl font-bold">
                  {gasValue !== null ? gasValue.toFixed(2) : "N/A"}{" "}
                  <span className="text-lg">ppm</span>
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full flex items-center ${levelColors[gasLevel]}`}
              >
                {levelIcons[gasLevel]}
                <span className="font-medium ml-1">{gasLevel}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>0 ppm</span>
                <span>1000 ppm</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full ${levelColors[gasLevel]}`}
                  style={{
                    width: `${Math.min(100, ((gasValue || 0) / 1000) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-600/50 p-3 rounded-lg">
                <p className="text-gray-300">Gas Concentration</p>
                <p className="text-xl font-mono">
                  {gasValue !== null ? gasValue.toFixed(2) : "N/A"} ppm
                </p>
              </div>
              <div className="bg-gray-600/50 p-3 rounded-lg">
                <p className="text-gray-300">Status</p>
                <p
                  className={`text-xl flex items-center ${levelTextColors[gasLevel]}`}
                >
                  {levelIcons[gasLevel]}
                  {gasLevel === "DANGER"
                    ? " Danger"
                    : gasLevel === "WARNING"
                    ? " Warning"
                    : gasLevel === "LOADING"
                    ? " Loading"
                    : " Normal"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default GasDisplay;
