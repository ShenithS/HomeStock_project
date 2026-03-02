import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";

const API_URL = "http://localhost:5004/barcodes"; // Backend API

const RealDate = () => {
  const [barcodeData, setBarcodeData] = useState(null);
  const currentDate = format(new Date(), "yyyy-MM-dd"); // Example: 2025-03-07

  useEffect(() => {
    // Fetch barcode data from the API
    axios.get(API_URL)
      .then((response) => {
        setBarcodeData(response.data); // Assuming the API returns a list of barcodes
      })
      .catch((error) => {
        console.error("Error fetching barcode data:", error);
      });
  }, []);

  // Check if the expiry date is the same as the current date
  const isExpired = barcodeData && barcodeData.expiryDate === currentDate;

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md text-center">
      <h2 className="text-xl font-semibold">Today's Date</h2>
      <p className="text-lg text-gray-700">{currentDate}</p>

      {barcodeData ? (
        <div>
          <p className="text-lg mt-4">Barcode Expiry Date: {barcodeData.expiryDate}</p>
          {isExpired ? (
            <p className="text-lg mt-4 text-red-500">The product has expired!</p>
          ) : (
            <p className="text-lg mt-4 text-green-500">The product is still valid.</p>
          )}
        </div>
      ) : (
        <p className="text-lg mt-4">Loading barcode data...</p>
      )}
    </div>
  );
};

export default RealDate;
