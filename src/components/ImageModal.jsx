const ImageModal = ({ imageModal, setImageModal }) => imageModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60">
    <div className="relative">
      <img src={imageModal} alt="Product Preview" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl" />
      <button onClick={() => setImageModal(null)} className="absolute top-2 right-2 bg-white text-black rounded-full px-3 py-1 text-xl hover:bg-gray-200">✕</button>
    </div>
  </div>
);
export default ImageModal;
