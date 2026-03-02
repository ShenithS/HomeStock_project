import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { jsPDF } from "jspdf";

const ProductDashboard = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", category: "" });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sensorData, setSensorData] = useState({
    temperature: null,
    humidity: null,
  });
  const [sensorPulse, setSensorPulse] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSensorData = async () => {
    try {
      setSensorPulse(true);
      const res = await axios.get("http://192.168.229.103/temperature");
      setSensorData({
        temperature: res.data.temperature,
        humidity: res.data.humidity,
      });

      // Reset pulse after animation duration
      setTimeout(() => setSensorPulse(false), 1000);
    } catch (err) {
      console.error("Error fetching sensor data:", err);
      setSensorData({
        temperature: "N/A",
        humidity: "N/A",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { temperature, humidity } = sensorData;

      const payload = {
        ...form,
        temperature,
        humidity,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          payload
        );
      } else {
        await axios.post("http://localhost:5000/api/products", payload);
      }

      setForm({ name: "", category: "" });
      setEditingId(null);
      await fetchProducts();
      setError(null);
    } catch (error) {
      setError(error.message || "Error submitting form");
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      await fetchProducts();
      setError(null);
    } catch (err) {
      setError("Failed to delete product");
      console.error("Error deleting product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, category: product.category });
    setEditingId(product._id);
  };

  const generateProfessionalPDF = () => {
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

    // ====== HEADER SECTION ======
    doc.setFillColor(...PRIMARY_COLOR);
    doc.rect(0, 0, 210, 30, "F");

    // Company Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("ACME CORPORATION", 105, 18, { align: "center" });

    // Report Title
    doc.setFontSize(12);
    doc.setTextColor(...SECONDARY_COLOR);
    doc.text("Product Master Inventory", 105, 28, { align: "center" });

    // ====== METADATA SECTION ======
    const metadataY = 35;
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_TEXT);

    const today = new Date();
    doc.text(`Report Date: ${today.toLocaleDateString()}`, 15, metadataY);
    doc.text(`Generated: ${today.toLocaleTimeString()}`, 15, metadataY + 5);
    doc.text(`Total Products: ${products.length}`, 180, metadataY, {
      align: "right",
    });

    // ====== TABLE DESIGN ======
    const startY = 50;
    const columnWidths = [100, 80]; // Product name wider than category
    const rowHeight = 10;

    // Table Header
    doc.setFillColor(...SECONDARY_COLOR);
    doc.rect(
      15,
      startY,
      columnWidths.reduce((a, b) => a + b, 0),
      rowHeight,
      "F"
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    let xPos = 20;
    ["PRODUCT NAME", "CATEGORY"].forEach((text, i) => {
      doc.text(text, xPos, startY + 7);
      xPos += columnWidths[i];
    });

    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    products.forEach((product, index) => {
      const yPos = startY + rowHeight + index * rowHeight;

      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(...LIGHT_BG);
        doc.rect(
          15,
          yPos,
          columnWidths.reduce((a, b) => a + b, 0),
          rowHeight,
          "F"
        );
      }

      doc.setTextColor(...DARK_TEXT);
      doc.text(product.name, 20, yPos + 7);
      doc.text(product.category.toUpperCase(), 120, yPos + 7);
    });

    // ====== FOOTER ======
    const footerY = 280;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, footerY, 195, footerY);

    doc.setFontSize(8);
    doc.setTextColor(...MUTED_TEXT);
    doc.text("Confidential - Internal Use Only", 15, footerY + 5);
    doc.text(`Page 1 of 1`, 195, footerY + 5, { align: "right" });

    // ====== WATERMARK (OPTIONAL) ======
    doc.setFontSize(60);
    doc.setTextColor(230, 230, 230);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.text("DRAFT", 105, 150, { align: "center", angle: 45 });

    // ====== SAVE FILE ======
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    doc.save(`ACME_Product_Inventory_${timestamp}.pdf`);
  };

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const pulse = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              IoT Product Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor and manage your products with real-time sensor data
            </p>
          </div>
          <motion.div
            animate={sensorPulse ? "pulse" : ""}
            variants={pulse}
            className="flex items-center space-x-2"
          >
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Live sensor data</span>
          </motion.div>
        </motion.div>

        {/* Sensor Data Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="mb-8 p-6 bg-white rounded-xl shadow-md border border-blue-100"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Current Sensor Readings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensorData.temperature !== null
                      ? `${sensorData.temperature}°C`
                      : "--"}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              className="p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Humidity</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {sensorData.humidity !== null
                      ? `${sensorData.humidity}%`
                      : "--"}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 p-6 bg-white rounded-xl shadow-md"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  name="name"
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  name="category"
                  placeholder="Enter category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-6 py-3 rounded-lg font-medium text-white shadow-md transition ${
                  editingId
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-600 hover:bg-blue-700"
                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : editingId ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </motion.button>

              <motion.button
                type="button"
                onClick={generateProfessionalPDF}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-lg font-medium text-white bg-gray-600 hover:bg-gray-700 shadow-md transition"
              >
                Generate PDF Report
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Products Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Product Inventory
              </h2>
              <span className="text-sm text-gray-500">
                Showing {products.length} products
              </span>
            </div>

            {isLoading && !products.length ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Temp (°C)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Humidity (%)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence>
                      {products.map((prod) => (
                        <motion.tr
                          key={prod._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          whileHover={{
                            backgroundColor: "rgba(239, 246, 255, 1)",
                          }}
                          className="transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {prod.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {prod.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {prod.temperature || "N/A"}
                              {prod.temperature && (
                                <svg
                                  className="ml-1 w-4 h-4 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 12h14M12 5l7 7-7 7"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {prod.humidity || "N/A"}
                              {prod.humidity && (
                                <svg
                                  className="ml-1 w-4 h-4 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <motion.button
                              onClick={() => handleEdit(prod)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 px-3 py-1 rounded-md"
                              disabled={isLoading}
                            >
                              Edit
                            </motion.button>
                            <motion.button
                              onClick={() => handleDelete(prod._id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                              disabled={isLoading}
                            >
                              Delete
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProductDashboard;
