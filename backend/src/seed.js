import prisma from './prismaClient.js';
import bcrypt from 'bcrypt';

async function seed() {
  try {
    // Clear existing data
    await prisma.log.deleteMany();
    await prisma.employeeTeam.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();

    // Create organisation with specific ID
    const org = await prisma.organisation.create({
      data: { 
        name: "Test Organisation" 
      },
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

    console.log("✅ Database seeded successfully!");
    console.log("=== LOGIN CREDENTIALS ===");
    console.log(`Organisation ID: ${org.id}`);
    console.log(`User ID: ${user.id}`);
    console.log(`Email: admin@test.com`);
    console.log(`Password: admin123`);
    console.log("=========================");
    
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();