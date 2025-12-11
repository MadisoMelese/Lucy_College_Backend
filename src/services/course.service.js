import prisma from "../config/database.js";

export const findCoursesByDepartment = async (facultyCode, departmentCode, skip, limit) => {
    // 1. First, check that the department exists under the specified faculty.
    const department = await prisma.department.findUnique({
        where: {
            departmentCode: departmentCode.toUpperCase(),
            facultyCode: facultyCode.toUpperCase(),
        },
        select: { id: true, name: true }
    });

    if (!department) {
        throw new Error(`Department code ${departmentCode} not found in Faculty code ${facultyCode}.`);
    }

    // 2. Then, fetch the courses belonging to that department ID.
    const [items, total] = await Promise.all([
        prisma.course.findMany({ 
            skip, 
            take: limit, 
            where: { departmentId: department.id },
            include: { department: true },
            orderBy: { code: 'asc' }
        }),
        prisma.course.count({ where: { departmentId: department.id } })
    ]);
    
    // Returning department name for context in the response
    return { items, total, departmentName: department.name }; 
};
export const findCourses = async (skip, limit) => {
    const [items, total] = await Promise.all([
        prisma.course.findMany({ 
            skip, 
            take: limit, 
            include: { department: true },
            orderBy: { code: 'asc' }
        }),
        prisma.course.count()
    ]);
    return { items, total };
};

export const findCourseByCode = async (courseCode) => {
    const course = await prisma.course.findUnique({ 
        where: { code: courseCode.toUpperCase() },
        include: { department: true } 
    });
    return course;
};

export const createCourse = async (code, title, credits, description, tuitionFee, departmentCode) => {
    
    const departmentCheck = await prisma.department.findUnique({
        where: { departmentCode: departmentCode.toUpperCase() },
        select: { id: true }
    });
    
    if (!departmentCheck) {
        throw new Error(`Department with code ${departmentCode} not found.`);
    }

    const course = await prisma.course.create({
        data: { 
            code: code.toUpperCase(),
            title, 
            credits, 
            description, 
            tuitionFee, 
            departmentId: departmentCheck.id
        }
    });
    return course;
};

export const updateCourseByCode = async (existingCourseCode, updateData) => {
    if (Object.keys(updateData).length === 0) {
        throw new Error("No updatable fields provided.");
    }

    if (updateData.departmentCode) {
        const departmentCheck = await prisma.department.findUnique({
            where: { departmentCode: updateData.departmentCode.toUpperCase() },
            select: { id: true },
        });

        if (!departmentCheck) {
            throw new Error(`Department with code ${updateData.departmentCode} not found.`);
        }
        
        updateData.departmentId = departmentCheck.id;
        delete updateData.departmentCode;
    }
    
    if (updateData.code) {
         updateData.code = updateData.code.toUpperCase();
    }
    
    if (updateData.credits !== undefined) updateData.credits = Number(updateData.credits);
    if (updateData.tuitionFee !== undefined) updateData.tuitionFee = Number(updateData.tuitionFee);

    const course = await prisma.course.update({ 
        where: { code: existingCourseCode.toUpperCase() },
        data: updateData 
    });
    return course;
};

export const deleteCourseByCode = async (courseCode) => {
    await prisma.course.delete({ 
        where: { code: courseCode.toUpperCase() } 
    });
};