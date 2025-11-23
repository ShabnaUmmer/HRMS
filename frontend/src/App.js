import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Logs from "./pages/Logs";
import RegisterOrg from "./pages/RegisterOrg";
import Employees from "./pages/Employees";
import Teams from "./pages/Teams";
import Navbar from "./components/Navbar";
import './App.css';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  // Update login status when token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {isLoggedIn && <Navbar />}
        
        <main className={`app-main ${isLoggedIn ? 'with-navbar' : ''}`}>
          <Routes>
            <Route path="/" element={<Navigate to={isLoggedIn ? "/employees" : "/login"} replace />} />
            <Route path="/login" element={!isLoggedIn ? <Login onLogin={() => setIsLoggedIn(true)} /> : <Navigate to="/employees" replace />} />
            <Route path="/register" element={!isLoggedIn ? <RegisterOrg /> : <Navigate to="/employees" replace />} />
            <Route path="/employees" element={isLoggedIn ? <Employees /> : <Navigate to="/login" replace />} />
            <Route path="/teams" element={isLoggedIn ? <Teams /> : <Navigate to="/login" replace />} />
            <Route path="/logs" element={isLoggedIn ? <Logs /> : <Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;