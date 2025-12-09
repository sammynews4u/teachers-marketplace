const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('⚠️  STARTING DATABASE RESET...');

  try {
    // 1. Delete Dependent Data (Children) first to avoid errors
    console.log('...Deleting Messages & Conversations');
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});

    console.log('...Deleting Reviews');
    await prisma.review.deleteMany({});

    console.log('...Deleting Bookings');
    await prisma.booking.deleteMany({});

    console.log('...Deleting Courses');
    await prisma.course.deleteMany({});

    // 2. Delete Main Data (Parents)
    console.log('...Deleting Teachers');
    const teachers = await prisma.teacher.deleteMany({});
    console.log(`✅ Deleted ${teachers.count} Teachers.`);

    console.log('...Deleting Students');
    const students = await prisma.student.deleteMany({});
    console.log(`✅ Deleted ${students.count} Students.`);

    console.log('...Deleting Ad Packages');
    const packages = await prisma.package.deleteMany({});
    console.log(`✅ Deleted ${packages.count} Packages.`);

    // Optional: Delete FAQs if you want a totally clean slate
    // await prisma.fAQ.deleteMany({});

    console.log('🎉 DATABASE CLEANED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();