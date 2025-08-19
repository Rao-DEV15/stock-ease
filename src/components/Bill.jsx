import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "./FireBase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import Recipit from "./Recipit";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
const Bill = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // For bills history
  const [showHistory, setShowHistory] = useState(false);
  const [bills, setBills] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const user = auth.currentUser;
const receiptRef = useRef();
const [billingDate, setBillingDate] = useState(null);

  // Fetch bills history from Firestore
  const fetchBills = async () => {
    if (!user) {
      alert("You must be logged in to see bills history.");
      return;
    }
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
  };const exportReceiptAsPDF = async (props) => {
  // props should be the same as your Recipit component props
  const { customerName, products, totalAmount, totalCount, date } = props;

  try {
    const response = await fetch("http://localhost:3000/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerName, products, totalAmount, totalCount, date }),
    });

    const data = await response.json();
    console.log("Print response:", data);
  } catch (err) {
    console.error("Print error:", err);
  }
};


  // Fetch products (same as before)
  // Modify fetchProduct to accept optional barcode param
const fetchProduct = async (barcodeParam) => {
  const codeToUse = barcodeParam !== undefined ? barcodeParam : barcode;
  if (!codeToUse.trim()) return;
  if (!user) return alert("You must be logged in to fetch products.");

  try {
    const q = query(
      collection(db, "products"),
      where("barcode", "==", codeToUse),
      where("userId", "==", user.uid)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return alert("Product not found.");

    // use local snapshot for duplicate check
    const currentProducts = [...products];
    let productAdded = false;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const exists = currentProducts.find((p) => p.id === doc.id);
      if (exists) {
        productAdded = true;
      } else {
        currentProducts.push({
          id: doc.id,
          name: data.name,
          price: data.price,
          qty: 1,
          originalQty: Number(data.quantity),
          discount: 0,
        });
      }
    });

    if (productAdded && currentProducts.length === products.length) {
      alert("Product already added");
      return;
    }

    setProducts(currentProducts);
    if (barcodeParam === undefined) setBarcode("");
  } catch (error) {
    console.error("Error fetching product:", error);
    alert("Error fetching product");
  }
};




  const removeProduct = (id) => {
    if (loading) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  const updateQty = (id, qty) => {
    if (loading) return;
    const val = Number(qty);
    if (val < 1) return;

    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, qty: val > p.originalQty ? p.originalQty : val } : p
      )
    );
  };
const updateDiscount = (id, value) => {
  let val = Number(value);
  if (val < 0) val = 0;
  if (val > 100) val = 100;

  setProducts(
    products.map((p) => (p.id === id ? { ...p, discount: val } : p))
  );
};
const totalAmount = products.reduce(
  (acc, p) => acc + p.price * p.qty * (1 - p.discount / 100),
  0
);
  const totalCount = products.reduce((acc, p) => acc + p.qty, 0);

  // Handle Billing: update stock, save bill to firestore, reset form
  const handleBilled = async () => {
    if (loading) return;
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }

    if (products.length === 0) {
      alert("Add at least one product");
      return;
    }

    for (const p of products) {
      if (p.qty > p.originalQty) {
        alert(
          `Desired quantity for "${p.name}" exceeds available stock (${p.originalQty})!`
        );
        return;
      }
    }

    setLoading(true);
 
    try {
      // Update product stock
      for (const p of products) {
        const productRef = doc(db, "products", p.id);
        await updateDoc(productRef, {
          quantity: p.originalQty - p.qty,
        });
      }

      // Save bill to Firestore
     await addDoc(collection(db, "bills"), {
  userId: user.uid,
  customerName,
  createdAt: new Date(),
  products: products.map(({ id, name, price, qty, discount }) => ({
    id,
    name,
    price,
    qty,
    discount, // ✅ add discount
  })),
  totalAmount,
  totalCount,
});

      setBillingDate(new Date());
 await new Promise((res) => setTimeout(res, 100));
await exportReceiptAsPDF({ customerName, products, totalAmount, totalCount,  date: new Date() })

      // Reset states
      setProducts([]);
      setCustomerName("");
      setBarcode("");
      setIsOpen(false);
      alert("Billing successful and saved to history!");
    } catch (error) {
      console.error("Billing error:", error);
      alert("Something went wrong during billing.");
    } finally {
      setLoading(false);

    }
  };

  // Delete a bill from history
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

  // Show history modal and fetch bills
  const openHistory = () => {
    if (!user) {
      alert("You must be logged in to see bills history.");
      return;
    }
    setShowHistory(true);
    fetchBills();
  };

  // Close history modal
  const closeHistory = () => {
    setShowHistory(false);
    setBills([]);
  };

  return (
    <>
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        top: 0,
        width: 400,
        backgroundColor: "#fff",
        padding: 20,
        boxSizing: "border-box",
      }}
      ref={receiptRef}
    >
      <Recipit
        customerName={customerName}
        products={products}
        totalAmount={totalAmount}
        totalCount={totalCount}
        date={billingDate}
      />
    </div>
      {/* Main Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition"
        >
          Make Bill
        </button>

        <button
          onClick={openHistory}
          className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-1"
          title="View Bills History"
        >
          {/* You can replace with a proper icon component or SVG */}
          🕘 History
        </button>
      </div>

      {/* Billing Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">SA Cosmetics</h2>
              <button
                onClick={() => !loading && setIsOpen(false)}
                className="text-red-500 font-bold text-lg"
                disabled={loading}
              >
                ✕
              </button>
            </div>

            {/* Date */}
            <p className="text-sm text-gray-600 mb-2">
              Date: {new Date().toLocaleDateString()}
            </p>

            {/* Customer Name */}
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="border p-2 rounded w-full mb-3"
              disabled={loading}
            />

            {/* Barcode Input */}
            <div className="flex gap-2 mb-4">
   <input
  type="text"
  placeholder="Enter Barcode"
  value={barcode}
  onChange={(e) => setBarcode(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && barcode) {
      fetchProduct(barcode);
      setBarcode("");
    }
  }}



  className="border p-2 rounded flex-1"
  disabled={loading}
/>

<button
  onClick={() => fetchProduct(barcode)}
  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
  disabled={loading}
>
  Add
</button>

            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Sr No.</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Qty</th>
                    <th className="p-2 border">Discount %</th>
                    <th className="p-2 border">Total</th>
                    <th className="p-2 border">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, index) => (
                    <tr key={p.id}>

                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border">{p.name}</td>
                      <td className="p-2 border">Rs {p.price}</td>
                      <td className="p-2 border">
                        <input
                          type="number"
                          value={p.qty}
                          min="1"
                          max={p.originalQty}
                          className="border p-1 w-16 text-center"
                          onChange={(e) => updateQty(p.id, e.target.value)}
                          disabled={loading}
                        />
                        <small className="block text-gray-500 text-xs mt-1">
                          /{p.originalQty}
                        </small>
                      </td>
                  <td className="p-2 border text-center">
  <input
    type="number"
    value={p.discount}
    min="0"
    max="100"
    className="border p-1 w-16 text-center"
    onChange={(e) => updateDiscount(p.id, e.target.value)}
    disabled={loading}
  />
</td>
<td className="p-2 border">
  Rs {Math.round(p.price * p.qty * (1 - p.discount / 100))}
</td>

                      <td className="p-2 border text-center">
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="text-red-500 font-bold"
                          disabled={loading}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center p-4 text-gray-400 italic"
                      >
                        No products added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total and Count */}
            <div className="flex justify-between mt-4 text-lg font-bold">
              <div>Total items: {totalCount}</div>
              <div> Grand Total: Rs {totalAmount}</div>
            </div>

            {/* Billed Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleBilled}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : "Billed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bills History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Bills History</h2>
              <button
                onClick={closeHistory}
                className="text-red-500 font-bold text-lg"
                disabled={loadingHistory}
              >
                ✕
              </button>
            </div>

            {loadingHistory ? (
              <p>Loading...</p>
            ) : bills.length === 0 ? (
              <p>No bills found.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Sr No.</th>
                    <th className="p-2 border">Customer Name</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Total Items</th>
                    <th className="p-2 border">Total Amount</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((bill, index) => (
                    <tr key={bill.id}>
                      <td className="p-2 border text-center">{index + 1}</td>
                      <td className="p-2 border">{bill.customerName}</td>
                      <td className="p-2 border">
                        {bill.createdAt.toDate
                          ? bill.createdAt.toDate().toLocaleDateString()
                          : new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-2 border text-center">{bill.totalCount}</td>
                      <td className="p-2 border text-right">Rs {bill.totalAmount}</td>
                      <td className="p-2 border text-center">
                        <button
                          onClick={() => handleDeleteBill(bill.id)}
                          className="text-red-600 font-bold hover:underline"
                          disabled={loadingHistory}
                        >
                          Delete
                        </button>

                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}




          </div>
        </div>
      )}
    </>
  );
};

export default Bill;
