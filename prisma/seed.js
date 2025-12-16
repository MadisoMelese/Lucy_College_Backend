import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // ----------------------
    // 1. Faculties (using facultyCode and new Dean fields)
    // ----------------------
    const techFaculty = await prisma.faculty.upsert({
        where: { facultyCode: "TECH" },
        update: {},
        create: { 
            name: "Technology", 
            facultyCode: "TECH",
            description: "Dedicated to advancing technology and engineering sciences.",
            deanFullname: "Prof. Alan Turing",
            deanEducationLevel: "PhD",
            deanMessage: "Welcome to the future of innovation!",
            deanImage: "http://localhost:3000/uploads/dean/tech_dean.jpg"
        },
    });

    const medFaculty = await prisma.faculty.upsert({
        where: { facultyCode: "MEDI" },
        update: {},
        create: { 
            name: "Medical Sciences", 
            facultyCode: "MEDI",
            description: "Training the next generation of healthcare professionals.",
            deanFullname: "Dr. Marie Curie",
            deanEducationLevel: "MD, PhD",
            deanMessage: "Compassion and research are the heart of our work.",
            deanImage: "http://localhost:3000/uploads/dean/med_dean.jpg"
        },
    });

    const busFaculty = await prisma.faculty.upsert({
        where: { facultyCode: "BUSS" },
        update: {},
        create: { 
            name: "Business Administration", 
            facultyCode: "BUSS",
            description: "Developing leaders for the global economy.",
            deanFullname: "Ms. Sheryl Sandberg",
            deanEducationLevel: "MBA",
            deanMessage: "Leadership is about making others better.",
            deanImage: "http://localhost:3000/uploads/dean/bus_dean.jpg"
        },
    });

    // ----------------------
    // 2. Departments (using departmentCode, facultyCode, and new Head fields)
    // ----------------------
    const csDept = await prisma.department.upsert({
        where: { departmentCode: "COMP" },
        update: {},
        create: { 
            name: "Computer Science", 
            departmentCode: "COMP", 
            description: "Focusing on software, AI, and systems engineering.",
            facultyCode: techFaculty.facultyCode,
            headFullname: "Dr. Grace Hopper",
            headEducationLevel: "PhD",
            headMessage: "Code your future!",
            headImage: "http://localhost:3000/uploads/head/cs_head.jpg"
        },
    });

    const eeDept = await prisma.department.upsert({
        where: { departmentCode: "ELEC" },
        update: {},
        create: { 
            name: "Electrical Engineering", 
            departmentCode: "ELEC", 
            description: "Covering power, electronics, and control systems.",
            facultyCode: techFaculty.facultyCode,
            headFullname: "Prof. Nikola Tesla",
            headEducationLevel: "Prof.",
            headMessage: "Harnessing the power of tomorrow.",
            headImage: "http://localhost:3000/uploads/head/ee_head.jpg"
        },
    });

    // ----------------------
    // 3. Programs (LINKED VIA departmentCode STRING)
    // ----------------------
    await prisma.program.upsert({
        where: { name: "BSc Computer Science" },
        update: {},
        create: {
            name: "BSc Computer Science",
            description: "Bachelor of Science in Computer Science, 4 years.",
            durationYears: 4,
            departmentCode: csDept.departmentCode, // 🎯 CRITICAL CHANGE: Use departmentCode string
        },
    });

    await prisma.program.upsert({
        where: { name: "BSc Electrical Engineering" },
        update: {},
        create: {
            name: "BSc Electrical Engineering",
            description: "Bachelor of Science in Electrical Engineering, 4 years.",
            durationYears: 4,
            departmentCode: eeDept.departmentCode, // 🎯 CRITICAL CHANGE: Use departmentCode string
        },
    });
    
    // ----------------------
    // 4. Courses (Still linked via departmentId INT - based on current schema)
    // ----------------------
    await prisma.course.upsert({
        where: { code: "CS101" },
        update: {},
        create: {
            code: "CS101",
            title: "Introduction to Programming",
            credits: 3,
            description: "Learn the basics of programming using Python.",
            tuitionFee: 1500.00, // Pass as number to match Decimal
            departmentId: csDept.id, // Linked by ID
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
            tuitionFee: 1500.00, // Pass as number to match Decimal
            departmentId: eeDept.id, // Linked by ID
        },
    });

    // ----------------------
    // 5. Lecturers (Creating a sample lecturer linked to CS Dept ID)
    // NOTE: Requires User/Lecturer setup in production, but simplified here.
    // ----------------------
    const sampleUser = await prisma.user.upsert({
        where: { email: "lecturer@lucy.edu" },
        update: {},
        create: {
            email: "lecturer@lucy.edu",
            password: "hashed_password", // Placeholder
            role: "LECTURER",
        }
    });

    await prisma.lecturer.upsert({
        where: { userId: sampleUser.id },
        update: {},
        create: {
            userId: sampleUser.id,
            firstName: "Alice",
            lastName: "Smith",
            title: "Ms.",
            departmentId: csDept.id,
            bio: "Expert in algorithms and data structures.",
            imageUrl: "http://localhost:3000/uploads/lecturer/alice.jpg"
        }
    });

    // ----------------------
    // 6. Static Content
    // ----------------------
    
    await prisma.academicYear.upsert({
        where: { yearLabel: "2024/2025" },
        update: {},
        create: { yearLabel: "2024/2025" }
    });

    await prisma.newsEvent.createMany({
        data: [
            {
                title: "University Opens New Research Center",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                imageUrl: ["http://localhost:3000/uploads/news/img1.jpg"],
                category: "Announcement",
                isPublic: true,
            },
            {
                title: "Annual Tech Fest Announced",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
                imageUrl: ["http://localhost:3000/uploads/news/img2.jpg"],
                category: "Events",
                isPublic: true,
            },
        ],
        skipDuplicates: true,
    }); 

    // ... (rest of the static content remains the same)

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