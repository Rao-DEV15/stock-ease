
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAGh2JxBZOZV55nsphn6xAC8LCa57XPg7k",
  authDomain: "price-checker-4f874.firebaseapp.com",
  projectId: "price-checker-4f874",
  storageBucket: "price-checker-4f874.appspot.com",  
  messagingSenderId: "3751534959",
  appId: "1:3751534959:web:90309866af41446b87889a",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
