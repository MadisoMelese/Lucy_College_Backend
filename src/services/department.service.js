import prisma from "../config/database.js";

export const findDepartments = async (skip, limit) => {
  const items = await prisma.department.findMany({
    skip,
    take: limit,
    include: {
      faculty: true,
      programs: true,
      lecturers: true,
      courses: {
        select: { id: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const total = await prisma.department.count();

  const departmentsWithCounts = await Promise.all(
    items.map(async (dep) => {
      const courseIds = dep.courses.map((c) => c.id);

      const uniqueStudents = await prisma.courseRegistration.findMany({
        where: {
          courseId: { in: courseIds },
        },
        distinct: ["studentId"],
        select: {
          studentId: true,
        },
      });
      const studentCount = uniqueStudents.length;

      const { courses, ...departmentData } = dep;

      return {
        ...departmentData,
        totalStudents: studentCount,
      };
    })
  );

  return { items: departmentsWithCounts, total };
};

export const findDepartmentById = async (id) => {
  const department = await prisma.department.findUnique({
    where: { id },
    include: {
      faculty: true,
      programs: true,
      lecturers: true,
      courses: { select: { id: true } },
    },
  });

  if (!department) return null;

  const courseIds = department.courses.map((c) => c.id);

  const uniqueStudents = await prisma.courseRegistration.findMany({
    where: {
      courseId: { in: courseIds },
    },
    distinct: ["studentId"],
    select: {
      studentId: true,
    },
  });
  const studentCount = uniqueStudents.length;

  const { courses, ...departmentData } = department;

  return {
    ...departmentData,
    totalStudents: studentCount,
  };
};

export const createDepartment = async (name, facultyId) => {
  const faculty = await prisma.faculty.findUnique({
    where: { id: facultyId },
  });
  if (!faculty) {
    throw new Error(`Faculty with ID ${facultyId} not found.`);
  }

  const dep = await prisma.department.create({
    data: { name, facultyId },
    include: { faculty: true },
  });
  return dep;
};

export const updateDepartment = async (id, updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error("No updatable fields provided.");
  }

  const dep = await prisma.department.update({
    where: { id },
    data: updateData,
    include: { faculty: true },
  });
  return dep;
};

export const deleteDepartment = async (id) => {
  await prisma.department.delete({ where: { id } });
};
