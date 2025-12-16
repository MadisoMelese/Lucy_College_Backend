import prisma from "../config/database.js";

const generateDefaultCode = (name) => {
  const words = name.split(/\s+/).filter((w) => w.length > 0);
  let code = "";

  if (words.length >= 4) {
    // Use first letter of the first four words
    code = words[0][0] + words[1][0] + words[2][0] + words[3][0];
  } else if (words.length === 3) {
    // Use initial of first two words + first two letters of the third word
    code = words[0][0] + words[1][0] + words[2].substring(0, 2);
  } else if (words.length === 2) {
    // Use first two letters of first word + first two letters of second word
    code = words[0].substring(0, 2) + words[1].substring(0, 2);
  } else if (words.length === 1) {
    // Use first four letters of the single word
    code = words[0].substring(0, 4);
  }

  // Pad with 'X' if necessary to ensure a minimum length (optional)
  code = code.padEnd(4, "X").substring(0, 4);

  return code.toUpperCase();
};

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

export const findDepartmentByCode = async (departmentCode) => {
  const department = await prisma.department.findUnique({
    where: { departmentCode: departmentCode.toUpperCase() },
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

export const createDepartment = async (
  name,
  facultyCode,
  inputDepartmentCode,
  description, // <--- NEW
  headImagePath, // <--- NEW
  headFullname, // <--- NEW
  headEducationLevel, // <--- NEW
  headMessage // <--- NEW
) => {
  const facultyCheck = await prisma.faculty.findUnique({
    where: { facultyCode: facultyCode.toUpperCase() },
    select: { id: true },
  });

  if (!facultyCheck) {
    throw new Error(`Faculty with code ${facultyCode} not found.`);
  }

  let finalDepartmentCode;
  if (inputDepartmentCode) {
    finalDepartmentCode = inputDepartmentCode.toUpperCase();
  } else {
    finalDepartmentCode = generateDefaultCode(name);
  }

  const existingDepartment = await prisma.department.findUnique({
    where: { departmentCode: finalDepartmentCode },
    select: { id: true },
  });

  if (existingDepartment) {
    throw new Error(
      `Department Code ${finalDepartmentCode} already exists. Please provide a manual code.`
    );
  }

  const dep = await prisma.department.create({
    data: {
      name,
      departmentCode: finalDepartmentCode,
      description,
      headImage: headImagePath,
      headFullname,
      headEducationLevel,
      headMessage,
      facultyCode: facultyCode.toUpperCase(),
    },
    include: { faculty: true },
  });
  return dep;
};

export const updateDepartment = async (existingDepartmentCode, updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error("No updatable fields provided.");
  }

  if (updateData.facultyCode) {
    const facultyCheck = await prisma.faculty.findUnique({
      where: { facultyCode: updateData.facultyCode.toUpperCase() },
      select: { id: true },
    });

    if (!facultyCheck) {
      throw new Error(`Faculty with code ${updateData.facultyCode} not found.`);
    }

    updateData.facultyCode = updateData.facultyCode.toUpperCase();
  }

  if (updateData.departmentCode) {
    updateData.departmentCode = updateData.departmentCode.toUpperCase();
  }

  const dep = await prisma.department.update({
    where: { departmentCode: existingDepartmentCode.toUpperCase() },
    data: updateData,
    include: { faculty: true },
  });
  return dep;
};

export const deleteDepartment = async (departmentCode) => {
  await prisma.department.delete({
    where: { departmentCode: departmentCode.toUpperCase() },
  });
};
