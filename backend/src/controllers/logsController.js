import prisma from '../prismaClient.js';
import { logAction, LogActions } from '../utils/logger.js';

export const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, entityType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('Fetching logs for org:', req.user.orgId);
    console.log('Filters:', { action, entityType });

    // Build where clause
    const where = { organisationId: req.user.orgId };
    
    if (action) {
      where.action = action;
    }
    
    if (entityType) {
      where.entityType = entityType;
    }

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      skip,
      take: parseInt(limit),
    });

    console.log(`Found ${logs.length} logs`);

    const total = await prisma.log.count({ where });

    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getLogStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await prisma.log.groupBy({
      by: ['action'],
      where: {
        organisationId: req.user.orgId,
        timestamp: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    res.json(stats);
  } catch (err) {
    console.error("Get log stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const clearLogs = async (req, res) => {
  const session = await prisma.$transaction(async (tx) => {
    try {
      const { orgId, userId } = req.user;

      // Count logs before deletion for confirmation
      const logCount = await tx.log.count({
        where: { organisationId: orgId }
      });

      // Delete all logs for the organisation
      await tx.log.deleteMany({
        where: { organisationId: orgId }
      });

      // Log the clearing action - using transaction client
      await tx.log.create({
        data: {
          organisationId: orgId,
          userId,
          action: LogActions.LOGS_CLEARED,
          entityType: 'Log',
          entityId: null,
          description: `Cleared ${logCount} audit logs`,
          meta: JSON.stringify({ logsCleared: logCount }),
          timestamp: new Date(),
        },
      });

      return { logCount };
    } catch (err) {
      console.error("Clear logs error:", err);
      throw err;
    }
  });

  res.json({ 
    message: `Successfully cleared ${session.logCount} logs`,
    logsCleared: session.logCount 
  });
};

export const clearLogsByDate = async (req, res) => {
  const session = await prisma.$transaction(async (tx) => {
    try {
      const { orgId, userId } = req.user;
      const { days = 30 } = req.body;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      // Count logs before deletion
      const logCount = await tx.log.count({
        where: { 
          organisationId: orgId,
          timestamp: { lt: cutoffDate }
        }
      });

      // Delete logs older than the specified days
      await tx.log.deleteMany({
        where: { 
          organisationId: orgId,
          timestamp: { lt: cutoffDate }
        }
      });

      // Log the clearing action - using transaction client
      await tx.log.create({
        data: {
          organisationId: orgId,
          userId,
          action: LogActions.LOGS_CLEARED_BY_DATE,
          entityType: 'Log',
          entityId: null,
          description: `Cleared ${logCount} logs older than ${days} days`,
          meta: JSON.stringify({ 
            logsCleared: logCount, 
            days, 
            cutoffDate: cutoffDate.toISOString() 
          }),
          timestamp: new Date(),
        },
      });

      return { logCount, days };
    } catch (err) {
      console.error("Clear logs by date error:", err);
      throw err;
    }
  });

  res.json({ 
    message: `Successfully cleared ${session.logCount} logs older than ${session.days} days`,
    logsCleared: session.logCount,
    days: session.days
  });
};