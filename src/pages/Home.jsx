import { useState, useEffect, useRef } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import { Link } from "react-router-dom";
import axios from "axios"; 

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={`cursor-pointer text-2xl ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

function Home() {
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);      
  const [selectedPlace, setSelectedPlace] = useState(null); 
  const [selectedReview, setSelectedReview] = useState(null); 
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false); 
  const [myReviews, setMyReviews] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [user, setUser] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null); // 수정 중인 리뷰 ID

  const [reviewData, setReviewData] = useState({
    rating: 5, text: "", menu: "", price: "", photo: null, visitDate: new Date().toISOString().split('T')[0],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchMyReviews(parsedUser.username); 
    }
  }, []);

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

  const fetchMyReviews = async (username) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/reviews/${username}`);
      const formattedData = res.data.map(r => {
        let formattedDateString = "";
        if (r.visitDate) {
          // 서버에서 받은 UTC 날짜 문자열을 브라우저의 로컬 시간대로 변환
          const localDate = new Date(r.visitDate);
          
          const year = localDate.getFullYear();
          // getMonth()는 0부터 시작하므로 1을 더함
          const month = String(localDate.getMonth() + 1).padStart(2, '0');
          // getDate()는 현지 시간 기준 날짜
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
          date: formattedDateString // 올바르게 포맷된 로컬 날짜 사용
        };
      });
      setMyReviews(formattedData);
    } catch (err) {
      console.error("리뷰 로딩 실패:", err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/reviews/${reviewId}`);
      setMyReviews(myReviews.filter(review => review.id !== reviewId));
      if (selectedReview?.id === reviewId) setSelectedReview(null);
      alert("리뷰가 삭제되었습니다.");
    } catch (err) { alert("리뷰 삭제에 실패했습니다."); }
  };

  // 리뷰 수정 모드 진입
  const handleEditReview = (review) => {
    setReviewData({
      rating: review.rating,
      text: review.text,
      menu: review.menu,
      price: review.price,
      visitDate: review.date
    });
    setPreviewImage(review.imageUrl); // 기존 이미지 미리보기 설정
    // 모달 헤더에 식당 이름을 띄우기 위해 임시 객체 설정
    setSelectedPlace({
      place_name: review.name,
    });
    setEditingReviewId(review.id);
    setIsWriteModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("user");
      setUser(null);
      setMyReviews([]); 
      setSelectedReview(null);
      alert("로그아웃 되었습니다.");
    }
  };

  const ps = new kakao.maps.services.Places();

  const searchPlaces = (e) => {

    e.preventDefault();

    if (!keyword.trim()) return alert("검색어를 입력하세요!");

    if (!map) return;

    const localOptions = { location: map.getCenter(), radius: 5000, size: 15, sort: kakao.maps.services.SortBy.ACCURACY };

    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        setPlaces(data);
        setSelectedPlace(null);
        if (data[0]) map.panTo(new kakao.maps.LatLng(data[0].y, data[0].x));
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        ps.keywordSearch(keyword, (data2, status2) => {
          if (status2 === kakao.maps.services.Status.OK) {
            setPlaces(data2);
            setSelectedPlace(null);
            if (data2[0]) {
              map.setCenter(new kakao.maps.LatLng(data2[0].y, data2[0].x));
              map.setLevel(3);
            }
          } else { alert("검색 결과가 없습니다."); }
        });
      }

    }, localOptions);

  };

  const handleConquer = async () => {
    if (!user) return alert("로그인 후 리뷰 작성이 가능합니다!");

    // 업로드된 이미지 URL을 저장할 변수
    let imageUrl = null;
    
    // 수정 모드일 때, 기존 이미지 URL을 유지
    if (editingReviewId) {
      const existingReview = myReviews.find(r => r.id === editingReviewId);
      imageUrl = existingReview?.imageUrl || null;
    }

    // 새 파일이 선택된 경우, 업로드하고 imageUrl을 업데이트
    if (selectedFile) {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      try {
        const uploadRes = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl; // 새로 업로드된 이미지 URL
      } catch (err) {
        console.error("이미지 업로드 실패:", err);
        alert("이미지 업로드에 실패했습니다.");
        return; // 업로드 실패 시 중단
      }
    }
    
    // 수정 모드일 경우 (PUT 요청)
    if (editingReviewId) {
      try {
        await axios.put(`http://localhost:3000/api/reviews/${editingReviewId}`, {
          rating: reviewData.rating,
          content: reviewData.text,
          menuName: reviewData.menu,
          price: parseInt(reviewData.price) || 0,
          visitDate: `${reviewData.visitDate}T12:00:00.000Z`,
          // imageUrl은 수정 요청에 포함하지 않음 (사진 변경은 별도 구현)
        });
        alert("리뷰가 수정되었습니다!");
        fetchMyReviews(user.username); // 목록 새로고침
      } catch (err) {
        alert("리뷰 수정 중 오류가 발생했습니다.");
      }
    } else { // 신규 등록일 경우 (POST 요청)
      const newReview = {
        userId: user.id, 
        kakaoId: String(selectedPlace.id), 
        name: selectedPlace.place_name,
        address: selectedPlace.road_address_name || selectedPlace.address_name,
        category: selectedPlace.category_group_name || "", 
        x: String(selectedPlace.x), 
        y: String(selectedPlace.y),
        rating: reviewData.rating, 
        visitDate: `${reviewData.visitDate}T12:00:00.000Z`,
        content: reviewData.text, 
        menuName: reviewData.menu,
        price: parseInt(reviewData.price) || 0, 
        imageUrl: imageUrl // 최종 이미지 URL
      };
      try {
        await axios.post("http://localhost:3000/api/reviews", newReview);
        alert("리뷰가 저장되었습니다!");
        fetchMyReviews(user.username); // 목록 새로고침
        setIsSidebarOpen(true);
      } catch (err) { 
        alert("리뷰 저장 중 오류가 발생했습니다."); 
      }
    }

    // 공통: 모달 닫기 및 모든 관련 상태 초기화
    setIsWriteModalOpen(false);
    setEditingReviewId(null);
    setSelectedPlace(null);
    setReviewData({ rating: 5, text: "", menu: "", price: "", visitDate: new Date().toISOString().split('T')[0] });
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // 파일 인풋의 내부 값도 초기화
    }
  };

  return (
    <div className="w-full h-screen relative font-sans overflow-hidden text-left text-gray-900">
      {/* 검색창 */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-md sm:w-full">
        <form onSubmit={searchPlaces} className="bg-white p-2 rounded-2xl shadow-xl flex gap-2 border border-gray-100">
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="지역 + 검색어" className="flex-1 p-2 outline-none text-sm ml-2 bg-transparent" />
          <button type="submit" className="bg-blue-600 text-white px-5 rounded-xl font-bold hover:bg-blue-700 transition">검색</button>
        </form>
      </div>

      {/* 하단 바 */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-row gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="bg-white px-6 py-3 rounded-full shadow-2xl font-bold text-gray-700 border border-gray-100 active:scale-95 whitespace-nowrap">내 리뷰</button>
        )}
        {user ? (
          <button onClick={handleLogout} className="bg-gray-800 px-6 py-3 rounded-full shadow-2xl font-bold text-white whitespace-nowrap">{user.nickname} 님</button>
        ) : (
          <Link to="/login" className="bg-blue-600 px-6 py-3 rounded-full shadow-2xl font-bold text-white no-underline whitespace-nowrap text-center">로그인</Link> 
        )}
      </div>
      
      {/* 사이드바 */}
      <div className={`absolute top-0 left-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} w-full sm:w-[320px]`}>
        <div className="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
          <h2 className="font-bold text-lg">내 리뷰 ({myReviews.length})</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-2xl hover:text-gray-200 transition">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto h-full pb-24 bg-gray-50 text-left">
          {myReviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100 hover:shadow-md transition">
              {review.imageUrl && (
                <img src={review.imageUrl} alt={review.name} className="w-64 max-h-64 h-auto mx-auto object-contain rounded-md mb-3 bg-black" />
              )}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-grow pr-4">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight truncate">{review.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-1">{review.date}</p>
                </div>
                <div className="flex items-baseline space-x-3 flex-shrink-0">
                  <span className="text-yellow-400 font-bold text-sm">★ {review.rating}</span>
                  <button onClick={() => handleEditReview(review)} className="text-xs font-semibold text-gray-500 hover:text-blue-500 transition">수정</button>
                  <button onClick={() => handleDeleteReview(review.id)} className="text-lg font-bold text-gray-400 hover:text-red-500 transition">×</button>
                </div>
              </div>
              
              <p className="text-[11px] text-gray-500 mb-3 truncate">📍 {review.address}</p>
              <div className="text-xs bg-blue-50 p-3 rounded-lg text-gray-700 mb-3 text-left border-none">
                <div className="flex items-center gap-1 mb-2 font-semibold text-blue-700 border-b border-blue-100 pb-1">
                  🍴 {review.menu} | {review.price?.toLocaleString()}원
                </div>
                <p className="text-gray-600 italic">"{review.text}"</p>
              </div>
              <button onClick={() => { 
                map.panTo(new kakao.maps.LatLng(review.y, review.x)); 
                setSelectedReview(review); 
                setSelectedPlace(null);
                setIsSidebarOpen(false); 
              }} className="w-full text-center text-xs text-blue-600 font-bold py-2 border border-blue-200 rounded-md hover:bg-blue-50 transition">위치 보기</button>
            </div>
          ))}
        </div>
      </div>

      <Map 
        center={{ lat: 37.4979, lng: 127.0276 }} style={{ width: "100%", height: "100%" }} level={3} onCreate={setMap}
        onClick={() => { setSelectedPlace(null); setSelectedReview(null); }}
      >
        {/* 1. 내 리뷰 마커 (그룹화 로직) */}
        {Array.from(new Set(myReviews.map(r => `${r.x},${r.y}`))).map(coord => {
          const [x, y] = coord.split(',');
          const firstReview = myReviews.find(r => r.x === x && r.y === y);
          return (
            <MapMarker 
              key={`my-marker-${coord}`} 
              position={{ lat: parseFloat(y), lng: parseFloat(x) }} 
              image={{ src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", size: { width: 24, height: 35 } }} 
              onClick={() => { setSelectedReview(firstReview); setSelectedPlace(null); }}
            />
          );
        })}

        {/* 2. 내 리뷰 클릭 오버레이 (리뷰 리스트 + 리뷰 추가 버튼) */}
        {selectedReview && (
          <CustomOverlayMap 
            position={{ lat: parseFloat(selectedReview.y), lng: parseFloat(selectedReview.x) }} 
            yAnchor={1.35}
            clickable={true}
          >
            <div className="bg-white p-4 rounded-xl shadow-2xl border-2 border-yellow-400 w-64 relative z-50 text-left" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-2 truncate">{selectedReview.name}</h3>
              {selectedReview.imageUrl && (
                  <img src={selectedReview.imageUrl} alt={selectedReview.name} className="w-64 max-h-64 h-auto mx-auto object-contain rounded-md mb-3 bg-black" />
              )}
              <div className="max-h-40 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {myReviews.filter(r => r.x === selectedReview.x && r.y === selectedReview.y).map((rev, idx) => (
                  <div key={rev.id} className="text-xs border-b border-gray-100 pb-2 last:border-none">
                    <div className="flex justify-between font-bold text-blue-600 mb-1">
                      <span>방문 #{idx + 1}</span>
                      <span className="text-yellow-400 text-[10px]">★ {rev.rating}</span>
                      <button onClick={() => handleEditReview(rev)} className="text-[10px] text-gray-400 underline hover:text-blue-600 ml-2">수정</button>
                      <span className="text-[9px] text-gray-400 font-normal">{rev.date}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{rev.menu} ({rev.price?.toLocaleString()}원)</p>
                    <p className="text-gray-500 italic leading-snug">"{rev.text}"</p>
                  </div>
                ))}
              </div>
              
              {/* 리뷰 추가하기 버튼 */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlace({
                    id: selectedReview.kakaoId,
                    place_name: selectedReview.name,
                    road_address_name: selectedReview.address,
                    x: selectedReview.x,
                    y: selectedReview.y
                  });
                  setIsWriteModalOpen(true);
                  setSelectedReview(null);
                }}
                className="mt-3 w-full py-2 bg-yellow-400 text-white font-bold rounded-lg text-[11px] shadow-sm active:scale-95 transition"
              >
                + 리뷰 남기기
              </button>

              <button onClick={() => setSelectedReview(null)} className="mt-2 w-full py-1 text-[10px] text-gray-400">닫기</button>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-yellow-400"></div>
            </div>
          </CustomOverlayMap>
        )}

        {/* 3. 검색 결과 마커 (이미 리뷰한 곳이면 빨간 마커 숨김) */}
        {places.map((place) => {
          const isAlreadyReviewed = myReviews.some(r => String(r.x) === String(place.x) && String(r.y) === String(place.y));
          if (isAlreadyReviewed) return null;

          return (
            <MapMarker 
              key={`search-marker-${place.id}`} 
              position={{ lat: parseFloat(place.y), lng: parseFloat(place.x) }} 
              onClick={() => { setSelectedPlace(place); setSelectedReview(null); }} 
              image={{ src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png", size: { width: 24, height: 35 } }} 
            />
          );
        })}

        {/* 4. 검색 결과 오버레이 */}
        {selectedPlace && (
          <CustomOverlayMap 
            position={{ lat: parseFloat(selectedPlace.y), lng: parseFloat(selectedPlace.x) }} 
            yAnchor={1.4}
            clickable={true}
          >
            <div 
              className="bg-white p-4 rounded-xl shadow-2xl border border-gray-200 w-72 text-center relative z-50 text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg text-gray-800 truncate">{selectedPlace.place_name}</h3>
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded text-left mt-2">
                <p>📍 {selectedPlace.road_address_name || selectedPlace.address_name}</p>
                <p>📞 {selectedPlace.phone || "전화번호 없음"}</p>
              </div>
              <div className="flex gap-2 mt-3 text-left">
                <a 
                  href={selectedPlace.place_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-gray-100 text-gray-600 text-[11px] font-bold py-2 rounded-lg no-underline text-center flex items-center justify-center border-none"
                >
                  상세 정보
                </a>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsWriteModalOpen(true); 
                  }} 
                  className="flex-1 bg-yellow-400 text-white font-bold py-2 rounded-lg text-[11px] shadow-md transition active:scale-95 border-none"
                >
                  리뷰 남기기
                </button>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-200"></div>
            </div>
          </CustomOverlayMap>
        )}
      </Map>

      {/* 5. 리뷰 작성 모달 */}
      {isWriteModalOpen && (
       <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
         <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
           <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
             <h2 className="font-bold text-lg text-left">{editingReviewId ? "리뷰 수정하기" : "리뷰 남기기"}</h2>
             <button onClick={() => {
               setIsWriteModalOpen(false);
               setEditingReviewId(null);
               setReviewData({ rating: 5, text: "", menu: "", price: "", photo: null, visitDate: new Date().toISOString().split('T')[0] });
               setSelectedFile(null);
               setPreviewImage(null);
             }} className="text-2xl hover:scale-110 transition">&times;</button>
           </div>
           <div className="p-5 flex flex-col gap-4 text-left">
             {/* 식당 이름 표시 영역 */}
             <div className="text-center border-b pb-3">
               <p className="text-gray-500 text-xs text-left">다녀온 곳</p>
               <h3 className="text-xl font-bold text-gray-800 truncate text-left">{selectedPlace?.place_name || "정보 로딩중..."}</h3>
             </div>

             {/* 방문 날짜 입력 영역*/}
             <div className="flex flex-col gap-1 border-b pb-3">
               <label className="font-bold text-gray-700 text-sm px-1">방문한 날짜</label>
               <input 
                 type="date" 
                 className="w-full border p-2 rounded-xl bg-gray-50 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-400 transition"
                 value={reviewData.visitDate}
                 onChange={(e) => setReviewData({...reviewData, visitDate: e.target.value})}
               />
             </div>

              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <div 
                className="w-full h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition relative"
                onClick={() => fileInputRef.current.click()}
              >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                  ) : (
                    <span className="text-sm">사진 첨부</span>
                  )}
              </div>

             <div className="flex justify-between items-center">
               <span className="font-bold text-gray-700 text-sm">내 평점</span>
               <StarRating rating={reviewData.rating} setRating={(r) => setReviewData({...reviewData, rating: r})} />
             </div>

             <div className="grid grid-cols-2 gap-2 text-left">
              <input type="text" placeholder="메뉴" className="border p-2 rounded bg-gray-50 text-sm outline-none focus:bg-white focus:border-blue-400" value={reviewData.menu} onChange={(e) => setReviewData({...reviewData, menu: e.target.value})} />
              <input type="text" placeholder="가격" className="border p-2 rounded bg-gray-50 text-sm outline-none focus:bg-white focus:border-blue-400" value={reviewData.price} onChange={(e) => setReviewData({...reviewData, price: e.target.value})} />
             </div>

             <textarea placeholder="리뷰를 남겨주세요!" className="w-full border p-3 rounded-lg bg-gray-50 text-sm h-24 resize-none outline-none focus:bg-white focus:border-blue-400 text-left" value={reviewData.text} onChange={(e) => setReviewData({...reviewData, text: e.target.value})} />
        
             {/* 저장 버튼 (handleConquer에서 visitDate 중복 선언 지웠는지 꼭 확인!) */}
             <button onClick={handleConquer} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition transform active:scale-95 shadow-lg">
               {editingReviewId ? "수정완료" : "저장하기"}
             </button>
           </div>
         </div>
       </div>
     )}
    </div>
  );
}

export default Home;