import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./FireBase";
import { X } from "lucide-react"; // 👈 Cross icon

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);

    // ✅ Real-time listener
    const q = query(
      collection(db, "companies"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setCompanies(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [open]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    await deleteDoc(doc(db, "companies", id));
  };

  const handleRename = async (id, oldName) => {
    const newName = prompt("Enter new company name:", oldName);
    if (!newName || newName.trim() === "") return;
    await updateDoc(doc(db, "companies", id), { name: newName.trim() });
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Button to open modal */}
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md"
      >
        Manage Companies
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-3 text-center">
              Manage Companies
            </h2>

            {/* Search */}
            <input
              type="text"
              placeholder="Search company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-2 py-1 rounded w-full mb-3"
            />

            {loading ? (
              <p className="text-center">Loading...</p>
            ) : filteredCompanies.length === 0 ? (
              <p className="text-center text-gray-500">No companies found.</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {filteredCompanies.map((c) => (
                  <li
                    key={c.id}
                    className="flex justify-between items-center border-b pb-1"
                  >
                    <span>{c.name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleRename(c.id, c.name)}
                        className="px-2 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
