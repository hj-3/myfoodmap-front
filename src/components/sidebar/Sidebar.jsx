import React, { useState } from 'react';
import ReviewItem from './ReviewItem';

const Sidebar = ({ isOpen, onClose, reviews, onReviewSelect, onEdit, onDelete, startDate, setStartDate, endDate, setEndDate, stats }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ type: 'latest', ascending: false });
  const itemsPerPage = 10;
  
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSortConfig({ type: 'latest', ascending: false });
    setCurrentPage(1);
  }

  const handleSortClick = (type) => {
    if (sortConfig.type === type) {
      // 같은 버튼 클릭: 오름차순/내림차순 토글
      setSortConfig({ ...sortConfig, ascending: !sortConfig.ascending });
    } else {
      // 다른 버튼 클릭: 새로운 정렬 타입, 내림차순으로 리셋
      setSortConfig({ type, ascending: false });
    }
    setCurrentPage(1);
  }

  const totalSpending = stats?.totalSpending ? parseInt(stats.totalSpending, 10) : 0;
  const averageRating = stats?.averageRating ? parseFloat(stats.averageRating) : 0;
  const uniqueRestaurantCount = new Set(reviews.map(r => r.name)).size;

  // 정렬 로직
  const sortedReviews = [...reviews].sort((a, b) => {
    switch(sortConfig.type) {
      case 'rating':
        return sortConfig.ascending 
          ? a.rating - b.rating // 평점 낮은순
          : b.rating - a.rating; // 평점 높은순
      case 'price':
        return sortConfig.ascending 
          ? (b.price || 0) - (a.price || 0) // 가격 높은순
          : (a.price || 0) - (b.price || 0); // 가격 낮은순
      case 'latest':
      default:
        return sortConfig.ascending
          ? new Date(a.date) - new Date(b.date) // 오래된순
          : new Date(b.date) - new Date(a.date); // 최신순
    }
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className={`absolute top-0 left-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} w-full sm:w-[320px] flex flex-col`}>
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md flex-shrink-0">
        <h2 className="font-bold text-lg">내 리뷰 ({reviews.length})</h2>
        <button onClick={onClose} className="text-2xl hover:text-gray-200 transition">&times;</button>
      </div>
      
      {/* Date Filter Section */}
      <div className="p-4 border-b bg-gray-50 flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-semibold text-gray-700">방문 날짜로 검색</div>
          <button 
            onClick={handleClearFilter}
            className="text-sm text-gray-600 hover:text-blue-600 transition"
          >
            필터 초기화
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          <span className="text-gray-500">-</span>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
      
      {/* Stats Section */}
      {reviews.length > 0 && (
        <div className="p-3 border-b bg-gray-50 flex-shrink-0">
          <div className="text-sm font-semibold mb-2 text-gray-800">기간 내 요약</div>
          <div className="space-y-1 text-sm p-2 bg-white rounded-md border mb-3">
            {/* Reviews Count */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">남긴 리뷰</span>
              <span className="font-semibold text-gray-800">{reviews.length}개</span>
            </div>
            {/* Restaurants Count */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">방문 식당</span>
              <span className="font-semibold text-gray-800">{uniqueRestaurantCount}곳</span>
            </div>
            {/* Spending */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">총 지출</span>
              <span className="font-bold text-blue-600">
                {totalSpending.toLocaleString('ko-KR')}원
              </span>
            </div>
            {/* Rating */}
            <div className="flex justify-between items-baseline">
              <span className="text-gray-600">평균 평점</span>
              <span className="font-bold text-amber-500">
                {averageRating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Sort Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleSortClick('latest')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold transition ${
                sortConfig.type === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              최신순 {sortConfig.type === 'latest' && (sortConfig.ascending ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortClick('price')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold transition ${
                sortConfig.type === 'price'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              가격순 {sortConfig.type === 'price' && (sortConfig.ascending ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortClick('rating')}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-semibold transition ${
                sortConfig.type === 'rating'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              평점순 {sortConfig.type === 'rating' && (sortConfig.ascending ? '↑' : '↓')}
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 text-left">
        {sortedReviews.length > 0 ? paginatedReviews.map((review) => (
          <ReviewItem 
            key={review.id}
            review={review}
            onSelect={onReviewSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )) : (
          <div className="text-center text-gray-500 pt-8">
            표시할 리뷰가 없습니다.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {sortedReviews.length > itemsPerPage && (
        <div className="p-3 border-t bg-gray-50 flex-shrink-0">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition text-sm font-semibold"
            >
              이전
            </button>
            <span className="text-sm text-gray-700 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition text-sm font-semibold"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
