import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const logout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      setUser(null);
      alert("로그아웃 되었습니다.");
      // The home page will handle hiding reviews, etc.
      // Or we could navigate away: navigate("/login");
    }
  };

  return { user, setUser, logout };
}
