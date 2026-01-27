import React from 'react';
import { Link } from 'react-router-dom';

const BottomNav = ({ user, onLogout, onSidebarOpen, isSidebarOpen }) => {
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-row gap-4">
      {!isSidebarOpen && (
        <button onClick={onSidebarOpen} className="bg-white px-6 py-3 rounded-full shadow-2xl font-bold text-gray-700 border border-gray-100 active:scale-95 whitespace-nowrap">
          내 리뷰
        </button>
      )}
      {user ? (
        <button onClick={onLogout} className="bg-gray-800 px-6 py-3 rounded-full shadow-2xl font-bold text-white whitespace-nowrap">
          {user.nickname} 님
        </button>
      ) : (
        <Link to="/login" className="bg-blue-600 px-6 py-3 rounded-full shadow-2xl font-bold text-white no-underline whitespace-nowrap text-center">
          로그인
        </Link>
      )}
    </div>
  );
};

export default BottomNav;
