import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const ImportButton = ({ addThings }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFile = async (file) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
const raw = XLSX.utils.sheet_to_json(sheet);

const json = raw.map((row) => {
  const normalized = {};
  Object.keys(row).forEach((key) => {
    const cleanKey = key.toLowerCase().trim(); // Normalize
    normalized[cleanKey] = row[key];
  });
  return normalized;
});

        const valid = json.every(
          (item) =>
            typeof item.name === 'string' &&
            !isNaN(Number(item.price)) &&
            !isNaN(Number(item.quantity))
        );

        
if (!valid) {
  toast.error('Invalid file format. Columns must be: name, price, quantity');
  return;
}
const formatted = json.map((item, index) => ({
  name: item.name?.trim() || "Unnamed Product",
  price: Number(item.price) || 0,
  quantity: Number(item.quantity) || 0,
  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
  index: item.index ?? index,
}));


        await addThings(formatted); //  Upload to Firestore

toast.success(' Products uploaded to Database!');
setShowModal(false);
      } catch (error) {
        console.error(' Error uploading:', error);
        toast.error(' Upload failed.');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm sm:text-base hover:bg-indigo-700 transition"
      >
        Import Data
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full sm:max-w-md p-4 sm:p-8 text-center relative overflow-hidden">
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-50">
                <div className="w-10 h-10 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-2 text-indigo-600">Uploading...</p>
              </div>
            )}

            <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">
              Import Product Data
            </h2>

            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 transition cursor-pointer ${
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => fileInputRef.current.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center pointer-events-none">
                <Plus className="w-10 h-10 text-gray-500" />
                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                  Drag & drop or select from device
                </p>
              </div>
              <input
                type="file"
                accept=".xlsx, .csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            <button
              onClick={() => !loading && setShowModal(false)}
              className={`absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl ${
                loading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportButton;
