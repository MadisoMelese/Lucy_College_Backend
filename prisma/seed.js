// prisma/seed.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ----------------------
  // Faculties (ensure required relation exists)
  // ----------------------
  const techFaculty = await prisma.faculty.upsert({
    where: { name: "Technology" },
    update: {},
    create: { name: "Technology" },
  });

  const medFaculty = await prisma.faculty.upsert({
    where: { name: "Medical Sciences" },
    update: {},
    create: { name: "Medical Sciences" },
  });

  const busFaculty = await prisma.faculty.upsert({
    where: { name: "Business Administration" },
    update: {},
    create: { name: "Business Administration" },
  });

  // ----------------------
  // Departments
  // ----------------------
  const csDept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science", facultyId: techFaculty.id },
  });

  const eeDept = await prisma.department.upsert({
    where: { name: "Electrical Engineering" },
    update: {},
    create: { name: "Electrical Engineering", facultyId: techFaculty.id },
  });

  // ----------------------
  // Programs
  // ----------------------
   await prisma.program.upsert({
    where: { name: "BSc Computer Science" },
    update: {},
    create: {
      name: "BSc Computer Science",
      description: "Bachelor of Science in Computer Science",
      durationYears: 4,
      departmentId: csDept.id,
    },
  });

  await prisma.program.upsert({
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
      tuitionFee: "1500.00",
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
      tuitionFee: "1500.00",
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

  // ----------------------
  // About (single entry)
  // ----------------------
  const existingAbout = await prisma.about.findFirst();
  if (!existingAbout) {
    await prisma.about.create({
      data: {
        title: "About Lucy College",
        subtitle: "Excellence in education",
        content: "Lucy College is committed to providing high quality education and a supportive learning environment.",
        mission: "To educate and empower students",
        vision: "To be a leading institution in the region",
        values: "Integrity, Excellence, Service",
      },
    });
    console.log("Inserted default About entry");
  }

  // ----------------------
  // Hero slides (seed a couple if none exist)
  // ----------------------
  const heroCount = await prisma.heroSlide.count();
  if (heroCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        {
          title: "Welcome to Lucy College",
          subtitle: "Learn. Grow. Succeed.",
          imageUrl: "http://localhost:3000/uploads/hero/teamwork.jpg",
          ctaText: "Apply Now",
          ctaUrl: "/apply",
          order: 0,
          isActive: true,
        },
        {
          title: "Join Our Campus Community",
          subtitle: "Vibrant student life and strong academic programs",
          imageUrl: "http://localhost:3000/uploads/hero/hero2.jpg",
          ctaText: "Learn More",
          ctaUrl: "/programs",
          order: 1,
          isActive: true,
        },
      ],
    });
    console.log("Inserted default hero slides");
  }

  // ----------------------
  // Gallery images (seed a few)
  // ----------------------
  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: [
        { title: "Campus Life", caption: "Students on campus", imageUrl: "http://localhost:3000/uploads/gallery/gallery1.jpg", category: "campus" },
        { title: "Graduation", caption: "Commencement ceremony", imageUrl: "http://localhost:3000/uploads/gallery/gallery2.jpg", category: "events" },
      ],
    });
    console.log("Inserted default gallery images");
  }

  // ----------------------
  // Homepage (single entry)
  // ----------------------
  const existingHome = await prisma.homepage.findFirst();
  if (!existingHome) {
    await prisma.homepage.create({
      data: {
        heroTitle: "Welcome to Lucy College",
        heroSubtitle: "Transforming futures through education",
        heroCtaText: "Apply Today",
        heroCtaUrl: "/apply",
        introText: "Lucy College offers a wide range of programs designed to prepare students for success.",
      },
    });
    console.log("Inserted default homepage entry");
  }

  // ----------------------
  // Team members
  // ----------------------
  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.createMany({
      data: [
        { fullName: "Dr. Jane Smith", role: "Principal", bio: "Experienced academic leader.", imageUrl: "http://localhost:3000/uploads/management/jane.jpg", email: "jane.smith@lucy.edu" },
        { fullName: "Mr. John Doe", role: "Registrar", bio: "Oversees student services.", imageUrl: "http://localhost:3000/uploads/management/john.jpg", email: "john.doe@lucy.edu" },
      ],
    });
    console.log("Inserted default team members");
  }

  // ----------------------
  // Inquiries (seed a sample inquiry)
  // ----------------------
  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount === 0) {
    await prisma.inquiry.create({
      data: {
        name: "Sample Student",
        email: "student@example.com",
        message: "I would like more information about the Computer Science program.",
      },
    });
    console.log("Inserted sample inquiry");
  }


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
