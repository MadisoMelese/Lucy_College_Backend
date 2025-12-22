import prisma from "../config/database.js";

export const findCoursesByDepartment = async (
  facultyCode,
  departmentCode,
  skip,
  limit
) => {
  const deptCode = departmentCode.toUpperCase();
  const facCode = facultyCode.toUpperCase();

  // 1. Validate that the department exists and belongs to that faculty
  const department = await prisma.department.findUnique({
    where: { departmentCode: deptCode },
    select: { name: true, facultyCode: true },
  });

  if (!department || department.facultyCode !== facCode) {
    throw new Error(`Department ${deptCode} not found in Faculty ${facCode}.`);
  }

  // 2. Fetch courses using the departmentCode (the actual foreign key in your schema)
  const [items, total] = await Promise.all([
    prisma.course.findMany({
      skip,
      take: limit,
      where: { departmentCode: deptCode },
      include: { department: true },
      orderBy: { code: "asc" },
    }),
    prisma.course.count({ where: { departmentCode: deptCode } }),
  ]);

  return { items, total, departmentName: department.name };
};

export const createCourse = async (payload) => {
  const { code, title, credits, description, tuitionFee, departmentCode } =
    payload;
  const deptCode = departmentCode.toUpperCase();

  // Verify Department exists
  const dept = await prisma.department.findUnique({
    where: { departmentCode: deptCode },
  });
  if (!dept) throw new Error(`Department ${deptCode} not found.`);

  return await prisma.course.create({
    data: {
      code: code.toUpperCase(),
      title,
      credits: parseInt(credits),
      description,
      tuitionFee: parseFloat(tuitionFee) || 0.0,
      departmentCode: deptCode, // Corrected field name
    },
  });
};

export const updateCourseByCode = async (existingCode, updateData) => {
  const data = { ...updateData };

  if (data.departmentCode) {
    data.departmentCode = data.departmentCode.toUpperCase();
    const dept = await prisma.department.findUnique({
      where: { departmentCode: data.departmentCode },
    });
    if (!dept) throw new Error("Target department does not exist.");
  }

  if (data.code) data.code = data.code.toUpperCase();
  if (data.credits) data.credits = parseInt(data.credits);
  if (data.tuitionFee) data.tuitionFee = parseFloat(data.tuitionFee);

  return await prisma.course.update({
    where: { code: existingCode.toUpperCase() },
    data,
  });
};

export const findCourseByCode = async (code) => {
  return await prisma.course.findUnique({
    where: { code: code.toUpperCase() },
    include: { department: true },
  });
};

export const deleteCourseByCode = async (code) => {
  return await prisma.course.delete({
    where: { code: code.toUpperCase() },
  });
};
