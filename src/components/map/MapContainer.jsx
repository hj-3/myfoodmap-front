import React, { useState } from 'react';
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";

const MapContainer = ({ 
  setMap, 
  myReviews, 
  places, 
  selectedPlace, 
  setSelectedPlace, 
  selectedReview, 
  setSelectedReview,
  onEditReview,
  onAddNewReview,
}) => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const handleSelectReview = (review) => {
    setSelectedReview(review);
    setSelectedPlace(null);
    // Find all reviews at this location and set index to the first one
    const reviewsForLocation = myReviews.filter(r => r.x === review.x && r.y === review.y);
    const reviewIndex = reviewsForLocation.findIndex(r => r.id === review.id);
    setCurrentReviewIndex(reviewIndex >= 0 ? reviewIndex : 0);
  }
  
  const handleSelectPlace = (place) => {
      setSelectedPlace(place);
      setSelectedReview(null);
  }

  // Combine review and place markers logic to avoid duplicates
  const allMarkers = [];
  
  // Create markers for user's reviews
  const reviewedCoords = new Set();
  myReviews.forEach(review => {
    const coord = `${review.x},${review.y}`;
    if (!reviewedCoords.has(coord)) {
      allMarkers.push({
        type: 'my-review',
        position: { lat: parseFloat(review.y), lng: parseFloat(review.x) },
        review: review,
      });
      reviewedCoords.add(coord);
    }
  });

  // Create markers for search results, excluding those already reviewed
  places.forEach(place => {
    const coord = `${place.x},${place.y}`;
    if (!reviewedCoords.has(coord)) {
      allMarkers.push({
        type: 'search',
        position: { lat: parseFloat(place.y), lng: parseFloat(place.x) },
        place: place,
      });
    }
  });

  return (
    <Map 
      center={{ lat: 37.4979, lng: 127.0276 }} 
      style={{ width: "100%", height: "100%" }} 
      level={3} 
      onCreate={setMap}
      onClick={() => { setSelectedPlace(null); setSelectedReview(null); }}
    >
      {/* Render all markers */}
      {allMarkers.map((marker, index) => (
        <MapMarker 
          key={`marker-${marker.type}-${index}`}
          position={marker.position}
          image={{
            src: marker.type === 'my-review' 
              ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png" 
              : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
            size: { width: 24, height: 35 }
          }}
          onClick={() => {
            if (marker.type === 'my-review') {
              handleSelectReview(marker.review);
            } else {
              handleSelectPlace(marker.place);
            }
          }}
        />
      ))}

      {/* Overlay for Selected Review */}
      {selectedReview && (() => {
        const reviewsForLocation = myReviews.filter(r => r.x === selectedReview.x && r.y === selectedReview.y);
        const reviewToShow = reviewsForLocation[currentReviewIndex];
        if (!reviewToShow) return null;

        return (
          <CustomOverlayMap position={{ lat: parseFloat(selectedReview.y), lng: parseFloat(selectedReview.x) }} yAnchor={1.35} clickable={true}>
            <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-yellow-400 w-64 relative z-50 text-left" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <h3 className="font-bold text-gray-800 truncate">{reviewToShow.name}</h3>
                {reviewsForLocation.length > 1 && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {currentReviewIndex + 1} / {reviewsForLocation.length}
                  </span>
                )}
              </div>
              {reviewToShow.imageUrl && <img src={reviewToShow.imageUrl} alt={reviewToShow.name} className="w-full h-40 object-cover rounded-md mb-3 bg-black" />}
              <div className="text-xs border-b border-gray-100 pb-2 last:border-none">
                <div className="flex justify-between items-start font-bold text-blue-600 mb-1">
                  <div>
                    <span>방문 #{currentReviewIndex + 1}</span>
                    <p className="text-[9px] text-gray-400 font-normal">{reviewToShow.date}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-[10px] mr-2">★ {reviewToShow.rating}</span>
                    <button onClick={() => onEditReview(reviewToShow)} className="text-[10px] text-gray-400 underline hover:text-blue-600">수정</button>
                  </div>
                </div>
                <p className="font-semibold text-gray-800 mt-2">{reviewToShow.menu} ({reviewToShow.price?.toLocaleString()}원)</p>
                <p className="text-gray-500 italic leading-snug">"{reviewToShow.text}"</p>
              </div>
              {reviewsForLocation.length > 1 && (
                <div className="flex justify-between mt-2">
                  <button onClick={() => setCurrentReviewIndex(prev => prev > 0 ? prev - 1 : reviewsForLocation.length - 1)} className="text-xs font-bold text-gray-600 hover:text-black">이전</button>
                  <button onClick={() => setCurrentReviewIndex(prev => prev < reviewsForLocation.length - 1 ? prev + 1 : 0)} className="text-xs font-bold text-gray-600 hover:text-black">다음</button>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); onAddNewReview(reviewToShow); }} className="mt-3 w-full py-2 bg-yellow-400 text-white font-bold rounded-lg text-[11px] shadow-sm active:scale-95 transition">+ 리뷰 남기기</button>
              <button onClick={() => setSelectedReview(null)} className="mt-2 w-full py-1 text-[10px] text-gray-400">닫기</button>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-yellow-400"></div>
            </div>
          </CustomOverlayMap>
        )
      })()}

      {/* Overlay for Selected Place (Search Result) */}
      {selectedPlace && (
        <CustomOverlayMap position={{ lat: parseFloat(selectedPlace.y), lng: parseFloat(selectedPlace.x) }} yAnchor={1.4} clickable={true}>
          <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-72 text-center relative z-50 text-left" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-gray-800 truncate">{selectedPlace.place_name}</h3>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-left mt-2">
              <p>📍 {selectedPlace.road_address_name || selectedPlace.address_name}</p>
              <p>📞 {selectedPlace.phone || "전화번호 없음"}</p>
            </div>
            <div className="flex gap-2 mt-3 text-left">
              <a href={selectedPlace.place_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 bg-gray-100 text-gray-600 text-[11px] font-bold py-2 rounded-lg no-underline text-center flex items-center justify-center border-none">상세 정보</a>
              <button onClick={(e) => { e.stopPropagation(); onAddNewReview(selectedPlace); }} className="flex-1 bg-yellow-400 text-white font-bold py-2 rounded-lg text-[11px] shadow-md transition active:scale-95 border-none">리뷰 남기기</button>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200"></div>
          </div>
        </CustomOverlayMap>
      )}
    </Map>
  );
};

export default MapContainer;