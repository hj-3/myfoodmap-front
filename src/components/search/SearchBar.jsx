import React from 'react';

const SearchBar = ({ keyword, setKeyword, onSubmit }) => {
  return (
    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md sm:w-full">
      <form onSubmit={onSubmit} className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 border border-gray-100">
        <input 
          type="text" 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
          placeholder="지역 + 검색어" 
          className="flex-1 p-2 outline-none text-sm ml-2 bg-transparent" 
        />
        <button type="submit" className="bg-blue-600 text-white px-5 rounded-xl font-bold hover:bg-blue-700 transition">검색</button>
      </form>
    </div>
  );
};

export default SearchBar;
