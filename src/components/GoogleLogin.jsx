import React, { useState, useEffect } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

const GoogleLogin = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(""); // Clear error on reconnect
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

  return (
   <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-cover bg-center" style={{ backgroundImage: "url('/your-image-path.jpg')" }}>
  <div className="bg-white/90 border border-gray-300 rounded-2xl shadow-xl p-6 sm:p-10 w-full max-w-md sm:max-w-lg mt-10">
    <div className="text-center space-y-6">
      <h2 className="text-3xl sm:text-4xl font-bold text-black">Welcome Back</h2>
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
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm text-base sm:text-lg font-semibold transition"
      >
        <FcGoogle className="text-2xl mr-3" />
        Sign in with Google
      </button>

      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="mx-4 text-gray-600 text-sm">Or continue with</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={handleGoogleSignUp}
        className="w-full flex items-center justify-center px-6 py-3 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full shadow-sm text-base sm:text-lg font-semibold transition"
      >
        <FcGoogle className="text-2xl mr-3" />
        Create Account
      </button>

      <p className="text-xs sm:text-sm text-gray-500 mt-6">
        By signing in, you agree to our{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="text-blue-600 hover:underline font-medium">
          Privacy Policy
        </a>.
      </p>
    </div>
  </div>
</div>


  );
};

export default GoogleLogin;
