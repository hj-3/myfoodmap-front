import { useState, useEffect } from 'react';
import apiClient from '../api/axios';

export default function useReviews(user) {
  const [myReviews, setMyReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null); // 수정할 리뷰 데이터

  
  const fetchMyReviews = async (username) => {
    try {
      const res = await apiClient.get(`/reviews/${username}`);
      const formattedData = res.data.map(r => {
        let formattedDateString = "";
        if (r.visitDate) {
          const localDate = new Date(r.visitDate);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, '0');
          const day = String(localDate.getDate()).padStart(2, '0');
          formattedDateString = `${year}-${month}-${day}`;
        }
        return {
          id: r.reviewId,
          name: r.name,
          address: r.address,
          rating: r.rating,
          menu: r.menuName,
          price: r.price,
          text: r.content,
          imageUrl: r.imageUrl,
          x: String(r.x),
          y: String(r.y),
          kakaoId: r.kakaoId,
          date: formattedDateString
        };
      });
      setMyReviews(formattedData);
    } catch (err) {
      console.error("리뷰 로딩 실패:", err);
      setMyReviews([]); // Clear reviews on error
    }
  };

  // Fetch reviews when user object changes
  useEffect(() => {
    if (user?.username) {
      fetchMyReviews(user.username);
    } else {
      setMyReviews([]); // Clear reviews on logout
    }
  }, [user]);

  const deleteReview = async (reviewId) => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await apiClient.delete(`/reviews/${reviewId}`);
      setMyReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      alert("리뷰가 삭제되었습니다.");
    } catch (err) {
      alert(err.response?.data?.message || "리뷰 삭제에 실패했습니다.");
    }
  };
  
  // Takes a review object and sets it up for editing
  const startEditReview = (review) => {
    setEditingReview(review);
  };
  
  const cancelEditReview = () => {
    setEditingReview(null);
  }

  const submitReview = async ({ reviewData, selectedFile, place, editingReviewId }) => {
    if (!user) {
      alert("로그인 후 리뷰 작성이 가능합니다!");
      return;
    }

    let imageUrl = reviewData.imageUrl || null;

    // 1. Upload image if a new one is selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      try {
        const uploadRes = await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl;
      } catch (err) {
        console.error("이미지 업로드 실패:", err);
        alert(err.response?.data?.message || "이미지 업로드에 실패했습니다.");
        return; // Stop submission on upload failure
      }
    }

    // 2. Differentiate between editing and creating
    if (editingReviewId) {
      // Logic for UPDATING a review
      try {
        await apiClient.put(`/reviews/${editingReviewId}`, {
          rating: reviewData.rating,
          content: reviewData.text,
          menuName: reviewData.menu,
          price: parseInt(String(reviewData.price).replace(/[^0-9]/g, "")) || 0,
          visitDate: `${reviewData.visitDate}T12:00:00.000Z`,
          // Note: Image URL is not updated here, but it could be.
          // The current logic only uploads a new image, it doesn't replace an existing one
          // unless we re-upload. The logic for image handling might need refinement.
          imageUrl: imageUrl
        });
        alert("리뷰가 수정되었습니다!");
        setEditingReview(null);
      } catch (err) {
        alert(err.response?.data?.message || "리뷰 수정 중 오류가 발생했습니다.");
        return; // Stop on error
      }
    } else {
      // Logic for CREATING a new review
      if (!place) {
          alert("리뷰를 작성할 장소를 선택해주세요.");
          return;
      }
      const newReviewPayload = {
        kakaoId: String(place.id),
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        category: place.category_group_name || "",
        x: String(place.x),
        y: String(place.y),
        rating: reviewData.rating,
        visitDate: `${reviewData.visitDate}T12:00:00.000Z`,
        content: reviewData.text,
        menuName: reviewData.menu,
        price: parseInt(reviewData.price) || 0,
        imageUrl: imageUrl,
      };
      try {
        await apiClient.post("/reviews", newReviewPayload);
        alert("리뷰가 저장되었습니다!");
      } catch (err) {
        alert(err.response?.data?.message || "리뷰 저장 중 오류가 발생했습니다.");
        return; // Stop on error
      }
    }

    // 3. Refresh review list on success
    if (user?.username) {
      fetchMyReviews(user.username);
    }
  };

  return {
    myReviews,
    editingReview,
    startEditReview,
    cancelEditReview,
    deleteReview,
    submitReview,
  };
}
