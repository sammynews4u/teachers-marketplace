const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanData() {
  console.log('🔥 Connecting to database...');

  try {
    // 1. Delete FAQs
    const deletedFAQs = await prisma.fAQ.deleteMany({});
    console.log(`✅ Deleted ${deletedFAQs.count} FAQs.`);

    // 2. Delete Packages
    const deletedPackages = await prisma.package.deleteMany({});
    console.log(`✅ Deleted ${deletedPackages.count} Packages.`);

    console.log('🎉 Database cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();