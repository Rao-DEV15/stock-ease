import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./Firebase"; // adjust path if needed

const StockModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ qty: 0, value: 0 });

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // Query products for this user only
    const q = query(collection(db, "products"), where("userId", "==", user.uid));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const totalQty = products.reduce(
        (sum, p) => sum + (Number(p.qty ?? p.quantity) || 0),
        0
      );

      const totalValue = products.reduce(
        (sum, p) =>
          sum +
          (Number(p.qty ?? p.quantity) || 0) * (Number(p.price ?? p.value) || 0),
        0
      );

      setTotals({ qty: totalQty, value: totalValue });
    } else {
      setTotals({ qty: 0, value: 0 });
    }
  }, [products]);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
      >
        Show Total Stock
      </button>

      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-lg w-96"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">📦 Total Stock</h2>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <p className="text-lg">
                  <strong>Total Quantity:</strong> {totals.qty}
                </p>
                <p className="text-lg">
                  <strong>Total Value:</strong> Rs.{totals.value.toLocaleString()}
                </p>
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default StockModal;
