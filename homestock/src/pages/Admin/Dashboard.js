import React, { useState, useEffect } from "react";
import { Bell, Mail, Globe, Home as HomeIcon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Inventory from "./inventory/Inventory";
import Grocery_ist from "./grocery_ist/grocery_ist";
import Budgeting from "./budgeting/budgeting";
import Iot from "./iot/iot";
import AdminHome from "./adminhome";
import Allusers from "../Login/Allusers";
import backgroundImage from "../../../src/assets/map2.png";
import Logo from "../../../src/assets/2.jpg";
import {
  FaHome,
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaUser,
  FaMicrochip,
} from "react-icons/fa";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [isConnected, setIsConnected] = useState(false);
  const [pulse, setPulse] = useState(false);
  const navigate = useNavigate();

  // IoT connection simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected((prev) => !prev);
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="h-screen flex bg-gray-900">
      {/* Sidebar with enhanced dark theme */}
      <aside className="w-64 h-screen fixed left-0 top-0 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl p-6 border-r border-gray-700">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-indigo-500 shadow-lg">
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                backgroundImage: `url(${Logo})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          </div>
          <h2 className="text-xl font-semibold text-white">Home Stock</h2>
          <p className="text-sm text-gray-300">Smart Home System</p>
        </div>

        {/* IoT Status Indicator */}


        <ul className="space-y-2">
          {[
            { name: "Home", icon: <FaHome className="w-5 h-5" /> },
            { name: "Inventory", icon: <FaBox className="w-5 h-5" /> },
            { name: "Grocery", icon: <FaShoppingCart className="w-5 h-5" /> },
            { name: "Budgeting", icon: <FaDollarSign className="w-5 h-5" /> },
            { name: "Allusers", icon: <FaUser className="w-5 h-5" /> },
          ].map((tab) => (
            <li
              key={tab.name}
              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all duration-300 ${
                activeTab === tab.name.toLowerCase()
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-medium shadow-lg"
                  : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab.name.toLowerCase())}
            >
              {tab.icon}
              <span>{tab.name}</span>
              {tab.name === "IoT" && (
                <span
                  className={`ml-auto h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  } ${
                    pulse && tab.name.toLowerCase() === activeTab
                      ? "animate-pulse"
                      : ""
                  }`}
                ></span>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Enhanced Navbar with glass effect */}
        <nav className="bg-gray-800/80 backdrop-blur-md text-white p-4 flex justify-between items-center shadow-lg border-b border-gray-700">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-indigo-300 to-indigo-100 bg-clip-text text-transparent">
              Home Stock Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Globe className="w-5 h-5 cursor-pointer text-gray-300 hover:text-indigo-300 transition-colors" />
              <div className="absolute hidden group-hover:block -right-2 top-full mt-2 w-48 bg-gray-800 rounded-md shadow-xl z-10 p-2 border border-gray-700">
                <p className="text-sm text-gray-300 p-2">Global Settings</p>
              </div>
            </div>

            <div className="relative group">
              <Mail className="w-5 h-5 cursor-pointer text-gray-300 hover:text-indigo-300 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-xs px-1.5 py-0.5 rounded-full">
                2
              </span>
            </div>

            <div className="relative group">
              <Bell className="w-5 h-5 cursor-pointer text-gray-300 hover:text-indigo-300 transition-colors" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-xs px-1.5 py-0.5 rounded-full">
                3
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 rounded-md text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        </nav>

        {/* Main content area with subtle animation */}
        <main className="flex-1 bg-gradient-to-br overflow-y-auto">
          <div
            className={`bg-gray-800/80 rounded-xl p-6 shadow-2xl border border-gray-700 transition-all duration-300 ${
              activeTab === "iot" ? "ring-2 ring-indigo-500/30" : ""
            }`}
          >
            {activeTab === "home" && <AdminHome />}
            {activeTab === "inventory" && <Inventory />}
            {activeTab === "grocery" && <Grocery_ist />}
            {activeTab === "budgeting" && <Budgeting />}
            {activeTab === "allusers" && <Allusers />}
          </div>
        </main>
      </div>

      {/* Add these styles to your CSS or use a CSS-in-JS solution */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes float-delay {
          0% {
            transform: translateY(-10px);
          }
          50% {
            transform: translateY(5px);
          }
          100% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: float-delay 7s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
