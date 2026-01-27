// frontend/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import axios from "axios"; 

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 백엔드로 로그인 요청
      const res = await axios.post("http://${import.meta.env.VITE_BACK_URL}/api/auth/login", {
        username,
        password,
      });

      // 응답 데이터에서 토큰과 사용자 정보 추출
      const { token, user, message } = res.data;

      alert(message);
      console.log("로그인 성공, 유저 정보:", user);
      
      // 토큰과 사용자 정보를 sessionStorage에 저장
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      // 성공하면 홈으로 이동
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "로그인 중 에러가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">MyFoodMap</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 아이디 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디</label>
            <input 
              type="text" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="아이디"
            />
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input 
              type="password" 
              required 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 outline-none" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호"
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 font-bold text-lg transition duration-200"
          >
            로그인
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline font-semibold">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}