import React, { useEffect, useState } from "react";
import { db, auth } from "./FireBase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const LowStockNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const productsRef = collection(db, "products");
    const notifRef = collection(db, "lowStockNotifications");

    const qProducts = query(productsRef, where("userId", "==", user.uid));
    const unsubscribeProducts = onSnapshot(qProducts, async (productsSnap) => {
      try {
        const allProducts = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          quantityNum: Number(doc.data().quantity),
        }));

        const lowStockProducts = allProducts.filter((p) => p.quantityNum <= 5);

        // Fetch existing notifications
        const notifQuery = query(notifRef, where("userId", "==", user.uid));
        const notifSnap = await getDocs(notifQuery);
        const existingNotifications = notifSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lowStockMap = new Map(lowStockProducts.map((p) => [p.id, p]));
        const notifMap = new Map(existingNotifications.map((n) => [n.productId, n]));

        // Add or update notifications
        for (const product of lowStockProducts) {
          if (!notifMap.has(product.id)) {
            await addDoc(notifRef, {
              userId: user.uid,
              productId: product.id,
              productName: product.name,
              quantity: product.quantity,
              createdAt: serverTimestamp(),
            });
          } else {
            const notif = notifMap.get(product.id);
            if (notif.quantity !== product.quantity) {
              const notifDocRef = doc(db, "lowStockNotifications", notif.id);
              await updateDoc(notifDocRef, {
                quantity: product.quantity,
                createdAt: serverTimestamp(),
              });
            }
          }
        }

        // Remove notifications for products no longer low stock
        for (const notif of existingNotifications) {
          if (!lowStockMap.has(notif.productId)) {
            const notifDocRef = doc(db, "lowStockNotifications", notif.id);
            await deleteDoc(notifDocRef);
          }
        }

        // Fetch updated notifications
      const updatedNotifQuery = query(
  notifRef,
  where("userId", "==", user.uid),
  orderBy("createdAt", "desc")
);

        const updatedNotifSnap = await getDocs(updatedNotifQuery);
        const updatedNotifData = updatedNotifSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setNotifications(updatedNotifData);
      } catch (error) {
        console.error("Error syncing low stock notifications:", error);
      }
    });

    return () => unsubscribeProducts();
  }, [user]);

  const handleRemoveNotification = async (notifId) => {
    try {
      await deleteDoc(doc(db, "lowStockNotifications", notifId));
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (error) {
      console.error("Failed to remove notification:", error);
      alert("Failed to remove notification.");
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-5 rounded-full shadow-lg"
        style={{ zIndex: 99999 }}
        title="Low Stock Alerts"
      >
        Low Stock ({notifications.length})
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          style={{ zIndex: 100000 }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Low Stock Notifications</h2>

            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p>All products have sufficient stock.</p>
              ) : (
                <ul>
                  {notifications.map((item, index) => (
                    <li
                      key={item.id}
                      className="mb-2 flex justify-between items-center"
                    >
                      <span>
                        <strong>
                          {index + 1}. {item.productName}
                        </strong>{" "}
                        is low on stock (Qty: {item.quantity})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LowStockNotifications;
