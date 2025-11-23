import { useEffect, useState } from 'react';
import api from '../services/api';
import './Logs.css';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: ''
  });
  const [showClearOptions, setShowClearOptions] = useState(false);
  const [daysToKeep, setDaysToKeep] = useState(30);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);
      
      const res = await api.get(`/logs?${params}`);
      setLogs(res.data.logs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const handleClearAllLogs = async () => {
    if (!window.confirm('Are you sure you want to clear ALL audit logs? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const res = await api.delete('/logs/clear');
      alert(res.data.message);
      fetchLogs(); // Refresh the logs list
      setShowClearOptions(false);
    } catch (err) {
      alert('Failed to clear logs: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setClearing(false);
    }
  };

  const handleClearOldLogs = async () => {
    if (!window.confirm(`Are you sure you want to clear logs older than ${daysToKeep} days?`)) {
      return;
    }

    setClearing(true);
    try {
      const res = await api.delete('/logs/clear-old', { data: { days: daysToKeep } });
      alert(res.data.message);
      fetchLogs(); // Refresh the logs list
      setShowClearOptions(false);
    } catch (err) {
      alert('Failed to clear logs: ' + (err.response?.data?.error || 'Server error'));
    } finally {
      setClearing(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action) => {
    const colors = {
      'user_registered': '#10b981',
      'user_logged_in': '#3b82f6',
      'user_logged_out': '#6b7280',
      'employee_created': '#22c55e',
      'employee_updated': '#eab308',
      'employee_deleted': '#ef4444',
      'team_created': '#8b5cf6',
      'team_updated': '#f59e0b',
      'team_deleted': '#dc2626',
      'team_assignments_updated': '#06b6d4',
      'logs_cleared': '#f97316',
      'logs_cleared_by_date': '#f97316'
    };
    return colors[action] || '#6b7280';
  };

  if (loading) return <div className="loading">Loading audit logs...</div>;

  return (
    <div className="logs-page">
      <div className="logs-header">
        <div className="header-content">
          <h2>Audit Logs</h2>
          <p>Track all system activities and changes</p>
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => setShowClearOptions(!showClearOptions)}
            className="clear-logs-btn"
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear Logs'}
          </button>
        </div>
      </div>

      {/* Clear Logs Options */}
      {showClearOptions && (
        <div className="clear-options">
          <h4>Clear Audit Logs</h4>
          <div className="clear-actions">
            <div className="clear-option">
              <h5>Clear All Logs</h5>
              <p>Permanently delete all audit logs for your organisation</p>
              <button 
                onClick={handleClearAllLogs}
                className="clear-all-btn"
                disabled={clearing}
              >
                {clearing ? 'Clearing...' : 'Clear All Logs'}
              </button>
            </div>

            <div className="clear-option">
              <h5>Clear Old Logs</h5>
              <p>Delete logs older than specified days</p>
              <div className="date-selector">
                <label>
                  Keep logs from last:
                  <select 
                    value={daysToKeep} 
                    onChange={(e) => setDaysToKeep(e.target.value)}
                    disabled={clearing}
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={180}>180 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </label>
                <button 
                  onClick={handleClearOldLogs}
                  className="clear-old-btn"
                  disabled={clearing}
                >
                  {clearing ? 'Clearing...' : 'Clear Old Logs'}
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setShowClearOptions(false)}
            className="cancel-clear-btn"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="logs-filters">
        <select 
          value={filters.action} 
          onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
        >
          <option value="">All Actions</option>
          <option value="user_registered">User Registered</option>
          <option value="user_logged_in">User Login</option>
          <option value="user_logged_out">User Logout</option>
          <option value="employee_created">Employee Created</option>
          <option value="employee_updated">Employee Updated</option>
          <option value="employee_deleted">Employee Deleted</option>
          <option value="team_created">Team Created</option>
          <option value="team_updated">Team Updated</option>
          <option value="team_deleted">Team Deleted</option>
          <option value="team_assignments_updated">Team Assignments</option>
          <option value="logs_cleared">Logs Cleared</option>
        </select>

        <select 
          value={filters.entityType} 
          onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
        >
          <option value="">All Entities</option>
          <option value="User">User</option>
          <option value="Employee">Employee</option>
          <option value="Team">Team</option>
          <option value="Organisation">Organisation</option>
          <option value="Log">Log</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="logs-list">
        {logs.length === 0 ? (
          <div className="no-logs">
            <h3>No logs found</h3>
            <p>There are no audit logs matching your criteria.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="log-item">
              <div className="log-header">
                <span 
                  className="log-action"
                  style={{ color: getActionColor(log.action) }}
                >
                  {log.action.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="log-timestamp">
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              
              <div className="log-content">
                <div className="log-user">
                  <strong>User:</strong> {log.user.name} ({log.user.email})
                </div>
                
                {log.description && (
                  <div className="log-description">
                    {log.description}
                  </div>
                )}

                {log.entityType && log.entityId && (
                  <div className="log-entity">
                    <strong>Entity:</strong> {log.entityType} #{log.entityId}
                  </div>
                )}

                {log.meta && (
                  <details className="log-meta">
                    <summary>Details</summary>
                    <pre>{JSON.stringify(JSON.parse(log.meta), null, 2)}</pre>
                  </details>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}