// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ----------------------
  // Departments
  // ----------------------
  const csDept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });

  const eeDept = await prisma.department.upsert({
    where: { name: "Electrical Engineering" },
    update: {},
    create: { name: "Electrical Engineering" },
  });

  // ----------------------
  // Programs
  // ----------------------
  const csProgram = await prisma.program.upsert({
    where: { name: "BSc Computer Science" },
    update: {},
    create: {
      name: "BSc Computer Science",
      description: "Bachelor of Science in Computer Science",
      durationYears: 4,
      departmentId: csDept.id,
    },
  });

  const eeProgram = await prisma.program.upsert({
    where: { name: "BSc Electrical Engineering" },
    update: {},
    create: {
      name: "BSc Electrical Engineering",
      description: "Bachelor of Science in Electrical Engineering",
      durationYears: 4,
      departmentId: eeDept.id,
    },
  });

  // ----------------------
  // Courses
  // ----------------------
  await prisma.course.upsert({
    where: { code: "CS101" },
    update: {},
    create: {
      code: "CS101",
      title: "Introduction to Programming",
      credits: 3,
      description: "Learn the basics of programming using Python.",
      tuitionFee: 1500.0,
      departmentId: csDept.id,
    },
  });

  await prisma.course.upsert({
    where: { code: "EE101" },
    update: {},
    create: {
      code: "EE101",
      title: "Circuit Analysis",
      credits: 3,
      description: "Fundamentals of electrical circuits and analysis.",
      tuitionFee: 1500.0,
      departmentId: eeDept.id,
    },
  });

  // ----------------------
  // NewsEvents
  // ----------------------
await prisma.newsEvent.createMany({
  data: [
    {
      title: "University Opens New Research Center",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      category: "Announcement",
      isPublic: true,
    },
    {
      title: "Annual Tech Fest Announced",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      category: "Events",
      isPublic: true,
    },
  ],
  skipDuplicates: true, // skip if already exists
});


  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
