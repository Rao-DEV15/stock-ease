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
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-md sm:max-w-lg transition-all duration-300">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md">Welcome Back</h2>
          <p className="text-gray-200 text-sm sm:text-base">
            Sign in or create an account using your Google credentials
          </p>

          {/* Error Message */}
          {error && (
            <div className="text-red-300 text-sm bg-red-800/20 p-2 rounded-md border border-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-6 py-3 bg-white bg-opacity-80 border border-gray-300 rounded-full shadow-sm hover:shadow-md transition duration-200 ease-in-out text-gray-800 font-medium text-base sm:text-lg hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            <FcGoogle className="text-2xl mr-3" />
            Sign in with Google
          </button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/30"></div>
            <span className="mx-4 text-white text-sm bg-transparent">Or continue with</span>
            <div className="flex-grow border-t border-white/30"></div>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 border border-indigo-700 rounded-full shadow-sm hover:shadow-md transition duration-200 ease-in-out text-white font-medium text-base sm:text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FcGoogle className="text-2xl mr-3" />
            Create Account
          </button>

          <p className="text-xs sm:text-sm text-gray-300 mt-6">
            By signing in, you agree to our{" "}
            <a href="#" className="text-indigo-300 hover:text-indigo-100 font-medium">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-indigo-300 hover:text-indigo-100 font-medium">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleLogin;
