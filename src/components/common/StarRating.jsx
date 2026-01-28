import React from 'react';

const StarRating = ({ rating, setRating, isEditable = true, size = 'base' }) => {
  const sizeClasses = {
    sm: 'text-base',
    base: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`
            ${isEditable ? 'cursor-pointer' : ''} 
            ${sizeClasses[size] || sizeClasses.base}
            ${star <= rating ? "text-yellow-400" : "text-gray-300"}
          `}
          onClick={() => isEditable && setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
