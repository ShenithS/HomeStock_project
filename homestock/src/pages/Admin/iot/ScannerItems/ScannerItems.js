import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiTrash2,
  FiClock,
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit,
  FiPlus,
  FiX,
  FiSave,
} from "react-icons/fi";
import { FaBarcode } from "react-icons/fa";

const BarcodeTable = () => {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingBarcode, setDeletingBarcode] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({ code: "" });
  const [newBarcode, setNewBarcode] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBarcodes();
  }, []);

  const fetchBarcodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/barcodes");
      setBarcodes(response.data.barcodes);
      setError(null);
    } catch (err) {
      setError("Failed to fetch barcode data");
      console.error("Error fetching barcodes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const checkIfExpired = (expiryDate) => {
    const [day, month, year] = expiryDate.split(/[-/]/).map(Number);
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    return expiry < today;
  };

  const formatExpiryDate = (barcode) => {
    const cleanedBarcode = barcode.replace(/[^0-9]/g, "");

    if (cleanedBarcode.length < 10)
      return <span className="text-gray-500 italic">Invalid format</span>;

    const month = cleanedBarcode.slice(2, 4);
    const day = cleanedBarcode.slice(4, 6);
    const year = cleanedBarcode.slice(6, 10);

    const expiryDate = `${day}-${month}/${year}`;
    const isExpired = checkIfExpired(expiryDate);

    return (
      <div className="flex items-center">
        {isExpired ? (
          <FiAlertTriangle className="text-red-500 mr-2" />
        ) : (
          <FiCheckCircle className="text-green-500 mr-2" />
        )}
        <span className={isExpired ? "text-red-600" : "text-green-600"}>
          {expiryDate}
        </span>
      </div>
    );
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedBarcodes = [...barcodes].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredBarcodes = sortedBarcodes.filter(
    (barcode) =>
      barcode.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (barcode.createdAt &&
        new Date(barcode.createdAt)
          .toLocaleString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const deleteBarcode = async (barcodeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this barcode?"
    );
    if (!confirmed) return;

    try {
      setDeletingBarcode(barcodeId);
      await axios.delete(`http://localhost:5000/api/barcodes/${barcodeId}`);
      setBarcodes(barcodes.filter((barcode) => barcode._id !== barcodeId));
    } catch (err) {
      setError("Error deleting barcode");
      console.error("Error deleting barcode:", err);
    } finally {
      setDeletingBarcode(null);
    }
  };

  const startEditing = (barcode) => {
    setEditingId(barcode._id);
    setEditFormData({ code: barcode.code });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const saveEditedBarcode = async (barcodeId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/barcodes/${barcodeId}`,
        editFormData
      );
      setBarcodes(
        barcodes.map((barcode) =>
          barcode._id === barcodeId ? response.data.barcode : barcode
        )
      );
      setEditingId(null);
    } catch (err) {
      setError("Error updating barcode");
      console.error("Error updating barcode:", err);
    }
  };

  const handleAddBarcodeChange = (e) => {
    setNewBarcode(e.target.value);
  };

  const addBarcode = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/barcodes/scan",
        {
          barcode: newBarcode,
        }
      );
      setBarcodes([response.data.barcode, ...barcodes]);
      setNewBarcode("");
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error adding barcode");
      console.error("Error adding barcode:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header and Search */}
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
              <FaBarcode className="mr-2 text-blue-600" />
              Barcode Inventory
            </h2>
            <p className="text-gray-600 text-sm">
              {barcodes.length} barcodes in system
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search barcodes..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiPlus className="mr-2" />
              Add Barcode
            </button>
          </div>
        </div>

        {/* Add Barcode Form */}
        {showAddForm && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-grow">
                <input
                  type="text"
                  name="newBarcode"
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new barcode"
                  value={newBarcode}
                  onChange={handleAddBarcodeChange}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addBarcode}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FiSave className="mr-2" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewBarcode("");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiX className="mr-2" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-6 mt-4 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p className="text-gray-600">Loading barcode data...</p>
          </div>
        ) : (
          /* Table */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => requestSort("code")}
                  >
                    <div className="flex items-center">
                      Barcode
                      {sortConfig.key === "code" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Expiry Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                    onClick={() => requestSort("createdAt")}
                  >
                    <div className="flex items-center">
                      <FiClock className="mr-1" />
                      Scanned At
                      {sortConfig.key === "createdAt" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBarcodes.length > 0 ? (
                  filteredBarcodes.map((barcode) => (
                    <tr
                      key={barcode._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === barcode._id ? (
                          <input
                            type="text"
                            name="code"
                            value={editFormData.code}
                            onChange={handleEditChange}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg">
                              <FaBarcode className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {barcode.code}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatExpiryDate(barcode.code)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {barcode.createdAt
                            ? new Date(barcode.createdAt).toLocaleString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {editingId === barcode._id ? (
                          <>
                            <button
                              onClick={() => saveEditedBarcode(barcode._id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FiSave className="mr-1" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FiX className="mr-1" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(barcode)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FiEdit className="mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteBarcode(barcode._id)}
                              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                deletingBarcode === barcode._id
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={deletingBarcode === barcode._id}
                            >
                              <FiTrash2 className="mr-1" />
                              {deletingBarcode === barcode._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No barcodes found matching your search
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeTable;
