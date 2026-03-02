import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BarcodeTable = () => {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarcodes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/barcodes');
        setBarcodes(response.data.barcodes);
      } catch (err) {
        setError('Error fetching data');
        console.error('Error fetching barcodes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBarcodes();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg font-semibold">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center font-medium mt-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Barcode List</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="border border-gray-300 px-6 py-3 text-left">Barcode</th>
              <th className="border border-gray-300 px-6 py-3 text-left">Date Scanned</th>
            </tr>
          </thead>
          <tbody>
            {barcodes.length > 0 ? (
              barcodes.map((barcode) => (
                <tr key={barcode._id} className="hover:bg-gray-100 transition">
                  <td className="border border-gray-300 px-6 py-3">{barcode.barcode}</td>
                  <td className="border border-gray-300 px-6 py-3">{new Date(barcode.createdAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="border border-gray-300 px-6 py-3 text-center text-gray-500">
                  No barcodes available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BarcodeTable;
