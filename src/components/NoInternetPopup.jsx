import React, { useEffect, useState } from "react";

const NoInternetPopup = () => {
  const [isOffline, setIsOffline] = useState(false);

  const checkConnection = () => {
    const img = new Image();
    img.src = `https://www.google.com/favicon.ico?${Date.now()}`;
    img.onload = () => {
      if (isOffline) {
        setIsOffline(false);
        window.location.reload(); // Refresh on reconnect
        setTimeout(() => window.location.reload(), 1000); // Double refresh
      }
    };
    img.onerror = () => {
      setIsOffline(true);
    };
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md pointer-events-auto">
      <div className="bg-white p-6 rounded-lg text-center shadow-xl">
        <h2 className="text-xl font-bold text-red-600">No Internet Connection Try to refresh</h2>
        <p className="text-gray-700 mt-2">
        </p>
      </div>
    </div>
  );
};

export default NoInternetPopup;
