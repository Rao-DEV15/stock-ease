import React, { useState, useEffect } from "react";
import { db, auth } from "./FireBase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { exportReceiptAsPDF } from "./exportReceipt";
import { toast } from 'react-toastify';


const BillsHistory = ({ onClose }) => {
  const [bills, setBills] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const user = auth.currentUser;
const ReceiptView = ({ bill }) => {
  return (
    <div className="border p-4 mb-4 rounded shadow-sm bg-gray-50">
      <h3 className="font-bold mb-2">{bill.customerName}</h3>
      <p className="text-sm text-gray-600 mb-2">
        Date: {bill.createdAt.toDate
          ? bill.createdAt.toDate().toLocaleString()
          : new Date(bill.createdAt).toLocaleString()}
      </p>
      <table className="w-full border mb-2 text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-1 border">Name</th>
            <th className="p-1 border">Price</th>
            <th className="p-1 border">Qty</th>
            <th className="p-1 border">Discount %</th>
            <th className="p-1 border">Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.products.map((p, idx) => (
            <tr key={idx}>
              <td className="p-1 border">{p.name}</td>
              <td className="p-1 border">Rs {p.price}</td>
              <td className="p-1 border">{p.qty}</td>
              <td className="p-1 border">{p.discount}</td>
              <td className="p-1 border">
                Rs {Math.round(p.price * p.qty * (1 - p.discount / 100))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between font-bold text-sm">
        <span>Total Items: {bill.totalCount}</span>
        <span>Grand Total: Rs {bill.totalAmount}</span>
      </div>
   <button
  onClick={async () => {
    try {
      await exportReceiptAsPDF({
        customerName: bill.customerName,
        products: bill.products,
        totalAmount: bill.totalAmount,
        totalCount: bill.totalCount,
        date: bill.createdAt.toDate ? bill.createdAt.toDate() : new Date(bill.createdAt),
      });
      toast.success("Receipt sent to printer!");
    } catch (error) {
      toast.error("Failed to send receipt.");
    }
  }}
  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm ml-2"
>
  Print Recipit
</button>


    </div>
    
  );
  
};

  const fetchBills = async () => {
    if (!user) return alert("You must be logged in to see bills history.");
    setLoadingHistory(true);
    try {
      const billsQuery = query(
        collection(db, "bills"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(billsQuery);
      const billsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBills(billsData);
    } catch (err) {
      console.error("Error fetching bills:", err);
      alert("Failed to load bills history.");
    }
    setLoadingHistory(false);
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      await deleteDoc(doc(db, "bills", billId));
      setBills(bills.filter((b) => b.id !== billId));
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert("Failed to delete bill.");
    }
  };
const handleClearAll = async () => {
  if (!window.confirm("Are you sure you want to delete ALL bills?")) return;

  try {
    setLoadingHistory(true);
    // Delete all bills one by one
    for (const bill of bills) {
      await deleteDoc(doc(db, "bills", bill.id));
    }
    setBills([]);
    toast.success("All bills cleared!");
  } catch (error) {
    console.error("Error clearing all bills:", error);
    toast.error("Failed to clear bills.");
  } finally {
    setLoadingHistory(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto">
       <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-bold">Bills History</h2>

  <div className="flex gap-10">
    <button
      onClick={handleClearAll}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm"
      disabled={loadingHistory}
    >
         🗑️
    </button>
    <button
      onClick={onClose}
      className="text-red-500 font-bold text-lg"
    >
      ✕
    </button>
  </div>
</div>


     {loadingHistory ? (
  <p>Loading...</p>
) : bills.length === 0 ? (
  <p>No bills found.</p>
) : (
  <div className="overflow-y-auto max-h-[70vh]">
    {bills.map((bill) => (
      <div key={bill.id} className="relative">
        <ReceiptView bill={bill} />
        <button
          onClick={() => handleDeleteBill(bill.id)}
          className="absolute top-2 right-2 text-red-600 font-bold hover:underline"
        >
          Delete
        </button>
      </div>
    ))}
  </div>
)}

      </div>
    </div>
  );
};

export default BillsHistory;
