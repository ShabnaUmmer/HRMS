const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Resetting database...');
    
    // Delete in correct order to avoid foreign key constraints
    await prisma.employeeTeam.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.team.deleteMany();
    await prisma.log.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();

    console.log('✅ Database cleared');
    
    // Create new organisation
    const org = await prisma.organisation.create({
      data: { name: "Test Organisation" }
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const user = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@test.com",
        passwordHash: hashedPassword,
        organisationId: org.id
      }
    });

    console.log('✅ New organisation and user created');
    console.log('📝 CREDENTIALS:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   Organisation ID:', org.id);
    console.log('   User ID:', user.id);

  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();