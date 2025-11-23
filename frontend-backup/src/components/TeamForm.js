import { useState } from 'react';
import api from '../services/api';
import "./TeamForm.css";

const TeamForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
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
    
    if (!formData.name) {
      alert('Team name is required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/teams', formData);
      onCreated(res.data);
      setFormData({
        name: '',
        description: ''
      });
      alert('Team created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create team: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-form">
      <h3>Create New Team</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="team-name">Team Name *</label>
          <input
            id="team-name"
            name="name"
            placeholder="Enter team name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="team-description">Description</label>
          <textarea
            id="team-description"
            name="description"
            placeholder="Enter team description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        
        <button type="submit" disabled={loading} className="create-btn">
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </div>
  );
};

export default TeamForm;