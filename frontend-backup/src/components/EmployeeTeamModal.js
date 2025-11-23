import { useState, useEffect } from "react";
import api from "../services/api";
import "./EmployeeTeamModal.css";

const EmployeeTeamModal = ({ employee, teams, onClose, onAssigned }) => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentTeams = async () => {
      try {
        const res = await api.get(`/employees/${employee.id}/teams`);
        setSelectedTeams(res.data.map(team => team.id));
      } catch (err) {
        console.error("Failed to fetch assigned teams:", err);
      }
    };
    
    fetchCurrentTeams();
  }, [employee.id]);

  const toggleTeam = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put(`/employees/${employee.id}/teams`, { 
        teamIds: selectedTeams 
      });
      onAssigned();
      onClose();
      alert('Team assignments updated successfully!');
    } catch (err) {
      alert("Failed to update team assignments: " + (err.response?.data?.message || 'Server error'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal simple-team-modal">
        <div className="modal-header">
          <h3>Assign Teams to {employee.firstName} {employee.lastName}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <p>Click teams to assign/unassign:</p>
          
          <div className="team-buttons-grid">
            {teams.map(team => (
              <button
                key={team.id}
                type="button"
                className={`team-button ${selectedTeams.includes(team.id) ? 'selected' : ''}`}
                onClick={() => toggleTeam(team.id)}
              >
                <span className="team-name">{team.name}</span>
                <span className="team-members">{team.employees?.length || 0} members</span>
              </button>
            ))}
          </div>

          <div className="selected-teams-info">
            <strong>Selected: </strong>
            {selectedTeams.length > 0 
              ? teams.filter(t => selectedTeams.includes(t.id)).map(t => t.name).join(', ')
              : 'No teams selected'
            }
          </div>
        </div>

        <div className="modal-actions">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="save-btn"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTeamModal;