// Spinner.js
import React from 'react';

const Spinner = () => (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

export default Spinner;
