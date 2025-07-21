import React, { useState, useEffect } from 'react';
import { db, auth } from './components/FireBase';
import {
  collection,
  addDoc,
  orderBy,
  query,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import NavBar from './components/NavBar';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import GoogleLogin from './components/GoogleLogin'; 
import NoInternetPopup from './components/NoInternetPopup';


const App = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);


  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setAuthLoading(false); 
  });

  return () => unsubscribe();
}, []);


  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(allProducts);
    });

    return () => unsubscribe();
  }, [user]);

  const addProduct = async (product) => {
    try {
      if (Array.isArray(product)) {
        await Promise.all(
          product.map(p =>
            addDoc(collection(db, 'products'), {
              ...p,
              createdAt: serverTimestamp(),
            })
          )
        );
      } else {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
 
  };

  const editProduct = (id, updatedProduct) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...updatedProduct, id } : p))
    );
    
  };

  const handleLogout = () => {
    signOut(auth).catch((err) => console.error("Logout failed:", err));
  };

  if (authLoading) {
  return <div style={{ textAlign: 'center', marginTop: '100px' }}>Loading...</div>; // or a spinner
}
return (
  <div>
   
    <NoInternetPopup />

    {!user ? (
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <source src="https://res.cloudinary.com/drul2tusd/video/upload/v1752813813/samples/sea-turtle.mp4" type="video/mp4" />
        </video>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <GoogleLogin />
        </div>
      </div>
    ) : (
      <>
      
<NavBar user={user} onLogout={handleLogout} />
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ProductList
          products={products}
          searchTerm={searchTerm}
          addProduct={addProduct}
          deleteProduct={deleteProduct}
          editProduct={editProduct}
          setProducts={setProducts}
        />
      </>
    )}
  </div>
);

}
export default App;
