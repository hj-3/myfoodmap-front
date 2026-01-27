// frontend/src/pages/Signup.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import apiClient from "../api/axios"; // apiClient 임포트

export default function Signup() {
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const [formData, setFormData] = useState({
    username: "",
    nickname: "",
    password: "",
    confirmPassword: "",
  });

  // 중복 확인 상태 (null: 확인 전, true: 사용 가능, false: 중복)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(null);

  // 1. 아이디 중복 확인 함수 (백엔드 연결)
  const handleCheckDuplicate = async () => {
    if (!formData.username.trim()) {
      alert("아이디를 입력해주세요!");
      return;
    }
    
    try {
      // 백엔드에 중복 체크 요청
      const res = await apiClient.get(`/auth/check-username/${formData.username}`);
      
      if (res.data.available) {
        setIsUsernameAvailable(true); 
        alert("사용 가능한 아이디입니다!");
      } else {
        setIsUsernameAvailable(false);
        alert("이미 사용 중인 아이디입니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    }
  };

  // 2. 회원가입 제출 함수 (백엔드 연결)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isUsernameAvailable !== true) {
      alert("아이디 중복 확인을 진행해주세요!");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다!");
      return;
    }
    
    try {
      // 백엔드 회원가입 API 호출
      const res = await apiClient.post('/auth/signup', {
        username: formData.username,
        nickname: formData.nickname,
        password: formData.password
      });

      alert(res.data.message); // "회원가입이 완료되었습니다!"
      navigate('/login'); // 가입 성공 시 로그인 페이지로 이동
    } catch (err) {
      // 서버에서 보낸 에러 메시지 출력
      alert(err.response?.data?.message || "회원가입 중 오류가 발생했습니다.");
    }
  };

  // 실시간 비밀번호 체크용 변수
  const isPasswordMatch = formData.password === formData.confirmPassword;
  const showMatchMessage = formData.confirmPassword.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8 font-sans">회원가입</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 영역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">아이디</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                required 
                className="flex-1 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-left" 
                value={formData.username}
                onChange={(e) => {
                  setFormData({ ...formData, username: e.target.value });
                  setIsUsernameAvailable(null); // 아이디 수정 시 중복 확인 초기화
                }} 
                placeholder="아이디" 
              />
              <button 
                type="button"
                onClick={handleCheckDuplicate}
                className="bg-gray-800 text-white px-4 rounded-md text-sm font-bold hover:bg-black transition shrink-0"
              >
                중복 확인
              </button>
            </div>
            {isUsernameAvailable === true && (
              <p className="text-xs text-green-600 mt-1 font-bold text-left">사용 가능한 아이디입니다.</p>
            )}
            {isUsernameAvailable === false && (
              <p className="text-xs text-red-600 mt-1 font-bold text-left">이미 사용 중인 아이디입니다.</p>
            )}
          </div>

          {/* 닉네임 영역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">닉네임</label>
            <input 
              type="text" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 outline-none text-left" 
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} 
              placeholder="닉네임"
            />
          </div>

          {/* 비밀번호 영역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">비밀번호</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 outline-none text-left" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              placeholder="비밀번호"
            />
          </div>

          {/* 비밀번호 확인 영역 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 text-left">비밀번호 확인</label>
            <input 
              type="password" 
              required 
              className={`mt-1 block w-full border rounded-md shadow-sm p-3 outline-none transition text-left ${
                showMatchMessage 
                  ? isPasswordMatch ? "border-green-500" : "border-red-500"
                  : "border-gray-300"
              }`}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} 
              placeholder="비밀번호 재입력"
            />
            {showMatchMessage && (
              <p className={`text-xs mt-1 font-bold text-left ${isPasswordMatch ? "text-green-600" : "text-red-600"}`}>
                {isPasswordMatch ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </div>

          {/* 가입하기 버튼 */}
          <button 
            type="submit" 
            disabled={isUsernameAvailable !== true}
            className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-bold text-lg mt-6 transition duration-200 ${
              isUsernameAvailable !== true ? "opacity-50 cursor-not-allowed" : "opacity-100"
            }`}
          >
            가입하기
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-blue-500 hover:underline font-semibold">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}