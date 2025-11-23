import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import './RegisterOrg.css';

const RegisterOrg = () => {
  const [formData, setFormData] = useState({
    orgName: "",
    adminName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      alert("Organisation registered successfully! Please login.");
      navigate("/login", { replace: true });
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || 'Server error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>Register Organisation</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="org-name">Organisation Name</label>
            <input
              id="org-name"
              name="orgName"
              placeholder="Enter organisation name"
              value={formData.orgName}
              onChange={handleChange}
              autoComplete="organization"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="admin-name">Admin Name</label>
            <input
              id="admin-name"
              name="adminName"
              placeholder="Enter admin name"
              value={formData.adminName}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register Organisation'}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterOrg;