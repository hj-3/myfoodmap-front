import { useState } from 'react';

const ps = new window.kakao.maps.services.Places();

export default function useMapSearch() {
  const [map, setMap] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]);

  const searchPlaces = (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return alert("검색어를 입력하세요!");
    if (!map) return;

    const callback = (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setPlaces(data);
        if (data.length > 0) {
          map.panTo(new window.kakao.maps.LatLng(data[0].y, data[0].x));
        }
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        // Try searching without location context if no results
        ps.keywordSearch(keyword, (data2, status2) => {
            if (status2 === window.kakao.maps.services.Status.OK) {
                setPlaces(data2);
                if (data2.length > 0) {
                    map.setCenter(new window.kakao.maps.LatLng(data2[0].y, data2[0].x));
                    map.setLevel(3);
                }
            } else {
                alert("검색 결과가 없습니다.");
            }
        });
      } else {
        alert("검색 중 오류가 발생했습니다.");
      }
    };

    // Search nearby first
    ps.keywordSearch(keyword, callback, { 
      location: map.getCenter(),
      radius: 10000, // 10km radius
    });
  };

  return { map, setMap, keyword, setKeyword, places, setPlaces, searchPlaces };
}
