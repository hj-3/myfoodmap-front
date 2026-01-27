import React from 'react';
import ReviewItem from './ReviewItem';

const Sidebar = ({ isOpen, onClose, reviews, onReviewSelect, onEdit, onDelete }) => {
  return (
    <div className={`absolute top-0 left-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} w-full sm:w-[320px]`}>
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <h2 className="font-bold text-lg">내 리뷰 ({reviews.length})</h2>
        <button onClick={onClose} className="text-2xl hover:text-gray-200 transition">&times;</button>
      </div>
      <div className="p-4 overflow-y-auto h-full pb-24 bg-gray-50 text-left">
        {reviews.map((review) => (
          <ReviewItem 
            key={review.id}
            review={review}
            onSelect={onReviewSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
