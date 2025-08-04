import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError("");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setError("No internet connection. Please check your network.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    if (!isOnline) {
      setError("You are offline. Cannot sign in.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Signed In:", user);
    } catch (error) {
      console.error("Sign-In Error:", error);
      setError("Sign-in failed. Try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isOnline) {
      setError("You are offline. Cannot sign up.");
      return;
    }
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Account Created:", user);
    } catch (error) {
      console.error("Sign-Up Error:", error);
      setError("Sign-up failed. Try again.");
    }
  };

  const handleTestLogin = async () => {
    if (!isOnline) {
      setError("You are offline. Cannot sign in.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, "test@stockease.com", "123456");
      console.log("Demo user signed in.");

    
    } catch (error) {
      console.error("Demo login failed", error);
      setError("Demo login failed. Please try again.");
    }
  };

  return (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-cover bg-center">
  <div className="bg-white border border-gray-300 rounded-xl shadow-xl w-full max-w-xs sm:max-w-md p-6 sm:p-4 my-10">
    <div className="text-center space-y-5">
      <div className="flex items-center justify-center gap-2">
        <img
          src="/STOCKEASE.png"
          alt="StockEase Logo"
          className="h-9 w-9 sm:h-10 sm:w-10"
        />
        <h2 className="text-2xl sm:text-3xl font-bold text-black">
          STOCK EASE
        </h2>
      </div>

      <p className="text-gray-700 text-sm sm:text-base font-medium">
        Sign in or create an account using your Google credentials
      </p>

      {error && (
        <div className="text-red-700 text-sm bg-red-100 p-2 rounded-md border border-red-300">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center px-4 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm sm:text-base font-semibold transition"
      >
        <FcGoogle className="text-xl mr-2" />
        Sign in with Google
      </button>

      <div className="flex items-center my-2 sm:my-3">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-2 text-gray-600 text-xs sm:text-sm">Or</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center px-4 py-2 sm:py-3 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full text-sm sm:text-base font-semibold transition"
      >
        <FcGoogle className="text-xl mr-2" />
        Create Account
      </button>

      {/* Demo account login */}
      <div className="mt-5 text-left">
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">🧪 Try Demo Account</p>
        <input
          type="email"
          disabled
          value="test@stockease.com"
          className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs"
        />
        <input
          type="password"
          disabled
          value="123456"
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-xs"
        />
        <button
          onClick={handleTestLogin}
          className="w-full px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-semibold transition"
        >
          Login as Demo User
        </button>
      </div>

      <p className="text-[10px] sm:text-xs text-gray-500 mt-4">
        By signing in, you agree to our{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">Terms</a>{" "}
        and{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
      </p>
    </div>
  </div>
</div>

  );
};

export default GoogleLogin;
