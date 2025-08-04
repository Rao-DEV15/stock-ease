// ... imports
import React, { useState, useEffect, useMemo } from 'react';
import AddProduct from './AddProduct';
import ImportButton from './ImportButton';
import ExportButton from './ExportButton';
import { db } from './FireBase'; 
import { collection, addDoc, Timestamp, doc, setDoc,orderBy,query,onSnapshot,writeBatch,where } from 'firebase/firestore';
import { getDocs,getDoc } from "firebase/firestore";
import {  deleteDoc } from "firebase/firestore";
import Spinner from './Spinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { getAuth,onAuthStateChanged } from "firebase/auth";


const addThings = async (validProducts) => {
  try {
    const productsCollectionRef = collection(db, "products");

    for (const product of validProducts) {
      await addDoc(productsCollectionRef, {
        ...product,
        createdAt: Timestamp.now(),
      });
    }

    
  } catch (error) {
    console.error("Error adding products:", error);
  }
};

const ProductList = ({ searchTerm }) => {
   const fetchProductsFromFirestore = async () => {
    try {
const q = query(
  collection(db, "products"),
  where("userId", "==", user.uid),
  orderBy("index")
);

      const snapshot = await getDocs(q);
     const fetchedProducts = snapshot.docs.map(doc => {
  const data = doc.data();

  // Normalize name
  const name = data.name?.toLowerCase().trim().replace(/\s+/g, '');

  // Normalize tags (if they exist)
  const tags = data.tags?.map(tag =>
    tag.toLowerCase().trim().replace(/\s+/g, '')
  ) || [];

  // Add a searchable index field
  const _searchIndex = [name, ...tags].join(' ');

  return {
    id: doc.id,
    ...data,
    _searchIndex,
    index: data.index || i, // fallback if index is missing
  };
});

      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }; const auth = getAuth();
useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      setProducts([]);
      return;
    }
const q = query(
  collection(db, "products"),
  where("userId", "==", user.uid), // <-- match your field name
  orderBy("index")
);

    const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc, i) => {
        const data = doc.data();

        const name = data.name?.toLowerCase().trim().replace(/\s+/g, '');
        const tags = data.tags?.map(tag =>
          tag.toLowerCase().trim().replace(/\s+/g, '')
        ) || [];

        const _searchIndex = [name, ...tags].join(' ');

        return {
          id: doc.id,
          ...data,
          _searchIndex,
          index: data.index ?? i,
        };
      });

      setProducts(fetchedProducts);
    });

    return () => unsubscribeFirestore();
  });

  return () => unsubscribeAuth();
}, []);




  const [editModeData, setEditModeData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [imageModal, setImageModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [multiDeleteMode, setMultiDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [longPressTimer, setLongPressTimer] = useState(null);
   
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxPriceManuallyEdited, setMaxPriceManuallyEdited] = useState(false);
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [showMobileActions, setShowMobileActions] = useState(false);



const addProduct = async (product) => {
  setLoading(true);
  const id = product.id || Date.now().toString();

 const productWithTimestamp = {
  ...product,
  createdAt: Timestamp.now(),
  userId: auth.currentUser.uid,  // <-- Add this line
};


  try {
    const productRef = doc(db, "products", id);
    await setDoc(productRef, productWithTimestamp);
    console.log(" Product saved to Firestore");

    setProducts(prev => {
      const updated = [...prev, { ...productWithTimestamp, id }];
      localStorage.setItem("products", JSON.stringify(updated));
      return updated;
    });
  } catch (err) {
    console.error(" Failed to add product:", err);
  } finally {
    setLoading(false); 
  }
};

const editProduct = async (id, updatedProduct) => {
  setLoading(true);
  try {
    const productRef = doc(db, "products", id);

    if (!updatedProduct.userId) {
      const existing = await getDoc(productRef);
      updatedProduct.userId = existing.data()?.userId;
    }

    await setDoc(productRef, {
      ...updatedProduct,
      updatedAt: Timestamp.now()
    }, { merge: true });

    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updatedProduct } : p))
    );
  } catch (err) {
    console.error("❌ Failed to update product:", err);
  } finally {
    setLoading(false);
  }
};


const deleteProduct = async (id) => {
  setLoading(true); // Optional: Show spinner

  const productToDelete = products.find((p) => p.id === id);
  const public_id = productToDelete?.public_id;

  try {
    //  1. Delete image from Cloudinary if it exists
       const auth = getAuth();
  const user = auth.currentUser;

  if (user?.email === "test@stockease.com") {
    toast.error("You can't delete a product on the demo account!");
    return;
  }

// Proceed with delete
if (public_id) {
  await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_id }),
  });
}

    //  2. Delete product from Firestore
    await deleteDoc(doc(db, "products", id));

    //  3. Update local state only (no localStorage)
    setProducts((prev) => prev.filter((p) => p.id !== id));

    console.log(" Product deleted");
  } catch (error) {
    console.error(" Error deleting product and/or image:", error);
  } finally {
    setLoading(false); // Hide spinner
  }
};

  useEffect(() => {
    if (!maxPriceManuallyEdited) {
      setMaxPrice(minPrice);
    }
  }, [minPrice, maxPriceManuallyEdited]);


const handleConfirmDelete = async () => {
  try {
    await deleteProduct(deleteId); 
    setDeleteId(null);
  } catch (error) {
    console.error("Failed to delete product from Firestore:", error);
  }
};
const clearAllProducts = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete all your products and their images permanently!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete all!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  const auth = getAuth();
  const user = auth.currentUser;

  if (user?.email === "test@stockease.com") {
    toast.error("You can't delete a product on the demo account!");
    return;
  }

  setLoading(true);

  try {
    const q = query(
      collection(db, "products"),
      where("userId", "==", user.uid) 
    );

    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(async (docSnap) => {
      const product = docSnap.data();
      const public_id = product.public_id;
  

      if (public_id) {
        await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_id }),
        });
      }

      await deleteDoc(doc(db, "products", docSnap.id));
    });

    await Promise.all(deletePromises);

    setProducts([]);
    toast.success("✅ All products and their images have been deleted.");
  } catch (error) {
    console.error("❌ Error clearing all products:", error);
    toast.error("❌ Failed to delete all products.");
  } finally {
    setLoading(false);
  }
};


const filteredProducts = useMemo(() => {
  const normalize = (text) => text?.toLowerCase().trim();

  const searchParts = normalize(searchTerm).split(/\s+/);

  return products.filter((product) => {
    const name = normalize(product.name || '');
    const generatedTags = name.split(/\s+/); 
    const searchableText = name + ' ' + generatedTags.join(' ');

    const matchesSearch = searchParts.every((part) => searchableText.includes(part));

    const price = Number(product.price);
    const min = minPrice === '' ? -Infinity : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesPrice;
  });
}, [products, searchTerm, minPrice, maxPrice]);


  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => setMultiDeleteMode(true), 700);
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer);
  };

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

const deleteSelectedProducts = async () => {
  const result = await Swal.fire({
    title: `Delete ${selectedIds.length} selected product(s)?`,
    text: "This action cannot be undone!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete them!',
    cancelButtonText: 'Cancel',
  });

  if (!result.isConfirmed) return;

  setLoading(true);

  try {
    for (const id of selectedIds) {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const product = docSnap.data();

        if (product.public_id) {
await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ public_id }),
});

        }

        await deleteDoc(docRef);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    }

    setSelectedIds([]);
    setMultiDeleteMode(false);

    Swal.fire("✅ Deleted!", "Selected products have been deleted.", "success");
  } catch (err) {
    console.error("Error deleting selected products:", err);
    Swal.fire("❌ Error", "Failed to delete selected products.", "error");
  } finally {
    setLoading(false);
  }
};
  return (   
    
    <div className="max-w-5xl mx-auto mt-10 p-4 sm:p-6 bg-white shadow-lg rounded-2xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Product List <span className="text-blue-600">({products.length})</span>
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Price Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
            <input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setMaxPriceManuallyEdited(false);
              }}
              className="w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              style={{ color: maxPriceManuallyEdited ? 'black' : 'gray' }}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setMaxPriceManuallyEdited(true);
              }}
              className="w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
         

{/* Mobile Toggle Button */}

<div className="sm:hidden mb-2">
  <button
    onClick={() => setShowMobileActions(!showMobileActions)}
    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 w-full text-left"
  >
    {showMobileActions ? 'Hide Actions ▲' : 'Show Actions ▼'}
  </button>
</div>

{/* Actions for Desktop & Toggled Mobile */}
<div
  className={`flex flex-col sm:flex-row flex-wrap gap-2 mt-4 sm:mt-2 ${
    showMobileActions ? '' : 'hidden sm:flex'
  }`}
>
  <ImportButton addThings={(products) => addThings(products)} />

  <ExportButton products={products} />

  <button
    onClick={clearAllProducts}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Clear All
  </button>

 
</div>

<AddProduct
  addProduct={addProduct}
  editProduct={editProduct}
  editModeData={editModeData}
  setEditModeData={setEditModeData}
  addThings={(validProducts) => addThings(validProducts, fetchProductsFromFirestore)}
  isVisible={!showMobileActions} 
/>


        </div>
      </div>

      {/* Multi-delete controls */}
     {multiDeleteMode && (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
    <span className="text-sm text-gray-600">{selectedIds.length} selected</span>

    <div className="flex flex-col sm:flex-row gap-2">
      <button
        onClick={deleteSelectedProducts}
        className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        Delete Selected
      </button>
      <button
        onClick={() => {
          setMultiDeleteMode(false);
          setSelectedIds([]);
        }}
        className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      >
        Cancel
      </button>
    </div>
  </div>
)}


      {/* Table */}
      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <div className="hidden sm:grid grid-cols-4 bg-blue-600 text-white font-semibold text-lg py-3 px-4 rounded-t-lg sticky top-0 z-10">
          <div>Name</div>
          <div>Price</div>
          <div>Quantity</div>
          <div className="text-right pr-2">Actions</div>
        </div>

        {currentProducts.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 col-span-4">
            {products.length === 0 ? 'No products yet. Add one!' : 'No matching products found,Try to refresh.'}
          </div>
        ) : (
          currentProducts.map((product, index) => (
            <div
              key={product.id}
              className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start border-b px-4 py-3 hover:bg-gray-50 text-sm"
              onMouseDown={handleLongPressStart}
              onMouseUp={handleLongPressEnd}
              onMouseLeave={handleLongPressEnd}
            >
              <div className="flex items-center gap-2">
                {multiDeleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product.id)}
                    onChange={() => toggleSelection(product.id)}
                  />
                )}
                {startIndex + index + 1}. {product.name}
                {product.image && (
                  <img
                    src={product.image}
                    alt="Product"
                    className="w-8 h-8 object-cover rounded cursor-pointer hover:scale-105 transition"
                    onClick={() => setImageModal(product.image)}
                  />
                )}
              </div>

             <div>
  <span className="sm:hidden font-semibold">Price: </span>
  Rs. {product.price}
</div>
<div>
  <span className="sm:hidden font-semibold">Quantity: </span>
  {product.quantity}
</div>


              <div className="flex gap-2 justify-start sm:justify-end flex-wrap">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                 onClick={() => {
  setEditModeData({ id: product.id, product: { ...product } });
}}

                >
                  Edit
                </button>
                {!multiDeleteMode && (
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    onClick={() => setDeleteId(product.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded hover:bg-gray-100"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Are you sure you want to delete this product?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
          <div className="relative">
            <img
              src={imageModal}
              alt="Product Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl"
            />
            <button
              onClick={() => setImageModal(null)}
              className="absolute top-2 right-2 bg-white text-black rounded-full px-3 py-1 text-xl hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
          
        </div>
      )}
      {loading && <Spinner/>}

    </div>
  );
};

export default ProductList;
