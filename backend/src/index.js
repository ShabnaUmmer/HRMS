const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./prismaClient');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const teamRoutes = require('./routes/teams');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Debug route - ADD THIS BEFORE OTHER ROUTES
app.get('/api/debug/check-db', async (req, res) => {
  try {
    const organisations = await prisma.organisation.findMany();
    const users = await prisma.user.findMany();
    
    res.json({
      organisations,
      users,
      organisationCount: organisations.length,
      userCount: users.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/teams', teamRoutes);

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server after Prisma is ready
async function start() {
  try {
    // optional quick connection check
    await prisma.$connect();
    console.log('Prisma connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Debug endpoint available at: http://localhost:5000/api/debug/check-db');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();