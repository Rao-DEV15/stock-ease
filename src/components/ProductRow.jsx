import React from 'react';

const ProductRow = ({
  product,
  index,
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
  <div
    className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-start border-b px-4 py-3 hover:bg-gray-50 text-sm"
    onMouseDown={handleLongPressStart}
    onMouseUp={handleLongPressEnd}
    onMouseLeave={handleLongPressEnd}
  >
    <div className="flex items-center gap-2">
      {multiDeleteMode && (
        <input
          type="checkbox"
          checked={selectedIds.includes(product.id)}
          onChange={() => toggleSelection(product.id)}
        />
      )}
      {startIndex + index + 1}. {product.name}
      {product.image && (
        <img
          src={product.image}
          alt="Product"
          className="w-8 h-8 object-cover rounded cursor-pointer hover:scale-105 transition"
          onClick={() => setImageModal(product.image)}
        />
      )}
    </div>

    <div>
      <span className="sm:hidden font-semibold">Price: </span>
      Rs. {product.price}
    </div>

    <div>
      <span style={{ color: Number(product.quantity) <= 5 ? "red" : "inherit" }}>
        {product.quantity}
      </span>
    </div>

    <div className="flex gap-2 justify-start sm:justify-end flex-wrap">
      <button
        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
        onClick={() => setEditModeData({ id: product.id, product: { ...product } })}
      >
        Edit
      </button>
      {!multiDeleteMode && (
        <button
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          onClick={() => setDeleteId(product.id)}
        >
          Delete
        </button>
      )}
    </div>
  </div>
);

export default ProductRow;
