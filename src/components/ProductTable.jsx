import React from 'react';
import ProductRow from './ProductRow';

const ProductTable = ({
  currentProducts,
  startIndex,
  multiDeleteMode,
  selectedIds,
  toggleSelection,
  setEditModeData,
  setDeleteId,
  setImageModal,
  handleLongPressStart,
  handleLongPressEnd
}) => (
  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
    <div className="hidden sm:grid grid-cols-5 bg-blue-600 text-white font-semibold text-lg py-3 px-4 rounded-t-lg sticky top-0 z-10">
  <div>Name</div>
  <div>Price</div>
  <div>Quantity</div>
  <div>Total</div> {/* New column */}
  <div className="text-right pr-2">Actions</div>
</div>

    {currentProducts.length === 0 ? (
      <div className="px-4 py-6 text-center text-gray-500 col-span-4">
        {currentProducts.length === 0 ? 'No matching products found' : 'No products yet. Add one!'}
      </div>
    ) : (
      currentProducts.map((product, index) => (
  <ProductRow
    key={product.id}
    product={product}
    totalPrice={product.price * product.quantity} // calculate here
    index={index}
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
      ))
    )}
  </div>
);

export default ProductTable;
