import prisma from '../prismaClient.js';
import { logAction, LogActions } from '../utils/logger.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        organisationId: req.user.orgId,
      },
    });

    // Log team creation
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.TEAM_CREATED,
      'Team',
      team.id,
      `Created team: ${name}`,
      { name, description }
    );

    res.json(team);
  } catch (err) {
    console.error("Create team error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: { organisationId: req.user.orgId },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    res.json(teams);
  } catch (err) {
    console.error("Get teams error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        organisationId: req.user.orgId,
      },
      include: {
        employees: {
          include: {
            employee: true
          }
        }
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    res.json(team);
  } catch (err) {
    console.error("Get team error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    // Check if team exists and belongs to organisation
    const existingTeam = await prisma.team.findFirst({
      where: { 
        id: teamId,
        organisationId: req.user.orgId 
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: req.body,
    });

    // Log team update
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.TEAM_UPDATED,
      'Team',
      team.id,
      `Updated team: ${team.name}`,
      { 
        teamId: team.id,
        previousData: {
          name: existingTeam.name,
          description: existingTeam.description
        },
        newData: req.body
      }
    );

    res.json(team);
  } catch (err) {
    console.error("Update team error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const teamId = parseInt(req.params.id);
    
    // Check if team exists and belongs to organisation
    const existingTeam = await prisma.team.findFirst({
      where: { 
        id: teamId,
        organisationId: req.user.orgId 
      }
    });

    if (!existingTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    await prisma.team.delete({
      where: { id: teamId },
    });

    // Log team deletion
    await logAction(
      req.user.orgId,
      req.user.userId,
      LogActions.TEAM_DELETED,
      'Team',
      teamId,
      `Deleted team: ${existingTeam.name}`,
      { 
        teamId,
        teamName: existingTeam.name,
        description: existingTeam.description 
      }
    );

    res.json({ message: "Team deleted" });
  } catch (err) {
    console.error("Delete team error:", err);
    res.status(500).json({ error: err.message });
  }
};