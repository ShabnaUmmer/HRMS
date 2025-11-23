import { useState, useEffect } from 'react';
import api from '../services/api';
import "./EmployeeEditModal.css";

const EmployeeEditModal = ({ employee, onClose, onUpdated }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [teams, setTeams] = useState([]);
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load employee data and teams
  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || ''
      });

      // Fetch available teams
      const fetchTeams = async () => {
        try {
          const teamsRes = await api.get("/teams");
          setTeams(teamsRes.data);
        } catch (err) {
          console.error("Failed to fetch teams:", err);
        }
      };

      // Fetch currently assigned teams
      const fetchAssignedTeams = async () => {
        try {
          const assignedRes = await api.get(`/employees/${employee.id}/teams`);
          setAssignedTeams(assignedRes.data.map(team => team.id));
        } catch (err) {
          console.error("Failed to fetch assigned teams:", err);
        }
      };

      fetchTeams();
      fetchAssignedTeams();
    }
  }, [employee]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTeamToggle = (teamId) => {
    setAssignedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)  // Unassign
        : [...prev, teamId]                 // Assign
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      // Update employee details
      await api.put(`/employees/${employee.id}`, formData);
      
      // Update team assignments
      await api.put(`/employees/${employee.id}/teams`, { 
        teamIds: assignedTeams 
      });
      
      onUpdated();
      onClose();
      alert('Employee updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update employee: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal employee-detail-modal">
        <div className="modal-header">
          <h3>Edit Employee: {employee.firstName} {employee.lastName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Personal Information</h4>
            <div className="form-group">
              <label htmlFor="edit-firstname">First Name *</label>
              <input
                id="edit-firstname"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="given-name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-lastname">Last Name *</label>
              <input
                id="edit-lastname"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                autoComplete="family-name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-email">Email *</label>
              <input
                id="edit-email"
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
              <label htmlFor="edit-phone">Phone</label>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="form-section">
            <h4>Team Assignments</h4>
            <div className="teams-checkbox-list">
              {teams.map(team => (
                <label key={team.id} className="team-checkbox-item">
                  <input
                    type="checkbox"
                    checked={assignedTeams.includes(team.id)}
                    onChange={() => handleTeamToggle(team.id)}
                  />
                  <span className="team-info">
                    <strong>{team.name}</strong>
                    <span className="team-meta">
                      {team.employees?.length || 0} members
                      {team.description && ` • ${team.description}`}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {teams.length === 0 && (
              <p className="no-teams-message">No teams available. Create teams first.</p>
            )}
          </div>
          
          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Employee'}
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeEditModal;