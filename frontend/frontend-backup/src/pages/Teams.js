import { useEffect, useState } from 'react';
import api from '../services/api';
import TeamForm from '../components/TeamForm';
import "./Teams.css";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setTeams([]);
    }
  };

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      await fetchTeams();
      setLoading(false);
    };
    loadTeams();
  }, []);

  const handleTeamCreated = () => {
    fetchTeams(); // Refresh the list
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) {
      return;
    }

    try {
      await api.delete(`/teams/${teamId}`);
      setTeams(prev => prev.filter(team => team.id !== teamId));
      alert('Team deleted successfully!');
    } catch (err) {
      alert('Failed to delete team: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  if (loading) return <div className="loading">Loading teams...</div>;

  return (
    <div className="teams-page">
      <h2>Team Management</h2>

      <TeamForm onCreated={handleTeamCreated} />

      <div className="teams-list">
        <h3>Team List ({teams.length})</h3>
        {teams.length === 0 ? (
          <p className="no-data">No teams found. Please create teams.</p>
        ) : (
          <div className="team-grid">
            {teams.map(team => (
              <div key={team.id} className="team-card">
                <div className="team-info">
                  <h4>{team.name}</h4>
                  <p className="team-description">{team.description || 'No description'}</p>
                  <p className="team-members">
                    <strong>{team.employees?.length || 0}</strong> members
                  </p>
                  <p className="team-created">
                    Created: {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="team-actions">
                  <button 
                    onClick={() => handleDeleteTeam(team.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Teams;