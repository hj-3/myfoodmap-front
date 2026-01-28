import { useState } from "react";

// Custom Hooks
import useAuth from "../hooks/useAuth";
import useReviews from "../hooks/useReviews";
import useMapSearch from "../hooks/useMapSearch";

// Components
import SearchBar from "../components/search/SearchBar";
import MapContainer from "../components/map/MapContainer";
import Sidebar from "../components/sidebar/Sidebar";
import WriteReviewModal from "../components/modal/WriteReviewModal";
import BottomNav from "../components/common/BottomNav";

function Home() {
  // Authentication & User
  const { user, logout } = useAuth();

  // Date filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Review data and logic
  const { myReviews, reviewStats, editingReview, startEditReview, cancelEditReview, deleteReview, submitReview } = useReviews(user, startDate, endDate);

  // Map and Place Search
  const { map, setMap, keyword, setKeyword, places, setPlaces, searchPlaces } = useMapSearch();

  // Shared state for UI interaction
  const [selectedPlace, setSelectedPlace] = useState(null); // From search results
  const [selectedReview, setSelectedReview] = useState(null); // From my review markers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  
  // Place to pass to the modal (can be from a search result or an existing review)
  const [placeForModal, setPlaceForModal] = useState(null);

  // --- Handlers to glue components together ---

  const handleOpenWriteModal = (item) => {
    // If it's a review, it has 'kakaoId'. If it's a search result, it has 'id'.
    if (item.kakaoId) { // This is one of my reviews
      setPlaceForModal({
        id: item.kakaoId,
        place_name: item.name,
        road_address_name: item.address,
        x: item.x,
        y: item.y
      });
    } else { // This is a search result (place)
      setPlaceForModal(item);
    }
    setIsWriteModalOpen(true);
    setSelectedPlace(null);
    setSelectedReview(null);
  };
  
  const handleEditReview = (review) => {
      startEditReview(review);
      setIsWriteModalOpen(true);
  }

  const handleCloseWriteModal = () => {
    setIsWriteModalOpen(false);
    cancelEditReview(); // Clear any review being edited
    setPlaceForModal(null);
  };

  const handleSubmitReview = async (reviewPayload) => {
    await submitReview(reviewPayload);
    handleCloseWriteModal(); // Close modal on success
  }
  
  const handleSelectReviewOnMap = (review) => {
      if (map) {
          map.panTo(new window.kakao.maps.LatLng(review.y, review.x));
      }
      setSelectedReview(review);
      setSelectedPlace(null);
      setIsSidebarOpen(false);
  }

  return (
    <div className="w-full h-screen relative font-sans overflow-hidden text-left text-gray-900">
      <SearchBar
        keyword={keyword}
        setKeyword={setKeyword}
        onSubmit={searchPlaces}
      />
      
      <BottomNav 
        user={user}
        onLogout={logout}
        isSidebarOpen={isSidebarOpen}
        onSidebarOpen={() => setIsSidebarOpen(true)}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        reviews={myReviews}
        onReviewSelect={handleSelectReviewOnMap}
        onEdit={handleEditReview}
        onDelete={deleteReview}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        stats={reviewStats}
      />

      <MapContainer
        setMap={setMap}
        myReviews={myReviews}
        places={places}
        selectedPlace={selectedPlace}
        setSelectedPlace={setSelectedPlace}
        selectedReview={selectedReview}
        setSelectedReview={setSelectedReview}
        onEditReview={handleEditReview}
        onAddNewReview={handleOpenWriteModal}
      />

      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={handleCloseWriteModal}
        onSubmit={handleSubmitReview}
        place={placeForModal}
        editingReview={editingReview}
      />
    </div>
  );
}

export default Home;
