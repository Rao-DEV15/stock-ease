import React, { useState, useEffect, useMemo } from 'react';
import AddProduct from './AddProduct';
import Spinner from './Spinner';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { db } from './fireBase';
import { collection, addDoc, doc, setDoc, orderBy, query, onSnapshot, getDocs, getDoc, deleteDoc, where, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from "firebase/auth";

import ProductTable from './ProductTable';
import Pagination from './Pagination';
import DeleteModal from './DeleteModal';
import ImageModal from './ImageModal';
import PriceFilter from './PriceFilter';
import MultiDeleteControls from './MultiDeleteControls';
import ActionsBar from './ActionsBar';
import CompanyProductsModal from './CompanyProductsModal';
import Companies from './Companies';
import Unssignedproducts from './Unssignedproducts';
import StockModal from './StockModal';

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
  const auth = getAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const [showMobileActions, setShowMobileActions] = useState(false);
// Watch searchTerm and reset current page
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);

  // Fetch products from Firestore
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setProducts([]);
        return;
      }

      const q = query(
        collection(db, "products"),
        where("userId", "==", user.uid),
        orderBy("index")
      );

      const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const fetchedProducts = snapshot.docs.map((doc, i) => {
          const data = doc.data();
          const name = data.name?.toLowerCase().trim().replace(/\s+/g, '');
          const tags = data.tags?.map(tag => tag.toLowerCase().trim().replace(/\s+/g, '')) || [];
          const barcode = (data.barcode || '').toLowerCase().trim();
          const _searchIndex = [name, ...tags, barcode].join(' ');

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

  // Price filter logic
  useEffect(() => {
    if (!maxPriceManuallyEdited) setMaxPrice(minPrice);
  }, [minPrice, maxPriceManuallyEdited]);

  const filteredProducts = useMemo(() => {
    const normalize = (text) => text?.toLowerCase().trim() || '';
    const searchParts = normalize(searchTerm).split(/\s+/);

    return products.filter((product) => {
      const name = normalize(product.name);
      const barcode = normalize(product.barcode);
      const generatedTags = name.split(/\s+/);
      const searchableText = [name, ...generatedTags, barcode].join(' ');
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
  const goToPage = (page) => page >= 1 && page <= totalPages && setCurrentPage(page);

  // Handlers for long press
  const handleLongPressStart = () => setLongPressTimer(setTimeout(() => setMultiDeleteMode(true), 700));
  const handleLongPressEnd = () => clearTimeout(longPressTimer);

  const toggleSelection = (id) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);

  // Product CRUD Handlers
  const addProduct = async (product) => {
    setLoading(true);
    const id = product.id || Date.now().toString();
    const productWithTimestamp = { ...product, createdAt: Timestamp.now(), userId: auth.currentUser.uid };

    try {
      await setDoc(doc(db, "products", id), productWithTimestamp);
      setProducts(prev => [...prev, { ...productWithTimestamp, id }]);
    } catch (err) { console.error("Failed to add product:", err); }
    finally { setLoading(false); }
  };

  const editProduct = async (id, updatedProduct) => {
    setLoading(true);
    try {
      const productRef = doc(db, "products", id);
      if (!updatedProduct.userId) {
        const existing = await getDoc(productRef);
        updatedProduct.userId = existing.data()?.userId;
      }
      await setDoc(productRef, { ...updatedProduct, updatedAt: Timestamp.now() }, { merge: true });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    } catch (err) { console.error("Failed to update product:", err); }
    finally { setLoading(false); }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      const productToDelete = products.find(p => p.id === id);
      const public_id = productToDelete?.public_id;
      if (auth.currentUser?.email === "test@stockease.com") {
        toast.error("Demo account cannot delete products!");
        return;
      }
      if (public_id) await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ public_id })
      });
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleConfirmDelete = async () => { await deleteProduct(deleteId); setDeleteId(null); };
  const deleteSelectedProducts = async () => {
  const result = await Swal.fire({
    title: `Delete ${selectedIds.length} selected products?`,
    icon: 'warning',
    showCancelButton: true
  });
  if (!result.isConfirmed) return;

  setLoading(true);

  try {
    let newProducts = [...products];

    for (const id of selectedIds) {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const product = docSnap.data();
        if (product.public_id) {
          await fetch("https://final-backend-2-production.up.railway.app/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ public_id: product.public_id })
          });
        }
        await deleteDoc(docRef);
        newProducts = newProducts.filter(p => p.id !== id);
      }
    }

    // Update products state
    setProducts(newProducts);

    // Reset selectedIds and multiDeleteMode
    setSelectedIds([]);
    setMultiDeleteMode(false);

    // Adjust current page if needed
    const totalPagesAfterDeletion = Math.ceil(newProducts.length / itemsPerPage);
    if (currentPage > totalPagesAfterDeletion) {
      setCurrentPage(totalPagesAfterDeletion || 1);
    }

    Swal.fire("Deleted!", "Selected products deleted.", "success");
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Failed to delete selected products.", "error");
  } finally {
    setLoading(false);
  }
};


  const clearAllProducts = async () => {
    const result = await Swal.fire({ title: 'Are you sure?', text: 'All products will be deleted!', icon: 'warning', showCancelButton: true });
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      const q = query(collection(db, "products"), where("userId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        const product = docSnap.data();
        if (product.public_id) await fetch("https://final-backend-2-production.up.railway.app/delete-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ public_id: product.public_id }) });
        await deleteDoc(doc(db, "products", docSnap.id));
      }
      setProducts([]);
      toast.success("All products deleted!");
    } catch (err) { console.error(err); toast.error("Failed to delete all products."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-4 sm:p-6 bg-white shadow-lg rounded-2xl">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Product List <span className="text-blue-600">({products.length})</span>
        </h2>

        <div className="flex flex-wrap gap-2 items-center">
       <div className="flex items-center space-x-1">
    <StockModal/>
  <CompanyProductsModal />
  <Companies />
  <Unssignedproducts/>
</div>


          {/* Mobile toggle */}
          <div className="sm:hidden mb-2">
            <button onClick={() => setShowMobileActions(!showMobileActions)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded w-full text-left">
              {showMobileActions ? 'Hide Actions ▲' : 'Show Actions ▼'}
            </button>
          </div>

          <ActionsBar showMobileActions={showMobileActions} clearAllProducts={clearAllProducts} />
          <AddProduct addProduct={addProduct} editProduct={editProduct} editModeData={editModeData} setEditModeData={setEditModeData} addThings={addThings} isVisible={!showMobileActions} />
        </div>
      </div>

      <MultiDeleteControls
        multiDeleteMode={multiDeleteMode}
        selectedIds={selectedIds}
        setMultiDeleteMode={setMultiDeleteMode}
        toggleSelection={toggleSelection}
        deleteSelectedProducts={deleteSelectedProducts}
      />

      <ProductTable
        currentProducts={currentProducts}
        startIndex={startIndex}
        multiDeleteMode={multiDeleteMode}
        selectedIds={selectedIds}
        toggleSelection={toggleSelection}
        setEditModeData={setEditModeData}
        setDeleteId={setDeleteId}
        setImageModal={setImageModal}
        handleLongPressStart={handleLongPressStart}
        handleLongPressEnd={handleLongPressEnd}
      />

      <Pagination totalPages={totalPages} currentPage={currentPage} goToPage={goToPage} />
<DeleteModal 
  isOpen={deleteId !== null}
  onCancel={() => setDeleteId(null)}
  onConfirm={handleConfirmDelete}
/>
      <ImageModal imageModal={imageModal} setImageModal={setImageModal} />
      {loading && <Spinner />}
    </div>
  );
};

export default ProductList;
