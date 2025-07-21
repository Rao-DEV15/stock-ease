import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="w-full px-4 sm:px-6 mt-4 sm:mt-6 max-w-3xl mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by product name..."
        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-base sm:text-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default SearchBar;
