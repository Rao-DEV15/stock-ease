import React from 'react';
import Swal from 'sweetalert2';

const NavBar = ({ user, onLogout }) => {
  const handleLogoutClick = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
        Swal.fire('Logged Out!', 'You have been successfully logged out.', 'success');
      }
    });
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 sm:py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-4">
        {/* Logo */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide truncate">
          STOCK EASE
        </h1>

        {/* Logout button */}
        {user && (
          <button
            onClick={handleLogoutClick}
            className="text-sm sm:text-base bg-red-500 hover:bg-red-600 px-3 sm:px-4 py-2 rounded font-semibold transition-all"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
