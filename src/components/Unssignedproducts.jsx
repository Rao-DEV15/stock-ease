import React, { useEffect, useState } from "react";
import { db } from "./FireBase";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Unssignedproducts = () => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    // ✅ Query only current user’s products
    const qProducts = query(
      collection(db, "products"),
      where("userId", "==", user.uid)
    );
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const productsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      setLoading(false);
    });

    // ✅ Query only current user’s companies
    const qCompanies = query(
      collection(db, "companies"),
      where("userId", "==", user.uid)
    );
    const unsubCompanies = onSnapshot(qCompanies, (snapshot) => {
      const companiesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCompanies(companiesData);
    });

    return () => {
      unsubProducts();
      unsubCompanies();
    };
  }, []);

  // ✅ Orphan products = no companyId OR companyId doesn't exist anymore
  const orphanProducts = products.filter(
    (p) => !p.companyId || !companies.some((c) => c.id === p.companyId)
  );

  const handleAssignCompany = async (productId, companyId) => {
    try {
      await updateDoc(doc(db, "products", productId), { companyId });
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleAddCompany = async (name, productId) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;

      // ✅ Add company with userId for rule compliance
      const newCompany = await addDoc(collection(db, "companies"), {
        name,
        userId: user.uid,
      });

      // Assign newly created company
      await updateDoc(doc(db, "products", productId), {
        companyId: newCompany.id,
      });
    } catch (err) {
      console.error("Error adding company:", err);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-yellow-600 text-white rounded-lg shadow-md"
      >
        Manage Orphan Products
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-11/12 max-w-3xl rounded-2xl shadow-lg p-6 relative flex flex-col max-h-[90vh]">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Unassigned Products</h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {loading ? (
                <p className="text-gray-500 text-sm">
                  Loading orphan products...
                </p>
              ) : orphanProducts.length === 0 ? (
                <p className="text-gray-500 text-sm">No orphan products 🎉</p>
              ) : (
                orphanProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border rounded-lg p-3 bg-gray-50"
                  >
                    <span className="font-medium">{product.name}</span>
                    <div className="flex gap-2">
                      <select
                        className="border rounded-md px-2 py-1 text-sm"
                        value={product.companyId || ""}
                        onChange={(e) =>
                          handleAssignCompany(product.id, e.target.value)
                        }
                      >
                        <option value="">Assign Company</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        onClick={() => {
                          const name = prompt("Enter new company name:");
                          if (name) handleAddCompany(name, product.id);
                        }}
                      >
                        + New Company
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Unssignedproducts;
