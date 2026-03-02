import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { WiThermometer, WiHumidity, WiDaySunny, WiRain } from "react-icons/wi";
import axios from "axios";

function TmpTracker() {
  const [data, setData] = useState([]);
  const [temperature, setTemperature] = useState(0);
  const [humidity, setHumidity] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://92.168.229.103/temperature");
      setTemperature(response.data.temperature);
      setHumidity(response.data.humidity);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData();
    }, 5000);

    fetchData();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (data.length >= 10) {
      setData((prevData) => prevData.slice(1));
    }
    setData((prevData) => [
      ...prevData,
      {
        name: new Date().toLocaleTimeString(),
        Temperature: temperature,
        Humidity: humidity,
      },
    ]);
  }, [temperature, humidity]);

  // Determine weather condition based on temperature and humidity
  const getWeatherCondition = () => {
    if (temperature > 30) return "hot";
    if (temperature < 15) return "cold";
    if (humidity > 70) return "rainy";
    return "sunny";
  };

  const weatherCondition = getWeatherCondition();
  const weatherIcons = {
    hot: <WiThermometer className="text-orange-500 text-4xl" />,
    cold: <WiThermometer className="text-blue-300 text-4xl" />,
    rainy: <WiRain className="text-blue-400 text-4xl" />,
    sunny: <WiDaySunny className="text-yellow-400 text-4xl" />,
  };

  return (
    <div className="relative h-96 p-6 rounded-lg bg-gray-900 shadow-xl border border-gray-700 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 10 + 5 + "px",
              height: Math.random() * 10 + 5 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            }}
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-6 text-center text-gray-100">
        Environment Monitor
      </h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                {weatherIcons[weatherCondition]}
                <span className="text-gray-300 capitalize">
                  {weatherCondition}
                </span>
              </div>
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                <WiThermometer className="text-red-400 text-3xl" />
                <span className="text-gray-100">
                  <span className="font-bold text-red-400">
                    {temperature}°C
                  </span>
                </span>
              </div>

              <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg">
                <WiHumidity className="text-blue-400 text-3xl" />
                <span className="text-gray-100">
                  <span className="font-bold text-blue-400">{humidity}%</span>
                </span>
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" tick={{ fill: "#aaa" }} stroke="#666" />
                <YAxis tick={{ fill: "#aaa" }} stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333",
                    borderColor: "#555",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: "20px",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Temperature"
                  stroke="#FF5733"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Humidity"
                  stroke="#3498DB"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-center text-gray-400 text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
}

export default TmpTracker;
