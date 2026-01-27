import React from 'react';

const ReviewItem = ({ review, onSelect, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-grow pr-4 min-w-0">
          <h3 className="font-bold text-gray-800 text-lg truncate">{review.name}</h3>
          <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
        </div>
        <div className="flex items-baseline space-x-3 flex-shrink-0">
          <span className="text-yellow-400 font-bold text-sm">★ {review.rating}</span>
          <button onClick={() => onEdit(review)} className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition">수정</button>
          <button onClick={() => onDelete(review.id)} className="text-lg font-bold text-gray-400 hover:text-red-500 transition">×</button>
        </div>
      </div>

      <p className="text-[11px] text-gray-500 mb-3 truncate">📍 {review.address}</p>
      <div className="text-xs bg-blue-50 p-3 rounded-lg text-gray-700 mb-3 text-left border-none">
        <div className="flex items-center gap-1 mb-2 font-semibold text-blue-700 border-b border-blue-100 pb-1">
          🍴 {review.menu} | {review.price?.toLocaleString()}원
        </div>
        <p className="text-gray-600 italic">"{review.text}"</p>
      </div>
      <button 
        onClick={() => onSelect(review)} 
        className="w-full text-center text-xs text-blue-600 font-bold py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition"
      >
        상세 정보
      </button>
    </div>
  );
};

export default ReviewItem;
