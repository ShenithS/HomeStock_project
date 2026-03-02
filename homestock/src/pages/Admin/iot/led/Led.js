import React, { useState } from "react";
import axios from "axios";

const ESP32LEDControl = () => {
  const [status, setStatus] = useState("");

  const handleLED = async (action) => {
    try {
      const response = await axios.get(`http://192.168.181.103/led/${action}`);
      setStatus(response.data);
    } catch (error) {
      setStatus("Connection Error");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4">ESP32 LED Controller</h2>
      <div className="space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          onClick={() => handleLED("on")}
        >
          Turn On
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
          onClick={() => handleLED("off")}
        >
          Turn Off
        </button>
      </div>
      <p className="text-lg">LED Status: {status}</p>
    </div>
  );
};

export default ESP32LEDControl;
