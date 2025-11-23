import prisma from '../prismaClient.js';
import { logAction, LogActions } from '../utils/logger.js';

export const getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { organisationId: req.user.orgId },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });
    
    res.json(employees);
  } catch (err) {
    console.error("Get employees error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    const employee = await prisma.employee.findFirst({
      where: { 
        id: employeeId,
        organisationId: req.user.orgId 
      },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error("Get employee error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    
    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        organisationId: req.user.orgId
      }
    });

    // Log employee creation
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.EMPLOYEE_CREATED,
      'Employee',
      employee.id,
      `Created employee: ${firstName} ${lastName}`,
      { firstName, lastName, email, phone }
    );
    
    res.status(201).json(employee);
  } catch (err) {
    console.error("Create employee error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    const { firstName, lastName, email, phone } = req.body;
    
    // Check if employee exists and belongs to organisation
    const existingEmployee = await prisma.employee.findFirst({
      where: { 
        id: employeeId,
        organisationId: req.user.orgId 
      }
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: {
        firstName,
        lastName,
        email,
        phone
      }
    });

    // Log employee update
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.EMPLOYEE_UPDATED,
      'Employee',
      employee.id,
      `Updated employee: ${firstName} ${lastName}`,
      { 
        employeeId: employee.id,
        previousData: {
          firstName: existingEmployee.firstName,
          lastName: existingEmployee.lastName,
          email: existingEmployee.email,
          phone: existingEmployee.phone
        },
        newData: { firstName, lastName, email, phone }
      }
    );

    res.json(employee);
  } catch (err) {
    console.error("Update employee error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    // Check if employee exists and belongs to organisation
    const existingEmployee = await prisma.employee.findFirst({
      where: { 
        id: employeeId,
        organisationId: req.user.orgId 
      }
    });

    if (!existingEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete related records first - EmployeeTeam associations
    await prisma.employeeTeam.deleteMany({
      where: { employeeId: employeeId }
    });

    // Now delete the employee
    await prisma.employee.delete({
      where: { id: employeeId }
    });

    // Log employee deletion
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.EMPLOYEE_DELETED,
      'Employee',
      employeeId,
      `Deleted employee: ${existingEmployee.firstName} ${existingEmployee.lastName}`,
      { 
        employeeId,
        employeeName: `${existingEmployee.firstName} ${existingEmployee.lastName}`,
        email: existingEmployee.email 
      }
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error("Delete employee error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const assignTeams = async (req, res) => {
  try {
    const { teamIds } = req.body;
    const employeeId = parseInt(req.params.id);

    // Verify employee belongs to user's organisation
    const employee = await prisma.employee.findFirst({
      where: { 
        id: employeeId,
        organisationId: req.user.orgId 
      }
    });

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Get current assignments to compare
    const currentAssignments = await prisma.employeeTeam.findMany({
      where: { employeeId },
      include: { team: true }
    });

    const currentTeamIds = currentAssignments.map(a => a.teamId);

    // Remove existing assignments
    await prisma.employeeTeam.deleteMany({
      where: { employeeId }
    });

    // Create new assignments
    if (teamIds && teamIds.length > 0) {
      // Verify all teams belong to organisation
      const validTeams = await prisma.team.findMany({
        where: {
          id: { in: teamIds },
          organisationId: req.user.orgId
        }
      });

      if (validTeams.length !== teamIds.length) {
        return res.status(400).json({ error: "Some teams not found or don't belong to your organisation" });
      }

      const assignments = teamIds.map(teamId => ({
        employeeId,
        teamId
      }));
      
      await prisma.employeeTeam.createMany({
        data: assignments
      });
    }

    // Log team assignments
    const addedTeams = teamIds.filter(id => !currentTeamIds.includes(id));
    const removedTeams = currentTeamIds.filter(id => !teamIds.includes(id));

    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.TEAM_ASSIGNMENTS_UPDATED,
      'Employee',
      employeeId,
      `Updated team assignments for ${employee.firstName} ${employee.lastName}`,
      { 
        employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        previousTeams: currentTeamIds,
        newTeams: teamIds,
        addedTeams,
        removedTeams,
        totalTeamsAssigned: teamIds.length
      }
    );

    res.json({ message: "Teams assigned successfully" });
  } catch (err) {
    console.error("Assign teams error:", err);
    res.status(500).json({ error: "Failed to assign teams" });
  }
};

export const getEmployeeTeams = async (req, res) => {
  try {
    const employeeId = parseInt(req.params.id);
    
    const employee = await prisma.employee.findFirst({
      where: { 
        id: employeeId,
        organisationId: req.user.orgId 
      },
      include: {
        teams: {
          include: {
            team: true
          }
        }
      }
    });
    
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    
    const teams = employee.teams.map(et => et.team);
    res.json(teams);
  } catch (err) {
    console.error("Get employee teams error:", err);
    res.status(500).json({ error: "Failed to fetch employee teams" });
  }
};