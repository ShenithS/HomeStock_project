import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSort,
  FaFileExport,
} from "react-icons/fa";
import { RiCalendarTodoFill } from "react-icons/ri";
import axios from "axios";
import Notification from "../inventory/Notification";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable"; // Register ChartJS components

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Inventory = () => {
  // All your existing state declarations remain exactly the same
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [barcodeOptions, setBarcodeOptions] = useState([]);
  const [expiryDateOptions, setExpiryDateOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    itemNumber: "",
    name: "",
    category: "",
    quantity: "",
    manufactureDate: "",
    expiryDate: "",
    temperature: "",
    status: "Available",
  });
  const [editItem, setEditItem] = useState(null);
  const [warning, setWarning] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  // All your existing useEffect hooks remain exactly the same
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/inventory");
        setItems(response.data);
        setLowStockItems(
          response.data.filter((item) => Number(item.quantity) < 5)
        );
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    const fetchBarcodes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/barcodes");
        setBarcodeOptions(
          response.data.barcodes.map((barcode) => ({
            value: barcode.code,
            label: barcode.code,
          }))
        );

        const uniqueExpiryDates = new Set();
        response.data.barcodes.forEach((barcode) => {
          const cleanedBarcode = barcode.code.replace(/[^0-9]/g, "");
          if (cleanedBarcode.length >= 10) {
            const day = cleanedBarcode.slice(4, 6);
            const month = cleanedBarcode.slice(2, 4);
            const year = cleanedBarcode.slice(6, 10);
            uniqueExpiryDates.add(`${year}-${month}-${day}`);
          }
        });
        setExpiryDateOptions(
          Array.from(uniqueExpiryDates).map((date) => ({
            value: date,
            label: date,
          }))
        );
      } catch (error) {
        console.error("Error fetching barcodes:", error);
      }
    };

    fetchItems();
    fetchBarcodes();
  }, []);

  // Prepare data for the chart
  const getChartData = () => {
    // Group items by category and calculate total quantity for each category
    const categoryData = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = 0;
      }
      acc[item.category] += parseInt(item.quantity);
      return acc;
    }, {});

    const categories = Object.keys(categoryData);
    const quantities = Object.values(categoryData);

    return {
      labels: categories,
      datasets: [
        {
          label: "Quantity in Stock",
          data: quantities,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Inventory by Category",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Quantity",
        },
      },
      x: {
        title: {
          display: true,
          text: "Category",
        },
      },
    },
  };

  // Function to generate PDF
  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    // ====== STYLE CONSTANTS ======
    const PRIMARY_COLOR = [54, 162, 235]; // Blue
    const LIGHT_GRAY = [245, 245, 245];
    const TEXT_COLOR = [33, 33, 33];
    const MUTED = [120, 120, 120];

    // ====== HEADER ======
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("INVENTORY REPORT", 105, 18, { align: "center" });

    // ====== METADATA ======
    const today = new Date();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(`Generated on: ${today.toLocaleDateString()}`, 105, 28, {
      align: "center",
    });

    // ====== SUMMARY ======
    const summaryY = 38;
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_COLOR);
    doc.text("Summary", 14, summaryY);

    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(`Total Items: ${items.length}`, 14, summaryY + 8);
    doc.text(`Low Stock Items: ${lowStockItems.length}`, 14, summaryY + 16);
    doc.text(
      `Categories: ${[...new Set(items.map((item) => item.category))].length}`,
      14,
      summaryY + 24
    );

    // ====== INVENTORY TABLE ======
    const tableY = summaryY + 34;
    const tableData = items.map((item) => [
      item.itemNumber,
      item.name,
      item.category,
      item.quantity,
      item.manufactureDate.split("T")[0],
      item.expiryDate.split("T")[0],
      item.temperature,
      item.status,
    ]);

    autoTable(doc, {
      startY: tableY,
      head: [
        [
          "Item #",
          "Name",
          "Category",
          "Qty",
          "Mfg Date",
          "Expiry Date",
          "Temp",
          "Status",
        ],
      ],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: PRIMARY_COLOR,
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        halign: "center",
        fontSize: 9,
        textColor: TEXT_COLOR,
      },
      alternateRowStyles: {
        fillColor: LIGHT_GRAY,
      },
      margin: { left: 14, right: 14 },
    });

    // ====== FOOTER ======
    const footerY = 285;
    doc.setDrawColor(200);
    doc.line(14, footerY, 196, footerY);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("Confidential - Inventory System", 14, footerY + 5);
    doc.text("Page 1 of 1", 196, footerY + 5, { align: "right" });

    // ====== SAVE PDF ======
    const fileName = `inventory_report_${today.toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };
  // All your existing handler functions remain exactly the same
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showForm) {
      setNewItem({
        itemNumber: "",
        name: "",
        category: "",
        quantity: "",
        manufactureDate: "",
        expiryDate: "",
        temperature: "",
        status: "Available",
      });
      setEditItem(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleAddItem = async () => {
    try {
      if (!newItem.itemNumber.trim()) {
        setWarning("Item Number is required.");
        setTimeout(() => setWarning(""), 3000);
        return;
      }

      if (!newItem.name || !newItem.category || !newItem.quantity) {
        setWarning("Please fill all required fields.");
        setTimeout(() => setWarning(""), 3000);
        return;
      }

      if (editItem && editItem._id) {
        await axios.put(
          `http://localhost:5000/api/inventory/${editItem._id}`,
          newItem
        );
        setWarning("Item updated successfully!");
      } else {
        await axios.post("http://localhost:5000/api/inventory", newItem);
        setWarning("Item added successfully!");
      }

      setTimeout(() => setWarning(""), 3000);
      setShowForm(false);
      resetForm();

      const response = await axios.get("http://localhost:5000/api/inventory");
      setItems(response.data);
      setLowStockItems(
        response.data.filter((item) => Number(item.quantity) < 5)
      );
    } catch (error) {
      console.error("Error:", error);
      setWarning(
        error.response?.data?.message || "An error occurred. Please try again."
      );
      setTimeout(() => setWarning(""), 3000);
    }
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setNewItem({
      ...item,
      manufactureDate: item.manufactureDate.split("T")[0],
      expiryDate: item.expiryDate.split("T")[0],
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      if (!id) {
        console.error("Item ID is missing");
        return;
      }
      await axios.delete(`http://localhost:5000/api/inventory/${id}`);
      const response = await axios.get("http://localhost:5000/api/inventory");
      setItems(response.data);
      setLowStockItems(
        response.data.filter((item) => Number(item.quantity) < 5)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
      setWarning("Error deleting item. Please try again.");
      setTimeout(() => setWarning(""), 3000);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const dateA = new Date(a.expiryDate);
    const dateB = new Date(b.expiryDate);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const resetForm = () => {
    setNewItem({
      itemNumber: "",
      name: "",
      category: "",
      quantity: "",
      manufactureDate: "",
      expiryDate: "",
      temperature: "",
      status: "Available",
    });
    setEditItem(null);
  };

  const toggleLowStockModal = () => {
    setShowLowStockModal(!showLowStockModal);
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <Notification />
      <div className="max-w-7xl mx-auto mt-10 bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your inventory items efficiently
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="relative flex items-center bg-blue-50 rounded-lg px-3 py-2">
                <RiCalendarTodoFill className="text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Add this section below the header and above the chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Items Card */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {items.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaPlus />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">+5% from last month</p>
            </div>

            {/* Low Stock Card */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {lowStockItems.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FaTimes />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Items below 5 in quantity
              </p>
            </div>

            {/* Categories Card */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {[...new Set(items.map((item) => item.category))].length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaSort />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Unique categories</p>
            </div>

            {/* Expiring Soon Card */}
            <div className="bg-white p-4 rounded-xl shadow border-l-4 border-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Expiring Soon
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      items.filter((item) => {
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        const diffTime = expiryDate - today;
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );
                        return diffDays <= 7;
                      }).length
                    }
                  </p>
                </div>
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <RiCalendarTodoFill />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Within 7 days</p>
            </div>
          </div>

          {/* Add this section below your existing chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Expiry Alerts Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <RiCalendarTodoFill className="text-yellow-500" />
                Expiry Alerts
              </h3>
              <div className="space-y-3">
                {items
                  .filter((item) => {
                    const expiryDate = new Date(item.expiryDate);
                    const today = new Date();
                    const diffTime = expiryDate - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    return diffDays <= 30;
                  })
                  .sort(
                    (a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)
                  )
                  .slice(0, 5)
                  .map((item) => {
                    const expiryDate = new Date(item.expiryDate);
                    const today = new Date();
                    const diffTime = expiryDate - today;
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <div
                        key={item._id}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.category}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              diffDays <= 7
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {diffDays <= 0
                              ? "Expired"
                              : `${diffDays} days left`}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.expiryDate.split("T")[0]}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {items.filter((item) => {
                  const expiryDate = new Date(item.expiryDate);
                  const today = new Date();
                  const diffTime = expiryDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 30;
                }).length === 0 && (
                  <p className="text-center text-gray-500 py-4">
                    No items expiring soon
                  </p>
                )}
              </div>
            </div>

            {/* Recent Activity Section */}
            {/* Recent Activity Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {[...items]
                  .sort(
                    (a, b) =>
                      new Date(b.updatedAt || b.createdAt) -
                      new Date(a.updatedAt || a.createdAt)
                  ) // fixed here
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="mt-1 p-1 rounded-full bg-blue-100 text-blue-600">
                        {item.updatedAt ? (
                          <FaEdit size={12} />
                        ) : (
                          <FaPlus size={12} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.updatedAt ? "Updated" : "Added"} {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            item.updatedAt || item.createdAt
                          ).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Qty: {item.quantity} | Category: {item.category}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={toggleForm}
                >
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-2">
                    <FaPlus />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Add Item
                  </span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  onClick={toggleLowStockModal}
                >
                  <div className="p-3 rounded-full bg-green-100 text-green-600 mb-2">
                    <FaTimes />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Low Stock
                  </span>
                </button>
                <button
                  className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  onClick={generatePDF}
                >
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-2">
                    <FaFileExport />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Export Data
                  </span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                    <RiCalendarTodoFill />
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    Expiry Report
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Added Chart Section */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="h-80">
              <Bar data={getChartData()} options={chartOptions} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search items..."
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {warning && (
            <div
              className={`mb-6 p-3 rounded-lg text-center ${
                warning.includes("success")
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {warning}
            </div>
          )}

          {showForm && (
            <div className="bg-blue-50 p-6 rounded-xl mb-6 border border-blue-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editItem ? "Edit Item" : "Add New Item"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Number*
                    </label>
                    <select
                      name="itemNumber"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.itemNumber}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Item Number</option>
                      {barcodeOptions.slice(0, 10).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name*
                    </label>
                    <select
                      name="name"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.name}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Item</option>
                      <option value="Milk">Milk</option>
                      <option value="Eggs">Eggs</option>
                      <option value="Bread">Bread</option>
                      <option value="Cheese">Cheese</option>
                      <option value="Butter">Butter</option>
                      <option value="Yogurt">Yogurt</option>
                      <option value="Chicken">Chicken</option>
                      <option value="Beef">Beef</option>
                      <option value="Fish">Fish</option>
                      <option value="Rice">Rice</option>
                      <option value="Pasta">Pasta</option>
                      <option value="Apples">Apples</option>
                      <option value="Bananas">Bananas</option>
                      <option value="Oranges">Oranges</option>
                      <option value="Tomatoes">Tomatoes</option>
                      <option value="Potatoes">Potatoes</option>
                      <option value="Carrots">Carrots</option>
                      <option value="Onions">Onions</option>
                      <option value="Garlic">Garlic</option>
                      <option value="Lettuce">Lettuce</option>
                      <option value="Cucumber">Cucumber</option>
                      <option value="Peppers">Peppers</option>
                      <option value="Mushrooms">Mushrooms</option>
                      <option value="Olive Oil">Olive Oil</option>
                      <option value="Salt">Salt</option>
                      <option value="Pepper">Pepper</option>
                      <option value="Sugar">Sugar</option>
                      <option value="Flour">Flour</option>
                      <option value="Cereal">Cereal</option>
                      <option value="Juice">Juice</option>
                      <option value="Water">Water</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Meat & Fish">Meat & Fish</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Pantry Essentials">
                        Pantry Essentials
                      </option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity*
                    </label>
                    <select
                      name="quantity"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.quantity}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Quantity</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Manufacture Date
                    </label>
                    <input
                      type="date"
                      name="manufactureDate"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.manufactureDate}
                      onChange={handleInputChange}
                      max={getCurrentDate()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date*
                    </label>
                    <div className="flex gap-3">
                      <select
                        name="expiryDate"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={newItem.expiryDate}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select from scanned dates</option>
                        {expiryDateOptions.slice(0, 10).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <span className="self-center text-gray-500">or</span>
                      <input
                        type="date"
                        name="expiryDateManual"
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={newItem.expiryDate}
                        onChange={handleInputChange}
                        min={getCurrentDate()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <select
                      name="temperature"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      value={newItem.temperature}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Storage Temperature</option>
                      <option value="Frozen (-18°C)">Frozen (-18°C)</option>
                      <option value="Refrigerated (0-4°C)">
                        Refrigerated (0-4°C)
                      </option>
                      <option value="Ambient">Ambient</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                      onClick={handleAddItem}
                    >
                      {editItem ? "Update Item" : "Add Item"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showLowStockModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center border-b border-gray-200 p-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Low Stock Items
                  </h3>
                  <button
                    onClick={toggleLowStockModal}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  {lowStockItems.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {lowStockItems.map((item) => (
                        <li key={item._id} className="py-3">
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
                                Expires: {item.expiryDate.split("T")[0]}
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

          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item #
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mfg Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expiry Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Temp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedItems.length > 0 ? (
                  sortedItems.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          item.quantity < 5 ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.manufactureDate.split("T")[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.expiryDate.split("T")[0]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.temperature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === "Available"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No items found. Try adjusting your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Inventory;
