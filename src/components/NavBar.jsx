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
    <nav className="bg-blue-600 text-white px-4 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
      
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide text-center sm:text-left">
          STOCK EASE
        </h1>

       
        {user && (
          <button
            onClick={handleLogoutClick}
            className="mt-2 sm:mt-0 bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold transition-all w-full sm:w-auto text-center"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
