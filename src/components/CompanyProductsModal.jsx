import React, { useState, useEffect } from "react";
import { db } from "./FireBase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const CompanyProductsModal = () => {
  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [productsByCompany, setProductsByCompany] = useState({});
  const [expandedCompany, setExpandedCompany] = useState(null);

  // 🔹 Fetch companies
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "companies"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setCompanies(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // 🔹 Fetch products grouped by company
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "products"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      const grouped = {};
      products.forEach((p) => {
        if (!grouped[p.companyId]) grouped[p.companyId] = [];
        grouped[p.companyId].push(p);
      });
      setProductsByCompany(grouped);
    });

    return () => unsub();
  }, []);

  // 🔹 Update product inline
  const handleProductChange = async (id, field, value) => {
    const ref = doc(db, "products", id);
    await updateDoc(ref, { [field]: value });
  };

  return (
    <>
      {/* Button to open modal */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md"
      >
        Manage Products
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
          <div className="bg-white w-11/12 max-w-3xl p-6 rounded-2xl shadow-lg relative max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Company Products</h2>

            <div className="flex-1 overflow-y-auto space-y-3">
              {companies.map((company) => {
                const products = productsByCompany[company.id] || [];
                const totalQty = products.reduce(
                  (sum, p) => sum + Number(p.quantity || 0),
                  0
                );
                const totalValue = products.reduce(
                  (sum, p) =>
                    sum + Number(p.quantity || 0) * Number(p.price || 0),
                  0
                );
                const totalProducts = products.length;

                return (
                  <div key={company.id} className="border rounded-lg">
                    {/* Company header row */}
                    <div
                      className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100"
                      onClick={() =>
                        setExpandedCompany(
                          expandedCompany === company.id ? null : company.id
                        )
                      }
                    >
                      <span className="font-semibold">{company.name}</span>
                      <span className="text-sm text-gray-600">
                        Products: {totalProducts} | Qty: {totalQty} | Value: Rs.{totalValue}
                      </span>
                    </div>

                    {/* Vertical products list */}
                    {expandedCompany === company.id && (
                      <div className="max-h-60 overflow-y-auto bg-gray-50 border-t">
                        {products.map((p) => (
                          <div
                            key={p.id}
                            className="border-b p-2 flex flex-col space-y-1 bg-white"
                          >
                            <input
                              type="text"
                              defaultValue={p.name}
                              className="border rounded px-2 py-1 w-full text-sm"
                              onBlur={(e) =>
                                handleProductChange(p.id, "name", e.target.value)
                              }
                            />
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                defaultValue={p.quantity}
                                className="border rounded px-2 py-1 w-20 text-sm"
                                onBlur={(e) =>
                                  handleProductChange(
                                    p.id,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                              />
                              <input
                                type="number"
                                defaultValue={p.price}
                                className="border rounded px-2 py-1 w-24 text-sm"
                                onBlur={(e) =>
                                  handleProductChange(
                                    p.id,
                                    "price",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyProductsModal;
