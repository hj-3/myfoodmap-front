import React, { useState, useEffect, useRef } from 'react';
import StarRating from '../common/StarRating';

const WriteReviewModal = ({ isOpen, onClose, onSubmit, place, editingReview }) => {
  const [reviewData, setReviewData] = useState({
    rating: 5,
    text: "",
    menu: "",
    price: "",
    visitDate: new Date().toISOString().split('T')[0],
    imageUrl: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingReview) {
      setReviewData({
        rating: editingReview.rating,
        text: editingReview.text,
        menu: editingReview.menu,
        price: editingReview.price,
        visitDate: editingReview.date,
        imageUrl: editingReview.imageUrl,
      });
      setPreviewImage(editingReview.imageUrl);
    } else {
      // Reset form for new review
      setReviewData({
        rating: 5, text: "", menu: "", price: "", visitDate: new Date().toISOString().split('T')[0], imageUrl: null
      });
      setPreviewImage(null);
    }
  }, [editingReview, isOpen]); // Reset when modal opens or editingReview changes

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (newRating) => {
    setReviewData(prev => ({ ...prev, rating: newRating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 입력 항목 검증
    if (!reviewData.menu.trim() || !String(reviewData.price).trim() || !reviewData.text.trim()) {
      alert("메뉴, 가격, 내용은 필수 입력 항목입니다.");
      return;
    }
    
    setIsLoading(true);
    try {
      await onSubmit({
        reviewData,
        selectedFile,
        place,
        editingReviewId: editingReview ? editingReview.id : null,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset all state on close
    setReviewData({ rating: 5, text: "", menu: "", price: "", visitDate: new Date().toISOString().split('T')[0], imageUrl: null });
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <h2 className="font-bold text-lg text-left">{editingReview ? "리뷰 수정하기" : "리뷰 남기기"}</h2>
          <button onClick={handleClose} className="text-2xl hover:scale-110 transition">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-left">
          <div className="text-center border-b pb-3">
            <p className="text-gray-500 text-xs text-left">다녀온 곳</p>
            <h3 className="text-xl font-bold text-gray-800 truncate text-left">{place?.place_name || editingReview?.name || "정보 로딩중..."}</h3>
          </div>

          <div className="flex flex-col gap-1 border-b pb-3">
            <label className="font-bold text-gray-700 text-sm px-1">방문한 날짜</label>
            <input
              type="date"
              name="visitDate"
              className="w-full border p-2 rounded-xl bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 transition"
              value={reviewData.visitDate}
              onChange={handleInputChange}
            />
          </div>

          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <div
            className="w-full h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition relative"
            onClick={() => fileInputRef.current.click()}
          >
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-sm">사진 첨부</span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700 text-sm">내 평점</span>
            <StarRating rating={reviewData.rating} setRating={handleRatingChange} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <input type="text" placeholder="메뉴" name="menu" className="border p-2 rounded bg-gray-50 text-sm outline-none focus:bg-white focus:border-blue-400" value={reviewData.menu} onChange={handleInputChange} />
            <input type="text" placeholder="가격" name="price" className="border p-2 rounded bg-gray-50 text-sm outline-none focus:bg-white focus:border-blue-400" value={reviewData.price} onChange={handleInputChange} />
          </div>

          <textarea placeholder="리뷰를 남겨주세요!" name="text" className="w-full border p-3 rounded-lg bg-gray-50 text-sm h-24 resize-none outline-none focus:bg-white focus:border-blue-400 text-left" value={reviewData.text} onChange={handleInputChange} />

          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition transform active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {editingReview ? "수정완료" : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WriteReviewModal;
