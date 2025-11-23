import { useState } from 'react';
import api from '../services/api';
import "./EmployeeForm.css";

const EmployeeForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/employees', formData);
      onCreated(res.data);
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      });
      
      alert('Employee created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create employee: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-form">
      <h3>Add New Employee</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employee-firstname">First Name *</label>
            <input
              id="employee-firstname"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-lastname">Last Name *</label>
            <input
              id="employee-lastname"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employee-email">Email *</label>
            <input
              id="employee-email"
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-phone">Phone</label>
            <input
              id="employee-phone"
              name="phone"
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading} className="create-btn">
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;