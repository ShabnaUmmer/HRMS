import prisma from '../prismaClient.js';

/**
 * Log an action to the database
 */
export const logAction = async (
  organisationId, 
  userId, 
  action, 
  entityType = null, 
  entityId = null, 
  description = null, 
  meta = null,
  transactionClient = null  // Add transaction client parameter
) => {
  try {
    const client = transactionClient || prisma;
    
    await client.log.create({
      data: {
        organisationId,
        userId,
        action,
        entityType,
        entityId,
        description,
        meta: meta ? JSON.stringify(meta) : null,
        timestamp: new Date(),
      },
    });
    console.log(`Logged: ${action} by user ${userId} in org ${organisationId}`);
  } catch (error) {
    console.error('Failed to log action:', error);
    throw error; // Re-throw to handle in calling function
  }
};
export const LogActions = {
  // Auth actions
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  
  // Employee actions
  EMPLOYEE_CREATED: 'employee_created',
  EMPLOYEE_UPDATED: 'employee_updated',
  EMPLOYEE_DELETED: 'employee_deleted',
  
  // Team actions
  TEAM_CREATED: 'team_created',
  TEAM_UPDATED: 'team_updated',
  TEAM_DELETED: 'team_deleted',
  
  // Assignment actions
  EMPLOYEE_ASSIGNED_TO_TEAM: 'employee_assigned_to_team',
  EMPLOYEE_UNASSIGNED_FROM_TEAM: 'employee_unassigned_from_team',
  TEAM_ASSIGNMENTS_UPDATED: 'team_assignments_updated',
  
  // Log actions
  LOGS_CLEARED: 'logs_cleared',
  LOGS_CLEARED_BY_DATE: 'logs_cleared_by_date',
};