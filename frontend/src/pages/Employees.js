import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeTeamModal from "../components/EmployeeTeamModal";
import EmployeeEditModal from "../components/EmployeeEditModal";
import "./Employees.css";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [error, setError] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
      setError('');
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      setError('Failed to load employees');
      setEmployees([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
      setTeams([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchEmployees(), fetchTeams()]);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleEmployeeCreated = (newEmp) => {
    setEmployees(prev => [...prev, newEmp]);
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees(); // Refresh the list
  };

  const handleAssignTeams = () => {
    fetchEmployees(); // Refresh after team assignment
    fetchTeams(); // Also refresh teams to update member counts
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      alert('Employee deleted successfully!');
    } catch (err) {
      alert('Failed to delete employee: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div className="employees-page">
      <h2>Employee Management</h2>

      {error && <div className="error-message">{error}</div>}

      <EmployeeForm onCreated={handleEmployeeCreated} />

      <div className="employees-list">
        <h3>Employee List ({employees.length})</h3>
        {employees.length === 0 ? (
          <p className="no-data">No employees found. Please add employees.</p>
        ) : (
          <div className="employee-grid">
            {employees.map(emp => (
              <div key={emp.id} className="employee-card">
                <div className="employee-info">
                  <h4>{emp.firstName} {emp.lastName}</h4>
                  <p><strong>Email:</strong> {emp.email}</p>
                  <p><strong>Phone:</strong> {emp.phone || 'N/A'}</p>
                  <p>
                    <strong>Teams:</strong> {emp.teams?.length > 0 
                      ? emp.teams.map(t => t.team.name).join(', ') 
                      : 'None assigned'}
                  </p>
                </div>
                <div className="employee-actions">
                  <button 
                    onClick={() => setEditingEmployee(emp)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setSelectedEmployee(emp)}
                    className="assign-btn"
                  >
                    Assign Teams
                  </button>
                  <button 
                    onClick={() => handleDeleteEmployee(emp.id)}
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

      {/* Team Assignment Modal */}
      {selectedEmployee && (
        <EmployeeTeamModal
          employee={selectedEmployee}
          teams={teams}
          onClose={() => setSelectedEmployee(null)}
          onAssigned={handleAssignTeams}
        />
      )}

      {/* Employee Edit Modal */}
      {editingEmployee && (
        <EmployeeEditModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onUpdated={handleEmployeeUpdated}
        />
      )}
    </div>
  );
};

export default Employees;