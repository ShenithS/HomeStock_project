import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaFilePdf,
  FaShoppingCart,
  FaPlus,
  FaSearch,
  FaChartLine,
} from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Notification from "../grocery_ist/Notification";
Chart.register(...registerables);

const GroceryList = () => {
  const [groceries, setGroceries] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const categories = [
    ...new Set(groceries.map((item) => item.category || "Uncategorized")),
  ];

  // Fetch groceries from backend
  useEffect(() => {
    const fetchGroceries = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/groceries");
        const itemsWithDates = res.data.map((item) => ({
          ...item,
          createdAt: item.createdAt || new Date().toISOString(),
        }));
        setGroceries(itemsWithDates);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGroceries();
  }, []);

  // Update filtered items when filters change
  useEffect(() => {
    const filtered = groceries.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "pending" && !item.completed) ||
        (activeTab === "purchased" && item.completed) ||
        activeTab === item.category;
      return matchesSearch && matchesTab;
    });
    setFilteredItems(filtered);
  }, [groceries, searchTerm, activeTab]);

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const handleLowStockItemClick = (itemName) => {
    setNewItem((prev) => ({
      ...prev,
      name: itemName,
      quantity: "1", // Default quantity
    }));

    // Scroll to the form
    document
      .getElementById("grocery-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.quantity) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const itemWithDate = {
        ...newItem,
        quantity: Number(newItem.quantity), // Convert to number
        completed: false,
        dateAdded: today,
      };

      // Validation check
      if (isNaN(itemWithDate.quantity) || itemWithDate.quantity <= 0) {
        showNotification("Quantity must be a positive number");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/groceries",
        itemWithDate,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setGroceries([res.data, ...groceries]);
      setNewItem({ name: "", quantity: "", category: "" });
      showNotification(`${newItem.name} added to grocery list`);
    } catch (err) {
      console.error("Full error:", err.response?.data || err.message);
      showNotification(err.response?.data?.message || "Failed to add item");
    }
  };

  const toggleComplete = async (id, currentStatus, itemName) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/groceries/${id}`, {
        completed: !currentStatus,
      });
      setGroceries(
        groceries.map((item) => (item._id === id ? res.data : item))
      );
      showNotification(
        `${itemName} marked as ${!currentStatus ? "purchased" : "pending"}`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteItem = async (id, itemName) => {
    if (window.confirm(`Are you sure you want to delete ${itemName}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/groceries/${id}`);
        setGroceries(groceries.filter((item) => item._id !== id));
        showNotification(`${itemName} deleted from grocery list`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const saveEditedItem = async () => {
    if (!itemToEdit.name || !itemToEdit.quantity) return;
    try {
      const res = await axios.put(
        `http://localhost:5000/api/groceries/${itemToEdit._id}`,
        itemToEdit
      );
      setGroceries(
        groceries.map((item) => (item._id === itemToEdit._id ? res.data : item))
      );
      setIsModalOpen(false);
      showNotification(`${itemToEdit.name} updated successfully`);
    } catch (err) {
      console.error(err);
    }
  };

  const buyItems = async () => {
    const pendingItems = groceries.filter((item) => !item.completed);
    if (pendingItems.length === 0) {
      showNotification("No pending items to mark as purchased");
      return;
    }

    try {
      await Promise.all(
        pendingItems.map((item) =>
          axios.put(`http://localhost:5000/api/groceries/${item._id}`, {
            completed: true,
          })
        )
      );
      const updatedGroceries = await axios.get(
        "http://localhost:5000/api/groceries"
      );
      setGroceries(updatedGroceries.data);
      showNotification(
        `Marked ${pendingItems.length} items as purchased successfully`
      );
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // ====== DESIGN CONSTANTS ======
    const PRIMARY_COLOR = [44, 62, 80]; // Dark blue
    const SECONDARY_COLOR = [70, 130, 180]; // Steel blue
    const LIGHT_BG = [248, 248, 248];
    const DARK_TEXT = [51, 51, 51];
    const MUTED_TEXT = [119, 119, 119];
    const date = new Date();

    // ====== HEADER ======
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 30, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("GROCERY LIST", 105, 18, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text(`Generated on: ${date.toLocaleDateString()}`, 105, 27, {
      align: "center",
    });

    // ====== TABLE ======
    const tableData = filteredItems.map((item) => [
      item.completed ? "✓" : "",
      item.name,
      item.quantity,
      item.category || "Uncategorized",
      formatDate(item.createdAt),
    ]);

    autoTable(doc, {
      head: [["Status", "Item", "Quantity", "Category", "Date Added"]],
      body: tableData,
      startY: 35,
      styles: {
        halign: "center",
        fontSize: 9,
        textColor: DARK_TEXT,
      },
      headStyles: {
        fillColor: SECONDARY_COLOR,
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: LIGHT_BG,
      },
    });

    // ====== SUMMARY ======
    const pendingCount = groceries.filter((item) => !item.completed).length;
    const purchasedCount = groceries.filter((item) => item.completed).length;
    const summaryY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setTextColor(...DARK_TEXT);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 15, summaryY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED_TEXT);
    doc.text(`Pending items: ${pendingCount}`, 15, summaryY + 7);
    doc.text(`Purchased items: ${purchasedCount}`, 15, summaryY + 14);
    doc.text(`Total items: ${groceries.length}`, 15, summaryY + 21);

    // ====== FOOTER ======
    const footerY = 280;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, 195, footerY);

    doc.setFontSize(8);
    doc.setTextColor(...MUTED_TEXT);
    doc.text("Confidential - Internal Use Only", 15, footerY + 5);
    doc.text("Page 1 of 1", 195, footerY + 5, { align: "right" });

    // ====== WATERMARK ======
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text("DRAFT", 105, 150, { align: "center", angle: 45 });

    // ====== SAVE FILE ======
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    doc.save(`grocery-list-${timestamp}.pdf`);
  };

  // Chart data
  const chartData = {
    itemsByCategory: {
      labels: categories,
      datasets: [
        {
          label: "Items",
          data: categories.map(
            (cat) =>
              groceries.filter(
                (item) => (item.category || "Uncategorized") === cat
              ).length
          ),
          backgroundColor: "rgba(79, 70, 229, 0.7)",
          borderColor: "rgba(79, 70, 229, 1)",
          borderWidth: 1,
        },
      ],
    },
    quantitiesByCategory: {
      labels: categories,
      datasets: [
        {
          label: "Quantities",
          data: categories.map((cat) =>
            groceries
              .filter((item) => (item.category || "Uncategorized") === cat)
              .reduce((sum, item) => sum + parseInt(item.quantity || 0), 0)
          ),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Notification onLowStockItemClick={handleLowStockItemClick} />

      {notification.show && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification.message}
        </div>
      )}

      <div
        id="grocery-form"
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 mb-8 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center tracking-wide">
          🛒 Add New Grocery Item
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Item Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              value={newItem.name}
              onChange={(e) => {
                const filteredValue = e.target.value.replace(
                  /[^a-zA-Z\s]/g,
                  ""
                );
                setNewItem({ ...newItem, name: filteredValue });
              }}
              className={`w-full bg-white border ${
                newItem.name && /[^a-zA-Z\s]/.test(newItem.name)
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
            />
            {newItem.name && /[^a-zA-Z\s]/.test(newItem.name) && (
              <p className="mt-1 text-sm text-red-500">
                Only letters and spaces are allowed
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="0"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "" || Number(value) >= 0) {
                  setNewItem({ ...newItem, quantity: value });
                }
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              onChange={(e) =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              value={newItem.category}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="" className="bg-white text-gray-400">
                Select Category
              </option>
              {[
                "Vegetables",
                "Fruits",
                "Dairy",
                "Meat & Fish",
                "Beverages",
                "Snacks",
                "Household",
                "Personal Care",
                "Other",
              ].map((cat, index) => (
                <option key={index} value={cat} className="bg-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "pending"
                ? "bg-amber-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab("purchased")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === "purchased"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Purchased
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === cat
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <button
          onClick={generatePDF}
          className="w-full md:w-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
        >
          <FaFilePdf />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr
                    key={item._id}
                    className={
                      item.completed ? "bg-green-50" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() =>
                          toggleComplete(item._id, item.completed, item.name)
                        }
                        className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`font-medium ${
                            item.completed
                              ? "text-gray-500 line-through"
                              : "text-gray-900"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.completed
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteItem(item._id, item.name)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                          title="Delete"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No items found. Add some items to your grocery list.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Category Analytics
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <FaChartLine />
              <span>Analytics</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Items by Category
              </h4>
              {categories.length > 0 ? (
                <Bar
                  data={chartData.itemsByCategory}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                          stepSize: 1,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>
            <div className="h-64">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Quantity by Category
              </h4>
              {categories.length > 0 ? (
                <Bar
                  data={chartData.quantitiesByCategory}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No quantity data available
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <button
                onClick={buyItems}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <FaShoppingCart />
                <span>Mark as Purchased</span>
              </button>
              <button
                onClick={generatePDF}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-3 rounded-lg shadow-sm transition flex items-center justify-center space-x-2"
              >
                <FaFilePdf />
                <span>Export as PDF</span>
              </button>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Summary
              </h4>
              <p className="text-xs text-blue-600">
                {groceries.filter((item) => !item.completed).length} pending
                items
                <br />
                {groceries.filter((item) => item.completed).length} purchased
                items
                <br />
                Total: {groceries.length} items
              </p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && itemToEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Edit Item
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={itemToEdit.name}
                    onChange={(e) =>
                      setItemToEdit({ ...itemToEdit, name: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={itemToEdit.quantity}
                    onChange={(e) =>
                      setItemToEdit({
                        ...itemToEdit,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={itemToEdit.category}
                    onChange={(e) =>
                      setItemToEdit({
                        ...itemToEdit,
                        category: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="">Select Category</option>
                    {[
                      "Vegetables",
                      "Fruits",
                      "Dairy Products",
                      "Meat & Fish",
                      "Beverages",
                      "Snacks",
                      "Household Items",
                      "Personal Care",
                      "Spices",
                      "Other",
                    ].map((cat, index) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedItem}
                  className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryList;
