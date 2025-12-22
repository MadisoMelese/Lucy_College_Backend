import prisma from "../config/database.js";

// Add a course to a program's curriculum
export const addCourseToProgram = async (
  programId,
  courseId,
  yearLevel,
  semester
) => {
  return await prisma.programCourse.create({
    data: {
      programId: parseInt(programId),
      courseId: parseInt(courseId),
      yearLevel: parseInt(yearLevel),
      semester: parseInt(semester),
    },
    include: {
      course: true,
      program: true,
    },
  });
};

// Get full curriculum for a program
export const getCurriculumByProgram = async (programId) => {
  return await prisma.programCourse.findMany({
    where: { programId: parseInt(programId) },
    include: {
      course: true,
    },
    orderBy: [{ yearLevel: "asc" }, { semester: "asc" }],
  });
};

// Update course placement in curriculum
export const updateCourseInCurriculum = async (
  programId,
  courseId,
  updateData
) => {
  return await prisma.programCourse.update({
    where: {
      programId_courseId: {
        programId: parseInt(programId),
        courseId: parseInt(courseId),
      },
    },
    data: updateData,
  });
};

// Remove a course from a program
export const removeCourseFromProgram = async (programId, courseId) => {
  return await prisma.programCourse.delete({
    where: {
      programId_courseId: {
        programId: parseInt(programId),
        courseId: parseInt(courseId),
      },
    },
  });
};
