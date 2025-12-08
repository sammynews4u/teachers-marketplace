const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function wipeUsers() {
  console.log('⚠️  STARTING NUCLEAR WIPE...');

  try {
    // 1. Delete Bookings FIRST (Because they link Teachers & Students)
    const deletedBookings = await prisma.booking.deleteMany({});
    console.log(`✅ Deleted ${deletedBookings.count} Bookings.`);

    // 2. Delete Courses (Because they belong to Teachers)
    const deletedCourses = await prisma.course.deleteMany({});
    console.log(`✅ Deleted ${deletedCourses.count} Courses.`);

    // 3. Delete Teachers
    const deletedTeachers = await prisma.teacher.deleteMany({});
    console.log(`✅ Deleted ${deletedTeachers.count} Teachers.`);

    // 4. Delete Students
    const deletedStudents = await prisma.student.deleteMany({});
    console.log(`✅ Deleted ${deletedStudents.count} Students.`);

    console.log('🎉 WIPE COMPLETE! The platform is clean.');
  } catch (error) {
    console.error('❌ Error wiping data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

wipeUsers();