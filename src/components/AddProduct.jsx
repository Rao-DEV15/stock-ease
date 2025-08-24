import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  query,
  collection,
  where,
  addDoc,
  onSnapshot,
  getDocs,   // 👈 import onSnapshot
} from "firebase/firestore";
import { db } from "./FireBase";

const AddProduct = ({ editProduct, editModeData, setEditModeData, addThings, isVisible }) => {
  const emptyProduct = {
    name: "",
    price: "",
    quantity: "",
    barcode: "",
    image: "",
    imageFile: null,
    preview: "",
    companyId: "",
  };

  const [products, setProducts] = useState([emptyProduct]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 🔹 Real-time fetch companies on mount
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, "companies"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCompanies(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe(); // cleanup
  }, []);

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "unsigned_upload");

    const res = await fetch("https://api.cloudinary.com/v1_1/drul2tusd/image/upload", {
      method: "POST",
      body: data,
    });

    const result = await res.json();

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  };

  const deleteFromCloudinary = async (public_id) => {
    try {
      const res = await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id }),
      });

      const result = await res.json();
      if (!result.success) throw new Error(result.error?.message || "Delete failed");
    } catch (error) {
      console.error("Image delete failed:", error);
    }
  };

  // 🔹 When editing a product
  useEffect(() => {
    if (editModeData) {
      const productWithPreview = {
        ...editModeData.product,
        id: editModeData.id,
        preview: editModeData.product.image || "",
        imageFile: null,
      };
      setProducts([productWithPreview]);
      setIsOpen(true);
    }
  }, [editModeData]);

  const handleChange = (index, field, value) => {
    setProducts((prev) =>
      prev.map((p, i) => (i === index ? { ...prev[i], [field]: value } : p))
    );
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...products];
      updated[index].preview = reader.result;
      updated[index].imageFile = file;
      setProducts(updated);
    };
    reader.readAsDataURL(file);
  };

  const addRow = () => {
    setProducts((prev) => [...prev, { ...emptyProduct }]);
  };

  const removeRow = (index) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in");
      setLoading(false);
      return;
    }

    const validProducts = products.filter((p) => p.name && p.price && p.quantity);

    if (validProducts.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Step 1: Fetch existing products of this user
      const q = query(collection(db, "products"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const processedProducts = [];

      for (const p of validProducts) {
        const barcode = p.barcode?.trim();

        // Step 2: Check for duplicates in Firestore
        if (barcode) {
          const isDuplicate = snapshot.docs.some((docSnap) => {
            const data = docSnap.data();
            if (editModeData && docSnap.id === editModeData.id) return false;
            return data.barcode?.trim() === barcode;
          });

          if (isDuplicate) {
            alert(`Duplicate: Product with barcode "${barcode}" already exists!`);
            continue;
          }
        }

        // Step 3: Check for duplicates in current form
        if (processedProducts.some((prod) => prod.barcode === barcode)) {
          alert(`Duplicate in form: Product with barcode "${barcode}" already added!`);
          continue;
        }

        let imageUrl = "";
        let publicId = "";
        const imageWasRemoved = !p.preview && !p.imageFile;

        if (p.imageFile) {
          const uploadResult = await uploadToCloudinary(p.imageFile);
          imageUrl = uploadResult.url;
          publicId = uploadResult.public_id;
        }

        // Step 4: Assign index
        let maxIndex = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (typeof data.index === "number" && data.index > maxIndex) {
            maxIndex = data.index;
          }
        });
        const newIndex = maxIndex + 1;

        processedProducts.push({
          name: p.name,
          price: p.price,
          quantity: p.quantity,
          barcode: barcode || "",
          image: imageWasRemoved ? "" : imageUrl || p.image || "",
          public_id: imageWasRemoved ? "" : publicId || p.public_id || "",
          userId: user.uid,
          index: newIndex,
          companyId: p.companyId || "", // 👈 save company reference
        });
      }

      if (editModeData) {
        await editProduct(editModeData.id, processedProducts[0]);
        setEditModeData(null);
      } else {
        await addThings(processedProducts);
      }

      setProducts([emptyProduct]);
      setIsOpen(false);
    } catch (err) {
      console.error("Error submitting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {isVisible && (
        <div className="max-w-full flex justify-start mb-0 mt-0 sm:mt-2 px-2 sm:px-0">
        <button
  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition -mt-1"
  onClick={() => {
    setProducts([emptyProduct]);
    setEditModeData?.(null);
    setIsOpen(true);
  }}
>
  Add Product
</button>

        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-2 sm:px-4">
          <div className="bg-white max-h-[90vh] w-full max-w-5xl rounded-xl shadow-lg overflow-y-auto p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-center text-gray-800">
              {editModeData ? "Edit Product" : "Add Multiple Products"}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_1fr_1.5fr_1.2fr_1.2fr_0.5fr] gap-x-6 font-semibold text-sm border-b pb-3 mb-3 items-center">
                <div>Company</div>
                <div>Name</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Barcode</div>
                <div>Image</div>
                <div>Preview</div>
                <div className="text-center">Action</div>
              </div>

              {/* Rows */}
              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:grid sm:grid-cols-[1.5fr_2fr_1fr_1fr_1.5fr_1.2fr_1.2fr_0.5fr] gap-x-6 items-center border-b py-3"
                >
                  {/* Company */}
                  <select
                    value={product.companyId}
                    onChange={(e) => handleChange(index, "companyId", e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                    <option value="__new">➕ Add New Company</option>
                  </select>

                  {/* If user chooses "Add New Company" */}
                {product.companyId === "__new" && (
  <input
    type="text"
    placeholder="Enter new company"
    className="px-2 py-1 border rounded text-sm w-full mt-1"
    onBlur={async (e) => {
      const name = e.target.value.trim();
      if (!name) return;

      const auth = getAuth();
      const user = auth.currentUser;

      const docRef = await addDoc(collection(db, "companies"), {
        name,
        userId: user.uid,
      });

      // ❌ Don't manually push to setCompanies here
      handleChange(index, "companyId", docRef.id);
    }}
  />
)}


                  {/* Name */}
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleChange(index, "name", e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Name"
                  />

                  {/* Price */}
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleChange(index, "price", e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Price"
                  />

                  {/* Qty */}
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Qty"
                  />

                  {/* Barcode */}
                  <input
                    type="text"
                    value={product.barcode}
                    onChange={(e) => {
                      const input = e.target.value;
                      if (input === "" || /^\d+$/.test(input)) {
                        handleChange(index, "barcode", input);
                      }
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Barcode"
                  />

                  {/* Image */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, index)}
                    className="text-sm w-full"
                  />

                  {/* Preview */}
                  <div className="flex justify-center w-full">
                    {product.preview && (
                      <div className="flex flex-col items-center">
                        <img
                          src={product.preview}
                          alt="Preview"
                          className="w-12 h-12 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (product.public_id) {
                              await deleteFromCloudinary(product.public_id);
                            }
                            handleChange(index, "imageFile", null);
                            handleChange(index, "preview", "");
                            handleChange(index, "public_id", "");
                          }}
                          className="text-[10px] text-red-500 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex justify-center items-center">
                    {products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="text-sm text-red-500 underline"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {!editModeData && (
                <button
                  type="button"
                  onClick={addRow}
                  className="text-sm text-blue-600 underline mt-3"
                >
                  + Add another product
                </button>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setEditModeData?.(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {editModeData ? "Update" : "Add All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProduct;
