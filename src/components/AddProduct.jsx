import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "./FireBase"; // adjust the path as per your project structure

const AddProduct = ({ editProduct, editModeData, setEditModeData, addThings,isVisible }) => {
const emptyProduct = { name: '', price: '', quantity: '', image: '', imageFile: null, preview: '' };
  const [products, setProducts] = useState([emptyProduct]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const validProducts = products.filter(
    (p) => p.name && p.price && p.quantity
  );

  if (validProducts.length === 0) {
    setLoading(false);
    return;
  }

  try {
    const processedProducts = [];

    for (const p of validProducts) {
      let imageUrl = "";
      let publicId = "";

      const imageWasRemoved = !p.preview && !p.imageFile;

      if (p.imageFile) {
        const uploadResult = await uploadToCloudinary(p.imageFile);
        imageUrl = uploadResult.url;
        publicId = uploadResult.public_id;
      }

// Step 1: Fetch all products of this user
const q = query(collection(db, "products"), where("userId", "==", user.uid));
const snapshot = await getDocs(q);

// Step 2: Find max index
let maxIndex = 0;
snapshot.forEach((doc) => {
  const data = doc.data();
  if (typeof data.index === "number" && data.index > maxIndex) {
    maxIndex = data.index;
  }
});

// Step 3: Assign next index
const newIndex = maxIndex + 1;

// Step 4: Add new product
processedProducts.push({
  name: p.name,
  price: p.price,
  quantity: p.quantity,
  image: imageWasRemoved ? "" : imageUrl || p.image || "",
  public_id: imageWasRemoved ? "" : publicId || p.public_id || "",
  userId: user.uid,
  index: newIndex,
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
  <div className="max-w-full flex justify-start mt-0 sm:mt-2 px-2 sm:px-0">
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition w-auto max-w-[200px] sm:max-w-none"
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
              {editModeData ? 'Edit Product' : 'Add Multiple Products'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="hidden sm:grid grid-cols-6 gap-4 font-semibold text-sm border-b pb-2 mb-2">
                <div>Name</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Image</div>
                <div>Preview</div>
                <div>Action</div>
              </div>

              {products.map((product, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:grid sm:grid-cols-6 gap-4 items-center border-b py-2"
                >
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={product.price}
                    onChange={(e) => handleChange(index, 'price', e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    value={product.quantity}
                    onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                    className="px-2 py-1 border rounded text-sm w-full"
                    placeholder="Qty"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, index)}
                    className="text-sm w-full"
                  />
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
                            handleChange(index, 'imageFile', null);
                            handleChange(index, 'preview', '');
                            handleChange(index, 'public_id', '');
                          }}
                          className="text-[10px] text-red-500 underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
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
                  {editModeData ? 'Update' : 'Add All'}
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
