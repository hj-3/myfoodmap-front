// frontend/src/api/axios.js
import axios from 'axios';

// 새로운 axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`, // 환경 변수에서 API 기본 URL 가져오기
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    // sessionStorage에서 토큰 가져오기
    const token = sessionStorage.getItem('token');
    
    // 토큰이 있으면 헤더에 추가
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // 요청 에러 처리
    return Promise.reject(error);
  }
);

// 응답 인터셉터 추가 - 토큰 만료 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // 토큰 만료 시
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
