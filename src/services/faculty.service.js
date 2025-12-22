import prisma from "../config/database.js";

const generateDefaultCode = (name) => {
  const words = name.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "";

  if (words.length > 1) {
    return (words[0][0] + words[1][0] + (words[2]?.[0] || "")).toUpperCase();
  }

  return words[0].substring(0, 4).toUpperCase();
};

export const findFaculties = async (skip, limit) => {
  const [items, total] = await Promise.all([
    prisma.faculty.findMany({
      skip,
      take: limit,
      include: { _count: { select: { departments: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.faculty.count(),
  ]);
  return { items, total };
};

export const findFacultyByCode = async (facultyCode) => {
  const faculty = await prisma.faculty.findUnique({
    where: { facultyCode: facultyCode.toUpperCase() },
    include: { departments: true },
  });
  return faculty;
};

export const createFaculty = async (
  name,
  inputFacultyCode,
  description,
  deanImagePath,
  deanFullname,
  deanEducationLevel,
  deanMessage
) => {
  const finalFacultyCode = (
    inputFacultyCode || generateDefaultCode(name)
  ).toUpperCase();

  const existingFaculty = await prisma.faculty.findUnique({
    where: { facultyCode: finalFacultyCode },
    select: { id: true },
  });

  if (existingFaculty) {
    throw new Error(
      `Faculty Code ${finalFacultyCode} already exists. Please provide a manual code.`
    );
  }

  const newFaculty = await prisma.faculty.create({
    data: {
      name,
      facultyCode: finalFacultyCode,
      description,
      deanImage: deanImagePath,
      deanFullname,
      deanEducationLevel,
      deanMessage,
    },
  });
  return newFaculty;
};

export const updateFacultyByCode = async (existingFacultyCode, updateData) => {
  if (Object.keys(updateData).length === 0) {
    throw new Error("No updatable fields provided.");
  }

  if (updateData.facultyCode) {
    updateData.facultyCode = updateData.facultyCode.toUpperCase();
  }

  const faculty = await prisma.faculty.update({
    where: { facultyCode: existingFacultyCode.toUpperCase() },
    data: updateData,
  });
  return faculty;
};

export const deleteFacultyByCode = async (facultyCode) => {
  await prisma.faculty.delete({
    where: { facultyCode: facultyCode.toUpperCase() },
  });
};
