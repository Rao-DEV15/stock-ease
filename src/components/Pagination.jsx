import React from 'react';

const Pagination = ({ totalPages, currentPage, goToPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4 gap-2 flex-wrap">
      <button
        className="px-3 py-1 border rounded hover:bg-gray-100"
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }).map((_, i) => (
        <button
          key={i}
          onClick={() => goToPage(i + 1)}
          className={`px-3 py-1 border rounded ${
            currentPage === i + 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="px-3 py-1 border rounded hover:bg-gray-100"
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
